import { describe, expect, it } from 'vitest';
import { close, extend, formatCountdown, isElapsed, isOpen, progress, remainingMs, targetMs } from './waiting';
import { DEFAULT_SETTINGS, type Episode } from './types';

const S = DEFAULT_SETTINGS;
const MIN = 60_000;
const T0 = 1_000_000;

const episode = (over: Partial<Episode> = {}): Episode => ({
  id: 'e1',
  startedAt: T0,
  demand: 'settle',
  waitedMs: 0,
  extensions: 0,
  outcome: 'unknown',
  ...over,
});

describe('targetMs', () => {
  it('is the base wait with no extensions', () => {
    expect(targetMs(episode(), S)).toBe(10 * MIN);
  });

  it('grows by one extension at a time', () => {
    expect(targetMs(episode({ extensions: 2 }), S)).toBe(20 * MIN);
  });
});

describe('remainingMs', () => {
  it('counts down', () => {
    expect(remainingMs(episode(), T0 + 4 * MIN, S)).toBe(6 * MIN);
  });

  it('floors at zero rather than going negative', () => {
    expect(remainingMs(episode(), T0 + 99 * MIN, S)).toBe(0);
  });

  it('accounts for an extension taken mid-wait', () => {
    const extended = extend(episode());
    expect(remainingMs(extended, T0 + 9 * MIN, S)).toBe(6 * MIN);
  });

  it('is the full wait at the moment it starts', () => {
    expect(remainingMs(episode(), T0, S)).toBe(10 * MIN);
  });
});

describe('progress', () => {
  it('is 0 at the start and 1 at the end', () => {
    expect(progress(episode(), T0, S)).toBe(0);
    expect(progress(episode(), T0 + 10 * MIN, S)).toBe(1);
  });

  it('does not overshoot when the phone was left alone', () => {
    // A backgrounded tab can resume hours later; the ring must not exceed full.
    expect(progress(episode(), T0 + 300 * MIN, S)).toBe(1);
  });

  it('does not go negative if the clock steps backwards', () => {
    expect(progress(episode(), T0 - 5 * MIN, S)).toBe(0);
  });

  it('is halfway at half the target', () => {
    expect(progress(episode(), T0 + 5 * MIN, S)).toBeCloseTo(0.5, 10);
  });
});

describe('isElapsed', () => {
  it('is false while time remains and true after', () => {
    expect(isElapsed(episode(), T0 + 9 * MIN, S)).toBe(false);
    expect(isElapsed(episode(), T0 + 10 * MIN, S)).toBe(true);
  });

  it('becomes false again after an extension', () => {
    const extended = extend(episode());
    expect(isElapsed(extended, T0 + 10 * MIN, S)).toBe(false);
  });
});

describe('extend', () => {
  it('has no upper limit, because holding on is the point', () => {
    let e = episode();
    for (let i = 0; i < 6; i += 1) e = extend(e);
    expect(e.extensions).toBe(6);
    expect(targetMs(e, S)).toBe(40 * MIN);
  });

  it('does not mutate the episode it was given', () => {
    const original = episode();
    extend(original);
    expect(original.extensions).toBe(0);
  });
});

describe('close', () => {
  it('records how long the wait actually ran', () => {
    const done = close(episode(), 'passed', T0 + 7 * MIN, S);
    expect(done.outcome).toBe('passed');
    expect(done.waitedMs).toBe(7 * MIN);
    expect(done.endedAt).toBe(T0 + 7 * MIN);
  });

  it('caps the wait at the target, so a pocketed phone is not willpower', () => {
    const done = close(episode(), 'passed', T0 + 300 * MIN, S);
    expect(done.waitedMs).toBe(10 * MIN);
  });

  it('records taking a drink exactly like anything else', () => {
    const done = close(episode(), 'took', T0 + 3 * MIN, S);
    expect(done.outcome).toBe('took');
    expect(done.waitedMs).toBe(3 * MIN);
  });

  it('never records a negative wait', () => {
    expect(close(episode(), 'took', T0 - MIN, S).waitedMs).toBe(0);
  });
});

describe('isOpen', () => {
  it('is true until the episode is closed', () => {
    expect(isOpen(episode())).toBe(true);
    expect(isOpen(close(episode(), 'passed', T0 + MIN, S))).toBe(false);
  });
});

describe('formatCountdown', () => {
  it('pads seconds so the width never jumps', () => {
    expect(formatCountdown(9 * MIN + 5000)).toBe('9:05');
  });

  it('shows zero cleanly', () => {
    expect(formatCountdown(0)).toBe('0:00');
  });

  it('rounds up, so 1 ms left still reads as a second', () => {
    expect(formatCountdown(1)).toBe('0:01');
  });

  it('treats negative time as zero', () => {
    expect(formatCountdown(-5000)).toBe('0:00');
  });

  it('handles waits past ten minutes', () => {
    expect(formatCountdown(25 * MIN)).toBe('25:00');
  });
});
