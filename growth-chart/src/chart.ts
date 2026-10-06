import {DATA} from './content';
import {pace, prog} from './motion';
import {T} from './timing';

// The chart's geometry: where it sits in each shape of frame, its scales, and
// a smooth curve through the months (Catmull-Rom, so the tip of the drawn line
// and its label are always at the same point).

export type Frame = {w: number; h: number; u: number; tall: boolean; chart: {x: number; y: number; w: number; h: number}};

/** Where the chart sits: wide leaves room on the right for the change; tall puts it under the headline. */
export function frame(w: number, h: number): Frame {
  const tall = h > w;
  const u = Math.min(w, h) / 1080;
  const chart = tall ? {x: 140 * u, y: 600 * u, w: w - 330 * u, h: 600 * u} : {x: 190 * u, y: 330 * u, w: w - 820 * u, h: 610 * u};
  return {w, h, u, tall, chart};
}

const n = DATA.values.length;
/** A little headroom over the highest value; gridlines every 100 below it. */
export const MAX = Math.ceil((Math.max(...DATA.values, ...DATA.lastYear) * 1.05) / 50) * 50;
export const TICKS = Array.from({length: Math.floor(MAX / 100) + 1}, (_, i) => i * 100);

/** The value at a fractional month t (0 to n-1) on a smooth curve through the data. */
export function valueAt(values: number[], t: number) {
  const i = Math.max(0, Math.min(values.length - 2, Math.floor(t)));
  const u = t - i;
  const p0 = values[Math.max(0, i - 1)], p1 = values[i], p2 = values[i + 1], p3 = values[Math.min(values.length - 1, i + 2)];
  return 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
}

export const x = (fr: Frame, t: number) => fr.chart.x + (fr.chart.w * t) / (n - 1);
export const y = (fr: Frame, v: number) => fr.chart.y + fr.chart.h * (1 - v / MAX);

/** The drawn line up to month t, as an SVG path (and the area under it). */
export function path(fr: Frame, values: number[], t: number) {
  const points: string[] = [];
  for (let s = 0; s <= t + 1e-6; s += 0.04) points.push(`${x(fr, s).toFixed(1)},${y(fr, valueAt(values, s)).toFixed(1)}`);
  points.push(`${x(fr, t).toFixed(1)},${y(fr, valueAt(values, t)).toFixed(1)}`);
  const line = `M${points.join('L')}`;
  const area = `${line}L${x(fr, t).toFixed(1)},${y(fr, 0)}L${x(fr, 0)},${y(fr, 0)}Z`;
  return {line, area};
}

/** How far the line has drawn, in months, on frame f. */
export const drawn = (f: number) => (n - 1) * prog(f, T.draw[0], T.draw[1] - T.draw[0], pace);

/** The frame each month is reached (for the ticks of the milestones). */
export const reached = (month: number) => {
  for (let f = T.draw[0]; f <= T.draw[1]; f++) if (drawn(f) >= month) return f;
  return T.draw[1];
};
