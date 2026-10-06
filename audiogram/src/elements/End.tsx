import {COLOR, END} from '../content';
import {SANS, SERIF} from '../fonts';
import {CLIP_FRAMES} from '../levels';
import {prog} from '../motion';
import type {Layout} from '../layout';

// After the last word: what this was and where to hear the rest. Then it holds.
export function End({f, fps, box}: {f: number; fps: number; box: Layout}) {
  const at = CLIP_FRAMES + Math.round(0.35 * fps);
  if (f < at) return null;
  const {u, caption} = box;
  const title = prog(f, at, 24);
  const line = prog(f, at + 12, 22);
  return (
    <div style={{position: 'absolute', left: caption.x, top: caption.y, width: caption.w}}>
      <div style={{fontFamily: SERIF, fontSize: caption.size * 0.95, lineHeight: 1.06, color: COLOR.text, opacity: title, transform: `translateY(${(1 - title) * 16 * u}px)`}}>{END.title}</div>
      <div style={{fontFamily: SANS, fontSize: 28 * u, color: COLOR.muted, marginTop: 34 * u, opacity: line, transform: `translateY(${(1 - line) * 12 * u}px)`}}>{END.line}</div>
    </div>
  );
}
