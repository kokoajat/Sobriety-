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
import { TechniquePanel } from './TechniquePanel';
import { MovePanel } from './MovePanel';
import { useWakeLock } from './useWakeLock';
import { useNow, type Store } from '../store';
import type { Episode } from '../core/types';

interface Props {
  store: Store;
  episode: Episode;
}

export function WaitView({ store, episode }: Props) {
  const now = useNow(true);
  // Held for the whole wait: a screen that sleeps at 30 seconds leaves the
  // person alone with the craving and makes returning a deliberate act.
  useWakeLock(true);
  // At most one companion is open at a time. The wait screen must stay a screen
  // you can take in at a glance, not a dashboard with panels stacked on it.
  const [companion, setCompanion] = useState<'none' | 'reading' | 'technique' | 'move'>(
    store.settings.factsOn ? 'reading' : 'none',
  );
  const busy = companion !== 'none';
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
      <Ring ratio={ratio} label={formatCountdown(remaining)} done={done} small={busy} />

      {companion === 'reading' ? (
        <FactPanel store={store} />
      ) : companion === 'technique' ? (
        <TechniquePanel />
      ) : companion === 'move' ? (
        <MovePanel store={store} episode={episode} />
      ) : done ? (
        <p className="wait-note">Aika kului. Miten menee?</p>
      ) : (
        <p className="wait-note">Ei tarvitse päättää mitään. Vain odottaa.</p>
      )}

      <div className="quiet-links">
        {/*
          First of the three, deliberately. Order on this row is a claim about
          which one is worth trying, and changing the context has better support
          than anything else the app can offer during a wait.
        */}
        <button
          type="button"
          className="quiet"
          onClick={() => setCompanion(companion === 'move' ? 'none' : 'move')}
        >
          {companion === 'move' ? 'Piilota siirrot' : 'Vaihda paikkaa'}
        </button>
        <button
          type="button"
          className="quiet"
          onClick={() => {
            const next = companion === 'reading' ? 'none' : 'reading';
            setCompanion(next);
            // The reading choice is remembered; the technique one is not, since
            // which technique suits a moment changes with the moment.
            void store.saveSettings({ ...store.settings, factsOn: next === 'reading' });
          }}
        >
          {companion === 'reading' ? 'Piilota luettava' : 'Luettavaa'}
        </button>
        <button
          type="button"
          className="quiet"
          onClick={() => setCompanion(companion === 'technique' ? 'none' : 'technique')}
        >
          {companion === 'technique' ? 'Piilota keino' : 'Rauhoittumiskeino'}
        </button>
      </div>

      {supply && !busy && (
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
