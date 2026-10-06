import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {inOut, k, ResultProps, sp} from './kit';
import {seeded} from './three-kit';

// 2D botanical: stems draw themselves, leaves fill with colour, flowers open. Paper, sage, terracotta, blush.
const INK = '#2f3a2c';

type Stem = {x: number; h: number; bend: number; at: number; flower: string; leaves: number};
const STEMS: Stem[] = [
  {x: 330, h: 640, bend: -60, at: 0, flower: '#d9774f', leaves: 4},
  {x: 520, h: 780, bend: 40, at: 8, flower: '#f2b5a3', leaves: 5},
  {x: 700, h: 600, bend: 70, at: 16, flower: '#e3a83b', leaves: 4},
  {x: 860, h: 500, bend: -30, at: 24, flower: '#d9774f', leaves: 3},
];

const leafPath = (l: number, w: number) => `M0 0 C${w} ${-l * 0.25} ${w * 0.8} ${-l * 0.8} 0 ${-l} C${-w * 0.8} ${-l * 0.8} ${-w} ${-l * 0.25} 0 0 Z`;

export default function Botanical(_: ResultProps) {
  const f = useCurrentFrame();
  const r = seeded(11);
  const words = k(f, 70, 104);
  return (
    <AbsoluteFill style={{background: '#f5efe4', overflow: 'hidden'}}>
      <svg width="1080" height="1080" style={{position: 'absolute', inset: 0}}>
        {STEMS.map((s, i) => {
          const base: [number, number] = [s.x, 1080];
          const tip: [number, number] = [s.x + s.bend, 1080 - s.h];
          const c1: [number, number] = [s.x, 1080 - s.h * 0.4];
          const c2: [number, number] = [s.x + s.bend * 1.2, 1080 - s.h * 0.7];
          const d = `M${base[0]} ${base[1]} C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${tip[0]} ${tip[1]}`;
          const grow = k(f, s.at, s.at + 50, inOut);
          const sway = Math.sin(f / 48 + i) * 1.4 * k(f, 40, 90);
          // a point on the stem at t
          const at = (t: number): [number, number] => {
            const mt = 1 - t;
            return [
              mt * mt * mt * base[0] + 3 * mt * mt * t * c1[0] + 3 * mt * t * t * c2[0] + t * t * t * tip[0],
              mt * mt * mt * base[1] + 3 * mt * mt * t * c1[1] + 3 * mt * t * t * c2[1] + t * t * t * tip[1],
            ];
          };
          const bloom = sp(f, s.at + 46, {damping: 12, stiffness: 120, mass: 1});
          return (
            <g key={i} transform={`rotate(${sway} ${base[0]} ${base[1]})`}>
              <path d={d} fill="none" stroke="#5f7d55" strokeWidth="7" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - grow} />
              {Array.from({length: s.leaves}).map((_, j) => {
                const t = 0.25 + (j / s.leaves) * 0.6;
                const [lx, ly] = at(t);
                const side = j % 2 ? 1 : -1;
                const len = 120 + r() * 70;
                const la = s.at + 14 + j * 8;
                const draw = k(f, la, la + 26, inOut);
                const fill = k(f, la + 16, la + 40);
                const rot = side * (48 + r() * 18);
                return (
                  <g key={j} transform={`translate(${lx} ${ly}) rotate(${rot})`}>
                    <path d={leafPath(len, 34)} fill={j % 2 ? '#8fae7c' : '#6f9564'} fillOpacity={fill} stroke={INK} strokeWidth="3" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} strokeLinejoin="round" />
                    <path d={`M0 0 L0 ${-len * 0.85}`} stroke={INK} strokeWidth="2" opacity={fill * 0.6} />
                  </g>
                );
              })}
              <g transform={`translate(${tip[0]} ${tip[1]}) scale(${bloom}) rotate(${(1 - bloom) * -60})`}>
                {Array.from({length: 8}).map((_, p) => (
                  <ellipse key={p} cx="0" cy="-46" rx="26" ry="50" fill={s.flower} stroke={INK} strokeWidth="2.5" transform={`rotate(${p * 45})`} />
                ))}
                <circle r="24" fill="#f1d27a" stroke={INK} strokeWidth="2.5" />
                {[0, 1, 2, 3, 4].map((q) => (
                  <circle key={q} cx={Math.cos(q * 1.26) * 10} cy={Math.sin(q * 1.26) * 10} r="3" fill={INK} />
                ))}
              </g>
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', right: 80, top: 110, textAlign: 'right', color: '#3a2a20', opacity: words, transform: `translateY(${(1 - words) * 18}px)`}}>
        <div style={{fontFamily: "'Instrument Serif Italic', serif", fontSize: 104, lineHeight: 1}}>
          Spring,
          <br />
          in bloom.
        </div>
        <div style={{fontFamily: 'Inter, sans-serif', fontSize: 26, fontWeight: 600, letterSpacing: '0.38em', marginTop: 24, color: '#8a6a52'}}>MAISON FLORE</div>
      </div>
    </AbsoluteFill>
  );
}
