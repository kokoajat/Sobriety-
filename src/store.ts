/**
 * Application state: one hook over the whole local database.
 *
 * A few hundred small records even after years of use, so it is loaded whole and
 * kept in memory. No pagination, no query layer, no cache invalidation — the
 * volume never justifies any of it.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import * as db from './storage/db';
import { close, isOpen } from './core/waiting';
import { findDemandByLabel, newCustomDemand } from './core/demands';
import { recordAttempt } from './core/stats';
import {
  DEFAULT_SETTINGS,
  type CustomDemand,
  type Demand,
  type Episode,
  type Outcome,
  type Settings,
  type Supply,
} from './core/types';

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export interface Store {
  ready: boolean;
  episodes: Episode[];
  supplies: Supply[];
  demands: CustomDemand[];
  settings: Settings;
  /** The episode currently running, if any. */
  current?: Episode;
  begin: (demand: Demand, supplyId?: string) => Promise<Episode>;
  extendCurrent: () => Promise<void>;
  closeCurrent: (outcome: Outcome) => Promise<void>;
  rateSupply: (supplyId: string, demand: Demand, helped: boolean) => Promise<void>;
  addSupply: (label: string, demand: Demand) => Promise<void>;
  archiveSupply: (id: string) => Promise<void>;
  addDemand: (label: string) => Promise<Demand | undefined>;
  archiveDemand: (id: Demand) => Promise<void>;
  saveSettings: (settings: Settings) => Promise<void>;
  reload: () => Promise<void>;
}

export function useStore(): Store {
  const [ready, setReady] = useState(false);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [demands, setDemands] = useState<CustomDemand[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const reload = useCallback(async () => {
    const [e, v, d, s] = await Promise.all([
      db.episodes.all(),
      db.supplies.all(),
      db.demands.all(),
      db.settings.get(),
    ]);
    setEpisodes(e.sort((a, b) => a.startedAt - b.startedAt));
    setSupplies(v);
    setDemands(d);
    setSettings(s);
    setReady(true);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  /**
   * The open episode, recovered from storage rather than held in component state.
   *
   * A wait has to survive the screen locking, the tab being evicted and the app
   * being reopened — those are the normal conditions for a ten-minute countdown
   * on a phone, not edge cases.
   */
  const current = useMemo(() => episodes.filter(isOpen).sort((a, b) => b.startedAt - a.startedAt)[0], [
    episodes,
  ]);

  const writeEpisode = useCallback(async (episode: Episode) => {
    await db.episodes.put(episode);
    setEpisodes((prev) =>
      [...prev.filter((e) => e.id !== episode.id), episode].sort(
        (a, b) => a.startedAt - b.startedAt,
      ),
    );
  }, []);

  const begin = useCallback(
    async (demand: Demand, supplyId?: string) => {
      // Any earlier wait left hanging is closed as unknown, never guessed at: the
      // user pressing the button again is a new urge, not a verdict on the old one.
      for (const stale of episodes.filter(isOpen)) {
        await writeEpisode({ ...stale, outcome: 'unknown', endedAt: Date.now() });
      }
      const episode: Episode = {
        id: newId(),
        startedAt: Date.now(),
        demand,
        supplyId,
        waitedMs: 0,
        extensions: 0,
        outcome: 'unknown',
      };
      await writeEpisode(episode);
      return episode;
    },
    [episodes, writeEpisode],
  );

  const extendCurrent = useCallback(async () => {
    if (!current) return;
    await writeEpisode({ ...current, extensions: current.extensions + 1 });
  }, [current, writeEpisode]);

  const closeCurrent = useCallback(
    async (outcome: Outcome) => {
      if (!current) return;
      await writeEpisode(close(current, outcome, Date.now(), settings));
    },
    [current, settings, writeEpisode],
  );

  const rateSupply = useCallback(
    async (supplyId: string, demand: Demand, helped: boolean) => {
      const next = recordAttempt(supplies, supplyId, demand, helped);
      const updated = next.find((s) => s.id === supplyId);
      if (!updated) return;
      await db.supplies.put(updated);
      setSupplies(next);
    },
    [supplies],
  );

  const addSupply = useCallback(
    async (label: string, demand: Demand) => {
      const trimmed = label.trim();
      if (trimmed === '') return;
      // One supply can serve several needs; reuse it instead of creating a twin,
      // so its track record stays in one place.
      const existing = supplies.find(
        (s) => s.label.toLocaleLowerCase('fi') === trimmed.toLocaleLowerCase('fi'),
      );
      const next: Supply = existing
        ? { ...existing, demands: [...new Set([...existing.demands, demand])], archived: false }
        : { id: newId(), label: trimmed, demands: [demand], attempts: [], createdAt: Date.now() };
      await db.supplies.put(next);
      setSupplies((prev) => [...prev.filter((s) => s.id !== next.id), next]);
    },
    [supplies],
  );

  const archiveSupply = useCallback(
    async (id: string) => {
      const match = supplies.find((s) => s.id === id);
      if (!match) return;
      const next = { ...match, archived: true };
      await db.supplies.put(next);
      setSupplies((prev) => prev.map((s) => (s.id === id ? next : s)));
    },
    [supplies],
  );

  const addDemand = useCallback(
    async (label: string) => {
      const trimmed = label.trim();
      if (trimmed === '') return undefined;

      const existing = findDemandByLabel(trimmed, demands);
      if (existing && !existing.archived) return existing.demand;

      if (existing?.archived) {
        const revived = demands
          .filter((d) => d.id === existing.demand)
          .map((d) => ({ ...d, archived: false }))[0];
        if (revived) {
          await db.demands.put(revived);
          setDemands((prev) => prev.map((d) => (d.id === revived.id ? revived : d)));
          return revived.id;
        }
      }

      const next: CustomDemand = {
        id: newCustomDemand(),
        label: trimmed,
        createdAt: Date.now(),
      };
      await db.demands.put(next);
      setDemands((prev) => [...prev, next]);
      return next.id;
    },
    [demands],
  );

  const archiveDemand = useCallback(
    async (id: Demand) => {
      const match = demands.find((d) => d.id === id);
      if (!match) return;
      const next = { ...match, archived: true };
      await db.demands.put(next);
      setDemands((prev) => prev.map((d) => (d.id === id ? next : d)));
    },
    [demands],
  );

  const saveSettings = useCallback(async (next: Settings) => {
    await db.settings.put(next);
    setSettings(next);
  }, []);

  return {
    ready,
    episodes,
    supplies,
    demands,
    settings,
    current,
    begin,
    extendCurrent,
    closeCurrent,
    rateSupply,
    addSupply,
    archiveSupply,
    addDemand,
    archiveDemand,
    saveSettings,
    reload,
  };
}

/** A clock that ticks only while something is actually counting down. */
export function useNow(active: boolean, intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
  return now;
}
