import { interpolate } from 'remotion';
import { buildWalkPose, buildSitPose, renderPersonPose, PEOPLE, PEOPLE_GROUND_Y, type PersonSpec } from './people';

// Animates the two PEOPLE specs (see people.tsx) on the growth timeline: walking position via
// interpolate, gait via a phase-driven pose, and a crossfade from walking pose to sitting pose on
// arrival.

const clampOpts = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

function Person({ spec, index, frame }: { spec: PersonSpec; index: number; frame: number }) {
  const arriveFrame = spec.startFrame + spec.walkDuration;
  const sitStart = arriveFrame - 10; // slight overlap: legs are already slowing as they sit
  const sitEnd = arriveFrame + 25;

  const x = interpolate(frame, [spec.startFrame, arriveFrame], [spec.entryX, spec.restX], clampOpts);
  const walkOpacity = interpolate(frame, [sitStart, sitEnd], [1, 0], clampOpts);
  const sitOpacity = interpolate(frame, [sitStart, sitEnd], [0, 1], clampOpts);

  const phase = Math.max(0, frame - spec.startFrame) * spec.strideRate;
  const walkPose = buildWalkPose(phase);
  const sitPose = buildSitPose();
  const mirrorSit = spec.sitFacing === 'left';

  return (
    <g transform={`translate(${x} ${PEOPLE_GROUND_Y}) scale(${spec.scale})`} opacity={0.97}>
      {walkOpacity > 0.001 && <g opacity={walkOpacity}>{renderPersonPose(walkPose, `w${index}`)}</g>}
      {sitOpacity > 0.001 && (
        <g opacity={sitOpacity} transform={mirrorSit ? 'scale(-1, 1)' : undefined}>
          {renderPersonPose(sitPose, `s${index}`)}
        </g>
      )}
    </g>
  );
}

export function PeopleLayer({ frame }: { frame: number }) {
  return (
    <>
      {PEOPLE.map((spec, i) => (
        <Person key={i} spec={spec} index={i} frame={frame} />
      ))}
    </>
  );
}
