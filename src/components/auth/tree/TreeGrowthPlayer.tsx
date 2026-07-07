import { useEffect, useRef } from 'react';
import { Player, Thumbnail, type PlayerRef } from '@remotion/player';
import { ART_W, ART_H } from '../art-constants';
import { TreeGrowth, TREE_DURATION, TREE_FPS } from './TreeGrowth';

// Lazy-loaded so Remotion stays out of the main bundle. `play` runs the growth once and holds
// the last frame; `still` renders a single paused frame (`?treeframe=N` uses it for visual QA
// of any point in the timeline).

interface TreeGrowthPlayerProps {
  width: number;
  height: number;
  mode: 'play' | 'still';
  frame?: number;
}

export default function TreeGrowthPlayer({ width, height, mode, frame }: TreeGrowthPlayerProps) {
  const playerRef = useRef<PlayerRef>(null);

  // Pin the held frame when playback ends. `moveToBeginningWhenEnded={false}` stops the player
  // from snapping back to frame 0 (the sapling); the explicit seek guards throttled tabs where
  // the final tick can overshoot without rendering the last frame.
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onEnded = () => player.seekTo(TREE_DURATION - 1);
    player.addEventListener('ended', onEnded);
    return () => player.removeEventListener('ended', onEnded);
  }, []);

  const common = {
    component: TreeGrowth,
    durationInFrames: TREE_DURATION,
    compositionWidth: ART_W,
    compositionHeight: ART_H,
    fps: TREE_FPS,
    style: { width, height },
  } as const;

  if (mode === 'still') {
    return <Thumbnail {...common} frameToDisplay={frame ?? TREE_DURATION - 1} />;
  }

  return (
    <Player
      {...common}
      ref={playerRef}
      autoPlay
      loop={false}
      moveToBeginningWhenEnded={false}
      controls={false}
      clickToPlay={false}
      doubleClickToFullscreen={false}
      spaceKeyToPlayOrPause={false}
      acknowledgeRemotionLicense
    />
  );
}
