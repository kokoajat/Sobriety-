/**
 * The evening as a unit: how many, and — the part that actually matters — how
 * the spacing between them changes as it goes.
 *
 * ## Why there is no promille figure here
 *
 * The obvious version of this feature is a blood-alcohol curve. It cannot be
 * built honestly without body weight and sex, and the error is not small.
 * Widmark: BAC(g/L) = grams / (r × kg), where r ≈ 0.55 for women and ≈ 0.68 for
 * men. Six standard drinks is 72 g:
 *
 *   - 55 kg, r = 0.55 → 72 / 30.3 = 2.4 ‰
 *   - 100 kg, r = 0.68 → 72 / 68.0 = 1.1 ‰
 *
 * Same six drinks, a factor of 2.2 apart before elimination is even subtracted.
 * A single number in that range is not an estimate, it is a guess wearing a
 * decimal point — and this is the one statistic in the app somebody might use to
 * decide whether to drive. `stats.ts` already refuses to print a rate from three
 * observations; printing a promille from no observations at all would be worse.
 *
 * ## What is here instead, and why it is better for the stated purpose
 *
 * The question asked was "milloin tahti kiihtyy" — where does it get away from
 * me. That is a property of the *timestamps*, not of the body, so it needs no
 * biometrics and is measured rather than modelled:
 *
 *   - the gaps between drinks within one evening, which collapse when the pace
 *     runs away, and
 *   - across evenings, the ordinal at which they typically collapse.
 *
 * That is a better answer to the actual question than a BAC curve would be. A
 * promille number describes a population average wearing your name; "the gaps
 * halve after the third" is your own behaviour, and it names something you can
 * act on while it is happening.
 *
 * Counts and grams are exact given the stated assumption and are shown as such.
 * Nothing here is modelled, predicted or extrapolated.
 */

import type { Episode } from './types';

/**
 * One "otin sen" is counted as one Finnish standard drink.
 *
 * 4 cl of 38 % spirit = 15.2 ml ethanol × 0.789 g/ml = 12.0 g. The assumption is
 * the user's own and is stated in the view rather than buried here: a tap means
 * "I had one", and what was in the glass is not asked. An evening of long drinks
 * and an evening of doubles will read the same, which is a real limit of the
 * figure and the reason grams are shown as a consequence of the count rather
 * than as a measurement.
 */
export const GRAMS_PER_DRINK = 12;

/**
 * Sessions run 05:00 to 05:00.
 *
 * A calendar day would split the exact evening this feature is about. The 05:00
 * boundary keeps "started at 21:00, still going at 02:00" as one thing, and
 * starts a new one for a genuinely new evening — the boundary the user asked for
 * when this app's predecessor got it wrong.
 */
export const SESSION_BOUNDARY_HOUR = 5;

/** Local timestamp of the 05:00 that opens the session containing `at`. */
export function sessionStart(at: number): number {
  const d = new Date(at);
  const start = new Date(d);
  start.setHours(SESSION_BOUNDARY_HOUR, 0, 0, 0);
  if (start.getTime() > at) start.setDate(start.getDate() - 1);
  return start.getTime();
}

export const sameSession = (a: number, b: number): boolean => sessionStart(a) === sessionStart(b);

/** Every "otin sen" in the session containing `at`, oldest first. */
export function takesInSession(episodes: Episode[], at: number): Episode[] {
  const start = sessionStart(at);
  return episodes
    .filter((e) => e.outcome === 'took' && sessionStart(e.startedAt) === start)
    .sort((a, b) => a.startedAt - b.startedAt);
}

/** Milliseconds between consecutive takes. `gaps[i]` precedes take `i + 2`. */
export function gaps(takes: Episode[]): number[] {
  return takes.slice(1).map((e, i) => e.startedAt - takes[i].startedAt);
}

function median(values: number[]): number {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) / 2)];
}

/**
 * Below this fraction of the baseline gap, the pace counts as having run away.
 *
 * Half is a judgement call, not a finding, and it is set here as a named
 * constant so it reads as one. Anything gentler fires on ordinary variation;
 * anything stricter only notices once the evening is long over.
 */
