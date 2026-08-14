import { describe, expect, it } from 'vitest';
import {
  ACCELERATION_RATIO,
  GRAMS_PER_DRINK,
  accelerationInSession,
  accelerationOrdinal,
  gaps,
  pacingProfile,
  sameSession,
  sessionStart,
  summarise,
  takesInSession,
} from './session';
import type { Episode, Outcome } from './types';

const MIN = 60_000;

/** An episode at a local wall-clock time. */
const at = (iso: string, outcome: Outcome = 'took'): Episode => ({
  id: iso + outcome,
  startedAt: new Date(iso).getTime(),
  demand: 'settle',
  waitedMs: 0,
  extensions: 0,
  outcome,
  endedAt: new Date(iso).getTime() + MIN,
});

/** Takes spaced by the given gaps, starting at 20:00. */
const spaced = (day: string, gapsMin: number[]): Episode[] => {
  let t = new Date(`${day}T20:00:00`).getTime();
  const out = [at(new Date(t).toISOString())];
  for (const g of gapsMin) {
    t += g * MIN;
    out.push({ ...at(new Date(t).toISOString()), id: `${day}-${t}` });
  }
  return out;
};

describe('session boundaries', () => {
  it('puts an evening and the small hours after it in one session', () => {
    // The whole reason for a 05:00 boundary: this is one evening, not two.
    expect(sameSession(at('2026-08-14T21:00:00').startedAt, at('2026-08-15T02:30:00').startedAt))
      .toBe(true);
  });

  it('starts a new session at 05:00, not at midnight', () => {
    expect(sameSession(at('2026-08-15T04:59:00').startedAt, at('2026-08-15T05:01:00').startedAt))
      .toBe(false);
  });

  it('anchors a session to the 05:00 before it', () => {
    const start = new Date(sessionStart(at('2026-08-15T02:30:00').startedAt));
    expect(start.getHours()).toBe(5);
    expect(start.getDate()).toBe(14);
  });

  it('anchors a morning event to the same day it happened', () => {
    const start = new Date(sessionStart(at('2026-08-15T11:00:00').startedAt));
    expect(start.getDate()).toBe(15);
  });
});

describe('takesInSession', () => {
  const episodes = [
    at('2026-08-14T21:00:00'),
    at('2026-08-14T22:00:00', 'passed'),
    at('2026-08-15T01:00:00'),
    at('2026-08-15T21:00:00'),
  ];

  it('counts only the drinks, not the urges that passed', () => {
    expect(takesInSession(episodes, new Date('2026-08-15T02:00:00').getTime())).toHaveLength(2);
  });

  it('leaves the next evening out', () => {
    const takes = takesInSession(episodes, new Date('2026-08-15T22:00:00').getTime());
    expect(takes).toHaveLength(1);
  });

  it('returns them oldest first, since the gaps depend on the order', () => {
    const takes = takesInSession(episodes, new Date('2026-08-15T02:00:00').getTime());
    expect(takes[0].startedAt).toBeLessThan(takes[1].startedAt);
  });
});

describe('gaps', () => {
  it('is empty for a single drink, because spacing needs two', () => {
    expect(gaps(spaced('2026-08-14', []))).toEqual([]);
  });

  it('measures between consecutive takes', () => {
    expect(gaps(spaced('2026-08-14', [45, 30]))).toEqual([45 * MIN, 30 * MIN]);
  });
});

describe('accelerationInSession', () => {
  it('says nothing before there are enough drinks to have a baseline', () => {
    expect(accelerationInSession(spaced('2026-08-14', [10]))).toBeUndefined();
  });

  it('fires when the latest gap collapses against this evening s own baseline', () => {
    // 60, 60, then 10: the pace ran away before the fourth.
    const found = accelerationInSession(spaced('2026-08-14', [60, 60, 10]));
    expect(found?.ordinal).toBe(4);
    expect(found?.gapMs).toBe(10 * MIN);
    expect(found?.baselineMs).toBe(60 * MIN);
  });

  it('stays quiet while the pace holds steady', () => {
    expect(accelerationInSession(spaced('2026-08-14', [60, 55, 65]))).toBeUndefined();
  });

  it('stays quiet while the pace is slowing down', () => {
    // The opposite pattern must never be reported as acceleration.
    expect(accelerationInSession(spaced('2026-08-14', [40, 60, 100]))).toBeUndefined();
  });

  it('uses exactly the stated ratio at the boundary', () => {
    const justUnder = accelerationInSession(spaced('2026-08-14', [60, 60, 60 * ACCELERATION_RATIO - 1]));
    const exactly = accelerationInSession(spaced('2026-08-14', [60, 60, 60 * ACCELERATION_RATIO]));
    expect(justUnder).toBeDefined();
    expect(exactly).toBeUndefined();
  });

  it('judges against the earlier gaps only, not including the latest one', () => {
    // If the collapsing gap were in its own baseline it would raise the bar it
    // has to clear, and a sharp enough drop would hide itself.
    const found = accelerationInSession(spaced('2026-08-14', [90, 90, 5]));
    expect(found?.baselineMs).toBe(90 * MIN);
  });
});

