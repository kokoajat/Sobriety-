/**
 * One screen at a time, no tab bar.
 *
 * The home screen is a single button. Everything else is behind it, because the
 * one moment this app has to work is the moment when reading a navigation bar is
 * beyond what anyone wants to do. Preparation and history are two quiet links
 * below the fold of attention, not destinations competing with the button.
 */

import { useEffect, useRef, useState } from 'react';
import { useStore } from './store';
import { WaitView } from './ui/WaitView';
import { DemandView } from './ui/DemandView';
import { AfterView } from './ui/AfterView';
import { PrepareView } from './ui/PrepareView';
import { HistoryView } from './ui/HistoryView';
import { medianTimeToPassMs } from './core/stats';
import { formatMinutes } from './ui/labels';
import type { Episode } from './core/types';

type Mode = 'home' | 'demand' | 'after' | 'prepare' | 'history';

export function App() {
  const store = useStore();
  const [mode, setMode] = useState<Mode>('home');
  const [justClosed, setJustClosed] = useState<Episode | null>(null);
  const runningId = useRef<string | null>(null);

  /**
   * Notice the moment a wait ends, so the acknowledgement screen can follow it.
   *
   * Tracked through the episode id rather than component state because the wait
   * itself lives in storage: the screen may have been unmounted and remounted
   * several times while it ran.
   */
  useEffect(() => {
    if (store.current) {
      runningId.current = store.current.id;
      return;
    }
    const id = runningId.current;
    if (!id) return;
    runningId.current = null;
    const finished = store.episodes.find((e) => e.id === id && e.endedAt !== undefined);
    if (finished) {
      setJustClosed(finished);
      setMode('after');
    }
  }, [store.current, store.episodes]);

  if (!store.ready) {
    return <main className="app" />;
  }

  // A running wait outranks every other screen: reopening the app mid-urge must
  // land back in the countdown, not on a menu.
  if (store.current) {
    return (
      <main className="app">
        <WaitView store={store} episode={store.current} />
      </main>
    );
  }

  if (mode === 'after' && justClosed) {
    return (
      <main className="app">
        <AfterView
          store={store}
          episode={justClosed}
          onDone={() => {
            setJustClosed(null);
            setMode('home');
          }}
        />
      </main>
    );
  }

  if (mode === 'demand') {
    return (
      <main className="app">
        <DemandView store={store} onStarted={() => setMode('home')} onCancel={() => setMode('home')} />
      </main>
    );
  }

  if (mode === 'prepare') {
    return (
      <main className="app">
        <PrepareView store={store} onBack={() => setMode('home')} />
      </main>
    );
  }

  if (mode === 'history') {
    return (
      <main className="app">
        <HistoryView store={store} onBack={() => setMode('home')} />
      </main>
    );
  }

  return (
    <main className="app">
      <HomeView store={store} onPress={() => setMode('demand')} onGo={setMode} />
    </main>
  );
}

function HomeView({
  store,
  onPress,
  onGo,
}: {
  store: ReturnType<typeof useStore>;
  onPress: () => void;
  onGo: (mode: Mode) => void;
}) {
  const closed = store.episodes.filter((e) => e.endedAt !== undefined);
  const typical = medianTimeToPassMs(closed);

  return (
    <section className="screen screen-home">
      <button type="button" className="big-button" onClick={onPress}>
        Nyt tekee mieli
      </button>

      {Number.isFinite(typical) ? (
        <p className="home-note">
          Omissa merkinnöissäsi himo on mennyt ohi {formatMinutes(typical)}.
        </p>
      ) : (
        <p className="home-note">
          Paina kun tekee mieli. Sovellus ei kysy muuta kuin mitä se tekisi, ja pyytää
          odottamaan kymmenen minuuttia.
        </p>
      )}

      <div className="quiet-links">
        <button type="button" className="quiet" onClick={() => onGo('prepare')}>
          Valmistelu
        </button>
        <button type="button" className="quiet" onClick={() => onGo('history')}>
          Historia
        </button>
      </div>
    </section>
  );
}
