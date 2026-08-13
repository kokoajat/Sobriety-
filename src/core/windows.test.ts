import { describe, expect, it } from 'vitest';
import { blindSpots, blockOf, functionLoad, noticingRate, windowStats } from './windows';
import type { Day, ObservedFork } from './types';

const fork = (over: Partial<ObservedFork> = {}): ObservedFork => ({
  atMin: 19 * 60,
  tag: 'unwind',
  choice: 'drank',
  intensity: 4,
  loggedInMoment: false,
  ...over,
});

// 2026-08-13 is a Thursday (getDay() === 4).
const day = (date: string, over: Partial<Day> = {}): Day => ({ date, ...over });

describe('blockOf', () => {
  it('maps clock times to blocks', () => {
    expect(blockOf(8 * 60)).toBe('morning');
    expect(blockOf(14 * 60)).toBe('afternoon');
    expect(blockOf(19 * 60)).toBe('evening');
    expect(blockOf(23 * 60)).toBe('night');
  });

  it('treats the small hours as night, not morning', () => {
    expect(blockOf(2 * 60)).toBe('night');
    expect(blockOf(0)).toBe('night');
  });
});

describe('windowStats', () => {
  it('ignores days that were never resolved', () => {
    expect(windowStats([day('2026-08-13')])).toEqual([]);
  });

  it('counts every block of a resolved day as an opportunity', () => {
    const stats = windowStats([
      day('2026-08-13', {
        observation: { date: '2026-08-13', drank: false, forks: [], resolvedAt: 1 },
      }),
    ]);
    expect(stats).toHaveLength(4);
    expect(stats.every((s) => s.days === 1)).toBe(true);
  });

  it('marks a fork as unpredicted when no forecast named its block', () => {
    const stats = windowStats([
      day('2026-08-13', {
        forecast: {
          date: '2026-08-13',
          p: 0.3,
          forks: [{ block: 'afternoon', tag: 'boredom' }],
          madeAt: 0,
        },
        observation: {
          date: '2026-08-13',
          drank: true,
          forks: [fork({ atMin: 19 * 60 })],
          resolvedAt: 1,
        },
      }),
    ]);
    const evening = stats.find((s) => s.block === 'evening')!;
    expect(evening.forksObserved).toBe(1);
    expect(evening.forksUnpredicted).toBe(1);
    expect(evening.forksDrunk).toBe(1);

    const afternoon = stats.find((s) => s.block === 'afternoon')!;
    expect(afternoon.forksPredicted).toBe(1);
    expect(afternoon.forksObserved).toBe(0);
  });

  it('does not count a fork as unpredicted when its block was forecast', () => {
    const stats = windowStats([
      day('2026-08-13', {
        forecast: {
          date: '2026-08-13',
          p: 0.8,
          forks: [{ block: 'evening', tag: 'unwind' }],
          madeAt: 0,
        },
        observation: { date: '2026-08-13', drank: true, forks: [fork()], resolvedAt: 1 },
      }),
    ]);
    expect(stats.find((s) => s.block === 'evening')!.forksUnpredicted).toBe(0);
  });

  it('counts a block predicted twice in one day only once', () => {
    const stats = windowStats([
      day('2026-08-13', {
        forecast: {
          date: '2026-08-13',
          p: 0.5,
          forks: [
            { block: 'evening', tag: 'unwind' },
            { block: 'evening', tag: 'boredom' },
          ],
          madeAt: 0,
        },
        observation: { date: '2026-08-13', drank: false, forks: [], resolvedAt: 1 },
      }),
    ]);
    expect(stats.find((s) => s.block === 'evening')!.forksPredicted).toBe(1);
  });

  it('reports the dominant function tag of a window', () => {
    const observation = {
      date: '2026-08-13',
      drank: true,
      forks: [fork({ tag: 'numb' }), fork({ tag: 'numb' }), fork({ tag: 'social' })],
      resolvedAt: 1,
    };
    const stats = windowStats([day('2026-08-13', { observation })]);
    expect(stats.find((s) => s.block === 'evening')!.dominantTag).toBe('numb');
  });

  it('keeps weekdays separate', () => {
    const observation = (date: string) => ({ date, drank: true, forks: [fork()], resolvedAt: 1 });
    const stats = windowStats([
      day('2026-08-13', { observation: observation('2026-08-13') }), // Thursday
      day('2026-08-14', { observation: observation('2026-08-14') }), // Friday
    ]);
    const evenings = stats.filter((s) => s.block === 'evening');
    expect(evenings).toHaveLength(2);
    expect(new Set(evenings.map((e) => e.weekday))).toEqual(new Set([4, 5]));
  });
});

describe('blindSpots', () => {
  const surprising = (dates: string[]): Day[] =>
    dates.map((date) =>
      day(date, {
        forecast: { date, p: 0.2, forks: [], madeAt: 0 },
        observation: { date, drank: true, forks: [fork()], resolvedAt: 1 },
      }),
    );

  it('surfaces a window whose forks keep arriving unannounced', () => {
    // Four consecutive Thursdays.
    const days = surprising(['2026-07-23', '2026-07-30', '2026-08-06', '2026-08-13']);
    const spots = blindSpots(windowStats(days));
    expect(spots[0].weekday).toBe(4);
    expect(spots[0].block).toBe('evening');
    expect(spots[0].surpriseRate).toBe(1);
  });

  it('stays silent until a pattern has actually repeated', () => {
    expect(blindSpots(windowStats(surprising(['2026-08-13'])))).toEqual([]);
  });

  it('omits windows the user predicts correctly', () => {
    const days = ['2026-07-23', '2026-07-30', '2026-08-06'].map((date) =>
      day(date, {
        forecast: { date, p: 0.8, forks: [{ block: 'evening', tag: 'unwind' }], madeAt: 0 },
        observation: { date, drank: true, forks: [fork()], resolvedAt: 1 },
      }),
    );
    expect(blindSpots(windowStats(days))).toEqual([]);
  });
});

describe('functionLoad', () => {
  it('ranks tags by how often they end in a drink', () => {
    const days = [
      day('2026-08-13', {
        observation: {
          date: '2026-08-13',
          drank: true,
          forks: [
            fork({ tag: 'sleep', choice: 'drank' }),
            fork({ tag: 'sleep', choice: 'drank' }),
            fork({ tag: 'boredom', choice: 'passed' }),
            fork({ tag: 'boredom', choice: 'passed' }),
            fork({ tag: 'boredom', choice: 'passed' }),
          ],
          resolvedAt: 1,
        },
      }),
    ];
    const load = functionLoad(days);
    expect(load[0]).toEqual({ tag: 'sleep', forks: 2, drank: 2 });
    expect(load[1]).toEqual({ tag: 'boredom', forks: 3, drank: 0 });
  });
});

describe('noticingRate', () => {
  it('separates forks caught live from ones reconstructed at night', () => {
    const days = [
      day('2026-08-13', {
        observation: {
          date: '2026-08-13',
          drank: true,
          forks: [
            fork({ loggedInMoment: true }),
            fork({ loggedInMoment: true }),
            fork({ loggedInMoment: false }),
            fork({ loggedInMoment: false }),
          ],
          resolvedAt: 1,
        },
      }),
    ];
    const rate = noticingRate(days);
    expect(rate.inMoment).toBe(2);
    expect(rate.total).toBe(4);
    expect(rate.rate).toBeCloseTo(0.5, 10);
  });

  it('is NaN before any fork has been recorded', () => {
    expect(noticingRate([]).rate).toBeNaN();
  });
});
