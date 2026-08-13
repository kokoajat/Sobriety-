/**
 * Day lifecycle: local date keys, the forecast/resolve cycle, and the mapping
 * from stored days to scoreable rows.
 */

import type { DateKey, Day, Settings } from './types';
import type { ScoredForecast } from './forecast';

/**
 * Which logged day a moment belongs to.
 *
 * Local, never UTC — and shifted by `dayStartsAtMin`, so 00:35 still belongs to
 * the evening that produced it rather than opening a fresh day mid-session.
 *
 * The shift is applied as wall-clock arithmetic on a copy, so it stays correct
 * across a DST change except in the hour the clocks actually move; a boundary at
 * 05:00 sits clear of the 03:00–04:00 window where that happens here.
 */
export function dateKey(d: Date = new Date(), dayStartsAtMin = 0): DateKey {
  const shifted = new Date(d);
  shifted.setMinutes(shifted.getMinutes() - dayStartsAtMin);
  const y = shifted.getFullYear();
  const m = String(shifted.getMonth() + 1).padStart(2, '0');
  const day = String(shifted.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Clock minutes since local midnight, 0..1439. What a fork's `atMin` records. */
export function minuteOfDay(d: Date = new Date()): number {
  return d.getHours() * 60 + d.getMinutes();
}

/**
 * A clock minute re-expressed as minutes elapsed since the logged day began.
 *
 * Lets the evening threshold be compared against a moment after midnight
 * without the comparison flipping: at 00:35 with a 05:00 start, 1175 minutes of
 * the day have passed, not 35.
 */
export function dayRelativeMinute(minute: number, dayStartsAtMin: number): number {
  return (((minute - dayStartsAtMin) % 1440) + 1440) % 1440;
}

export function addDays(key: DateKey, delta: number): DateKey {
  const d = new Date(`${key}T12:00:00`);
  d.setDate(d.getDate() + delta);
  return dateKey(d);
}

export type DayPhase =
  /** Before the forecast is in — the only blocking step in the app. */
  | 'awaiting-forecast'
  /** Forecast made, day in progress. */
  | 'live'
  /** Evening reached, outcome not yet recorded. */
  | 'awaiting-resolve'
  /** Forecast and outcome both recorded. */
  | 'closed';

/**
 * A day is resolved only once the user has actually closed it in the evening.
 *
 * Forks logged live write into `observation` as they happen, so the record
 * exists long before the day is over — its mere presence must never be read as
 * "resolved", or logging a single fork would close the day, skip the evening
 * step, and score the day on an outcome nobody confirmed.
 */
export function isResolved(day: Day | undefined): boolean {
  return Boolean(day?.observation && day.observation.resolvedAt > 0);
}

export function dayPhase(day: Day | undefined, now: Date, settings: Settings): DayPhase {
  if (isResolved(day)) return 'closed';
  if (!day?.forecast) return 'awaiting-forecast';
  const elapsed = dayRelativeMinute(minuteOfDay(now), settings.dayStartsAtMin);
  const threshold = dayRelativeMinute(settings.resolveAtMin, settings.dayStartsAtMin);
  return elapsed >= threshold ? 'awaiting-resolve' : 'live';
}

/**
 * The most recent earlier day that was forecast but never closed.
 *
 * Before the day boundary moved off midnight, any session running past 00:00
 * stranded its day exactly this way, and a stranded day never reaches scoring.
 * Surfacing it gives the user a way to finish it instead of silently losing the
 * forecast it holds.
 */
export function unresolvedBefore(days: Day[], today: DateKey): Day | undefined {
  return days
    .filter((d) => d.date < today && d.forecast && !isResolved(d))
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
}

/**
 * Days that can be scored: forecast made *and* outcome known.
 *
 * A day resolved without a forecast is excluded rather than counted as a miss.
 * Scoring an absent forecast would punish the user for a day they did not play,
 * which is exactly the mechanic this app exists to avoid.
 */
export function scoreableRows(days: Day[]): ScoredForecast[] {
  const rows: ScoredForecast[] = [];
  for (const day of days) {
    if (!day.forecast || !isResolved(day)) continue;
    rows.push({ p: day.forecast.p, outcome: day.observation!.drank ? 1 : 0 });
  }
  return rows;
}

/** Dates the user both forecast and resolved — the engagement streak's input. */
export function engagedDates(days: Day[]): Set<DateKey> {
  const set = new Set<DateKey>();
  for (const day of days) {
    if (day.forecast && isResolved(day)) set.add(day.date);
  }
  return set;
}

/** Most recent days first, capped. */
export function recentDays(days: Day[], limit: number): Day[] {
  return [...days].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, limit);
}

/**
 * Days within the trailing `window` calendar days, inclusive of `today`. Used to
 * score a moving recent window rather than a lifetime average, so a bad month
 * six months ago cannot bury present progress.
 */
export function withinWindow(days: Day[], today: DateKey, window: number): Day[] {
  const cutoff = addDays(today, -(window - 1));
  return days.filter((d) => d.date >= cutoff && d.date <= today);
}
