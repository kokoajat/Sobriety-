/**
 * Where to get help, permanently in reach.
 *
 * The safety screen runs once, and the person it matters most to may well have
 * skipped it, tapped through it at 02:00, or answered it honestly a year before
 * things changed. So the same information lives here too, on a link that is on
 * the home screen and never moves.
 *
 * Numbers first, explanation after. Someone who opens this page in a bad hour
 * should not have to read a paragraph to find a phone number.
 */

import { BAND_COPY } from '../core/screening';
import type { Store } from '../store';

interface Props {
  store: Store;
  onBack: () => void;
  onRescreen: () => void;
}

export function SafetyView({ store, onBack, onRescreen }: Props) {
  const screening = store.settings.screening;
  const band = screening?.band;

  return (
    <section className="screen screen-scroll">
      <h1 className="ask">Apua</h1>

      <div className="card">
        <p className="card-label">Hätätilanne</p>
        <p className="card-body">112</p>
        <p className="card-note">
          Myös silloin kun kyse on vieroitusoireista: kouristus, sekavuus tai
          harhat ovat päivystysasioita.
        </p>
      </div>

      <div className="card">
        <p className="card-label">Päihdeneuvonta</p>
        <p className="card-body">0800 900 45</p>
        <p className="card-note">
          Maksuton ja nimetön, ympäri vuorokauden. Sinne voi soittaa myös vain
          kysyäkseen, tai jonkun toisen puolesta.
        </p>
      </div>

      <div className="card">
        <p className="card-label">Kriisipuhelin</p>
        <p className="card-body">09 2525 0111</p>
        <p className="card-note">
          MIELI ry. Kun kyse on muusta kuin juomisesta — ahdistuksesta, yksinäisyydestä,
          siitä ettei jaksa.
        </p>
      </div>

      <div className="card card-warning">
        <p className="card-label">Jos juot päivittäin</p>
        <p className="card-body">
          Älä lopeta äkillisesti omin päin. Pitkään jatkuneen päivittäisen käytön
          jälkeen vieroitusoireet voivat johtaa kouristuksiin ja deliriumiin, ja ne
          voivat olla hengenvaarallisia. Turvallinen lopettaminen kuuluu lääkärille,
          ja se onnistuu.
        </p>
      </div>

      <p className="wait-note">
        Tämä sovellus auttaa yhdessä hetkessä kerrallaan. Se ei hoida vieroitusta,
        ei tunnista tilannettasi eikä korvaa ketään ihmistä.
      </p>

      {band && band !== 'low' && (
        <p className="wait-note">
          Aloituskyselyssä esiin tuli asioita, joiden takia yllä oleva koskee sinua
          suoraan: {BAND_COPY[band].heading.toLocaleLowerCase('fi')}.
        </p>
      )}

      <button type="button" className="action wide" onClick={onRescreen}>
        {screening ? 'Tee alkukysely uudelleen' : 'Tee alkukysely'}
      </button>

      <button type="button" className="quiet" onClick={onBack}>
        Takaisin
      </button>
    </section>
  );
}
