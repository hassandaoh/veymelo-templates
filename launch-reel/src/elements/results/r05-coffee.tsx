import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {inOut, k, ResultProps} from './kit';

// 2.5D: a coffee ad, layered, warm morning. Oat, crema, espresso. Fraunces.
const ESPRESSO = '#3b2216';

function Layer({depth, f, children}: {depth: number; f: number; children: React.ReactNode}) {
  // the camera dollies in and drifts left: near layers travel further
  const t = k(f, 0, 260, inOut);
  const x = -t * 160 * depth;
  const s = 1 + t * 0.08 * depth;
  return <div style={{position: 'absolute', inset: 0, transform: `translateX(${x}px) scale(${s})`, transformOrigin: '60% 70%'}}>{children}</div>;
}

export default function Coffee(_: ResultProps) {
  const f = useCurrentFrame();
  const sunY = 470 - k(f, 0, 240) * 110;
  const word = (i: number) => k(f, 20 + i * 10, 52 + i * 10);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #f8ead6 0%, #f3cfa5 70%, #eab98c 100%)', overflow: 'hidden'}}>
      <Layer depth={0.15} f={f}>
        <div style={{position: 'absolute', left: 1640 - 150, top: sunY - 230, width: 300, height: 300, borderRadius: '50%', background: '#ffb36b', opacity: 0.9}} />
      </Layer>
      <Layer depth={0.3} f={f}>
        <svg width="2200" height="1080" style={{position: 'absolute', left: 0, top: 0}}>
          <path d="M0 640 C220 560 420 600 640 560 C860 520 1060 600 1300 570 C1540 540 1800 590 2200 560 L2200 1080 L0 1080 Z" fill="#e2ab7c" />
        </svg>
      </Layer>
      <Layer depth={0.6} f={f}>
        <svg width="2400" height="1080" style={{position: 'absolute', left: 0, top: 0}}>
          <path d="M0 720 L120 720 L120 650 L220 650 L220 690 L300 690 L300 610 L360 580 L420 610 L420 700 L560 700 L560 640 L680 640 L680 720 L860 720 L860 600 L960 600 L960 700 L1100 700 L1100 660 L1260 660 L1260 720 L1420 720 L1420 630 L1520 590 L1620 630 L1620 710 L1800 710 L1800 650 L1960 650 L1960 720 L2400 720 L2400 1080 L0 1080 Z" fill="#c4825a" />
        </svg>
      </Layer>
      <Layer depth={1} f={f}>
        <div style={{position: 'absolute', left: -200, right: -200, top: 820, bottom: -100, background: '#6e412a'}} />
        <div style={{position: 'absolute', left: -200, right: -200, top: 820, height: 14, background: '#8a5638'}} />
        {/* the cup */}
        <svg width="620" height="520" viewBox="0 0 620 520" style={{position: 'absolute', left: 1040, top: 380}}>
          <ellipse cx="300" cy="455" rx="250" ry="42" fill="#efe5d6" />
          <ellipse cx="300" cy="448" rx="190" ry="26" fill="#ddd0bd" />
          <path d="M150 230 L450 230 C450 360 400 440 300 440 C200 440 150 360 150 230 Z" fill="#fbf6ee" />
          <path d="M448 262 C520 262 530 360 440 372" fill="none" stroke="#fbf6ee" strokeWidth="26" strokeLinecap="round" />
          <ellipse cx="300" cy="230" rx="150" ry="34" fill="#f1e6d6" />
          <ellipse cx="300" cy="234" rx="132" ry="26" fill="#7a4526" />
          <path d="M300 220 C280 228 286 242 300 246 C314 242 320 228 300 220 Z M272 232 C288 238 312 238 328 232" fill="none" stroke="#e8c7a2" strokeWidth="5" strokeLinecap="round" />
          {[0, 1, 2].map((i) => {
            const phase = f / 22 + i * 2.1;
            const x = 250 + i * 50;
            const sw = Math.sin(phase) * 18;
            const d = `M${x} 190 C${x + sw} 150 ${x - sw} 110 ${x + sw * 0.6} 60 C${x + sw} 30 ${x} 10 ${x - sw * 0.5} -20`;
            return <path key={i} d={d} fill="none" stroke="#fffaf2" strokeWidth="9" strokeLinecap="round" opacity={0.85 * k(f, 20 + i * 8, 60 + i * 8)} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - k(f, 10 + i * 8, 70 + i * 8)} />;
          })}
        </svg>
      </Layer>
      <div style={{position: 'absolute', left: 140, top: 210, color: ESPRESSO, fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 150, lineHeight: 1.02, letterSpacing: '-0.03em'}}>
        {['Morning,', 'slowly.'].map((w, i) => (
          <div key={w} style={{overflow: 'hidden'}}>
            <div style={{transform: `translateY(${(1 - word(i)) * 105}%)`}}>{w}</div>
          </div>
        ))}
        <div style={{fontFamily: 'Inter, sans-serif', fontSize: 34, fontWeight: 500, marginTop: 34, opacity: word(2), letterSpacing: '0'}}>Oat flat white · Saturday Roasters</div>
      </div>
    </AbsoluteFill>
  );
}
