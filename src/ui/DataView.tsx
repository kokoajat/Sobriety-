/**
 * Data ownership, made operable rather than promised.
 *
 * Export produces a file the user holds; erase actually drops the database.
 * Both are one tap from the main navigation, because a tool that is hard to
 * leave is a tool that has to be trusted rather than verified.
 */

import { useRef, useState } from 'react';
import { eraseAll, exportAll, importAll, type ExportBundle } from '../storage/db';
import type { Store } from '../store';

export function DataView({ store }: { store: Store }) {
  const [status, setStatus] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const doExport = async () => {
    const bundle = await exportAll();
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `sobriety-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus(`Vietiin ${bundle.days.length} päivää.`);
  };

  const doImport = async (file: File) => {
    try {
      const bundle = JSON.parse(await file.text()) as ExportBundle;
      await importAll(bundle);
      await store.reload();
      setStatus(`Tuotiin ${bundle.days.length} päivää.`);
    } catch (error) {
      setStatus(`Tuonti epäonnistui: ${(error as Error).message}`);
    }
  };

  const doErase = async () => {
    await eraseAll();
    await store.reload();
    setConfirming(false);
    setStatus('Kaikki tiedot poistettu.');
  };

  return (
    <section className="view">
      <header className="view-head">
        <h1>Tiedot</h1>
        <p className="lede">
          Kaikki tässä sovelluksessa on tämän laitteen selaimen tietokannassa. Mitään ei
          lähetetä mihinkään, eikä sovelluksessa ole tiliä eikä palvelinta.
        </p>
      </header>

      <div className="block">
        <h2>Vienti ja tuonti</h2>
        <p className="hint">
          Vienti antaa JSON-tiedoston. Ääninauhoitteet jäävät laitteelle eivätkä tule mukaan.
        </p>
        <div className="button-row">
          <button type="button" className="secondary" onClick={doExport}>
            Vie tiedosto
          </button>
          <button type="button" className="secondary" onClick={() => fileInput.current?.click()}>
            Tuo tiedosto
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void doImport(file);
            e.target.value = '';
          }}
        />
      </div>

      <div className="block">
        <h2>Poisto</h2>
        {confirming ? (
          <>
            <p className="hint">
              Tämä poistaa kaikki päivät, viestit ja vaihtoehdot lopullisesti. Ei perumista.
            </p>
            <div className="button-row">
              <button type="button" className="secondary" onClick={doErase}>
                Poista kaikki
              </button>
              <button type="button" className="secondary" onClick={() => setConfirming(false)}>
                Peruuta
              </button>
            </div>
          </>
        ) : (
          <button type="button" className="secondary" onClick={() => setConfirming(true)}>
            Poista kaikki tiedot
          </button>
        )}
      </div>

      {status && <p className="status">{status}</p>}

      <div className="block note">
        <h2>Mikä tämä ei ole</h2>
        <p>
          Tämä ei ole hoitoa eikä korvaa sitä. Jos juot päivittäin ja paljon, äkillinen
          lopettaminen voi olla lääketieteellisesti vaarallista — vieroitusoireet voivat
          johtaa kouristuksiin ja deliriumiin. Vieroitus kuuluu silloin lääkärille.
        </p>
        <p>
          Päivystysapu 112. Päihdeneuvonta 0800 900 45, maksuton ja nimetön, ympäri
          vuorokauden.
        </p>
      </div>
    </section>
  );
}
