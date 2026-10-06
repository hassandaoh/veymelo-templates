import type {ReactNode} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {k, ResultProps, sp} from '../../kit';

// 2D isometric: a little city builds itself for a delivery app; cars run the roads, a drone carries a parcel.
// Mint ground, pastel blocks, ink roads. Space Grotesk.
const U = 64;
const OX = 1230, OY = 230;
const iso = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * U * 0.866, OY + (x + y) * U * 0.5 - z * U];
const pt = (p: [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
const poly = (ps: [number, number][]) => ps.map(pt).join(' ');

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c * (1 - amt))));
  return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
}

function Box({x, y, w, d, h, color, windows = false, z = 0}: {x: number; y: number; w: number; d: number; h: number; color: string; windows?: boolean; z?: number}) {
  const top = [iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
  const left = [iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
  const right = [iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)];
  const wins: ReactNode[] = [];
  if (windows && h > 0.6) {
    const rows = Math.floor(h / 0.55);
    for (let r = 0; r < rows; r++) {
      const zz = z + 0.3 + r * 0.55;
      if (zz + 0.25 > z + h) break;
      for (let c = 0; c < Math.floor(w / 0.5); c++) {
        const xx = x + 0.15 + c * 0.5;
        wins.push(<polygon key={`l${r}-${c}`} points={poly([iso(xx, y + d, zz), iso(xx + 0.25, y + d, zz), iso(xx + 0.25, y + d, zz + 0.25), iso(xx, y + d, zz + 0.25)])} fill={(r + c) % 3 ? '#ffffff' : '#ffe08a'} opacity={0.75} />);
      }
      for (let c = 0; c < Math.floor(d / 0.5); c++) {
        const yy = y + 0.15 + c * 0.5;
        wins.push(<polygon key={`r${r}-${c}`} points={poly([iso(x + w, yy, zz), iso(x + w, yy + 0.25, zz), iso(x + w, yy + 0.25, zz + 0.25), iso(x + w, yy, zz + 0.25)])} fill={(r + c) % 4 ? '#ffffff' : '#ffe08a'} opacity={0.6} />);
      }
    }
  }
  return (
    <g>
      <polygon points={poly(left)} fill={shade(color, 0.12)} />
      <polygon points={poly(right)} fill={shade(color, 0.26)} />
      <polygon points={poly(top)} fill={color} />
      {wins}
    </g>
  );
}

const BUILDINGS = [
  {x: 0.4, y: 0.4, w: 2, d: 2, h: 3.2, color: '#a9c7ff'},
  {x: 0.4, y: 3.0, w: 2, d: 1.6, h: 1.8, color: '#ffc9a3'},
  {x: 0.6, y: 7.4, w: 1.8, d: 2.2, h: 2.6, color: '#ffb3b3'},
  {x: 5.4, y: 0.4, w: 2.2, d: 1.6, h: 4.4, color: '#c8b6ff'},
  {x: 8.4, y: 0.6, w: 1.6, d: 1.6, h: 2.2, color: '#fff1a8'},
  {x: 5.4, y: 7.4, w: 1.6, d: 2.0, h: 1.6, color: '#b9f0cf'},
  {x: 8.0, y: 7.2, w: 2.0, d: 2.4, h: 3.6, color: '#ffc9a3'},
  {x: 0.5, y: 5.0, w: 1.4, d: 1.2, h: 1.2, color: '#fff1a8'},
  {x: 8.6, y: 3.2, w: 1.4, d: 1.4, h: 1.4, color: '#a9c7ff'},
];
const TREES: [number, number][] = [[3.3, 0.6], [3.4, 2.4], [6.2, 3.2], [7.0, 2.6], [9.5, 5.2], [6.0, 9.6], [3.2, 9.3], [2.6, 5.4]];

export default function IsoCity(_: ResultProps) {
  const f = useCurrentFrame();
  // cars on the two roads (x = 4..5 runs along y, y = 6..7 runs along x)
  const cars = [
    {x: 4.15, y: ((f * 0.05) % 13) - 1.5, c: '#ff6b5a', dir: 'y'},
    {x: 4.55, y: 11 - ((f * 0.04 + 5) % 13), c: '#2f4bd6', dir: 'y'},
    {x: ((f * 0.045 + 3) % 13) - 1.5, y: 6.15, c: '#ffc23d', dir: 'x'},
    {x: 11 - ((f * 0.055) % 13), y: 6.55, c: '#ffffff', dir: 'x'},
  ];
  type Item = {depth: number; node: ReactNode};
  const items: Item[] = [];
  BUILDINGS.forEach((b, i) => {
    const s = sp(f, 4 + (b.x + b.y) * 3, {damping: 13, stiffness: 120, mass: 0.9});
    items.push({depth: b.x + b.w + b.y + b.d, node: <Box key={`b${i}`} {...b} h={Math.max(0.01, b.h * s)} windows />});
  });
  TREES.forEach(([x, y], i) => {
    const s = sp(f, 20 + i * 4, {damping: 11, stiffness: 200, mass: 0.6});
    const [tx, ty] = iso(x, y, 0);
    items.push({
      depth: x + y + 0.6,
      node: (
        <g key={`t${i}`} transform={`translate(${tx} ${ty}) scale(${s})`}>
          <rect x="-3" y="-26" width="6" height="26" fill="#8a5a3c" />
          <circle cx="0" cy="-40" r="22" fill="#52b06d" />
          <circle cx="-7" cy="-46" r="9" fill="#7cd08f" />
        </g>
      ),
    });
  });
  cars.forEach((c, i) => {
    const w = c.dir === 'x' ? 0.7 : 0.32, d = c.dir === 'x' ? 0.32 : 0.7;
    items.push({depth: c.x + w + c.y + d, node: <Box key={`c${i}`} x={c.x} y={c.y} w={w} d={d} h={0.28} color={c.c} />});
  });
  items.sort((a, b) => a.depth - b.depth);
  // the drone and its parcel
  const dp = (f * 0.012) % 1;
  const [dx, dy] = iso(1 + dp * 9, 9 - dp * 8, 5.4 + Math.sin(f / 14) * 0.15);
  const ground = [iso(-0.2, -0.2), iso(10.6, -0.2), iso(10.6, 10.6), iso(-0.2, 10.6)];
  const groundIn = k(f, 0, 20);
  const title = k(f, 30, 60);
  return (
    <AbsoluteFill style={{background: '#f3efe6', overflow: 'hidden', fontFamily: "'Space Grotesk', sans-serif"}}>
      {[0, 1, 2].map((i) => {
        const x = ((f * (0.5 + i * 0.2) + i * 700) % 2400) - 300;
        return <div key={i} style={{position: 'absolute', left: x, top: 90 + i * 70, width: 220, height: 64, borderRadius: 40, background: '#ffffff', opacity: 0.85}} />;
      })}
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, opacity: groundIn}}>
        <polygon points={poly([iso(-0.2, -0.2, -0.35), iso(10.6, -0.2, -0.35), iso(10.6, 10.6, -0.35), iso(-0.2, 10.6, -0.35)])} fill="#9ccdb0" transform="translate(0 0)" />
        <polygon points={poly(ground)} fill="#cdebd8" />
        <polygon points={poly([iso(10.6, -0.2), iso(10.6, 10.6), iso(10.6, 10.6, -0.35), iso(10.6, -0.2, -0.35)])} fill="#8fbfa3" />
        <polygon points={poly([iso(-0.2, 10.6), iso(10.6, 10.6), iso(10.6, 10.6, -0.35), iso(-0.2, 10.6, -0.35)])} fill="#a9d6bb" />
        {/* roads */}
        <polygon points={poly([iso(4, -0.2), iso(5, -0.2), iso(5, 10.6), iso(4, 10.6)])} fill="#4b5372" />
        <polygon points={poly([iso(-0.2, 6), iso(10.6, 6), iso(10.6, 7), iso(-0.2, 7)])} fill="#4b5372" />
        {Array.from({length: 11}).map((_, i) => (
          <g key={i}>
            <polygon points={poly([iso(4.47, i, 0), iso(4.53, i, 0), iso(4.53, i + 0.5, 0), iso(4.47, i + 0.5, 0)])} fill="#f6f1e4" />
            <polygon points={poly([iso(i, 6.47, 0), iso(i + 0.5, 6.47, 0), iso(i + 0.5, 6.53, 0), iso(i, 6.53, 0)])} fill="#f6f1e4" />
          </g>
        ))}
        {items.map((it) => it.node)}
        <g transform={`translate(${dx} ${dy})`}>
          <line x1="0" y1="6" x2="0" y2="30" stroke="#1f2140" strokeWidth="2" />
          <rect x="-12" y="30" width="24" height="20" rx="3" fill="#d9a066" />
          <rect x="-26" y="-4" width="52" height="10" rx="5" fill="#1f2140" />
          {[-30, 30].map((x) => (
            <ellipse key={x} cx={x} cy={-8} rx={14} ry={3} fill="#1f2140" opacity={0.5 + 0.5 * Math.abs(Math.sin(f / 1.5 + x))} />
          ))}
        </g>
      </svg>
      <div style={{position: 'absolute', left: 120, top: 150, color: '#1f2140', opacity: title, transform: `translateY(${(1 - title) * 20}px)`}}>
        <div style={{fontSize: 120, fontWeight: 700, lineHeight: 0.98, letterSpacing: '-0.04em'}}>
          Anything,
          <br />
          delivered.
        </div>
        <div style={{fontSize: 34, fontWeight: 500, marginTop: 26, color: '#4b5372'}}>Hopp — the whole city in 20 minutes</div>
      </div>
    </AbsoluteFill>
  );
}
