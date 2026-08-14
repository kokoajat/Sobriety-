import { describe, expect, it } from 'vitest';
import {
  MIN_SAMPLE,
  byDemand,
  bySituation,
  medianTimeToPassMs,
  outcomeCounts,
  pickSupply,
  rankSupplies,
  recordAttempt,
} from './stats';
import type { SituationKey } from './situations';
import type { Episode, Outcome, Supply } from './types';

const MIN = 60_000;

const ep = (outcome: Outcome, waitedMs = 5 * MIN, demand = 'settle'): Episode => ({
  id: Math.random().toString(),
  startedAt: 0,
  demand,
  waitedMs,
  extensions: 0,
  outcome,
  endedAt: 1,
});

const open = (): Episode => ({
  id: 'open',
  startedAt: 0,
  demand: 'settle',
  waitedMs: 0,
  extensions: 0,
  outcome: 'unknown',
});

const supply = (
  id: string,
  demands: string[],
  outcomes: { demand: string; helped: boolean }[] = [],
): Supply => ({
  id,
  label: id,
  demands,
  createdAt: 0,
  attempts: outcomes.map((o, i) => ({ at: i, ...o })),
});

describe('outcomeCounts', () => {
  it('counts each outcome separately', () => {
    const c = outcomeCounts([ep('passed'), ep('passed'), ep('took'), ep('unknown')]);
    expect(c).toMatchObject({ passed: 2, took: 1, unknown: 1, closed: 4 });
  });

  it('ignores an episode still running', () => {
    expect(outcomeCounts([open()]).closed).toBe(0);
  });

  it('withholds the rate below the minimum sample', () => {
    expect(outcomeCounts([ep('passed'), ep('took')]).passRate).toBeNaN();
  });

  it('reports the rate once there is enough to report', () => {
    const episodes = [...Array(4)].map(() => ep('passed')).concat(ep('took'));
    expect(outcomeCounts(episodes).passRate).toBeCloseTo(0.8, 10);
  });

  it('leaves unreported urges out of the denominator entirely', () => {
    // Five decided plus a pile of unknowns must not dilute the rate.
    const episodes = [
      ...[...Array(4)].map(() => ep('passed')),
      ep('took'),
      ...[...Array(10)].map(() => ep('unknown')),
    ];
    expect(outcomeCounts(episodes).passRate).toBeCloseTo(0.8, 10);
  });
});

describe('medianTimeToPassMs', () => {
  it('is NaN until there is a real sample', () => {
    expect(medianTimeToPassMs([ep('passed'), ep('passed')])).toBeNaN();
  });

  it('uses only the urges that passed', () => {
    const episodes = [
      ep('passed', 4 * MIN),
      ep('passed', 5 * MIN),
      ep('passed', 6 * MIN),
      ep('passed', 7 * MIN),
      ep('passed', 8 * MIN),
      ep('took', 30 * MIN),
    ];
    expect(medianTimeToPassMs(episodes)).toBe(6 * MIN);
  });

  it('is not dragged by one very long hold', () => {
    const episodes = [
      ep('passed', 2 * MIN),
      ep('passed', 3 * MIN),
      ep('passed', 4 * MIN),
      ep('passed', 5 * MIN),
      ep('passed', 40 * MIN),
    ];
    expect(medianTimeToPassMs(episodes)).toBe(4 * MIN);
  });

  it('requires at least the minimum sample, whatever that is set to', () => {
    const episodes = [...Array(MIN_SAMPLE - 1)].map(() => ep('passed'));
    expect(medianTimeToPassMs(episodes)).toBeNaN();
  });
});

describe('byDemand', () => {
  it('ranks needs by how often they come up', () => {
    const episodes = [
      ep('passed', 5 * MIN, 'sleep'),
      ep('took', 5 * MIN, 'settle'),
      ep('took', 5 * MIN, 'settle'),
      ep('passed', 5 * MIN, 'settle'),
    ];
    const rows = byDemand(episodes);
    expect(rows[0]).toMatchObject({ demand: 'settle', episodes: 3, passed: 1, took: 2 });
    expect(rows[1]).toMatchObject({ demand: 'sleep', episodes: 1 });
  });

  it('withholds a per-need rate that rests on too little', () => {
    expect(byDemand([ep('passed', 5 * MIN, 'sleep')])[0].passRate).toBeNaN();
  });
});

