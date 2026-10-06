import {AbsoluteFill, interpolate, spring, useCurrentFrame} from 'veymelo';
import {move} from '../../motion';
import {C, MONO, SANS, TIGHT} from '../../theme';
import {Caret} from '../prompt';

/**
 * endcard: the caret that started every video turns 90° into the V; the name, the line and the command land.
 * Local frames: TURN_AT the caret turns, NAME_AT the name lands (with the score's last chord), LINE_AT, CMD_AT.
 */
export const TURN_AT = 24;
export const NAME_AT = 60;
export const LINE_AT = 110;
export const CMD_AT = 150;

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export function EndCard({f}: {f: number}) {
  const caretIn = spring({frame: f, fps: 60, config: {damping: 20, stiffness: 170, mass: 1}});
  const turn = interpolate(f, [TURN_AT, TURN_AT + 26], [0, 90], {...cl, easing: move});
  const name = interpolate(f, [NAME_AT - 14, NAME_AT + 10], [0, 1], {...cl, easing: move});
  const line = spring({frame: f - LINE_AT, fps: 60, config: {damping: 20, stiffness: 170, mass: 1}});
  const cmd = spring({frame: f - CMD_AT, fps: 60, config: {damping: 20, stiffness: 170, mass: 1}});
  const creep = 1 + 0.03 * interpolate(f, [NAME_AT, 420], [0, 1], cl);
  const blink = f >= CMD_AT + 20 && Math.floor(f / 30) % 2 === 0;
  // the lockup: V then the name; the V slides left as the name opens to its right
  const NAME_W = 664;
  const V = 150;
  const shift = name * (NAME_W + 24) / 2;
  return (
    <AbsoluteFill style={{background: C.ink, fontFamily: SANS, color: '#fff', transform: `scale(${creep})`}}>
      <div style={{position: 'absolute', left: 960 - V / 2 - shift, top: 400 - V / 2, opacity: caretIn, transform: `scale(${0.8 + 0.2 * caretIn})`}}>
        <Caret size={V} rot={turn} weight={0.19} color={C.accent} />
      </div>
      <div style={{position: 'absolute', left: 960 + V / 2 - shift + 24, top: 400 - 92, width: NAME_W * name, overflow: 'hidden', height: 190}}>
        <div style={{fontSize: 172, fontWeight: 800, letterSpacing: TIGHT, lineHeight: '184px', whiteSpace: 'nowrap'}}>Veymelo</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', fontSize: 48, fontWeight: 600, color: '#c9c9d2', letterSpacing: '-0.02em', opacity: line, transform: `translateY(${(1 - line) * 16}px)`}}>
        Brief your AI. Get a video.
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 700, display: 'flex', justifyContent: 'center', opacity: cmd, transform: `translateY(${(1 - cmd) * 16}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '22px 34px', borderRadius: 16, background: '#16161c', boxShadow: '0 0 0 1px rgba(255,255,255,0.09)', fontFamily: MONO, fontSize: 38}}>
          <span style={{color: C.accent}}>$</span>
          <span>npx veymelo@latest</span>
          <span style={{display: 'inline-block', width: 20, height: 40, background: C.accent, opacity: blink ? 1 : 0}} />
        </div>
      </div>
    </AbsoluteFill>
  );
}

export default function Element() {
  const f = useCurrentFrame();
  return <EndCard f={f} />;
}
