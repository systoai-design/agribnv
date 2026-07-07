import { describe, it, expect } from 'vitest';
import { buildTreeGeometry, buildTaperedPath, leafPath } from './treeGeometry';
import { ART_W, HORIZON_Y, TREE_X } from '../art-constants';

describe('buildTreeGeometry', () => {
  it('is deterministic for the same seed', () => {
    const a = buildTreeGeometry(11);
    const b = buildTreeGeometry(11);
    expect(a).toEqual(b);
  });

  it('produces different canopies for different seeds', () => {
    const a = buildTreeGeometry(11);
    const b = buildTreeGeometry(12);
    expect(a.leaves.map((l) => l.d)).not.toEqual(b.leaves.map((l) => l.d));
  });

  it('contains exactly one trunk rooted at the tree base', () => {
    const { branches } = buildTreeGeometry();
    const trunks = branches.filter((br) => br.kind === 'trunk');
    expect(trunks).toHaveLength(1);
    expect(trunks[0].ax).toBe(TREE_X);
    expect(trunks[0].ay).toBeGreaterThanOrEqual(HORIZON_Y);
  });

  it('builds limbs, twigs, and a thick-bush-density canopy', () => {
    const { branches, leaves } = buildTreeGeometry();
    expect(branches.filter((br) => br.kind === 'limb')).toHaveLength(7);
    expect(branches.filter((br) => br.kind === 'twig')).toHaveLength(10);
    expect(leaves.length).toBeGreaterThan(300);
  });

  it('keeps every leaf inside the canvas and above the ground band', () => {
    const { leaves } = buildTreeGeometry();
    for (const l of leaves) {
      expect(l.cx).toBeGreaterThan(0);
      expect(l.cx).toBeLessThan(ART_W);
      // Leaves belong to the canopy — none should reach the terrace band below the horizon.
      expect(l.cy).toBeLessThan(HORIZON_Y);
      expect(l.order).toBeGreaterThanOrEqual(0);
      expect(l.order).toBeLessThanOrEqual(1);
    }
  });

  it('emits valid closed path data for every shape', () => {
    const { branches, leaves } = buildTreeGeometry();
    for (const shape of [...branches, ...leaves]) {
      expect(shape.d).toMatch(/^M [\d.-]+ [\d.-]+ /);
      expect(shape.d.endsWith('Z')).toBe(true);
      expect(shape.d).not.toMatch(/NaN|Infinity/);
    }
  });
});

describe('buildTaperedPath', () => {
  it('tapers: outline near the base is wider apart than near the tip', () => {
    const d = buildTaperedPath(
      [
        { x: 0, y: 0, w: 20 },
        { x: 0, y: -50, w: 10 },
        { x: 0, y: -100, w: 2 },
      ],
      10,
    );
    // Vertical spine → outline x-offsets equal ±w/2: base ±10, tip ±1.
    const xs = [...d.matchAll(/([\d.-]+) [\d.-]+/g)].map((m) => Number(m[1]));
    const maxX = Math.max(...xs);
    expect(maxX).toBeCloseTo(10, 0);
    expect(d).not.toMatch(/NaN/);
  });
});

describe('leafPath', () => {
  it('draws a closed teardrop centred on the given point', () => {
    const d = leafPath(100, 200, 0, 12);
    expect(d.startsWith('M ')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    const nums = [...d.matchAll(/([\d.-]+) ([\d.-]+)/g)];
    for (const [, x, y] of nums) {
      expect(Math.abs(Number(x) - 100)).toBeLessThanOrEqual(8);
      expect(Math.abs(Number(y) - 200)).toBeLessThanOrEqual(8);
    }
  });
});
