import { describe, expect, it } from 'vitest';
import {
  AUDIT_C_CUTOFF,
  AUDIT_C_IDS,
  BAND_COPY,
  DEPENDENCE_IDS,
  QUESTIONS,
  score,
} from './screening';

/** Every question answered with the lowest option. */
const allZero = () => Object.fromEntries(QUESTIONS.map((q) => [q.id, 0]));

describe('score', () => {
  it('sums only the three AUDIT-C items into the AUDIT-C total', () => {
    const answers = { ...allZero(), frequency: 4, typical: 4, binge: 4, daily: 1 };
    expect(score(answers).auditC).toBe(12);
  });

  it('counts the dependence questions separately', () => {
    const answers = { ...allZero(), daily: 1, morning: 1 };
    const result = score(answers);
    expect(result.auditC).toBe(0);
    expect(result.dependenceSigns).toBe(2);
  });

  it('treats a missing answer as zero rather than throwing', () => {
    // A partial screen still has to produce something renderable.
    expect(score({ frequency: 2 }).auditC).toBe(2);
  });
});

describe('banding', () => {
  it('stays low just under the cutoff', () => {
    const answers = { ...allZero(), frequency: AUDIT_C_CUTOFF - 1 };
    expect(score(answers).band).toBe('low');
  });

  it('turns hazardous exactly at the cutoff', () => {
    const answers = { ...allZero(), frequency: AUDIT_C_CUTOFF };
    expect(score(answers).band).toBe('hazardous');
  });

  it('promotes a low consumption score when a dependence sign is present', () => {
    // The case the whole screen exists for: someone whose reported amounts look
    // unremarkable but who has morning symptoms. AUDIT-C alone would miss them.
    const answers = { ...allZero(), morning: 1 };
    const result = score(answers);
    expect(result.auditC).toBeLessThan(AUDIT_C_CUTOFF);
    expect(result.band).toBe('dependence');
  });

  it('reaches the top band only through a dependence sign, never through volume', () => {
    const heaviest = { ...allZero(), frequency: 4, typical: 4, binge: 4 };
    expect(score(heaviest).auditC).toBe(12);
    expect(score(heaviest).band).toBe('hazardous');
  });

  it('is low only when nothing at all is reported above the cutoff', () => {
    expect(score(allZero()).band).toBe('low');
  });
});

describe('completeness', () => {
  it('is incomplete while any question is unanswered', () => {
    const answers = { ...allZero() };
    delete answers[QUESTIONS[QUESTIONS.length - 1].id];
    expect(score(answers).complete).toBe(false);
  });

  it('counts a zero answer as answered, not as missing', () => {
    // "En koskaan" is an answer. Treating 0 as absent would make the most
    // common screen impossible to finish.
    expect(score(allZero()).complete).toBe(true);
  });
});

describe('the question set', () => {
  it('has no duplicate ids, since answers are keyed by them', () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
  });

  it('scores every AUDIT-C item on the instrument s own 0-4 scale', () => {
    for (const id of AUDIT_C_IDS) {
      const q = QUESTIONS.find((x) => x.id === id)!;
      expect(q.answers.map((a) => a.value)).toEqual([0, 1, 2, 3, 4]);
    }
  });

  it('marks the two dependence items as outside AUDIT-C', () => {
    // Presenting them as part of a validated instrument would be a claim the
    // instrument does not make.
    for (const id of DEPENDENCE_IDS) {
      expect(QUESTIONS.find((x) => x.id === id)!.beyondAuditC).toBe(true);
    }
    for (const id of AUDIT_C_IDS) {
      expect(QUESTIONS.find((x) => x.id === id)!.beyondAuditC).toBeUndefined();
    }
  });

  it('covers every question in exactly one of the two scales', () => {
    const scored = [...AUDIT_C_IDS, ...DEPENDENCE_IDS];
    expect(new Set(scored)).toEqual(new Set(QUESTIONS.map((q) => q.id)));
    expect(scored.length).toBe(QUESTIONS.length);
  });

  it('is short enough to answer before losing patience', () => {
    expect(QUESTIONS.length).toBeLessThanOrEqual(5);
  });
});

describe('what each band says', () => {
  it('warns about withdrawal only where it is the point', () => {
    expect(BAND_COPY.dependence.warning).toMatch(/hengenvaarallis/);
    expect(BAND_COPY.low.warning).toBeUndefined();
    expect(BAND_COPY.hazardous.warning).toBeUndefined();
  });

  it('gives a way to reach a person in both bands above low', () => {
    for (const band of ['hazardous', 'dependence'] as const) {
      expect(BAND_COPY[band].body.join(' ')).toMatch(/0800 900 45/);
    }
  });

  it('never congratulates the low band', () => {
    // Praise for drinking less is the same lever as shame for drinking more.
    const text = [BAND_COPY.low.heading, ...BAND_COPY.low.body].join(' ');
    expect(text).not.toMatch(/hyvä|hienoa|onneksi olkoon|jatka samaan/i);
  });

  it('says what the app is for rather than what the reader is', () => {
    const verdicts = /olet alkoholisti|sinulla on riippuvuus|olet riippuvainen/i;
    for (const band of ['low', 'hazardous', 'dependence'] as const) {
      const copy = BAND_COPY[band];
      const text = [copy.heading, ...copy.body, copy.warning ?? ''].join(' ');
      expect(text).not.toMatch(verdicts);
    }
  });
});
