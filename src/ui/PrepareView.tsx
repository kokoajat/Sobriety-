/**
 * The calm hours: writing what the fork will need.
 *
 * Loewenstein's hot–cold empathy gap says the calm self cannot reason with the
 * craving self — it cannot even model it accurately. What it *can* do is leave
 * something behind. So this screen is a letterbox: the user writes to themselves
 * now, and the fork screen hands it back later. The app never generates this
 * text, because advice from an app has no standing at a fork and their own voice
 * does.
 */

import { useRef, useState } from 'react';
import type { Alternative, FunctionTag } from '../core/types';
import { rankAlternatives } from '../core/substitution';
import { functionHint, functionLabel, functionOptions } from '../core/functions';
import type { Store } from '../store';

const newId = () => (crypto.randomUUID?.() ?? String(Date.now() + Math.random()));

export function PrepareView({ store }: { store: Store }) {
  const [tag, setTag] = useState<FunctionTag>('unwind');
  const [text, setText] = useState('');
  const [label, setLabel] = useState('');
  const [recording, setRecording] = useState(false);
  const [functionLabelDraft, setFunctionLabelDraft] = useState('');
  const [functionHintDraft, setFunctionHintDraft] = useState('');
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const existing = store.messages.find((m) => m.tag === tag);
  const ranked = rankAlternatives(store.alternatives, tag);
  const options = functionOptions(store.functions);
  const ownFunctions = store.functions.filter((f) => !f.archived);

  const addOwnFunction = async () => {
    const created = await store.addFunction(functionLabelDraft, functionHintDraft);
    if (!created) return;
    setFunctionLabelDraft('');
    setFunctionHintDraft('');
    // Jump to the new function: the reason to define one is to prepare for it.
    setTag(created);
  };

  const saveMessage = async () => {
    if (!text.trim()) return;
    await store.upsertMessage({
      id: existing?.id ?? newId(),
      tag,
      text: text.trim(),
      audio: existing?.audio,
      createdAt: Date.now(),
    });
    setText('');
  };

  const addAlternative = async () => {
    if (!label.trim()) return;
    const match = store.alternatives.find(
      (a) => a.label.toLowerCase() === label.trim().toLowerCase(),
    );
    // Reuse an existing option across functions rather than forking its history —
    // a walk that works for boredom and for unwinding is one option with one record.
    const next: Alternative = match
      ? { ...match, tags: [...new Set([...match.tags, tag])], archived: false }
      : { id: newId(), label: label.trim(), tags: [tag], attempts: [] };
    await store.upsertAlternative(next);
    setLabel('');
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    chunks.current = [];
    rec.ondataavailable = (e) => chunks.current.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const audio = new Blob(chunks.current, { type: rec.mimeType });
      await store.upsertMessage({
        id: existing?.id ?? newId(),
        tag,
        text: existing?.text ?? '',
        audio,
        createdAt: Date.now(),
      });
      setRecording(false);
    };
    recorder.current = rec;
    rec.start();
    setRecording(true);
  };

  return (
    <section className="view">
      <header className="view-head">
        <h1>Valmistelu</h1>
        <p className="lede">
          Tämä tehdään rauhassa. Risteyksessä ei ehdi eikä jaksa keksiä mitään — siellä on
          käytettävissä vain se, mikä on jo valmiina.
        </p>
      </header>

      <div className="block">
        <label className="field">
          Mitä tehtävää valmistelet
          <select value={tag} onChange={(e) => setTag(e.target.value as FunctionTag)}>
            {options.map((o) => (
              <option key={o.tag} value={o.tag}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="hint">{functionHint(tag, store.functions)}</span>
        </label>
      </div>

      <div className="block">
        <h2>Omat tehtävät</h2>
        <p className="hint">
          Kahdeksan valmista tehtävää on arvaus siitä, mihin juoma otetaan. Jos omasi ei ole
          niiden joukossa, lisää se — se on mukana risteysvalinnoissa ja kaikessa analyysissä
          siitä eteenpäin.
        </p>

        {ownFunctions.length > 0 && (
          <ul className="ranked">
            {ownFunctions.map((f) => (
              <li key={f.id}>
                <span>{f.label}</span>
                <button
                  type="button"
                  className="chip-remove"
                  onClick={() => store.archiveFunction(f.id, true)}
                  aria-label={`Poista käytöstä: ${f.label}`}
                  title="Poista käytöstä"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <label className="field">
          Tehtävän nimi
          <input
            type="text"
            value={functionLabelDraft}
            onChange={(e) => setFunctionLabelDraft(e.target.value)}
            placeholder="riita kotona"
          />
        </label>
        <label className="field">
          Milloin se pätee (valinnainen)
          <input
            type="text"
            value={functionHintDraft}
            onChange={(e) => setFunctionHintDraft(e.target.value)}
            placeholder="kun ilta menee pieleen"
          />
        </label>
        <button type="button" className="secondary" onClick={addOwnFunction}>
          Lisää tehtävä
        </button>
        <p className="hint">
          Käytöstä poistaminen ei poista historiaa: vanhat päivät säilyvät luettavina, tehtävä
          vain katoaa valinnoista.
        </p>
      </div>

      <div className="block">
        <h2>Viesti itsellesi</h2>
        <p className="hint">
          Mitä sanoisit itsellesi juuri siinä hetkessä? Kirjoita omilla sanoillasi, ei
          neuvona vaan viestinä.
        </p>
        {existing?.text && (
          <blockquote className="self-message">
            <p>{existing.text}</p>
            <button
              type="button"
              className="chip-remove"
              onClick={() => store.removeMessage(existing.id)}
              aria-label="Poista viesti"
            >
              ×
            </button>
          </blockquote>
        )}
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tiedän että juuri nyt tuntuu…"
        />
        <div className="button-row">
          <button type="button" className="secondary" onClick={saveMessage}>
            {existing?.text ? 'Korvaa viesti' : 'Tallenna viesti'}
          </button>
          {recording ? (
            <button
              type="button"
              className="secondary"
              onClick={() => recorder.current?.stop()}
            >
              Lopeta nauhoitus
            </button>
          ) : (
            <button type="button" className="secondary" onClick={startRecording}>
              Nauhoita ääni
            </button>
          )}
        </div>
        {existing?.audio && <p className="hint">Ääniviesti tallennettu tälle tehtävälle.</p>}
      </div>

      <div className="block">
        <h2>Vaihtoehdot</h2>
        <p className="hint">
          Mikä muu voisi hoitaa tehtävän <strong>{functionLabel(tag, store.functions)}</strong>?
          Ei parempi ihminen, vaan jotain mikä on käden ulottuvilla kolmessa sekunnissa.
        </p>
        {ranked.length > 0 && (
          <ul className="ranked">
            {ranked.map((r) => (
              <li key={r.alternative.id}>
                <span>{r.alternative.label}</span>
                <span className="hint">
                  {r.untested ? 'kokeilematta' : `${r.successes}/${r.attempts}`}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="field-row">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="kävely ulkona"
          />
          <button type="button" className="secondary" onClick={addAlternative}>
            Lisää
          </button>
        </div>
      </div>
    </section>
  );
}
