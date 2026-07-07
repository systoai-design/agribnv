import { ART_W, ART_H, HORIZON_Y, TREE_X, SAGE, CREAM } from '../art-constants';
import { buildTreeGeometry } from './treeGeometry';
import { buildSitPose, renderPersonPose, PEOPLE, PEOPLE_GROUND_Y } from './people';

// The fully-settled scene as a plain SVG — the growth composition's final frame without Remotion:
// the grown tree plus the two people seated beneath it. Shown to prefers-reduced-motion users (no
// animation and no player-chunk download) and as the error fallback if the lazy Remotion chunk
// fails to load.

const GEO = buildTreeGeometry();
const SIT_POSE = buildSitPose();

export function StaticTree() {
  return (
    <svg viewBox={`0 0 ${ART_W} ${ART_H}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx={TREE_X} cy={HORIZON_Y + 6} rx={64} ry={7} fill={SAGE} opacity={0.12} />
      {GEO.branches.map((b, i) => (
        <path key={`br${i}`} d={b.d} fill={CREAM} opacity={0.97} />
      ))}
      {GEO.leaves.map((l, i) => (
        <path key={`lf${i}`} d={l.d} fill={l.fill} opacity={l.opacity} />
      ))}
      {PEOPLE.map((p, i) => (
        <g
          key={`p${i}`}
          transform={`translate(${p.restX} ${PEOPLE_GROUND_Y}) scale(${p.scale}) ${p.sitFacing === 'left' ? 'scale(-1, 1)' : ''}`}
          opacity={0.97}
        >
          {renderPersonPose(SIT_POSE, `sp${i}`)}
        </g>
      ))}
    </svg>
  );
}
