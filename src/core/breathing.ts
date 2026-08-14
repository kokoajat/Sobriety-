/**
 * Where in a breathing pattern a given moment falls.
 *
 * Pure arithmetic over elapsed time, so the animation can be driven from a clock
 * rather than from accumulated state. That matters more here than it looks: a
 * phone screen sleeps, a tab is throttled, and anything that counts phases by
 * incrementing on a timer drifts out of step with the visible circle within a
 * minute. Deriving from elapsed time cannot drift.
 */

export type PhaseKind = 'in' | 'hold' | 'out' | 'rest';

export interface BreathPhase {
  kind: PhaseKind;
  seconds: number;
}

export interface BreathPattern {
  id: string;
  name: string;
  phases: BreathPhase[];
}

export interface BreathState {
  phase: BreathPhase;
  /** Index within the pattern. */
  index: number;
  /** 0..1 through the current phase. */
  progress: number;
  /** Whole seconds left in this phase, counting down from its length to 1. */
  remaining: number;
  /** Completed cycles so far. */
  cycle: number;
}

export const PHASE_LABELS: Record<PhaseKind, string> = {
  in: 'Sisään',
  hold: 'Pidätä',
  out: 'Ulos',
  rest: 'Tauko',
};

/** Total length of one cycle, in seconds. */
export function cycleSeconds(pattern: BreathPattern): number {
  return pattern.phases.reduce((sum, p) => sum + Math.max(0, p.seconds), 0);
}

/**
 * The state of the pattern at `elapsedMs`.
 *
 * Returns undefined only for a pattern with no positive-length phase, which
 * would otherwise divide by zero and hang the caller in a loop.
 */
export function breathAt(pattern: BreathPattern, elapsedMs: number): BreathState | undefined {
  const usable = pattern.phases.filter((p) => p.seconds > 0);
  if (usable.length === 0) return undefined;

  const total = cycleSeconds(pattern);
  const elapsed = Math.max(0, elapsedMs) / 1000;
  const cycle = Math.floor(elapsed / total);
  let within = elapsed - cycle * total;

  for (let i = 0; i < usable.length; i += 1) {
    const phase = usable[i];
    if (within < phase.seconds) {
      return {
        phase,
        index: i,
        progress: phase.seconds === 0 ? 1 : within / phase.seconds,
        // Counts down as a person would say it: "4, 3, 2, 1", never "0".
        remaining: Math.max(1, Math.ceil(phase.seconds - within)),
        cycle,
      };
    }
    within -= phase.seconds;
  }

  // Only reachable through floating-point drift at the very end of a cycle.
  const last = usable[usable.length - 1];
  return { phase: last, index: usable.length - 1, progress: 1, remaining: 1, cycle };
}

/**
 * How large the guide circle should be, 0..1.
 *
 * A hold keeps whatever size it arrived at, so the shape stops moving exactly
 * when the breath does. The circle is an instruction; one that drifts during a
 * hold is instructing the wrong thing. Which size that is depends on what came
 * before the hold, so the pattern is consulted rather than guessed from the
 * phase alone.
 */
export function circleScale(pattern: BreathPattern, state: BreathState): number {
  if (state.phase.kind === 'in') return state.progress;
  if (state.phase.kind === 'out') return 1 - state.progress;

  const usable = pattern.phases.filter((p) => p.seconds > 0);
  for (let i = state.index - 1; i >= 0; i -= 1) {
    if (usable[i].kind === 'in') return 1;
    if (usable[i].kind === 'out') return 0;
  }
  // A pattern that opens with a hold starts from empty, like an exhale would.
  return 0;
}
