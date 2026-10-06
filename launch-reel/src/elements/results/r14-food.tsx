import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {k, mix, ResultProps, sp} from './kit';

// Food menu: a ramen bowl from above, ingredients landing. Tomato red, cream. Fraunces.
const RED = '#d9412b';
const CREAM = '#fff1df';

function Drop({f, at, children}: {f: number; at: number; children: React.ReactNode}) {
  const s = sp(f, at, {damping: 12, stiffness: 200, mass: 0.7});
  return <g style={{transform: `scale(${mix(1.6, 1, s)})`, opacity: Math.min(1, s * 1.4), transformBox: 'fill-box', transformOrigin: 'center'}}>{children}</g>;
}

export default function Food(_: ResultProps) {
  const f = useCurrentFrame();
  const bowl = sp(f, 0, {damping: 16, stiffness: 120, mass: 1});
  const turn = f * 0.12;
  const word = (i: number) => k(f, 14 + i * 8, 44 + i * 8);
  return (
    <AbsoluteFill style={{background: RED, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 1280 - 430, top: 540 - 430, width: 860, height: 860, transform: `scale(${bowl}) rotate(${turn}deg)`}}>
        <svg width="860" height="860" viewBox="-430 -430 860 860">
          <circle r="420" fill="#a72d1c" opacity="0.5" transform="translate(16 22)" />
          <circle r="420" fill="#1c1a19" />
          <circle r="372" fill="#2b2826" />
          <circle r="350" fill="#f0c28a" />
          {Array.from({length: 9}).map((_, i) => (
            <path key={i} d={`M${-240} ${-120 + i * 34} q30 -16 60 0 t60 0 t60 0 t60 0 t60 0 t60 0`} fill="none" stroke="#fbe6a8" strokeWidth="11" strokeLinecap="round" />
          ))}
          <Drop f={f} at={14}>
            <g transform="translate(-120 150)">
              <ellipse rx="92" ry="70" fill="#fffaf0" />
              <ellipse rx="44" ry="38" fill="#f29a1e" />
            </g>
          </Drop>
          <Drop f={f} at={20}>
            <g transform="translate(60 180) rotate(20)">
              <ellipse rx="92" ry="70" fill="#fffaf0" />
              <ellipse rx="44" ry="38" fill="#f29a1e" />
            </g>
          </Drop>
          <Drop f={f} at={26}>
            <g transform="translate(150 -60)">
              <circle r="96" fill="#e8a59a" />
              <circle r="70" fill="#f6c9bf" />
              <path d="M-60 -10 C-20 -40 30 -30 60 10" stroke="#c97a6b" strokeWidth="6" fill="none" />
            </g>
          </Drop>
          <Drop f={f} at={32}>
            <rect x="-300" y="-260" width="150" height="230" rx="10" fill="#22382a" transform="rotate(-18 -225 -145)" />
          </Drop>
          <Drop f={f} at={38}>
            <g>
              {[[-40, -160], [10, -190], [50, -150], [-10, -120], [-80, -110], [90, -200]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="16" fill="none" stroke="#5fb34a" strokeWidth="9" />
              ))}
            </g>
          </Drop>
          <Drop f={f} at={44}>
            <g>
              {[[-200, 40], [-180, 90], [-230, 70], [200, 120], [230, 80]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="7" fill="#e0301e" />
              ))}
            </g>
          </Drop>
        </svg>
      </div>
      <div style={{position: 'absolute', left: 140, top: 260, color: CREAM, fontFamily: 'Fraunces, serif'}}>
        {['Spicy', 'Tonkotsu'].map((w, i) => (
          <div key={w} style={{overflow: 'hidden'}}>
            <div style={{fontSize: 150, fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.035em', transform: `translateY(${(1 - word(i)) * 105}%)`}}>{w}</div>
          </div>
        ))}
        <div style={{display: 'flex', alignItems: 'center', gap: 28, marginTop: 40, opacity: word(2)}}>
          <div style={{padding: '16px 34px', borderRadius: 999, background: CREAM, color: RED, fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 46}}>129.-</div>
          <div style={{fontFamily: 'Inter, sans-serif', fontSize: 34, fontWeight: 600}}>Ramen Kaze · Ari</div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
