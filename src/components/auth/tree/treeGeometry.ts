// Deterministic geometry for the auth-pane tree — filled (non-monoline) shapes: a tapered
// solid trunk with root flare, curving limbs, twigs, and a dense rounded canopy of individual
// teardrop leaves (styled after a classic full-canopy tree, adapted to the brand palette).
// Pure + seeded so the same tree is produced on every render; every shape carries animation
// metadata (attachment point / stagger order) so the Remotion composition can grow it
// trunk → limbs → twigs → leaves.

import { TREE_X, HORIZON_Y, SAGE, CREAM } from '../art-constants';

export interface SpinePt {
  x: number;
  y: number;
  w: number; // full width of the branch at this point
}

export type BranchKind = 'trunk' | 'limb' | 'twig';

export interface BranchShape {
  d: string;
  ax: number; // attachment (growth origin)
  ay: number;
  rank: number; // stagger order within its kind
  kind: BranchKind;
}

export interface LeafShape {
  d: string;
  cx: number;
  cy: number;
  order: number; // 0..1 — pop stagger, roughly inner→outer
  fill: string;
  opacity: number;
}

export interface TreeGeometry {
  branches: BranchShape[];
  leaves: LeafShape[];
  canopy: { cx: number; cy: number; rx: number; ry: number };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Catmull-Rom point interpolation for the spine (w interpolates linearly between controls).
function sampleSpine(spine: SpinePt[], samples: number): SpinePt[] {
  const out: SpinePt[] = [];
  const segs = spine.length - 1;
  for (let k = 0; k <= samples; k++) {
    const tt = (k / samples) * segs;
    const i = Math.min(segs - 1, Math.floor(tt));
    const t = tt - i;
    const p0 = spine[i - 1] || spine[i];
    const p1 = spine[i];
    const p2 = spine[i + 1];
    const p3 = spine[i + 2] || p2;
    const t2 = t * t;
    const t3 = t2 * t;
    const cr = (a: number, b: number, c: number, d: number) =>
      0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (3 * b - a - 3 * c + d) * t3);
    out.push({
      x: cr(p0.x, p1.x, p2.x, p3.x),
      y: cr(p0.y, p1.y, p2.y, p3.y),
      w: p1.w + (p2.w - p1.w) * t,
    });
  }
  return out;
}

// Build a filled tapered outline around a spine: offset each sample by ±w/2 along the normal,
// walk up one side, round the tip, and walk back down the other. Flat base (hidden inside the
// parent branch or the ground).
export function buildTaperedPath(spine: SpinePt[], samples = 20): string {
  const pts = sampleSpine(spine, samples);
  const n = pts.length;
  const left: number[][] = [];
  const right: number[][] = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(n - 1, i + 1)];
    let tx = next.x - prev.x;
    let ty = next.y - prev.y;
    const len = Math.hypot(tx, ty) || 1;
    tx /= len;
    ty /= len;
    const nx = -ty;
    const ny = tx;
    const hw = pts[i].w / 2;
    left.push([pts[i].x + nx * hw, pts[i].y + ny * hw]);
    right.push([pts[i].x - nx * hw, pts[i].y - ny * hw]);
  }
  // Rounded tip: quadratic through a point extended past the last centre point.
  const last = pts[n - 1];
  const prev = pts[n - 2];
  let tx = last.x - prev.x;
  let ty = last.y - prev.y;
  const tl = Math.hypot(tx, ty) || 1;
  tx /= tl;
  ty /= tl;
  const tipX = last.x + tx * last.w * 0.7;
  const tipY = last.y + ty * last.w * 0.7;

  let d = `M ${r1(left[0][0])} ${r1(left[0][1])}`;
  for (let i = 1; i < n; i++) d += ` L ${r1(left[i][0])} ${r1(left[i][1])}`;
  d += ` Q ${r1(tipX)} ${r1(tipY)} ${r1(right[n - 1][0])} ${r1(right[n - 1][1])}`;
  for (let i = n - 2; i >= 0; i--) d += ` L ${r1(right[i][0])} ${r1(right[i][1])}`;
  return `${d} Z`;
}

