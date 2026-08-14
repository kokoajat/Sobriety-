/**
 * A safety screen, asked once.
 *
 * Why this exists at all, in an app whose first rule is that it does not measure
 * the user: because the app cannot otherwise tell the difference between someone
 * who drinks two beers on Fridays and someone who is physically dependent. For
 * the second person, waiting ten minutes is not the relevant intervention and
 * stopping abruptly can kill them — and until this screen existed, the only way
 * they would hear that was if the right fact card happened to come up.
 *
 * The tension is real and is resolved by scope, not by pretending it is absent:
 *
 *   - The score is used once, for triage, and never shown as a running number.
 *   - Nothing here is recomputed, tracked over time, or displayed as progress.
 *   - The output is a statement about *what this app is right for*, never a
 *     verdict about the person. "Tämä ei ole oikea työkalu yksin" is a fact
 *     about the tool.
 *
 * Two instruments, deliberately kept separate:
 *
 * AUDIT-C is the three consumption items of the AUDIT (Saunders ym. 1993),
 * validated standalone by Bush ym. 1998. Each item scores 0–4, total 0–12.
 *
 * But AUDIT-C measures *consumption*, and the danger this screen exists to catch
 * is *physical dependence* — which is a different thing. A person can score high
 * on AUDIT-C with no withdrawal risk, and the reverse is rarer but possible. So
 * two dependence-specific questions follow, marked as not being part of the
 * instrument, and either one alone outranks any AUDIT-C score.
 */

export interface ScreeningAnswer {
  value: number;
  label: string;
}

export interface ScreeningQuestion {
  id: string;
  text: string;
  /** True for the two dependence items, which are not part of AUDIT-C. */
  beyondAuditC?: boolean;
  answers: ScreeningAnswer[];
}

export const QUESTIONS: ScreeningQuestion[] = [
  {
    id: 'frequency',
    text: 'Kuinka usein juot alkoholia? Laske mukaan myös kerrat, jolloin määrä on pieni.',
    answers: [
      { value: 0, label: 'En koskaan' },
      { value: 1, label: 'Kerran kuussa tai harvemmin' },
      { value: 2, label: '2–4 kertaa kuussa' },
      { value: 3, label: '2–3 kertaa viikossa' },
      { value: 4, label: '4 kertaa viikossa tai useammin' },
    ],
  },
  {
    id: 'typical',
    text: 'Kuinka monta annosta otat yleensä niinä päivinä, joina juot?',
    answers: [
      { value: 0, label: '1–2' },
      { value: 1, label: '3–4' },
      { value: 2, label: '5–6' },
      { value: 3, label: '7–9' },
      { value: 4, label: '10 tai enemmän' },
    ],
  },
  {
    id: 'binge',
    text: 'Kuinka usein juot kerralla kuusi annosta tai enemmän?',
    answers: [
      { value: 0, label: 'En koskaan' },
      { value: 1, label: 'Harvemmin kuin kerran kuussa' },
      { value: 2, label: 'Kerran kuussa' },
      { value: 3, label: 'Kerran viikossa' },
      { value: 4, label: 'Päivittäin tai lähes päivittäin' },
    ],
  },
  {
    id: 'daily',
    beyondAuditC: true,
    text: 'Juotko lähes joka päivä?',
    answers: [
      { value: 0, label: 'En' },
      { value: 1, label: 'Kyllä' },
    ],
  },
  {
    id: 'morning',
    beyondAuditC: true,
    text: 'Esiintyykö aamuisin vapinaa, hikoilua tai pahoinvointia, joka helpottaa juomalla?',
    answers: [
      { value: 0, label: 'Ei' },
      { value: 1, label: 'Kyllä' },
    ],
  },
];

export const AUDIT_C_IDS = ['frequency', 'typical', 'binge'];
export const DEPENDENCE_IDS = ['daily', 'morning'];

