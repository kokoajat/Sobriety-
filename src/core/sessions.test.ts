import { describe, expect, it } from 'vitest';
import { daySession, sessions, summarize } from './sessions';
import type { Day, ObservedFork } from './types';

const START = 5 * 60;

const fork = (atMin: number, over: Partial<ObservedFork> = {}): ObservedFork => ({
  atMin,
  tag: 'unwind',
  choice: 'drank',
  intensity: 3,
  loggedInMoment: true,
  ...over,
});

const day = (date: string, forks: ObservedFork[], resolvedAt = 1, drank = true): Day => ({
  date,
  observation: { date, drank, forks, resolvedAt },
});

describe('daySession', () => {
  it('is undefined for a day with no forks', () => {
    expect(daySession(day('2026-08-13', []), START)).toBeUndefined();
    expect(daySession({ date: '2026-08-13' }, START)).toBeUndefined();
  });

  it('spans an evening that runs past midnight', () => {
    // 22:40 -> 01:15 is 2 h 35 min, not "minus 21 hours".
    const s = daySession(day('2026-08-13', [fork(22 * 60 + 40), fork(75)]), START)!;
    expect(s.startMin).toBe(22 * 60 + 40);
    expect(s.endMin).toBe(75);
    expect(s.durationMin).toBe(155);
  });

  it('orders by day-relative time, so a past-midnight fork sorts last', () => {
    // Given out of order, and with the small-hours fork first in the array.
    const s = daySession(day('2026-08-13', [fork(75), fork(19 * 60), fork(23 * 60)]), START)!;
    expect(s.startMin).toBe(19 * 60);
    expect(s.endMin).toBe(75);
  });

  it('is a zero-length span for a single fork', () => {
    const s = daySession(day('2026-08-13', [fork(20 * 60)]), START)!;
    expect(s.durationMin).toBe(0);
    expect(s.forks).toBe(1);
  });

  it('counts only the forks that ended in a drink', () => {
    const s = daySession(
      day('2026-08-13', [
        fork(19 * 60, { choice: 'drank' }),
        fork(20 * 60, { choice: 'passed' }),
        fork(21 * 60, { choice: 'drank' }),
      ]),
      START,
    )!;
    expect(s.forks).toBe(3);
    expect(s.drankForks).toBe(2);
  });

  it('reports the longest gap, so two separate episodes are not read as one evening', () => {
    // Lunch, then night: one span on paper, two occasions in life.
    const s = daySession(day('2026-08-13', [fork(12 * 60 + 30), fork(23 * 60)]), START)!;
    expect(s.durationMin).toBe(630);
    expect(s.longestGapMin).toBe(630);
  });

  it('keeps the gap small when the forks are genuinely consecutive', () => {
    const s = daySession(
      day('2026-08-13', [fork(21 * 60), fork(22 * 60), fork(23 * 60)]),
      START,
    )!;
    expect(s.longestGapMin).toBe(60);
  });

  it('lists distinct tags in the order they first appeared', () => {
    const s = daySession(
      day('2026-08-13', [
        fork(19 * 60, { tag: 'unwind' }),
        fork(20 * 60, { tag: 'boredom' }),
        fork(21 * 60, { tag: 'unwind' }),
      ]),
      START,
    )!;
    expect(s.tags).toEqual(['unwind', 'boredom']);
  });

  it('leaves the outcome undefined while the day is still open', () => {
    const open = day('2026-08-13', [fork(19 * 60)], 0);
    expect(daySession(open, START)!.drank).toBeUndefined();
  });

  it('carries the outcome once the day is closed', () => {
    expect(daySession(day('2026-08-13', [fork(19 * 60)], 1, true), START)!.drank).toBe(true);
  });

  it('follows a midnight boundary when that is what the user set', () => {
    // With no shift, 01:15 is early in its own day and 22:40 is late in it, so
    // the two are 21 hours apart rather than 2.5.
    const s = daySession(day('2026-08-13', [fork(22 * 60 + 40), fork(75)]), 0)!;
    expect(s.startMin).toBe(75);
    expect(s.durationMin).toBe(1285);
  });
});

describe('sessions', () => {
  it('returns the most recent day first and skips forkless days', () => {
    const days = [
      day('2026-08-11', [fork(20 * 60)]),
      day('2026-08-12', []),
      day('2026-08-13', [fork(21 * 60)]),
    ];
    expect(sessions(days, START).map((s) => s.date)).toEqual(['2026-08-13', '2026-08-11']);
  });
});

describe('summarize', () => {
  it('is empty-safe', () => {
    const s = summarize([], START);
    expect(s.count).toBe(0);
    expect(s.medianDurationMin).toBeNaN();
  });

  it('reports the middle session rather than the mean', () => {
    // One very long night must not drag the typical case with it.
    const days = [
      day('2026-08-11', [fork(20 * 60), fork(21 * 60)]), // 60 min
      day('2026-08-12', [fork(20 * 60), fork(21 * 60 + 30)]), // 90 min
      day('2026-08-13', [fork(18 * 60), fork(4 * 60)]), // 600 min
    ];
    expect(summarize(sessions(days, START), START).medianDurationMin).toBe(90);
  });

  it('medians the end time as a late hour, not as an early one', () => {
    // Ends at 00:30, 01:00, 01:30 — the middle is 01:00, not "00:30 is smallest".
    const days = [
      day('2026-08-11', [fork(22 * 60), fork(30)]),
      day('2026-08-12', [fork(22 * 60), fork(60)]),
      day('2026-08-13', [fork(22 * 60), fork(90)]),
    ];
    expect(summarize(sessions(days, START), START).medianEndMin).toBe(60);
  });

  it('names the longest session', () => {
    const days = [
      day('2026-08-11', [fork(20 * 60), fork(21 * 60)]),
      day('2026-08-13', [fork(18 * 60), fork(4 * 60)]),
    ];
    expect(summarize(sessions(days, START), START).longest?.date).toBe('2026-08-13');
  });
});
