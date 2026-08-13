/**
 * Forecast scoring.
 *
 * This module is the product. Everything the user sees as "progress" is computed
 * here, and none of it rewards abstinence: a day spent drinking, correctly
 * predicted, improves every number below. That is deliberate. The claim the app
 * makes is that an accurate self-model is upstream of behaviour change, and that
 * it is the only target a drinking person can reliably hit today.
 *
 * The scoring is the Brier score and its Murphy (1973) decomposition, which
 * happens to split into three parts with direct human meanings:
 *
 *   BS = reliability - resolution + uncertainty
 *
 *   reliability  how well-calibrated you are: when you say 70 %, does it happen
 *                70 % of the time? Lower is better.
 *   resolution   how well you separate high-risk days from low-risk days.
 *                Higher is better. This is the number that grows as a self-model
 *                forms; a person who says "50 %" every day scores zero.
 *   uncertainty  the variance of your own behaviour. Not skill — you cannot
 *                improve it by forecasting better, only by changing.
 */

export interface ScoredForecast {
  /** Predicted probability of drinking, 0..1. */
  p: number;
  /** What happened: 1 drank, 0 did not. */
  outcome: 0 | 1;
}

export interface Decomposition {
  /** Mean squared error of the forecasts, 0..1, lower is better. */
  brier: number;
  reliability: number;
  resolution: number;
  uncertainty: number;
  /**
   * 1 - brier/brierReference, where the reference always forecasts the base
   * rate. Positive means the forecasts carry information beyond "how often I
   * usually drink". Zero means they carry none, negative means they mislead.
   */
  skillScore: number;
  /** Share of days on which drinking occurred. */
  baseRate: number;
  n: number;
}

export interface CalibrationBin {
  /** Bin lower edge, inclusive. */
  from: number;
  /** Bin upper edge, exclusive (inclusive for the top bin). */
  to: number;
  n: number;
  /** Mean forecast within the bin. */
  meanForecast: number;
  /** Observed frequency within the bin. */
  observedRate: number;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

export function brierScore(rows: ScoredForecast[]): number {
  if (rows.length === 0) return NaN;
  const sum = rows.reduce((acc, r) => acc + (clamp01(r.p) - r.outcome) ** 2, 0);
  return sum / rows.length;
}

export function baseRate(rows: ScoredForecast[]): number {
  if (rows.length === 0) return NaN;
  return rows.reduce((acc, r) => acc + r.outcome, 0) / rows.length;
}

/**
 * Brier score of the reference forecaster, which predicts the observed base rate
 * every single day. Beating it is the bar for "I know something about myself
 * beyond my own average".
 */
export function referenceBrier(rows: ScoredForecast[]): number {
  if (rows.length === 0) return NaN;
  const b = baseRate(rows);
  return b * (1 - b);
}

/**
 * Assign forecasts to equal-width probability bins. The top bin is closed so
 * that p = 1 lands in it rather than falling off the end.
 */
export function calibrationBins(rows: ScoredForecast[], binCount = 10): CalibrationBin[] {
  const width = 1 / binCount;
  const buckets: ScoredForecast[][] = Array.from({ length: binCount }, () => []);

  for (const row of rows) {
    const p = clamp01(row.p);
    const idx = Math.min(binCount - 1, Math.floor(p / width));
    buckets[idx].push({ p, outcome: row.outcome });
  }

  return buckets.map((bucket, i) => ({
    from: i * width,
    to: (i + 1) * width,
    n: bucket.length,
    meanForecast: bucket.length ? bucket.reduce((a, r) => a + r.p, 0) / bucket.length : NaN,
    observedRate: bucket.length ? bucket.reduce((a, r) => a + r.outcome, 0) / bucket.length : NaN,
  }));
}

/**
 * Murphy decomposition over binned forecasts.
 *
 * Note that reliability - resolution + uncertainty reconstructs the Brier score
 * only up to within-bin forecast spread; with finite bins the identity is
 * approximate. `brier` is always the exact score, never the reconstruction, so
 * the headline number the user sees is not an artefact of the binning.
 */
export function decompose(rows: ScoredForecast[], binCount = 10): Decomposition {
  const n = rows.length;
  if (n === 0) {
    return {
      brier: NaN,
      reliability: NaN,
      resolution: NaN,
      uncertainty: NaN,
      skillScore: NaN,
      baseRate: NaN,
      n: 0,
    };
  }

  const overall = baseRate(rows);
  const bins = calibrationBins(rows, binCount).filter((b) => b.n > 0);

  let reliability = 0;
  let resolution = 0;
  for (const bin of bins) {
    reliability += (bin.n * (bin.meanForecast - bin.observedRate) ** 2) / n;
    resolution += (bin.n * (bin.observedRate - overall) ** 2) / n;
  }

  const uncertainty = overall * (1 - overall);
  const brier = brierScore(rows);
  const ref = referenceBrier(rows);

  return {
    brier,
    reliability,
    resolution,
    uncertainty,
    // A user who has never varied their behaviour has an undefined reference;
    // report no skill rather than dividing by zero.
    skillScore: ref === 0 ? 0 : 1 - brier / ref,
    baseRate: overall,
    n,
  };
}

/**
 * Signed calibration bias. Negative means the user systematically underestimates
 * their own risk, which is the direction that matters clinically — it is the
 * blind spot, not a scoring error.
 */
export function calibrationBias(rows: ScoredForecast[]): number {
  if (rows.length === 0) return NaN;
  const meanForecast = rows.reduce((a, r) => a + clamp01(r.p), 0) / rows.length;
  return meanForecast - baseRate(rows);
}

/**
 * Spread of the forecasts themselves. Near zero means the user is issuing one
 * flat number regardless of the day — the signature of an absent self-model,
 * and the first thing worth surfacing to a new user.
 */
export function forecastSpread(rows: ScoredForecast[]): number {
  if (rows.length < 2) return NaN;
  const mean = rows.reduce((a, r) => a + clamp01(r.p), 0) / rows.length;
  const variance = rows.reduce((a, r) => a + (clamp01(r.p) - mean) ** 2, 0) / rows.length;
  return Math.sqrt(variance);
}

/**
 * A day counts as engaged when the user both forecast it and resolved it —
 * regardless of what they drank. This is the only streak in the app, and
 * drinking cannot break it. Marlatt's abstinence violation effect is a property
 * of streaks that *can* break, so the counter is built to be unbreakable by the
 * behaviour it observes.
 */
export function engagementStreak(engagedDates: Set<string>, today: string): number {
  let streak = 0;
  const cursor = new Date(`${today}T12:00:00`);

  // Today only counts once resolved; an unresolved today must not zero a run.
  if (!engagedDates.has(today)) cursor.setDate(cursor.getDate() - 1);

  for (;;) {
    // Local formatting, not toISOString: east of UTC+12 the UTC date is already
    // tomorrow at local noon, which would skip a day out of the run.
    const key = [
      cursor.getFullYear(),
      String(cursor.getMonth() + 1).padStart(2, '0'),
      String(cursor.getDate()).padStart(2, '0'),
    ].join('-');
    if (!engagedDates.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
