/**
 * Small drawings that carry a line further than its words do.
 *
 * Inline SVG only. An image file would mean a network request, and this app
 * makes none — so every scene here is drawn with paths and animated with CSS,
 * which also means both themes work from one asset and nothing loads late.
 *
 * A figure is added only where the picture does work the sentence cannot: a
 * shape of a curve, a comparison of two sizes, a thing moving. Illustrating a
 * line that was already clear just puts a decoration between the reader and the
 * text, and at 23:00 that is a cost rather than a feature.
 */

export type FactFigure =
  | 'risk-curve'
  | 'sleep-arch'
  | 'liver-rate'
  | 'octopus-hearts'
  | 'hexagons'
  | 'saturn-float'
  | 'light-travel'
  | 'ice-expand'
  | 'fold-double'
  | 'moon-drift'
  | 'urge-wave'
  | 'bac-curve'
  | 'standard-drink'
  | 'life-expectancy'
  | 'cancer-share'
  | 'tolerance-shift'
  | 'snowflake'
  | 'bamboo-grow'
  | 'chess-branch'
  | 'benford'
  | 'four-colour'
  | 'venus-day'
  | 'water-ball'
  | 'hummingbird';

export function FactScene({ figure }: { figure: FactFigure }) {
  return (
    <svg className="scene" viewBox="0 0 200 96" role="img" aria-label={LABELS[figure]}>
      {SCENES[figure]}
    </svg>
  );
}

const LABELS: Record<FactFigure, string> = {
  'risk-curve': 'Pylväskuvio sairastuvuudesta annosmäärän mukaan',
  'sleep-arch': 'Unen syvyys yön aikana, vertailu',
  'liver-rate': 'Maksan käsittelynopeus, yksi annos tunnissa',
  'octopus-hearts': 'Kolme sykkivää sydäntä',
  hexagons: 'Kennoston kuusikulmiot',
  'saturn-float': 'Saturnus kelluu vedessä',
  'light-travel': 'Valon matka Auringosta Maahan',
  'ice-expand': 'Vesi laajenee jäätyessään',
  'fold-double': 'Taitosten paksuus kaksinkertaistuu',
  'moon-drift': 'Kuu loittonee Maasta',
  'urge-wave': 'Himon aalto: nousu, huippu ja lasku',
  'bac-curve': 'Nouseva ja laskeva humalakäyrä',
  'standard-drink': 'Yksi annos kolmena juomana',
  'life-expectancy': 'Elinajanodotteen lyheneminen kulutuksen mukaan',
  'cancer-share': 'Alkoholin osuus uusista syövistä',
  'tolerance-shift': 'Sietokyvyn kasvu siirtää käyrää',
  snowflake: 'Lumihiutaleen kuusisakarainen rakenne',
  'bamboo-grow': 'Bambun kasvu',
  'chess-branch': 'Shakin haarautuminen',
  benford: 'Ensimmäisen numeron jakauma',
  'four-colour': 'Neljä väriä riittää kartalle',
  'venus-day': 'Venuksen vuorokausi ja vuosi',
  'water-ball': 'Maapallon kaikki vesi yhtenä pallona',
  hummingbird: 'Kolibri lentää myös taaksepäin',
};

/** Bars for 914 / 918 / 977 / 1252 per 100 000, scaled to the frame. */
const RISK_BARS = [
  { label: '0', value: 914 },
  { label: '1', value: 918 },
  { label: '2', value: 977 },
  { label: '5', value: 1252 },
];

