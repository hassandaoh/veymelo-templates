import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {k, mix, ResultProps, sp} from './kit';

// Event poster 9:16: a countdown, then the poster. Magenta, electric blue, cream. Unbounded.
const MAG = '#ff2e88';
const BLUE = '#1d3cff';
const CREAM = '#fff4e6';

export default function Poster(_: ResultProps) {
  const f = useCurrentFrame();
  const n = f < 20 ? '03' : f < 40 ? '02' : '01';
  const local = f % 20;
  const countOn = f < 60;
  const pop = 1.25 - 0.25 * k(local, 0, 10);
  const poster = sp(f, 60, {damping: 14, stiffness: 150, mass: 1});
  const spin = f * 0.8;
  return (
    <AbsoluteFill style={{background: MAG, overflow: 'hidden', fontFamily: 'Unbounded, sans-serif'}}>
      {/* the grid */}
      {Array.from({length: 7}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: (i * 1080) / 6, top: 0, bottom: 0, width: 2, background: 'rgba(255,244,230,0.18)'}} />
      ))}
      {countOn && (
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: BLUE, fontSize: 430, fontWeight: 900, letterSpacing: '-0.06em', transform: `scale(${pop})`}}>{n}</div>
      )}
      <div style={{position: 'absolute', inset: 0, opacity: f >= 60 ? 1 : 0}}>
        <div style={{position: 'absolute', left: 70, top: 200, color: BLUE, fontWeight: 900, fontSize: 230, lineHeight: 0.86, letterSpacing: '-0.06em'}}>
          {['SOUND', 'WAVE'].map((w, i) => {
            const a = sp(f, 60 + i * 6, {damping: 15, stiffness: 160, mass: 1});
            return (
              <div key={w} style={{transform: `translateX(${(1 - a) * (i ? 900 : -900)}px)`}}>
                {w}
              </div>
            );
          })}
        </div>
        <div style={{position: 'absolute', left: 70, top: 640, fontWeight: 900, fontSize: 230, lineHeight: 0.9, letterSpacing: '-0.06em', color: 'transparent', WebkitTextStroke: `5px ${CREAM}`, opacity: k(f, 72, 90)}}>FEST</div>
        <div style={{position: 'absolute', left: 540 - 300, top: 960, width: 600, height: 600, transform: `scale(${poster}) rotate(${spin}deg)`}}>
          <svg width="600" height="600" viewBox="0 0 600 600">
            <defs>
              <path id="r12c" d="M300 300 m-230 0 a230 230 0 1 1 460 0 a230 230 0 1 1 -460 0" />
            </defs>
            <circle cx="300" cy="300" r="190" fill={BLUE} />
            <text fontSize="40" fontWeight="700" fill={CREAM}>
              <textPath href="#r12c" textLength="1430" lengthAdjust="spacing">DANCE ALL NIGHT · DANCE ALL NIGHT · DANCE ALL NIGHT ·</textPath>
            </text>
          </svg>
        </div>
        <div style={{position: 'absolute', left: 540 - 300, top: 960, width: 600, height: 600, display: 'grid', placeItems: 'center', color: CREAM, fontWeight: 900, fontSize: 120, transform: `scale(${poster})`}}>12.12</div>
        <div style={{position: 'absolute', left: 70, right: 70, bottom: 120, display: 'flex', justifyContent: 'space-between', color: CREAM, fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 40, letterSpacing: '0.12em', opacity: k(f, 86, 110), transform: `translateY(${mix(20, 0, k(f, 86, 110))}px)`}}>
          <span>BANGKOK</span>
          <span>TICKETS NOW</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}
