/**
 * Which line to show next.
 *
 * "Kertaus on opintojen äiti" is the design brief, but naive repetition fails in
 * both directions: a fixed order becomes wallpaper the eye skips, and pure
 * randomness shows the same line twice in one wait while others are never seen.
 *
 * So the corpus is treated as a deck. Everything unseen is dealt before anything
 * repeats, the least recently seen goes first among equals, and the final choice
 * is random within a small window of the front — enough that the order is never
 * predictable, not so much that coverage suffers.
 */

import type { Fact } from './facts';

export interface Exposure {
  id: string;
  lastShownAt: number;
  shows: number;
}

/** Smallest pool the random pick is ever made from. */
const WINDOW = 8;

/**
 * Next line to show, or undefined for an empty corpus.
 *
 * `excludeIds` are the lines already shown during this wait; they are skipped
 * while anything else remains, and ignored once the corpus runs out — a long
 * wait should keep reading rather than stop.
 */
export function pickNextFact(
  facts: Fact[],
  exposures: Exposure[],
  excludeIds: string[] = [],
  random: () => number = Math.random,
): Fact | undefined {
  if (facts.length === 0) return undefined;

  const seen = new Map(exposures.map((e) => [e.id, e]));
  const excluded = new Set(excludeIds);

  const fresh = facts.filter((f) => !excluded.has(f.id));
  const pool = fresh.length > 0 ? fresh : facts;

  const showsOf = (f: Fact) => seen.get(f.id)?.shows ?? 0;
  const lastOf = (f: Fact) => seen.get(f.id)?.lastShownAt ?? 0;

  // Everything unseen comes before anything seen once, and so on.
  const minShows = Math.min(...pool.map(showsOf));
  const tier = pool.filter((f) => showsOf(f) === minShows).sort((a, b) => lastOf(a) - lastOf(b));

  /*
   * Everything equally stale is equally eligible.
   *
   * Taking a fixed-size window off the front looks random but is not: in a fresh
   * corpus every line shares the same timestamp, so the order collapses to
   * whatever the array order happens to be and the draw is forever made from the
   * same handful. Widening the window to cover every line tied at the oldest
   * timestamp fixes it — on a new device that is the whole corpus, and later it
   * is however many are genuinely equal-oldest.
   */
  const oldest = lastOf(tier[0]);
  const equallyStale = tier.filter((f) => lastOf(f) === oldest);
  const window = equallyStale.length >= WINDOW ? equallyStale : tier.slice(0, WINDOW);

  return window[Math.floor(random() * window.length)] ?? window[0];
}

/** Record that a line was shown. Returns a new array; the store owns persistence. */
export function recordExposure(
  exposures: Exposure[],
  id: string,
  at: number = Date.now(),
): Exposure[] {
  const existing = exposures.find((e) => e.id === id);
  const next: Exposure = existing
    ? { ...existing, lastShownAt: at, shows: existing.shows + 1 }
    : { id, lastShownAt: at, shows: 1 };
  return [...exposures.filter((e) => e.id !== id), next];
}

/** How much of the corpus has been seen at least once, 0..1. */
export function coverage(facts: Fact[], exposures: Exposure[]): number {
  if (facts.length === 0) return NaN;
  const ids = new Set(exposures.filter((e) => e.shows > 0).map((e) => e.id));
  return facts.filter((f) => ids.has(f.id)).length / facts.length;
}
