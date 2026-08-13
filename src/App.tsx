import { useEffect, useState } from 'react';
import { dayPhase, unresolvedBefore } from './core/day';
import { useStore } from './store';
import { ForecastView } from './ui/ForecastView';
import { ForkView } from './ui/ForkView';
import { ResolveView } from './ui/ResolveView';
import { InsightView } from './ui/InsightView';
import { PrepareView } from './ui/PrepareView';
import { DataView } from './ui/DataView';
import { OnboardingView } from './ui/OnboardingView';
import { formatDate } from './ui/labels';

type Tab = 'today' | 'fork' | 'insight' | 'prepare' | 'data';

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Päivä' },
  { id: 'fork', label: 'Risteys' },
  { id: 'insight', label: 'Itsetuntemus' },
  { id: 'prepare', label: 'Valmistelu' },
  { id: 'data', label: 'Tiedot' },
];

export function App() {
  const store = useStore();
  const [tab, setTab] = useState<Tab>('today');

  const day = store.days.find((d) => d.date === store.today);
  const phase = dayPhase(day, new Date(), store.settings);

  // The forecast is the one thing that expires, so an unstarted day opens on it.
  useEffect(() => {
    if (store.ready && phase === 'awaiting-forecast') setTab('today');
  }, [store.ready, phase]);

  if (!store.ready) {
    return (
      <main className="app">
        <p className="status">Ladataan…</p>
      </main>
    );
  }

  // Asked once, before the tab bar exists: the day boundary is the axis every
  // later number is measured against, so it is worth one screen up front.
  if (!store.settings.onboardedAt) {
    return (
      <main className="app">
        <div className="content">
          <OnboardingView settings={store.settings} onDone={store.saveSettings} />
        </div>
      </main>
    );
  }

  return (
    <main className="app">
      <div className="content">
        {tab === 'today' && <TodayView phase={phase} store={store} onFork={() => setTab('fork')} />}
        {tab === 'fork' && <ForkView store={store} onDone={() => setTab('today')} />}
        {tab === 'insight' && (
          <InsightView
            days={store.days}
            today={store.today}
            functions={store.functions}
            settings={store.settings}
          />
        )}
        {tab === 'prepare' && <PrepareView store={store} />}
        {tab === 'data' && <DataView store={store} />}
      </div>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'tab tab-active' : 'tab'}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </main>
  );
}

function TodayView({
  phase,
  store,
  onFork,
}: {
  phase: ReturnType<typeof dayPhase>;
  store: ReturnType<typeof useStore>;
  onFork: () => void;
}) {
  const [resolving, setResolving] = useState(false);
  const [closingDate, setClosingDate] = useState<string | null>(null);

  // A day left open before the boundary moved off midnight can still be closed;
  // until it is, the forecast it holds never reaches the scores.
  const stranded = unresolvedBefore(store.days, store.today);

  if (closingDate) {
    return (
      <ResolveView store={store} date={closingDate} onDone={() => setClosingDate(null)} />
    );
  }

  const banner = stranded ? (
    <div className="block">
      <h2>{formatDate(stranded.date)} jäi päättämättä</h2>
      <p className="hint">
        Sen ennuste odottaa toteumaa eikä ole vielä mukana luvuissa. Muistatko miten se
        päivä meni?
      </p>
      <button type="button" className="secondary" onClick={() => setClosingDate(stranded.date)}>
        Sulje se nyt
      </button>
    </div>
  ) : null;

  if (phase === 'awaiting-forecast') {
    return (
      <>
        {banner}
        <ForecastView store={store} onDone={() => undefined} />
      </>
    );
  }
  if (resolving || phase === 'awaiting-resolve') {
    return <ResolveView store={store} onDone={() => setResolving(false)} />;
  }

  const day = store.days.find((d) => d.date === store.today);
  const forks = day?.observation?.forks ?? [];

  return (
    <section className="view">
      {banner}
      <header className="view-head">
        <h1>{phase === 'closed' ? 'Päivä suljettu' : 'Päivä käynnissä'}</h1>
        <p className="lede">
          Ennuste tehty: {Math.round((day?.forecast?.p ?? 0) * 100)} %.
          {forks.length > 0 && ` Risteyksiä kirjattu ${forks.length}.`}
        </p>
      </header>

      {phase === 'closed' ? (
        <p className="hint">
          Päivä on suljettu. Luvut päivittyivät Itsetuntemus-välilehdelle.
        </p>
      ) : (
        <div className="button-column">
          <button type="button" className="primary big" onClick={onFork}>
            Olen risteyksessä
          </button>
          <button type="button" className="secondary" onClick={() => setResolving(true)}>
            Sulje päivä
          </button>
        </div>
      )}
    </section>
  );
}
