import { describe, expect, it } from 'vitest';
import { breathAt, circleScale, cycleSeconds, type BreathPattern } from './breathing';

const box: BreathPattern = {
  id: 'box',
  name: 'Laatikko',
  phases: [
    { kind: 'in', seconds: 4 },
    { kind: 'hold', seconds: 4 },
    { kind: 'out', seconds: 4 },
    { kind: 'hold', seconds: 4 },
  ],
};

const longExhale: BreathPattern = {
  id: 'long',
  name: 'Pitkä ulos',
  phases: [
    { kind: 'in', seconds: 4 },
    { kind: 'out', seconds: 6 },
  ],
};

describe('cycleSeconds', () => {
  it('sums the phases', () => {
    expect(cycleSeconds(box)).toBe(16);
    expect(cycleSeconds(longExhale)).toBe(10);
  });

  it('ignores negative lengths rather than shortening the cycle', () => {
    expect(cycleSeconds({ id: 'x', name: 'x', phases: [{ kind: 'in', seconds: -3 }] })).toBe(0);
  });
});

describe('breathAt', () => {
  it('starts at the beginning of the first phase', () => {
    const s = breathAt(box, 0)!;
    expect(s.phase.kind).toBe('in');
    expect(s.progress).toBe(0);
    expect(s.cycle).toBe(0);
  });

  it('counts the remaining seconds the way a person would say them', () => {
    // Four seconds of inhale reads 4, 3, 2, 1 — never 0.
    expect(breathAt(box, 0)!.remaining).toBe(4);
    expect(breathAt(box, 3_500)!.remaining).toBe(1);
  });

  it('moves to the next phase exactly on the boundary', () => {
    expect(breathAt(box, 3_999)!.phase.kind).toBe('in');
    expect(breathAt(box, 4_000)!.phase.kind).toBe('hold');
    expect(breathAt(box, 4_000)!.index).toBe(1);
  });

  it('is halfway through a phase at its midpoint', () => {
    expect(breathAt(box, 6_000)!.progress).toBeCloseTo(0.5, 10);
  });

  it('wraps into the next cycle', () => {
    const s = breathAt(box, 16_000)!;
    expect(s.phase.kind).toBe('in');
    expect(s.cycle).toBe(1);
  });

  it('counts cycles over a long wait', () => {
    expect(breathAt(box, 16_000 * 7 + 500)!.cycle).toBe(7);
  });

  it('handles an uneven pattern', () => {
    expect(breathAt(longExhale, 5_000)!.phase.kind).toBe('out');
    expect(breathAt(longExhale, 5_000)!.remaining).toBe(5);
  });

  it('treats a negative clock as the start rather than throwing', () => {
    expect(breathAt(box, -5_000)!.phase.kind).toBe('in');
  });

  it('skips zero-length phases instead of stalling on them', () => {
    const withEmpty: BreathPattern = {
      id: 'e',
      name: 'e',
      phases: [
        { kind: 'in', seconds: 4 },
        { kind: 'hold', seconds: 0 },
        { kind: 'out', seconds: 4 },
      ],
    };
    expect(breathAt(withEmpty, 4_100)!.phase.kind).toBe('out');
  });

  it('returns nothing for a pattern with no usable phase', () => {
    expect(breathAt({ id: 'z', name: 'z', phases: [{ kind: 'in', seconds: 0 }] }, 0)).toBeUndefined();
  });
});

describe('circleScale', () => {
  it('grows through the inhale and shrinks through the exhale', () => {
    expect(circleScale(longExhale, breathAt(longExhale, 0)!)).toBeCloseTo(0, 10);
    expect(circleScale(longExhale, breathAt(longExhale, 2_000)!)).toBeCloseTo(0.5, 10);
    expect(circleScale(longExhale, breathAt(longExhale, 4_000)!)).toBeCloseTo(1, 10);
    expect(circleScale(longExhale, breathAt(longExhale, 7_000)!)).toBeCloseTo(0.5, 10);
  });

  it('holds full after an inhale', () => {
    expect(circleScale(box, breathAt(box, 5_000)!)).toBe(1);
  });

  it('holds empty after an exhale', () => {
    // The second hold in a box pattern follows the exhale.
    expect(circleScale(box, breathAt(box, 13_000)!)).toBe(0);
  });

  it('starts empty when a pattern opens with a hold', () => {
    const oddball: BreathPattern = {
      id: 'o',
      name: 'o',
      phases: [
        { kind: 'hold', seconds: 2 },
        { kind: 'in', seconds: 4 },
      ],
    };
    expect(circleScale(oddball, breathAt(oddball, 500)!)).toBe(0);
  });
});
