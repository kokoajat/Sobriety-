/**
 * Something to do with the hands while the clock runs.
 *
 * Reading occupies attention; this occupies the body. Both exist for the same
 * reason — ten minutes of watching a countdown is a bad task for an impatient
 * mind, and a walk is not always available.
 *
 * On honesty about evidence. These are not equivalent, and presenting them as a
 * uniform menu of "calming techniques" would imply they are. Slow breathing with
 * a lengthened exhale has solid support for reducing acute arousal; grounding
 * exercises have reasonable support; acupressure has thin and inconsistent
 * support for craving and anxiety specifically. Every entry therefore carries an
 * `evidence` grade that is shown to the user rather than buried here.
 *
 * That does not make the thin ones useless. What reliably helps in the moment is
 * giving the hands a defined task and slowing the breath, and pressing a named
 * spot for sixty seconds does both. The honest claim is "this occupies you and
 * slows you down", not "this point releases something", and the wording below
 * sticks to the first.
 */

import type { BreathPattern } from './breathing';

/** How well supported the specific claim is — shown, not hidden. */
export type Evidence = 'vahva' | 'kohtalainen' | 'ohut';

export const EVIDENCE_LABELS: Record<Evidence, string> = {
  vahva: 'Hyvin tutkittu',
  kohtalainen: 'Kohtalainen näyttö',
  ohut: 'Ohut näyttö',
};

export const EVIDENCE_NOTES: Record<Evidence, string> = {
  vahva: 'Vaikutus akuuttiin vireystilaan on osoitettu toistuvasti.',
  kohtalainen: 'Näyttöä on, mutta se on vaihtelevaa.',
  ohut: 'Näyttö on ohut ja ristiriitainen. Tekeminen käsillä ja hidastuminen auttavat joka tapauksessa.',
};

/** Which schematic figure to draw, if any. */
export type Figure = 'hand' | 'wrist' | 'face';

export interface Technique {
  id: string;
  name: string;
  /** One line: what this is, before committing to it. */
  summary: string;
  evidence: Evidence;
  /** Roughly how long it takes, in seconds — shown so nothing is a surprise. */
  seconds: number;
  /** Present for guided breathing; drives the animated circle. */
  pattern?: BreathPattern;
  /** Present for anything with a location on the body. */
  figure?: Figure;
  /** Where the marker sits on the figure, in its own 0..100 coordinate space. */
  point?: { x: number; y: number };
  /** Short imperative steps. Read while doing, so each one is one breath long. */
  steps: string[];
}

