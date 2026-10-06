import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {inOut, k, ResultProps, sp} from './kit';

// Explainer: how rooftop solar works, step by step. Paper white, cobalt, sun yellow, leaf green. Inter.
const BLUE = '#2f54d6';
const INK = '#18203a';
const NODES = [
  {x: 300, label: 'Sun'},
  {x: 760, label: 'Panels'},
  {x: 1220, label: 'Battery'},
  {x: 1660, label: 'Home'},
];
const Y = 560;

function Icon({i, f}: {i: number; f: number}) {
  if (i === 0)
    return (
      <g>
        {Array.from({length: 10}).map((_, r) => (
          <line key={r} x1="0" y1="-92" x2="0" y2="-120" stroke="#f5b400" strokeWidth="12" strokeLinecap="round" transform={`rotate(${r * 36 + f * 0.5})`} />
        ))}
        <circle r="70" fill="#ffc72c" />
      </g>
    );
  if (i === 1)
    return (
      <g transform="skewX(-12)">
        <rect x="-100" y="-70" width="200" height="140" rx="10" fill={BLUE} />
        {[-50, 0, 50].map((x) => (
          <line key={x} x1={x} y1="-70" x2={x} y2="70" stroke="#9fb3ff" strokeWidth="4" />
        ))}
        <line x1="-100" y1="0" x2="100" y2="0" stroke="#9fb3ff" strokeWidth="4" />
      </g>
    );
  if (i === 2) {
    const fill = k(f, 120, 200);
    return (
      <g>
        <rect x="-60" y="-100" width="120" height="200" rx="18" fill="none" stroke={INK} strokeWidth="10" />
        <rect x="-24" y="-120" width="48" height="18" rx="6" fill={INK} />
        <rect x="-44" y={84 - 168 * fill} width="88" height={168 * fill} rx="8" fill="#2fb36a" />
      </g>
    );
  }
  return (
    <g>
      <path d="M-100 0 L0 -90 L100 0 L100 100 L-100 100 Z" fill="none" stroke={INK} strokeWidth="10" strokeLinejoin="round" />
      <rect x="-26" y="30" width="52" height="70" fill={k(f, 190, 210) > 0.5 ? '#ffc72c' : '#dfe3ef'} />
    </g>
  );
}

export default function Explainer(_: ResultProps) {
  const f = useCurrentFrame();
  const title = k(f, 0, 26);
  return (
    <AbsoluteFill style={{background: '#f6f7fb', overflow: 'hidden', fontFamily: 'Inter, sans-serif'}}>
      <div style={{position: 'absolute', left: 140, top: 120, color: INK, opacity: title, transform: `translateY(${(1 - title) * 14}px)`}}>
        <div style={{fontSize: 64, fontWeight: 800, letterSpacing: '-0.03em'}}>How rooftop solar works</div>
      </div>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        {NODES.slice(0, -1).map((n, i) => {
          const a = 20 + i * 36;
          const d = k(f, a, a + 30, inOut);
          const x0 = n.x + 150, x1 = NODES[i + 1].x - 150;
          return (
            <g key={i}>
              <line x1={x0} y1={Y} x2={x0 + (x1 - x0) * d} y2={Y} stroke={BLUE} strokeWidth="8" strokeLinecap="round" strokeDasharray="2 22" />
              {d >= 1 &&
                [0, 1, 2].map((j) => {
                  const p = ((f - a - 30) / 50 + j / 3) % 1;
                  return <circle key={j} cx={x0 + (x1 - x0) * p} cy={Y} r="11" fill={BLUE} opacity={Math.sin(p * Math.PI)} />;
                })}
            </g>
          );
        })}
        {NODES.map((n, i) => {
          const s = sp(f, i * 36, {damping: 13, stiffness: 180, mass: 0.8});
          return (
            <g key={n.label} transform={`translate(${n.x} ${Y}) scale(${s})`}>
              <circle r="150" fill="#ffffff" stroke="#e2e6f2" strokeWidth="4" />
              <Icon i={i} f={f} />
              <text y="240" textAnchor="middle" fontSize="40" fontWeight="700" fill={INK}>
                {i + 1}. {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
}
