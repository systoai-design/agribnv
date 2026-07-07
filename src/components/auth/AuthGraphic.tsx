import './auth-graphic.css';
import { ART_W, ART_H, HORIZON_Y, FOREST, FOREST_DEEP, SAGE, CREAM } from './art-constants';

// "Terraced Light" — a quiet farm landscape for the auth pane: terraced fields under a soft sky,
// a defined mountain range on the horizon, and two bird flocks. Delicate cream line-work on
// forest green. The tree (Remotion) is overlaid separately — the ground band directly below the
// horizon is deliberately kept clear so nothing crosses the tree's base.

const W = ART_W;
const H = ART_H;
const HY = HORIZON_Y;

const f = (n: number) => Math.round(n * 100) / 100;

// Catmull-Rom → cubic bezier for hand-smooth contour lines.
function smooth(pts: number[][]): string {
  let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${f(c1x)} ${f(c1y)}, ${f(c2x)} ${f(c2y)}, ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

interface TerraceLine {
  d: string;
  stroke: string;
  opacity: number;
  width: number;
}

// Terraced fields — reduced density, and the first line starts well below the horizon so the
// tree's ground stays clear. Waves use only integer u-frequencies, so each line repeats every
// width W; drawing across three widths (u ∈ [-1, 2]) lets the group translate by exactly W
// with no seam.
const TERRACE_GAP = 42; // clear band below the horizon (the tree's ground)
const TERRACES: TerraceLine[] = (() => {
  const N = 26;
  const S = 66;
  const lines: TerraceLine[] = [];
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    const y = HY + TERRACE_GAP + (H - HY - TERRACE_GAP) * Math.pow(t, 1.55);
    const amp = 3 + 30 * t;
    const phase = i * 0.6;
    const pts: number[][] = [];
    for (let s = 0; s <= S; s++) {
      const u = -1 + (s / S) * 3;
      const x = u * W;
      const wave =
        Math.sin(u * Math.PI * 2 + phase) * amp * 0.6 +
        Math.sin(u * Math.PI * 4 + phase * 1.6) * amp * 0.3 +
        Math.sin(u * Math.PI * 6 + phase * 2.2) * amp * 0.15;
      pts.push([x, y + wave]);
    }
    const isIndex = i % 5 === 0;
    lines.push({
      d: smooth(pts),
      stroke: isIndex ? CREAM : SAGE,
      opacity: isIndex ? 0.4 : 0.1 + 0.16 * t,
      width: isIndex ? 1.35 : 0.85,
    });
  }
  return lines;
})();

interface Mountain {
  fillD: string;
  strokeD: string;
  fillOp: number;
  strokeOp: number;
  strokeW: number;
}

// Mountain range — three layered, filled silhouettes with defined ridgelines. Masses (fills)
// rather than lines, with peaky profiles, so they read clearly as mountains and can't be
// confused with the thin rolling field contours below the horizon.
const MOUNTAINS: Mountain[] = (() => {
  const specs = [
    { base: 468, amp: 92, fr: [0.0085, 0.019, 0.037], phase: 0.9, fillOp: 0.07, strokeOp: 0.18, strokeW: 1 },
    { base: 469, amp: 60, fr: [0.01, 0.022, 0.041], phase: 2.6, fillOp: 0.12, strokeOp: 0.3, strokeW: 1.1 },
    { base: 470, amp: 34, fr: [0.012, 0.026, 0.047], phase: 4.3, fillOp: 0.18, strokeOp: 0.46, strokeW: 1.2 },
  ];
  return specs.map((s) => {
    const pts: number[][] = [];
    for (let x = -20; x <= 820; x += 10) {
      const e =
        0.55 * Math.sin(x * s.fr[0] + s.phase) +
        0.3 * Math.sin(x * s.fr[1] + s.phase * 1.7) +
        0.15 * Math.sin(x * s.fr[2] + s.phase * 2.3);
      const n = (e + 1) / 2; // 0..1
      const y = s.base - s.amp * Math.pow(n, 1.6); // sharpened peaks, wide valleys
      pts.push([x, y]);
    }
    const strokeD = smooth(pts);
    const fillD = `${strokeD} L 820 ${HY} L -20 ${HY} Z`;
    return { fillD, strokeD, fillOp: s.fillOp, strokeOp: s.strokeOp, strokeW: s.strokeW };
  });
})();

// Two flocks — [x, y, scale]. The main flock rides the open sky top-right; a smaller, farther
// flock drifts upper-left on its own slower cycle for parallax.
const FLOCK_MAIN: number[][] = [
  [588, 150, 1.1],
  [620, 134, 0.95],
  [652, 146, 0.85],
  [678, 162, 0.7],
];
const FLOCK_FAR: number[][] = [
  [236, 166, 0.8],
  [262, 152, 0.68],
  [286, 168, 0.58],
];