const SCENES: Record<FactFigure, JSX.Element> = {
  // Deliberately drawn from a true zero: starting the axis at 900 would turn a
  // four-per-hundred-thousand difference into a visual cliff, which is exactly
  // the misreading the accompanying lines exist to correct.
  'risk-curve': (
    <g>
      {RISK_BARS.map((bar, i) => {
        const h = (bar.value / 1400) * 66;
        return (
          <g key={bar.label}>
            <rect className="scene-fill" x={28 + i * 42} y={78 - h} width={24} height={h} rx="2" />
            <text className="scene-text" x={40 + i * 42} y={90} textAnchor="middle">
              {bar.label}
            </text>
            <text className="scene-tiny" x={40 + i * 42} y={74 - h} textAnchor="middle">
              {bar.value}
            </text>
          </g>
        );
      })}
      <line className="scene-line" x1="20" y1="78" x2="188" y2="78" />
    </g>
  ),

  'sleep-arch': (
    <g>
      <path className="scene-stroke" d="M14 22 q18 34 36 34 q18 0 26 -26 q10 -26 26 -20 q18 4 26 24 q10 24 28 20 q14 -4 22 -26" />
      <path
        className="scene-stroke scene-dashed"
        d="M14 22 q14 46 32 48 q16 2 22 -10 q8 -14 16 -6 q10 10 4 22 q-6 12 8 14 q16 2 24 -12 q10 -16 22 -8 q12 8 20 -4"
      />
      <text className="scene-tiny" x="14" y="94">
        yön alku
      </text>
      <text className="scene-tiny" x="186" y="94" textAnchor="end">
        aamu
      </text>
    </g>
  ),

  'liver-rate': (
    <g>
      <rect className="scene-line-box" x="60" y="26" width="80" height="44" rx="8" />
      <text className="scene-tiny" x="100" y="52" textAnchor="middle">
        1 annos / tunti
      </text>
      <circle className="scene-fill scene-drift" cx="26" cy="48" r="7" />
      <circle className="scene-fill scene-drift scene-drift-2" cx="26" cy="48" r="7" />
      <path className="scene-line" d="M148 48 l24 0 m-6 -5 l6 5 l-6 5" />
    </g>
  ),

  'octopus-hearts': (
    <g>
      {[62, 100, 138].map((x, i) => (
        <path
          key={x}
          className={`scene-fill scene-beat scene-beat-${i}`}
          d={`M${x} 66 q-16 -12 -16 -24 q0 -12 10 -12 q6 0 6 8 q0 -8 6 -8 q10 0 10 12 q0 12 -16 24 z`}
        />
      ))}
    </g>
  ),

  hexagons: (
    <g className="scene-stroke">
      {[0, 1, 2, 3].map((col) =>
        [0, 1].map((row) => {
          const x = 44 + col * 30;
          const y = 32 + row * 32 + (col % 2) * 16;
          return (
            <polygon
              key={`${col}-${row}`}
              points={`${x},${y - 16} ${x + 14},${y - 8} ${x + 14},${y + 8} ${x},${y + 16} ${x - 14},${y + 8} ${x - 14},${y - 8}`}
            />
          );
        }),
      )}
    </g>
  ),

  'saturn-float': (
    <g>
      <path className="scene-fill scene-water" d="M0 62 h200 v34 h-200 z" />
      <g className="scene-bob">
        <circle className="scene-fill" cx="100" cy="50" r="18" />
        <ellipse className="scene-stroke" cx="100" cy="50" rx="34" ry="9" />
      </g>
      <path className="scene-line" d="M0 62 h200" />
    </g>
  ),

  'light-travel': (
    <g>
      <circle className="scene-fill" cx="24" cy="48" r="14" />
      <circle className="scene-stroke" cx="176" cy="48" r="8" />
      <path className="scene-line scene-dashed" d="M40 48 h128" />
      <circle className="scene-fill scene-photon" cx="40" cy="48" r="4" />
      <text className="scene-tiny" x="100" y="76" textAnchor="middle">
        8 min
      </text>
    </g>
  ),

  'ice-expand': (
    <g>
      <rect className="scene-line-box" x="34" y="26" width="46" height="56" rx="4" />
      <rect className="scene-fill" x="38" y="54" width="38" height="24" />
      <text className="scene-tiny" x="57" y="94" textAnchor="middle">
        vesi
      </text>
      <rect className="scene-line-box" x="120" y="26" width="46" height="56" rx="4" />
      <rect className="scene-fill scene-rise" x="124" y="44" width="38" height="34" />
      <text className="scene-tiny" x="143" y="94" textAnchor="middle">
        jää
      </text>
    </g>
  ),

  'fold-double': (
    <g>
      {[1, 2, 4, 8, 16].map((n, i) => (
        <g key={n}>
          <rect
            className="scene-fill"
            x={22 + i * 36}
            y={72 - n * 3.2}
            width={26}
            height={n * 3.2}
            rx="1"
          />
          <text className="scene-tiny" x={35 + i * 36} y={88} textAnchor="middle">
            {i}
          </text>
        </g>
      ))}
      <line className="scene-line" x1="14" y1="72" x2="188" y2="72" />
    </g>
  ),


  // Himon aalto: koko sovelluksen premissi yhtenä muotona.
  'urge-wave': (
    <g>
      <path className="scene-stroke" d="M12 78 q26 0 40 -46 q10 -32 26 -32 q16 0 26 32 q14 46 40 46 q26 0 44 -6" />
      <circle className="scene-fill scene-ride" cx="12" cy="78" r="4.5" />
      <text className="scene-tiny" x="78" y="14" textAnchor="middle">huippu</text>
      <line className="scene-line" x1="12" y1="80" x2="188" y2="80" />
      <text className="scene-tiny" x="188" y="92" textAnchor="end">aika</text>
    </g>
  ),

  // Nouseva käyrä piristää, laskeva vaimentaa — siksi toinen annos houkuttaa.
  'bac-curve': (
    <g>
      <path className="scene-stroke" d="M14 78 q30 -56 56 -56 q30 0 52 56" />
      <path className="scene-line scene-dashed" d="M70 22 v56" />
      <text className="scene-tiny" x="40" y="18">nousee</text>
      <text className="scene-tiny" x="104" y="18">laskee</text>
      <text className="scene-tiny" x="40" y="92" textAnchor="middle">piristää</text>
      <text className="scene-tiny" x="112" y="92" textAnchor="middle">vaimentaa</text>
      <line className="scene-line" x1="14" y1="78" x2="150" y2="78" />
    </g>
  ),

  // Yksi annos kolmena eri juomana, tilavuudet suhteessa.
  'standard-drink': (
    <g>
      <path className="scene-stroke" d="M26 26 h26 l-3 50 h-20 z" />
      <path className="scene-fill" d="M28 42 h22 l-2.5 32 h-17 z" />
      <text className="scene-tiny" x="39" y="90" textAnchor="middle">33 cl</text>
      <path className="scene-stroke" d="M86 26 q14 0 14 16 q0 12 -7 14 v20 m-14 0 h28 m-14 -20 q-7 -2 -7 -14 q0 -16 14 -16" />
      <text className="scene-tiny" x="93" y="90" textAnchor="middle">12 cl</text>
      <path className="scene-stroke" d="M144 44 h20 l-2 32 h-16 z" />
      <path className="scene-fill" d="M146 54 h16 l-1.5 20 h-13 z" />
      <text className="scene-tiny" x="154" y="90" textAnchor="middle">4 cl</text>
    </g>
  ),

  // Wood ym. 2018: elinajanodote 40-vuotiaana kulutusluokan mukaan.
  'life-expectancy': (
    <g>
      {[
        { l: '<100', v: 0 },
        { l: '100–200', v: 0.5 },
        { l: '200–350', v: 1.5 },
        { l: '>350', v: 4.5 },
      ].map((b, i) => (
        <g key={b.l}>
          <rect className="scene-fill" x={22 + i * 44} y={20} width={22} height={Math.max(2, b.v * 11)} rx="2" />
          <text className="scene-tiny" x={33 + i * 44} y={78} textAnchor="middle">{b.l}</text>
          <text className="scene-tiny" x={33 + i * 44} y={90} textAnchor="middle">
            {b.v === 0 ? '—' : `-${b.v} v`}
          </text>
        </g>
      ))}
      <text className="scene-tiny" x="4" y="16">g / viikko</text>
    </g>
  ),

  // Rumgay ym. 2021: 4,1 % uusista syövistä.
  'cancer-share': (
    <g>
      <circle className="scene-line-box" cx="100" cy="48" r="30" />
      <path className="scene-fill" d="M100 48 L100 18 A30 30 0 0 1 107.7 19 Z" />
      <text className="scene-text" x="100" y="92" textAnchor="middle">4,1 % kaikista uusista syövistä</text>
    </g>
  ),

  // Sietokyky siirtää annos-vastekäyrää oikealle.
  'tolerance-shift': (
    <g>
      <path className="scene-stroke" d="M16 74 q24 -46 46 -46 q10 0 16 8" />
      <path className="scene-stroke scene-dashed" d="M60 74 q24 -46 46 -46 q10 0 16 8" />
      <path className="scene-line" d="M132 40 l24 0 m-6 -5 l6 5 l-6 5" />
      <text className="scene-tiny" x="16" y="90">sama vaikutus</text>
      <text className="scene-tiny" x="188" y="90" textAnchor="end">enemmän ainetta</text>
    </g>
  ),

  snowflake: (
    <g className="scene-stroke scene-spin" style={{ transformOrigin: '100px 48px' }}>
      {[0, 60, 120].map((a) => (
        <g key={a} transform={`rotate(${a} 100 48)`}>
          <line x1="70" y1="48" x2="130" y2="48" />
          <path d="M82 48 l8 -7 M82 48 l8 7 M118 48 l-8 -7 M118 48 l-8 7" />
        </g>
      ))}
    </g>
  ),

  'bamboo-grow': (
    <g>
      <line className="scene-line" x1="14" y1="86" x2="188" y2="86" />
      <g className="scene-sprout" style={{ transformOrigin: '100px 86px' }}>
        <rect className="scene-fill" x="94" y="18" width="12" height="68" rx="3" />
        <path className="scene-stroke" d="M94 40 h12 M94 58 h12 M94 74 h12" />
      </g>
      <text className="scene-tiny" x="140" y="52">~1 m / vrk</text>
    </g>
  ),

  'chess-branch': (
    <g className="scene-stroke">
      <path d="M100 16 l-40 22 M100 16 l0 22 M100 16 l40 22" />
      <path d="M60 38 l-20 20 M60 38 l0 20 M60 38 l20 20" />
      <path d="M100 38 l-20 20 M100 38 l0 20 M100 38 l20 20" />
      <path d="M140 38 l-20 20 M140 38 l0 20 M140 38 l20 20" />
      <text className="scene-tiny" x="100" y="90" textAnchor="middle">…ja niin edelleen</text>
    </g>
  ),

  benford: (
    <g>
      {[30, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6].map((v, i) => (
        <g key={i}>
          <rect className="scene-fill" x={22 + i * 18} y={74 - v * 1.9} width={12} height={v * 1.9} rx="1" />
          <text className="scene-tiny" x={28 + i * 18} y={86} textAnchor="middle">{i + 1}</text>
        </g>
      ))}
      <line className="scene-line" x1="16" y1="74" x2="186" y2="74" />
    </g>
  ),

  'four-colour': (
    <g>
      <path className="scene-fill" d="M20 20 h56 v30 h-56 z" opacity="0.9" />
      <path className="scene-fill" d="M76 20 h52 v30 h-52 z" opacity="0.45" />
      <path className="scene-fill" d="M128 20 h52 v30 h-52 z" opacity="0.7" />
      <path className="scene-fill" d="M20 50 h44 v30 h-44 z" opacity="0.45" />
      <path className="scene-fill" d="M64 50 h60 v30 h-60 z" opacity="0.9" />
      <path className="scene-fill" d="M124 50 h56 v30 h-56 z" opacity="0.25" />
      <g className="scene-line">
        <path d="M20 20 h160 v60 h-160 z M76 20 v30 M128 20 v30 M64 50 v30 M124 50 v30 M20 50 h160" />
      </g>
    </g>
  ),

  'venus-day': (
    <g>
      <text className="scene-tiny" x="14" y="30">vuorokausi</text>
      <rect className="scene-fill" x="14" y="34" width="150" height="14" rx="3" />
      <text className="scene-tiny" x="14" y="66">vuosi</text>
      <rect className="scene-fill" x="14" y="70" width="112" height="14" rx="3" opacity="0.5" />
      <text className="scene-tiny" x="170" y="45">243 vrk</text>
      <text className="scene-tiny" x="132" y="81">225</text>
    </g>
  ),

  'water-ball': (
    <g>
      <circle className="scene-stroke" cx="66" cy="48" r="38" />
      <circle className="scene-fill" cx="150" cy="62" r="18" />
      <text className="scene-tiny" x="66" y="94" textAnchor="middle">Maa</text>
      <text className="scene-tiny" x="150" y="94" textAnchor="middle">kaikki vesi</text>
    </g>
  ),

  hummingbird: (
    <g>
      <g className="scene-hover">
        <ellipse className="scene-fill" cx="100" cy="48" rx="16" ry="8" />
        <path className="scene-stroke" d="M84 48 l-16 -4 M116 46 l14 -10" />
      </g>
      <path className="scene-line" d="M60 74 h-22 m6 -5 l-6 5 l6 5" />
      <path className="scene-line" d="M140 74 h22 m-6 -5 l6 5 l-6 5" />
      <text className="scene-tiny" x="100" y="78" textAnchor="middle">molempiin</text>
    </g>
  ),

  'moon-drift': (
    <g>
      <circle className="scene-fill" cx="52" cy="48" r="20" />
      <circle className="scene-stroke scene-recede" cx="136" cy="48" r="8" />
      <path className="scene-line" d="M150 48 l22 0 m-6 -5 l6 5 l-6 5" />
      <text className="scene-tiny" x="161" y="72" textAnchor="middle">
        3,8 cm/v
      </text>
    </g>
  ),
};