/**
 * The sensitive end of the two standard cutoffs.
 *
 * The literature uses ≥4 for men and ≥3 for women. This applies ≥3 to everyone
 * rather than asking a personal question purely to raise a threshold: the cost
 * of the lower cutoff is a conversation somebody did not need, and the cost of
 * the higher one is missing somebody who did.
 */
export const AUDIT_C_CUTOFF = 3;

export type Band = 'low' | 'hazardous' | 'dependence';

export interface ScreeningResult {
  auditC: number;
  /** How many of the two dependence questions were answered yes. */
  dependenceSigns: number;
  band: Band;
  /** True once every question has an answer. */
  complete: boolean;
}

export function score(answers: Record<string, number>): ScreeningResult {
  const sum = (ids: string[]) =>
    ids.reduce((total, id) => total + (answers[id] ?? 0), 0);

  const auditC = sum(AUDIT_C_IDS);
  const dependenceSigns = sum(DEPENDENCE_IDS);

  // A dependence sign outranks the consumption score in both directions: it
  // promotes a low scorer, and it is the only thing that reaches the top band.
  // Withdrawal risk is what this screen exists to find, and AUDIT-C does not
  // measure it.
  const band: Band =
    dependenceSigns > 0 ? 'dependence' : auditC >= AUDIT_C_CUTOFF ? 'hazardous' : 'low';

  return {
    auditC,
    dependenceSigns,
    band,
    complete: QUESTIONS.every((q) => answers[q.id] !== undefined),
  };
}

export interface BandCopy {
  heading: string;
  body: string[];
  /** Shown as an emphasised block; present only where it is genuinely urgent. */
  warning?: string;
}

/**
 * What to say for each band.
 *
 * Every line here describes the tool or the situation. None of them describes
 * the reader as a kind of person, and none congratulates: "low" gets no praise,
 * because praise for drinking less is the same mechanism as shame for drinking
 * more, pointed the other way.
 */
export const BAND_COPY: Record<Band, BandCopy> = {
  low: {
    heading: 'Tämä sovellus voi sopia sinulle',
    body: [
      'Vastauksistasi ei tule esiin merkkejä, jotka vaatisivat lääkäriä ennen kuin mitään muuta.',
      'Sovellus on tehty juuri tähän: yksittäisiin hetkiin, joina tekee mieli.',
    ],
  },
  hazardous: {
    heading: 'Tämä sovellus voi auttaa, mutta yksin se ei riitä',
    body: [
      'Vastauksesi asettuvat alueelle, jolla haitat kasvavat selvästi. Se ei ole tuomio eikä diagnoosi — se on kolmen kysymyksen seula.',
      'Kymmenen minuutin odotus voi auttaa yksittäisessä hetkessä. Tällä tasolla kannattaa silti puhua myös terveydenhuollon kanssa, koska sovellus ei näe kokonaisuutta.',
      'Päihdeneuvonta 0800 900 45 on maksuton ja nimetön, ympäri vuorokauden. Sinne voi soittaa myös vain kysyäkseen.',
    ],
  },
  dependence: {
    heading: 'Tämä ei ole ensisijaisesti sovelluksen asia',
    body: [
      'Vastauksissasi on merkki fyysisestä riippuvuudesta. Se tarkoittaa, että elimistö on tottunut alkoholiin ja reagoi sen puuttumiseen.',
      'Voit käyttää tätä sovellusta vapaasti — se ei ole pois mistään. Mutta se ei ole oikea työkalu tähän tilanteeseen yksin.',
      'Päivystysapu 112. Päihdeneuvonta 0800 900 45, maksuton ja nimetön, ympäri vuorokauden.',
    ],
    warning:
      'Älä lopeta juomista äkillisesti omin päin. Vieroitusoireet voivat johtaa kouristuksiin ja deliriumiin, ja ne voivat olla hengenvaarallisia. Vieroitus kuuluu lääkärille.',
  },
};
