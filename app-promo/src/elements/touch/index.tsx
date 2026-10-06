import {COLOR} from '../../content';
import {mix, move, prog} from '../../motion';

/**
 * A fingertip: travels on an arc from where it appears to what it taps,
 * presses on the tap frame (the screen answers on the same frame), and leaves.
 */
export function Touch({f, from, to, appear, tap, leave = tap + 30}: {f: number; from: [number, number]; to: [number, number]; appear: number; tap: number; leave?: number}) {
  if (f < appear || f > leave + 24) return null;
  const travel = prog(f, appear, tap - 6 - appear, move);
  const away = prog(f, leave, 20, move);
  const lift = Math.sin(travel * Math.PI) * 60; // an arc, not a straight line
  const x = mix(from[0], to[0], travel) + away * 60;
  const y = mix(from[1], to[1], travel) - lift + away * 120;
  const press = f >= tap ? 1 - 0.16 * (1 - prog(f, tap + 4, 10)) : 1; // pressed on the tap frame, released over the next few
  const ripple = prog(f, tap, 22);
  const opacity = prog(f, appear, 10) * (1 - away);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity}}>
      {f >= tap && ripple < 1 ? (
        <div style={{position: 'absolute', left: to[0] - 36 - ripple * 40, top: to[1] - 36 - ripple * 40, width: 72 + ripple * 80, height: 72 + ripple * 80, borderRadius: '50%', border: `3px solid ${COLOR.brand}`, opacity: 0.45 * (1 - ripple)}} />
      ) : null}
      <div style={{position: 'absolute', left: x - 36, top: y - 36, width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: '2px solid rgba(16,19,18,0.14)', boxShadow: '0 10px 24px rgba(16,19,18,0.22)', transform: `scale(${press})`}} />
    </div>
  );
}