export const ACCELERATION_RATIO = 0.5;

/** Takes needed before a within-evening claim is made at all. */
export const MIN_TAKES_FOR_PACE = 3;

export interface Acceleration {
  /** Which drink the pace collapsed before — 3 means "between the 2nd and 3rd". */
  ordinal: number;
  gapMs: number;
  baselineMs: number;
}

/**
 * Has the pace run away *within this evening*?
 *
 * Compares the most recent gap against the median of the ones before it, so it
 * works on the first evening ever recorded and needs no history. The baseline is
 * this evening's own earlier spacing rather than a general rule, because "fast"
 * only means anything relative to how this particular evening started.
 */
export function accelerationInSession(takes: Episode[]): Acceleration | undefined {
  if (takes.length < MIN_TAKES_FOR_PACE) return undefined;
  const g = gaps(takes);
  const latest = g[g.length - 1];
  const baseline = median(g.slice(0, -1));
  if (!Number.isFinite(baseline) || baseline <= 0) return undefined;
  if (latest >= baseline * ACCELERATION_RATIO) return undefined;
  return { ordinal: takes.length, gapMs: latest, baselineMs: baseline };
}

export interface PaceRow {
  /** The gap before this drink: ordinal 2 is the gap between the 1st and 2nd. */
  ordinal: number;
  medianGapMs: number;
  /** How many evenings reached this far. */
  sessions: number;
}

/**
 * Typical spacing by drink number, across every past evening.
 *
 * Median rather than mean, for the same reason as everywhere else here: one
 * evening that went very long must not move the typical case.
 */
export function pacingProfile(episodes: Episode[]): PaceRow[] {
  const sessions = new Map<number, Episode[]>();
  for (const e of episodes) {
    if (e.outcome !== 'took') continue;
    const key = sessionStart(e.startedAt);
    sessions.set(key, [...(sessions.get(key) ?? []), e]);
  }

  const byOrdinal = new Map<number, number[]>();
  for (const takes of sessions.values()) {
    const g = gaps([...takes].sort((a, b) => a.startedAt - b.startedAt));
    g.forEach((ms, i) => {
      const ordinal = i + 2;
      byOrdinal.set(ordinal, [...(byOrdinal.get(ordinal) ?? []), ms]);
    });
  }

  return [...byOrdinal.entries()]
    .map(([ordinal, values]) => ({
      ordinal,
      medianGapMs: median(values),
      sessions: values.length,
    }))
    .sort((a, b) => a.ordinal - b.ordinal);
}

/**
 * The drink number at which the gaps typically collapse — the thing worth
 * knowing before the evening reaches it.
 *
 * Requires `minSessions` evenings both at the baseline and at the candidate, so
 * a single unusual night cannot mint a threshold. Returns nothing when the pace
 * does not clearly break anywhere, and the view says so plainly instead of
 * inventing a number: not every drinker has a tipping point, and manufacturing
 * one for those who do not would be exactly the confident-but-wrong claim this
 * codebase refuses everywhere else.
 */
export function accelerationOrdinal(profile: PaceRow[], minSessions: number): number | undefined {
  const first = profile.find((p) => p.ordinal === 2);
  if (!first || first.sessions < minSessions) return undefined;
  const threshold = first.medianGapMs * ACCELERATION_RATIO;
  return profile.find((p) => p.ordinal > 2 && p.sessions >= minSessions && p.medianGapMs < threshold)
    ?.ordinal;
}

export interface SessionSummary {
  startedAt: number;
  takes: Episode[];
  drinks: number;
  grams: number;
  gapsMs: number[];
  /** Set when this evening's own pace has just collapsed. */
  accelerated?: Acceleration;
}

export function summarise(episodes: Episode[], at: number): SessionSummary {
  const takes = takesInSession(episodes, at);
  return {
    startedAt: sessionStart(at),
    takes,
    drinks: takes.length,
    grams: takes.length * GRAMS_PER_DRINK,
    gapsMs: gaps(takes),
    accelerated: accelerationInSession(takes),
  };
}
