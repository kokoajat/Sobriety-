/**
 * The safety screen, shown once on first open.
 *
 * This is the only place in the app that asks the user about their drinking in
 * general rather than about this one moment, and it is deliberately the first
 * thing that happens rather than something hidden in a settings page: its whole
 * purpose is to run *before* someone starts using a ten-minute timer as their
 * treatment for a condition that needs a doctor.
 *
 * Three design decisions that follow from that purpose:
 *
 *   - One question per screen. Five items on one page reads as a form, and a
 *     form invites the answers that look best.
 *   - Skipping is offered on every screen, in plain language, and costs nothing.
 *     A screen you cannot decline is a gate, and a gate at the front door of a
 *     craving app is worse than no screen at all.
 *   - The result page never shows the number. The band decides what is said; the
 *     score itself would immediately become a thing to improve, which is the one
 *     mechanic this app exists to avoid.
 */

import { useState } from 'react';
import { BAND_COPY, QUESTIONS, score } from '../core/screening';
import type { ScreeningRecord } from '../core/types';

interface Props {
  onDone: (record: ScreeningRecord) => void | Promise<void>;
}

type Stage = 'intro' | 'questions' | 'result';

export function ScreeningView({ onDone }: Props) {
  const [stage, setStage] = useState<Stage>('intro');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const skip = () => onDone({ at: Date.now() });

  if (stage === 'intro') {
    return (
      <section className="screen screen-scroll">
        <h1 className="ask">Ennen kuin aloitat</h1>
        <p className="wait-note">
          Viisi kysymystä, kerran. Ne eivät ole testi eivätkä jää seurantaan — ne
          ovat tässä yhtä asiaa varten: osalle ihmisistä tämä sovellus on väärä
          työkalu yksin, ja se on parempi sanoa heti kuin olla sanomatta.
        </p>
        <p className="wait-note">
          Vastaukset pysyvät puhelimessasi. Mitään ei lähetetä mihinkään.
        </p>
        <button type="button" className="action wide" onClick={() => setStage('questions')}>
          Aloita
        </button>
        <button type="button" className="quiet" onClick={skip}>
          Ohita — pääset suoraan sovellukseen
        </button>
      </section>
    );
  }

  if (stage === 'questions') {
    const question = QUESTIONS[index];
    const answer = (value: number) => {
      const next = { ...answers, [question.id]: value };
      setAnswers(next);
      if (index + 1 < QUESTIONS.length) setIndex(index + 1);
      else setStage('result');
    };

    return (
      <section className="screen screen-scroll">
        <p className="screen-step">
          {index + 1} / {QUESTIONS.length}
        </p>
        <h1 className="ask">{question.text}</h1>

        <ul className="choice-list">
          {question.answers.map((option) => (
            <li key={option.value}>
              <button type="button" className="choice" onClick={() => answer(option.value)}>
                {option.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="quiet-links">
          {index > 0 && (
            <button type="button" className="quiet" onClick={() => setIndex(index - 1)}>
              Edellinen
            </button>
          )}
          <button type="button" className="quiet" onClick={skip}>
            Ohita
          </button>
        </div>
      </section>
    );
  }

  const result = score(answers);
  const copy = BAND_COPY[result.band];

  return (
    <section className="screen screen-scroll">
      <h1 className="ask">{copy.heading}</h1>

      {copy.warning && (
        <div className="card card-warning">
          <p className="card-label">Tärkeää</p>
          <p className="card-body">{copy.warning}</p>
        </div>
      )}

      {copy.body.map((line) => (
        <p className="wait-note" key={line}>
          {line}
        </p>
      ))}

      <button
        type="button"
        className="action wide"
        onClick={() =>
          onDone({
            at: Date.now(),
            auditC: result.auditC,
            dependenceSigns: result.dependenceSigns,
            band: result.band,
          })
        }
      >
        Selvä
      </button>
      <p className="footnote">
        Kysymykset 1–3 ovat AUDIT-C-seula (Bush ym. 1998). Kysymykset 4–5 eivät kuulu
        siihen; ne kysyvät fyysisen riippuvuuden merkeistä, joita kulutuksen määrä ei
        kerro. Tämä ei ole diagnoosi.
      </p>
    </section>
  );
}
