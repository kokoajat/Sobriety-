import { describe, expect, it } from 'vitest';
import {
  SITUATIONS,
  SITUATION_KEYS,
  movesFor,
  situationLabel,
  suggestedSituation,
} from './situations';

const all = SITUATION_KEYS.flatMap((k) => SITUATIONS[k].moves);

describe('the situation set', () => {
  it('has an entry for every key, so no lookup can miss', () => {
    for (const key of SITUATION_KEYS) {
      expect(SITUATIONS[key]).toBeDefined();
      expect(SITUATIONS[key].key).toBe(key);
    }
  });

  it('fits on a phone without scrolling to find the last option', () => {
    expect(SITUATION_KEYS.length).toBeLessThanOrEqual(6);
  });

  it('has a fallback for the person who is somewhere it did not think of', () => {
    expect(SITUATION_KEYS).toContain('elsewhere');
  });
});

describe('the moves', () => {
  it('uses unique ids across every situation', () => {
    expect(new Set(all.map((m) => m.id)).size).toBe(all.length);
  });

  it('offers a real relocation everywhere', () => {
    // The whole panel rests on changing the physical context. A situation with
    // only breathing exercises in it would be quietly demoting the one move
    // with the best evidence.
    for (const key of SITUATION_KEYS) {
      expect(SITUATIONS[key].moves.some((m) => m.kind === 'room')).toBe(true);
    }
  });

  it('gives more than one option per situation, since some are not available', () => {
    for (const key of SITUATION_KEYS) {
      expect(SITUATIONS[key].moves.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('explains the mechanism for every single move', () => {
    // A move without a reason is an instruction. A move with one is something
    // the user can repeat next week without opening the app.
    expect(all.filter((m) => m.why.trim() === '')).toEqual([]);
  });

  it('keeps every move short enough to do inside one wait', () => {
    expect(all.filter((m) => m.seconds > 600)).toEqual([]);
  });

  it('never tells the reader what kind of person they are', () => {
    const accusing = /olet heikko|et jaksa|sinun vikasi|ryhdisty/i;
    expect(all.filter((m) => accusing.test(m.text) || accusing.test(m.why))).toEqual([]);
  });
});

describe('movesFor', () => {
  it('leads with relocation, because that is the ranking claim', () => {
    for (const key of SITUATION_KEYS) {
      expect(movesFor(key)[0].kind).toBe('room');
    }
  });

  it('returns every move for the situation, not a subset', () => {
    for (const key of SITUATION_KEYS) {
      expect(movesFor(key)).toHaveLength(SITUATIONS[key].moves.length);
    }
  });

  it('does not mutate the shipped data while sorting', () => {
    const before = SITUATIONS['home-alone'].moves.map((m) => m.id);
    movesFor('home-alone');
    expect(SITUATIONS['home-alone'].moves.map((m) => m.id)).toEqual(before);
  });
});

describe('the bed situation', () => {
  // Sleep is the one need with its own evidence-based path: insomnia in early
  // abstinence independently predicts relapse, and the treatment for it is
  // counterintuitive enough that generic calming advice would be wrong.
  const bed = SITUATIONS.bed;

  it('leads with getting out of bed, which is the CBT-I core instruction', () => {
    expect(movesFor('bed')[0].text).toMatch(/[Nn]ouse sängystä/);
  });

  it('tells the reader to stop watching the clock', () => {
    expect(bed.moves.some((m) => /kello/i.test(m.text))).toBe(true);
  });

  it('never suggests staying in bed and trying harder to sleep', () => {
    expect(bed.moves.filter((m) => /yritä nukkua|pysy sängyssä/i.test(m.text))).toEqual([]);
  });
});

describe('suggestedSituation', () => {
  it('pre-selects bed for the sleep need, the one need with a place', () => {
    expect(suggestedSituation('sleep')).toBe('bed');
  });

  it('guesses nothing for every other need', () => {
    // Predicting where someone is would put the app in the business of
    // modelling the user, which is the thing it does not do.
    for (const demand of ['settle', 'detach', 'company', 'empty', 'feel-less', 'own:abc']) {
      expect(suggestedSituation(demand)).toBeUndefined();
    }
  });
});

describe('situationLabel', () => {
  it('gives a human label for every key', () => {
    for (const key of SITUATION_KEYS) {
      expect(situationLabel(key).length).toBeGreaterThan(0);
    }
  });
});
