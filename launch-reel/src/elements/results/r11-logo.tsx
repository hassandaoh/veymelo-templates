import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {inOut, k, ResultProps} from './kit';

// Logo reveal: a mark draws itself, the name assembles. Deep navy, ice, signal orange. Unbounded.
const NAVY = '#0b1430';
const ICE = '#e8f0ff';
const ORANGE = '#ff7a2f';

export default function Logo(_: ResultProps) {
  const f = useCurrentFrame();
  const ring = k(f, 0, 50, inOut);
  const orbit = (f / 60) * 140 - 90;
  const letters = 'ORBITAL'.split('');
  const sweep = k(f, 80, 150, inOut);
  const tag = k(f, 90, 120);
  return (
    <AbsoluteFill style={{background: `radial-gradient(70% 90% at 50% 50%, #142252 0%, ${NAVY} 70%)`, overflow: 'hidden', fontFamily: 'Unbounded, sans-serif'}}>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        <g transform="translate(560 540)">
          <circle r="150" fill="none" stroke={ICE} strokeWidth="22" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ring} transform="rotate(-90)" />
          <ellipse rx="230" ry="70" fill="none" stroke={ICE} strokeOpacity="0.45" strokeWidth="6" transform="rotate(-24)" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - k(f, 20, 70, inOut)} />
          <g transform={`rotate(-24) translate(${Math.cos((orbit * Math.PI) / 180) * 230} ${Math.sin((orbit * Math.PI) / 180) * 70})`}>
            <circle r={26 * k(f, 40, 60)} fill={ORANGE} />
          </g>
        </g>
      </svg>
      <div style={{position: 'absolute', left: 790, top: 440, display: 'flex', fontSize: 150, fontWeight: 700, color: ICE, letterSpacing: '0.02em'}}>
        {letters.map((l, i) => {
          const a = k(f, 40 + i * 5, 66 + i * 5);
          return (
            <div key={i} style={{overflow: 'hidden', height: 180}}>
              <div style={{transform: `translateY(${(1 - a) * 100}%)`}}>{l}</div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 790 + (sweep * 1100 - 200),
          top: 420,
          width: 160,
          height: 220,
          background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.35), rgba(255,255,255,0))',
          transform: 'skewX(-18deg)',
          mixBlendMode: 'overlay',
          opacity: sweep > 0 && sweep < 1 ? 1 : 0,
        }}
      />
      <div style={{position: 'absolute', left: 800, top: 650, fontFamily: 'Inter, sans-serif', fontSize: 34, fontWeight: 500, letterSpacing: '0.38em', color: ICE, opacity: tag * 0.75}}>
        SPACE LOGISTICS
      </div>
    </AbsoluteFill>
  );
}
