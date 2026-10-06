import {COLOR} from '../../content';
import {mix, move, prog} from '../../motion';

type Point = [number, number];

/**
 * A fingertip: appears at `from`, travels on an arc to each stop and presses
 * it on its tap frame (the screen answers on the same frame), goes on to the
 * next stop without leaving, and leaves after the last.
 */
export function Touch({f, from, appear, stops, leave}: {f: number; from: Point; appear: number; stops: {at: Point; tap: number}[]; leave: number}) {
  if (f < appear || f > leave + 24) return null;
  let [x, y] = from;
  stops.forEach((stop, i) => {
    const start = i === 0 ? appear : stops[i - 1].tap + 10;
    const travel = prog(f, start, stop.tap - 6 - start, move);
    if (travel <= 0) return;
    const lift = Math.sin(travel * Math.PI) * 60; // an arc, not a straight line
    const before = i === 0 ? from : stops[i - 1].at;
    x = mix(before[0], stop.at[0], travel);
    y = mix(before[1], stop.at[1], travel) - lift;
  });
  const away = prog(f, leave, 20, move);
  x += away * 60;
  y += away * 120;
  // pressed on the tap frame, released over the next few
  const pressed = stops.find(stop => f >= stop.tap && f < stop.tap + 14);
  const press = pressed ? 1 - 0.16 * (1 - prog(f, pressed.tap + 4, 10)) : 1;
  const opacity = prog(f, appear, 10) * (1 - away);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity}}>
      {stops.map(stop => {
        const ripple = prog(f, stop.tap, 22);
        if (f < stop.tap || ripple >= 1) return null;
        return <div key={stop.tap} style={{position: 'absolute', left: stop.at[0] - 36 - ripple * 40, top: stop.at[1] - 36 - ripple * 40, width: 72 + ripple * 80, height: 72 + ripple * 80, borderRadius: '50%', border: `3px solid ${COLOR.brand}`, opacity: 0.45 * (1 - ripple)}} />;
      })}
      <div style={{position: 'absolute', left: x - 36, top: y - 36, width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: '2px solid rgba(16,19,18,0.14)', boxShadow: '0 10px 24px rgba(16,19,18,0.22)', transform: `scale(${press})`}} />
    </div>
  );
}
