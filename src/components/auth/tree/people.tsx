// Local-space geometry for the two silhouette figures that walk in and settle beneath the tree.
// All poses are authored "feet at origin, facing +x (right)" — the renderer positions each
// figure with translate(worldX, worldY) and mirrors with scaleX(-1) for a figure facing left.
// Shapes are solid capsules (thick round-capped strokes) plus a head circle, matching the tree
// trunk's solid-cream-fill treatment rather than outlined line art.
//
// This module has no Remotion dependency (unlike PeopleLayer.tsx, which animates these poses on
// the growth timeline) so it can also be imported eagerly by StaticTree.tsx / TreeOverlay.tsx
// without pulling Remotion into the main bundle.

import { HORIZON_Y, CREAM } from '../art-constants';

export const PEOPLE_GROUND_Y = HORIZON_Y + 6; // matches the tree trunk's ground contact point

export interface PersonSpec {
  startFrame: number;
  walkDuration: number; // frames spent walking before arrival
  entryX: number; // off-canvas start (canvas is 0–800; anything <0 is clipped by the SVG viewport)
  restX: number;
  strideRate: number; // radians of gait phase per frame
  sitFacing: 'left' | 'right'; // which way the seated figure faces (mirrored if 'left')
  scale: number;
}

// Two figures walk in from the left, cross the field, and settle sitting beneath the tree. Each
// is specified independently (own start time, walking speed, gait rate, rest position, and a
// touch of scale variation) so they read as two people, not one clone offset in time.
export const PEOPLE: PersonSpec[] = [
  // Arrives first, stops just left of the trunk, sits facing right — toward the tree.
  { startFrame: 300, walkDuration: 90, entryX: -30, restX: 340, strideRate: 0.349, sitFacing: 'right', scale: 1.0 },
  // Trails behind, walks past the trunk to the far side, sits facing left — back toward the tree
  // (and the first figure).
  { startFrame: 330, walkDuration: 114, entryX: -30, restX: 460, strideRate: 0.33, sitFacing: 'left', scale: 0.93 },
];

export interface Limb {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  w: number;
}

export interface PersonPose {
  head: { cx: number; cy: number; r: number };
  limbs: Limb[];
}

const HIP_Y = -14;
const SHOULDER_Y = -30;
const HEAD_R = 6.5;
// Leg length must not exceed |HIP_Y| — since bob <= 0 and cos(angle) <= 1, that guarantees
// foot.y = HIP_Y + bob + LEG_LEN * cos(angle) <= 0 for every phase, so a foot can never render
// below the ground line.
const LEG_LEN = 14;
const ARM_LEN = 11;

/**
 * A walking pose at a given gait phase (radians). Legs swing opposite each other (phase, phase +
 * π); arms counter-swing against the same-side leg for a natural gait. A double-bounce bob
 * (2× the stride frequency) adds a touch of life to the whole figure.
 */
export function buildWalkPose(phase: number): PersonPose {
  const maxLegSwing = 0.5;
  const maxArmSwing = 0.4;
  const bob = -Math.abs(1.6 * Math.sin(phase * 2));

  const legAAngle = maxLegSwing * Math.sin(phase);
  const legBAngle = maxLegSwing * Math.sin(phase + Math.PI);
  const armAAngle = maxArmSwing * Math.sin(phase + Math.PI);
  const armBAngle = maxArmSwing * Math.sin(phase);

  const foot = (angle: number) => ({
    x: LEG_LEN * Math.sin(angle),
    y: HIP_Y + bob + LEG_LEN * Math.cos(angle),
  });
  const hand = (angle: number) => ({
    x: ARM_LEN * Math.sin(angle),
    y: SHOULDER_Y + bob + ARM_LEN * Math.cos(angle),
  });

  const footA = foot(legAAngle);
  const footB = foot(legBAngle);
  const handA = hand(armAAngle);
  const handB = hand(armBAngle);

  return {
    head: { cx: 0, cy: -40 + bob, r: HEAD_R },
    limbs: [
      { x1: 0, y1: HIP_Y + bob, x2: 0, y2: SHOULDER_Y + bob, w: 8 }, // torso
      { x1: 0, y1: HIP_Y + bob, x2: footA.x, y2: footA.y, w: 6 }, // leg A
      { x1: 0, y1: HIP_Y + bob, x2: footB.x, y2: footB.y, w: 6 }, // leg B
      { x1: 0, y1: SHOULDER_Y + bob, x2: handA.x, y2: handA.y, w: 4.5 }, // arm A
      { x1: 0, y1: SHOULDER_Y + bob, x2: handB.x, y2: handB.y, w: 4.5 }, // arm B
    ],
  };
}

/** The settled, seated pose — knees drawn up, leaning slightly forward, one arm resting on the knee. */
export function buildSitPose(): PersonPose {
  return {
    head: { cx: 2, cy: -34, r: HEAD_R },
    limbs: [
      { x1: 0, y1: HIP_Y, x2: 2, y2: SHOULDER_Y, w: 8 }, // torso, slight forward lean
      { x1: 0, y1: HIP_Y, x2: 13, y2: -15, w: 6.5 }, // thigh, knee drawn up
      { x1: 13, y1: -15, x2: 10, y2: 0, w: 5.5 }, // shin back down to the ground
      { x1: 2, y1: SHOULDER_Y, x2: 12, y2: -16, w: 4.5 }, // arm resting on the knee
    ],
  };
}

/** Renders a pose as solid-cream limb capsules + a head circle. Shared by the animated layer and the static fallback. */
export function renderPersonPose(pose: PersonPose, keyPrefix: string) {
  return (
    <>
      {pose.limbs.map((l, i) => (
        <line
          key={`${keyPrefix}l${i}`}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke={CREAM}
          strokeWidth={l.w}
          strokeLinecap="round"
        />
      ))}
      <circle cx={pose.head.cx} cy={pose.head.cy} r={pose.head.r} fill={CREAM} />
    </>
  );
}
