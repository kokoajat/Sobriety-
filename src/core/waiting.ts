/**
 * The wait.
 *
 * The one mechanism this app is built around: waiting asks for a decision the
 * user can actually make. "Stop drinking" is a decision about a self they are not
 * currently being; "wait ten minutes" is a decision about the next ten minutes,
 * and it costs nothing to reverse. Delay is also the only lever that acts on the
 * immediate reward's advantage — its pull decays as the delay grows, which is
 * why the countdown is the whole interface rather than a detail of it.
 *
 * Pure functions over an episode plus a clock, so all of it is testable without
 * a browser and none of it can drift while a timer is running.
 */

import type { Episode, Outcome, Settings } from './types';

/** Total time this episode is currently asking for, extensions included. */
export function targetMs(episode: Episode, settings: Settings): number {
  return settings.waitMs + episode.extensions * settings.extensionMs;
}

/** Milliseconds still to go, floored at zero. */
export function remainingMs(episode: Episode, now: number, settings: Settings): number {
  const elapsed = now - episode.startedAt;
  return Math.max(0, targetMs(episode, settings) - elapsed);
}

/** 0..1, clamped. Drives the ring; never overshoots when the tab was backgrounded. */
export function progress(episode: Episode, now: number, settings: Settings): number {
  const target = targetMs(episode, settings);
  if (target <= 0) return 1;
  const elapsed = now - episode.startedAt;
  return Math.min(1, Math.max(0, elapsed / target));
}

export function isElapsed(episode: Episode, now: number, settings: Settings): boolean {
  return remainingMs(episode, now, settings) === 0;
}

/**
 * Add one extension.
 *
 * Deliberately unbounded. A user who wants a fourth extension is doing exactly
 * what this app is for, and a cap would tell them they had run out of allowance
 * for holding on.
 */
export function extend(episode: Episode): Episode {
  return { ...episode, extensions: episode.extensions + 1 };
}

/**
 * Close the episode.
 *
 * `waitedMs` is capped at the target so a phone left in a pocket for three hours
 * does not record a three-hour act of willpower — the honest number is how long
 * the wait was actually asking for.
 */
export function close(
  episode: Episode,
  outcome: Outcome,
  now: number,
  settings: Settings,
): Episode {
  const elapsed = Math.max(0, now - episode.startedAt);
  return {
    ...episode,
    outcome,
    endedAt: now,
    waitedMs: Math.min(elapsed, targetMs(episode, settings)),
  };
}

export const isOpen = (episode: Episode): boolean => episode.endedAt === undefined;

/** `mm:ss`, for the countdown. Seconds always two digits so the width never jumps. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
