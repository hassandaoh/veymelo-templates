import {AbsoluteFill, interpolate, spring, useCurrentFrame} from 'veymelo';
import {keyFrames, PromptLine} from '../elements/prompt';
import {ResultView} from '../elements/results/ResultView';
import {enter, move} from '../motion';
import {C, SANS, TIGHT} from '../theme';
import {BEAT} from '../timing';

/**
 * 0:00-0:10. A prompt types on black; Enter on 0:02 opens it into the finished ad;
 * "Brief your AI." / "Get a video."; then the results flash beside the words on the beats.
 */
export const OPENING = 600;
const PROMPT = 'make a launch ad, bold';
const SIZE = 76;
const TYPE_AT = 12;
const RATE = 0.45;
export const ENTER = 120; // 0:02, the downbeat of bar 2
const BRIEF = 240; // 0:04
const GET = 300; // 0:05
const ASIDE = 360; // 0:06
const FLASHES = ['world', 'mountains', 'isocity', 'kinetic', 'perfume', 'food', 'logo'];

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lineW = (n: number, size: number) => size * (1.2 + 0.6 * n + 0.62);

export const openingSounds = () => [
  ...keyFrames(PROMPT, TYPE_AT, RATE, 2).map((f, i) => ({f, s: `key${i % 4}`, v: 0.22})),
  {f: ENTER, s: 'enter', v: 0.55},
  {f: ENTER, s: 'whoosh', v: 0.35},
  {f: ENTER + 2, s: 'thud', v: 0.5},
  {f: ENTER + 50, s: 'pop', v: 0.3},
  {f: 240, s: 'hit', v: 0.4},
  {f: 300, s: 'hit', v: 0.4},
  ...[0, 1, 2, 3, 4, 5, 6].map((i) => ({f: 360 + i * 30, s: 'tick', v: 0.22})),
  {f: ASIDE - 4, s: 'whoosh', v: 0.22},
];

export function Opening() {
  const f = useCurrentFrame();
  // the line, left-anchored so it types left to right and ends centred
  const W = lineW(PROMPT.length, SIZE);
  const x0 = 960 - W / 2;
  // the burst: the line's own box opens into the frame
  const b = interpolate(f, [ENTER, ENTER + 26], [0, 1], {...cl, easing: enter});
  const box = {
    x: interpolate(b, [0, 1], [x0 - 30, 0]),
    y: interpolate(b, [0, 1], [540 - 60, 0]),
    w: interpolate(b, [0, 1], [W + 60, 1920]),
    h: interpolate(b, [0, 1], [120, 1080]),
    r: interpolate(b, [0, 1], [18, 0]),
  };
  const promptOut = interpolate(f, [ENTER, ENTER + 8], [1, 0], cl);

  // the words
  const l1 = interpolate(f, [BRIEF, BRIEF + 16], [0, 1], {...cl, easing: enter});
  const l2 = interpolate(f, [GET, GET + 16], [0, 1], {...cl, easing: enter});
  const up = interpolate(f, [GET - 6, GET + 18], [0, 1], {...cl, easing: move});
  const aside = interpolate(f, [ASIDE, ASIDE + 36], [0, 1], {...cl, easing: move});
  const echo = interpolate(f, [BRIEF + 12, BRIEF + 30], [0, 1], cl) * interpolate(f, [GET - 10, GET + 4], [1, 0], cl);
  // the flash frame
  const frameIn = spring({frame: f - ASIDE - 6, fps: 60, config: {damping: 14, stiffness: 170, mass: 0.9}});
  const flashI = Math.min(FLASHES.length - 1, Math.max(0, Math.floor((f - ASIDE) / BEAT)));
  const flashFrom = ASIDE + flashI * BEAT;
  const out = interpolate(f, [OPENING - 22, OPENING], [1, 0], {...cl, easing: enter});

  return (
    <AbsoluteFill style={{background: C.ink}}>
      {f < BRIEF && (
        <>
          <div style={{position: 'absolute', left: x0, top: 540 - SIZE / 2 - 4, opacity: promptOut}}>
            <PromptLine text={PROMPT} start={TYPE_AT} rate={RATE} size={SIZE} enterAt={ENTER} frame={f} />
          </div>
          {f >= ENTER && (
            <div style={{position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: box.r, overflow: 'hidden', boxShadow: `0 0 0 ${3 * (1 - b)}px ${C.accent}`}}>
              <ResultView id="sneaker" w={box.w} h={box.h} from={ENTER} peek={0} />
            </div>
          )}
        </>
      )}
      {f >= BRIEF && (
        <AbsoluteFill style={{opacity: out}}>
          <div
            style={{
              position: 'absolute',
              left: interpolate(aside, [0, 1], [400, 130]),
              top: 540 - 95 - up * 95,
              transform: `scale(${interpolate(aside, [0, 1], [1, 0.62])})`,
              transformOrigin: '0% 100%',
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 168,
              letterSpacing: TIGHT,
              lineHeight: '190px',
              color: '#fff',
            }}
          >
            <div style={{overflow: 'hidden', height: 196}}>
              <div style={{transform: `translateY(${(1 - l1) * 105}%)`}}>Brief your AI.</div>
            </div>
            <div style={{overflow: 'hidden', height: 196}}>
              <div style={{transform: `translateY(${(1 - l2) * 105}%)`, opacity: f >= GET ? 1 : 0}}>Get a video.</div>
            </div>
          </div>
          <div style={{position: 'absolute', left: 408, top: 680, opacity: echo}}>
            <PromptLine text={PROMPT} start={-1000} rate={1} size={36} color="#9a9aa6" enterAt={0} frame={f} />
          </div>
          {f >= ASIDE && (
            <div
              style={{
                position: 'absolute',
                left: 900,
                top: 265,
                width: 900,
                height: 506,
                borderRadius: 22,
                overflow: 'hidden',
                transform: `scale(${0.86 + 0.14 * frameIn})`,
                opacity: Math.min(1, frameIn * 1.6),
                boxShadow: '0 0 0 1px rgba(255,255,255,0.08)',
              }}
            >
              <ResultView key={FLASHES[flashI]} id={FLASHES[flashI]} w={900} h={506} from={flashFrom} peek={60} />
            </div>
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
}
