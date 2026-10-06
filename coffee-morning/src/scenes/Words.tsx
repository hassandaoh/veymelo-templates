import {CAFE, COLOR, TITLE} from '../content';
import {SANS, SERIF} from '../fonts';
import type {Layout} from '../layout';
import {prog} from '../motion';
import {T} from '../timing';

// The line in two beats ("Morning," over the dawn, "slowly." over the pour),
// then the café: its name, the drink and where to find it.
export function Words({f, box}: {f: number; box: Layout}) {
  const {u, title, end} = box;
  const beats = [T.title, T.slowly];
  const name = prog(f, T.name, 26);
  const details = prog(f, T.details, 24);
  return (
    <>
      <div style={{position: 'absolute', left: title.x, top: title.y, color: COLOR.espresso, fontFamily: SERIF, fontWeight: 500, fontSize: title.size, lineHeight: 1.02, letterSpacing: '-0.035em'}}>
        {TITLE.map((line, i) => {
          const k = i === 0 ? 1 : prog(f, beats[i], 30); // the first line is on the cover already
          return (
            <div key={line} style={{overflow: 'hidden', paddingBottom: 12 * u, marginBottom: -12 * u}}>
              <div style={{transform: `translateY(${(1 - k) * 110}%)`}}>{line}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: end.x, top: end.y, fontFamily: SANS, color: COLOR.espresso}}>
        <div style={{fontFamily: SERIF, fontSize: 86 * u, fontWeight: 600, letterSpacing: '-0.02em', opacity: name, transform: `translateY(${(1 - name) * 16 * u}px)`}}>{CAFE.name}</div>
        <div style={{fontSize: 42 * u, fontWeight: 600, marginTop: 20 * u, opacity: details, transform: `translateY(${(1 - details) * 12 * u}px)`}}>{CAFE.drink}</div>
        <div style={{fontSize: 34 * u, fontWeight: 500, marginTop: 12 * u, color: COLOR.muted, opacity: details, transform: `translateY(${(1 - details) * 12 * u}px)`}}>{CAFE.hours}</div>
      </div>
    </>
  );
}
