import { describe, expect, it } from 'vitest';
import { coverage, pickNextFact, recordExposure, type Exposure } from './rotation';
import { FACTS, type Fact } from './facts';
import { TRIVIA } from './trivia';

const fact = (id: string): Fact => ({ id, text: id, category: 'body' });
const corpus = ['a', 'b', 'c', 'd'].map(fact);
const first = () => 0; // deterministic: always the front of the window

describe('pickNextFact', () => {
  it('returns nothing for an empty corpus', () => {
    expect(pickNextFact([], [], [], first)).toBeUndefined();
  });

  it('prefers a line that has never been shown', () => {
    const exposures: Exposure[] = [
      { id: 'a', lastShownAt: 1, shows: 1 },
      { id: 'b', lastShownAt: 2, shows: 1 },
      { id: 'c', lastShownAt: 3, shows: 1 },
    ];
    expect(pickNextFact(corpus, exposures, [], first)?.id).toBe('d');
  });

  it('takes the least recently shown once everything has been seen equally', () => {
    const exposures: Exposure[] = [
      { id: 'a', lastShownAt: 500, shows: 1 },
      { id: 'b', lastShownAt: 100, shows: 1 },
      { id: 'c', lastShownAt: 900, shows: 1 },
      { id: 'd', lastShownAt: 300, shows: 1 },
    ];
    expect(pickNextFact(corpus, exposures, [], first)?.id).toBe('b');
  });

  it('deals every line before repeating any', () => {
    // The property that matters: a full pass over the corpus, no duplicates.
    let exposures: Exposure[] = [];
    const seen: string[] = [];
    for (let i = 0; i < corpus.length; i += 1) {
      const next = pickNextFact(corpus, exposures, seen, first)!;
      seen.push(next.id);
      exposures = recordExposure(exposures, next.id, i);
    }
    expect(new Set(seen).size).toBe(corpus.length);
  });

  it('skips lines already shown during this wait', () => {
    const picked = pickNextFact(corpus, [], ['a', 'b'], first);
    expect(['c', 'd']).toContain(picked!.id);
  });

  it('keeps going once the corpus runs out mid-wait', () => {
    // A long wait must not run out of things to read.
    const all = corpus.map((f) => f.id);
    expect(pickNextFact(corpus, [], all, first)).toBeDefined();
  });

  it('does not always return the same line from an unseen tier', () => {
    // Randomness inside the window is what stops the order becoming wallpaper.
    const wide = Array.from({ length: 20 }, (_, i) => fact(`f${i}`));
    const front = pickNextFact(wide, [], [], () => 0)!.id;
    const back = pickNextFact(wide, [], [], () => 0.99)!.id;
    expect(front).not.toBe(back);
  });

  it('stays inside the corpus even with a random value at the boundary', () => {
    expect(pickNextFact(corpus, [], [], () => 0.999999)).toBeDefined();
  });
});

describe('recordExposure', () => {
  it('creates an entry on first showing', () => {
    expect(recordExposure([], 'a', 7)).toEqual([{ id: 'a', lastShownAt: 7, shows: 1 }]);
  });

  it('increments without mutating the original', () => {
    const before: Exposure[] = [{ id: 'a', lastShownAt: 1, shows: 1 }];
    const after = recordExposure(before, 'a', 9);
    expect(before[0].shows).toBe(1);
    expect(after[0]).toEqual({ id: 'a', lastShownAt: 9, shows: 2 });
  });

  it('leaves other entries alone', () => {
    const before: Exposure[] = [{ id: 'a', lastShownAt: 1, shows: 1 }];
    expect(recordExposure(before, 'b', 2)).toHaveLength(2);
  });
});

describe('coverage', () => {
  it('is 0 before anything has been read and 1 after everything', () => {
    expect(coverage(corpus, [])).toBe(0);
    const all = corpus.map((f) => ({ id: f.id, lastShownAt: 1, shows: 1 }));
    expect(coverage(corpus, all)).toBe(1);
  });

  it('ignores exposures for lines no longer in the corpus', () => {
    const stale = [{ id: 'poistettu', lastShownAt: 1, shows: 3 }];
    expect(coverage(corpus, stale)).toBe(0);
  });
});

describe('the shipped corpus', () => {
  it('has no duplicate ids, since exposure is stored against them', () => {
    expect(new Set(FACTS.map((f) => f.id)).size).toBe(FACTS.length);
  });

  it('never addresses the reader about their own drinking', () => {
    // The house rule: every line describes alcohol, not the person holding the
    // phone. A verdict delivered mid-craving is a dose of shame.
    const accusing = FACTS.filter((f) => /\bsinun juomise|juomisesi|sinä juot|olet juonut/i.test(f.text));
    expect(accusing).toEqual([]);
  });

  it('balances harm with what recovers, so a craving is not met with a doom list', () => {
    const forward = FACTS.filter((f) => f.category === 'recovery' || f.category === 'craving');
    expect(forward.length / FACTS.length).toBeGreaterThan(0.25);
  });

  it('is long enough that a single wait cannot exhaust it', () => {
    // Ten minutes at roughly nine seconds a line is about seventy screens.
    expect(FACTS.length).toBeGreaterThanOrEqual(60);
  });
});

describe('randomness across a fresh corpus', () => {
  // The bug this covers: a fixed-size window off the front of an all-unseen
  // corpus made every draw come from the same handful of lines, so the stream
  // felt scripted rather than random.
  const fresh = Array.from({ length: 60 }, (_, i) => fact(`f${i}`));

  it('can reach the far end of an untouched corpus', () => {
    const last = pickNextFact(fresh, [], [], () => 0.999)!.id;
    expect(last).toBe('f59');
  });

  it('spreads first draws across the whole corpus, not one corner', () => {
    const drawn = new Set(
      Array.from({ length: 40 }, (_, i) => pickNextFact(fresh, [], [], () => i / 40)!.id),
    );
    // A front-window implementation could only ever produce eight distinct ids.
    expect(drawn.size).toBeGreaterThan(20);
  });

  it('still prefers genuinely older lines once timestamps differ', () => {
    const exposures = fresh.map((f, i) => ({ id: f.id, lastShownAt: i + 1, shows: 1 }));
    // Only the oldest few are eligible, so the newest can never come up first.
    const picks = Array.from({ length: 20 }, (_, i) => pickNextFact(fresh, exposures, [], () => i / 20)!.id);
    expect(picks).not.toContain('f59');
  });
});

describe('the trivia corpus', () => {
  it('has no duplicate ids', () => {
    expect(new Set(TRIVIA.map((t) => t.id)).size).toBe(TRIVIA.length);
  });

  it('never collides with an alcohol line id, since both share one exposure store', () => {
    const alcohol = new Set(FACTS.map((f) => f.id));
    expect(TRIVIA.filter((t) => alcohol.has(t.id))).toEqual([]);
  });

  it('is all one category, so it can be filtered in or out cleanly', () => {
    expect(TRIVIA.every((t) => t.category === 'trivia')).toBe(true);
  });

  it('is large enough that ordinary use does not cycle it in a day', () => {
    expect(TRIVIA.length).toBeGreaterThanOrEqual(120);
  });

  it('deals the combined corpus without repeating across both sources', () => {
    const pool = [...FACTS, ...TRIVIA];
    let exposures: Exposure[] = [];
    const seen: string[] = [];
    for (let i = 0; i < 80; i += 1) {
      const next = pickNextFact(pool, exposures, seen, () => 0.5)!;
      seen.push(next.id);
      exposures = recordExposure(exposures, next.id, i);
    }
    expect(new Set(seen).size).toBe(80);
  });
});
