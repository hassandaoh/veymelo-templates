import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {inOut, k, ResultProps} from './kit';
import {seeded} from './three-kit';

// 2.5D: a travel film. Layered mountains at dawn in real perspective; the camera flies forward through them,
// mist drifts, birds cross, pines pass out of focus. Instrument Serif + Inter.
const P = 1000; // perspective
const LW = 3200; // layer width (wider than the frame for the drift)

function ridge(seed: number, base: number, amp: number, rough: number) {
  const r = seeded(seed);
  const ph = [r() * 6, r() * 6, r() * 6];
  const pts: string[] = [];
  for (let x = 0; x <= LW; x += 32) {
    const y = base - amp * (0.55 * Math.sin(x / 520 + ph[0]) + 0.3 * Math.sin(x / 210 + ph[1]) + 0.15 * Math.sin(x / 90 + ph[2])) - rough * r();
    pts.push(`${x} ${y.toFixed(1)}`);
  }
  return `M0 1400 L${pts.join(' L')} L${LW} 1400 Z`;
}

function pines(seed: number, n: number, base: number) {
  const r = seeded(seed);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = (i / n) * LW + r() * 60;
    const h = 260 + r() * 260;
    const w = h * 0.34;
    let d = `M${x} ${base}`;
    // a pine: stacked tiers
    for (let t = 0; t < 5; t++) {
      const ty = base - (h * (t + 1)) / 5;
      const tw = w * (1 - t * 0.17);
      d += ` L${x - tw / 2} ${ty + h / 5} L${x} ${ty} L${x + tw / 2} ${ty + h / 5}`;
    }
    d += ` L${x} ${base} Z`;
    out.push(d);
  }
  return out.join(' ');
}

const LAYERS = [
  {z: -4200, d: ridge(3, 760, 160, 6), fill: '#c99ab0', mist: 0.55},
  {z: -3000, d: ridge(5, 820, 210, 8), fill: '#a07ca6', mist: 0.5},
  {z: -2000, d: ridge(8, 880, 230, 10), fill: '#76619a', mist: 0.45},
  {z: -1200, d: ridge(13, 950, 240, 12), fill: '#4f4682', mist: 0.4},
  {z: -560, d: ridge(21, 1030, 220, 14), fill: '#302b5e', mist: 0.3},
];

export default function Mountains(_: ResultProps) {
  const f = useCurrentFrame();
  const m = k(f, 0, 330, inOut);
  const camZ = m * 760;
  const camX = -m * 120;
  const sunY = 600 - k(f, 0, 300) * 90;
  const title = k(f, 70, 110);
  const sub = k(f, 92, 126);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #1d2350 0%, #4b3f7c 30%, #b06e8f 55%, #f39a78 72%, #ffd3a2 86%)', overflow: 'hidden'}}>
      {/* the sun and its light in the haze */}
      <div style={{position: 'absolute', left: 1180 - 420, top: sunY - 420, width: 840, height: 840, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,226,186,0.55) 0%, rgba(255,200,160,0.18) 40%, rgba(255,190,150,0) 70%)'}} />
      <div style={{position: 'absolute', left: 1180 - 80, top: sunY - 80, width: 160, height: 160, borderRadius: '50%', background: '#fff1d8'}} />
      <div style={{position: 'absolute', inset: 0, perspective: `${P}px`, perspectiveOrigin: '50% 48%'}}>
        <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translate3d(${camX}px, 0, ${camZ}px)`}}>
          {LAYERS.map((L, i) => {
            const s = (P - L.z) / P;
            const drift = ((f * (0.4 + i * 0.15)) % 400) - 200;
            return (
              <div key={i} style={{position: 'absolute', left: 960 - LW / 2, top: 0, width: LW, height: 1400, transform: `translateZ(${L.z}px) scale(${s})`, transformOrigin: '50% 40%'}}>
                <svg width={LW} height={1400} viewBox={`0 0 ${LW} 1400`} style={{position: 'absolute', inset: 0}}>
                  <defs>
                    <linearGradient id={`r20g${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0.45" stopColor={L.fill} />
                      <stop offset="1" stopColor={L.fill} stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id={`r20m${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#ffe6dc" stopOpacity="0" />
                      <stop offset="0.5" stopColor="#ffe6dc" stopOpacity={L.mist} />
                      <stop offset="1" stopColor="#ffe6dc" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={L.d} fill={`url(#r20g${i})`} />
                  <rect x={drift - 400} y={1010 - i * 10} width={LW + 800} height={170} fill={`url(#r20m${i})`} />
                </svg>
              </div>
            );
          })}
          {/* birds, between the far and the middle ranges */}
          <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `translateZ(-1500px) scale(${(P + 1500) / P})`}}>
            <svg width="1920" height="1080">
              {[0, 1, 2, 3, 4].map((i) => {
                const x = -200 + ((f * 2.6 + i * 70) % 2400);
                const y = 330 + i * 26 + Math.sin(f / 30 + i) * 10;
                const flap = Math.sin(f / 4 + i * 1.3) * 9;
                return <path key={i} d={`M${x - 18} ${y - flap} Q${x - 8} ${y - 4} ${x} ${y} Q${x + 8} ${y - 4} ${x + 18} ${y - flap}`} fill="none" stroke="#2a2348" strokeWidth="3.5" strokeLinecap="round" />;
              })}
            </svg>
          </div>
          {/* pines, close: they pass out of focus */}
          <div style={{position: 'absolute', left: 960 - LW / 2, top: 0, width: LW, height: 1400, transform: `translateZ(-120px) scale(${(P + 120) / P})`, transformOrigin: '50% 40%', filter: 'blur(1.5px)'}}>
            <svg width={LW} height={1400}>
              <path d={pines(31, 30, 1180)} fill="#17143a" />
              <rect x="0" y="1170" width={LW} height="240" fill="#17143a" />
            </svg>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', color: '#fff8f0'}}>
        <div style={{fontFamily: "'Instrument Serif', serif", fontSize: 150, lineHeight: 1, opacity: title, transform: `translateY(${(1 - title) * 22}px)`, filter: `blur(${(1 - title) * 6}px)`}}>Find your quiet.</div>
        <div style={{fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 600, letterSpacing: '0.42em', marginTop: 28, opacity: sub * 0.9}}>NORDVIK LODGE · NORWAY</div>
      </div>
    </AbsoluteFill>
  );
}
