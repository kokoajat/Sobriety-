/**
 * What actually happens, and when — the app's one promise-free page.
 *
 * This exists to prevent a specific failure. Almost every app in this category
 * implies that each day is easier than the last. That is false in a way that
 * matters: *tonic* craving does fade, but **cue-triggered** craving can be
 * stronger at two months than at one week. Grimm et al. (2001) showed it in rats
 * and named it incubation of craving; in alcohol-dependent inpatients measured at
 * days 7, 14, 30 and 60, cue-induced craving was highest at day 60.
 *
 * An app that has promised steady improvement has nothing to say on the day that
 * promise breaks — which is precisely the day it is needed. So this page makes no
 * promise. It lists what is known, with its source and its caveat, including the
 * parts that are inconvenient.
 *
 * Rules for what may go on this page:
 *   - every entry names where it comes from
 *   - every entry that has a serious caveat carries it in the same box
 *   - rodent findings are labelled as rodent findings
 *   - nothing here is personalised, so nothing here can be fallen behind on
 */

export interface Phase {
  id: string;
  /** When, in the user's terms. */
  window: string;
  heading: string;
  body: string;
  /** Named so a curious reader can check, and a sceptical one can argue. */
  source: string;
  /** The honest limit of the finding above. */
  caveat?: string;
  /** Emphasised: this is a safety matter, not an expectation. */
  urgent?: boolean;
}

