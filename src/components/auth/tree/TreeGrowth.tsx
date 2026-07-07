import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ART_W, ART_H, HORIZON_Y, TREE_X, SAGE, CREAM } from '../art-constants';
import { buildTreeGeometry, SAPLING, type BranchShape } from './treeGeometry';
import { PeopleLayer } from './PeopleLayer';
import { TREE_FPS, TREE_DURATION } from './timeline';

// The full growth story (transparent background; overlays the landscape SVG on the same
// 800×1200 canvas). Plays once and holds the settled scene on the final frame.
//
// Timeline (30fps, 16s total):
//   seed (pops in, sits still) → sprout → sapling (one continuous scale-up of the same stem+leaf
//   geometry) → trunk rises through it → limbs → twigs (bare branch structure, "medium"→"large"
//   tree) → dense leaf bloom ("thick bush") → two people walk in from the left and settle sitting
//   beneath the tree → hold.
// Frame 0 shows the seed, and the final frame the fully settled scene, so a paused player is
// never blank (robust to backgrounded tabs).

export { TREE_FPS, TREE_DURATION };

// Every frame number below must strictly increase within each interpolate() call's input range
// (growScale and growOpacity each concatenate several of these) — Remotion's interpolate() throws
// if the combined array isn't strictly increasing. saplingHoldEnd must come after growScaleFrames'
// last value (100), and saplingFadeEnd/swellEnd must come after saplingHoldEnd.
export const T = {
  // Seed: a small shape at the ground, swells slightly, then fades as the sprout emerges.
  seedFadeStart: 14,
  seedFadeEnd: 26,
  // Sprout → sapling: the existing stem+2-leaf geometry, growing continuously from a speck to
  // full sapling size (one interpolate curve, not discrete jumps — reads as gradual growth).
  growScaleFrames: [12, 55, 100] as const,
  growScaleValues: [0.05, 0.42, 1.0] as const,
  growOpacityInFrames: [10, 20] as const,
  // Sapling → tree: the trunk rises and visually absorbs the sapling (matches the original
  // hand-off mechanic, just shifted later in the extended timeline).
  saplingHoldEnd: 104,
  saplingFadeEnd: 136,
  swellEnd: 140,
  trunkStart: 106,
  limbBase: 158,
  limbStep: 10,
  twigBase: 214,
  twigStep: 6,
  leafBase: 245,
  leafSpread: 140,
};

const GEO = buildTreeGeometry();

function branchStart(b: BranchShape): number {
  if (b.kind === 'trunk') return T.trunkStart;
  if (b.kind === 'limb') return T.limbBase + b.rank * T.limbStep;
  return T.twigBase + b.rank * T.twigStep;
}

const BRANCH_SPRING = {
  trunk: { damping: 14, stiffness: 60, mass: 1.4 },
  limb: { damping: 11, stiffness: 110, mass: 0.9 },
  twig: { damping: 10, stiffness: 130, mass: 0.7 },
} as const;

const LEAF_SPRING = { damping: 9, stiffness: 150, mass: 0.6 } as const;

const growFrom = (ax: number, ay: number, s: number) =>
  `translate(${ax} ${ay}) scale(${s}) translate(${-ax} ${-ay})`;

