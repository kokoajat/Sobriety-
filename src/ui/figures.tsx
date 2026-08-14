/**
 * Schematic body figures, drawn inline.
 *
 * Deliberately diagrammatic rather than anatomical. The job is "you are looking
 * for roughly here", which a clean outline does better than a realistic drawing
 * at phone size — and a realistic one would need an image file, which would mean
 * a network request, which this app does not make.
 *
 * All strokes use currentColor so both themes work without a second asset.
 */

import type { Figure } from '../core/techniques';

interface Props {
  figure: Figure;
  /** Marker position in the figure's own 0..100 space. */
  point?: { x: number; y: number };
}

export function BodyFigure({ figure, point }: Props) {
  return (
    <svg className="figure" viewBox="0 0 100 100" role="img" aria-label={FIGURE_LABELS[figure]}>
      <g className="figure-line">{SHAPES[figure]}</g>
      {point && (
        <g className="figure-point">
          {/* Two rings: the outer one pulses so the eye lands on it first. */}
          <circle className="figure-halo" cx={point.x} cy={point.y} r="9" />
          <circle className="figure-dot" cx={point.x} cy={point.y} r="3.2" />
        </g>
      )}
    </svg>
  );
}

const FIGURE_LABELS: Record<Figure, string> = {
  hand: 'Kämmen ylhäältä, painelukohta merkittynä',
  wrist: 'Kyynärvarren sisäpuoli, painelukohta merkittynä',
  face: 'Kasvot edestä, painelukohta merkittynä',
};

const SHAPES: Record<Figure, JSX.Element> = {
  // Back of the hand: palm, thumb swung out to the left, four fingers up.
  hand: (
    <>
      <path d="M36 52 q-4 -8 -9 -12 q-5 -4 -8 1 q-3 5 3 10 l10 10" />
      <path d="M34 60 q0 18 8 26 q4 4 12 4 q12 0 16 -8 q3 -6 3 -16 l0 -14" />
      <path d="M38 56 l0 -28 q0 -4 4 -4 q4 0 4 4 l0 26" />
      <path d="M48 54 l0 -34 q0 -4 4 -4 q4 0 4 4 l0 32" />
      <path d="M58 54 l0 -32 q0 -4 4 -4 q4 0 4 4 l0 30" />
      <path d="M68 56 l0 -24 q0 -4 3.5 -4 q3.5 0 3.5 4 l0 24" />
    </>
  ),
  // Inner forearm running up the frame, with the wrist crease across it.
  wrist: (
    <>
      <path d="M32 96 l0 -46 q0 -12 6 -20 l4 -6" />
      <path d="M68 96 l0 -46 q0 -12 -6 -20 l-4 -6" />
      <path d="M33 52 q17 6 34 0" />
      <path d="M34 58 q16 5 32 0" />
      {/* The two tendons the point sits between. */}
      <path d="M44 50 l0 -26" className="figure-faint" />
      <path d="M56 50 l0 -26" className="figure-faint" />
    </>
  ),
  // Face, front on. Only what is needed to locate the space between the brows.
  face: (
    <>
      <path d="M50 12 q20 0 22 24 q2 26 -8 40 q-6 10 -14 10 q-8 0 -14 -10 q-10 -14 -8 -40 q2 -24 22 -24" />
      <path d="M36 40 q6 -5 12 -1" />
      <path d="M64 40 q-6 -5 -12 -1" />
      <path d="M50 52 l0 10 q0 3 3 3" className="figure-faint" />
      <path d="M42 74 q8 5 16 0" className="figure-faint" />
    </>
  ),
};
