import { describe, expect, it } from 'vitest';
import {
  addDays,
  dateKey,
  dayPhase,
  engagedDates,
  isResolved,
  scoreableRows,
  withinWindow,
} from './day';
import { DEFAULT_SETTINGS, type Day } from './types';

const at = (hour: number, minute = 0) => new Date(2026, 7, 13, hour, minute);

describe('dateKey', () => {
  it('uses the local calendar date, not UTC', () => {
    // 23:30 local on the 13th belongs to the 13th regardless of UTC offset.
    expect(dateKey(new Date(2026, 7, 13, 23, 30))).toBe('2026-08-13');
  });

  it('zero-pads months and days', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('addDays', () => {
  it('crosses a month boundary', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01');
  });

  it('goes backwards across a year boundary', () => {
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });
});

describe('dayPhase', () => {
  const withForecast: Day = {
    date: '2026-08-13',
    forecast: { date: '2026-08-13', p: 0.4, forks: [], madeAt: 0 },
  };

  it('asks for a forecast when the day has not started', () => {
    expect(dayPhase(undefined, at(8), DEFAULT_SETTINGS)).toBe('awaiting-forecast');
  });

  it('is live between the forecast and the evening', () => {
    expect(dayPhase(withForecast, at(14), DEFAULT_SETTINGS)).toBe('live');
  });

  it('asks for a resolution once the evening hits', () => {
    expect(dayPhase(withForecast, at(22), DEFAULT_SETTINGS)).toBe('awaiting-resolve');
  });

  it('is closed once the outcome is in, whatever the outcome was', () => {
    const resolved: Day = {
      ...withForecast,
      observation: { date: '2026-08-13', drank: true, forks: [], resolvedAt: 1 },
    };
    expect(dayPhase(resolved, at(23), DEFAULT_SETTINGS)).toBe('closed');
  });

  it('stays live after a fork is logged, since a fork does not end the day', () => {
    // Live fork logging writes an observation hours before the evening step;
    // reading its presence as "resolved" would close the day on the first fork.
    const withLiveFork: Day = {
      ...withForecast,
      observation: {
        date: '2026-08-13',
        drank: false,
        forks: [
          { atMin: 14 * 60, tag: 'boredom', choice: 'passed', intensity: 2, loggedInMoment: true },
        ],
        resolvedAt: 0,
      },
    };
    expect(dayPhase(withLiveFork, at(14), DEFAULT_SETTINGS)).toBe('live');
    expect(dayPhase(withLiveFork, at(22), DEFAULT_SETTINGS)).toBe('awaiting-resolve');
  });
});

describe('isResolved', () => {
  const openObservation = {
    date: '2026-08-13',
    drank: true,
    forks: [],
    resolvedAt: 0,
  };

  it('is false for a day carrying only live-logged forks', () => {
    expect(isResolved({ date: '2026-08-13', observation: openObservation })).toBe(false);
  });

  it('is true once the evening step has stamped it', () => {
    expect(
      isResolved({ date: '2026-08-13', observation: { ...openObservation, resolvedAt: 1 } }),
    ).toBe(true);
  });

  it('is false for a day with no observation at all', () => {
    expect(isResolved({ date: '2026-08-13' })).toBe(false);
    expect(isResolved(undefined)).toBe(false);
  });
});

describe('scoreableRows', () => {
  it('scores only days that were both forecast and resolved', () => {
    const days: Day[] = [
      {
        date: '2026-08-11',
        forecast: { date: '2026-08-11', p: 0.7, forks: [], madeAt: 0 },
        observation: { date: '2026-08-11', drank: true, forks: [], resolvedAt: 1 },
      },
      // Resolved but never forecast: not a miss, just not a played day.
      {
        date: '2026-08-12',
        observation: { date: '2026-08-12', drank: true, forks: [], resolvedAt: 1 },
      },
      // Forecast but not yet resolved.
      { date: '2026-08-13', forecast: { date: '2026-08-13', p: 0.2, forks: [], madeAt: 0 } },
    ];
    expect(scoreableRows(days)).toEqual([{ p: 0.7, outcome: 1 }]);
  });

  it('does not score a day that only has live-logged forks', () => {
    // `drank` is still false mid-afternoon; scoring it now would record an
    // outcome the user never confirmed.
    const days: Day[] = [
      {
        date: '2026-08-13',
        forecast: { date: '2026-08-13', p: 0.6, forks: [], madeAt: 0 },
        observation: { date: '2026-08-13', drank: false, forks: [], resolvedAt: 0 },
      },
    ];
    expect(scoreableRows(days)).toEqual([]);
  });
});

describe('engagedDates', () => {
  it('includes a drinking day, since engagement is not abstinence', () => {
    const days: Day[] = [
      {
        date: '2026-08-13',
        forecast: { date: '2026-08-13', p: 0.9, forks: [], madeAt: 0 },
        observation: { date: '2026-08-13', drank: true, forks: [], resolvedAt: 1 },
      },
    ];
    expect(engagedDates(days).has('2026-08-13')).toBe(true);
  });

  it('excludes a day that has not been closed yet', () => {
    const days: Day[] = [
      {
        date: '2026-08-13',
        forecast: { date: '2026-08-13', p: 0.9, forks: [], madeAt: 0 },
        observation: { date: '2026-08-13', drank: true, forks: [], resolvedAt: 0 },
      },
    ];
    expect(engagedDates(days).size).toBe(0);
  });
});

describe('withinWindow', () => {
  const days: Day[] = ['2026-08-01', '2026-08-10', '2026-08-13'].map((date) => ({ date }));

  it('keeps the trailing window inclusive of today', () => {
    expect(withinWindow(days, '2026-08-13', 7).map((d) => d.date)).toEqual([
      '2026-08-10',
      '2026-08-13',
    ]);
  });

  it('excludes days after today', () => {
    expect(withinWindow(days, '2026-08-10', 30).map((d) => d.date)).toEqual([
      '2026-08-01',
      '2026-08-10',
    ]);
  });
});
