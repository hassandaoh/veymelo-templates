import type {Pt} from './route';

// Isometric line drawing, the way the site's figures are drawn: x to the
// lower right, y to the lower left, z up. A thing is placed by the point of
// its footprint nearest the viewer, standing on the line (the ground).
// Only the edges that face you are drawn, in the order a pen would go.

export type V3 = [number, number, number];

/** A line the pen draws, with what it needs besides its points. */
export type Stroke = {
  pts: Pt[];
  /** Paper under it, to hide what is behind (a closed outline). */
  fill?: boolean;
  /** Fainter: a mark, a shade, light, smoke. */
  faint?: boolean;
  /** How much of it is left (0 gone, 1 all there). */
  fade?: number;
};
const C30 = Math.cos(Math.PI / 6);
const TAU = Math.PI * 2;

export type Iso = {x: number; y: number; s: number};
/** A world point on the page. */
export const P = (o: Iso, [x, y, z]: V3): Pt => [o.x + (x - y) * C30 * o.s, o.y + ((x + y) * 0.5 - z) * o.s];

/** The origin for a thing whose footprint reaches a in x and b in y, so its front corner stands on (gx, gy). */
export const standing = (gx: number, gy: number, a: number, b: number, s: number): Iso => ({x: gx - (a - b) * C30 * s, y: gy - ((a + b) / 2) * s, s});

export const line3 = (o: Iso, pts: V3[]): Pt[] => pts.map(p => P(o, p));

/** A circle lying flat (z), from angle a0 to a1. */
export function ring(o: Iso, cx: number, cy: number, z: number, r: number, a0 = 0, a1 = TAU, n = 40): Pt[] {
  const steps = Math.max(2, Math.ceil((n * Math.abs(a1 - a0)) / TAU));
  return Array.from({length: steps + 1}, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / steps;
    return P(o, [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z]);
  });
}

// the edges of a flat circle as seen: its leftmost and rightmost points are at 3π/4 and -π/4, its front between
export const LEFT = (3 * Math.PI) / 4, RIGHT = -Math.PI / 4;

/**
 * A round thing standing up (a cylinder, or a cone cut flat when the radii
 * differ), in one stroke: down its left side, round the front of its foot,
 * up its right side, and round its top.
 */
export function drum(o: Iso, cx: number, cy: number, z: number, h: number, rTop: number, rFoot = rTop): Pt[] {
  const top = (a: number) => P(o, [cx + Math.cos(a) * rTop, cy + Math.sin(a) * rTop, z + h]);
  return [top(LEFT), ...ring(o, cx, cy, z, rFoot, LEFT, RIGHT, 30), ...ring(o, cx, cy, z + h, rTop, RIGHT, RIGHT + TAU, 48)];
}

/** A box: its silhouette from the left-hand bottom corner round, then the three edges that meet at the near top corner. */
export function box(o: Iso, [x0, y0, z0]: V3, [w, d, h]: V3): Pt[][] {
  const [x1, y1, z1] = [x0 + w, y0 + d, z0 + h];
  const p = (x: number, y: number, z: number) => P(o, [x, y, z]);
  return [
    [p(x0, y1, z0), p(x1, y1, z0), p(x1, y0, z0), p(x1, y0, z1), p(x0, y0, z1), p(x0, y1, z1), p(x0, y1, z0)],
    [p(x0, y1, z1), p(x1, y1, z1), p(x1, y0, z1)],
    [p(x1, y1, z1), p(x1, y1, z0)],
  ];
}

/** A line as an SVG path. */
export const toPath = (pts: Pt[]) => (pts.length ? 'M' + pts.map(q => `${q[0].toFixed(2)} ${q[1].toFixed(2)}`).join('L') : '');
