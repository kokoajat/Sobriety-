/**
 * The fork: the only screen that runs while the user is hot.
 *
 * Everything here is one tap deep and pre-decided. At a fork the user has no
 * deliberative capacity to spend — asking them to *think* of an alternative is
 * asking for the one thing that is unavailable. So the app hands back two things
 * the calm version of them prepared earlier: their own words, and one named
 * option with its track record.
 *
 * Nothing on this screen tries to talk them out of drinking. `Join` is a
 * first-class button, logged without comment. An app you have to lie to is an
 * app that stops receiving data at exactly the moment the data matters.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ForkChoice, FunctionTag } from '../core/types';
import { pickForFork } from '../core/substitution';
import { functionLabel, functionOptions } from '../core/functions';
import { minuteOfDay } from '../core/day';
import { CHOICE_LABELS } from './labels';
import type { Store } from '../store';

interface Props {
  store: Store;
  onDone: () => void;
}

export function ForkView({ store, onDone }: Props) {
  const [tag, setTag] = useState<FunctionTag | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [logged, setLogged] = useState<ForkChoice | null>(null);
  const [naming, setNaming] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const options = useMemo(() => functionOptions(store.functions), [store.functions]);
  const namingRef = useRef<HTMLDivElement>(null);

  // The naming form sits below eight tiles, so on a phone it opens off-screen.
  // Scrolling it into view keeps the escape hatch usable at a fork, where a
  // moment of hunting for the input is a moment the fork goes unlogged.
  useEffect(() => {
    if (naming) namingRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [naming]);

  const message = useMemo(
    () => (tag ? store.messages.find((m) => m.tag === tag) : undefined),
    [store.messages, tag],
  );

  // Frozen per tag so the offer does not reshuffle under the user's thumb.
  const suggestion = useMemo(
    () => (tag ? pickForFork(store.alternatives, tag) : undefined),
    [store.alternatives, tag],
  );

  const log = async (choice: ForkChoice) => {
    if (!tag) return;
    await store.logFork({
      atMin: minuteOfDay(),
      tag,
      choice,
      intensity,
      loggedInMoment: true,
      alternativeId: choice === 'substituted' ? suggestion?.alternative.id : undefined,
    });
    setLogged(choice);
  };

  /**
   * Create the function and select it in one step, reusing an existing one when
   * the label already matches — at a fork the user should never be asked to
   * resolve a duplicate.
   */
  const addAndPick = async () => {
    const created = await store.addFunction(newLabel);
    if (!created) return;
    setNaming(false);
    setNewLabel('');
    setTag(created);
  };

  const rate = async (worked: boolean) => {
    if (suggestion) await store.rateAlternative(suggestion.alternative.id, worked);
    onDone();
  };

  if (logged) {
    return (
      <section className="view fork-done">
        <h1>Kirjattu.</h1>
        <p className="lede">
          Huomasit risteyksen ja merkitsit sen. Se on tämän sovelluksen ainoa suoritus, ja se
          onnistui.
        </p>
        {logged === 'substituted' && suggestion && (
          <div className="block">
            <h2>Tekikö {suggestion.alternative.label} sen mitä piti?</h2>
            <p className="hint">
              Kysymys ei ole siitä, joitko myöhemmin. Kysymys on siitä, hoitiko se tehtävän.
            </p>
            <div className="button-row">
              <button type="button" className="secondary" onClick={() => rate(true)}>
                Teki
              </button>
              <button type="button" className="secondary" onClick={() => rate(false)}>
                Ei tehnyt
              </button>
            </div>
          </div>
        )}
        {logged !== 'substituted' && (
          <button type="button" className="primary" onClick={onDone}>
            Sulje
          </button>
        )}
      </section>
    );
  }

  if (!tag) {
    return (
      <section className="view">
        <header className="view-head">
          <h1>Mitä varten?</h1>
          <p className="lede">
            Mihin tehtävään juoma tulisi nyt. Yksi napautus, ei muuta.
          </p>
        </header>
        <ul className="tag-grid">
          {options.map((option) => (
            <li key={option.tag}>
              <button
                type="button"
                className="tag-button"
                onClick={() => setTag(option.tag)}
              >
                <strong>{option.label}</strong>
                {option.hint && <span>{option.hint}</span>}
              </button>
            </li>
          ))}
          <li>
            {naming ? (
              // Naming happens here rather than only in Valmistelu because a
              // function that is missing is missing *now*. Sending the user off
              // to a settings screen mid-fork means the fork goes unlogged, and
              // an unlogged fork is the one outcome this app cannot afford.
              <div className="block" ref={namingRef}>
                <label className="field">
                  Mihin tehtävään?
                  <input
                    type="text"
                    autoFocus
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="omin sanoin"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void addAndPick();
                    }}
                  />
                </label>
                <div className="button-row">
                  <button type="button" className="primary" onClick={addAndPick}>
                    Käytä tätä
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      setNaming(false);
                      setNewLabel('');
                    }}
                  >
                    Peruuta
                  </button>
                </div>
                <p className="hint">
                  Tallentuu omaksi tehtäväksesi ja on jatkossa mukana analyysissä.
                </p>
              </div>
            ) : (
              <button
                type="button"
                className="tag-button tag-button-add"
                onClick={() => setNaming(true)}
              >
                <strong>Muu — nimeä itse</strong>
                <span>Jos mikään ylläolevista ei ole se, mistä tässä on kyse.</span>
              </button>
            )}
          </li>
        </ul>
      </section>
    );
  }

  return (
    <section className="view">
      <header className="view-head">
        <h1>{functionLabel(tag, store.functions)}</h1>
      </header>

      {message && (
        <blockquote className="self-message">
          <p>{message.text}</p>
          <cite>omin sanoin, {new Date(message.createdAt).toLocaleDateString('fi-FI')}</cite>
          {message.audio && (
            <audio controls src={URL.createObjectURL(message.audio)}>
              Selaimesi ei toista ääntä.
            </audio>
          )}
        </blockquote>
      )}

      <div className="block">
        <label className="field">
          Kuinka kova?
          <input
            type="range"
            min={1}
            max={5}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
          />
          <span className="hint">{intensity} / 5</span>
        </label>
      </div>

      {suggestion && (
        <div className="block suggestion">
          <h2>{suggestion.alternative.label}</h2>
          <p className="hint">
            {suggestion.untested
              ? 'Et ole vielä kokeillut tätä tähän.'
              : `Toiminut ${suggestion.successes}/${suggestion.attempts} kertaa.`}
          </p>
        </div>
      )}

      <div className="button-column">
        {(['substituted', 'delayed', 'passed', 'drank'] as ForkChoice[]).map((choice) => (
          <button
            key={choice}
            type="button"
            className={choice === 'drank' ? 'secondary' : 'primary'}
            onClick={() => log(choice)}
            disabled={choice === 'substituted' && !suggestion}
          >
            {CHOICE_LABELS[choice]}
          </button>
        ))}
      </div>
      <p className="hint centred">Kaikki neljä kirjataan samalla tavalla.</p>
    </section>
  );
}
