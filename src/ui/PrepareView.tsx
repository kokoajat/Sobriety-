/**
 * The calm hours: stocking the shelf.
 *
 * Alcohol is extremely cheap at the moment of an urge — fast, reliable, requires
 * no decision. Anything competing with it has to be available on the same terms,
 * which means chosen in advance and named in the user's own words. Asking "what
 * could you do instead?" mid-urge asks for the one faculty that is not available.
 *
 * So this screen exists to be used when nothing is happening, and the wait screen
 * only ever hands back what was put here.
 */

import { useState } from 'react';
import { BUILTIN_DEMANDS } from '../core/types';
import { demandLabel, demandOptions } from '../core/demands';
import { rankSupplies } from '../core/stats';
import type { Store } from '../store';
import type { Demand } from '../core/types';

export function PrepareView({ store, onBack }: { store: Store; onBack: () => void }) {
  const [demand, setDemand] = useState<Demand>(BUILTIN_DEMANDS[0]);
  const [label, setLabel] = useState('');

  const ranked = rankSupplies(store.supplies, demand);
  const ownDemands = store.demands.filter((d) => !d.archived);

  const add = async () => {
    await store.addSupply(label, demand);
    setLabel('');
  };

  return (
    <section className="screen screen-scroll">
      <h1 className="ask">Valmistelu</h1>
      <p className="wait-note">
        Risteyksessä ei ehdi keksiä mitään. Siellä on käytettävissä vain se, mikä on
        jo valmiina.
      </p>

      <div className="card">
        <label className="field">
          Mihin tarpeeseen
          <select value={demand} onChange={(e) => setDemand(e.target.value)}>
            {demandOptions(store.demands).map((o) => (
              <option key={o.demand} value={o.demand}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {ranked.length > 0 && (
          <ul className="stock">
            {ranked.map((r) => (
              <li key={r.supply.id}>
                <span>{r.supply.label}</span>
                <span className="card-note">
                  {r.untested ? 'kokeilematta' : `${r.helped}/${r.attempts}`}
                </span>
                <button
                  type="button"
                  className="remove"
                  onClick={() => store.archiveSupply(r.supply.id)}
                  aria-label={`Poista ${r.supply.label}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <label className="field">
          Mikä voisi auttaa tähän
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void add();
            }}
            placeholder="kävely ulkona"
          />
        </label>
        <button type="button" className="action wide" onClick={add}>
          Lisää
        </button>
        <p className="card-note">
          Konkreettinen ja käden ulottuvilla kolmessa sekunnissa. Ei parempi ihminen.
        </p>
      </div>

      {ownDemands.length > 0 && (
        <div className="card">
          <p className="card-label">Omat tarpeet</p>
          <ul className="stock">
            {ownDemands.map((d) => (
              <li key={d.id}>
                <span>{demandLabel(d.id, store.demands)}</span>
                <span className="card-note" />
                <button
                  type="button"
                  className="remove"
                  onClick={() => store.archiveDemand(d.id)}
                  aria-label={`Poista ${d.label}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <p className="card-note">
            Poistaminen ei poista historiaa: vanhat merkinnät säilyvät luettavina.
          </p>
        </div>
      )}

      <button type="button" className="quiet" onClick={onBack}>
        Takaisin
      </button>
    </section>
  );
}
