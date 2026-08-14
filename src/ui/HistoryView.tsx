/**
 * What the record is allowed to say.
 *
 * Not a scoreboard. Every figure here is about a supply or about the urge itself,
 * never about the person, and no rate is shown until it rests on enough occasions
 * to mean something — `NaN` from `stats.ts` renders as "liian vähän vielä" rather
 * than as a confident number. A wrong-but-certain claim about your own behaviour
 * is worse than no claim, and this is exactly the domain where people believe
 * such claims.
 */

import { useMemo, useState } from 'react';
import { byDemand, bySituation, medianTimeToPassMs, outcomeCounts, MIN_SAMPLE } from '../core/stats';
import { situationLabel } from '../core/situations';
import { demandLabel } from '../core/demands';
import { eraseAll, exportAll, importAll, type ExportBundle } from '../storage/db';
import { OUTCOME_LABELS, formatDurationShort, formatMinutes, formatPercent, formatWhen } from './labels';
import type { Store } from '../store';

export function HistoryView({ store, onBack }: { store: Store; onBack: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const closed = useMemo(() => store.episodes.filter((e) => e.endedAt !== undefined), [
    store.episodes,
  ]);
  const counts = outcomeCounts(closed);
  const typical = medianTimeToPassMs(closed, store.settings);
  const rows = byDemand(closed);
  const places = bySituation(closed);

  const doExport = async () => {
    const bundle = await exportAll();
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `kymmenen-minuuttia-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus(`Vietiin ${bundle.episodes.length} merkintää.`);
  };

  const doImport = async (file: File) => {
    try {
      await importAll(JSON.parse(await file.text()) as ExportBundle);
      await store.reload();
      setStatus('Tuonti valmis.');
    } catch (error) {
      setStatus(`Tuonti epäonnistui: ${(error as Error).message}`);
    }
  };

  return (
    <section className="screen screen-scroll">
      <h1 className="ask">Mitä on tapahtunut</h1>

      {closed.length === 0 ? (
        <p className="wait-note">Ei vielä merkintöjä.</p>
      ) : (
        <>
          <div className="card">
            <p className="card-label">Kertoja</p>
            <p className="card-figure">{closed.length}</p>
            <p className="card-note">
              {counts.passed} meni ohi · {counts.took} otettiin
              {counts.unknown > 0 ? ` · ${counts.unknown} ilman merkintää` : ''}
            </p>
            {Number.isFinite(counts.passRate) ? (
              <p className="card-note">
                Odottaminen on riittänyt {formatPercent(counts.passRate)} niistä kerroista,
                joissa merkitsit lopputuloksen.
              </p>
            ) : (
              <p className="card-note">
                Osuutta ei näytetä ennen kuin merkintöjä on vähintään {MIN_SAMPLE}. Liian
                harvasta laskettu luku olisi arvaus.
              </p>
            )}
          </div>

          {Number.isFinite(typical) && (
            <div className="card">
              <p className="card-label">Kauanko himo on kestänyt</p>
              <p className="card-figure">{formatDurationShort(typical)}</p>
              <p className="card-note">
                Sinun omissa merkinnöissäsi se on mennyt ohi {formatMinutes(typical)}. Tämä on
                se luku, jonka olet jo useamman kerran voittanut.
              </p>
              {/*
                Said out loud, because the restriction is what makes the number
                mean anything: only the times the urge ended while the clock was
                still running are in it. A wait that ran out tells you the urge
                lasted at least ten minutes, not how long it lasted.
              */}
              <p className="card-note">
                Mukana ovat vain ne kerrat, joina himo meni ohi ennen kuin aika loppui.
                Loppuun asti kestäneistä tiedetään vain, että ne kestivät vähintään
                odotuksen verran — se ei ole kesto vaan alaraja.
              </p>
            </div>
          )}

          {rows.length > 0 && (
            <div className="card">
              <p className="card-label">Mihin tarpeeseen</p>
              <ul className="stock">
                {rows.map((row) => (
                  <li key={row.demand}>
                    <span>{demandLabel(row.demand, store.demands)}</span>
                    <span className="card-note">
                      {row.episodes} × ·{' '}
                      {Number.isFinite(row.passRate) ? formatPercent(row.passRate) : 'liian vähän'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {places.length > 0 && (
            <div className="card">
              <p className="card-label">Missä nämä hetket ovat olleet</p>
              <ul className="stock">
                {places.map((row) => (
                  <li key={row.situation}>
                    <span>{situationLabel(row.situation)}</span>
                    <span className="card-note">{row.episodes} ×</span>
                  </li>
                ))}
              </ul>
              {/*
                The only figure in this app that points at something the user can
                physically change. A room is not a personal failing, which is why
                this one is safe to show plainly — and why it is worth showing.
              */}
              <p className="card-note">
                Jos yksi paikka toistuu, se on tämän listan tärkein rivi. Himo on
                opittu paikkaan, ja paikan muuttaminen on helpompaa kuin sen
                voittaminen samassa paikassa.
              </p>
            </div>
          )}

          <div className="card">
            <p className="card-label">Viimeisimmät</p>
            {/*
              Stacked, not two columns. These rows carry a timestamp and a
              free-text need the user wrote themselves, and a side-by-side layout
              made the long one push past the card while squeezing the date into
              four wrapped lines. A row here has no fixed width to fit into.
            */}
            <ul className="event-list">
              {[...closed]
                .sort((a, b) => b.startedAt - a.startedAt)
                .slice(0, 12)
                .map((e) => (
                  <li key={e.id} className="event">
                    <p className="event-when">{formatWhen(e.startedAt)}</p>
                    <p className="event-what">
                      {demandLabel(e.demand, store.demands).toLowerCase()}
                    </p>
                    <p className="event-meta">
                      {/* Every outcome styled identically — see labels.ts. */}
                      {OUTCOME_LABELS[e.outcome]} · {formatDurationShort(e.waitedMs)}
                      {e.situation !== undefined && ` · ${situationLabel(e.situation).toLowerCase()}`}
                    </p>
                  </li>
                ))}
            </ul>
          </div>
        </>
      )}

      <div className="card">
        <p className="card-label">Tiedot</p>
        <p className="card-note">
          Kaikki on tämän laitteen selaimessa. Mitään ei lähetetä mihinkään, eikä
          sovelluksessa ole tiliä eikä palvelinta.
        </p>
        <div className="actions">
          <button type="button" className="action" onClick={doExport}>
            Vie
          </button>
          <label className="action as-button">
            Tuo
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void doImport(file);
                e.target.value = '';
              }}
            />
          </label>
        </div>
        {confirming ? (
          <div className="actions">
            <button
              type="button"
              className="action"
              onClick={async () => {
                await eraseAll();
                await store.reload();
                setConfirming(false);
                setStatus('Kaikki poistettu.');
              }}
            >
              Poista kaikki
            </button>
            <button type="button" className="action" onClick={() => setConfirming(false)}>
              Peruuta
            </button>
          </div>
        ) : (
          <button type="button" className="quiet" onClick={() => setConfirming(true)}>
            Poista kaikki tiedot
          </button>
        )}
        {status && <p className="card-note">{status}</p>}
      </div>

      <div className="card">
        <p className="card-label">Mikä tämä ei ole</p>
        <p className="card-note">
          Tämä ei ole hoitoa eikä korvaa sitä. Jos juot päivittäin ja runsaasti, äkillinen
          lopettaminen voi olla hengenvaarallista — vieroitus kuuluu silloin lääkärille.
        </p>
        <p className="card-note">
          Päivystysapu 112 · Päihdeneuvonta 0800 900 45, maksuton ja nimetön, ympäri
          vuorokauden.
        </p>
      </div>

      <button type="button" className="quiet" onClick={onBack}>
        Takaisin
      </button>
    </section>
  );
}
