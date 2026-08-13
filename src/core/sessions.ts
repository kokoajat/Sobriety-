/**
 * The day seen as one lived stretch rather than a list of rows.
 *
 * A logged day already runs boundary-to-boundary (05:00 by default), so an
 * evening that spills past midnight is one day. This module renders that day as
 * a span: when the first fork arrived, when the last one did, how many there
 * were in between.
 *
 * Everything here is derived. Sessions are never stored, because a session is
 * not something the user records — it is what their forks add up to, and any
 * stored copy would be one more thing that can fall out of sync with them.
 *
 * Note that a session is deliberately *not* a scoring unit. Calibration needs a
 * unit that exists on quiet days too, and a session only exists once something
 * happened; scoring them would make every outcome a 1. Sessions describe, days
 * score.
 */

import { dayRelativeMinute } from './day';
import { isResolved } from './day';
import type { DateKey, Day, FunctionTag } from './types';

export interface DaySession {
  date: DateKey;
  /** Clock minute of the first fork, 0..1439 — displayable as-is. */
  startMin: number;
  /** Clock minute of the last fork. May be smaller than `startMin` past midnight. */
  endMin: number;
  /** Wall-clock minutes from first fork to last. Zero for a single-fork day. */
  durationMin: number;
  forks: number;
  drankForks: number;
  /**
   * Longest quiet stretch inside the span.
   *
   * Carried so the surface can say "kahdessa erässä" instead of implying one
   * continuous evening: a lunchtime fork and a midnight fork on the same day
   * would otherwise render as a thirteen-hour session, which is a lie about
   * what happened.
   */
  longestGapMin: number;
  /** Distinct function tags in the order they first appeared. */
  tags: FunctionTag[];
  /** The day's recorded outcome; undefined while the day is still open. */
  drank?: boolean;
}

/**
 * One session per logged day, or nothing when the day recorded no forks.
 *
 * Ordering is by day-relative minute, not clock minute, so 01:15 sorts after
 * 22:40 rather than before it.
 */
export function daySession(day: Day, dayStartsAtMin: number): DaySession | undefined {
  const forks = day.observation?.forks ?? [];
  if (forks.length === 0) return undefined;

  const ordered = [...forks].sort(
    (a, b) =>
      dayRelativeMinute(a.atMin, dayStartsAtMin) - dayRelativeMinute(b.atMin, dayStartsAtMin),
  );

  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  const firstRel = dayRelativeMinute(first.atMin, dayStartsAtMin);
  const lastRel = dayRelativeMinute(last.atMin, dayStartsAtMin);

  let longestGapMin = 0;
  for (let i = 1; i < ordered.length; i += 1) {
    const gap =
      dayRelativeMinute(ordered[i].atMin, dayStartsAtMin) -
      dayRelativeMinute(ordered[i - 1].atMin, dayStartsAtMin);
    if (gap > longestGapMin) longestGapMin = gap;
  }

  const tags: FunctionTag[] = [];
  for (const fork of ordered) if (!tags.includes(fork.tag)) tags.push(fork.tag);

  return {
    date: day.date,
    startMin: first.atMin,
    endMin: last.atMin,
    durationMin: lastRel - firstRel,
    forks: ordered.length,
    drankForks: ordered.filter((f) => f.choice === 'drank').length,
    longestGapMin,
    tags,
    drank: isResolved(day) ? day.observation!.drank : undefined,
  };
}

/** Every day that recorded a fork, most recent first. */
export function sessions(days: Day[], dayStartsAtMin: number): DaySession[] {
  return days
    .map((day) => daySession(day, dayStartsAtMin))
    .filter((s): s is DaySession => s !== undefined)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export interface SessionSummary {
  count: number;
  /** Middle values, not means: one four-day bender should not move the typical case. */
  medianDurationMin: number;
  medianForks: number;
  /** Clock minute the typical session ends at. */
  medianEndMin: number;
  longest?: DaySession;
}

/** Lower median — picked by index, so the result is always a value that occurred. */
function median(values: number[]): number {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) / 2)];
}

export function summarize(list: DaySession[], dayStartsAtMin: number): SessionSummary {
  if (list.length === 0) {
    return { count: 0, medianDurationMin: NaN, medianForks: NaN, medianEndMin: NaN };
  }

  // Medianed in day-relative space, then converted back, so 00:40 is treated as
  // late rather than as the earliest value in the set.
  const relativeEnd = median(list.map((s) => dayRelativeMinute(s.endMin, dayStartsAtMin)));

  return {
    count: list.length,
    medianDurationMin: median(list.map((s) => s.durationMin)),
    medianForks: median(list.map((s) => s.forks)),
    medianEndMin: (relativeEnd + dayStartsAtMin) % 1440,
    longest: [...list].sort((a, b) => b.durationMin - a.durationMin)[0],
  };
}