// A teardrop leaf centred at (cx, cy), pointing along `ang`.
export function leafPath(cx: number, cy: number, ang: number, len: number): string {
  const dx = Math.cos(ang);
  const dy = Math.sin(ang);
  const px = -dy;
  const py = dx;
  const w = len * 0.46;
  const bx = cx - dx * len * 0.5;
  const by = cy - dy * len * 0.5;
  const tx = cx + dx * len * 0.5;
  const ty = cy + dy * len * 0.5;
  return `M ${r1(bx)} ${r1(by)} Q ${r1(cx + px * w)} ${r1(cy + py * w)} ${r1(tx)} ${r1(ty)} Q ${r1(cx - px * w)} ${r1(cy - py * w)} ${r1(bx)} ${r1(by)} Z`;
}

const GY = HORIZON_Y + 6; // trunk plants slightly into the ground band
const CX = TREE_X;

// Hand-tuned skeleton: stout trunk forking into 5 upper limbs + 2 low limbs, after the
// reference's structure. Widths taper base → tip.
const TRUNK_SPINE: SpinePt[] = [
  { x: CX, y: GY, w: 46 },
  { x: CX, y: GY - 12, w: 30 },
  { x: CX - 1.5, y: 448, w: 24 },
  { x: CX - 2, y: 428, w: 21 },
  { x: CX, y: 408, w: 19 },
  { x: CX + 1, y: 392, w: 17.5 },
  { x: CX, y: 376, w: 16 },
];

const LIMB_SPINES: SpinePt[][] = [
  // outer-left
  [
    { x: 400, y: 396, w: 13 },
    { x: 368, y: 372, w: 10 },
    { x: 336, y: 344, w: 7 },
    { x: 308, y: 318, w: 4.5 },
    { x: 292, y: 300, w: 2.8 },
  ],
  // mid-left
  [
    { x: 399, y: 388, w: 12 },
    { x: 382, y: 352, w: 9 },
    { x: 366, y: 318, w: 6 },
    { x: 352, y: 288, w: 3.4 },
    { x: 344, y: 272, w: 2.4 },
  ],
  // centre leader
  [
    { x: 400, y: 386, w: 14 },
    { x: 402, y: 348, w: 10.5 },
    { x: 398, y: 312, w: 7 },
    { x: 400, y: 276, w: 4 },
    { x: 399, y: 248, w: 2.6 },
  ],
  // mid-right
  [
    { x: 401, y: 388, w: 12 },
    { x: 418, y: 350, w: 9 },
    { x: 434, y: 314, w: 6 },
    { x: 446, y: 284, w: 3.4 },
    { x: 452, y: 268, w: 2.4 },
  ],
  // outer-right
  [
    { x: 400, y: 396, w: 13 },
    { x: 432, y: 370, w: 10 },
    { x: 462, y: 342, w: 7 },
    { x: 488, y: 318, w: 4.5 },
    { x: 504, y: 302, w: 2.8 },
  ],
  // low-left
  [
    { x: 398, y: 404, w: 10 },
    { x: 372, y: 392, w: 7.5 },
    { x: 344, y: 378, w: 5 },
    { x: 322, y: 366, w: 2.6 },
  ],
  // low-right
  [
    { x: 402, y: 404, w: 10 },
    { x: 430, y: 390, w: 7.5 },
    { x: 456, y: 376, w: 5 },
    { x: 476, y: 364, w: 2.6 },
  ],
];

const CANOPY = { cx: 400, cy: 288, rx: 165, ry: 122 };

