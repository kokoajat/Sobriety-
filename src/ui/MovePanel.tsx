/**
 * The third companion: change the context.
 *
 * Reading occupies attention, a technique occupies the body — and this one moves
 * the person. Of the three it has the best evidence behind it by some distance
 * (see `situations.ts`), which is why it exists as its own panel rather than as
 * one more entry in the technique list.
 *
 * On asking where the user is.
 *
 * The app asks exactly one question when the button is pressed — what the drink
 * would do — and adding a second question there would have been a real cost: a
 * form at the start of an urge is the fastest way to make an app not get opened.
 *
 * But the wait is ten minutes of deliberately empty time. A tap during the wait
 * delays nothing, and it gives something back immediately: the moves shown next
 * are the ones that fit the room the user is actually in. That inversion — ask
 * late, answer instantly — is what makes the question affordable at all.
 *
 * It stays skippable. Someone who does not want to say can still read the
 * general moves.
 */

import { useState } from 'react';
import { SITUATION_KEYS, SITUATIONS, movesFor, suggestedSituation } from '../core/situations';
import type { SituationKey } from '../core/situations';
import type { Store } from '../store';
import type { Episode } from '../core/types';

interface Props {
  store: Store;
  episode: Episode;
}

export function MovePanel({ store, episode }: Props) {
  // A stored answer wins; otherwise the only need that maps to a place with any
  // confidence pre-selects one, and everything else starts unanswered.
  const stored = episode.situation ?? suggestedSituation(episode.demand);
  const [asking, setAsking] = useState(stored === undefined);
  const [skipped, setSkipped] = useState(false);

  if (asking) {
    return (
      <div className="move-panel">
        <p className="move-question">Missä olet nyt?</p>
        <ul className="choice-list">
          {SITUATION_KEYS.map((key) => (
            <li key={key}>
              <button
                type="button"
                className="choice"
                onClick={() => {
                  void store.setSituation(key);
                  setSkipped(false);
                  setAsking(false);
                }}
              >
                {SITUATIONS[key].label}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="quiet"
          onClick={() => {
            setSkipped(true);
            setAsking(false);
          }}
        >
          Ohita — näytä yleiset siirrot
        </button>
      </div>
    );
  }

  const key: SituationKey = skipped ? 'elsewhere' : stored ?? 'elsewhere';
  const situation = SITUATIONS[key];

  return (
    <div className="move-panel">
      <p className="move-heading">{situation.label}</p>
      <p className="move-note">{situation.note}</p>

      <ul className="move-list">
        {movesFor(key).map((move) => (
          <li key={move.id} className="move">
            <p className="move-text">{move.text}</p>
            <p className="move-why">{move.why}</p>
          </li>
        ))}
      </ul>

      {/*
        The mechanism, said once at the bottom rather than repeated per move.
        A move you understand is a move you make again next week without the app.
      */}
      <p className="move-evidence">
        Paikan vaihtaminen on tämän sovelluksen parhaiten tuettu keino. Himo on
        opittu paikkaan, kellonaikaan ja tilanteeseen — ei sinuun. Kun tilanne
        vaihtuu, laukaisija jää siihen tilanteeseen.
      </p>

      <button type="button" className="quiet" onClick={() => setAsking(true)}>
        {skipped ? 'Kerro missä olet' : 'Olen muualla'}
      </button>
    </div>
  );
}
