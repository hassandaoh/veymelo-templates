import type {ReactNode} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'veymelo';
import {Caret, typedCount} from './elements/prompt';
import {RESULTS} from './elements/results/registry';
import {enter} from './motion';
import {PIECES} from './scenes/Results';
import {C, MONO, SANS, TIGHT} from './theme';
import {START} from './timing';

/**
 * The 9:16 cut. The 16:9 film plays as a picture across the width; above it a headline names the
 * moment in large type; during the results the prompt that made each one is repeated large below it,
 * so the cause stays readable on a phone. Words sit inside the safe area (clear of the app buttons).
 */
const HEADS: {at: number; text: string}[] = [
  {at: 0, text: ''},
  {at: START['Setup'], text: 'One command.'},
  {at: START['AI live'], text: 'Watch it work, live.'},
  {at: START['Prompt to result'], text: 'Any style.'},
  {at: START['Montage'], text: 'Any format.'},
  {at: START['Wall'], text: 'Every kind of video.'},
  {at: START['Code'], text: 'Every frame is code.'},
  {at: START['End'], text: ''},
];

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export function Vertical({children}: {children: ReactNode}) {
  const f = useCurrentFrame();
  const {width} = useVideoConfig();
  const s = width / 1920;
  const picH = 1080 * s;
  const top = 640;
  let hi = 0;
  HEADS.forEach((h, i) => {
    if (f >= h.at) hi = i;
  });
  const head = HEADS[hi];
  const a = interpolate(f, [head.at, head.at + 16], [0, 1], {...cl, easing: enter});
  // the prompt under the picture during the results
  const rf = f - START['Prompt to result'];
  let prompt: {text: string; n: number} | null = null;
  if (f < 240) {
    const text = 'make a launch ad, bold';
    prompt = {text, n: typedCount(text, f, 12, 0.45)};
  }
  if (rf >= 0 && rf < 2340) {
    let pi = 0;
    PIECES.forEach((p, i) => {
      if (rf >= p.typeAt) pi = i;
    });
    const p = PIECES[pi];
    const text = RESULTS[p.id].prompt;
    prompt = {text, n: typedCount(text, rf, p.typeAt, p.rate)};
  }
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <div style={{position: 'absolute', left: 0, top, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: '0 0', overflow: 'hidden'}}>{children}</div>
      {head.text && (
        <div style={{position: 'absolute', left: 70, right: 70, top: 300, fontFamily: SANS, fontWeight: 800, fontSize: 104, letterSpacing: TIGHT, lineHeight: 1.02, color: '#fff', opacity: a, transform: `translateY(${(1 - a) * 24}px)`}}>
          {head.text}
        </div>
      )}
      {prompt && (
        <div style={{position: 'absolute', left: 70, right: 70, top: top + picH + 70, display: 'flex', gap: 22, alignItems: 'flex-start', fontFamily: MONO, fontSize: 46, lineHeight: 1.3, color: '#fff'}}>
          <div style={{marginTop: 8, flex: 'none'}}>
            <Caret size={38} />
          </div>
          <div>
            {prompt.text.slice(0, prompt.n)}
            <span style={{display: 'inline-block', width: 26, height: 50, background: C.accent, verticalAlign: 'middle', marginLeft: 4, opacity: Math.floor(f / 15) % 2 === 0 || prompt.n < prompt.text.length ? 1 : 0}} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
}
