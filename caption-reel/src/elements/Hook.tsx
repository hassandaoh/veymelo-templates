import {COLOR, HOOK} from '../content';
import {FPS} from '../edit';
import {SANS} from '../fonts';
import {exit, prog} from '../motion';

// The hook: what this is about, over the first seconds, below the apps' top
// bar; the first frame (the cover) already says it.
export function Hook({f, u}: {f: number; u: number}) {
  const out = prog(f, Math.round(HOOK.seconds * FPS), 9, exit);
  if (out >= 1) return null;
  return (
    <div style={{position: 'absolute', left: 90 * u, width: 840 * u, top: 300 * u, fontFamily: SANS, opacity: 1 - out, transform: `translateY(${-out * 20 * u}px)`}}>
      <div style={{display: 'inline-block', padding: `${18 * u}px ${28 * u}px`, borderRadius: 26 * u, background: 'rgba(11,26,51,0.78)', color: COLOR.text, fontSize: 64 * u, fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.02em'}}>{HOOK.title}</div>
      <div style={{marginTop: 16 * u, marginLeft: 6 * u, color: COLOR.text, fontSize: 30 * u, fontWeight: 600, textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>{HOOK.speaker}</div>
    </div>
  );
}
