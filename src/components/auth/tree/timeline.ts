// Timeline constants shared by TreeGrowth (which imports 'remotion') and TreeOverlay (which must
// NOT import 'remotion' at module scope, to keep the Player out of the main bundle). Living here
// lets both read the same numbers without either pulling in the other's dependencies.

export const TREE_FPS = 30;
export const TREE_DURATION = 480; // 16s: seed → sprout → sapling → tree → bloom → people arrive & sit
