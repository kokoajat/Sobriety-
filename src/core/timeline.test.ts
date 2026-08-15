import { describe, expect, it } from 'vitest';
import { HEADLINE, PHASES } from './timeline';
import { FACTS } from './facts';

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

describe('the exercise phase', () => {
  const exercise = PHASES.find((p) => p.id === 'exercise')!;

  it('leads with the outcome that was measured, not the mechanism', () => {
    // A summary arrived claiming exercise is a shortcut to neuroplasticity. The
    // mechanisms are real; the trials on drinking are null, and that inverts the
    // headline. The heading has to carry the inversion, not bury it.
    expect(exercise.heading).toMatch(/ei juomiseen/);
  });

  it('names both the null drinking result and the real mood result', () => {
    expect(exercise.body).toMatch(/ei vaikutusta päivittäiseen kulutukseen/);
    expect(exercise.body).toMatch(/masennusoireet vähenivät/);
  });

  it('separates rodent and tiny-sample findings from the human trial evidence', () => {
    expect(exercise.caveat).toMatch(/jyrsijöihin/);
    expect(exercise.caveat).toMatch(/19 ihmisen/);
  });

  it('does not leave the reader with "so it is useless"', () => {
    // The honest correction moves the benefit, it does not delete it.
    expect(exercise.caveat).toMatch(/ei tee liikunnasta hyödytöntä/);
  });
});

describe('the exercise lines in the reading corpus', () => {
  it('is not a pure debunk: forward-looking lines came with the correction', () => {
    // Correcting an overclaim by leaving only negatives would meet a craving
    // with a list of things that do not work.
    const added = ['rec-22', 'rec-23', 'rec-24', 'rec-25', 'rec-26'];
    expect(added.every((id) => FACTS.some((f) => f.id === id && f.category === 'recovery')))
      .toBe(true);
  });

  it('labels the popular metaphor as a metaphor', () => {
    const line = FACTS.find((f) => f.id === 'res-42')!;
    expect(line.text).toMatch(/kielikuva/);
    expect(line.text).toMatch(/ei ole lähde/);
  });
});

describe('the muscle phase', () => {
  const muscle = PHASES.find((p) => p.id === 'muscle')!;

  it('exists and sits before the later structural entry', () => {
    const ids = PHASES.map((p) => p.id);
    expect(muscle).toBeDefined();
    expect(ids.indexOf('muscle')).toBeLessThan(ids.indexOf('partial'));
  });

  it('states the size of the chronic problem, which is the underreported half', () => {
    expect(muscle.body).toMatch(/puolta tai kahta kolmasosaa/);
    expect(muscle.body).toMatch(/tyypin II/);
  });

  it('names the recovery window, since that is why it earns a place here', () => {
    expect(muscle.body).toMatch(/kolmessa kuukaudessa/);
  });

  it('admits the recovery is partial in the same box', () => {
    expect(muscle.caveat).toMatch(/noin puolet ei palannut/);
  });

  it('says the prevalence figure depends on the criterion', () => {
    // 33 % and two thirds are the same phenomenon measured two ways. Quoting
    // one without the other would be picking the more convenient number.
    expect(muscle.caveat).toMatch(/33 prosenttia tai kaksi kolmasosaa/);
  });
});

describe('the muscle lines in the reading corpus', () => {
  it('carries the dose caveat next to the post-training finding', () => {
    // The 24 % figure is real and is also the source of an internet meme. The
    // dose behind it — twelve drinks, eight men — has to travel with it.
    const dose = FACTS.find((f) => f.id === 'res-44')!;
    expect(dose.text).toMatch(/12 annosta/);
    expect(dose.text).toMatch(/kahdeksan/);
  });

  it('does not leave the strength material as harm only', () => {
    const forward = ['rec-27', 'rec-28', 'rec-29', 'rec-30'];
    expect(forward.every((id) => FACTS.some((f) => f.id === id && f.category === 'recovery')))
      .toBe(true);
  });
});

