import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {inOut, k, ResultProps, sp} from './kit';

// Map: a travel route. Sea, sand, coral route. Inter.
const SEA = '#a9dbe3';
const LAND = '#f6ecd8';
const CORAL = '#ff6b4a';
const INK = '#1d2b33';
const ROUTE = 'M520 300 C640 380 700 520 780 600 C860 680 1000 700 1120 640 C1240 580 1300 700 1380 800';
const PINS = [
  {x: 520, y: 300, label: 'Day 1 · Bangkok', at: 10},
  {x: 1120, y: 640, label: 'Day 3 · Krabi', at: 70},
  {x: 1380, y: 800, label: 'Day 6 · Koh Lanta', at: 110},
];

export default function MapResult(_: ResultProps) {
  const f = useCurrentFrame();
  const draw = k(f, 10, 130, inOut);
  const cam = k(f, 0, 300, inOut);
  const title = k(f, 0, 30);
  return (
    <AbsoluteFill style={{background: SEA, overflow: 'hidden', fontFamily: 'Inter, sans-serif'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + 0.12 * cam}) translate(${-40 * cam}px, ${-30 * cam}px)`, transformOrigin: '55% 55%'}}>
        <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
          {/* gentle waves */}
          {Array.from({length: 9}).map((_, i) => (
            <path key={i} d={`M${-100 + ((f * 0.6 + i * 230) % 2100)} ${120 + i * 110} q20 -10 40 0 t40 0`} fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" />
          ))}
          <path d="M380 -20 C420 120 520 220 560 360 C600 480 700 520 760 640 C800 720 760 820 700 900 C660 960 620 1020 640 1100 L-20 1100 L-20 -20 Z" fill={LAND} />
          <path d="M1060 560 C1120 520 1200 540 1220 600 C1240 660 1180 700 1120 690 C1060 680 1020 610 1060 560 Z" fill={LAND} />
          <path d="M1330 740 C1380 720 1440 750 1440 800 C1440 850 1380 870 1340 850 C1300 830 1290 760 1330 740 Z" fill={LAND} />
          <path d="M120 200 C200 260 260 420 240 560" fill="none" stroke="#dcc9a6" strokeWidth="5" strokeDasharray="2 14" strokeLinecap="round" />
          <path d={ROUTE} fill="none" stroke={CORAL} strokeWidth="9" strokeLinecap="round" strokeDasharray="1" pathLength={1} strokeDashoffset={1 - draw} />
          <path d={ROUTE} fill="none" stroke={SEA} strokeWidth="5" strokeDasharray="0.012 0.012" pathLength={1} opacity={0.0} />
          {PINS.map((p) => {
            const s = sp(f, p.at, {damping: 12, stiffness: 220, mass: 0.7});
            return (
              <g key={p.label} transform={`translate(${p.x} ${p.y}) scale(${s})`}>
                <circle r="26" fill="#fff" />
                <circle r="15" fill={CORAL} />
                <rect x="36" y="-30" width={p.label.length * 19 + 36} height="60" rx="30" fill={INK} />
                <text x="54" y="11" fill="#fff" fontSize="30" fontWeight="600">
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{position: 'absolute', left: 1320, top: 140, color: INK, opacity: title, transform: `translateY(${(1 - title) * 16}px)`}}>
        <div style={{fontSize: 30, fontWeight: 600, letterSpacing: '0.2em', color: CORAL}}>ITINERARY</div>
        <div style={{fontSize: 84, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.0, marginTop: 14}}>
          7 days
          <br />
          in the south
        </div>
      </div>
    </AbsoluteFill>
  );
}
