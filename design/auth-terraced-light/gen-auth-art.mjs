// Terraced Light — generator for the Agribnv auth graphic.
// Emits: public/auth-bg.svg (web background, no display text) and
//        scratchpad/agribnv-auth-art.svg (full art object, logo + caption embedded).
import { readFileSync, writeFileSync } from 'node:fs';

const PROJECT = '/Users/Kyle/Desktop/Claude/Agribnv';
const SCRATCH = '/private/tmp/claude-501/-Users-Kyle-Desktop-Claude-Agribnv/0a22b4a2-dc00-41bf-a881-dce7549421dd/scratchpad';

const W = 800, H = 1200, HY = 470; // canvas + horizon

// Brand palette
const FOREST = '#156530';
const FOREST_DEEP = '#0e3f20';
const SAGE = '#B0D182';
const CREAM = '#FEF9F0';

const f = (n) => Math.round(n * 100) / 100;

// Catmull-Rom → cubic bezier for hand-smooth contour lines.
function smooth(pts) {
  let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${f(c1x)} ${f(c1y)}, ${f(c2x)} ${f(c2y)}, ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

// Terraced contour field: dense near the horizon, opening toward the foreground.
function terraces() {
  const N = 48, out = [];
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    const y = HY + (H - HY) * Math.pow(t, 1.72);
    const amp = 3 + 30 * t;
    const phase = i * 0.62;
    const pts = [];
    const S = 52;
    for (let s = 0; s <= S; s++) {
      const u = s / S;
      const x = u * (W + 40) - 20; // slight bleed past edges
      const wave =
        Math.sin(u * Math.PI * 2 + phase) * amp * 0.6 +
        Math.sin(u * Math.PI * 3.3 + phase * 1.7) * amp * 0.4;
      pts.push([x, y + wave]);
    }
    const isIndex = i % 5 === 0; // brighter "index contours" mark the measure
    out.push({
      d: smooth(pts),
      stroke: isIndex ? CREAM : SAGE,
      opacity: isIndex ? 0.42 : 0.1 + 0.16 * t,
      width: isIndex ? 1.35 : 0.85,
    });
  }
  return out;
}

// A single seedling rising into the dawn sky — the brand's sprout, quietly.
function sprout(cx, baseY, scale = 1) {
  const s = scale;
  const stem = `M ${cx} ${baseY} C ${cx - 2 * s} ${baseY - 20 * s}, ${cx + 1 * s} ${baseY - 38 * s}, ${cx} ${baseY - 58 * s}`;
  const leafR = `M ${cx} ${baseY - 34 * s} C ${cx + 16 * s} ${baseY - 40 * s}, ${cx + 26 * s} ${baseY - 30 * s}, ${cx + 24 * s} ${baseY - 16 * s} C ${cx + 14 * s} ${baseY - 17 * s}, ${cx + 4 * s} ${baseY - 24 * s}, ${cx} ${baseY - 34 * s} Z`;
  const leafL = `M ${cx} ${baseY - 44 * s} C ${cx - 15 * s} ${baseY - 50 * s}, ${cx - 24 * s} ${baseY - 41 * s}, ${cx - 22 * s} ${baseY - 28 * s} C ${cx - 13 * s} ${baseY - 29 * s}, ${cx - 4 * s} ${baseY - 35 * s}, ${cx} ${baseY - 44 * s} Z`;
  return `
    <g opacity="0.9">
      <path d="${leafL}" fill="${SAGE}" opacity="0.28"/>
      <path d="${leafR}" fill="${SAGE}" opacity="0.28"/>
      <path d="${leafL}" fill="none" stroke="${CREAM}" stroke-width="1.1" opacity="0.5"/>
      <path d="${leafR}" fill="none" stroke="${CREAM}" stroke-width="1.1" opacity="0.5"/>
      <path d="${stem}" fill="none" stroke="${CREAM}" stroke-width="1.4" opacity="0.62" stroke-linecap="round"/>
    </g>`;
}

function defs() {
  return `
  <defs>
    <radialGradient id="glow" cx="70%" cy="15%" r="65%">
      <stop offset="0%" stop-color="${SAGE}" stop-opacity="0.24"/>
      <stop offset="55%" stop-color="${SAGE}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="${SAGE}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="deepen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${FOREST_DEEP}" stop-opacity="0"/>
      <stop offset="62%" stop-color="${FOREST_DEEP}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${FOREST_DEEP}" stop-opacity="0.72"/>
    </linearGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" result="n"/>
      <feColorMatrix in="n" type="saturate" values="0"/>
    </filter>
  </defs>`;
}

function terraceMarkup() {
  return terraces()
    .map((l) => `<path d="${l.d}" fill="none" stroke="${l.stroke}" stroke-width="${l.width}" opacity="${f(l.opacity)}"/>`)
    .join('\n    ');
}

// Shared visual field (no display text).
function scene() {
  return `
  <rect width="${W}" height="${H}" fill="${FOREST}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <g>
    ${terraceMarkup()}
  </g>
  <line x1="-20" y1="${HY}" x2="${W + 20}" y2="${HY}" stroke="${CREAM}" stroke-width="1.1" opacity="0.5"/>
  ${sprout(W * 0.5, HY, 1.05)}
  <rect width="${W}" height="${H}" fill="url(#deepen)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.09"/>`;
}

// ---- 1) Web background (no display text) ----
const bg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
${defs()}
${scene()}
</svg>`;
writeFileSync(`${PROJECT}/public/auth-bg.svg`, bg);

// ---- 2) Full art object (logo + caption + coordinate marker) ----
const logoB64 = readFileSync(`${PROJECT}/src/assets/agribnv-logo-white.png`).toString('base64');
const rocaB64 = readFileSync(`${PROJECT}/public/fonts/roca-two-bold.woff`).toString('base64');

const art = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
${defs()}
  <style>
    @font-face { font-family: 'RocaTwo'; src: url(data:font/woff;base64,${rocaB64}) format('woff'); font-weight: 700; }
    .cap { font-family: 'RocaTwo', Georgia, serif; font-weight: 700; }
    .lab { font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 600; letter-spacing: 3px; }
  </style>
${scene()}
  <image href="data:image/png;base64,${logoB64}" x="64" y="70" width="184" height="62" preserveAspectRatio="xMinYMid meet"/>
  <text x="64" y="1004" class="cap" font-size="76" fill="${CREAM}">Stay on a farm.</text>
  <text x="64" y="1082" class="cap" font-size="76" fill="${SAGE}">Or share yours.</text>
  <line x1="64" y1="1120" x2="120" y2="1120" stroke="${SAGE}" stroke-width="1.4" opacity="0.6"/>
  <text x="136" y="1124" class="lab" font-size="14" fill="${CREAM}" opacity="0.55">GUIMARAS · 10.60°N 122.60°E</text>
</svg>`;
writeFileSync(`${SCRATCH}/agribnv-auth-art.svg`, art);

console.log('wrote public/auth-bg.svg and scratchpad/agribnv-auth-art.svg');
