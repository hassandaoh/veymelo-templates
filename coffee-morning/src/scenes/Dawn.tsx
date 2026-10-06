import {COLOR} from '../content';
import type {Layout} from '../layout';
import {mix, move, prog, seeded} from '../motion';
import {T} from '../timing';

// Dawn over the town, in layers: the sun comes up behind the hills, the
// windows go dark one by one, two birds cross. Then the camera pulls back and
// this is the view from the café's window (scenes/Cafe.tsx).

type Block = {x: number; w: number; h: number; gable: boolean};
function row(key: string, width: number, minW: number, maxW: number, minH: number, maxH: number): Block[] {
  const blocks: Block[] = [];
  for (let x = -40, i = 0; x < width + 40; i++) {
    const w = mix(minW, maxW, seeded(`${key}w${i}`));
    blocks.push({x, w, h: mix(minH, maxH, seeded(`${key}h${i}`)), gable: seeded(`${key}g${i}`) > 0.55});
    x += w;
  }
  return blocks;
}

function Roofs({blocks, base, color, u, windows, f}: {blocks: Block[]; base: number; color: string; u: number; windows?: boolean; f: number}) {
  return (
    <>
      {blocks.map((b, i) => {
        const top = base - b.h;
        return (
          <div key={i}>
            <div style={{position: 'absolute', left: b.x, top, width: b.w + 1, height: 4000, background: color}} />
            {b.gable ? <div style={{position: 'absolute', left: b.x, top: top - b.w * 0.35, width: 0, height: 0, borderLeft: `${b.w / 2}px solid transparent`, borderRight: `${b.w / 2 + 1}px solid transparent`, borderBottom: `${b.w * 0.35 + 1}px solid ${color}`}} /> : <div style={{position: 'absolute', left: b.x + b.w * 0.7, top: top - 34 * u, width: 18 * u, height: 36 * u, background: color}} />}
            {windows
              ? [0, 1].map(c =>
                  [0, 1].map(r => {
                    const key = `win${i}-${c}-${r}`;
                    const off = mix(T.windows[0], T.windows[1], seeded(key));
                    const lit = seeded(key + 'on') > 0.35 && f < off;
                    return <div key={key} style={{position: 'absolute', left: b.x + b.w * (0.22 + c * 0.38), top: top + (26 + r * 54) * u, width: 18 * u, height: 26 * u, borderRadius: 3 * u, background: lit ? COLOR.window : 'rgba(60,30,15,0.28)'}} />;
                  }),
                )
              : null}
          </div>
        );
      })}
    </>
  );
}

export function Dawn({f, w, h, box}: {f: number; w: number; h: number; box: Layout}) {
  const {u, sun: rest, horizon} = box;
  const rise = prog(f, 0, T.inside, move);
  const sun = {x: rest.x, y: mix(horizon + 50 * u, rest.y, rise), r: mix(110 * u, 150 * u, rise)};
  const lean = 1 + 0.04 * rise;
  const far = row('far', w + 400, 70 * u, 150 * u, 40 * u, 110 * u);
  const near = row('near', w + 400, 110 * u, 220 * u, 90 * u, 220 * u);
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: `linear-gradient(180deg, ${COLOR.skyTop} 0%, ${COLOR.skyLow} ${(horizon / h) * 100}%, ${COLOR.hills} 100%)`}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${lean})`, transformOrigin: `${sun.x}px ${sun.y}px`}}>
        <div style={{position: 'absolute', left: sun.x - sun.r * 2.4, top: sun.y - sun.r * 2.4, width: sun.r * 4.8, height: sun.r * 4.8, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,190,120,0.55), rgba(255,190,120,0) 70%)`}} />
        <div style={{position: 'absolute', left: sun.x - sun.r, top: sun.y - sun.r, width: sun.r * 2, height: sun.r * 2, borderRadius: '50%', background: COLOR.sun}} />
        <div>
          <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
            <path d={`M0 ${horizon} ${Array.from({length: 9}, (_, i) => `Q ${(i + 0.5) * (w / 8)} ${horizon - (i % 2 ? 60 : 10) * u} ${(i + 1) * (w / 8)} ${horizon - 20 * u}`).join(' ')} L ${w} ${h} L 0 ${h} Z`} fill={COLOR.hills} />
          </svg>
          <div style={{position: 'absolute', inset: 0, transform: `translateX(${-rise * 30 * u}px)`}}>
            <Roofs blocks={far} base={horizon + 70 * u} color={COLOR.roofsFar} u={u} f={f} />
          </div>
          <div style={{position: 'absolute', inset: 0, transform: `translateX(${-rise * 70 * u}px)`}}>
            <Roofs blocks={near} base={horizon + 260 * u} color={COLOR.roofsNear} u={u} windows f={f} />
          </div>
          {[0, 1].map(i => {
            const t = prog(f, T.birds + i * 12, 150, (x: number) => x);
            if (t <= 0 || t >= 1) return null;
            const flap = Math.sin(f / 4 + i * 2) * 8 * u;
            const x = mix(-80 * u, w + 80 * u, t);
            const y = h * 0.28 + i * 30 * u + Math.sin(t * 6 + i) * 14 * u;
            return <svg key={i} width={60 * u} height={40 * u} style={{position: 'absolute', left: x, top: y}} viewBox={`0 0 ${60 * u} ${40 * u}`}><path d={`M ${4 * u} ${20 * u - flap} Q ${18 * u} ${16 * u} ${30 * u} ${24 * u} Q ${42 * u} ${16 * u} ${56 * u} ${20 * u - flap}`} fill="none" stroke={COLOR.espresso} strokeWidth={3 * u} strokeLinecap="round" opacity={0.7} /></svg>;
          })}
        </div>
      </div>
    </div>
  );
}
