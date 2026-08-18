/**
 * Where the urge is happening, and what to do about the where.
 *
 * This module exists because of the single strongest finding in the human
 * literature on stopping, and it is not a finding about willpower.
 *
 * Robins (1975) followed US soldiers returning from Vietnam. Around a fifth had
 * met criteria for heroin dependence in service; about 5% relapsed in the first
 * year home and about 12% over three years. No treatment has ever come close to
 * those numbers. The men did not change. The environment holding the cues did.
 *
 * Two mechanisms explain why that works, and both are directly actionable:
 *
 *   - Bouton's work on extinction: learning not to respond does not erase the
 *     original association, it builds a second, competing one — and the second is
 *     *context-bound* while the first is not. So the old response returns when
 *     the context returns (renewal), and a new context is where the new learning
 *     has the advantage.
 *   - Everitt & Robbins on habit: repeated use shifts control from ventral to
 *     dorsolateral striatum, and behaviour starts firing from the cue without a
 *     decision being made. "I don't know why I poured it, I didn't even decide"
 *     is a precise description of this. Removing the cue removes the trigger,
 *     which is easier than out-arguing it.
 *
 * The design consequence is that changing rooms is not a folksy tip alongside
 * breathing exercises. It is the intervention with the best evidence in this
 * whole app, and it is presented that way.
 *
 * On measurement: naming a situation is not measuring the user. "The kitchen at
 * nine in the evening" is a fact about a room. Everything stored here stays a
 * property of a place, exactly as the existing statistics stay properties of a
 * supply rather than of the person.
 */

export type SituationKey = 'home-alone' | 'home-others' | 'commute' | 'out' | 'bed' | 'elsewhere';

export const SITUATION_KEYS: SituationKey[] = [
  'home-alone',
  'home-others',
  'commute',
  'out',
  'bed',
  'elsewhere',
];

/**
 * What a move actually changes.
 *
 * Ordered by how much of the context it replaces, which is also roughly the
 * order of how well supported it is. The panel leads with `room` for that
 * reason, and falls back to the rest when leaving is not available — which it
 * often is not, and pretending otherwise would make the whole panel useless in
 * exactly the situations people are in.
 */
export type MoveKind = 'room' | 'sensory' | 'social' | 'body';

export interface Move {
  id: string;
  kind: MoveKind;
  /** Imperative, one line, doable now. */
  text: string;
  /** The mechanism, in one line. Shown — a move you understand is a move you repeat. */
  why: string;
  /** Roughly how long it takes, so nothing is a surprise. */
  seconds: number;
}

export interface Situation {
  key: SituationKey;
  label: string;
  /** Shown under the heading once chosen: what makes this place what it is. */
  note: string;
  moves: Move[];
}

