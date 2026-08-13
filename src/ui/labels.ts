/**
 * Finnish UI strings.
 *
 * House rule for every string in this file: describe, never evaluate. No string
 * may congratulate a dry day or mark a wet one. Shame is one of the
 * best-documented relapse drivers, so an app that hands out a small dose of it
 * every evening is manufacturing the thing it claims to treat.
 */

import type { Block, ForkChoice, FunctionTag } from '../core/types';

export const FUNCTION_LABELS: Record<FunctionTag, string> = {
  unwind: 'Työstä vapaalle',
  social: 'Sosiaalinen jännitys',
  sleep: 'Nukahtaminen',
  boredom: 'Tyhjä ilta',
  numb: 'Tunteen vaimennus',
  celebrate: 'Juhla tai palkinto',
  ritual: 'Tapa, käsi tekee itsestään',
  craving: 'Pelkkä himo',
};

export const FUNCTION_HINTS: Record<FunctionTag, string> = {
  unwind: 'Työpäivä ei muuten lopu mihinkään.',
  social: 'Toisten seurassa oleminen on helpompaa.',
  sleep: 'Ilman sitä uni ei tule.',
  boredom: 'Ilta on tyhjä ja pitkä.',
  numb: 'Jokin tunne pitää saada hiljaisemmaksi.',
  celebrate: 'Tämä ansaitaan.',
  ritual: 'Ei erityistä syytä, näin vain tehdään.',
  craving: 'Tekee mieli, eikä siihen liity mitään muuta.',
};

export const BLOCK_LABELS: Record<Block, string> = {
  morning: 'Aamu',
  afternoon: 'Iltapäivä',
  evening: 'Ilta',
  night: 'Yö',
};

export const BLOCK_CLOCK: Record<Block, string> = {
  morning: '05–12',
  afternoon: '12–17',
  evening: '17–22',
  night: '22–05',
};

export const CHOICE_LABELS: Record<ForkChoice, string> = {
  drank: 'Join',
  delayed: 'Siirsin',
  substituted: 'Tein jotain muuta',
  passed: 'Ohitin',
};

export const WEEKDAYS = ['Sunnuntai', 'Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai'];

export const WEEKDAYS_SHORT = ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'];

export function formatPercent(x: number, digits = 0): string {
  return Number.isFinite(x) ? `${(x * 100).toFixed(digits)} %` : '–';
}

export function formatScore(x: number, digits = 3): string {
  return Number.isFinite(x) ? x.toFixed(digits) : '–';
}

export function formatMinute(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
}

/**
 * Plain-language reading of the skill score. Deliberately flat in tone at every
 * level: the low end is a starting point, not a failure.
 */
export function readSkill(skillScore: number, n: number): string {
  if (!Number.isFinite(skillScore) || n < 7) {
    return 'Liian vähän päiviä. Tämä alkaa näyttää joltain noin viikon jälkeen.';
  }
  if (skillScore <= 0) {
    return 'Ennusteesi eivät vielä kerro päivistä enempää kuin keskiarvosi kertoisi.';
  }
  if (skillScore < 0.15) {
    return 'Ennusteesi alkavat erottaa päiviä toisistaan.';
  }
  if (skillScore < 0.35) {
    return 'Tunnistat päivän luonteen aamulla selvästi keskiarvoa paremmin.';
  }
  return 'Tiedät aamulla jo pitkälti, millainen päivä on tulossa.';
}

/** Reading of the calibration bias, in the direction that matters. */
export function readBias(bias: number, n: number): string {
  if (!Number.isFinite(bias) || n < 7) return 'Odottaa dataa.';
  if (bias < -0.12) return 'Aliarvioit riskisi järjestelmällisesti.';
  if (bias > 0.12) return 'Yliarvioit riskisi järjestelmällisesti.';
  return 'Ennusteesi osuvat keskimäärin oikealle tasolle.';
}

export function readSpread(spread: number, n: number): string {
  if (!Number.isFinite(spread) || n < 7) return 'Odottaa dataa.';
  if (spread < 0.08) {
    return 'Annat joka päivälle käytännössä saman luvun. Päivät eivät ole samanlaisia.';
  }
  return 'Erottelet päiviä toisistaan.';
}
