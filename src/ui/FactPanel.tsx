/**
 * Something to read while the clock runs.
 *
 * Staring at a countdown is a bad task for an impatient mind, and a walk is not
 * always available. This gives attention somewhere to go without leaving the
 * wait — which is why the timer never disappears when this opens, it only gets
 * smaller. The reading is the distraction; the waiting is still the mechanism.
 *
 * Lines advance on their own and on tap. Auto-advance because a person mid-urge
 * should not have to do anything to keep it going; on tap because nine seconds is
 * too slow for a fast reader and reading at someone else's pace is its own kind
 * of irritation.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { FACTS, CATEGORY_LABELS, type Fact } from '../core/facts';
import { pickNextFact } from '../core/rotation';
import type { Store } from '../store';

export function FactPanel({ store }: { store: Store }) {
  const [fact, setFact] = useState<Fact | undefined>();
  // Lines already shown during this wait, so a single wait never repeats itself.
  const shown = useRef<string[]>([]);
  const [key, setKey] = useState(0);

  const advance = useCallback(() => {
    const next = pickNextFact(FACTS, store.exposures, shown.current);
    if (!next) return;
    shown.current = [...shown.current, next.id];
    setFact(next);
    setKey((k) => k + 1);
    void store.markFactShown(next.id);
    // `store.exposures` is deliberately not a dependency: re-creating this on
    // every write would restart the interval below on every single line.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    advance();
  }, [advance]);

  useEffect(() => {
    const id = setInterval(advance, Math.max(3, store.settings.factSeconds) * 1000);
    return () => clearInterval(id);
  }, [advance, store.settings.factSeconds]);

  if (!fact) return null;

  return (
    <button type="button" className="fact" onClick={advance} aria-live="polite">
      {/* `key` restarts the entrance animation for each line. */}
      <span key={key} className="fact-inner">
        <span className="fact-category">{CATEGORY_LABELS[fact.category]}</span>
        <span className="fact-text">{fact.text}</span>
      </span>
    </button>
  );
}
