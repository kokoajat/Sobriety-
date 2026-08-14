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
  | 'moon-drift';

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
