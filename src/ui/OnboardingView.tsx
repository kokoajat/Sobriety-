/**
 * The one question asked before anything else: when does your day turn over?
 *
 * Every number in the app is measured against this axis. A day that ends at
 * midnight splits an evening that ran to 01:30 into two, files the second half
 * under a day that was never forecast, and quietly drops the first half's
 * forecast from scoring. Guessing that boundary for the user gets it wrong for
 * anyone whose evenings do not respect the calendar.
 *
 * It stays one screen, it is skippable, and it destroys nothing: an existing
 * user meeting it for the first time can dismiss it and lose no data. Asking
 * more here — how much they drink, what they want to change — would turn a
 * setup step into an audit, on a screen the user has no reason to trust yet.
 */

import { useState } from 'react';
import type { Settings } from '../core/types';
import { formatMinute } from './labels';

/** Whole hours around the small hours: the boundary wants to sit where nothing happens. */
const DAY_START_OPTIONS = [0, 3, 4, 5, 6, 7].map((h) => h * 60);

/** Evening and night, since closing a day before evening makes no sense. */
const RESOLVE_OPTIONS = [
  18 * 60,
  19 * 60,
  20 * 60,
  21 * 60,
  21 * 60 + 30,
  22 * 60,
  23 * 60,
  0,
  60,
  2 * 60,
];

interface Props {
  settings: Settings;
  onDone: (settings: Settings) => void;
}

export function OnboardingView({ settings, onDone }: Props) {
  const [dayStartsAtMin, setDayStartsAtMin] = useState(settings.dayStartsAtMin);
  const [resolveAtMin, setResolveAtMin] = useState(settings.resolveAtMin);

  const finish = (values: Partial<Settings>) =>
    onDone({ ...settings, dayStartsAtMin, resolveAtMin, onboardedAt: Date.now(), ...values });

  return (
    <section className="view">
      <header className="view-head">
        <h1>Oma rytmi</h1>
        <p className="lede">
          Yksi kysymys ennen aloitusta. Sovellus mittaa kaiken päivinä, joten sen pitää
          tietää milloin sinun päiväsi vaihtuu — muuten puolenyön yli jatkunut ilta
          katkeaa kahtia keskeltä.
        </p>
      </header>

      <div className="block">
        <label className="field">
          Päiväni vaihtuu noin klo
          <select
            value={dayStartsAtMin}
            onChange={(e) => setDayStartsAtMin(Number(e.target.value))}
          >
            {DAY_START_OPTIONS.map((min) => (
              <option key={min} value={min}>
                {formatMinute(min)}
              </option>
            ))}
          </select>
        </label>
        <p className="hint">
          Valitse hetki jolloin nukut tai olet muuten varmasti lopettanut. Kaikki mitä
          kirjaat ennen tätä kelloa kuuluu edelliseen päivään.
        </p>
      </div>

      <div className="block">
        <label className="field">
          Suljen päivän yleensä klo
          <select value={resolveAtMin} onChange={(e) => setResolveAtMin(Number(e.target.value))}>
            {RESOLVE_OPTIONS.map((min) => (
              <option key={min} value={min}>
                {formatMinute(min)}
              </option>
            ))}
          </select>
        </label>
        <p className="hint">
          Tästä hetkestä eteenpäin sovellus kysyy miten päivä meni. Voit sulkea päivän
          aiemminkin.
        </p>
      </div>

      <button type="button" className="primary" onClick={() => finish({})}>
        Aloita
      </button>
      <button
        type="button"
        className="secondary"
        onClick={() =>
          finish({ dayStartsAtMin: settings.dayStartsAtMin, resolveAtMin: settings.resolveAtMin })
        }
      >
        Ohita — oletukset käyvät
      </button>
      <p className="hint centred">Molemmat voi vaihtaa myöhemmin Tiedot-välilehdellä.</p>
    </section>
  );
}
