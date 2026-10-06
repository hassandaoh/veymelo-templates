import {AbsoluteFill, interpolate, useCurrentFrame} from 'veymelo';
import {Caret, keyFrames, typedCount} from '../elements/prompt';
import {Aspect, SIZE} from '../elements/results/kit';
import {RESULTS} from '../elements/results/registry';
import {ResultView} from '../elements/results/ResultView';
import {enter, move} from '../motion';
import {C, MONO} from '../theme';

/**
 * 0:32-1:11. Prompt → result, six times (4 s each), then ten more on the beat (1.5 s each).
 * One rounded frame travels through all of them and changes shape; the prompt lives in a pill under it.
 */
const A_IDS = ['world', 'perfume', 'mountains', 'kinetic', 'isocity', 'shapes'];
const A_LEN = 240;
export const M_IDS = ['botanical', 'social', 'infographic', 'collage', 'app', 'food', 'poster', 'lyric', 'sport', 'map'];
const M_LEN = 90;
const M0 = A_IDS.length * A_LEN; // 1440
export const RESULTS_LEN = M0 + M_IDS.length * M_LEN; // 2340
const FIRST_ENTER = 60;

type Box = {x: number; y: number; w: number; h: number};
const fit = (aspect: Aspect, cx: number, cy: number, maxW: number, maxH: number): Box => {
  const d = SIZE[aspect];
  const s = Math.min(maxW / d.w, maxH / d.h);
  return {x: cx - (d.w * s) / 2, y: cy - (d.h * s) / 2, w: d.w * s, h: d.h * s};
};
const boxA = (id: string) => fit(RESULTS[id].aspect, 960, 34 + 945 / 2, 1680, 945);
const boxM = (id: string) => fit(RESULTS[id].aspect, 960, 500, 1500, 844);
/** the montage's last frame, for the wall to start from */
export const LAST_BOX = boxM(M_IDS[M_IDS.length - 1]);
export const LAST_PEEK = RESULTS[M_IDS[M_IDS.length - 1]].peek + M_LEN;
const lerpBox = (a: Box, b: Box, t: number): Box => ({x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, w: a.w + (b.w - a.w) * t, h: a.h + (b.h - a.h) * t});

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// the schedule: when each prompt types, when Enter lands, which result is in the frame
export type Piece = {id: string; at: number; typeAt: number; rate: number; box: Box; peek: number};
export const PIECES: Piece[] = [
  ...A_IDS.map((id, i) => {
    const at = i === 0 ? FIRST_ENTER : i * A_LEN;
    const p = RESULTS[id].prompt;
    return {id, at, typeAt: i === 0 ? 6 : at - 54, rate: i === 0 ? 0.95 : p.length / 44, box: boxA(id), peek: 0};
  }),
  ...M_IDS.map((id, j) => {
    const at = M0 + j * M_LEN;
    return {id, at, typeAt: at - 10, rate: 2.5, box: boxM(id), peek: RESULTS[id].peek};
  }),
];

/** every sound in this scene: typing, Enter, the frame's move, and each result's own cues while it is in the frame */
export const resultsSounds = () =>
  PIECES.flatMap((p, i) => {
    const end = PIECES[i + 1]?.at ?? RESULTS_LEN;
    const own = (RESULTS[p.id].cues ?? [])
      .map(([t, s, v]) => ({f: p.at - p.peek + t, s, v}))
      .filter((c) => c.f >= p.at && c.f < end - 4);
    const lead =
      i < A_IDS.length
        ? [...keyFrames(RESULTS[p.id].prompt, p.typeAt, p.rate, 5).map((f, k) => ({f, s: `key${k % 4}`, v: 0.16})), {f: p.at, s: 'enter', v: 0.42}, {f: p.at, s: 'whoosh', v: 0.22}]
        : [{f: p.at, s: 'whoosh', v: 0.2}];
    return [...lead, ...own];
  });