function birdPath([x, y, sc]: number[]): string {
  const w = 6 * sc;
  return `M ${f(x - w)} ${f(y)} Q ${f(x - w * 0.3)} ${f(y - w * 0.7)} ${f(x)} ${f(y - w * 0.15)} Q ${f(x + w * 0.3)} ${f(y - w * 0.7)} ${f(x + w)} ${f(y)}`;
}

interface GrassBlade {
  d: string;
  x: number;
  y: number;
  width: number;
  opacity: number;
  delay: number;
  duration: number;
}

// Wind-blown grass — scattered tufts across the fields, each blade swaying in place (rotation
// about its own base, not the terraces' horizontal drift). Deterministic trig-based placement
// (matching the TERRACES/MOUNTAINS pattern) rather than Math.random, so the field is stable
// across renders. Staggered per-blade delay/duration makes the sway ripple across the field
// instead of every blade moving in lockstep.
const GRASS: GrassBlade[] = (() => {
  const blades: GrassBlade[] = [];
  const CLUMPS = 16;
  for (let c = 0; c < CLUMPS; c++) {
    const clumpX = 30 + ((c * 53) % 740) + Math.sin(c * 2.7) * 26;
    const clumpY = 610 + ((c * 137) % 440);
    const bladeCount = 3 + (c % 3);
    for (let b = 0; b < bladeCount; b++) {
      const x = clumpX + (b - (bladeCount - 1) / 2) * 6.5 + Math.sin(c + b) * 3;
      const y = clumpY + Math.cos(b * 1.7) * 7;
      const height = 20 + ((c * 7 + b * 5) % 22);
      const lean = 5 + ((c + b) % 6);
      blades.push({
        d: `M ${f(x)} ${f(y)} Q ${f(x + lean * 0.5)} ${f(y - height * 0.6)} ${f(x + lean)} ${f(y - height)}`,
        x,
        y,
        width: 1.1 + (b % 2) * 0.3,
        opacity: 0.26 + ((c + b) % 4) * 0.05,
        delay: (c * 0.35 + b * 0.12) % 4.2,
        duration: 3.4 + ((c + b) % 5) * 0.4,
      });
    }
  }
  return blades;
})();

export function AuthGraphic() {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="ag-glow" cx="70%" cy="15%" r="65%">
          <stop offset="0%" stopColor={SAGE} stopOpacity="0.24" />
          <stop offset="55%" stopColor={SAGE} stopOpacity="0.05" />
          <stop offset="100%" stopColor={SAGE} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ag-deepen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={FOREST_DEEP} stopOpacity="0" />
          <stop offset="62%" stopColor={FOREST_DEEP} stopOpacity="0" />
          <stop offset="100%" stopColor={FOREST_DEEP} stopOpacity="0.72" />
        </linearGradient>
        <filter id="ag-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="saturate" values="0" />
        </filter>
      </defs>

      <rect width={W} height={H} fill={FOREST} />
      <rect width={W} height={H} fill="url(#ag-glow)" />

      {/* Mountain range — back to front */}
      {MOUNTAINS.map((m, i) => (
        <g key={`m${i}`}>
          <path d={m.fillD} fill={SAGE} opacity={m.fillOp} />
          <path d={m.strokeD} fill="none" stroke={CREAM} strokeWidth={m.strokeW} opacity={m.strokeOp} />
        </g>
      ))}

      {/* Terraced fields */}
      <g className="ag-drift">
        {TERRACES.map((l, i) => (
          <path key={i} d={l.d} fill="none" stroke={l.stroke} strokeWidth={l.width} opacity={l.opacity} />
        ))}
      </g>

      {/* Wind-blown grass — swaying in place, independent of the terrace drift */}
      <g>
        {GRASS.map((g, i) => (
          <path
            key={`g${i}`}
            className="ag-grass"
            d={g.d}
            fill="none"
            stroke={CREAM}
            strokeWidth={g.width}
            strokeLinecap="round"
            opacity={g.opacity}
            style={
              {
                transformBox: 'view-box',
                transformOrigin: `${f(g.x)}px ${f(g.y)}px`,
                animationDelay: `${g.delay}s`,
                animationDuration: `${g.duration}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </g>

      <line x1={-20} y1={HY} x2={W + 20} y2={HY} stroke={CREAM} strokeWidth={1.1} opacity={0.5} />

      {/* Bird flocks */}
      <g className="ag-birds">
        {FLOCK_MAIN.map((b, i) => (
          <path key={`b${i}`} d={birdPath(b)} fill="none" stroke={CREAM} strokeWidth={1} opacity={0.5} />
        ))}
      </g>
      <g className="ag-birds2">
        {FLOCK_FAR.map((b, i) => (
          <path key={`c${i}`} d={birdPath(b)} fill="none" stroke={CREAM} strokeWidth={0.9} opacity={0.36} />
        ))}
      </g>

      <rect width={W} height={H} fill="url(#ag-deepen)" />
      <rect width={W} height={H} filter="url(#ag-grain)" opacity={0.09} />
    </svg>
  );
}