describe('rankSupplies', () => {
  it('only offers what the user prepared for this need', () => {
    const supplies = [supply('kävely', ['settle']), supply('soitto', ['company'])];
    expect(rankSupplies(supplies, 'settle').map((r) => r.supply.id)).toEqual(['kävely']);
  });

  it('skips archived options', () => {
    const s = { ...supply('vanha', ['settle']), archived: true };
    expect(rankSupplies([s], 'settle')).toEqual([]);
  });

  it('scores only the attempts made for this need', () => {
    // Helped for sleeping, failed for settling: settling must see the failure.
    const s = supply('tee', ['settle', 'sleep'], [
      { demand: 'sleep', helped: true },
      { demand: 'settle', helped: false },
    ]);
    expect(rankSupplies([s], 'settle')[0]).toMatchObject({ attempts: 1, helped: 0 });
    expect(rankSupplies([s], 'sleep')[0]).toMatchObject({ attempts: 1, helped: 1 });
  });

  it('puts a proven option ahead of a failing one', () => {
    const supplies = [
      supply('ei-toimi', ['settle'], [
        { demand: 'settle', helped: false },
        { demand: 'settle', helped: false },
      ]),
      supply('toimii', ['settle'], [
        { demand: 'settle', helped: true },
        { demand: 'settle', helped: true },
      ]),
    ];
    expect(rankSupplies(supplies, 'settle')[0].supply.id).toBe('toimii');
  });

  it('keeps an untested option ahead of a repeatedly failed one', () => {
    const supplies = [
      supply('floppasi', ['settle'], [
        { demand: 'settle', helped: false },
        { demand: 'settle', helped: false },
      ]),
      supply('uusi', ['settle']),
    ];
    expect(rankSupplies(supplies, 'settle')[0].supply.id).toBe('uusi');
  });

  it('enters an untested option at even odds', () => {
    expect(rankSupplies([supply('uusi', ['settle'])], 'settle')[0].score).toBeCloseTo(0.5, 10);
  });
});

describe('pickSupply', () => {
  const supplies = [
    supply('todistettu', ['settle'], [
      { demand: 'settle', helped: true },
      { demand: 'settle', helped: true },
      { demand: 'settle', helped: true },
    ]),
    supply('uusi', ['settle']),
  ];

  it('offers the best known option most of the time', () => {
    expect(pickSupply(supplies, 'settle', () => 0.9)!.supply.id).toBe('todistettu');
  });

  it('sometimes offers an untried one instead', () => {
    expect(pickSupply(supplies, 'settle', () => 0)!.supply.id).toBe('uusi');
  });

  it('does not explore when everything has been tried', () => {
    const tried = [
      supply('a', ['settle'], [{ demand: 'settle', helped: true }]),
      supply('b', ['settle'], [{ demand: 'settle', helped: false }]),
    ];
    expect(pickSupply(tried, 'settle', () => 0)!.supply.id).toBe('a');
  });

  it('returns nothing when the user has prepared nothing for this need', () => {
    expect(pickSupply(supplies, 'sleep', () => 0.5)).toBeUndefined();
  });
});

describe('recordAttempt', () => {
  it('appends without mutating', () => {
    const supplies = [supply('kävely', ['settle'])];
    const next = recordAttempt(supplies, 'kävely', 'settle', true, 7);
    expect(supplies[0].attempts).toEqual([]);
    expect(next[0].attempts).toEqual([{ at: 7, demand: 'settle', helped: true }]);
  });

  it('records which need it was tried for, not just that it was tried', () => {
    const next = recordAttempt([supply('tee', ['settle', 'sleep'])], 'tee', 'sleep', false, 1);
    expect(next[0].attempts[0].demand).toBe('sleep');
  });

  it('leaves other supplies untouched', () => {
    const supplies = [supply('a', ['settle']), supply('b', ['settle'])];
    expect(recordAttempt(supplies, 'a', 'settle', true)[1]).toBe(supplies[1]);
  });
});

describe('bySituation', () => {
  const at = (situation?: SituationKey, i = 0): Episode => ({
    id: `e${i}-${situation ?? 'none'}`,
    startedAt: i,
    demand: 'settle',
    waitedMs: 0,
    extensions: 0,
    outcome: 'passed',
    endedAt: i + 1,
    situation,
  });

  it('withholds the whole table below the sample floor', () => {
    // "Your one urge was in the kitchen" is anecdote wearing a table's clothes.
    const few = Array.from({ length: MIN_SAMPLE - 1 }, (_, i) => at('home-alone', i));
    expect(bySituation(few)).toEqual([]);
  });

  it('counts places once there are enough of them', () => {
    const many = Array.from({ length: MIN_SAMPLE }, (_, i) => at('home-alone', i));
    expect(bySituation(many)).toEqual([{ situation: 'home-alone', episodes: MIN_SAMPLE }]);
  });

  it('puts the most frequent place first, which is the actionable row', () => {
    const episodes = [
      ...Array.from({ length: 4 }, (_, i) => at('bed', i)),
      ...Array.from({ length: 6 }, (_, i) => at('home-alone', i + 10)),
    ];
    expect(bySituation(episodes).map((r) => r.situation)).toEqual(['home-alone', 'bed']);
  });

  it('ignores episodes where the user never said, without dropping the rest', () => {
    const episodes = [
      ...Array.from({ length: MIN_SAMPLE }, (_, i) => at('out', i)),
      ...Array.from({ length: 20 }, (_, i) => at(undefined, i + 100)),
    ];
    expect(bySituation(episodes)).toEqual([{ situation: 'out', episodes: MIN_SAMPLE }]);
  });

  it('does not reach the floor on unlocated episodes alone', () => {
    const episodes = Array.from({ length: 30 }, (_, i) => at(undefined, i));
    expect(bySituation(episodes)).toEqual([]);
  });

  it('is a stable order when two places tie', () => {
    const episodes = [
      ...Array.from({ length: 3 }, (_, i) => at('out', i)),
      ...Array.from({ length: 3 }, (_, i) => at('bed', i + 10)),
    ];
    expect(bySituation(episodes).map((r) => r.situation)).toEqual(['bed', 'out']);
  });
});
