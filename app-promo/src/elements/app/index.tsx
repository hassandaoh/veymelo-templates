import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {inOut, k, mix, ResultProps, sp} from '../../kit';

// App promo 9:16: a money app. Soft sage, deep green, white phone. Space Grotesk.
const GREEN = '#0f4d3a';
const SAGE = '#dfeee4';

export default function App(_: ResultProps) {
  const f = useCurrentFrame();
  const phone = sp(f, 0, {damping: 18, stiffness: 120, mass: 1});
  const scroll = k(f, 70, 150, inOut) * 260;
  const bal = mix(0, 12480.2, k(f, 10, 60));
  const note = sp(f, 100, {damping: 16, stiffness: 200, mass: 0.8});
  const head = k(f, 0, 30);
  const bars = [0.42, 0.65, 0.5, 0.82, 0.58, 0.95, 0.72];
  return (
    <AbsoluteFill style={{background: SAGE, overflow: 'hidden', fontFamily: "'Space Grotesk', sans-serif"}}>
      <div style={{position: 'absolute', left: 90, right: 90, top: 150, color: GREEN, fontSize: 92, fontWeight: 700, lineHeight: 1.02, letterSpacing: '-0.03em', opacity: head, transform: `translateY(${(1 - head) * 20}px)`}}>
        Your money,
        <br />
        at a glance.
      </div>
      <div
        style={{
          position: 'absolute',
          left: 540 - 330,
          top: 520,
          width: 660,
          height: 1340,
          borderRadius: 90,
          background: '#101312',
          padding: 22,
          boxSizing: 'border-box',
          transform: `translateY(${(1 - phone) * 600}px) rotate(${(1 - phone) * 6}deg)`,
          boxShadow: '0 40px 80px rgba(15,77,58,0.25)',
        }}
      >
        <div style={{width: '100%', height: '100%', borderRadius: 70, background: '#fbfcfb', overflow: 'hidden', position: 'relative'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: -scroll, padding: '90px 46px'}}>
            <div style={{fontSize: 32, color: '#6a7a72'}}>Good morning, Ana</div>
            <div style={{fontSize: 86, fontWeight: 700, color: GREEN, marginTop: 8, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em'}}>
              ${bal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
            <div style={{marginTop: 40, height: 280, borderRadius: 36, background: GREEN, padding: 30, boxSizing: 'border-box', display: 'flex', alignItems: 'flex-end', gap: 18}}>
              {bars.map((b, i) => (
                <div key={i} style={{flex: 1, height: `${b * 100 * k(f, 20 + i * 4, 60 + i * 4)}%`, borderRadius: 12, background: i === 5 ? '#b9f5c9' : 'rgba(255,255,255,0.28)'}} />
              ))}
            </div>
            {[
              ['Groceries', '−$62.40'],
              ['Salary', '+$3,200.00'],
              ['Coffee', '−$4.80'],
              ['Rent', '−$1,150.00'],
              ['Savings', '+$240.00'],
            ].map(([a, b], i) => (
              <div key={a} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 0', borderBottom: '2px solid #edf1ee', fontSize: 34}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
                  <div style={{width: 64, height: 64, borderRadius: 20, background: ['#ffe2c6', '#d8f3e1', '#f4e1d3', '#e3e6fb', '#d8f3e1'][i]}} />
                  <span style={{color: '#16211c', fontWeight: 500}}>{a}</span>
                </div>
                <span style={{color: b.startsWith('+') ? '#1a8a5a' : '#16211c', fontWeight: 600}}>{b}</span>
              </div>
            ))}
          </div>
          <div
            style={{
              position: 'absolute',
              left: 24,
              right: 24,
              top: 28,
              padding: '26px 30px',
              borderRadius: 34,
              background: 'rgba(16,19,18,0.92)',
              color: '#fff',
              fontSize: 30,
              transform: `translateY(${(1 - note) * -220}px)`,
              display: 'flex',
              gap: 20,
              alignItems: 'center',
            }}
          >
            <div style={{width: 56, height: 56, borderRadius: 16, background: '#b9f5c9'}} />
            <div>
              <div style={{fontWeight: 700}}>Nice work</div>
              <div style={{opacity: 0.75}}>You saved $240 this week</div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
