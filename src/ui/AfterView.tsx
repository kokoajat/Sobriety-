/**
 * Afterwards: one line, and at most one question.
 *
 * The line is the same length and the same tone whichever way it went. The only
 * question asked is about the *supply* — did the thing do its job — because that
 * is the one answer which makes the next urge easier. Whether the user drank is
 * already recorded and needs no follow-up; asking about it would turn a log into
 * an interrogation.
 */

import { demandLabel } from '../core/demands';
import { summarise } from '../core/session';
import { formatDurationShort, formatGap } from './labels';
import type { Store } from '../store';
import type { Episode } from '../core/types';

interface Props {
  store: Store;
  episode: Episode;
  onDone: () => void;
}

export function AfterView({ store, episode, onDone }: Props) {
  const supply = store.supplies.find((s) => s.id === episode.supplyId);
  // Only after a drink, and only when this evening's own spacing has just
  // collapsed. This is the moment the observation is worth anything — an hour
  // later it is history, and on a wait that passed it would be a reprimand
  // attached to the wrong event.
  const pace = episode.outcome === 'took'
    ? summarise(store.episodes, episode.endedAt ?? Date.now()).accelerated
    : undefined;
  const alreadyRated = supply?.attempts.some((a) => a.at >= (episode.endedAt ?? 0) - 1000);

  const rate = async (helped: boolean) => {
    if (supply) await store.rateSupply(supply.id, episode.demand, helped);
    onDone();
  };

  return (
    <section className="screen">
      <h1 className="ask">
        {episode.outcome === 'passed' ? 'Se meni ohi.' : 'Kirjattu.'}
      </h1>

      <p className="wait-note">
        {demandLabel(episode.demand, store.demands).toLowerCase()} ·{' '}
        {formatDurationShort(episode.waitedMs)}
        {episode.extensions > 0 ? ` · jatkettu ${episode.extensions}×` : ''}
      </p>

      {pace && (
        <div className="card card-warning">
          <p className="card-label">Tahti tiivistyi</p>
          <p className="card-note">
            Väli edelliseen oli {formatGap(pace.gapMs)}. Aiemmin tänä iltana se on ollut
            noin {formatGap(pace.baselineMs)}. Ei mitään tehtävää — tämä on vain se, mitä
            kelloissa lukee.
          </p>
        </div>
      )}

      {supply && !alreadyRated ? (
        <div className="card">
          <p className="card-label">Tekikö se sen mitä piti?</p>
          <p className="card-body">{supply.label}</p>
          <p className="card-note">
            Kysymys ei ole siitä, joitko. Kysymys on siitä, auttoiko tämä.
          </p>
          <div className="actions">
            <button type="button" className="action" onClick={() => rate(true)}>
              Auttoi
            </button>
            <button type="button" className="action" onClick={() => rate(false)}>
              Ei auttanut
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="action wide" onClick={onDone}>
          Sulje
        </button>
      )}
    </section>
  );
}
