import {COLOR} from '../content';
import {FPS, chunks} from '../edit';
import {SANS} from '../fonts';
import {prog} from '../motion';

// A few words at a time, big, in the lower middle: below the face and above
// the apps' own captions (the bottom 22%), clear of their buttons (right 14%).
// The word being said is lit; the words that carry the point land bigger.
export function Captions({f, u}: {f: number; u: number}) {
  const t = f / FPS;
  const chunk = chunks.find(item => t >= item.start && t < item.end);
  if (!chunk) return null;
  const shown = prog(f, Math.round(chunk.start * FPS), 4);
  return (
    <>
    {/* a soft shade behind the words, so they read on any shirt or sky */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1000 * u, height: 520 * u, background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,0,0,0.38), rgba(0,0,0,0))', opacity: shown}} />
    <div style={{position: 'absolute', left: 90 * u, width: 840 * u, top: 1150 * u, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `${4 * u}px ${22 * u}px`, fontFamily: SANS, fontWeight: 800, fontSize: 92 * u, lineHeight: 1.08, letterSpacing: '-0.02em', textAlign: 'center', opacity: shown, transform: `scale(${0.92 + 0.08 * shown})`}}>
      {chunk.words.map((word, i) => {
        const said = t >= word.start;
        const now = said && t < word.end;
        // A word that carries the point lands: a little big, then its size, and stays lit.
        const land = word.emphasis && said ? 1 - prog(f, Math.round(word.start * FPS), 8) : 0;
        return (
          <span key={i} style={{display: 'inline-block', color: now || (word.emphasis && said) ? COLOR.accent : COLOR.text, transform: `scale(${1 + 0.12 * land})`, textShadow: `0 ${3 * u}px 0 rgba(0,0,0,0.55), 0 ${6 * u}px ${22 * u}px rgba(0,0,0,0.45)`}}>
            {word.text}
          </span>
        );
      })}
    </div>
    </>
  );
}
