import {COLOR, CUES, type Cue} from '../content';
import {SERIF, SERIF_ITALIC} from '../fonts';
import {exit, prog} from '../motion';
import type {Layout} from '../layout';

// The words, one phrase at a time, each lit as it is said: said words full,
// the word being said in the accent, the rest of the phrase waiting, faint.
function Phrase({cue, t, f, fps, box}: {cue: Cue; t: number; f: number; fps: number; box: Layout}) {
  const {u, caption} = box;
  const appear = prog(f, Math.round(cue.start * fps) - 12, 12);
  const leave = prog(f, Math.round(cue.end * fps) - 4, 8, exit);
  const style = {position: 'absolute' as const, left: caption.x, top: caption.y, width: caption.w, opacity: appear * (1 - leave), transform: `translateY(${((1 - appear) * 14 - leave * 10) * u}px)`};
  if (cue.note) return <div style={{...style, fontFamily: SERIF_ITALIC, fontSize: caption.size * 0.7, color: COLOR.muted}}>{cue.note}</div>;
  return (
    <div style={{...style, fontFamily: SERIF, fontSize: caption.size, lineHeight: 1.06, letterSpacing: '-0.01em'}}>
      {cue.words!.map((word, i) => {
        const now = t >= word.start && t < word.end;
        const said = t >= word.end;
        const lift = prog(f, Math.round(word.start * fps), 8);
        return (
          <span key={i} style={{display: 'inline-block', marginRight: '0.24em', color: now ? COLOR.accent : COLOR.text, opacity: now || said ? 1 : 0.22, transform: `translateY(${(t >= word.start ? 1 - lift : 0) * 6 * u}px)`}}>
            {word.text}
          </span>
        );
      })}
    </div>
  );
}

export function Words({f, fps, box}: {f: number; fps: number; box: Layout}) {
  const t = f / fps;
  return (
    <>
      {CUES.filter(cue => t >= cue.start - 0.2 && t < cue.end + 0.1).map(cue => (
        <Phrase key={cue.start} cue={cue} t={t} f={f} fps={fps} box={box} />
      ))}
    </>
  );
}
