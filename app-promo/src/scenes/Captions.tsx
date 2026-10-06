import {CAPTIONS, COLOR} from '../content';
import {exit, prog} from '../motion';
import {T} from '../timing';

// One line a screen, top left, below the apps' top bar (12%) and clear of
// their right-hand buttons (14%).
const LINES = [
  {text: CAPTIONS.overview, from: T.overview + 20, to: T.budgets - 14},
  {text: CAPTIONS.budgets, from: T.budgets + 16, to: T.goals - 14},
  {text: CAPTIONS.goals, from: T.goals + 16, to: T.end - 12},
];

export function Captions({f}: {f: number}) {
  return (
    <>
      {LINES.map(line => {
        if (f < line.from || f > line.to + 14) return null;
        const k = prog(f, line.from, 22);
        const out = prog(f, line.to, 14, exit);
        return (
          <div key={line.text} style={{position: 'absolute', left: 90, top: 250, color: COLOR.brand, fontSize: 72, fontWeight: 700, letterSpacing: '-0.035em', opacity: k * (1 - out), transform: `translateY(${(1 - k) * 24 - out * 16}px)`}}>
            {line.text}
          </div>
        );
      })}
    </>
  );
}
