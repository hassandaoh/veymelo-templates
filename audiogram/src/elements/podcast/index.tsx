import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {k, ResultProps} from '../../kit';

// Podcast audiogram 1:1: the speaker, the quote, the waveform. Mustard, ink. Instrument Serif + Inter.
const MUSTARD = '#f2c14e';
const INK = '#1f1a12';
const QUOTE = ['“The', 'best', 'ideas', 'start', 'as', 'one', 'sentence.”'];

export default function Podcast(_: ResultProps) {
  const f = useCurrentFrame();
  const avatar = k(f, 0, 24);
  const talk = (i: number) => {
    const a = Math.abs(Math.sin(f / 5 + i * 0.7) * Math.sin(f / 13 + i * 0.31));
    return 0.15 + 0.85 * a;
  };
  return (
    <AbsoluteFill style={{background: MUSTARD, overflow: 'hidden', fontFamily: 'Inter, sans-serif', color: INK}}>
      <div style={{position: 'absolute', left: 90, top: 90, display: 'flex', alignItems: 'center', gap: 28, opacity: avatar, transform: `translateY(${(1 - avatar) * 16}px)`}}>
        <div style={{width: 120, height: 120, borderRadius: '50%', background: INK, color: MUSTARD, display: 'grid', placeItems: 'center', fontSize: 46, fontWeight: 800}}>JL</div>
        <div>
          <div style={{fontSize: 38, fontWeight: 800}}>June Lim</div>
          <div style={{fontSize: 28, fontWeight: 500, opacity: 0.7}}>Ep. 42 · The Small Studio</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 300, fontFamily: "'Instrument Serif', serif", fontSize: 112, lineHeight: 1.04, letterSpacing: '-0.01em'}}>
        {QUOTE.map((w, i) => {
          const a = k(f, 8 + i * 7, 26 + i * 7);
          return (
            <span key={i} style={{display: 'inline-block', marginRight: 26, opacity: 0.15 + 0.85 * a}}>
              {w}
            </span>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, bottom: 110, height: 150, display: 'flex', alignItems: 'center', gap: 8}}>
        {Array.from({length: 54}).map((_, i) => (
          <div key={i} style={{flex: 1, height: `${talk(i) * 100}%`, borderRadius: 6, background: INK, opacity: i / 54 < ((f % 240) / 240) ? 1 : 0.35}} />
        ))}
      </div>
    </AbsoluteFill>
  );
}