export const SITUATIONS: Record<SituationKey, Situation> = {
  'home-alone': {
    key: 'home-alone',
    label: 'Kotona yksin',
    note: 'Tämä on se tilanne, jossa vihjeitä on eniten ja niitä on vaikein välttää: oma keittiö, oma tuoli, oma kellonaika.',
    moves: [
      {
        id: 'ha-room',
        kind: 'room',
        text: 'Mene toiseen huoneeseen ja ota puhelin mukaan. Älä siihen, missä yleensä juot.',
        why: 'Vihje on paikassa, ei sinussa. Sama halu on toisessa huoneessa heikompi, koska se on opittu tähän huoneeseen.',
        seconds: 20,
      },
      {
        id: 'ha-out',
        kind: 'room',
        text: 'Mene ulos ovesta. Rappu, piha tai parveke riittää — kaksi minuuttia.',
        why: 'Valo, lämpötila ja ääni vaihtuvat kerralla. Mikään yhtä helppo teko ei vaihda kontekstia yhtä paljon — ja ulkona valoa on kertaluokkaa enemmän kuin sisällä, myös pilvisellä säällä.',
        seconds: 120,
      },
      {
        id: 'ha-light',
        kind: 'sensory',
        text: 'Vaihda valaistus: sytytä isot valot tai sammuta ne kokonaan.',
        why: 'Jos et pääse pois huoneesta, tee huoneesta eri näköinen. Osa vihjeestä on se, miltä paikka näyttää.',
        seconds: 15,
      },
      {
        id: 'ha-call',
        kind: 'social',
        text: 'Soita tai laita viesti yhdelle ihmiselle. Ei tarvitse kertoa miksi.',
        why: 'Yksin oleminen on osa vihjettä. Toisen ihmisen läsnäolo katkaisee sen ilman että aiheesta puhutaan.',
        seconds: 60,
      },
      {
        id: 'ha-clothes',
        kind: 'body',
        text: 'Vaihda vaatteet. Ulkovaatteet päälle, tai kotivaatteet pois.',
        why: 'Ilta-asu on itsessään vihje. Vaihto vie muutaman sekunnin ja siirtää sinut eri osaan päivää.',
        seconds: 60,
      },
      {
        id: 'ha-cold',
        kind: 'body',
        text: 'Pese kasvot kylmällä vedellä ja pidä kasvot märkinä puoli minuuttia.',
        why: 'Kylmä kasvoilla hidastaa sykettä nopeasti. Se ei poista halua, mutta se laskee vireystilan huipun.',
        seconds: 45,
      },
    ],
  },

  'home-others': {
    key: 'home-others',
    label: 'Kotona, muita paikalla',
    note: 'Muiden läsnäolo on jo puolet valmiista siirrosta. Sitä ei tarvitse selittää kenellekään käyttääkseen sitä.',
    moves: [
      {
        id: 'ho-join',
        kind: 'social',
        text: 'Mene siihen huoneeseen, missä muut ovat, ja jää sinne.',
        why: 'Vaihtaa huoneen ja katkaisee yksinolon samalla kertaa. Mitään ei tarvitse kertoa.',
        seconds: 30,
      },
      {
        id: 'ho-errand',
        kind: 'room',
        text: 'Keksi syy mennä ulos: roskat, kauppa, koira, postilaatikko.',
        why: 'Tehtävä vie ulos ovesta ilman keskustelua. Ulkona oleminen on tehokkain yksittäinen siirto.',
        seconds: 300,
      },
      {
        id: 'ho-together',
        kind: 'social',
        text: 'Ehdota jotain yhdessä tehtävää: sarja, peli, kävely.',
        why: 'Yhteinen tekeminen täyttää saman tyhjän, jota juominen täyttäisi, eikä vaadi päätöstä juomisesta.',
        seconds: 60,
      },
      {
        id: 'ho-tell',
        kind: 'social',
        text: 'Sano yhdelle heistä ääneen, että tekee mieli. Ei muuta.',
        why: 'Sanominen ääneen siirtää tilanteen automaatista takaisin harkinnan puolelle. Se on eri järjestelmä aivoissa.',
        seconds: 20,
      },
    ],
  },

  commute: {
    key: 'commute',
    label: 'Matkalla, töiden jälkeen',
    note: 'Reitti kotiin on opittu ketju: sama aika, sama suunta, sama kauppa matkan varrella. Ketju katkeaa yhdestä kohdasta.',
    moves: [
      {
        id: 'cm-route',
        kind: 'room',
        text: 'Ota eri reitti kotiin kuin se, jonka varrella kauppa on.',
        why: 'Ohittaminen vaatii päätöksen joka kerta. Eri reitti ei vaadi yhtään.',
        seconds: 30,
      },
      {
        id: 'cm-walk',
        kind: 'body',
        text: 'Jää yksi pysäkki aiemmin pois ja kävele loppumatka.',
        why: 'Katkaisee ketjun ja lisää viivettä. Viive on ainoa vipu, joka laskee välittömän palkinnon arvoa suoraan.',
        seconds: 600,
      },
      {
        id: 'cm-call',
        kind: 'social',
        text: 'Soita jollekin koko loppumatkan ajaksi.',
        why: 'Puhelu kestää juuri sen ajan, joka on hankalin, ja vie huomion pois päätöksestä.',
        seconds: 600,
      },
      {
        id: 'cm-plan',
        kind: 'sensory',
        text: 'Päätä nyt, mitä teet ensimmäiset 15 minuuttia kotona. Yksi konkreettinen asia.',
        why: 'Tyhjä eteinen on vihje. Valmis ensimmäinen teko täyttää sen kohdan, johon juominen muuten asettuu.',
        seconds: 30,
      },
    ],
  },

  out: {
    key: 'out',
    label: 'Ulkona, muiden kanssa',
    note: 'Täällä vihjeitä on tiheimmässä ja poistuminen on vaikeinta. Siirrot ovat siksi pienempiä eivätkä vaadi selityksiä.',
    moves: [
      {
        id: 'ou-step',
        kind: 'room',
        text: 'Käy ulkona viisi minuuttia. Poistu pöydästä kokonaan.',
        why: 'Pöytä, lasi ja seura ovat yhdessä yksi vihje. Riittää, että poistut siitä hetkeksi.',
        seconds: 300,
      },
      {
        id: 'ou-bar',
        kind: 'room',
        text: 'Siirry pois tiskin läheltä ja istu selkä siihen päin.',
        why: 'Näkyvä tarjonta pitää halun käynnissä. Näkökentän vaihto on pienin mahdollinen kontekstin muutos.',
        seconds: 30,
      },
      {
        id: 'ou-hands',
        kind: 'body',
        text: 'Hae jotain muuta juotavaa ja pidä lasi kädessä.',
        why: 'Tyhjä käsi on oma vihjeensä, ja se myös kutsuu tarjoamaan. Täysi lasi poistaa molemmat.',
        seconds: 120,
      },
      {
        id: 'ou-leave',
        kind: 'social',
        text: 'Päätä lähtöaika ja sano se ääneen jollekin.',
        why: 'Ääneen sanottu aika on päätös, joka on tehty nyt eikä kolmen tunnin päästä väsyneenä.',
        seconds: 20,
      },
    ],
  },

  bed: {
    key: 'bed',
    label: 'Sängyssä',
    note: 'Tämä on eri tilanne kuin muut, ja sitä hoidetaan unilääketieteen ohjeilla — ei rauhoittumisvinkeillä. Ohjeet alla ovat unettomuuden hoidosta ja ne ovat tarkoituksella epäintuitiivisia.',
    moves: [
      {
        id: 'bd-up',
        kind: 'room',
        text: 'Nouse sängystä ja mene toiseen huoneeseen. Palaa vasta kun oikeasti väsyttää.',
        why: 'Unettomuuden hoidon vaikuttavin yksittäinen ohje. Sänky menettää tehonsa, jos siinä valvotaan — myös siinä, että siinä tekee mieli.',
        seconds: 60,
      },
      {
        id: 'bd-clock',
        kind: 'sensory',
        text: 'Käännä kello pois näkyvistä. Älä katso aikaa uudestaan.',
        why: 'Ajan seuraaminen ylläpitää vireyttä ja tekee valvomisesta suoritteen, jossa voi jäädä jälkeen.',
        seconds: 10,
      },
      {
        id: 'bd-dim',
        kind: 'sensory',
        text: 'Jos nouset, pidä valot himmeinä. Ei kirkasta ruutua kasvojen edessä.',
        why: 'Kirkas valo siirtää sisäistä kelloa myöhemmäksi ja tekee huomisillasta saman ongelman uudestaan.',
        seconds: 15,
      },
      {
        id: 'bd-curtain',
        kind: 'sensory',
        text: 'Avaa verho valmiiksi ja aseta herätys samaan aikaan kuin eilen.',
        why: 'Aamun valo on vahvin yksittäinen vipu sisäiseen kelloon, ja sisävalaistus on siihen kertaluokan liian himmeä. Tämän voi tehdä nyt, jolloin huomisaamusta tulee oletus eikä päätös.',
        seconds: 30,
      },
      {
        id: 'bd-breath',
        kind: 'body',
        text: 'Laske 20 hidasta uloshengitystä. Uloshengitys pidempi kuin sisään.',
        why: 'Pidennetty uloshengitys laskee vireystilaa mitattavasti. Tämä on paneelin ainoa keino, jolla on vahva näyttö juuri tähän.',
        seconds: 240,
      },
    ],
  },

  elsewhere: {
    key: 'elsewhere',
    label: 'Jossain muualla',
    note: 'Yleiset siirrot: vaihda se, mikä on vaihdettavissa.',
    moves: [
      {
        id: 'el-move',
        kind: 'room',
        text: 'Vaihda huonetta tai mene ulos, jos se on mahdollista.',
        why: 'Paikan vaihto on tämän sovelluksen parhaiten tuettu keino. Kaikki muu tässä listassa on toiseksi paras.',
        seconds: 60,
      },
      {
        id: 'el-posture',
        kind: 'body',
        text: 'Vaihda asentoa. Seiso, jos istut. Kävele, jos seisot.',
        why: 'Asento on osa tilannetta. Kun mikään muu ei ole vaihdettavissa, tämä on.',
        seconds: 20,
      },
      {
        id: 'el-cold',
        kind: 'body',
        text: 'Kylmää vettä kasvoille tai ranteille.',
        why: 'Laskee vireystilan huippua nopeasti eikä vaadi paikkaa eikä välineitä.',
        seconds: 45,
      },
      {
        id: 'el-message',
        kind: 'social',
        text: 'Laita viesti yhdelle ihmiselle.',
        why: 'Toinen ihminen tilanteessa muuttaa tilanteen. Aiheesta ei tarvitse puhua.',
        seconds: 60,
      },
    ],
  },
};

export const situationLabel = (key: SituationKey): string => SITUATIONS[key].label;

/**
 * The moves for a situation, relocation first.
 *
 * Ordering is a claim about evidence, so it lives here rather than in the view:
 * changing the physical context has the best support, and a panel that led with
 * a breathing exercise would be quietly telling the user the opposite.
 */
export function movesFor(key: SituationKey): Move[] {
  const order: Record<MoveKind, number> = { room: 0, social: 1, sensory: 2, body: 3 };
  return [...SITUATIONS[key].moves].sort((a, b) => order[a.kind] - order[b.kind]);
}

/**
 * Which situation to offer first for a given need.
 *
 * Only one need maps to a place with any confidence: wanting to fall asleep
 * happens in bed. Guessing the rest would put the app in the business of
 * predicting the user, which is the thing it does not do — everything else is
 * left unselected.
 */
export function suggestedSituation(demand: string): SituationKey | undefined {
  return demand === 'sleep' ? 'bed' : undefined;
}
