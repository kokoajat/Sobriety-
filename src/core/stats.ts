/**
 * What the history is allowed to say.
 *
 * Two rules, both load-bearing:
 *
 * 1. Nothing here rates the user. Every figure is a property of a *supply* ("a
 *    walk helped 4 of 5 times") or of the urge itself ("it has passed in about
 *    six minutes"). None of it is a score the user can be behind on.
 *
 * 2. A rate computed from three data points is a rumour. Every function returns
 *    NaN below its minimum sample rather than a confident-looking number, and the
 *    surface renders that as "liian vähän vielä" instead of a figure. In this
 *    domain a wrong-but-certain statement about your own behaviour is worse than
 *    no statement.
 */

import type { SituationKey } from './situations';
import { targetMs } from './waiting';
import type { Demand, Episode, Settings, Supply } from './types';

/** Below this, rates are withheld rather than shown. */
export const MIN_SAMPLE = 5;

export interface OutcomeCounts {
  passed: number;
  took: number;
  unknown: number;
  closed: number;
  /** passed / (passed + took), or NaN below MIN_SAMPLE of decided episodes. */
  passRate: number;
}

const rate = (part: number, whole: number): number =>
  whole < MIN_SAMPLE ? NaN : part / whole;

export function outcomeCounts(episodes: Episode[]): OutcomeCounts {
  let passed = 0;
  let took = 0;
  let unknown = 0;
  for (const e of episodes) {
    if (e.endedAt === undefined) continue;
    if (e.outcome === 'passed') passed += 1;
    else if (e.outcome === 'took') took += 1;
    else unknown += 1;
  }
  // Undecided episodes stay out of the denominator: an urge the user never came
  // back to report is not evidence in either direction.
  const decided = passed + took;
  return { passed, took, unknown, closed: passed + took + unknown, passRate: rate(passed, decided) };
}

/** Lower median — always a value that actually occurred. */
function median(values: number[]): number {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) / 2)];
}

/**
 * How long the urge has typically taken to pass, from the user's own episodes.
 *
 * The single most useful thing this app can tell someone, and the reason the wait
 * is the core mechanism: it turns "hold on indefinitely" into a number they have
 * already beaten before.
 *
 * Only episodes closed *before the timer ran out* count, and that restriction is
 * the whole correctness of the figure.
 *
 * `close` caps `waitedMs` at the target so a phone left in a pocket cannot record
 * hours of willpower. The side effect is that every episode answered after the
 * bell — which is the normal flow, and was every case in a four-scenario browser
 * check — stores exactly the target. Averaging those in produced "himo on mennyt
 * ohi 10 minuutissa" for anyone who simply answered when the clock ran out: the
 * app reporting its own setting back as a discovery about the user. Circular, and
 * confident, which is the combination this module exists to prevent.
 *
 * An episode that ran to zero says the urge lasted *at least* the target. That is
 * a lower bound, not a duration, so it is excluded rather than blended in.
 */
export function medianTimeToPassMs(episodes: Episode[], settings: Settings): number {
  const waits = episodes
    .filter((e) => e.outcome === 'passed' && e.endedAt !== undefined)
    // Strict: a capped episode stores exactly the target, so `<` separates the
    // two cases cleanly without needing a tolerance.
    .filter((e) => e.waitedMs < targetMs(e, settings))
    .map((e) => e.waitedMs);
  return waits.length < MIN_SAMPLE ? NaN : median(waits);
}

export interface DemandRow {
  demand: Demand;
  episodes: number;
  passed: number;
  took: number;
  passRate: number;
}

/** Which needs show up most, and where waiting has been hardest. */
export function byDemand(episodes: Episode[]): DemandRow[] {
  const table = new Map<Demand, { episodes: number; passed: number; took: number }>();
  for (const e of episodes) {
    if (e.endedAt === undefined) continue;
    const row = table.get(e.demand) ?? { episodes: 0, passed: 0, took: 0 };
    row.episodes += 1;
    if (e.outcome === 'passed') row.passed += 1;
    if (e.outcome === 'took') row.took += 1;
    table.set(e.demand, row);
  }
  return [...table.entries()]
    .map(([demand, row]) => ({
      demand,
      ...row,
      passRate: rate(row.passed, row.passed + row.took),
    }))
    .sort((a, b) => b.episodes - a.episodes);
}

export interface SituationRow {
  situation: SituationKey;
  episodes: number;
}

/**
 * Which places these moments have happened in, most frequent first.
 *
 * The most actionable thing the app can produce in the calm hours, and the only
 * statistic here that points at something the user can physically change: if
 * four of five urges happened in one room, that room is the finding.
 *
 * Deliberately counts only, no pass rates. A pass rate per situation would need
 * MIN_SAMPLE inside every cell before it meant anything, which almost nobody
 * will reach, and a rate the app cannot honestly compute is a rate it should not
 * imply exists. Counts of places are also not a score: a room cannot be a
 * personal failure.
 */
export function bySituation(episodes: Episode[]): SituationRow[] {
  const located = episodes.filter((e) => e.situation !== undefined);
  // Below the sample floor this is anecdote, not pattern — same rule as
  // everywhere else in this module, applied to the whole table rather than a
  // single figure, because "your one urge was in the kitchen" says nothing.
  if (located.length < MIN_SAMPLE) return [];

  const table = new Map<SituationKey, number>();
  for (const e of located) {
    table.set(e.situation!, (table.get(e.situation!) ?? 0) + 1);
  }
  return [...table.entries()]
    .map(([situation, episodes]) => ({ situation, episodes }))
    .sort((a, b) => b.episodes - a.episodes || a.situation.localeCompare(b.situation));
}

export interface RankedSupply {
  supply: Supply;
  attempts: number;
  helped: number;
  /** Laplace-smoothed, so an untested option enters at 0.5 instead of 0. */
  score: number;
  untested: boolean;
}

/**
 * The user's prepared responses for one need, best first.
 *
 * Smoothed rather than raw: a pure exploit ranking freezes after the first
 * success and the user never discovers the thing that would have worked better.
 */
export function rankSupplies(supplies: Supply[], demand: Demand): RankedSupply[] {
  return supplies
    .filter((s) => !s.archived && s.demands.includes(demand))
    .map((s) => {
      const relevant = s.attempts.filter((a) => a.demand === demand);
      const helped = relevant.filter((a) => a.helped).length;
      return {
        supply: s,
        attempts: relevant.length,
        helped,
        score: (helped + 1) / (relevant.length + 2),
        untested: relevant.length === 0,
      };
    })
    .sort((a, b) => b.score - a.score || b.attempts - a.attempts);
}

/**
 * The one supply to offer.
 *
 * Occasionally an untested one, because early ratings are noisy and a list that
 * never explores converges on whatever happened to work first. `random` is
 * injected so the choice stays testable.
 */
export function pickSupply(
  supplies: Supply[],
  demand: Demand,
  random: () => number = Math.random,
  exploreRate = 0.2,
): RankedSupply | undefined {
  const ranked = rankSupplies(supplies, demand);
  if (ranked.length === 0) return undefined;
  const untested = ranked.filter((r) => r.untested);
  if (untested.length > 0 && random() < exploreRate) return untested[0];
  return ranked[0];
}

/** Record how an offer went. Returns a new array; the store owns persistence. */
export function recordAttempt(
  supplies: Supply[],
  id: string,
  demand: Demand,
  helped: boolean,
  at: number = Date.now(),
): Supply[] {
  return supplies.map((s) =>
    s.id === id ? { ...s, attempts: [...s.attempts, { at, demand, helped }] } : s,
  );
}
