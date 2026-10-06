import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {inOut, k, ResultProps} from '../../kit';

// Infographic: a year of growth as a clean chart. Deep teal, mint. Inter.
const BG = '#0d2a2c';
const MINT = '#7ef0c6';
const SOFT = 'rgba(214, 245, 235, 0.55)';
// $M a month for a sample client; Jan 1.25 → Dec 3.55 is +184%.
const DATA = [1.25, 1.31, 1.42, 1.5, 1.63, 1.78, 1.95, 2.18, 2.41, 2.77, 3.12, 3.55];
const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const X0 = 170, X1 = 1220, Y0 = 860, Y1 = 330, MAX = 4;
const px = (i: number) => X0 + ((X1 - X0) * i) / (DATA.length - 1);
const py = (v: number) => Y0 - ((Y0 - Y1) * v) / MAX;

function smoothPath(pts: [number, number][]) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`;
  }
  return d;
}

export default function Infographic(_: ResultProps) {
  const f = useCurrentFrame();
  const draw = k(f, 6, 96, inOut);
  const pts = DATA.map((v, i) => [px(i), py(v)] as [number, number]);
  const line = smoothPath(pts);
  const area = `${line} L${X1} ${Y0} L${X0} ${Y0} Z`;
  // the tip of the line: interpolate along the data by the drawn share
  const pos = draw * (DATA.length - 1);
  const i0 = Math.floor(pos), i1 = Math.min(DATA.length - 1, i0 + 1);
  const tv = DATA[i0] + (DATA[i1] - DATA[i0]) * (pos - i0);
  const tx = px(pos);
  const growth = Math.round(((tv - DATA[0]) / DATA[0]) * 100);
  const title = k(f, 0, 24);
  return (
    <AbsoluteFill style={{background: BG, fontFamily: 'Inter, sans-serif', color: '#fff', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: X0, top: 120, opacity: title, transform: `translateY(${(1 - title) * 14}px)`}}>
        <div style={{fontSize: 52, fontWeight: 700, letterSpacing: '-0.02em'}}>Northwind revenue, 2026</div>
        <div style={{fontSize: 30, fontWeight: 500, color: SOFT, marginTop: 10}}>$ millions a month</div>
      </div>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="r04a" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={MINT} stopOpacity="0.32" />
            <stop offset="1" stopColor={MINT} stopOpacity="0" />
          </linearGradient>
          <clipPath id="r04c">
            <rect x="0" y="0" width={tx} height="1080" />
          </clipPath>
        </defs>
        {[1, 2, 3, 4].map((v) => (
          <g key={v}>
            <line x1={X0} x2={X1} y1={py(v)} y2={py(v)} stroke="rgba(255,255,255,0.09)" strokeWidth="2" />
            <text x={X0 - 28} y={py(v) + 10} fill={SOFT} fontSize="28" textAnchor="end" fontWeight="500">
              {v}
            </text>
          </g>
        ))}
        <line x1={X0} x2={X1} y1={Y0} y2={Y0} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        {MONTHS.map((m, i) => (
          <text key={i} x={px(i)} y={Y0 + 50} fill={SOFT} fontSize="26" textAnchor="middle" fontWeight="500">
            {m}
          </text>
        ))}
        <path d={area} fill="url(#r04a)" clipPath="url(#r04c)" />
        <path d={line} fill="none" stroke={MINT} strokeWidth="8" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
        <circle cx={tx} cy={py(tv)} r={16} fill={BG} stroke={MINT} strokeWidth="7" />
      </svg>
      <div style={{position: 'absolute', left: 1300, top: 400}}>
        <div style={{fontSize: 176, fontWeight: 800, letterSpacing: '-0.05em', color: MINT, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>
          +{growth}%
        </div>
        <div style={{fontSize: 34, fontWeight: 500, color: SOFT, marginTop: 18, marginLeft: 8}}>January to December</div>
      </div>
    </AbsoluteFill>
  );
}
