/**
 * "Mitä odottaa" — the reference page.
 *
 * Read in the calm hours, not during a wait, so it is allowed to be long and is
 * allowed to be uncomfortable. Every phase carries its source and its caveat in
 * the same box, because a finding shown without its limit is how a study becomes
 * a slogan.
 *
 * Nothing on this page is personalised. There is no "you are here" marker and no
 * day count, which would turn a description of physiology into a progress bar
 * with a place to be behind.
 */

import { HEADLINE, PHASES } from '../core/timeline';

interface Props {
  onBack: () => void;
}

export function TimelineView({ onBack }: Props) {
  return (
    <section className="screen screen-scroll">
      <h1 className="ask">Mitä odottaa</h1>
      <p className="wait-note">{HEADLINE}</p>

      <ol className="phase-list">
        {PHASES.map((phase) => (
          <li key={phase.id} className={phase.urgent ? 'card card-warning' : 'card'}>
            <p className="card-label">{phase.window}</p>
            <p className="phase-heading">{phase.heading}</p>
            <p className="card-note">{phase.body}</p>
            {phase.caveat && <p className="phase-caveat">{phase.caveat}</p>}
            <p className="phase-source">{phase.source}</p>
          </li>
        ))}
      </ol>

      <p className="footnote">
        Tämä on kuvaus siitä, mitä tutkimuksissa on havaittu keskimäärin. Se ei ole
        ennuste sinusta, eikä aikataulu, josta voi jäädä jälkeen. Yksilölliset erot
        ovat suuria, ja moni tässä siteerattu aineisto on pieni ja koostuu
        hoitoon hakeutuneista.
      </p>

      <button type="button" className="quiet" onClick={onBack}>
        Takaisin
      </button>
    </section>
  );
}
