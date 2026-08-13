/**
 * Domain model.
 *
 * The central inversion: nothing here scores whether the user drank. Drinking is
 * an *outcome to be predicted*, not a verdict to be handed down. Every score in
 * `forecast.ts` measures the quality of the user's self-model, which is a target
 * they can hit on a day they drink.
 */

/** ISO date, `YYYY-MM-DD`, in the user's local timezone. */
export type DateKey = string;

/**
 * The job the drink is hired to do. Drinking is not the problem, it is the
 * current solution to one of these, so the app tracks the demand rather than
 * the consumption.
 */
export type FunctionTag =
  | 'unwind' // siirtymä työstä vapaalle
  | 'social' // sosiaalinen jännitys
  | 'sleep' // nukahtaminen
  | 'boredom' // tyhjä ilta
  | 'numb' // tunteen vaimentaminen
  | 'celebrate' // palkinto, juhla
  | 'ritual' // tapa, käsi tekee itsestään
  | 'craving'; // pelkkä himo ilman tunnistettua tehtävää

export const FUNCTION_TAGS: FunctionTag[] = [
  'unwind',
  'social',
  'sleep',
  'boredom',
  'numb',
  'celebrate',
  'ritual',
  'craving',
];

/** Coarse time-of-day buckets. Fine enough to be actionable, coarse enough to accumulate data. */
export type Block = 'morning' | 'afternoon' | 'evening' | 'night';

export const BLOCKS: Block[] = ['morning', 'afternoon', 'evening', 'night'];

/** Block boundaries in minutes from local midnight. `night` wraps past midnight. */
export const BLOCK_RANGES: Record<Block, { startMin: number; endMin: number }> = {
  morning: { startMin: 5 * 60, endMin: 12 * 60 },
  afternoon: { startMin: 12 * 60, endMin: 17 * 60 },
  evening: { startMin: 17 * 60, endMin: 22 * 60 },
  night: { startMin: 22 * 60, endMin: 29 * 60 }, // 22:00–05:00
};

/**
 * A predicted fork: a moment the user expects to face a decision. Predicting the
 * fork is the skill being trained — the drink itself is downstream of a choice
 * point that usually passes unnoticed.
 */
export interface ForkPrediction {
  block: Block;
  tag: FunctionTag;
  /** Free-text: "kun suljen läppärin", "kaupan ohi kävellessä". */
  cue?: string;
}

/**
 * The morning forecast. Made cold, about a self that will be hot later.
 */
export interface Forecast {
  date: DateKey;
  /** Subjective probability of drinking today, 0..1. */
  p: number;
  forks: ForkPrediction[];
  /** Epoch ms. */
  madeAt: number;
}

export type ForkChoice =
  | 'drank' // juotiin
  | 'delayed' // siirrettiin, sitten juotiin tai ei
  | 'substituted' // korvattiin jollain muulla
  | 'passed'; // ohitettiin

/**
 * A fork as it actually happened. `loggedInMoment` distinguishes real-time
 * noticing from evening reconstruction — noticing is the trainable skill, so the
 * two are never pooled.
 */
export interface ObservedFork {
  /** Minutes from local midnight. */
  atMin: number;
  tag: FunctionTag;
  choice: ForkChoice;
  /** Craving intensity 1..5. */
  intensity: number;
  /** True when logged at the fork, false when reconstructed in the evening. */
  loggedInMoment: boolean;
  /** Set when `choice === 'substituted'`. */
  alternativeId?: string;
  /** Did the substitution actually do the job the drink would have done? */
  worked?: boolean;
}

/** The evening resolution: what the day actually did. */
export interface Observation {
  date: DateKey;
  drank: boolean;
  /** Standard drinks, optional — deliberately not the headline number. */
  drinks?: number;
  forks: ObservedFork[];
  resolvedAt: number;
}

export interface Day {
  date: DateKey;
  forecast?: Forecast;
  observation?: Observation;
}

/** A user-authored option for meeting a function without a drink. */
export interface Alternative {
  id: string;
  label: string;
  tags: FunctionTag[];
  /** Outcomes of past attempts, oldest first. */
  attempts: { at: number; worked: boolean }[];
  archived?: boolean;
}

/**
 * A message recorded by the calm self, addressed to the self standing at a fork.
 * The cold self cannot reason with the hot self, but the hot self will listen to
 * itself — so the app never generates this text, it only stores and returns it.
 */
export interface SelfMessage {
  id: string;
  tag: FunctionTag;
  text: string;
  /** Optional voice recording (audio/webm) held in IndexedDB, never uploaded. */
  audio?: Blob;
  createdAt: number;
}

export interface Settings {
  /** Local minute-of-day for the morning forecast nudge. */
  forecastAtMin: number;
  /** Local minute-of-day for the evening resolve nudge. */
  resolveAtMin: number;
  /** Set once at onboarding; used only to seed the base rate before data exists. */
  seedBaseRate?: number;
}

export const DEFAULT_SETTINGS: Settings = {
  forecastAtMin: 8 * 60,
  resolveAtMin: 21 * 60 + 30,
};
