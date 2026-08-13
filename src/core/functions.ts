/**
 * Resolving function tags to something a person can read.
 *
 * Tags travel through storage and analysis as opaque strings. Only the surface
 * needs to know that some of them are builtins with translated labels and some
 * are rows the user wrote themselves — so that knowledge lives here, in one
 * place, rather than as a conditional in every view.
 */

import {
  BUILTIN_FUNCTION_TAGS,
  CUSTOM_TAG_PREFIX,
  isCustomTag,
  type BuiltinFunctionTag,
  type CustomFunction,
  type FunctionTag,
} from './types';

export interface FunctionOption {
  tag: FunctionTag;
  label: string;
  hint?: string;
  custom: boolean;
}

export const BUILTIN_LABELS: Record<BuiltinFunctionTag, string> = {
  unwind: 'Työstä vapaalle',
  social: 'Sosiaalinen jännitys',
  sleep: 'Nukahtaminen',
  boredom: 'Tyhjä ilta',
  numb: 'Tunteen vaimennus',
  celebrate: 'Juhla tai palkinto',
  ritual: 'Tapa, käsi tekee itsestään',
  craving: 'Pelkkä himo',
};

export const BUILTIN_HINTS: Record<BuiltinFunctionTag, string> = {
  unwind: 'Työpäivä ei muuten lopu mihinkään.',
  social: 'Toisten seurassa oleminen on helpompaa.',
  sleep: 'Ilman sitä uni ei tule.',
  boredom: 'Ilta on tyhjä ja pitkä.',
  numb: 'Jokin tunne pitää saada hiljaisemmaksi.',
  celebrate: 'Tämä ansaitaan.',
  ritual: 'Ei erityistä syytä, näin vain tehdään.',
  craving: 'Tekee mieli, eikä siihen liity mitään muuta.',
};

const isBuiltin = (tag: FunctionTag): tag is BuiltinFunctionTag =>
  (BUILTIN_FUNCTION_TAGS as string[]).includes(tag);

/** New id for a user-defined function. */
export function newCustomTag(): FunctionTag {
  const uuid =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${CUSTOM_TAG_PREFIX}${uuid}`;
}

/**
 * Human-readable name for any tag.
 *
 * Falls back rather than throwing: an archived custom function still resolves
 * from its record, and a tag whose record is somehow missing renders as a
 * placeholder instead of breaking a history view.
 */
export function functionLabel(tag: FunctionTag, customs: CustomFunction[]): string {
  if (isBuiltin(tag)) return BUILTIN_LABELS[tag];
  const match = customs.find((c) => c.id === tag);
  if (match) return match.label;
  return isCustomTag(tag) ? 'Poistettu tehtävä' : tag;
}

export function functionHint(
  tag: FunctionTag,
  customs: CustomFunction[],
): string | undefined {
  if (isBuiltin(tag)) return BUILTIN_HINTS[tag];
  return customs.find((c) => c.id === tag)?.hint;
}

/**
 * The pickable options: builtins first, then the user's own in the order they
 * added them.
 *
 * Builtins stay on top deliberately. A user's own function is usually one they
 * reach for often, but promoting it above the shipped list would reshuffle the
 * fork screen as they add rows — and that screen has to be muscle memory, not a
 * layout that moves under the thumb.
 */
export function functionOptions(customs: CustomFunction[]): FunctionOption[] {
  const builtins: FunctionOption[] = BUILTIN_FUNCTION_TAGS.map((tag) => ({
    tag,
    label: BUILTIN_LABELS[tag],
    hint: BUILTIN_HINTS[tag],
    custom: false,
  }));

  const own: FunctionOption[] = customs
    .filter((c) => !c.archived)
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((c) => ({ tag: c.id, label: c.label, hint: c.hint, custom: true }));

  return [...builtins, ...own];
}

/** Trimmed, whitespace-collapsed, case-folded — the key used for duplicate checks. */
export function normalizeLabel(label: string): string {
  return label.trim().replace(/\s+/g, ' ').toLocaleLowerCase('fi');
}

/**
 * Find an existing function matching a typed label, builtin or custom.
 *
 * Used before creating one, so that typing "tyhjä ilta" at a fork reuses the
 * builtin instead of quietly splitting that function's history across two tags
 * that mean the same thing.
 */
export function findByLabel(
  label: string,
  customs: CustomFunction[],
): FunctionOption | undefined {
  const key = normalizeLabel(label);
  if (key === '') return undefined;
  return functionOptions(customs).find((o) => normalizeLabel(o.label) === key);
}

/**
 * Find a custom function by label, archived ones included.
 *
 * Re-adding a name the user archived earlier should revive that record rather
 * than mint a new tag beside it — otherwise the same function ends up split
 * across two ids and its history stops adding up.
 */
export function findCustomByLabel(
  label: string,
  customs: CustomFunction[],
): CustomFunction | undefined {
  const key = normalizeLabel(label);
  if (key === '') return undefined;
  return customs.find((c) => normalizeLabel(c.label) === key);
}
