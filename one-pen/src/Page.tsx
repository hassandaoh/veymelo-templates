import {useCurrentFrame, useVideoConfig} from 'veymelo';
import {COLORS} from './content';
import {headAt, inkAt, tailAt, type Pt} from './pen/route';
import {cameraAt, story} from './story';
import {toPath, type Stroke} from './pen/iso';

/**
 * The page and everything the pen has drawn on it, seen through a camera
 * that follows the pen. Nothing appears that the pen has not drawn;
 * after that, ink can only move (the engine running).
 */
export function Page() {
  const f = useCurrentFrame();
  const {width: w, height: h, fps} = useVideoConfig();
  const s = story(w, h, fps);
  const cam = cameraAt(s, f);
  const line = 2.6 * s.u;
  const head = headAt(s.plan, f);
  const tail = tailAt(s.plan, f);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', inset: 0}}>
      <rect width={w} height={h} fill={COLORS.paper} />
      <g transform={`translate(${w / 2} ${h / 2}) scale(${cam.scale}) translate(${-cam.cx} ${-cam.cy})`} stroke={COLORS.ink} strokeLinecap="round" strokeLinejoin="round" strokeWidth={line / Math.max(0.6, cam.scale)}>
        {s.pieces.map(piece => {
          const ink = inkAt(s.plan, piece.id, f);
          if (!ink.some(v => v > 0)) return null;
          return piece.strokes(f).map((stroke, i) => <Ink key={`${piece.id}${i}`} stroke={stroke} ink={ink[i] ?? 1} />);
        })}
        {head ? <Tail points={tail} /> : null}
        {head ? <circle cx={head[0]} cy={head[1]} r={5.5 * s.u} fill={COLORS.ink} stroke="none" /> : null}
      </g>
    </svg>
  );
}

/** One stroke of ink, drawn as far as the pen has got along it; a closed outline lays paper under itself to hide what is behind. */
function Ink({stroke, ink}: {stroke: Stroke; ink: number}) {
  const opacity = (stroke.faint ? 0.5 : 1) * (stroke.fade ?? 1);
  if (ink <= 0 || opacity <= 0 || stroke.pts.length < 2) return null;
  const d = toPath(stroke.pts);
  const partial = ink < 1;
  return (
    <>
      {stroke.fill ? <path d={d + 'Z'} fill={COLORS.paper} stroke="none" opacity={Math.min(1, ink * 1.5) * (stroke.fade ?? 1)} /> : null}
      <path d={d} fill="none" pathLength={1} strokeDasharray={partial ? '1 1' : undefined} strokeDashoffset={partial ? 1 - ink : undefined} opacity={opacity} />
    </>
  );
}

/** The pen's tail: its last moments, thinner and fainter toward the end. */
function Tail({points}: {points: Pt[]}) {
  return (
    <>
      {points.slice(1).map((p, i) => {
        const q = points[i];
        const fade = 1 - i / points.length;
        return <line key={i} x1={q[0]} y1={q[1]} x2={p[0]} y2={p[1]} opacity={0.55 * fade ** 1.6} />;
      })}
    </>
  );
}
