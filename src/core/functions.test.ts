import { describe, expect, it } from 'vitest';
import {
  BUILTIN_LABELS,
  findByLabel,
  functionHint,
  functionLabel,
  findCustomByLabel,
  functionOptions,
  newCustomTag,
  normalizeLabel,
} from './functions';
import { BUILTIN_FUNCTION_TAGS, isCustomTag, type CustomFunction } from './types';

const custom = (over: Partial<CustomFunction> = {}): CustomFunction => ({
  id: 'custom:a',
  label: 'Riita kotona',
  createdAt: 1,
  ...over,
});

describe('newCustomTag', () => {
  it('namespaces ids so they cannot collide with a builtin', () => {
    const tag = newCustomTag();
    expect(isCustomTag(tag)).toBe(true);
    expect(BUILTIN_FUNCTION_TAGS).not.toContain(tag);
  });

  it('does not repeat itself', () => {
    expect(newCustomTag()).not.toBe(newCustomTag());
  });
});

describe('functionLabel', () => {
  it('translates a builtin', () => {
    expect(functionLabel('sleep', [])).toBe(BUILTIN_LABELS.sleep);
  });

  it('returns the user\'s own wording for a custom tag', () => {
    expect(functionLabel('custom:a', [custom()])).toBe('Riita kotona');
  });

  it('still resolves an archived function, so old days stay readable', () => {
    expect(functionLabel('custom:a', [custom({ archived: true })])).toBe('Riita kotona');
  });

  it('falls back to a placeholder rather than showing a raw id', () => {
    expect(functionLabel('custom:gone', [])).toBe('Poistettu tehtävä');
  });
});

describe('functionHint', () => {
  it('carries the user\'s own note', () => {
    expect(functionHint('custom:a', [custom({ hint: 'yleensä perjantaisin' })])).toBe(
      'yleensä perjantaisin',
    );
  });

  it('is undefined for a custom function without one', () => {
    expect(functionHint('custom:a', [custom()])).toBeUndefined();
  });
});

describe('functionOptions', () => {
  it('lists every builtin before any custom one', () => {
    const options = functionOptions([custom()]);
    expect(options).toHaveLength(BUILTIN_FUNCTION_TAGS.length + 1);
    expect(options.slice(0, BUILTIN_FUNCTION_TAGS.length).every((o) => !o.custom)).toBe(true);
    expect(options[options.length - 1].custom).toBe(true);
  });

  it('hides archived functions from the pickers', () => {
    const options = functionOptions([custom({ archived: true })]);
    expect(options).toHaveLength(BUILTIN_FUNCTION_TAGS.length);
  });

  it('keeps the order the user added them in, so the grid does not reshuffle', () => {
    const options = functionOptions([
      custom({ id: 'custom:b', label: 'Toinen', createdAt: 20 }),
      custom({ id: 'custom:a', label: 'Ensimmäinen', createdAt: 10 }),
    ]);
    const own = options.filter((o) => o.custom).map((o) => o.label);
    expect(own).toEqual(['Ensimmäinen', 'Toinen']);
  });
});

describe('normalizeLabel', () => {
  it('folds case, trims and collapses whitespace', () => {
    expect(normalizeLabel('  Tyhjä   ILTA ')).toBe('tyhjä ilta');
  });
});

describe('findByLabel', () => {
  it('matches an existing builtin so its history is not split in two', () => {
    expect(findByLabel('  tyhjä ilta ', [])?.tag).toBe('boredom');
  });

  it('matches an existing custom function regardless of case', () => {
    expect(findByLabel('RIITA KOTONA', [custom()])?.tag).toBe('custom:a');
  });

  it('returns nothing for a genuinely new label', () => {
    expect(findByLabel('Junamatka', [custom()])).toBeUndefined();
  });

  it('returns nothing for blank input', () => {
    expect(findByLabel('   ', [custom()])).toBeUndefined();
  });

  it('does not offer an archived function, which is what the pickers need', () => {
    expect(findByLabel('Riita kotona', [custom({ archived: true })])).toBeUndefined();
  });
});

describe('findCustomByLabel', () => {
  it('finds an archived function, so re-adding revives it instead of forking history', () => {
    const found = findCustomByLabel('  riita KOTONA ', [custom({ archived: true })]);
    expect(found?.id).toBe('custom:a');
  });

  it('returns nothing for an unknown label', () => {
    expect(findCustomByLabel('Junamatka', [custom()])).toBeUndefined();
  });
});
