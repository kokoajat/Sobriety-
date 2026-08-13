/**
 * Application state: one hook over the whole local database.
 *
 * The dataset is a few hundred small records even after years of use, so it is
 * loaded whole and kept in memory. No pagination, no query layer, no cache
 * invalidation — the volume never justifies any of it.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import * as db from './storage/db';
import { dateKey, engagedDates, scoreableRows, withinWindow } from './core/day';
import { decompose, engagementStreak, calibrationBias, forecastSpread } from './core/forecast';
import { blindSpots, functionLoad, noticingRate, windowStats } from './core/windows';
import { recordAttempt } from './core/substitution';
import {
  DEFAULT_SETTINGS,
  type Alternative,
  type Day,
  type Forecast,
  type ObservedFork,
  type Observation,
  type SelfMessage,
  type Settings,
} from './core/types';

/** Days included in the rolling scores. Long enough to be stable, short enough to move. */
export const SCORING_WINDOW_DAYS = 60;

export interface Store {
  ready: boolean;
  today: string;
  days: Day[];
  alternatives: Alternative[];
  messages: SelfMessage[];
  settings: Settings;
  saveForecast: (forecast: Forecast) => Promise<void>;
  logFork: (fork: ObservedFork) => Promise<void>;
  resolveDay: (observation: Observation) => Promise<void>;
  upsertAlternative: (alternative: Alternative) => Promise<void>;
  rateAlternative: (id: string, worked: boolean) => Promise<void>;
  upsertMessage: (message: SelfMessage) => Promise<void>;
  removeMessage: (id: string) => Promise<void>;
  saveSettings: (settings: Settings) => Promise<void>;
  reload: () => Promise<void>;
}

export function useStore(): Store {
  const [ready, setReady] = useState(false);
  const [days, setDays] = useState<Day[]>([]);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [messages, setMessages] = useState<SelfMessage[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [today, setToday] = useState(dateKey());

  const reload = useCallback(async () => {
    const [d, a, m, s] = await Promise.all([
      db.days.all(),
      db.alternatives.all(),
      db.messages.all(),
      db.settings.get(),
    ]);
    setDays(d.sort((x, y) => (x.date < y.date ? -1 : 1)));
    setAlternatives(a);
    setMessages(m);
    setSettings(s);
    setReady(true);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  // A session left open overnight must not keep writing into yesterday.
  useEffect(() => {
    const id = setInterval(() => setToday(dateKey()), 60_000);
    return () => clearInterval(id);
  }, []);

  const writeDay = useCallback(
    async (date: string, patch: (day: Day) => Day) => {
      const existing = (await db.days.get(date)) ?? { date };
      const next = patch(existing);
      await db.days.put(next);
      setDays((prev) => {
        const others = prev.filter((d) => d.date !== date);
        return [...others, next].sort((x, y) => (x.date < y.date ? -1 : 1));
      });
    },
    [],
  );

  const saveForecast = useCallback(
    (forecast: Forecast) => writeDay(forecast.date, (day) => ({ ...day, forecast })),
    [writeDay],
  );

  const logFork = useCallback(
    (fork: ObservedFork) =>
      writeDay(today, (day) => {
        // A fork logged live lands in the observation before the day is
        // resolved; the evening step then edits the list rather than creating it.
        const observation: Observation = day.observation ?? {
          date: today,
          drank: false,
          forks: [],
          resolvedAt: 0,
        };
        return {
          ...day,
          observation: {
            ...observation,
            drank: observation.drank || fork.choice === 'drank',
            forks: [...observation.forks, fork],
          },
        };
      }),
    [today, writeDay],
  );

  const resolveDay = useCallback(
    (observation: Observation) =>
      writeDay(observation.date, (day) => ({ ...day, observation })),
    [writeDay],
  );

  const upsertAlternative = useCallback(async (alternative: Alternative) => {
    await db.alternatives.put(alternative);
    setAlternatives((prev) => {
      const others = prev.filter((a) => a.id !== alternative.id);
      return [...others, alternative];
    });
  }, []);

  const rateAlternative = useCallback(
    async (id: string, worked: boolean) => {
      const next = recordAttempt(alternatives, id, worked);
      const updated = next.find((a) => a.id === id);
      if (updated) {
        await db.alternatives.put(updated);
        setAlternatives(next);
      }
    },
    [alternatives],
  );

  const upsertMessage = useCallback(async (message: SelfMessage) => {
    await db.messages.put(message);
    setMessages((prev) => [...prev.filter((m) => m.id !== message.id), message]);
  }, []);

  const removeMessage = useCallback(async (id: string) => {
    await db.messages.remove(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const saveSettings = useCallback(async (next: Settings) => {
    await db.settings.put(next);
    setSettings(next);
  }, []);

  return {
    ready,
    today,
    days,
    alternatives,
    messages,
    settings,
    saveForecast,
    logFork,
    resolveDay,
    upsertAlternative,
    rateAlternative,
    upsertMessage,
    removeMessage,
    saveSettings,
    reload,
  };
}

/** Everything the insight view shows, derived in one place. */
export function useInsight(days: Day[], today: string) {
  return useMemo(() => {
    const window = withinWindow(days, today, SCORING_WINDOW_DAYS);
    const rows = scoreableRows(window);
    return {
      scores: decompose(rows),
      bias: calibrationBias(rows),
      spread: forecastSpread(rows),
      streak: engagementStreak(engagedDates(days), today),
      blindSpots: blindSpots(windowStats(window)),
      load: functionLoad(window),
      noticing: noticingRate(window),
      rows,
    };
  }, [days, today]);
}