describe('pacingProfile', () => {
  const evenings = [
    ...spaced('2026-08-01', [60, 60, 10, 8]),
    ...spaced('2026-08-02', [50, 70, 12, 9]),
    ...spaced('2026-08-03', [70, 50, 8, 7]),
  ];

  it('groups gaps by drink number across evenings', () => {
    const profile = pacingProfile(evenings);
    expect(profile.map((p) => p.ordinal)).toEqual([2, 3, 4, 5]);
  });

  it('counts how many evenings reached each drink', () => {
    const profile = pacingProfile(evenings);
    expect(profile.every((p) => p.sessions === 3)).toBe(true);
  });

  it('takes the median, so one long evening does not move the typical case', () => {
    const withOutlier = [...evenings, ...spaced('2026-08-04', [600])];
    const second = pacingProfile(withOutlier).find((p) => p.ordinal === 2)!;
    expect(second.medianGapMs).toBe(60 * MIN);
  });

  it('ignores urges that passed, since they are not drinks', () => {
    const mixed = [...spaced('2026-08-05', [30]), at('2026-08-05T20:15:00', 'passed')];
    expect(pacingProfile(mixed)).toEqual([{ ordinal: 2, medianGapMs: 30 * MIN, sessions: 1 }]);
  });

  it('is empty when nothing was ever taken', () => {
    expect(pacingProfile([at('2026-08-05T20:00:00', 'passed')])).toEqual([]);
  });
});

describe('accelerationOrdinal', () => {
  const evenings = [
    ...spaced('2026-08-01', [60, 60, 10, 8]),
    ...spaced('2026-08-02', [50, 70, 12, 9]),
    ...spaced('2026-08-03', [70, 50, 8, 7]),
  ];

  it('finds the drink number where the gaps collapse', () => {
    expect(accelerationOrdinal(pacingProfile(evenings), 3)).toBe(4);
  });

  it('withholds a threshold until enough evenings support it', () => {
    // One unusual night must not mint a rule about every future one.
    expect(accelerationOrdinal(pacingProfile(evenings), 10)).toBeUndefined();
  });

  it('returns nothing when the pace never clearly breaks', () => {
    // Not everyone has a tipping point, and inventing one for them would be the
    // confident-but-wrong claim this codebase refuses everywhere else.
    const steady = [
      ...spaced('2026-08-01', [60, 55, 65, 58]),
      ...spaced('2026-08-02', [62, 58, 60, 61]),
      ...spaced('2026-08-03', [59, 63, 57, 60]),
    ];
    expect(accelerationOrdinal(pacingProfile(steady), 3)).toBeUndefined();
  });

  it('never reports the baseline drink itself', () => {
    const profile = pacingProfile(evenings);
    expect(accelerationOrdinal(profile, 3)).toBeGreaterThan(2);
  });

  it('reports the earliest collapse, not the deepest one', () => {
    // The useful number is where it starts, since that is the one still ahead.
    const profile = pacingProfile(evenings);
    const found = accelerationOrdinal(profile, 3)!;
    const deepest = [...profile].sort((a, b) => a.medianGapMs - b.medianGapMs)[0].ordinal;
    expect(found).toBeLessThanOrEqual(deepest);
  });
});

describe('summarise', () => {
  const now = new Date('2026-08-14T23:30:00').getTime();

  it('converts each take to one standard drink of 12 g', () => {
    const s = summarise(spaced('2026-08-14', [60, 60]), now);
    expect(s.drinks).toBe(3);
    expect(s.grams).toBe(3 * GRAMS_PER_DRINK);
    expect(GRAMS_PER_DRINK).toBe(12);
  });

  it('is all zeroes on an evening with nothing in it', () => {
    const s = summarise([], now);
    expect(s.drinks).toBe(0);
    expect(s.grams).toBe(0);
    expect(s.gapsMs).toEqual([]);
    expect(s.accelerated).toBeUndefined();
  });

  it('carries the within-evening acceleration when there is one', () => {
    expect(summarise(spaced('2026-08-14', [60, 60, 5]), now).accelerated?.ordinal).toBe(4);
  });
});