export const PHASES: Phase[] = [
  {
    id: 'acute',
    window: '0–3 vrk',
    heading: 'Vieroitus, jos käyttö on ollut päivittäistä',
    body: 'Krooninen alkoholi vaimentaa GABA-jarrua ja lisää NMDA-kaasua. Kun alkoholi poistuu, jäljelle jää vaimennettu jarru ja vahvistettu kaasu. Kouristusriski on suurin 6–48 tunnin kohdalla, delirium tyypillisesti 48–96 tunnin kohdalla.',
    source: 'Vakiintunutta farmakologiaa; hoito on rutiinia terveydenhuollossa.',
    caveat:
      'Toistuvat omin päin tehdyt katkaisut herkistävät järjestelmää — ilmiö nimeltä kindling (Ballenger & Post, 1978). Kymmenes katkaisu on riskialttiimpi kuin ensimmäinen samalla juomamäärällä.',
    urgent: true,
  },
  {
    id: 'sleep-early',
    window: 'Ensimmäinen viikko',
    heading: 'Uni menee rikki ennen kuin se paranee',
    body: 'Alkoholi vaimentaa REM-unta. Kun se loppuu, REM palaa takaisin kertyneenä: eläviä unia, katkonaista unta, heräilyä yön jälkipuoliskolla.',
    source: 'REM-rebound on hyvin kuvattu unilaboratorioissa.',
  },
  {
    id: 'structure',
    window: '1 vk – 1 kk',
    heading: 'Suurin osa rakenteellisesta palautumisesta tapahtuu tässä',
    body: 'Sarjakuvantamisessa harmaan aineen muutos viikon ja kuukauden välillä oli merkitsevästi suurempi kuin koko sitä seuraavan 6,5 kuukauden aikana. Palautumista näkyi otsa-, päälaki- ja takaraivolohkoissa, talamuksessa ja pikkuaivoissa.',
    source: 'Durazzo ym. 2015, Addiction Biology — MRI viikon, kuukauden ja 7,5 kuukauden kohdalla.',
    caveat:
      'Kuvantaminen mittaa tilavuutta, ei toimintakykyä. Osa varhaisesta muutoksesta voi olla nestetasapainon normalisoitumista eikä uutta kudosta. Tätä ei ole ratkaistu.',
  },
  {
    id: 'anhedonia',
    window: '2–8 vk',
    heading: 'Vaihe, jossa mikään ei tunnu miltään',
    body: 'Palkkiojärjestelmän asetuspiste on siirtynyt. PET-tutkimuksissa dopamiinin vapautuminen on voimakkaasti vaimentunut myös vieroituksen jälkeen, ja D2-reseptorien palautuminen on hidasta ja epätäydellistä. Kokemuksena: raittius on saavutettu, eikä siitä seuraa mitään hyvää.',
    source: 'Volkow ym. 2007; Koobin allostaasimalli, jossa tätä tilaa kutsutaan hyperkatifeiaksi.',
    caveat:
      'Tämä ei ole masennusta eikä merkki siitä, että lopettaminen oli virhe. Se on vaihe, jolla on aikataulu — mutta jos se ei väisty, se kannattaa tutkia erikseen.',
  },
  {
    id: 'incubation',
    window: 'Noin 2 kk',
    heading: 'Vihjeen laukaisema himo voi olla voimakkaimmillaan nyt',
    body: 'Alkoholiriippuvaisilla osastopotilailla vihjeen laukaisema himo mitattiin päivinä 7, 14, 30 ja 60. Se oli korkeimmillaan päivänä 60. Taustalla jyskyttävä himo laskee ajan myötä — mutta äkillinen, vihjeestä lähtevä ei välttämättä laske. Ne ovat eri ilmiöitä.',
    source:
      'Ilmiön nimi on incubation of craving; Grimm ym. 2001 (Nature, rotta), toistettu ihmisillä alkoholilla.',
    caveat:
      'Tämä on syy siihen, ettei tämä sovellus lupaa, että joka päivä on edellistä helpompi. Se lupaus pettäisi juuri sinä päivänä, jona sitä eniten tarvitaan.',
  },
  {
    id: 'sleep-late',
    window: '1–6 kk',
    heading: 'Unettomuus voi jatkua — ja se on hoidettavissa',
    body: 'Unihäiriö alkuvaiheen raittiudessa voi kestää kuukausia, ja se ennustaa retkahdusta itsenäisesti muista tekijöistä. Unettomuuden lääkkeetön hoito (CBT-I) toimii myös tässä ryhmässä.',
    source: 'Browerin työ unesta ja retkahduksesta.',
    caveat:
      'Tämä on koko listan käyttökelpoisin kohta: se on mitattava, hoidettava ja se osuu juuri siihen perusteluun, jolla paluu useimmin selitetään.',
  },
  {
    id: 'partial',
    window: '7,5 kk',
    heading: 'Palautuminen on todellista muttei täydellistä',
    body: 'Samassa seurannassa harmaan aineen tilavuus oli 7,5 kuukauden kohdalla yhä pienempi kuin verrokeilla kaikilla mitatuilla alueilla paitsi otsalohkossa.',
    source: 'Durazzo ym. 2015.',
    caveat:
      'Tupakointi hidastaa palautumista, ja vaikutus kasvaa iän myötä. Osa aineiston eroista voi johtua muusta kuin alkoholista — ravitsemuksesta, maksasta, muista päihteistä.',
  },
  {
    id: 'memory',
    window: 'Vuosia',
    heading: 'Muisti ei pyyhkiydy — sen rinnalle rakennetaan toinen',
    body: 'Ekstinktio ei poista alkuperäistä assosiaatiota. Se luo kilpailevan, ja kilpaileva on kontekstisidonnainen samalla kun alkuperäinen ei ole. Siksi vanha paikka voi yllättää vuosienkin jälkeen, ja siksi paikan vaihtaminen toimii.',
    source: 'Boutonin oppimistutkimus: renewal, spontaneous recovery, reinstatement.',
    caveat:
      'Tämä on epäsymmetria, ei epäonnistuminen. Se on myös syy siihen, miksi tässä sovelluksessa on "Vaihda paikkaa" eikä "Päätä lujemmin".',
  },
];

/**
 * The one line that has to survive if nothing else on the page is read.
 *
 * Placed at the top of the view rather than the bottom for that reason.
 */
export const HEADLINE =
  'Aivot eivät palaudu yhtenä kappaleena. Ne palautuvat eri osissa, eri nopeuksilla — eikä himo laske tasaisesti ajan myötä.';
