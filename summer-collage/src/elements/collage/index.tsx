import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {mix, ResultProps, sp} from '../../kit';

// Collage: a summer fashion edit. Kraft paper, terracotta, bottle green, pink sticker. Syne.
const INK = '#1d1a16';

function Piece({f, at, x, y, rot, children}: {f: number; at: number; x: number; y: number; rot: number; children: React.ReactNode}) {
  const s = sp(f, at, {damping: 11, stiffness: 190, mass: 0.8});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity: Math.min(1, s * 1.5),
        transform: `scale(${mix(1.35, 1, s)}) rotate(${mix(rot + 10, rot, s)}deg)`,
        transformOrigin: '50% 50%',
        filter: 'drop-shadow(0 10px 14px rgba(60,40,20,0.25))',
      }}
    >
      {children}
    </div>
  );
}

const Tape = ({w = 150, rot = 0}: {w?: number; rot?: number}) => (
  <div style={{width: w, height: 42, background: 'rgba(255,250,235,0.6)', transform: `rotate(${rot}deg)`}} />
);

export default function Collage(_: ResultProps) {
  const f = useCurrentFrame();
  const letters = 'SUMMER'.split('');
  const boxes = ['#1d1a16', '#f7f1e5', '#c96f4a', '#f7f1e5', '#2f5d50', '#1d1a16'];
  return (
    <AbsoluteFill style={{background: '#e7d8bf', overflow: 'hidden', fontFamily: 'Syne, sans-serif'}}>
      <Piece f={f} at={0} x={90} y={150} rot={-5}>
        <div style={{width: 470, height: 600, background: '#c96f4a', position: 'relative', overflow: 'hidden'}}>
          <svg width="470" height="600" viewBox="0 0 470 600">
            <circle cx="330" cy="120" r="70" fill="#f2b880" />
            <ellipse cx="235" cy="330" rx="200" ry="44" fill="#f3d9a4" />
            <path d="M120 330 C120 210 350 210 350 330 Z" fill="#f3d9a4" />
            <rect x="122" y="300" width="226" height="22" fill="#1d1a16" />
            <path d="M0 520 C120 470 260 560 470 500 L470 600 L0 600 Z" fill="#a85434" />
          </svg>
        </div>
      </Piece>
      <Piece f={f} at={8} x={560} y={330} rot={6}>
        <div style={{width: 400, height: 470, background: '#2f5d50', padding: 22, boxSizing: 'border-box'}}>
          <svg width="356" height="426" viewBox="0 0 356 426">
            <rect width="356" height="426" fill="#3f7a69" />
            <circle cx="110" cy="190" r="62" fill="#1d1a16" />
            <circle cx="246" cy="190" r="62" fill="#1d1a16" />
            <rect x="160" y="178" width="36" height="12" fill="#1d1a16" />
            <circle cx="92" cy="172" r="16" fill="#ffffff" opacity="0.35" />
            <circle cx="228" cy="172" r="16" fill="#ffffff" opacity="0.35" />
          </svg>
        </div>
      </Piece>
      <Piece f={f} at={14} x={150} y={130} rot={-14}>
        <Tape />
      </Piece>
      <Piece f={f} at={18} x={760} y={300} rot={22}>
        <Tape w={130} />
      </Piece>
      <Piece f={f} at={22} x={70} y={770} rot={-3}>
        <div style={{display: 'flex', gap: 8}}>
          {letters.map((l, i) => (
            <div
              key={i}
              style={{
                width: 118,
                height: 140,
                display: 'grid',
                placeItems: 'center',
                background: boxes[i],
                color: boxes[i] === '#f7f1e5' ? INK : '#f7f1e5',
                fontSize: 112,
                fontWeight: 800,
                transform: `rotate(${(i % 2 ? 4 : -3) + (i === 3 ? 6 : 0)}deg) translateY(${i % 3 === 1 ? 10 : 0}px)`,
              }}
            >
              {l}
            </div>
          ))}
        </div>
      </Piece>
      <Piece f={f} at={30} x={560} y={70} rot={2}>
        <div style={{fontSize: 140, fontWeight: 800, color: INK, letterSpacing: '-0.04em', lineHeight: 0.9}}>
          EDIT
          <br />
          ’26
        </div>
      </Piece>
      <Piece f={f} at={38} x={800} y={760} rot={-12}>
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: '#ff8fab',
            display: 'grid',
            placeItems: 'center',
            fontSize: 54,
            fontWeight: 800,
            color: INK,
            transform: `rotate(${f * 0.6}deg)`,
          }}
        >
          NEW!
        </div>
      </Piece>
    </AbsoluteFill>
  );
}
