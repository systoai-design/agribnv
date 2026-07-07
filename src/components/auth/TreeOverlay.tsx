import { Component, lazy, Suspense, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import './auth-graphic.css';
import { ART_W, ART_H, SAGE } from './art-constants';
import { leafPath } from './tree/treeGeometry';
import { StaticTree } from './tree/StaticTree';
import { TREE_DURATION } from './tree/timeline';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Overlays the Remotion tree on the landscape SVG. The landscape uses
// preserveAspectRatio="xMidYMid slice" (cover, centered); this component reproduces that exact
// mapping for the Player by measuring the pane and sizing a centered cover box with the same
// 800×1200 aspect — so the tree stays rooted on the SVG horizon at any pane size.

const TreeGrowthPlayer = lazy(() => import('./tree/TreeGrowthPlayer'));

interface CoverBox {
  width: number;
  height: number;
  left: number;
  top: number;
}

function useCoverBox(): { ref: React.RefObject<HTMLDivElement>; box: CoverBox | null } {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<CoverBox | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (cw === 0 || ch === 0) return;
      const s = Math.max(cw / ART_W, ch / ART_H);
      const w = ART_W * s;
      const h = ART_H * s;
      setBox({ width: w, height: h, left: (cw - w) / 2, top: (ch - h) / 2 });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, box };
}

// If the Remotion chunk fails to load or crashes, fall back to the static full tree — a better
// degrade than a seedling that silently never grows.
class TreeErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(): void {
    // Decorative layer — degrade silently to the fallback.
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// Dev/QA escape hatch: `?treeframe=N` renders the composition paused at frame N.
function getQaFrame(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get('treeframe');
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(0, Math.min(TREE_DURATION - 1, Math.floor(n))) : null;
}

interface FallingLeafSpec {
  left: string;
  top: string;
  size: number;
  delaySeconds: number;
  durationSeconds: number;
}

// A handful of leaves that each detach from the canopy and flutter down on their own cycle
// (CSS-driven so they keep living after the growth animation has finished and the player is
// holding its last frame). Positions sit within the canopy's footprint; delays are staggered so
// they never fall in sync. The fall distance is expressed in auth-graphic.css as a fraction of
// --ag-box-h (set below) so each always fades out before the horizon, at any pane size.
const FALLING_LEAVES: FallingLeafSpec[] = [
  { left: '57%', top: '23.5%', size: 15, delaySeconds: 11, durationSeconds: 17 },
  { left: '43%', top: '21%', size: 12, delaySeconds: 15.5, durationSeconds: 19 },
  { left: '50%', top: '26.5%', size: 13, delaySeconds: 20, durationSeconds: 16 },
];

function FallingLeaf({ left, top, size, delaySeconds, durationSeconds }: FallingLeafSpec) {
  return (
    <svg
      className="ag-fall-leaf"
      viewBox="0 0 20 20"
      style={
        {
          position: 'absolute',
          left,
          top,
          width: size,
          height: size,
          animationDelay: `${delaySeconds}s`,
          animationDuration: `${durationSeconds}s`,
        } as React.CSSProperties
      }
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={leafPath(10, 10, 0.6, 13)} fill={SAGE} opacity={0.9} />
    </svg>
  );
}

// The measured, animated subtree. Only mounted once we know the pane is desktop-width, so the
// cover-box ref/effect always attaches to a live element — crossing the 1024px breakpoint remounts
// this component (via the key in TreeOverlay) instead of leaving a stale, unobserved measurement.
function TreeOverlayInner() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const { ref, box } = useCoverBox();
  const qaFrame = getQaFrame();

  // Reduced motion (and no QA override): render the final tree directly, no animation, no
  // Remotion chunk download at all.
  const showStaticOnly = prefersReducedMotion && qaFrame === null;
  const mode: 'play' | 'still' = qaFrame !== null ? 'still' : 'play';

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
      {box && (
        <div
          className={prefersReducedMotion ? 'absolute' : 'ag-tree-sway absolute'}
          style={
            {
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
              '--ag-box-h': `${box.height}px`,
            } as React.CSSProperties
          }
        >
          {showStaticOnly ? (
            <StaticTree />
          ) : (
            <TreeErrorBoundary fallback={<StaticTree />}>
              <Suspense fallback={<StaticTree />}>
                <TreeGrowthPlayer width={box.width} height={box.height} mode={mode} frame={qaFrame ?? undefined} />
              </Suspense>
            </TreeErrorBoundary>
          )}
          {!prefersReducedMotion &&
            FALLING_LEAVES.map((spec, i) => <FallingLeaf key={i} {...spec} />)}
        </div>
      )}
    </div>
  );
}

export function TreeOverlay() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  // The auth pane is hidden below lg — don't mount the player (or download its chunk) there.
  // Gating here (rather than inside TreeOverlayInner) means crossing the breakpoint fully
  // mounts/unmounts the inner component, so its cover-box ref/ResizeObserver is never left
  // attached to a stale or nonexistent element.
  if (!isDesktop) return null;
  return <TreeOverlayInner />;
}
