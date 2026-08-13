/**
 * Substitution ranking.
 *
 * Behavioural-economic premise: consumption of a reinforcer falls when a
 * substitutable reinforcer is cheaper and closer to hand. Alcohol is extremely
 * cheap at the fork — it is fast, reliable and requires no decision. Anything
 * competing with it has to be offered in the same three seconds, already chosen,
 * matched to the job at hand.
 *
 * So the app never asks "what could you do instead?" at the fork. It asks that
 * in the calm hours, and at the fork it hands back a single named option with
 * the user's own track record attached.
 */

import type { Alternative, FunctionTag } from './types';

export interface RankedAlternative {
  alternative: Alternative;
  /** Laplace-smoothed success rate; the ranking key. */
  score: number;
  /** Wilson lower bound at ~95 %, shown so a lucky single success reads as thin. */
  confidenceFloor: number;
  attempts: number;
  successes: number;
  untested: boolean;
}

function wilsonLowerBound(successes: number, attempts: number, z = 1.96): number {
  if (attempts === 0) return 0;
  const p = successes / attempts;
  const denom = 1 + (z * z) / attempts;
  const centre = p + (z * z) / (2 * attempts);
  const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * attempts)) / attempts);
  return Math.max(0, (centre - margin) / denom);
}

/**
 * Rank the user's own options for a given function.
 *
 * Scoring is the Laplace-smoothed rate rather than the raw one, so an untested
 * option enters at 0.5 instead of 0 and stays visible long enough to be tried.
 * A pure exploit ranking would freeze the list after the first success and the
 * user would never discover a better fit.
 */
export function rankAlternatives(
  alternatives: Alternative[],
  tag: FunctionTag,
): RankedAlternative[] {
  return alternatives
    .filter((a) => !a.archived && a.tags.includes(tag))
    .map((a) => {
      const attempts = a.attempts.length;
      const successes = a.attempts.filter((x) => x.worked).length;
      return {
        alternative: a,
        score: (successes + 1) / (attempts + 2),
        confidenceFloor: wilsonLowerBound(successes, attempts),
        attempts,
        successes,
        untested: attempts === 0,
      };
    })
    .sort((a, b) => b.score - a.score || b.attempts - a.attempts);
}

/**
 * The one option to show at the fork.
 *
 * Occasionally returns the best untested option instead of the best-known one:
 * with a handful of alternatives the user's early ratings are noisy, and a list
 * that never explores converges on whatever happened to work first. `random` is
 * injectable so this stays testable.
 */
export function pickForFork(
  alternatives: Alternative[],
  tag: FunctionTag,
  random: () => number = Math.random,
  exploreRate = 0.2,
): RankedAlternative | undefined {
  const ranked = rankAlternatives(alternatives, tag);
  if (ranked.length === 0) return undefined;

  const untested = ranked.filter((r) => r.untested);
  if (untested.length > 0 && random() < exploreRate) return untested[0];
  return ranked[0];
}

/**
 * Record how a substitution went.
 *
 * Returns a new array; the store owns persistence. `worked` is the user's own
 * judgement of whether the job got done, not whether they stayed dry — an
 * alternative that failed and was followed by a drink is useful data about the
 * alternative, not a failure of the day.
 */
export function recordAttempt(
  alternatives: Alternative[],
  id: string,
  worked: boolean,
  at: number = Date.now(),
): Alternative[] {
  return alternatives.map((a) =>
    a.id === id ? { ...a, attempts: [...a.attempts, { at, worked }] } : a,
  );
}
