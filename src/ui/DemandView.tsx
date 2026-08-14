/**
 * One question, one tap: what would the drink do right now?
 *
 * Asked forward, not backward. The point is not to file the urge under a category
 * — it is to pick which prepared response gets offered in the next three seconds.
 *
 * Six options plus the user's own, in two columns, sized to fit a phone without
 * scrolling. The previous version of this app put its "name your own" option
 * below eight full-width tiles, where it fell off the screen; a choice you have to
 * scroll to find is not a choice available during an urge.
 */

import { useEffect, useRef, useState } from 'react';
import { demandOptions } from '../core/demands';
import { pickSupply } from '../core/stats';
import type { Store } from '../store';
import type { Demand } from '../core/types';

interface Props {
  store: Store;
  onStarted: () => void;
  onCancel: () => void;
}

export function DemandView({ store, onStarted, onCancel }: Props) {
  const [naming, setNaming] = useState(false);
  const [label, setLabel] = useState('');
  const namingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (naming) namingRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [naming]);

  const start = async (demand: Demand) => {
    const offer = pickSupply(store.supplies, demand);
    await store.begin(demand, offer?.supply.id);
    onStarted();
  };

  const nameAndStart = async () => {
    const created = await store.addDemand(label);
    if (!created) return;
    setLabel('');
    setNaming(false);
    await start(created);
  };

  return (
    <section className="screen">
      <h1 className="ask">Mitä se tekisi juuri nyt?</h1>

      <ul className="demand-grid">
        {demandOptions(store.demands).map((option) => (
          <li key={option.demand}>
            <button type="button" className="demand" onClick={() => start(option.demand)}>
              {option.label}
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            className="demand demand-add"
            onClick={() => setNaming(true)}
          >
            Muu…
          </button>
        </li>
      </ul>

      {naming && (
        <div className="card" ref={namingRef}>
          <label className="field">
            Omin sanoin
            <input
              type="text"
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void nameAndStart();
              }}
              placeholder="mitä se tekisi"
            />
          </label>
          <div className="actions">
            <button type="button" className="action" onClick={nameAndStart}>
              Aloita
            </button>
            <button
              type="button"
              className="action"
              onClick={() => {
                setNaming(false);
                setLabel('');
              }}
            >
              Peruuta
            </button>
          </div>
        </div>
      )}

      <button type="button" className="quiet" onClick={onCancel}>
        Takaisin
      </button>
    </section>
  );
}