export const TECHNIQUES: Technique[] = [
  {
    id: 'long-exhale',
    name: 'Pitkä uloshengitys',
    summary: 'Sisään neljä, ulos kuusi. Yksinkertaisin ja parhaiten tutkittu.',
    evidence: 'vahva',
    seconds: 120,
    pattern: {
      id: 'p-long-exhale',
      name: 'Pitkä uloshengitys',
      phases: [
        { kind: 'in', seconds: 4 },
        { kind: 'out', seconds: 6 },
      ],
    },
    steps: [
      'Anna hartioiden laskeutua.',
      'Hengitä sisään nenän kautta, ulos suun kautta.',
      'Uloshengitys saa olla hidas ja ääneti. Sen pituus on tässä se joka merkitsee.',
    ],
  },
  {
    id: 'box',
    name: 'Laatikkohengitys',
    summary: 'Neljä sisään, neljä pidätystä, neljä ulos, neljä taukoa.',
    evidence: 'kohtalainen',
    seconds: 160,
    pattern: {
      id: 'p-box',
      name: 'Laatikkohengitys',
      phases: [
        { kind: 'in', seconds: 4 },
        { kind: 'hold', seconds: 4 },
        { kind: 'out', seconds: 4 },
        { kind: 'hold', seconds: 4 },
      ],
    },
    steps: [
      'Seuraa ympyrää: se kasvaa sisäänhengityksellä ja pysähtyy pidätyksen ajaksi.',
      'Jos pidätys tuntuu ahdistavalta, siirry pitkään uloshengitykseen.',
    ],
  },
  {
    id: '478',
    name: '4–7–8',
    summary: 'Neljä sisään, seitsemän pidätystä, kahdeksan ulos. Vaativampi.',
    evidence: 'ohut',
    seconds: 152,
    pattern: {
      id: 'p-478',
      name: '4–7–8',
      phases: [
        { kind: 'in', seconds: 4 },
        { kind: 'hold', seconds: 7 },
        { kind: 'out', seconds: 8 },
      ],
    },
    steps: [
      'Kieli kevyesti etuhampaiden takana.',
      'Uloshengitys suun kautta, hitaasti.',
      'Neljä kierrosta riittää. Jos huimaa, lopeta ja hengitä tavallisesti.',
    ],
  },
  {
    id: 'hegu',
    name: 'Kämmenen painelu (hegu)',
    summary: 'Peukalon ja etusormen välinen lihas, molemmat kädet.',
    evidence: 'ohut',
    seconds: 120,
    figure: 'hand',
    point: { x: 38, y: 44 },
    steps: [
      'Purista lihasta peukalon ja etusormen välistä toisen käden peukalolla ja etusormella.',
      'Paina sen verran että tuntuu, ei niin että sattuu.',
      'Pyöritä pienin liikkein noin minuutti. Vaihda sitten kättä.',
      'Hengitä samalla ulos hitaammin kuin sisään.',
    ],
  },
  {
    id: 'neiguan',
    name: 'Ranteen painelu (neiguan)',
    summary: 'Kyynärvarren sisäpuoli, kolme sormen leveyttä ranteesta.',
    evidence: 'ohut',
    seconds: 120,
    figure: 'wrist',
    point: { x: 50, y: 38 },
    steps: [
      'Aseta kolme sormea ranteen poimun päälle. Piste on juuri niiden yläpuolella, kahden jänteen välissä.',
      'Paina peukalolla tasaisesti noin minuutti.',
      'Vaihda kättä ja tee sama toiselle puolelle.',
    ],
  },
  {
    id: 'yintang',
    name: 'Kulmien välin painelu (yintang)',
    summary: 'Kohta kulmakarvojen välissä. Helppo tehdä huomaamatta.',
    evidence: 'ohut',
    seconds: 90,
    figure: 'face',
    point: { x: 50, y: 42 },
    steps: [
      'Aseta etusormi tai peukalo kulmakarvojen väliin.',
      'Paina kevyesti ja pyöritä hitaasti.',
      'Anna silmien sulkeutua, jos se on mahdollista.',
    ],
  },
  {
    id: 'grounding',
    name: 'Viisi aistia',
    summary: 'Nimeä ympäriltäsi viisi asiaa, sitten neljä, kolme, kaksi, yksi.',
    evidence: 'kohtalainen',
    seconds: 120,
    steps: [
      'Viisi asiaa jotka näet.',
      'Neljä jotka tunnet ihollasi.',
      'Kolme jotka kuulet.',
      'Kaksi jotka haistat.',
      'Yksi jonka maistat.',
      'Sano ne mielessäsi kokonaisina lauseina, älä listana.',
    ],
  },
  {
    id: 'release',
    name: 'Jännitä ja päästä',
    summary: 'Kädet, hartiat, leuka — jännitä viisi sekuntia, päästä irti.',
    evidence: 'kohtalainen',
    seconds: 120,
    steps: [
      'Purista molemmat kädet nyrkkiin. Laske viiteen. Päästä irti kerralla.',
      'Nosta hartiat korviin. Laske viiteen. Päästä.',
      'Purista leuat yhteen kevyesti. Laske viiteen. Päästä.',
      'Huomaa ero jännityksen ja päästämisen välillä. Se ero on koko harjoitus.',
    ],
  },
  {
    id: 'cold',
    name: 'Kylmä vesi',
    summary: 'Kasvot tai ranteet kylmään veteen. Nopein keinoista.',
    evidence: 'kohtalainen',
    seconds: 60,
    steps: [
      'Laske kylmää vettä ranteiden sisäpuolelle puolisen minuuttia.',
      'Tai kasta kasvot kylmään veteen ja pidätä hengitystä hetki.',
      'Kylmä muuttaa kehon tilaa nopeammin kuin ajattelu ehtii muuttua.',
      'Jos sinulla on sydänsairaus, käytä ranteita äläkä kasvoja.',
    ],
  },
];
