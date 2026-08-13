/**
 * The scoreboard — of the self-model, not of the drinking.
 *
 * Every number on this screen can improve on a day the user drank, and every one
 * of them can decay on a dry day. That is the whole thesis rendered as a screen:
 * the target is an accurate model of yourself, and sobriety is downstream of
 * seeing the fork early enough to have a say in it.
 */

import { calibrationBins } from '../core/forecast';
import { scoreableRows } from '../core/day';
import { SCORING_WINDOW_DAYS, useInsight } from '../store';
import { functionLabel } from '../core/functions';
import {
  BLOCK_LABELS,
  WEEKDAYS,
  formatDate,
  formatDuration,
  formatMinute,
  formatPercent,
  formatScore,
  readBias,
  readSkill,
  readSpread,
} from './labels';
import type { CustomFunction, Day, Settings } from '../core/types';

interface Props {
  days: Day[];
  today: string;
  /** Needed to name the user's own functions in the blind-spot and load lists. */
  functions: CustomFunction[];
  settings: Settings;
}

export function InsightView({ days, today, functions, settings }: Props) {
  const insight = useInsight(days, today, settings.dayStartsAtMin);
  const { scores, sessionSummary } = insight;

  return (
    <section className="view">
      <header className="view-head">
        <h1>Itsetuntemus</h1>
        <p className="lede">
          Nämä luvut mittaavat sitä, kuinka hyvin tunnet oman käyttäytymisesi. Yksikään niistä
          ei mittaa sitä, joitko.
        </p>
      </header>

      <div className="metric-grid">
        <Metric
          label="Erottelukyky"
          value={formatScore(scores.resolution)}
          note="Kuinka selvästi erotat riskipäivät muista. Ylös."
        />
        <Metric
          label="Kalibrointivirhe"
          value={formatScore(scores.reliability)}
          note="Osuvatko luvut pitkässä juoksussa. Alas."
        />
        <Metric
          label="Ennustetaito"
          value={formatScore(scores.skillScore, 2)}
          note={readSkill(scores.skillScore, scores.n)}
          wide
        />
      </div>

      <div className="block">
        <h2>Peräkkäiset päivät mukana</h2>
        <p className="streak">{insight.streak}</p>
        <p className="hint">
          Katkeaa vain väliin jätetystä päivästä. Juominen ei katkaise sitä, koska se ei
          mittaa juomista.
        </p>
      </div>

      <div className="block">
        <h2>Kalibrointi</h2>
        <p className="hint">
          Vaakasuunnassa arviosi, pystysuunnassa toteuma. Täydellisesti kalibroitu ennustaja
          asettuu viivalle.
        </p>
        <CalibrationPlot days={days} today={today} />
        <ul className="reading">
          <li>{readBias(insight.bias, scores.n)}</li>
          <li>{readSpread(insight.spread, scores.n)}</li>
          <li>
            Perustaso {formatPercent(scores.baseRate)} · {scores.n} pisteytettyä päivää /{' '}
            {SCORING_WINDOW_DAYS}
          </li>
        </ul>
      </div>

      {insight.sessions.length > 0 && (
        <div className="block">
          <h2>Jaksot</h2>
          <p className="hint">
            Päivä yhtenä jaksona: ensimmäisestä risteyksestä viimeiseen. Päivän raja on klo{' '}
            {formatMinute(settings.dayStartsAtMin)}, joten puolenyön yli jatkunut ilta on
            yksi jakso eikä kaksi.
          </p>

          {sessionSummary.count >= 3 && (
            <p className="hint">
              Tyypillinen jakso kestää {formatDuration(sessionSummary.medianDurationMin)} ja
              päättyy klo {formatMinute(sessionSummary.medianEndMin)}.
            </p>
          )}

          <ul className="sessions">
            {insight.sessions.slice(0, 10).map((s) => (
              <li key={s.date}>
                <span className="session-when">{formatDate(s.date)}</span>
                <span className="session-span">
                  {s.forks === 1
                    ? formatMinute(s.startMin)
                    : `${formatMinute(s.startMin)}–${formatMinute(s.endMin)}`}
                </span>
                <span className="hint">
                  {s.forks === 1 ? '1 risteys' : `${formatDuration(s.durationMin)} · ${s.forks} risteystä`}
                  {/* A long quiet stretch means these were separate occasions;
                      saying so keeps the span from implying one continuous evening. */}
                  {s.longestGapMin >= 180 ? ' · erillisissä erissä' : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {insight.blindSpots.length > 0 && (
        <div className="block">
          <h2>Sokeat pisteet</h2>
          <p className="hint">
            Hetket, joissa risteys tulee vastaan ilman että olit merkinnyt sitä aamulla.
          </p>
          <ul className="blindspots">
            {insight.blindSpots.slice(0, 5).map((s) => (
              <li key={`${s.weekday}-${s.block}`}>
                <strong>
                  {WEEKDAYS[s.weekday]} · {BLOCK_LABELS[s.block].toLowerCase()}
                </strong>
                <span>
                  {s.forksUnpredicted}/{s.forksObserved} risteystä yllätti
                  {s.dominantTag
                    ? ` · ${functionLabel(s.dominantTag, functions).toLowerCase()}`
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {insight.load.length > 0 && (
        <div className="block">
          <h2>Mihin tehtävään juoma otetaan</h2>
          <ul className="loadlist">
            {insight.load.slice(0, 5).map((row) => (
              <li key={row.tag}>
                <span>{functionLabel(row.tag, functions)}</span>
                <span className="hint">
                  {row.drank}/{row.forks} risteystä päätyi juomaan
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {Number.isFinite(insight.noticing.rate) && (
        <div className="block">
          <h2>Huomaaminen</h2>
          <p className="hint">
            {insight.noticing.inMoment}/{insight.noticing.total} risteystä kirjattiin
            hetkessä, loput illalla jälkikäteen. Hetkessä huomaaminen on se taito, jota tässä
            harjoitellaan.
          </p>
        </div>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
  note,
  wide,
}: {
  label: string;
  value: string;
  note: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'metric metric-wide' : 'metric'}>
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
      <span className="metric-note">{note}</span>
    </div>
  );
}

/**
 * Reliability diagram. Bins with no data are simply absent rather than plotted
 * at zero, so an empty region reads as "no evidence" instead of "perfect".
 */
function CalibrationPlot({ days, today }: Pick<Props, 'days' | 'today'>) {
  const rows = scoreableRows(days.filter((d) => d.date <= today));
  const bins = calibrationBins(rows, 5).filter((b) => b.n > 0);
  const size = 240;
  const pad = 28;
  const scale = (v: number) => pad + v * (size - 2 * pad);
  const maxN = Math.max(1, ...bins.map((b) => b.n));

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="calibration"
      role="img"
      aria-label="Kalibrointikuvaaja"
    >
      <rect x={pad} y={pad} width={size - 2 * pad} height={size - 2 * pad} className="plot-bg" />
      <line x1={pad} y1={size - pad} x2={size - pad} y2={pad} className="plot-ideal" />
      {bins.map((bin) => (
        <circle
          key={bin.from}
          cx={scale(bin.meanForecast)}
          cy={size - scale(bin.observedRate)}
          r={4 + 6 * (bin.n / maxN)}
          className="plot-point"
        />
      ))}
      <text x={pad} y={size - 8} className="plot-axis">
        0 %
      </text>
      <text x={size - pad} y={size - 8} textAnchor="end" className="plot-axis">
        100 %
      </text>
      {bins.length === 0 && (
        <text x={size / 2} y={size / 2} textAnchor="middle" className="plot-axis">
          Ei vielä dataa
        </text>
      )}
    </svg>
  );
}
