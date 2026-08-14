import { describe, expect, it } from 'vitest';
import { HEADLINE, PHASES } from './timeline';

describe('the timeline', () => {
  it('has unique ids', () => {
    expect(new Set(PHASES.map((p) => p.id)).size).toBe(PHASES.length);
  });

  it('names a source for every single phase', () => {
    // The page's whole claim is that it is not making promises, only reporting
    // findings. An unsourced row on it would be a promise wearing a lab coat.
    expect(PHASES.filter((p) => p.source.trim() === '')).toEqual([]);
  });

  it('opens with the acute withdrawal phase, marked urgent', () => {
    expect(PHASES[0].id).toBe('acute');
    expect(PHASES[0].urgent).toBe(true);
  });

  it('marks nothing else urgent, so the emphasis keeps meaning something', () => {
    expect(PHASES.filter((p) => p.urgent)).toHaveLength(1);
  });

  it('carries the kindling finding next to the withdrawal warning', () => {
    // Repeated self-managed detoxes get more dangerous, not less. That is a
    // mechanism, not a caution, and it belongs in the same box.
    expect(PHASES[0].caveat).toMatch(/kindling/i);
  });
});

describe('the incubation phase', () => {
  const incubation = PHASES.find((p) => p.id === 'incubation');

  it('exists, because it is the reason this page exists', () => {
    expect(incubation).toBeDefined();
  });

  it('states that cue-triggered craving can peak around two months', () => {
    expect(incubation!.body).toMatch(/60/);
  });

  it('distinguishes tonic craving from cue-triggered craving', () => {
    // Collapsing the two is how "it gets easier every day" became folklore.
    expect(incubation!.body).toMatch(/eri ilmiöitä/);
  });
});

describe('honesty rules for the page', () => {
  it('never asserts steady improvement where the page makes its claims', () => {
    // Headings and bodies are where this page states things. Caveats are where
    // it disputes them, so the phrase is allowed there — and the next test
    // requires it to be there.
    const claims = PHASES.flatMap((p) => [p.heading, p.body]).join(' ');
    expect(claims).not.toMatch(/helpottuu joka päivä|joka päivä on edellistä helpompi/i);
  });

  it('names the false promise explicitly in order to disown it', () => {
    const incubation = PHASES.find((p) => p.id === 'incubation')!;
    expect(incubation.caveat).toMatch(/ettei tämä sovellus lupaa/);
    expect(incubation.caveat).toMatch(/joka päivä on edellistä helpompi/);
  });

  it('says outright in the headline that craving does not fall steadily', () => {
    expect(HEADLINE).toMatch(/eikä himo laske tasaisesti/);
  });

  it('carries a caveat on every phase that cites a specific study', () => {
    const cited = PHASES.filter((p) => /\d{4}/.test(p.source));
    expect(cited.length).toBeGreaterThanOrEqual(3);
    expect(cited.filter((p) => p.caveat === undefined)).toEqual([]);
  });

  it('admits that imaging measures volume rather than function', () => {
    const structure = PHASES.find((p) => p.id === 'structure')!;
    expect(structure.caveat).toMatch(/ei toimintakykyä/);
  });

  it('does not address the reader as a case, since nothing here is personalised', () => {
    const text = PHASES.flatMap((p) => [p.heading, p.body]).join(' ');
    expect(text).not.toMatch(/sinun aivosi|olet nyt vaiheessa|sinun kohdallasi/i);
  });
});