describe('the cycling phase', () => {
  const cycling = PHASES.find((p) => p.id === 'cycling')!;

  it('exists, and sits next to the mechanism that explains it', () => {
    // "Muisti ei pyyhkiydy" is why restarting undoes the week off, so the two
    // are read together.
    const ids = PHASES.map((p) => p.id);
    expect(cycling).toBeDefined();
    expect(ids.indexOf('cycling')).toBe(ids.indexOf('memory') - 1);
  });

  it('names the uncomfortable finding rather than softening it', () => {
    expect(cycling.body).toMatch(/juuri tällä aikataululla tutkijat saavat eläimet juomaan enemmän/);
  });

  it('locates the weak point at the restart, not at the abstinent week', () => {
    expect(cycling.body).toMatch(/ei siis ole se viikko ilman vaan uudelleenaloitus/);
  });

  it('splits the question instead of answering it with one verdict', () => {
    // Harm reduction and quitting are different questions with different
    // answers, and collapsing them would make the entry wrong either way.
    expect(cycling.caveat).toMatch(/jakautuu kahtia/);
    expect(cycling.caveat).toMatch(/vähemmän on vähemmän/);
  });

  it('labels the escalation evidence as rodent evidence', () => {
    expect(cycling.caveat).toMatch(/jyrsijätulos/);
  });

  it('carries the human finding that points the other way, with its failed replication', () => {
    expect(cycling.caveat).toMatch(/Dry January/);
    expect(cycling.caveat).toMatch(/väestöotoksessa samoja hyötyjä/);
  });

  it('flags that a repeated week off is a repeated withdrawal', () => {
    // The one genuinely dangerous reading of this schedule, pointed back at the
    // kindling entry rather than restated loosely.
    expect(cycling.caveat).toMatch(/viikon tauko on itsessään vieroitus/);
  });
});

describe('the cancer phase', () => {
  const cancer = PHASES.find((p) => p.id === 'cancer')!;

  it('corrects the "this is new" impression in the heading itself', () => {
    // The classification is from 1988. What changed recently is labelling, not
    // science, and that belongs where it cannot be missed.
    expect(cancer.heading).toMatch(/1988, ei tältä vuodelta/);
  });

  it('separates the science from the communication', () => {
    expect(cancer.body).toMatch(/tiede ei ollut muuttunut/);
    expect(cancer.body).toMatch(/mitä etiketissä lukee/);
  });

  it('leads the evidence with causality rather than with the headline counts', () => {
    // Counts are only worth something once the causal claim stands up, so the
    // natural experiment comes first and the numbers sit in the caveat.
    expect(cancer.body).toMatch(/ALDH2/);
    expect(cancer.body).toMatch(/kaksi vastakkaista suuntaa samasta geenistä/i);
  });

  it('distinguishes "a link is proven" from "the risk is large"', () => {
    expect(cancer.caveat).toMatch(/ei kuinka suuri riski on/);
  });

  it('says the risk stops accumulating when drinking stops', () => {
    // Without this the entry is a pure harm list, which is the one thing the
    // corpus rules forbid.
    expect(cancer.caveat).toMatch(/lakkaa kasvamasta/);
  });
});

describe('the cancer lines in the reading corpus', () => {
  it('carries the two-directional genetic finding', () => {
    const line = FACTS.find((f) => f.id === 'res-51')!;
    expect(line.text).toMatch(/matalampi/);
    expect(line.text).toMatch(/korkeampi/);
    expect(line.figure).toBe('aldh2-split');
  });

  it('ties the method back to the study already in the corpus', () => {
    // Mendelian randomisation appears twice now — stroke and oesophageal
    // cancer. The line naming that is what turns two facts into a method.
    expect(FACTS.find((f) => f.id === 'res-54')!.text).toMatch(/sama menetelmä/i);
  });

  it('does not leave the cancer material as harm only', () => {
    const forward = ['rec-31', 'rec-32', 'rec-33'];
    expect(forward.every((id) => FACTS.some((f) => f.id === id && f.category === 'recovery')))
      .toBe(true);
  });
});
