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
import { ScreeningView } from './ui/ScreeningView';
import { SafetyView } from './ui/SafetyView';
import { TimelineView } from './ui/TimelineView';
import { eraseAll } from './storage/db';
import { medianTimeToPassMs } from './core/stats';
import { formatMinutes } from './ui/labels';
import type { Episode } from './core/types';

type Mode =
  | 'home'
  | 'demand'
  | 'after'
  | 'prepare'
  | 'history'
  | 'safety'
  | 'screening'
  | 'timeline';

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
    return (
      <main className="app">
        <section className="screen screen-home">
          <p className="home-note">Ladataan…</p>
        </section>
      </main>
    );
  }

  // Storage failed. Say so plainly and offer the one thing that reliably fixes
  // it, rather than presenting an empty screen the user cannot interpret.
  if (store.error) {
    return (
      <main className="app">
        <section className="screen screen-scroll">
          <h1 className="ask">Tietoja ei voitu lukea</h1>
          <p className="wait-note">
            Selaimen tietokantaa ei saatu auki. Sovellus toimii silti, mutta aiempia
            merkintöjä ei näy ennen kuin tämä ratkeaa.
          </p>
          <div className="card">
            <p className="card-label">Virhe</p>
            <p className="card-note">{store.error}</p>
          </div>
          <button type="button" className="action wide" onClick={() => window.location.reload()}>
            Yritä uudelleen
          </button>
          <button
            type="button"
            className="quiet"
            onClick={async () => {
              await eraseAll();
              window.location.reload();
            }}
          >
            Tyhjennä tiedot ja aloita alusta
          </button>
        </section>
      </main>
    );
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

  // The safety screen. Ahead of the home screen on first open, and reachable
  // again from the safety page — but never ahead of a wait that is already
  // running, which is why it sits below that check.
  if (mode === 'screening' || !store.settings.screening) {
    return (
      <main className="app">
        <ScreeningView
          onDone={async (record) => {
            await store.saveSettings({ ...store.settings, screening: record });
            setMode('home');
          }}
        />
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

  if (mode === 'timeline') {
    return (
      <main className="app">
        <TimelineView onBack={() => setMode('home')} />
      </main>
    );
  }

  if (mode === 'safety') {
    return (
      <main className="app">
        <SafetyView
          store={store}
          onBack={() => setMode('home')}
          onRescreen={() => setMode('screening')}
        />
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
        <button type="button" className="quiet" onClick={() => onGo('timeline')}>
          Mitä odottaa
        </button>
        {/*
          Permanent, and never phrased as an emergency: a link that only appears
          when the app has decided you are in trouble is a link nobody wants to
          be seen tapping. This one is always here, so tapping it means nothing.
        */}
        <button type="button" className="quiet" onClick={() => onGo('safety')}>
          Apua
        </button>
      </div>
    </section>
  );
}
