import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {k, mix, ResultProps, sp} from '../../kit';

// Motion graphics: a sneaker launch. Cream, hot orange, ink. Space Grotesk.
const CREAM = '#f2ebdf';
const ORANGE = '#ff5a1f';
const INK = '#141414';

export function Shoe({w, upper = '#fbf7ef', toe = '#ebe3d4', bolt = ORANGE}: {w: number; upper?: string; toe?: string; bolt?: string}) {
  return (
    <svg width={w} height={w / 2} viewBox="0 0 400 200" style={{display: 'block', overflow: 'visible'}}>
      <ellipse cx="206" cy="190" rx="170" ry="9" fill="#000" opacity="0.12" />
      <path d="M18 146 C18 168 30 176 52 176 L356 176 C382 176 394 166 394 148 L394 140 L18 140 Z" fill="#fffdf8" />
      <rect x="22" y="152" width="370" height="7" fill="#e6dccb" />
      <path d="M36 176 L372 176" stroke={INK} strokeWidth="5" />
      <path d="M24 142 L36 100 C42 80 58 70 82 68 L148 62 C162 46 186 38 214 37 L242 36 C258 36 266 46 272 58 L292 96 C326 106 356 114 378 122 C392 128 396 136 394 142 Z" fill={upper} />
      <path d="M292 96 C326 106 356 114 378 122 C392 128 396 136 394 142 L302 142 C302 122 298 108 292 96 Z" fill={toe} />
      <path d="M24 142 L36 100 C42 80 58 70 82 68 L98 68 C86 92 84 120 92 142 Z" fill={INK} />
      <path d="M148 62 C162 46 186 38 214 37 L242 36 C258 36 266 46 272 58 C250 52 214 54 186 62 C172 66 158 66 148 62 Z" fill={INK} />
      <path d="M118 130 L168 94 L176 108 L236 74 L226 99 L272 88 L188 134 L182 118 Z" fill={bolt} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={204 + i * 18} y1={50 + i * 9} x2={222 + i * 18} y2={66 + i * 8} stroke={INK} strokeWidth="5" strokeLinecap="round" />
      ))}
      <rect x="40" y="70" width="14" height="26" rx="4" fill={ORANGE} />
    </svg>
  );
}

function Screen({variant, f}: {variant: number; f: number}) {
  const a = k(f, 0, 24);
  const s = sp(f, 0, {damping: 15, stiffness: 120, mass: 1});
  const bg = variant === 4 ? INK : CREAM;
  return (
    <AbsoluteFill style={{background: bg, overflow: 'hidden', fontFamily: "'Space Grotesk', sans-serif"}}>
      {variant === 0 && (
        <>
          <div style={{position: 'absolute', left: 1280 - 440, top: 80, width: 880, height: 880, borderRadius: '50%', background: ORANGE, transform: `scale(${s})`}} />
          <div style={{position: 'absolute', left: 130, top: 300, color: INK, fontWeight: 700, fontSize: 230, lineHeight: 0.9, letterSpacing: '-0.05em', opacity: a}}>
            NEW
            <br />
            DROP
          </div>
        </>
      )}
      {variant === 1 && (
        <>
          <div style={{position: 'absolute', left: 960 - 380, top: 540 - 380, width: 760, height: 760, borderRadius: '50%', background: ORANGE, transform: `scale(${s})`}} />
          <div style={{position: 'absolute', left: 300, top: 250, transform: `translateX(${(1 - s) * 400}px) rotate(-8deg)`}}>
            <Shoe w={1320} />
          </div>
        </>
      )}
      {variant === 2 && (
        <>
          <div style={{position: 'absolute', left: -520, top: -260, transform: `scale(${1 + 0.06 * a})`}}>
            <Shoe w={2600} />
          </div>
          {[
            {x: 1060, y: 430, t: 'Knit upper'},
            {x: 520, y: 860, t: 'Foam sole'},
          ].map((c, i) => (
            <div key={c.t} style={{position: 'absolute', left: c.x, top: c.y, display: 'flex', alignItems: 'center', gap: 16, opacity: k(f, 10 + i * 8, 30 + i * 8)}}>
              <div style={{width: 22, height: 22, borderRadius: '50%', background: INK, boxShadow: `0 0 0 8px ${CREAM}`}} />
              <div style={{padding: '12px 24px', borderRadius: 999, background: INK, color: CREAM, fontSize: 40, fontWeight: 700}}>{c.t}</div>
            </div>
          ))}
        </>
      )}
      {variant === 3 && (
        <div style={{position: 'absolute', left: 90, right: 90, top: 330, display: 'flex', justifyContent: 'space-between'}}>
          {[
            {upper: '#fbf7ef', toe: '#ebe3d4', bolt: ORANGE},
            {upper: '#232323', toe: '#111111', bolt: ORANGE},
            {upper: ORANGE, toe: '#e5461a', bolt: CREAM},
          ].map((c, i) => {
            const d = sp(f, i * 6, {damping: 14, stiffness: 160, mass: 0.9});
            return (
              <div key={i} style={{transform: `translateY(${(1 - d) * 120}px)`, opacity: Math.min(1, d * 1.5)}}>
                <Shoe w={540} {...c} />
              </div>
            );
          })}
        </div>
      )}
      {variant === 4 && (
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: a}}>
          <div style={{fontSize: 260, fontWeight: 700, letterSpacing: '-0.05em', color: CREAM, lineHeight: 1}}>AIR-01</div>
          <div style={{fontSize: 70, fontWeight: 700, color: ORANGE, marginTop: 30}}>drops 10.24</div>
        </div>
      )}
    </AbsoluteFill>
  );
}