export function buildTreeGeometry(seed = 11): TreeGeometry {
  const rnd = mulberry32(seed);
  const branches: BranchShape[] = [];
  const leaves: LeafShape[] = [];

  branches.push({ d: buildTaperedPath(TRUNK_SPINE, 24), ax: CX, ay: GY, rank: 0, kind: 'trunk' });

  LIMB_SPINES.forEach((spine, i) => {
    branches.push({ d: buildTaperedPath(spine), ax: spine[0].x, ay: spine[0].y, rank: i, kind: 'limb' });
  });

  // Two short twigs off each upper limb's tip, angled off the limb's own direction.
  let twigRank = 0;
  for (let i = 0; i < 5; i++) {
    const spine = LIMB_SPINES[i];
    const tip = spine[spine.length - 1];
    const prev = spine[spine.length - 2];
    const ang = Math.atan2(tip.y - prev.y, tip.x - prev.x);
    for (const off of [-0.55, 0.55]) {
      const a = ang + off + (rnd() - 0.5) * 0.2;
      const len = 20 + rnd() * 10;
      const twig: SpinePt[] = [
        { x: tip.x, y: tip.y, w: 3 },
        { x: tip.x + Math.cos(a) * len * 0.55, y: tip.y + Math.sin(a) * len * 0.55, w: 1.9 },
        { x: tip.x + Math.cos(a) * len, y: tip.y + Math.sin(a) * len, w: 1 },
      ];
      branches.push({ d: buildTaperedPath(twig, 8), ax: tip.x, ay: tip.y, rank: twigRank++, kind: 'twig' });
    }
  }

  // Canopy leaves: an outward-pointing rim ring (definition, like the reference's edge leaves)
  // plus filler biased toward the rim. Highlights (cream) favour the lit upper-right.
  const addLeaf = (px: number, py: number, ang: number, len: number) => {
    const towardLight = Math.cos(ang) > 0.2 && Math.sin(ang) < 0;
    const roll = rnd();
    let fill = SAGE;
    let opacity = 0.95;
    if (roll < 0.2) {
      fill = SAGE;
      opacity = 0.55; // depth layer
    } else if (roll < 0.36 || (towardLight && roll < 0.5)) {
      fill = CREAM;
      opacity = 0.85; // highlights
    }
    const dx = px - CANOPY.cx;
    const dy = py - CANOPY.cy;
    const dist = Math.hypot(dx / CANOPY.rx, dy / CANOPY.ry); // 0 centre → ~1 rim
    const order = Math.min(1, Math.max(0, dist * 0.75 + rnd() * 0.25));
    leaves.push({ d: leafPath(px, py, ang, len), cx: px, cy: py, order, fill, opacity });
  };

  // Thick-bush density: a denser rim plus a much denser interior fill than a sparse tree would
  // need, so branches are almost entirely hidden by foliage.
  const RIM = 58;
  for (let k = 0; k < RIM; k++) {
    const th = (k / RIM) * Math.PI * 2 + (rnd() - 0.5) * 0.1;
    const rr = 0.97 + rnd() * 0.08;
    const px = CANOPY.cx + Math.cos(th) * CANOPY.rx * rr;
    const py = CANOPY.cy + Math.sin(th) * CANOPY.ry * rr;
    addLeaf(px, py, th + (rnd() - 0.5) * 0.4, 13 + rnd() * 4);
  }

  const FILLER = 260;
  for (let k = 0; k < FILLER; k++) {
    const th = rnd() * Math.PI * 2;
    const rr = 0.12 + 0.88 * Math.sqrt(rnd()); // near-uniform disk coverage — full canopy, no hollow ring
    const px = CANOPY.cx + Math.cos(th) * CANOPY.rx * rr * (0.94 + rnd() * 0.12);
    const py = CANOPY.cy + Math.sin(th) * CANOPY.ry * rr * (0.94 + rnd() * 0.12);
    addLeaf(px, py, th + (rnd() - 0.5) * 0.9, 9 + rnd() * 5);
  }

  // Small clusters at the two low-limb tips so the canopy hugs the lower branches too
  // (they sit just outside the canopy ellipse).
  for (const li of [5, 6]) {
    const spine = LIMB_SPINES[li];
    const tip = spine[spine.length - 1];
    const outward = Math.atan2(tip.y - CANOPY.cy, tip.x - CANOPY.cx);
    for (let k = 0; k < 9; k++) {
      const px = tip.x + (rnd() - 0.5) * 28;
      const py = tip.y + (rnd() - 0.5) * 20;
      addLeaf(px, py, outward + (rnd() - 0.5) * 1.1, 10 + rnd() * 4);
    }
  }

  return { branches, leaves, canopy: CANOPY };
}

// The familiar seedling (the pane's original sprout) — the animation's starting state.
export const SAPLING = {
  stemD: 'M 400 470 C 397.9 449, 401.05 430.1, 400 409.1',
  leafLeftD:
    'M 400 423.8 C 384.25 417.5, 374.8 426.95, 376.9 440.6 C 386.35 439.55, 395.8 433.25, 400 423.8 Z',
  leafRightD:
    'M 400 434.3 C 416.8 428, 427.3 438.5, 425.2 453.2 C 414.7 452.15, 404.2 444.8, 400 434.3 Z',
};
