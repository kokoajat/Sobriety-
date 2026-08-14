/**
 * Finnish UI strings and formatting.
 *
 * House rule for every string in this file: describe, never evaluate. No string
 * may congratulate the user for waiting or mark them for not waiting. An
 * interface that visibly approves and disapproves hands out a small dose of shame
 * on exactly the occasions that matter most, and shame is one of the
 * best-documented drivers of the behaviour this app is meant to help with.
 */

export function formatMinutes(ms: number): string {
  if (!Number.isFinite(ms)) return '–';
  const minutes = Math.round(ms / 60_000);
  return minutes <= 1 ? 'noin minuutissa' : `noin ${minutes} minuutissa`;
}

export function formatDurationShort(ms: number): string {
  if (!Number.isFinite(ms)) return '–';
  const minutes = Math.round(ms / 60_000);
  return minutes < 1 ? 'alle min' : `${minutes} min`;
}

export function formatPercent(x: number): string {
  return Number.isFinite(x) ? `${Math.round(x * 100)} %` : '–';
}

/** `to 14.8. klo 0.35` — enough to recognise the occasion. */
export function formatWhen(at: number): string {
  const d = new Date(at);
  const days = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];
  const time = `${d.getHours()}.${String(d.getMinutes()).padStart(2, '0')}`;
  return `${days[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}. klo ${time}`;
}

export const OUTCOME_LABELS: Record<string, string> = {
  passed: 'Meni ohi',
  took: 'Otin sen',
  unknown: 'Ei merkintää',
};
