import {COLOR, END} from '../content';
import {CUT_FRAMES} from '../edit';
import {SANS} from '../fonts';
import {prog} from '../motion';

// After the last word: the line again, where to go, and where the video is from.
export function End({f, u}: {f: number; u: number}) {
  if (f < CUT_FRAMES - 6) return null;
  const ground = prog(f, CUT_FRAMES - 6, 10);
  const line = prog(f, CUT_FRAMES + 2, 14);
  const link = prog(f, CUT_FRAMES + 10, 14);
  return (
    <div style={{position: 'absolute', inset: 0, background: `rgba(11,26,51,${ground})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34 * u, fontFamily: SANS, textAlign: 'center', padding: `0 ${110 * u}px`}}>
      <div style={{color: COLOR.text, fontSize: 84 * u, fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.02em', opacity: line, transform: `translateY(${(1 - line) * 18 * u}px)`}}>{END.line}</div>
      <div style={{color: COLOR.accent, fontSize: 46 * u, fontWeight: 700, opacity: link}}>{END.link}</div>
      <div style={{position: 'absolute', bottom: 440 * u, color: COLOR.muted, fontSize: 28 * u, fontWeight: 500, opacity: link}}>{END.credit}</div>
    </div>
  );
}
