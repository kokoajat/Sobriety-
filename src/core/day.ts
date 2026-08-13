/**
 * Day lifecycle: local date keys, the forecast/resolve cycle, and the mapping
 * from stored days to scoreable rows.
 */

import type { DateKey, Day, Settings } from './types';
import type { ScoredForecast } from './forecast';

/** Local calendar date, not UTC — a 23:30 drink belongs to the day it felt like. */
export function dateKey(d: Date = new Date()): DateKey {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function minuteOfDay(d: Date = new Date()): number {
  return d.getHours() * 60 + d.getMinutes();
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

export function dayPhase(day: Day | undefined, now: Date, settings: Settings): DayPhase {
  if (day?.observation) return 'closed';
  if (!day?.forecast) return 'awaiting-forecast';
  return minuteOfDay(now) >= settings.resolveAtMin ? 'awaiting-resolve' : 'live';
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
    if (!day.forecast || !day.observation) continue;
    rows.push({ p: day.forecast.p, outcome: day.observation.drank ? 1 : 0 });
  }
  return rows;
}

/** Dates the user both forecast and resolved — the engagement streak's input. */
export function engagedDates(days: Day[]): Set<DateKey> {
  const set = new Set<DateKey>();
  for (const day of days) {
    if (day.forecast && day.observation) set.add(day.date);
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
