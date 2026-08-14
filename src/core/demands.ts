/**
 * Turning demand keys into words.
 *
 * Six shipped needs, plus whatever the user names. Kept in one module so no view
 * has to know which kind it is holding.
 */

import {
  BUILTIN_DEMANDS,
  CUSTOM_DEMAND_PREFIX,
  isCustomDemand,
  type BuiltinDemand,
  type CustomDemand,
  type Demand,
} from './types';

export interface DemandOption {
  demand: Demand;
  label: string;
  custom: boolean;
}

/**
 * Phrased as needs rather than causes — "rauhoittua", not "stressi".
 *
 * The wording is the point: the question at the top of the screen is what the
 * drink would *do*, because that is the question a substitute can answer. A list
 * of causes invites explaining yourself, which is not something anyone has
 * capacity for while an urge is running.
 */
export const BUILTIN_LABELS: Record<BuiltinDemand, string> = {
  settle: 'Rauhoittua',
  detach: 'Irrota päivästä',
  company: 'Olla ihmisten kanssa',
  sleep: 'Nukahtaa',
  empty: 'Täyttää tyhjä ilta',
  'feel-less': 'Tuntea vähemmän',
};

const isBuiltin = (d: Demand): d is BuiltinDemand =>
  (BUILTIN_DEMANDS as string[]).includes(d);

export function newCustomDemand(): Demand {
  const uuid =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${CUSTOM_DEMAND_PREFIX}${uuid}`;
}

/** Falls back rather than throwing, so a deleted need never breaks a history row. */
export function demandLabel(demand: Demand, customs: CustomDemand[]): string {
  if (isBuiltin(demand)) return BUILTIN_LABELS[demand];
  const match = customs.find((c) => c.id === demand);
  if (match) return match.label;
  return isCustomDemand(demand) ? 'Poistettu' : demand;
}

/** Builtins first, then the user's own in the order added — the grid must not reshuffle. */
export function demandOptions(customs: CustomDemand[]): DemandOption[] {
  return [
    ...BUILTIN_DEMANDS.map((demand) => ({
      demand,
      label: BUILTIN_LABELS[demand],
      custom: false,
    })),
    ...customs
      .filter((c) => !c.archived)
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((c) => ({ demand: c.id, label: c.label, custom: true })),
  ];
}

export function normalizeLabel(label: string): string {
  return label.trim().replace(/\s+/g, ' ').toLocaleLowerCase('fi');
}

/**
 * Match a typed label against everything, archived included.
 *
 * Re-adding a name revives the old record instead of minting a second key for
 * the same need — otherwise its prepared supplies stay attached to the first one.
 */
export function findDemandByLabel(
  label: string,
  customs: CustomDemand[],
): { demand: Demand; archived: boolean } | undefined {
  const key = normalizeLabel(label);
  if (key === '') return undefined;

  for (const d of BUILTIN_DEMANDS) {
    if (normalizeLabel(BUILTIN_LABELS[d]) === key) return { demand: d, archived: false };
  }
  const match = customs.find((c) => normalizeLabel(c.label) === key);
  return match ? { demand: match.id, archived: Boolean(match.archived) } : undefined;
}
