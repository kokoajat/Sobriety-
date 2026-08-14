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

/*
 * Lines advance on a tap and never on their own.
 *
 * They used to rotate every nine seconds. That was wrong for the one situation
 * this panel exists for: reading speed varies, some lines are twice as long as
 * others, and a line that vanishes mid-sentence is worse than no line — it turns
 * reading into keeping up, which is the opposite of what a ten-minute wait is
 * for. Nothing here is on a schedule now, so a line stays as long as it is
 * wanted and the next one arrives exactly when the reader asks for it.
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
  // Bumped on every advance, purely to restart the entrance animation.
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
    // Exposures are read through a ref so this callback stays stable across the
    // writes it causes; otherwise the mount effect below would re-run and skip a
    // line on every advance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trivia]);

  // The first line only. Everything after it is asked for.
  useEffect(() => {
    advance();
  }, [advance]);

  if (!fact) return null;

  return (
    <div className="fact-block">
      {/*
        Above the box rather than below it: an instruction under the thing it
        describes is read after the confusion it was meant to prevent.
      */}
      <p className="fact-hint">Napauta tekstiä, kun olet valmis seuraavaan.</p>

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
