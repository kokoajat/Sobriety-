import { describe, expect, it } from 'vitest';
import { pickForFork, rankAlternatives, recordAttempt } from './substitution';
import type { Alternative, FunctionTag } from './types';

const alt = (
  id: string,
  tags: FunctionTag[],
  outcomes: boolean[] = [],
  over: Partial<Alternative> = {},
): Alternative => ({
  id,
  label: id,
  tags,
  attempts: outcomes.map((worked, i) => ({ at: i, worked })),
  ...over,
});

describe('rankAlternatives', () => {
  it('only returns options the user tagged for this function', () => {
    const alts = [alt('kavely', ['unwind']), alt('soitto', ['social'])];
    expect(rankAlternatives(alts, 'unwind').map((r) => r.alternative.id)).toEqual(['kavely']);
  });

  it('excludes archived options', () => {
    const alts = [alt('vanha', ['unwind'], [true], { archived: true })];
    expect(rankAlternatives(alts, 'unwind')).toEqual([]);
  });

  it('ranks a proven option above a failing one', () => {
    const alts = [
      alt('epaonnistuu', ['unwind'], [false, false, false]),
      alt('toimii', ['unwind'], [true, true, true]),
    ];
    expect(rankAlternatives(alts, 'unwind')[0].alternative.id).toBe('toimii');
  });

  it('enters an untested option at 0.5 so it stays in contention', () => {
    const ranked = rankAlternatives([alt('uusi', ['unwind'])], 'unwind');
    expect(ranked[0].score).toBeCloseTo(0.5, 10);
    expect(ranked[0].untested).toBe(true);
  });

  it('keeps an untested option ahead of a repeatedly failed one', () => {
    const alts = [alt('flopannut', ['unwind'], [false, false]), alt('uusi', ['unwind'])];
    expect(rankAlternatives(alts, 'unwind')[0].alternative.id).toBe('uusi');
  });

  it('discounts a single lucky success in the confidence floor', () => {
    const alts = [alt('kerran', ['unwind'], [true]), alt('moneen', ['unwind'], [true, true, true, true])];
    const ranked = rankAlternatives(alts, 'unwind');
    const once = ranked.find((r) => r.alternative.id === 'kerran')!;
    const many = ranked.find((r) => r.alternative.id === 'moneen')!;
    expect(once.confidenceFloor).toBeLessThan(many.confidenceFloor);
  });

  it('breaks score ties toward the better-evidenced option', () => {
    const alts = [alt('ohut', ['unwind'], [true, false]), alt('paksu', ['unwind'], [true, true, false, false])];
    expect(rankAlternatives(alts, 'unwind')[0].alternative.id).toBe('paksu');
  });
});

describe('pickForFork', () => {
  const alts = [alt('todistettu', ['unwind'], [true, true, true]), alt('uusi', ['unwind'])];

  it('returns the best-known option when not exploring', () => {
    expect(pickForFork(alts, 'unwind', () => 0.99)!.alternative.id).toBe('todistettu');
  });

  it('occasionally offers an untested option instead', () => {
    expect(pickForFork(alts, 'unwind', () => 0.0)!.alternative.id).toBe('uusi');
  });

  it('does not explore when everything has been tried', () => {
    const tried = [alt('a', ['unwind'], [true]), alt('b', ['unwind'], [false])];
    expect(pickForFork(tried, 'unwind', () => 0.0)!.alternative.id).toBe('a');
  });

  it('returns nothing when the user has no option for this function yet', () => {
    expect(pickForFork(alts, 'sleep', () => 0.5)).toBeUndefined();
  });
});

describe('recordAttempt', () => {
  it('appends without mutating the input', () => {
    const alts = [alt('kavely', ['unwind'])];
    const next = recordAttempt(alts, 'kavely', true, 123);
    expect(alts[0].attempts).toEqual([]);
    expect(next[0].attempts).toEqual([{ at: 123, worked: true }]);
  });

  it('leaves other options untouched', () => {
    const alts = [alt('a', ['unwind']), alt('b', ['unwind'])];
    const next = recordAttempt(alts, 'a', false, 1);
    expect(next[1]).toBe(alts[1]);
  });
});
