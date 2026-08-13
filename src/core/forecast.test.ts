import { describe, expect, it } from 'vitest';
import {
  brierScore,
  calibrationBias,
  calibrationBins,
  decompose,
  engagementStreak,
  forecastSpread,
  referenceBrier,
  type ScoredForecast,
} from './forecast';

const rows = (...pairs: [number, 0 | 1][]): ScoredForecast[] =>
  pairs.map(([p, outcome]) => ({ p, outcome }));

describe('brierScore', () => {
  it('is 0 for a perfect forecaster', () => {
    expect(brierScore(rows([1, 1], [0, 0], [1, 1]))).toBe(0);
  });

  it('is 1 for a perfectly wrong forecaster', () => {
    expect(brierScore(rows([0, 1], [1, 0]))).toBe(1);
  });

  it('is 0.25 for a forecaster who always says 50 %', () => {
    expect(brierScore(rows([0.5, 1], [0.5, 0]))).toBe(0.25);
  });

  it('clamps out-of-range probabilities rather than producing scores above 1', () => {
    expect(brierScore(rows([1.4, 1]))).toBe(0);
  });

  it('is NaN with no data', () => {
    expect(brierScore([])).toBeNaN();
  });
});

describe('referenceBrier', () => {
  it('equals the variance of the outcome', () => {
    // Base rate 0.5 -> 0.5 * 0.5.
    expect(referenceBrier(rows([0.9, 1], [0.1, 0]))).toBeCloseTo(0.25, 10);
  });

  it('is 0 when behaviour never varies', () => {
    expect(referenceBrier(rows([0.3, 1], [0.7, 1]))).toBe(0);
  });
});

describe('decompose', () => {
  it('gives a perfect forecaster zero reliability and full resolution', () => {
    const d = decompose(rows([1, 1], [1, 1], [0, 0], [0, 0]));
    expect(d.brier).toBe(0);
    expect(d.reliability).toBeCloseTo(0, 10);
    // With BS = 0 the decomposition forces resolution to equal uncertainty.
    expect(d.resolution).toBeCloseTo(d.uncertainty, 10);
    expect(d.skillScore).toBe(1);
  });

  it('gives a base-rate forecaster zero resolution and zero skill', () => {
    // Always predicts 0.5; drinks half the time.
    const d = decompose(rows([0.5, 1], [0.5, 0], [0.5, 1], [0.5, 0]));
    expect(d.resolution).toBeCloseTo(0, 10);
    expect(d.skillScore).toBeCloseTo(0, 10);
  });

  it('scores a correctly predicted drinking day as well as a dry one', () => {
    // The product claim, as a test: outcomes differ, forecast quality does not.
    const wet = decompose(rows([0.9, 1], [0.9, 1], [0.1, 0], [0.1, 0]));
    const dry = decompose(rows([0.1, 0], [0.1, 0], [0.9, 1], [0.9, 1]));
    expect(wet.brier).toBeCloseTo(dry.brier, 10);
    expect(wet.skillScore).toBeCloseTo(dry.skillScore, 10);
  });

  it('reconstructs the Brier score from its parts when forecasts sit on bin means', () => {
    const d = decompose(rows([0.9, 1], [0.9, 0], [0.1, 0], [0.1, 0], [0.9, 1]));
    expect(d.reliability - d.resolution + d.uncertainty).toBeCloseTo(d.brier, 10);
  });

  it('reports no skill instead of dividing by zero when behaviour never varies', () => {
    const d = decompose(rows([0.8, 1], [0.6, 1]));
    expect(d.uncertainty).toBe(0);
    expect(Number.isFinite(d.skillScore)).toBe(true);
    expect(d.skillScore).toBe(0);
  });

  it('returns NaNs rather than throwing on an empty history', () => {
    const d = decompose([]);
    expect(d.n).toBe(0);
    expect(d.brier).toBeNaN();
  });
});

describe('calibrationBins', () => {
  it('places p = 1 in the top bin', () => {
    const bins = calibrationBins(rows([1, 1]), 10);
    expect(bins[9].n).toBe(1);
  });

  it('reports observed frequency per bin', () => {
    const bins = calibrationBins(rows([0.75, 1], [0.72, 0], [0.71, 1], [0.79, 1]), 10);
    const bin = bins[7];
    expect(bin.n).toBe(4);
    expect(bin.observedRate).toBeCloseTo(0.75, 10);
  });

  it('leaves empty bins as NaN rather than 0, so they read as absent not perfect', () => {
    const bins = calibrationBins(rows([0.05, 0]), 10);
    expect(bins[5].n).toBe(0);
    expect(bins[5].observedRate).toBeNaN();
  });
});

describe('calibrationBias', () => {
  it('is negative when the user underestimates their own risk', () => {
    expect(calibrationBias(rows([0.2, 1], [0.2, 1], [0.2, 0]))).toBeLessThan(0);
  });

  it('is near zero for a calibrated user', () => {
    expect(calibrationBias(rows([0.5, 1], [0.5, 0]))).toBeCloseTo(0, 10);
  });
});

describe('forecastSpread', () => {
  it('is 0 for a user issuing one flat number every day', () => {
    expect(forecastSpread(rows([0.4, 1], [0.4, 0], [0.4, 1]))).toBeCloseTo(0, 10);
  });

  it('rises once forecasts start distinguishing days', () => {
    expect(forecastSpread(rows([0.9, 1], [0.1, 0]))).toBeGreaterThan(0.3);
  });
});

describe('engagementStreak', () => {
  it('counts back from today when today is already resolved', () => {
    const dates = new Set(['2026-08-13', '2026-08-12', '2026-08-11']);
    expect(engagementStreak(dates, '2026-08-13')).toBe(3);
  });

  it('does not zero the run while today is still open', () => {
    const dates = new Set(['2026-08-12', '2026-08-11']);
    expect(engagementStreak(dates, '2026-08-13')).toBe(2);
  });

  it('breaks on a skipped day', () => {
    const dates = new Set(['2026-08-13', '2026-08-11', '2026-08-10']);
    expect(engagementStreak(dates, '2026-08-13')).toBe(1);
  });

  it('survives drinking, because drinking is not what it measures', () => {
    // The streak's input is engagement only; outcomes never reach it.
    const dates = new Set(['2026-08-13', '2026-08-12']);
    expect(engagementStreak(dates, '2026-08-13')).toBe(2);
  });

  it('crosses a month boundary', () => {
    const dates = new Set(['2026-08-01', '2026-07-31', '2026-07-30']);
    expect(engagementStreak(dates, '2026-08-01')).toBe(3);
  });

  it('is 0 with no history', () => {
    expect(engagementStreak(new Set(), '2026-08-13')).toBe(0);
  });
});