export function TreeGrowth() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

  // Seed — pops in, swells slightly, fades out as the sprout takes over.
  const seedOpacity = interpolate(frame, [0, 6, T.seedFadeStart, T.seedFadeEnd], [0, 1, 1, 0], clampOpts);
  const seedScale = interpolate(frame, [0, 6, T.seedFadeEnd], [0.55, 1, 1.15], clampOpts);

  // Sprout → sapling → (swell into) tree-absorption — one continuous scale/opacity curve driving
  // the same stem+leaf geometry throughout.
  const growScale = interpolate(
    frame,
    [...T.growScaleFrames, T.saplingHoldEnd, T.swellEnd],
    [...T.growScaleValues, 1.0, 1.6],
    clampOpts,
  );
  const growOpacity = interpolate(
    frame,
    [...T.growOpacityInFrames, T.saplingHoldEnd, T.saplingFadeEnd],
    [0, 1, 1, 0],
    clampOpts,
  );
  const growRot = growOpacity > 0.001 ? 2.5 * Math.sin(frame / 9) : 0;

  // Rounding to an integer frame lets Remotion's internal spring cache share entries across every
  // branch/leaf at a given (rounded) offset — leaf starts are continuous floats (order * spread),
  // so without rounding every leaf gets a unique cache key every frame and re-runs its physics
  // loop from scratch (measured ~20x slower with hundreds of leaves). Off by at most half a frame
  // (~17ms), imperceptible.
  const springAt = (start: number, config: { damping: number; stiffness: number; mass: number }) =>
    frame <= start ? 0 : spring({ frame: Math.round(frame - start), fps, config });

  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${ART_W} ${ART_H}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        {/* Seed — the very first frame; a small shape resting at the ground line */}
        {seedOpacity > 0.001 && (
          <ellipse
            cx={TREE_X}
            cy={HORIZON_Y + 3}
            rx={5 * seedScale}
            ry={3.5 * seedScale}
            fill={CREAM}
            opacity={seedOpacity * 0.92}
          />
        )}

        {/* Sprout / sapling — the starting stem+leaves; absorbed by the rising trunk */}
        {growOpacity > 0.001 && (
          <g
            opacity={growOpacity}
            transform={`rotate(${growRot} ${TREE_X} ${HORIZON_Y}) ${growFrom(TREE_X, HORIZON_Y, growScale)}`}
          >
            <path d={SAPLING.stemD} fill="none" stroke={CREAM} strokeWidth={2} strokeLinecap="round" opacity={0.85} />
            <path d={SAPLING.leafLeftD} fill={SAGE} opacity={0.75} />
            <path d={SAPLING.leafLeftD} fill="none" stroke={CREAM} strokeWidth={1} opacity={0.6} />
            <path d={SAPLING.leafRightD} fill={SAGE} opacity={0.75} />
            <path d={SAPLING.leafRightD} fill="none" stroke={CREAM} strokeWidth={1} opacity={0.6} />
          </g>
        )}

        {/* Ground shadow — grows with the trunk to anchor the tree on the horizon */}
        <ellipse
          cx={TREE_X}
          cy={HORIZON_Y + 6}
          rx={64}
          ry={7}
          fill={SAGE}
          opacity={0.12 * springAt(T.trunkStart, BRANCH_SPRING.trunk)}
        />

        {/* Trunk, limbs, twigs — solid cream, each springing out from its attachment point */}
        {GEO.branches.map((b, i) => {
          const s = springAt(branchStart(b), BRANCH_SPRING[b.kind]);
          if (s <= 0.001) return null;
          return (
            <path
              key={`br${i}`}
              d={b.d}
              fill={CREAM}
              opacity={0.97}
              transform={s < 0.999 ? growFrom(b.ax, b.ay, s) : undefined}
            />
          );
        })}

        {/* Canopy leaves — radial bloom, inner→outer, with a soft rotational settle */}
        {GEO.leaves.map((l, i) => {
          const s = springAt(T.leafBase + l.order * T.leafSpread, LEAF_SPRING);
          if (s <= 0.001) return null;
          const rot = -22 * (1 - Math.min(1, s));
          return (
            <path
              key={`lf${i}`}
              d={l.d}
              fill={l.fill}
              opacity={l.opacity * Math.min(1, s * 1.4)}
              transform={
                s < 0.999 ? `rotate(${rot} ${l.cx} ${l.cy}) ${growFrom(l.cx, l.cy, s)}` : undefined
              }
            />
          );
        })}

        {/* People — two figures walk in from the left and settle sitting beneath the tree */}
        <PeopleLayer frame={frame} />
      </svg>
    </AbsoluteFill>
  );
}
