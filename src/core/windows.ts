/**
 * Where the self-model is wrong.
 *
 * Aggregate calibration says how good the model is; this module says *where* it
 * breaks. The output is not "you drink on Thursdays" — the user knows that. It
 * is "on Thursday evenings a fork arrives that you did not see coming", which is
 * information they demonstrably do not have, because they failed to predict it.
 */

import { BLOCK_RANGES, BLOCKS, type Block, type Day, type FunctionTag } from './types';

export interface WindowStat {
  /** 0 = Sunday, matching `Date.prototype.getDay`. */
  weekday: number;
  block: Block;
  /** Days with an observation covering this window. */
  days: number;
  /** Forks that actually happened here. */
  forksObserved: number;
  /** Forks predicted here in the morning. */
  forksPredicted: number;
  /** Forks that happened here without having been predicted. */
  forksUnpredicted: number;
  /** Forks here that ended in a drink. */
  forksDrunk: number;
  /** Most frequent function tag observed here, if any. */
  dominantTag?: FunctionTag;
}

export interface BlindSpot extends WindowStat {
  /** Share of this window's forks that arrived unannounced, 0..1. */
  surpriseRate: number;
}

export function blockOf(minuteOfDay: number): Block {
  for (const block of BLOCKS) {
    const { startMin, endMin } = BLOCK_RANGES[block];
    if (minuteOfDay >= startMin && minuteOfDay < endMin) return block;
  }
  // Anything before the morning boundary belongs to the previous night, which
  // wraps past midnight in BLOCK_RANGES.
  return 'night';
}

const keyOf = (weekday: number, block: Block) => `${weekday}|${block}`;

export function windowStats(days: Day[]): WindowStat[] {
  const table = new Map<string, WindowStat & { tagCounts: Map<FunctionTag, number> }>();

  const ensure = (weekday: number, block: Block) => {
    const key = keyOf(weekday, block);
    let row = table.get(key);
    if (!row) {
      row = {
        weekday,
        block,
        days: 0,
        forksObserved: 0,
        forksPredicted: 0,
        forksUnpredicted: 0,
        forksDrunk: 0,
        tagCounts: new Map(),
      };
      table.set(key, row);
    }
    return row;
  };

  for (const day of days) {
    if (!day.observation) continue;
    const weekday = new Date(`${day.date}T12:00:00`).getDay();

    // Every block of a resolved day is an opportunity, whether or not a fork
    // showed up in it. Without this the denominator would only ever contain
    // windows that already went wrong.
    for (const block of BLOCKS) ensure(weekday, block).days += 1;

    const predicted = new Set<Block>(day.forecast?.forks.map((f) => f.block) ?? []);
    for (const block of predicted) ensure(weekday, block).forksPredicted += 1;

    for (const fork of day.observation.forks) {
      const block = blockOf(fork.atMin);
      const row = ensure(weekday, block);
      row.forksObserved += 1;
      if (!predicted.has(block)) row.forksUnpredicted += 1;
      if (fork.choice === 'drank') row.forksDrunk += 1;
      row.tagCounts.set(fork.tag, (row.tagCounts.get(fork.tag) ?? 0) + 1);
    }
  }

  return [...table.values()].map(({ tagCounts, ...row }) => {
    let dominantTag: FunctionTag | undefined;
    let best = 0;
    for (const [tag, count] of tagCounts) {
      if (count > best) {
        best = count;
        dominantTag = tag;
      }
    }
    return { ...row, dominantTag };
  });
}

/**
 * Windows ranked by how often their forks arrive unannounced.
 *
 * `minForks` guards against a single surprising evening being promoted to a
 * personal truth — the app tells the user about a pattern only once it has seen
 * one.
 */
export function blindSpots(stats: WindowStat[], minForks = 3): BlindSpot[] {
  return stats
    .filter((s) => s.forksObserved >= minForks && s.forksUnpredicted > 0)
    .map((s) => ({ ...s, surpriseRate: s.forksUnpredicted / s.forksObserved }))
    .sort((a, b) =>
      b.surpriseRate - a.surpriseRate || b.forksUnpredicted - a.forksUnpredicted,
    );
}

/**
 * Which functions the drink is most often hired for. Ranked by how often the
 * fork ended in a drink, since that is where a substitute would earn the most —
 * a tag the user already handles well needs no help.
 */
export function functionLoad(days: Day[]): { tag: FunctionTag; forks: number; drank: number }[] {
  const counts = new Map<FunctionTag, { forks: number; drank: number }>();
  for (const day of days) {
    for (const fork of day.observation?.forks ?? []) {
      const row = counts.get(fork.tag) ?? { forks: 0, drank: 0 };
      row.forks += 1;
      if (fork.choice === 'drank') row.drank += 1;
      counts.set(fork.tag, row);
    }
  }
  return [...counts.entries()]
    .map(([tag, row]) => ({ tag, ...row }))
    .sort((a, b) => b.drank - a.drank || b.forks - a.forks);
}

/**
 * Share of forks caught in the moment rather than reconstructed at night.
 *
 * This is the app's second real metric. Noticing is trainable in a way that
 * abstaining is not: you cannot decide to stop wanting a drink, but you can get
 * better at spotting the ten seconds in which the day forks.
 */
export function noticingRate(days: Day[]): { rate: number; inMoment: number; total: number } {
  let inMoment = 0;
  let total = 0;
  for (const day of days) {
    for (const fork of day.observation?.forks ?? []) {
      total += 1;
      if (fork.loggedInMoment) inMoment += 1;
    }
  }
  return { rate: total === 0 ? NaN : inMoment / total, inMoment, total };
}
