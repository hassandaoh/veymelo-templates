import type {ReactNode} from 'react';
import type {Layout} from '../layout';
import {mix, move, prog} from '../motion';
import {T} from '../timing';

// The pull-back: the town becomes the view through the café's window. The
// dawn shrinks into the window, the plaster wall and the window's frame close
// in around it, and the counter rises into the bottom of the frame.

export const WALL = '#efe2cf';
const FRAME = '#8a5a36';

export function Cafe({f, w, h, box, children}: {f: number; w: number; h: number; box: Layout; children: ReactNode}) {
  const {u, window: win} = box;
  const p = prog(f, T.back, T.inside - T.back, move);
  // the dawn, scaled to cover the window and centred in it
  const s = Math.max(win.w / w, win.h / h);
  const target = {x: win.x + (win.w - w * s) / 2, y: win.y + (win.h - h * s) / 2};
  const scale = mix(1, s, p);
  const tx = mix(0, target.x, p);
  const ty = mix(0, target.y, p);
  // the window's opening, from the whole frame to the window
  const open = {x: mix(0, win.x, p), y: mix(0, win.y, p), w: mix(w, win.w, p), h: mix(h, win.h, p)};
  const bar = 14 * u * p;
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: WALL}}>
      <div style={{position: 'absolute', inset: 0, clipPath: `inset(${open.y}px ${w - open.x - open.w}px ${h - open.y - open.h}px ${open.x}px)`}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: '0 0'}}>{children}</div>
      </div>
      {p > 0 ? (
        <>
          {/* the window's frame, its cross bars and the sill */}
          <div style={{position: 'absolute', left: open.x - bar, top: open.y - bar, width: open.w + 2 * bar, height: open.h + 2 * bar, border: `${bar}px solid ${FRAME}`, boxSizing: 'border-box', boxShadow: `inset 0 0 ${30 * u}px rgba(60,30,10,${0.25 * p})`}} />
          <div style={{position: 'absolute', left: open.x + open.w / 2 - bar / 2, top: open.y, width: bar * 0.8, height: open.h, background: FRAME}} />
          <div style={{position: 'absolute', left: open.x, top: open.y + open.h * 0.42 - bar / 2, width: open.w, height: bar * 0.8, background: FRAME}} />
          <div style={{position: 'absolute', left: open.x - bar * 2.2, top: open.y + open.h, width: open.w + bar * 4.4, height: bar * 1.6, background: '#9b6a43', boxShadow: `0 ${6 * u}px ${14 * u}px rgba(60,30,10,0.25)`}} />
          {/* warm light falling into the room from the window */}
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(200deg, rgba(255,214,160,${0.35 * p}) 10%, rgba(255,214,160,0) 55%)`, pointerEvents: 'none'}} />
        </>
      ) : null}
      {/* the counter rises into the frame */}
      <div style={{position: 'absolute', left: 0, right: 0, top: mix(h + 420 * u, box.counter, p), height: h, background: 'linear-gradient(180deg, #c88e5c 0%, #b57a4b 6%, #a86e41 40%, #8f5c36 100%)', boxShadow: `0 ${-2 * u}px 0 #d9a473`}} />
    </div>
  );
}
