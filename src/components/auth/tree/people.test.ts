import { describe, it, expect } from 'vitest';
import { buildWalkPose, buildSitPose } from './people';

function assertFinitePose(pose: { head: { cx: number; cy: number; r: number }; limbs: Array<Record<string, number>> }) {
  expect(Number.isFinite(pose.head.cx)).toBe(true);
  expect(Number.isFinite(pose.head.cy)).toBe(true);
  expect(pose.head.r).toBeGreaterThan(0);
  for (const limb of pose.limbs) {
    for (const key of ['x1', 'y1', 'x2', 'y2', 'w']) {
      expect(Number.isFinite(limb[key])).toBe(true);
    }
    expect(limb.w).toBeGreaterThan(0);
  }
}

describe('buildWalkPose', () => {
  it('produces a torso plus two legs and two arms', () => {
    const pose = buildWalkPose(0);
    expect(pose.limbs).toHaveLength(5);
    assertFinitePose(pose);
  });

  it('is deterministic for the same phase', () => {
    expect(buildWalkPose(1.23)).toEqual(buildWalkPose(1.23));
  });

  it('swings the two legs in opposite directions (out of phase by pi)', () => {
    const pose = buildWalkPose(Math.PI / 2);
    const [, legA, legB] = pose.limbs;
    // At a quarter-stride, one leg swings forward and the other back — their x offsets from the
    // shared hip should have opposite sign (or one be ~0 while the other is not).
    expect(Math.sign(legA.x2)).not.toBe(Math.sign(legB.x2));
  });

  it('returns to the same silhouette every full gait cycle', () => {
    const a = buildWalkPose(0.7);
    const b = buildWalkPose(0.7 + Math.PI * 2);
    expect(a.head.cy).toBeCloseTo(b.head.cy, 5);
    expect(a.limbs[1].x2).toBeCloseTo(b.limbs[1].x2, 5);
  });

  it('keeps the whole figure above the ground line (non-positive y)', () => {
    for (const phase of [0, 0.5, 1, 2, 3, 4, 5, 6]) {
      const pose = buildWalkPose(phase);
      expect(pose.head.cy).toBeLessThanOrEqual(0);
      for (const limb of pose.limbs) {
        expect(limb.y1).toBeLessThanOrEqual(0.01);
        expect(limb.y2).toBeLessThanOrEqual(0.01);
      }
    }
  });
});

describe('buildSitPose', () => {
  it('is a fixed, valid silhouette', () => {
    const pose = buildSitPose();
    expect(pose.limbs).toHaveLength(4);
    assertFinitePose(pose);
  });

  it('is deterministic', () => {
    expect(buildSitPose()).toEqual(buildSitPose());
  });
});
