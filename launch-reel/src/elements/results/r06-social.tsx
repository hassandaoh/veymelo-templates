import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {k, ResultProps, sp} from './kit';

// Social 9:16: a creator talking, captions on every word. Warm room, lime highlight. Inter 900.
const LIME = '#c6ff3d';
// words with their start frames (60 fps), three phrases
const PHRASES: {t: number; w: string}[][] = [
  [{t: 0, w: 'I'}, {t: 10, w: 'made'}, {t: 22, w: 'this'}],
  [{t: 40, w: 'with'}, {t: 52, w: 'one'}, {t: 64, w: 'sentence.'}],
  [{t: 96, w: 'No'}, {t: 106, w: 'timeline.'}, {t: 132, w: 'No'}, {t: 142, w: 'keyframes.'}],
];

function Person({f}: {f: number}) {
  // talking: the mouth opens with the syllables; the head sways a little
  const talk = Math.max(0, Math.sin(f / 3.1) * 0.6 + Math.sin(f / 1.7) * 0.4) * (f < 180 ? 1 : 0.2);
  const sway = Math.sin(f / 40) * 2.2;
  const blink = f % 150 > 144 ? 0.15 : 1;
  return (
    <svg width="1080" height="1300" viewBox="0 0 1080 1300" style={{position: 'absolute', left: 0, bottom: 0}}>
      <path d="M140 1300 C150 1060 300 960 540 960 C780 960 930 1060 940 1300 Z" fill="#1f6f6b" />
      <path d="M470 900 L610 900 L620 990 C580 1010 500 1010 460 990 Z" fill="#e3ad8a" />
      <g transform={`rotate(${sway} 540 900)`}>
        <path d="M330 520 C320 330 430 240 545 240 C665 240 770 330 752 530 C760 600 740 660 720 700 L360 700 C340 650 326 590 330 520 Z" fill="#2b1d16" />
        <ellipse cx="540" cy="640" rx="190" ry="235" fill="#f0c2a0" />
        <path d="M352 560 C360 400 470 350 560 360 C650 350 720 420 728 540 C700 450 610 420 540 430 C450 430 380 480 352 560 Z" fill="#2b1d16" />
        <ellipse cx="470" cy="640" rx="16" ry={18 * blink} fill="#2b1d16" />
        <ellipse cx="610" cy="640" rx="16" ry={18 * blink} fill="#2b1d16" />
        <path d="M440 600 C460 588 486 588 500 596 M580 596 C596 588 622 588 640 600" stroke="#2b1d16" strokeWidth="9" fill="none" strokeLinecap="round" />
        <ellipse cx="540" cy={765} rx={44 - talk * 6} ry={8 + talk * 26} fill="#8e3b3b" />
        <circle cx="430" cy="720" r="26" fill="#f29c8a" opacity="0.35" />
        <circle cx="650" cy="720" r="26" fill="#f29c8a" opacity="0.35" />
      </g>
    </svg>
  );
}

export default function Social(_: ResultProps) {
  const f = useCurrentFrame();
  const pi = f >= 96 ? 2 : f >= 40 ? 1 : 0;
  const phrase = PHRASES[pi];
  const pIn = sp(f, phrase[0].t, {damping: 18, stiffness: 220, mass: 0.7});
  return (
    <AbsoluteFill style={{background: '#f2dccb', overflow: 'hidden', fontFamily: 'Inter, sans-serif'}}>
      {/* the room */}
      <div style={{position: 'absolute', left: 90, top: 210, width: 420, height: 560, borderRadius: 24, background: '#fff4e8'}} />
      <div style={{position: 'absolute', left: 110, top: 230, width: 380, height: 520, borderRadius: 18, background: 'linear-gradient(180deg, #ffe6c9, #ffd2a8)'}} />
      <svg width="300" height="520" viewBox="0 0 300 520" style={{position: 'absolute', right: 40, top: 520}}>
        <path d="M150 520 L150 260" stroke="#3f6e3a" strokeWidth="8" />
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse key={i} cx={150 + (i % 2 ? 60 : -60)} cy={240 + i * 50} rx="70" ry="26" fill={i % 2 ? '#5d9a52' : '#4b8743'} transform={`rotate(${i % 2 ? -30 : 30} ${150 + (i % 2 ? 60 : -60)} ${240 + i * 50})`} />
        ))}
        <path d="M90 440 L210 440 L195 520 L105 520 Z" fill="#c9714d" />
      </svg>
      <Person f={f} />
      <div style={{position: 'absolute', left: 60, top: 90, padding: '14px 26px', borderRadius: 999, background: 'rgba(0,0,0,0.35)', color: '#fff', fontSize: 34, fontWeight: 600}}>
        @mai.makes
      </div>
      {/* captions */}
      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          top: 1460,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px 22px',
          transform: `scale(${0.85 + 0.15 * pIn})`,
          opacity: pIn,
        }}
      >
        {phrase.map((word, i) => {
          const next = phrase[i + 1]?.t ?? word.t + 30;
          const on = f >= word.t && f < next + 8;
          const shown = f >= word.t;
          return (
            <span
              key={i}
              style={{
                fontSize: 104,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                padding: '0 18px',
                borderRadius: 18,
                lineHeight: 1.15,
                background: on ? LIME : 'transparent',
                color: on ? '#111' : '#fff',
                opacity: shown ? 1 : 0,
                textShadow: on ? 'none' : '0 4px 0 #111, 0 0 18px rgba(0,0,0,0.35)',
              }}
            >
              {word.w}
            </span>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1790, textAlign: 'center', color: '#ffffff', fontSize: 34, fontWeight: 600, opacity: k(f, 150, 175)}}>made with one prompt</div>
    </AbsoluteFill>
  );
}
