import { describe, it, expect } from 'vitest';
import { T } from './TreeGrowth';

// Remotion's interpolate() throws at render time if its combined input-frame array isn't
// strictly increasing. TreeGrowth.tsx builds two such arrays out of T's fields with spreads —
// this test locks that invariant in directly against the same combinations used in the
// component, so a future edit to T that breaks ordering fails here instead of crashing the
// Remotion player (which silently swallows the error behind its own fallback UI).

function assertStrictlyIncreasing(frames: readonly number[], label: string) {
  for (let i = 1; i < frames.length; i++) {
    expect(frames[i], `${label}: frame ${i} (${frames[i]}) must be > frame ${i - 1} (${frames[i - 1]})`).toBeGreaterThan(
      frames[i - 1],
    );
  }
}

describe('TreeGrowth timeline (T)', () => {
  it('keeps the growScale interpolate() input range strictly increasing', () => {
    assertStrictlyIncreasing([...T.growScaleFrames, T.saplingHoldEnd, T.swellEnd], 'growScale');
  });

  it('keeps the growOpacity interpolate() input range strictly increasing', () => {
    assertStrictlyIncreasing([...T.growOpacityInFrames, T.saplingHoldEnd, T.saplingFadeEnd], 'growOpacity');
  });

  it('keeps the seed interpolate() input ranges strictly increasing', () => {
    assertStrictlyIncreasing([0, 6, T.seedFadeStart, T.seedFadeEnd], 'seedOpacity');
    assertStrictlyIncreasing([0, 6, T.seedFadeEnd], 'seedScale');
  });

  it('starts the trunk no earlier than the sapling fully forms', () => {
    const saplingFullyGrown = T.growScaleFrames[T.growScaleFrames.length - 1];
    expect(T.trunkStart).toBeGreaterThanOrEqual(saplingFullyGrown);
  });
});
