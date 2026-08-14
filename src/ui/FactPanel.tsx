/**
 * Something to read while the clock runs.
 *
 * Staring at a countdown is a bad task for an impatient mind, and a walk is not
 * always available. This gives attention somewhere to go without leaving the
 * wait — which is why the timer never disappears when this opens, it only gets
 * smaller. The reading is the distraction; the waiting is still the mechanism.
 *
 * Two corpora: what alcohol does, and useless knowledge. The second is opt-in
 * and off by default, and it is not a lesser feature — during a craving,
 * occupying the mind is as legitimate a job as informing it.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { FACTS, CATEGORY_LABELS, type Fact } from '../core/facts';
import { TRIVIA } from '../core/trivia';
import { pickNextFact } from '../core/rotation';
import { FactScene, type FactFigure } from './factFigures';
import type { Store } from '../store';

export function FactPanel({ store }: { store: Store }) {
  const [fact, setFact] = useState<Fact | undefined>();
  // Lines already shown during this wait, so one wait never repeats itself.
  const shown = useRef<string[]>([]);
  // Bumped on every advance: restarts the entrance animation and, crucially,
  // re-arms the timeout below so a tap gives a full reading interval.
  const [turn, setTurn] = useState(0);

  const trivia = store.settings.triviaOn;
  const exposures = useRef(store.exposures);
  exposures.current = store.exposures;

  const advance = useCallback(() => {
    const pool = trivia ? [...FACTS, ...TRIVIA] : FACTS;
    const next = pickNextFact(pool, exposures.current, shown.current);
    if (!next) return;
    shown.current = [...shown.current, next.id];
    setFact(next);
    setTurn((t) => t + 1);
    void store.markFactShown(next.id);
    // Exposures are read through a ref so this stays stable: rebuilding it on
    // every write would re-arm the timeout on every line and the interval would
    // never actually elapse.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trivia]);

  useEffect(() => {
    advance();
  }, [advance]);

  /**
   * One timeout per line, re-armed after each advance.
   *
   * A shared interval would keep its own schedule regardless of taps: tapping at
   * 8.5 seconds meant the next line arrived half a second later, which reads as
   * the app ignoring you. Re-arming gives every line the full interval however
   * it arrived.
   */
  useEffect(() => {
    const seconds = Math.max(3, store.settings.factSeconds);
    const id = setTimeout(advance, seconds * 1000);
    return () => clearTimeout(id);
  }, [turn, advance, store.settings.factSeconds]);

  if (!fact) return null;

  return (
    <div className="fact-block">
      <button type="button" className="fact" onClick={advance} aria-live="polite">
        <span key={turn} className="fact-inner">
          <span className="fact-category">{CATEGORY_LABELS[fact.category]}</span>
          {fact.figure && <FactScene figure={fact.figure as FactFigure} />}
          <span className="fact-text">{fact.text}</span>
        </span>
      </button>

      <label className="fact-toggle">
        <input
          type="checkbox"
          checked={trivia}
          onChange={(e) =>
            store.saveSettings({ ...store.settings, triviaOn: e.target.checked })
          }
        />
        <span>Sekaan myös turhaa tietoa</span>
      </label>
    </div>
  );
}
