import {Icon} from '../elements/icon';
import {APP, COLOR} from '../content';
import {land, prog, snap} from '../motion';
import {T} from '../timing';

// The end: the icon lands, the name, one line, and where to get it. Then it
// holds: the most resolved moment, not the loudest.
export function End({f}: {f: number}) {
  if (f < T.icon - 2) return null;
  const icon = land(f, T.icon, snap);
  const name = prog(f, T.name, 24);
  const line = prog(f, T.line, 22);
  const creep = 1 + 0.025 * prog(f, T.icon, T.length - T.icon, (t: number) => t); // a slow lean in while it holds
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${creep})`, transformOrigin: '50% 45%'}}>
      <div style={{position: 'absolute', top: 560, width: 200, height: 200, borderRadius: 54, background: COLOR.brand, display: 'grid', placeItems: 'center', transform: `scale(${0.6 + 0.4 * icon})`, opacity: Math.min(1, icon * 1.4), boxShadow: '0 30px 60px rgba(15,77,58,0.25)'}}>
        <Icon name="leaf" size={116} color={COLOR.accent} stroke={2} />
      </div>
      <div style={{position: 'absolute', top: 800, overflow: 'hidden', paddingBottom: 10}}>
        <div style={{fontSize: 160, fontWeight: 700, color: COLOR.brand, letterSpacing: '-0.05em', lineHeight: 1, transform: `translateY(${(1 - name) * 110}%)`}}>{APP.name}</div>
      </div>
      <div style={{position: 'absolute', top: 990, fontSize: 48, color: COLOR.muted, opacity: line, transform: `translateY(${(1 - line) * 16}px)`}}>{APP.line}</div>
      <div style={{position: 'absolute', top: 1110, display: 'flex', gap: 20}}>
        {APP.stores.map((store, i) => {
          const k = prog(f, T.stores + i * 6, 20);
          return (
            <div key={store} style={{padding: '22px 40px', borderRadius: 999, border: `3px solid ${COLOR.brand}`, color: COLOR.brand, fontSize: 32, fontWeight: 600, opacity: k, transform: `translateY(${(1 - k) * 16}px)`}}>
              {store}
            </div>
          );
        })}
      </div>
    </div>
  );
}