function Pill({text, f, typeAt, rate, enterAt, y, scale = 1, bg = 1}: {text: string; f: number; typeAt: number; rate: number; enterAt: number; y: number; scale?: number; bg?: number}) {
  const n = typedCount(text, f, typeAt, rate);
  const size = 31;
  const w = size * (1.2 + 0.6 * text.length + 0.7) + 56;
  const cursor = f < enterAt && (n < text.length || Math.floor(f / 15) % 2 === 0);
  return (
    <div style={{position: 'absolute', left: 960 - w / 2, top: y, width: w, height: 64, borderRadius: 999, background: `rgba(23,23,29,${bg})`, boxShadow: `0 0 0 1px rgba(255,255,255,${0.09 * bg})`, display: 'flex', alignItems: 'center', padding: '0 26px', gap: size * 0.42, fontFamily: MONO, fontSize: size, color: '#fff', whiteSpace: 'pre', transform: `scale(${scale})`, boxSizing: 'border-box'}}>
      <Caret size={size * 0.78} />
      <span>
        {text.slice(0, n)}
        <span style={{display: 'inline-block', width: size * 0.56, height: size * 1.05, verticalAlign: 'middle', background: C.accent, opacity: cursor ? 1 : 0, marginLeft: 2}} />
      </span>
    </div>
  );
}

export function Results() {
  const f = useCurrentFrame();
  // the piece in the frame now, and the one before it (for the reveal)
  let i = 0;
  for (let k = 0; k < PIECES.length; k++) if (f >= PIECES[k].at) i = k;
  const cur = PIECES[i];
  const prev = PIECES[i - 1];
  // the piece whose prompt is in the pill (the next one types before its Enter)
  let pi = 0;
  for (let k = 0; k < PIECES.length; k++) if (f >= PIECES[k].typeAt) pi = k;
  const pp = PIECES[pi];

  // the first prompt is big in the middle, then shrinks into the pill
  if (f < FIRST_ENTER) {
    const size = 56;
    const text = RESULTS[A_IDS[0]].prompt;
    const W = size * (1.2 + 0.6 * text.length + 0.62);
    const n = typedCount(text, f, PIECES[0].typeAt, PIECES[0].rate);
    return (
      <AbsoluteFill style={{background: C.ink}}>
        <div style={{position: 'absolute', left: 960 - W / 2, top: 540 - size / 2, display: 'flex', alignItems: 'center', gap: size * 0.42, fontFamily: MONO, fontSize: size, color: '#fff', whiteSpace: 'pre'}}>
          <Caret size={size * 0.78} />
          <span>
            {text.slice(0, n)}
            <span style={{display: 'inline-block', width: size * 0.56, height: size * 1.05, verticalAlign: 'middle', background: C.accent, opacity: n < text.length || Math.floor(f / 15) % 2 === 0 ? 1 : 0}} />
          </span>
        </div>
      </AbsoluteFill>
    );
  }

  const isFirst = i === 0;
  const t = interpolate(f, [cur.at, cur.at + (i >= A_IDS.length ? 14 : 26)], [0, 1], {...cl, easing: isFirst ? enter : move});
  // the frame's box: from the prompt's line (first) or from the last box
  const firstFrom: Box = {x: 960 - 700, y: 540 - 50, w: 1400, h: 100};
  const box = isFirst ? lerpBox(firstFrom, cur.box, t) : lerpBox(prev.box, cur.box, t);
  const radius = isFirst ? 18 + 10 * t : 28;
  // in the six, the new result opens in a circle from the pill; in the montage, it cuts on the beat
  const reveal = i > 0 && i < A_IDS.length ? interpolate(f, [cur.at, cur.at + 24], [0, 1], {...cl, easing: enter}) : 1;
  const pillY = i < A_IDS.length || (i === A_IDS.length && f < cur.at + 20) ? interpolate(i === A_IDS.length ? t : 0, [0, 1], [996, 946]) : 946;
  const pillIn = isFirst ? interpolate(f, [cur.at, cur.at + 22], [0, 1], {...cl, easing: move}) : 1;
  // the circle's centre: the pill, in the frame's coordinates
  const cx = 960 - box.x;
  const cy = pillY + 32 - box.y;

  return (
    <AbsoluteFill style={{background: C.ink}}>
      <div style={{position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: radius, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)'}}>
        {prev && reveal < 1 && <ResultView key={`p${i - 1}`} id={prev.id} w={box.w} h={box.h} from={prev.at} peek={prev.peek} />}
        <div style={{position: 'absolute', inset: 0, clipPath: reveal < 1 ? `circle(${reveal * 2300}px at ${cx}px ${cy}px)` : undefined}}>
          <ResultView key={`c${i}`} id={cur.id} w={box.w} h={box.h} from={cur.at} peek={cur.peek} />
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - pillIn) * -488}px) scale(${1 + (1 - pillIn) * 0.8})`, transformOrigin: '50% 1028px'}}>
        <Pill text={RESULTS[pp.id].prompt} f={f} typeAt={pp.typeAt} rate={pp.rate} enterAt={pp.at} y={pillY} bg={pillIn} />
      </div>
    </AbsoluteFill>
  );
}
