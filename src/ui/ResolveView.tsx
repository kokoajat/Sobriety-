/**
 * The evening step: what actually happened.
 *
 * The wording here does the most work in the app. "Join" is a neutral fact being
 * entered into a forecasting record, not a confession — so the outcome buttons
 * are visually identical, and the screen closes by showing how the *forecast*
 * did, never how the day did.
 */

import { useState } from 'react';
import type { FunctionTag, ObservedFork } from '../core/types';
import { functionLabel, functionOptions } from '../core/functions';
import { CHOICE_LABELS, formatMinute, formatPercent } from './labels';
import type { Store } from '../store';

interface Props {
  store: Store;
  onDone: () => void;
}

export function ResolveView({ store, onDone }: Props) {
  const day = store.days.find((d) => d.date === store.today);
  const liveForks = day?.observation?.forks ?? [];

  const [drank, setDrank] = useState<boolean | null>(
    day?.observation?.resolvedAt ? day.observation.drank : null,
  );
  const [drinks, setDrinks] = useState<string>(day?.observation?.drinks?.toString() ?? '');
  const [extra, setExtra] = useState<ObservedFork[]>([]);
  const [missedTag, setMissedTag] = useState<FunctionTag>('unwind');
  const options = functionOptions(store.functions);

  const addMissed = () => {
    setExtra((prev) => [
      ...prev,
      {
        atMin: 19 * 60,
        tag: missedTag,
        choice: 'drank',
        intensity: 3,
        // Reconstructed after the fact: pooled with live logs would inflate the
        // one metric that tracks noticing.
        loggedInMoment: false,
      },
    ]);
  };

  const save = async () => {
    if (drank === null) return;
    const parsed = Number.parseFloat(drinks.replace(',', '.'));
    await store.resolveDay({
      date: store.today,
      drank,
      drinks: Number.isFinite(parsed) ? parsed : undefined,
      forks: [...liveForks, ...extra],
      resolvedAt: Date.now(),
    });
    onDone();
  };

  return (
    <section className="view">
      <header className="view-head">
        <h1>Ilta</h1>
        {day?.forecast ? (
          <p className="lede">
            Aamulla arvioit {formatPercent(day.forecast.p)}. Miten kävi?
          </p>
        ) : (
          <p className="lede">Tälle päivälle ei tehty ennustetta, joten sitä ei pisteytetä.</p>
        )}
      </header>

      <div className="block">
        <div className="button-row">
          <button
            type="button"
            className={drank === false ? 'primary' : 'secondary'}
            onClick={() => setDrank(false)}
          >
            En juonut
          </button>
          <button
            type="button"
            className={drank === true ? 'primary' : 'secondary'}
            onClick={() => setDrank(true)}
          >
            Join
          </button>
        </div>
      </div>

      {drank && (
        <label className="field">
          Annokset (valinnainen)
          <input
            type="text"
            inputMode="decimal"
            value={drinks}
            onChange={(e) => setDrinks(e.target.value)}
            placeholder="—"
          />
          <span className="hint">Ei pakollinen. Ei vaikuta mihinkään lukuun.</span>
        </label>
      )}

      <div className="block">
        <h2>Päivän risteykset</h2>
        {liveForks.length === 0 && extra.length === 0 && (
          <p className="hint">Yhtään risteystä ei kirjattu.</p>
        )}
        <ul className="fork-log">
          {liveForks.map((f, i) => (
            <li key={`live-${i}`}>
              <span className="fork-time">{formatMinute(f.atMin)}</span>
              <span>{functionLabel(f.tag, store.functions)}</span>
              <span className="fork-choice">{CHOICE_LABELS[f.choice]}</span>
              <span className="badge">hetkessä</span>
            </li>
          ))}
          {extra.map((f, i) => (
            <li key={`extra-${i}`}>
              <span className="fork-time">—</span>
              <span>{functionLabel(f.tag, store.functions)}</span>
              <span className="fork-choice">{CHOICE_LABELS[f.choice]}</span>
              <button
                type="button"
                className="chip-remove"
                onClick={() => setExtra((prev) => prev.filter((_, j) => j !== i))}
                aria-label="Poista"
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        <p className="hint">
          Tuliko vastaan risteys, jota et huomannut silloin? Lisää se — jälkikäteen huomattu
          on eri asia kuin huomaamaton.
        </p>
        <div className="field-row">
          <label>
            Mitä varten
            <select
              value={missedTag}
              onChange={(e) => setMissedTag(e.target.value as FunctionTag)}
            >
              {options.map((o) => (
                <option key={o.tag} value={o.tag}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="secondary" onClick={addMissed}>
            Lisää
          </button>
        </div>
      </div>

      <button type="button" className="primary" onClick={save} disabled={drank === null}>
        Sulje päivä
      </button>
    </section>
  );
}
