import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {k, mix, ResultProps} from '../../kit';

// Kinetic type: a running club, on the beat. Black, white, one red. Inter 900.
const RED = '#ff3b30';
const WORDS = ['RUN', 'FASTER', 'TOGETHER'];
const LINE = 236;

export default function Kinetic({w, h}: ResultProps) {
  const f = useCurrentFrame();
  const top = h / 2 - (LINE * 3) / 2;
  return (
    <AbsoluteFill style={{background: '#0c0c0c', overflow: 'hidden', fontFamily: 'Inter, sans-serif', fontWeight: 900}}>
      {/* outlined rows behind, moving in turn */}
      {[0, 1, 2, 3, 4].map((r) => {
        const dir = r % 2 ? 1 : -1;
        const x = ((f * 2.2 * dir) % 900) - 900;
        return (
          <div
            key={r}
            style={{
              position: 'absolute',
              top: -40 + r * 230,
              left: x,
              whiteSpace: 'nowrap',
              fontSize: 230,
              letterSpacing: '-0.04em',
              color: 'transparent',
              WebkitTextStroke: '2px rgba(255,255,255,0.13)',
            }}
          >
            {'RUN CLUB · RUN CLUB · RUN CLUB · RUN CLUB ·'}
          </div>
        );
      })}
      {WORDS.map((word, i) => {
        const at = i * 30;
        const inK = k(f, at, at + 12);
        // the first word lands huge in the middle, then takes its line on the next beat
        const intro = i === 0 ? 1 - k(f, 26, 44) : 0;
        const scale = mix(1, 2.1, intro);
        const y = mix(top + i * LINE, h / 2 - LINE / 2, intro);
        const color = i === 2 ? RED : '#ffffff';
        return (
          <div key={word} style={{position: 'absolute', left: 0, width: w, top: y, height: LINE, overflow: i === 0 ? 'visible' : 'hidden', textAlign: 'center'}}>
            <div
              style={{
                fontSize: 250,
                lineHeight: `${LINE}px`,
                letterSpacing: '-0.05em',
                color,
                transform: `translateY(${(1 - inK) * 105}%) scale(${scale})`,
                opacity: i === 0 ? inK : 1,
              }}
            >
              {word}
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: w / 2 - 360,
          top: top + LINE * 3 + 8,
          width: 720 * k(f, 78, 104),
          height: 14,
          background: RED,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: w,
          textAlign: 'center',
          top: top + LINE * 3 + 50,
          fontSize: 38,
          fontWeight: 600,
          letterSpacing: '0.3em',
          color: '#ffffff',
          opacity: k(f, 96, 120),
        }}
      >
        SUNDAYS · 6 AM · LUMPINI PARK
      </div>
    </AbsoluteFill>
  );
}
