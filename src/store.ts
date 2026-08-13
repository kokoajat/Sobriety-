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
import { findCustomByLabel, newCustomTag } from './core/functions';
import {
  DEFAULT_SETTINGS,
  type Alternative,
  type CustomFunction,
  type Day,
  type Forecast,
  type FunctionTag,
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
  functions: CustomFunction[];
  settings: Settings;
  saveForecast: (forecast: Forecast) => Promise<void>;
  logFork: (fork: ObservedFork) => Promise<void>;
  resolveDay: (observation: Observation) => Promise<void>;
  upsertAlternative: (alternative: Alternative) => Promise<void>;
  rateAlternative: (id: string, worked: boolean) => Promise<void>;
  upsertMessage: (message: SelfMessage) => Promise<void>;
  removeMessage: (id: string) => Promise<void>;
  addFunction: (label: string, hint?: string) => Promise<FunctionTag | undefined>;
  archiveFunction: (id: FunctionTag, archived: boolean) => Promise<void>;
  saveSettings: (settings: Settings) => Promise<void>;
  reload: () => Promise<void>;
}

export function useStore(): Store {
  const [ready, setReady] = useState(false);
  const [days, setDays] = useState<Day[]>([]);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [messages, setMessages] = useState<SelfMessage[]>([]);
  const [functions, setFunctions] = useState<CustomFunction[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [today, setToday] = useState(dateKey());

  const reload = useCallback(async () => {
    const [d, a, m, f, s] = await Promise.all([
      db.days.all(),
      db.alternatives.all(),
      db.messages.all(),
      db.functions.all(),
      db.settings.get(),
    ]);
    setDays(d.sort((x, y) => (x.date < y.date ? -1 : 1)));
    setAlternatives(a);
    setMessages(m);
    setFunctions(f);
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

  /**
   * Define a function of the user's own, or hand back the existing one.
   *
   * Reuses a match by label rather than minting a second tag for the same
   * thing: two ids meaning "riita kotona" would split that function's history
   * down the middle and quietly weaken every count computed over it. A match
   * that was archived is revived, for the same reason.
   */
  const addFunction = useCallback(
    async (label: string, hint?: string) => {
      const trimmed = label.trim();
      if (trimmed === '') return undefined;

      const existing = findCustomByLabel(trimmed, functions);
      const next: CustomFunction = existing
        ? { ...existing, archived: false, hint: hint?.trim() || existing.hint }
        : {
            id: newCustomTag(),
            label: trimmed,
            hint: hint?.trim() || undefined,
            createdAt: Date.now(),
          };

      await db.functions.put(next);
      setFunctions((prev) => [...prev.filter((f) => f.id !== next.id), next]);
      return next.id;
    },
    [functions],
  );

  const archiveFunction = useCallback(
    async (id: FunctionTag, archived: boolean) => {
      const match = functions.find((f) => f.id === id);
      if (!match) return;
      const next = { ...match, archived };
      await db.functions.put(next);
      setFunctions((prev) => prev.map((f) => (f.id === id ? next : f)));
    },
    [functions],
  );

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
    functions,
    settings,
    saveForecast,
    logFork,
    resolveDay,
    upsertAlternative,
    rateAlternative,
    upsertMessage,
    removeMessage,
    addFunction,
    archiveFunction,
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