export default function Sneaker({w, h, edit = 0, variant}: ResultProps) {
  const f = useCurrentFrame();
  if (variant !== undefined) return <Screen variant={variant} f={f} />;
  const disc = sp(f, 0, {damping: 16, stiffness: 120, mass: 1});
  const shoeIn = sp(f, 8, {damping: 15, stiffness: 110, mass: 1.1});
  const bob = Math.sin((f - 40) / 26) * 8 * k(f, 40, 70);
  const titleSize = 190 * (1 + 0.32 * edit);
  const line = (i: number) => k(f, 10 + i * 6, 34 + i * 6);
  const sub = k(f, 34, 58);
  const price = sp(f, 50, {damping: 13, stiffness: 180, mass: 0.8});
  const marquee = (f * 1.6) % 520;
  return (
    <AbsoluteFill style={{background: CREAM, overflow: 'hidden', fontFamily: "'Space Grotesk', sans-serif"}}>
      <div
        style={{
          position: 'absolute',
          left: 1280 - 440,
          top: 520 - 440,
          width: 880,
          height: 880,
          borderRadius: '50%',
          background: ORANGE,
          transform: `scale(${disc})`,
        }}
      />
      {/* speed lines, gone as the shoe lands */}
      {[0, 1, 2].map((i) => {
        const len = (1 - shoeIn) * 900;
        return (
          <div key={i} style={{position: 'absolute', left: 1500 + i * 40, top: 420 + i * 70, width: Math.max(0, len), height: 10, borderRadius: 5, background: INK, opacity: 0.85 - i * 0.2}} />
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: 830,
          top: 300 + bob,
          transform: `translateX(${(1 - shoeIn) * 900}px) rotate(${mix(-16, -7, shoeIn)}deg)`,
          transformOrigin: '50% 60%',
        }}
      >
        <Shoe w={900} />
      </div>
      <div style={{position: 'absolute', left: 130, top: 170, color: INK, fontWeight: 700, fontSize: titleSize, lineHeight: 0.9, letterSpacing: '-0.05em'}}>
        {['NEW', 'DROP'].map((word, i) => (
          <div key={word} style={{overflow: 'hidden', paddingBottom: 6}}>
            <div style={{transform: `translateY(${(1 - line(i)) * 110}%)`}}>{word}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 136, top: 170 + titleSize * 1.86 + 24, fontSize: 42, fontWeight: 500, color: INK, opacity: sub, transform: `translateY(${(1 - sub) * 16}px)`}}>
        AIR-01 · drops 10.24
      </div>
      <div
        style={{
          position: 'absolute',
          left: 136,
          top: 820,
          padding: '18px 34px',
          borderRadius: 999,
          background: INK,
          color: CREAM,
          fontSize: 40,
          fontWeight: 700,
          transform: `scale(${price})`,
          transformOrigin: '0% 50%',
        }}
      >
        $129
      </div>
      <div style={{position: 'absolute', left: -marquee, bottom: 26, whiteSpace: 'nowrap', fontSize: 30, fontWeight: 700, letterSpacing: '0.2em', color: INK, opacity: 0.35}}>
        {'NEW DROP · AIR-01 · '.repeat(14)}
      </div>
    </AbsoluteFill>
  );
}
