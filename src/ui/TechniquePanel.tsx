/**
 * A technique, chosen and then followed, without leaving the wait.
 *
 * Two screens deep at most: a list of what is available, then the thing itself.
 * The breathing ones animate a circle from elapsed time rather than from a
 * counter, so a screen that slept and woke does not resume out of step with the
 * instruction it is giving.
 */

import { useMemo, useState } from 'react';
import { PHASE_LABELS, breathAt, circleScale } from '../core/breathing';
import { EVIDENCE_LABELS, EVIDENCE_NOTES, TECHNIQUES, type Technique } from '../core/techniques';
import { BodyFigure } from './figures';
import { useNow } from '../store';

export function TechniquePanel() {
  const [chosen, setChosen] = useState<Technique | null>(null);
  const [startedAt, setStartedAt] = useState(0);

  if (!chosen) {
    return (
      <ul className="technique-list">
        {TECHNIQUES.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              className="technique-choice"
              onClick={() => {
                setChosen(t);
                setStartedAt(Date.now());
              }}
            >
              <span className="technique-name">{t.name}</span>
              <span className="technique-summary">{t.summary}</span>
              <span className="technique-meta">
                {EVIDENCE_LABELS[t.evidence]} · {Math.round(t.seconds / 60)} min
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="technique">
      <p className="technique-heading">{chosen.name}</p>

      {chosen.pattern ? (
        <BreathGuide technique={chosen} startedAt={startedAt} />
      ) : chosen.figure ? (
        <BodyFigure figure={chosen.figure} point={chosen.point} />
      ) : null}

      <ol className="technique-steps">
        {chosen.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <p className="technique-evidence">
        {EVIDENCE_LABELS[chosen.evidence]}. {EVIDENCE_NOTES[chosen.evidence]}
      </p>

      <button type="button" className="quiet" onClick={() => setChosen(null)}>
        Valitse toinen
      </button>
    </div>
  );
}

/**
 * The animated circle.
 *
 * Ticks at 200 ms: fast enough that the countdown never looks stuck, slow enough
 * to be free. The circle itself is a CSS transform driven by the derived scale,
 * so the browser does the smoothing between ticks.
 */
function BreathGuide({ technique, startedAt }: { technique: Technique; startedAt: number }) {
  const now = useNow(true, 200);
  const state = useMemo(
    () => (technique.pattern ? breathAt(technique.pattern, now - startedAt) : undefined),
    [technique.pattern, now, startedAt],
  );

  if (!state || !technique.pattern) return null;
  const scale = circleScale(technique.pattern, state);

  return (
    <div className="breath">
      <div className="breath-stage">
        {/* Outline stays put as the target; the filled disc is the instruction. */}
        <span className="breath-target" />
        <span
          className="breath-disc"
          style={{ transform: `scale(${0.34 + scale * 0.66})` }}
        />
        <span className="breath-count">{state.remaining}</span>
      </div>
      <p className="breath-phase">{PHASE_LABELS[state.phase.kind]}</p>
      <p className="breath-cycles">
        {state.cycle === 0 ? 'Ensimmäinen kierros' : `${state.cycle + 1}. kierros`}
      </p>
    </div>
  );
}
