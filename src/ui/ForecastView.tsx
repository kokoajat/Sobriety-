/**
 * The morning step: a probability and the forks you expect.
 *
 * This is the only screen that blocks the rest of the app, because it is the
 * only screen whose input cannot be reconstructed afterwards. A forecast made in
 * the evening is not a forecast.
 */

import { useState } from 'react';
import { BLOCKS, type Block, type ForkPrediction, type FunctionTag } from '../core/types';
import { functionLabel, functionOptions } from '../core/functions';
import { BLOCK_CLOCK, BLOCK_LABELS, WEEKDAYS } from './labels';
import type { Store } from '../store';

interface Props {
  store: Store;
  onDone: () => void;
}

export function ForecastView({ store, onDone }: Props) {
  const existing = store.days.find((d) => d.date === store.today)?.forecast;
  const [p, setP] = useState(existing ? Math.round(existing.p * 100) : 30);
  const [forks, setForks] = useState<ForkPrediction[]>(existing?.forks ?? []);
  const [block, setBlock] = useState<Block>('evening');
  const [tag, setTag] = useState<FunctionTag>('unwind');
  const [cue, setCue] = useState('');

  const weekday = WEEKDAYS[new Date(`${store.today}T12:00:00`).getDay()];
  const options = functionOptions(store.functions);

  const addFork = () => {
    setForks((prev) => [...prev, { block, tag, cue: cue.trim() || undefined }]);
    setCue('');
  };

  const save = async () => {
    await store.saveForecast({
      date: store.today,
      p: p / 100,
      forks,
      madeAt: Date.now(),
    });
    onDone();
  };

  return (
    <section className="view">
      <header className="view-head">
        <h1>{weekday}</h1>
        <p className="lede">
          Kuinka todennäköisesti juot tänään? Arvaa rehellisesti, älä tavoitteen mukaan.
          Tässä ei ole oikeaa vastausta — vain tarkka tai epätarkka.
        </p>
      </header>

      <div className="probability">
        <output className="probability-value">{p} %</output>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={p}
          onChange={(e) => setP(Number(e.target.value))}
          aria-label="Juomisen todennäköisyys tänään"
        />
        <div className="probability-scale">
          <span>En varmasti</span>
          <span>En tiedä</span>
          <span>Varmasti</span>
        </div>
      </div>

      <div className="block">
        <h2>Missä kohtaa päivä haarautuu?</h2>
        <p className="hint">
          Nimeä hetket, joissa valinta oikeasti tehdään. Päätös syntyy yleensä kauan ennen
          ensimmäistä lasillista.
        </p>

        {forks.length > 0 && (
          <ul className="chip-list">
            {forks.map((f, i) => (
              <li key={i} className="chip">
                <span>
                  {BLOCK_LABELS[f.block]} · {functionLabel(f.tag, store.functions)}
                  {f.cue ? ` · ${f.cue}` : ''}
                </span>
                <button
                  type="button"
                  className="chip-remove"
                  onClick={() => setForks((prev) => prev.filter((_, j) => j !== i))}
                  aria-label="Poista"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="field-row">
          <label>
            Milloin
            <select value={block} onChange={(e) => setBlock(e.target.value as Block)}>
              {BLOCKS.map((b) => (
                <option key={b} value={b}>
                  {BLOCK_LABELS[b]} ({BLOCK_CLOCK[b]})
                </option>
              ))}
            </select>
          </label>
          <label>
            Mitä varten
            <select value={tag} onChange={(e) => setTag(e.target.value as FunctionTag)}>
              {options.map((o) => (
                <option key={o.tag} value={o.tag}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          Mistä tunnistat sen (valinnainen)
          <input
            type="text"
            value={cue}
            onChange={(e) => setCue(e.target.value)}
            placeholder="kun suljen läppärin"
          />
        </label>
        <button type="button" className="secondary" onClick={addFork}>
          Lisää risteys
        </button>
      </div>

      <button type="button" className="primary" onClick={save}>
        Tallenna ennuste
      </button>
    </section>
  );
}
