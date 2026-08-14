/**
 * "Tämä ilta" — the evening's own shape.
 *
 * The one screen in this app that shows the user their own drinking back to
 * them, which makes it the one screen most at risk of becoming a scoreboard. The
 * rules that keep it from turning into one:
 *
 *   - No target, no limit, no colour that means bad. The number of drinks is
 *     stated the way a clock states the time.
 *   - The subject of every sentence is the pace or the evening, never the
 *     person. "Tahti tiivistyi" is an observation; "joit liikaa" would be a
 *     verdict, and a verdict delivered at 23:00 is a dose of shame handed to
 *     someone in the exact state where shame does its damage.
 *   - It is reachable only while an evening is actually running, and only from a
 *     quiet link. Nobody has to walk past it.
 *
 * See `session.ts` for why there is no promille curve here. The short version is
 * that it cannot be computed without body weight and sex, the spread is a factor
 * of two, and this is the one number somebody might use to decide about driving.
 */

import { accelerationOrdinal, pacingProfile, summarise } from '../core/session';
import { MIN_SAMPLE } from '../core/stats';
import { formatClock, formatGap } from './labels';
import type { Store } from '../store';

interface Props {
  store: Store;
  onBack: () => void;
}

export function SessionView({ store, onBack }: Props) {
  const now = Date.now();
  const session = summarise(store.episodes, now);
  const profile = pacingProfile(store.episodes);
  const typical = accelerationOrdinal(profile, MIN_SAMPLE);

  // Widest gap sets the scale, so the bars compare against each other rather
  // than against an absolute the user never chose.
  const widest = Math.max(1, ...session.gapsMs);

  return (
    <section className="screen screen-scroll">
      <h1 className="ask">Tämä ilta</h1>

      <div className="card">
        <p className="card-label">Kertoja klo 5 jälkeen</p>
        <p className="card-figure">{session.drinks}</p>
        <p className="card-note">
          Jos jokainen niistä oli yksi annos — 4 cl 38 % — se on {session.grams} g
          alkoholia. Sovellus ei kysy mitä lasissa oli, joten pitkien drinkkien ilta ja
          tuplien ilta näyttävät tässä samalta.
        </p>
      </div>

      {session.takes.length > 0 && (
        <div className="card">
          <p className="card-label">Millä välein</p>
          <ul className="pace-list">
            {session.takes.map((take, i) => (
              <li key={take.id} className="pace-row">
                <span className="pace-clock">{formatClock(take.startedAt)}</span>
                {i === 0 ? (
                  <span className="pace-first">ensimmäinen</span>
                ) : (
                  <span className="pace-bar-wrap">
                    <span
                      className="pace-bar"
                      style={{ width: `${Math.max(4, (session.gapsMs[i - 1] / widest) * 100)}%` }}
                    />
                    <span className="pace-gap">{formatGap(session.gapsMs[i - 1])}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="card-note">
            Palkki on edellisestä kulunut aika. Lyhenevät palkit ovat se, mitä tässä
            kannattaa katsoa — ei niiden lukumäärä.
          </p>
        </div>
      )}

      {session.accelerated && (
        <div className="card card-warning">
          <p className="card-label">Tahti tiivistyi</p>
          <p className="card-note">
            Väli oli {formatGap(session.accelerated.gapMs)}, kun aiemmin tänä iltana se
            oli tyypillisesti {formatGap(session.accelerated.baselineMs)}. Tämä on se
            kohta, jota kysyit: piste, jossa ilta alkaa kulkea omalla painollaan.
          </p>
        </div>
      )}

      <div className="card">
        <p className="card-label">Omissa illoissasi</p>
        {typical !== undefined ? (
          <>
            <p className="card-note">
              Välit ovat tyypillisesti puolittuneet <strong>{typical}. kerran kohdalla</strong>.
              Se ei ole raja eikä sääntö — se on toistuva kohta omissa merkinnöissäsi,
              ja siksi se on se hetki, jolloin odottaminen maksaa eniten takaisin.
            </p>
            <ul className="stock">
              {profile
                .filter((p) => p.sessions >= MIN_SAMPLE)
                .map((p) => (
                  <li key={p.ordinal}>
                    <span>
                      {p.ordinal - 1}. → {p.ordinal}.
                    </span>
                    <span className="card-note">{formatGap(p.medianGapMs)}</span>
                  </li>
                ))}
            </ul>
          </>
        ) : (
          <p className="card-note">
            Ei vielä tarpeeksi iltoja, joissa on {MIN_SAMPLE} tai useampi kerta, jotta
            toistuvasta kohdasta voisi sanoa mitään. Tähän ei keksitä lukua ennen kuin
            se on olemassa — eikä sitä välttämättä tule, koska kaikilla ei ole
            sellaista kohtaa.
          </p>
        )}
      </div>

      <div className="card">
        <p className="card-label">Miksi tässä ei ole promillelukua</p>
        <p className="card-note">
          Promillea ei voi laskea ilman painoa ja sukupuolta, eikä ero ole pieni: kuusi
          annosta on 55-kiloisella naisella noin 2,4 ‰ ja 100-kiloisella miehellä noin
          1,1 ‰. Sama määrä, yli kaksinkertainen ero. Yksi luku tuolta väliltä ei olisi
          arvio vaan arvaus, jossa on desimaali — ja se on juuri se luku, jonka
          perusteella joku päättäisi ajamisesta.
        </p>
        <p className="card-note">
          Yllä olevat välit sen sijaan on mitattu eikä mallinnettu. Ne eivät riipu
          kehosta lainkaan, ja ne vastaavat kysymykseen tarkemmin: kysyit milloin tahti
          kiihtyy, ja se näkyy kellonajoista.
        </p>
      </div>

      <button type="button" className="quiet" onClick={onBack}>
        Takaisin
      </button>
    </section>
  );
}
