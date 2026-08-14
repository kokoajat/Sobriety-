/**
 * The wait: the only screen that runs while the user is having a hard time.
 *
 * Three buttons, no forms, nothing to read that is longer than a line. All three
 * outcomes are one tap and look alike — *Otin sen* is not smaller, greyer or
 * further away than the others. An app you have to lie to stops receiving data at
 * the moment the data is worth having, and an app that makes one answer awkward
 * is an app you will lie to.
 *
 * Nothing here argues. The user knows the arguments.
 */

import { useMemo, useState } from 'react';
import { formatCountdown, isElapsed, progress, remainingMs } from '../core/waiting';
import { demandLabel } from '../core/demands';
import { rankSupplies } from '../core/stats';
import { FactPanel } from './FactPanel';
import { useNow, type Store } from '../store';
import type { Episode } from '../core/types';

interface Props {
  store: Store;
  episode: Episode;
}

export function WaitView({ store, episode }: Props) {
  const now = useNow(true);
  const [reading, setReading] = useState(store.settings.factsOn);
  const remaining = remainingMs(episode, now, store.settings);
  const done = isElapsed(episode, now, store.settings);
  const ratio = progress(episode, now, store.settings);

  const supply = useMemo(
    () => store.supplies.find((s) => s.id === episode.supplyId),
    [store.supplies, episode.supplyId],
  );
  const record = useMemo(() => {
    if (!supply) return undefined;
    return rankSupplies([supply], episode.demand)[0];
  }, [supply, episode.demand]);

  return (
    <section className="screen">
      <p className="wait-demand">{demandLabel(episode.demand, store.demands)}</p>

      {/* The ring shrinks rather than disappears: the reading is a distraction
          from the wait, not a replacement for it. Time must stay visible. */}
      <Ring ratio={ratio} label={formatCountdown(remaining)} done={done} small={reading} />

      {reading ? (
        <FactPanel store={store} />
      ) : done ? (
        <p className="wait-note">Aika kului. Miten menee?</p>
      ) : (
        <p className="wait-note">Ei tarvitse päättää mitään. Vain odottaa.</p>
      )}

      <button
        type="button"
        className="quiet"
        onClick={() => {
          const next = !reading;
          setReading(next);
          // Remembered, so the choice is made once rather than every time.
          void store.saveSettings({ ...store.settings, factsOn: next });
        }}
      >
        {reading ? 'Piilota luettava' : 'Anna jotain luettavaa'}
      </button>

      {supply && !reading && (
        <div className="card">
          <p className="card-label">Kirjoitit tähän aiemmin</p>
          <p className="card-body">{supply.label}</p>
          {record && !record.untested && (
            <p className="card-note">
              Auttanut {record.helped}/{record.attempts} kertaa tähän.
            </p>
          )}
        </div>
      )}

      <div className="actions">
        <button type="button" className="action" onClick={() => store.closeCurrent('passed')}>
          Meni ohi
        </button>
        <button type="button" className="action" onClick={store.extendCurrent}>
          Hetki lisää
        </button>
        <button type="button" className="action" onClick={() => store.closeCurrent('took')}>
          Otin sen
        </button>
      </div>

      {episode.extensions > 0 && (
        <p className="footnote">
          Jatkettu {episode.extensions === 1 ? 'kerran' : `${episode.extensions} kertaa`}.
        </p>
      )}
    </section>
  );
}

/**
 * The countdown, as a ring that empties.
 *
 * Emptying rather than filling: a bar that fills up is a goal with a finish line
 * to fall short of. A ring that drains is just time passing, which is all this is.
 */
function Ring({
  ratio,
  label,
  done,
  small,
}: {
  ratio: number;
  label: string;
  done: boolean;
  small?: boolean;
}) {
  const size = 240;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <svg
      className={small ? 'ring ring-small' : 'ring'}
      viewBox={`0 0 ${size} ${size}`}
      role="timer"
      aria-label={`Aikaa jäljellä ${label}`}
    >
      <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
      <circle
        className={done ? 'ring-arc ring-arc-done' : 'ring-arc'}
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * ratio}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text className="ring-label" x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
        {label}
      </text>
    </svg>
  );
}
