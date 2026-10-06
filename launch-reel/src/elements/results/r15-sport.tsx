import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {k, ResultProps, sp} from './kit';

// Sport stats 9:16: a player card, numbers racing. Pitch green, lime. Anton + Inter.
const LIME = '#e6ff4f';
const STATS = [
  {label: 'GOALS', value: 27, max: 30, unit: ''},
  {label: 'ASSISTS', value: 14, max: 30, unit: ''},
  {label: 'PASS ACCURACY', value: 91, max: 100, unit: '%'},
];

export default function Sport(_: ResultProps) {
  const f = useCurrentFrame();
  const num = sp(f, 0, {damping: 16, stiffness: 110, mass: 1});
  const name = k(f, 10, 34);
  return (
    <AbsoluteFill style={{background: '#0e3a28', overflow: 'hidden', fontFamily: 'Anton, sans-serif'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}} opacity="0.16">
        <rect x="80" y="80" width="920" height="1760" fill="none" stroke="#fff" strokeWidth="5" />
        <line x1="80" y1="960" x2="1000" y2="960" stroke="#fff" strokeWidth="5" />
        <circle cx="540" cy="960" r="170" fill="none" stroke="#fff" strokeWidth="5" />
        <rect x="300" y="80" width="480" height="260" fill="none" stroke="#fff" strokeWidth="5" />
      </svg>
      <div style={{position: 'absolute', right: -40, top: 60, fontSize: 900, lineHeight: 1, color: 'transparent', WebkitTextStroke: `6px ${LIME}`, opacity: 0.9, transform: `translateY(${(1 - num) * 300}px)`}}>10</div>
      <div style={{position: 'absolute', left: 90, top: 760, color: '#fff', opacity: name, transform: `translateY(${(1 - name) * 30}px)`}}>
        <div style={{fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 34, letterSpacing: '0.3em', color: LIME}}>SEASON 25/26</div>
        <div style={{fontSize: 190, lineHeight: 1, marginTop: 12, letterSpacing: '0.01em'}}>K. ARUN</div>
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 1120}}>
        {STATS.map((s, i) => {
          const g = k(f, 30 + i * 10, 90 + i * 10);
          const v = Math.round(s.value * g);
          return (
            <div key={s.label} style={{marginBottom: 56}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', color: '#fff'}}>
                <span style={{fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 32, letterSpacing: '0.2em'}}>{s.label}</span>
                <span style={{fontSize: 110, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: i === 0 ? LIME : '#fff'}}>
                  {v}
                  {s.unit}
                </span>
              </div>
              <div style={{height: 18, borderRadius: 9, background: 'rgba(255,255,255,0.14)', marginTop: 14}}>
                <div style={{height: '100%', width: `${(s.value / s.max) * 100 * g}%`, borderRadius: 9, background: i === 0 ? LIME : '#ffffff'}} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
