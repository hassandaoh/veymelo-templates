import type {ReactNode} from 'react';
import {COLOR} from '../../content';

export const PHONE = {w: 600, h: 1240, bezel: 20};
export const SCREEN = {w: PHONE.w - 2 * PHONE.bezel, h: PHONE.h - 2 * PHONE.bezel};

function StatusBar() {
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 64, color: COLOR.ink, fontSize: 22, fontWeight: 600}}>
      <span style={{position: 'absolute', left: 52, top: 22}}>9:41</span>
      <div style={{position: 'absolute', left: (SCREEN.w - 150) / 2, top: 14, width: 150, height: 42, borderRadius: 21, background: COLOR.ink}} />
      <div style={{position: 'absolute', right: 46, top: 25, display: 'flex', alignItems: 'flex-end', gap: 8}}>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 3}}>
          {[7, 10, 13, 16].map(h => (
            <i key={h} style={{width: 4, height: h, borderRadius: 1.5, background: COLOR.ink}} />
          ))}
        </div>
        <div style={{width: 30, height: 15, borderRadius: 4, border: `2px solid ${COLOR.ink}`, padding: 2, boxSizing: 'border-box'}}>
          <div style={{width: '78%', height: '100%', borderRadius: 1.5, background: COLOR.ink}} />
        </div>
      </div>
    </div>
  );
}

/** A phone: its screen holds the app; everything inside is laid out on SCREEN. */
export function Phone({children}: {children: ReactNode}) {
  return (
    <div style={{position: 'relative', width: PHONE.w, height: PHONE.h, borderRadius: 100, background: COLOR.ink, padding: PHONE.bezel, boxSizing: 'border-box', boxShadow: '0 60px 100px rgba(15,77,58,0.22), 0 10px 24px rgba(15,77,58,0.14)'}}>
      <div style={{position: 'absolute', inset: 2, borderRadius: 98, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)'}} />
      <div style={{position: 'relative', width: SCREEN.w, height: SCREEN.h, borderRadius: 80, background: COLOR.paper, overflow: 'hidden'}}>
        {children}
        <StatusBar />
      </div>
    </div>
  );
}
