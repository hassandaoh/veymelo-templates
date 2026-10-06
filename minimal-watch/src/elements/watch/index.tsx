import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {inOut, k, ResultProps} from '../../kit';

// Minimal: a watch. Bone white, graphite, one red hand. Instrument Serif + Inter.
export default function Watch(_: ResultProps) {
  const f = useCurrentFrame();
  const push = 1 + 0.07 * k(f, 0, 300, inOut);
  const min = 300 + f * 1.4; // a time-lapse: the minute hand sweeps
  const hour = 300 / 12 + f * 1.4 / 12 + 120;
  const sec = f * 6;
  const sweep = -300 + 900 * k(f, 10, 120, inOut);
  const words = k(f, 30, 70);
  return (
    <AbsoluteFill style={{background: '#f2f0eb', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${push})`}}>
        <div style={{position: 'absolute', left: 680 - 130, top: -40, width: 260, height: 1160, borderRadius: 40, background: '#2a2a2c'}} />
        <div style={{position: 'absolute', left: 680 - 300, top: 470 - 300, width: 600, height: 600, borderRadius: '50%', background: 'linear-gradient(145deg, #f7f5f0, #cfcac0)', boxShadow: '0 30px 60px rgba(40,30,20,0.25)'}} />
        <svg width="1080" height="1080" style={{position: 'absolute', inset: 0, transform: 'translateX(140px)'}}>
          <defs>
            <clipPath id="r08c">
              <circle cx="540" cy="470" r="262" />
            </clipPath>
            <linearGradient id="r08s" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="540" cy="470" r="262" fill="#fbfaf7" />
          {Array.from({length: 60}).map((_, i) => {
            const a = (i / 60) * Math.PI * 2;
            const big = i % 5 === 0;
            const r0 = big ? 220 : 236, r1 = 248;
            return <line key={i} x1={540 + Math.sin(a) * r0} y1={470 - Math.cos(a) * r0} x2={540 + Math.sin(a) * r1} y2={470 - Math.cos(a) * r1} stroke="#1c1c1e" strokeWidth={big ? 6 : 2} />;
          })}
          <text x="540" y="400" textAnchor="middle" fontFamily="Inter" fontWeight="500" fontSize="22" letterSpacing="9" fill="#1c1c1e">
            MERIDIAN
          </text>
          <g transform={`rotate(${hour} 540 470)`}>
            <rect x="534" y="330" width="12" height="150" rx="6" fill="#1c1c1e" />
          </g>
          <g transform={`rotate(${min} 540 470)`}>
            <rect x="536" y="250" width="8" height="230" rx="4" fill="#1c1c1e" />
          </g>
          <g transform={`rotate(${sec} 540 470)`}>
            <rect x="538.5" y="240" width="3" height="270" fill="#e0352b" />
          </g>
          <circle cx="540" cy="470" r="12" fill="#e0352b" />
          <rect x={540 + sweep} y="150" width="160" height="640" fill="url(#r08s)" transform="rotate(20 540 470)" clipPath="url(#r08c)" />
        </svg>
      </div>
      <div style={{position: 'absolute', left: 70, top: 800, color: '#1c1c1e', opacity: words, transform: `translateY(${(1 - words) * 16}px)`}}>
        <div style={{fontFamily: "'Instrument Serif', serif", fontSize: 96, lineHeight: 1}}>
          Hours,
          <br />
          refined.
        </div>
      </div>
    </AbsoluteFill>
  );
}
