import {AbsoluteFill, random, useCurrentFrame} from 'veymelo';
import {k, ResultProps} from './kit';

// Lyric visualizer 1:1: a ring of bars that breathes with the song; the line arrives word by word.
const RED = '#ff4d3d';
const WORDS = [
  {w: 'we', t: 0},
  {w: 'were', t: 10},
  {w: 'dancing', t: 22},
  {w: 'in', t: 46},
  {w: 'the', t: 54},
  {w: 'static', t: 64},
];

export default function Lyric(_: ResultProps) {
  const f = useCurrentFrame();
  const N = 72;
  const beat = Math.pow(1 - ((f % 30) / 30), 3); // a pulse on every beat (120 BPM)
  return (
    <AbsoluteFill style={{background: 'radial-gradient(60% 60% at 50% 50%, #2a0d0b 0%, #110605 75%)', overflow: 'hidden'}}>
      <svg width="1080" height="1080" style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(540 540) rotate(${f * 0.25})`}>
          {Array.from({length: N}).map((_, i) => {
            const a = (i / N) * 360;
            const amp = 0.35 + 0.65 * Math.abs(Math.sin(f / 9 + i * 0.55) * Math.sin(f / 23 + i * 0.21)) * (0.6 + 0.4 * random(`r13-${i}-${Math.floor(f / 4)}`));
            const len = 30 + amp * 120 * (0.7 + 0.5 * beat);
            return <rect key={i} x={-5} y={-330 - len} width={10} height={len} rx={5} fill={RED} opacity={0.35 + amp * 0.65} transform={`rotate(${a})`} />;
          })}
        </g>
        <circle cx="540" cy="540" r={300 + beat * 8} fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2" />
      </svg>
      <div style={{position: 'absolute', left: 140, right: 140, top: 380, textAlign: 'center', fontFamily: "'Instrument Serif Italic', serif", fontSize: 108, lineHeight: 1.05, color: '#fff3ee'}}>
        {WORDS.map(({w, t}) => {
          const a = k(f, t, t + 16);
          return (
            <span key={w} style={{display: 'inline-block', marginRight: 26, opacity: a, filter: `blur(${(1 - a) * 6}px)`, transform: `translateY(${(1 - a) * 14}px)`}}>
              {w}
            </span>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 120, textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 26, letterSpacing: '0.4em', color: '#ffb0a5', opacity: k(f, 60, 90)}}>
        STATIC HEARTS — NEW SINGLE
      </div>
    </AbsoluteFill>
  );
}
