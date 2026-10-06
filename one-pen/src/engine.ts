import {box, drum, line3, P, ring, standing, LEFT, RIGHT, type Iso, type V3} from './pen/iso';
import type {Pt} from './pen/route';
import type {Stroke} from './pen/iso';

// The machine: a two-cylinder engine on a skid, in isometric hairline, with
// everything a technical drawing would show. Its crankshaft runs along x
// (to the lower right); the flywheel, belt and fan are on that end, the
// gears and the gauge on the near face (+y, to the lower left).
//
// strokes(run) gives every line in the order the pen draws it: `run` is
// what the engine is doing (the crank's angle, how hard it is running, the
// frame for its smoke). Before it starts the angle is 0, so the pen always
// draws a still machine; afterwards the same lines move.

export type Run = {angle: number; power: number; f: number};

const TAU = Math.PI * 2;
const S = (pts: Pt[], extra: Partial<Stroke> = {}): Stroke => ({pts, ...extra});

// the engine's layout (world units, scaled by u)
const BASE = {x0: -280, x1: 200, y0: -160, y1: 160, h: 22};
const BLOCK = {x0: -210, x1: 190, y0: -130, y1: 30, z0: 22, z1: 180};
const CRANK = {y: -50, z: 104};
const BORES = [-100, 70];
const BORE = {y: -50, r: 56, z0: 180, z1: 336};
const HEAD = {h: 44};
const FLY = {x: 222, r: 92};
const FAN = {x: 236, z: 360, r: 72};

/** A circle standing in the y-z plane (its axis along x), from angle a0 to a1. */
function circleX(o: Iso, x: number, cy: number, cz: number, r: number, a0 = 0, a1 = TAU, n = 44): Pt[] {
  const steps = Math.max(2, Math.ceil((n * Math.abs(a1 - a0)) / TAU));
  return Array.from({length: steps + 1}, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / steps;
    return P(o, [x, cy + Math.cos(a) * r, cz + Math.sin(a) * r]);
  });
}
/** A circle standing in the x-z plane (its axis along y). */
function circleY(o: Iso, cx: number, y: number, cz: number, r: number, a0 = 0, a1 = TAU, n = 44): Pt[] {
  const steps = Math.max(2, Math.ceil((n * Math.abs(a1 - a0)) / TAU));
  return Array.from({length: steps + 1}, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / steps;
    return P(o, [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]);
  });
}
/** A gear in the x-z plane: teeth round a circle, turned by `turn`. */
function gear(o: Iso, cx: number, y: number, cz: number, r: number, teeth: number, turn: number): Pt[] {
  const pts: Pt[] = [];
  const depth = 9;
  for (let i = 0; i < teeth; i++) {
    const a = turn + (i / teeth) * TAU, w = TAU / teeth;
    for (const [da, rr] of [[0, r - depth], [w * 0.18, r - depth], [w * 0.3, r], [w * 0.62, r], [w * 0.74, r - depth]] as [number, number][]) {
      pts.push(P(o, [cx + Math.cos(a + da) * rr, y, cz + Math.sin(a + da) * rr]));
    }
  }
  pts.push(pts[0]);
  return pts;
}
/** A tube along a path of world points: its two sides, as seen, `r` apart. */
function tube(o: Iso, path: V3[], r: number): Pt[][] {
  const c = path.map(p => P(o, p));
  const side = (s: number) =>
    c.map((p, i) => {
      const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)];
      const d = [b[0] - a[0], b[1] - a[1]], len = Math.hypot(d[0], d[1]) || 1;
      return [p[0] - (d[1] / len) * r * o.s * s, p[1] + (d[0] / len) * r * o.s * s] as Pt;
    });
  return [side(1), side(-1)];
}
/** A rounded path through points (corners eased), for pipes and wires. */
function bend(points: V3[], round = 0.3, n = 6): V3[] {
  const out: V3[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const [a, b, c] = [points[i - 1], points[i], points[i + 1]];
    const p0 = b.map((v, k) => v + (a[k] - v) * round) as V3;
    const p1 = b.map((v, k) => v + (c[k] - v) * round) as V3;
    for (let j = 0; j <= n; j++) {
      const t = j / n;
      out.push(p0.map((v, k) => (1 - t) * (1 - t) * v + 2 * (1 - t) * t * b[k] + t * t * p1[k]) as V3);
    }
  }
  out.push(points.at(-1)!);
  return out;
}

export type Engine = {touch: number; left: number; right: number; top: number; strokes(run: Run): Stroke[]};

/** The engine standing on the line, its skid's front corner at gx. */
export function engine(gx: number, gy: number, u: number): Engine {
  const a = (BASE.x1 - BASE.x0) / 2, b = (BASE.y1 - BASE.y0) / 2;
  const mid = (BASE.x0 + BASE.x1) / 2;
  const home = standing(gx, gy, a, b, u);
  // the skid is centred at x = mid: shift the origin so world x matches the layout
  const base: Iso = {x: home.x - mid * 0.866 * u, y: home.y - mid * 0.5 * u, s: u};
  const corners = [P(base, [BASE.x0, BASE.y1, 0]), P(base, [FAN.x, BORE.y, FAN.z + FAN.r]), P(base, [FLY.x + 30, BASE.y0, 0])];
  return {
    touch: gx,
    left: corners[0][0],
    right: corners[2][0] + 40 * u,
    top: P(base, [BORES[0], BORE.y - 60, BORE.z1 + HEAD.h + 60])[1],
    strokes({angle, power, f}) {
      // it shakes a little while it runs
      const shake = power * u * 1.6;
      const o: Iso = {x: base.x + Math.sin(angle * 2) * shake * 0.5, y: base.y + Math.sin(angle * 2 + 1) * shake, s: u};
      const out: Stroke[] = [];
      const add = (pts: Pt[], extra?: Partial<Stroke>) => out.push(S(pts, extra));
      const cam = angle / 2; // the camshaft turns at half the crank's speed

      // the skid, and its bolts
      const skid = box(base, [BASE.x0, BASE.y0, 0], [BASE.x1 - BASE.x0, BASE.y1 - BASE.y0, BASE.h]);
      add(skid[0], {fill: true});
      add(skid[1]);
      add(skid[2]);
      for (const [x, y] of [[BASE.x0 + 24, BASE.y1 - 24], [BASE.x1 - 24, BASE.y1 - 24], [BASE.x0 + 24, BASE.y0 + 24], [BASE.x1 - 24, BASE.y0 + 24]]) add(ring(base, x, y, BASE.h, 9, 0, TAU, 14));

      // the block, its ribs, the bolts along its top
      const block = box(o, [BLOCK.x0, BLOCK.y0, BLOCK.z0], [BLOCK.x1 - BLOCK.x0, BLOCK.y1 - BLOCK.y0, BLOCK.z1 - BLOCK.z0]);
      add(block[0], {fill: true});
      add(block[1]);
      add(block[2]);
      for (const z of [60, 96, 132]) add(line3(o, [[BLOCK.x1, BLOCK.y0 + 14, z], [BLOCK.x1, BLOCK.y1 - 14, z]]), {faint: true});
      for (let x = BLOCK.x0 + 26; x < BLOCK.x1 - 10; x += 46) add(circleY(o, x, BLOCK.y1, BLOCK.z1 - 14, 5, 0, TAU, 10));
      // the oil filler on top
      add(drum(o, -170, -100, BLOCK.z1, 16, 14), {fill: true});

      // the cylinders, finned, each with its head, rockers and push rods
      BORES.forEach((x, i) => {
        add(drum(o, x, BORE.y, BORE.z0, BORE.z1 - BORE.z0, BORE.r), {fill: true});
        for (let z = BORE.z0 + 14; z < BORE.z1 - 6; z += 14) add(ring(o, x, BORE.y, z, BORE.r + 13, LEFT, RIGHT, 24));
        const head = box(o, [x - 72, BORE.y - 72, BORE.z1], [144, 144, HEAD.h]);
        add(head[0], {fill: true});
        add(head[1]);
        add(head[2]);
        for (const z of [BORE.z1 + 12, BORE.z1 + 24, BORE.z1 + 34]) add(line3(o, [[x - 64, BORE.y + 72, z], [x + 64, BORE.y + 72, z]]), {faint: true});
        // two rockers on the head, see-sawing with the cam
        for (const [dx, phase] of [[-34, 0], [34, Math.PI]] as [number, number][]) {
          const tilt = Math.sin(cam + phase + i * Math.PI) * 0.16 * Math.min(1, power * 2);
          const pivot: V3 = [x + dx, BORE.y + 20, BORE.z1 + HEAD.h + 16];
          const end = (s: number): V3 => [pivot[0], pivot[1] + Math.cos(tilt) * 46 * s, pivot[2] + Math.sin(tilt) * 46 * s];
          add(line3(o, [[pivot[0], pivot[1], BORE.z1 + HEAD.h], pivot]));
          add(line3(o, [end(-1), end(1)]));
          add(circleY(o, pivot[0], pivot[1] - 46, BORE.z1 + HEAD.h + 16, 4, 0, TAU, 8));
          // its push rod, from the block up to the rocker's near end
          const top = end(1);
          const [l, r] = tube(o, [[pivot[0], top[1], BLOCK.z1], top], 3);
          add(l);
          add(r);
        }
        // the spark plug and its lead to the distributor
        const plug: V3 = [x, BORE.y + 72, BORE.z1 + 22];
        add(circleY(o, plug[0], plug[1] + 2, plug[2], 9, 0, TAU, 6));
        add(line3(o, [[plug[0], plug[1] + 2, plug[2]], [plug[0], plug[1] + 30, plug[2] + 6]]));
        add(line3(o, bend([[plug[0], plug[1] + 30, plug[2] + 6], [plug[0], plug[1] + 70, plug[2] - 40], [-12, 24, BLOCK.z1 + 54]], 0.45)));
      });
      // the distributor between the cylinders
      add(drum(o, -12, 6, BLOCK.z1, 40, 20, 18), {fill: true});
      add(drum(o, -12, 6, BLOCK.z1 + 40, 14, 24, 20), {fill: true});

      // the gears on the near face: the crank's, and the camshaft's twice its size, turning the other way
      const g1 = {x: -126, z: CRANK.z, r: 36}, g2 = {x: -126 + 36 + 72 - 6, z: CRANK.z, r: 72};
      add(circleY(o, g1.x, BLOCK.y1 + 2, g1.z, 54, 0, TAU, 40), {faint: true});
      add(gear(o, g1.x, BLOCK.y1 + 4, g1.z, g1.r, 12, angle), {fill: true});
      add(circleY(o, g1.x, BLOCK.y1 + 5, g1.z, 9, 0, TAU, 14));
      add(gear(o, g2.x, BLOCK.y1 + 4, g2.z, g2.r, 24, -cam + Math.PI / 24), {fill: true});
      add(circleY(o, g2.x, BLOCK.y1 + 5, g2.z, 14, 0, TAU, 16));
      for (let k = 0; k < 4; k++) {
        const t = -cam + Math.PI / 24 + (k * TAU) / 4;
        add(line3(o, [[g2.x + Math.cos(t) * 16, BLOCK.y1 + 5, g2.z + Math.sin(t) * 16], [g2.x + Math.cos(t) * 52, BLOCK.y1 + 5, g2.z + Math.sin(t) * 52]]));
      }
      // the gauge: its dial, its marks, its needle rising as the engine runs
      const gx0 = 118, gz0 = 112, gr = 34;
      add(circleY(o, gx0, BLOCK.y1 + 3, gz0, gr + 6, 0, TAU, 36), {fill: true});
      add(circleY(o, gx0, BLOCK.y1 + 4, gz0, gr, 0, TAU, 36));
      for (let m = 0; m <= 8; m++) {
        const t = Math.PI * 1.25 - (m / 8) * Math.PI * 1.5;
        const r0 = m % 4 === 0 ? gr - 12 : gr - 7;
        add(line3(o, [[gx0 + Math.cos(t) * r0, BLOCK.y1 + 4, gz0 + Math.sin(t) * r0], [gx0 + Math.cos(t) * (gr - 3), BLOCK.y1 + 4, gz0 + Math.sin(t) * (gr - 3)]]));
      }
      const needle = Math.PI * 1.25 - (0.08 + 0.62 * power + 0.03 * Math.sin(f / 5) * power) * Math.PI * 1.5;
      add(line3(o, [[gx0 - Math.cos(needle) * 6, BLOCK.y1 + 5, gz0 - Math.sin(needle) * 6], [gx0 + Math.cos(needle) * (gr - 6), BLOCK.y1 + 5, gz0 + Math.sin(needle) * (gr - 6)]]));

      // the exhaust: a pipe from each head down to the silencer on the skid
      const SIL = {y: 110, z: 58, r: 36, x0: -230, x1: 90};
      BORES.forEach(x => {
        for (const side of tube(o, bend([[x + 40, BORE.y + 72, BORE.z1 + 18], [x + 40, BORE.y + 140, BORE.z1 + 18], [x + 40, SIL.y - 20, SIL.z + 40], [x + 40, SIL.y, SIL.z + 20]], 0.4), 11)) add(side);
      });
      // the silencer: its body, its straps, its end and tail pipe
      // a round thing lying along x: its outline is the far half of each end and the lines that touch them
      const Q = Math.PI / 4;
      add([...circleX(o, SIL.x0, SIL.y, SIL.z, SIL.r, 3 * Q, 3 * Q, 1).slice(0, 1), ...circleX(o, SIL.x1, SIL.y, SIL.z, SIL.r, 3 * Q, 7 * Q, 20), ...circleX(o, SIL.x0, SIL.y, SIL.z, SIL.r, 7 * Q, 11 * Q, 20)], {fill: true});
      add(circleX(o, SIL.x1, SIL.y, SIL.z, SIL.r, -Q, 3 * Q, 20)); // the near half of its end
      for (const x of [SIL.x0 + 60, SIL.x1 - 60]) add(circleX(o, x, SIL.y, SIL.z, SIL.r + 2, -Q, 3 * Q, 20));
      add(circleX(o, SIL.x1 + 30, SIL.y + 8, SIL.z - 8, 9, 0, TAU, 14));
      add(line3(o, [[SIL.x1, SIL.y + 8, SIL.z + 1], [SIL.x1 + 30, SIL.y + 8, SIL.z + 1]]));
      add(line3(o, [[SIL.x1, SIL.y + 8, SIL.z - 17], [SIL.x1 + 30, SIL.y + 8, SIL.z - 17]]));
      // the flywheel on the crank's end: rim, hub and six spokes, turning
      const FW = {x: FLY.x, y: CRANK.y, z: CRANK.z};
      add(circleX(o, FW.x, FW.y, FW.z, FLY.r, 0, TAU, 60), {fill: true});
      add(circleX(o, FW.x + 1, FW.y, FW.z, FLY.r - 14, 0, TAU, 56));
      add(circleX(o, FW.x + 2, FW.y, FW.z, 20, 0, TAU, 20));
      for (let k = 0; k < 6; k++) {
        const t = angle + (k * TAU) / 6;
        for (const off of [-0.07, 0.07]) add(line3(o, [[FW.x + 2, FW.y + Math.cos(t + off * 2.6) * 20, FW.z + Math.sin(t + off * 2.6) * 20], [FW.x + 1, FW.y + Math.cos(t + off) * (FLY.r - 14), FW.z + Math.sin(t + off) * (FLY.r - 14)]]));
      }
      // the crank's pulley, the belt up to the fan, and the fan's four blades
      const PUL = {x: FLY.x + 18, r: 30};
      add(circleX(o, PUL.x, FW.y, FW.z, PUL.r, 0, TAU, 28), {fill: true});
      add(circleX(o, PUL.x + 14, FW.y, FAN.z, 20, 0, TAU, 24), {fill: true});
      const beltL: Pt[] = [P(o, [PUL.x, FW.y - PUL.r, FW.z]), P(o, [PUL.x + 14, FW.y - 20, FAN.z])];
      const beltR: Pt[] = [P(o, [PUL.x, FW.y + PUL.r, FW.z]), P(o, [PUL.x + 14, FW.y + 20, FAN.z])];
      add(beltL);
      add(beltR);
      // marks on the belt, carried round with it
      for (let k = 0; k < 4; k++) {
        const t = (((angle * PUL.r) / 260 + k / 4) % 1 + 1) % 1;
        const [p, q] = t < 0.5 ? [beltR[0], beltR[1]] : [beltL[1], beltL[0]];
        const s = (t % 0.5) * 2;
        const m: Pt = [p[0] + (q[0] - p[0]) * s, p[1] + (q[1] - p[1]) * s];
        add([[m[0] - 4 * u, m[1] - 2 * u], [m[0] + 4 * u, m[1] + 2 * u]], {faint: true});
      }
      // the fan's bracket from the block, then its four blades, each a leaf from the hub, turning
      add(line3(o, [[BLOCK.x1, CRANK.y + 20, BLOCK.z1 - 20], [FAN.x + 10, CRANK.y + 20, FAN.z - 30], [FAN.x + 20, CRANK.y, FAN.z]]));
      const fanTurn = angle * 1.6;
      for (let k = 0; k < 4; k++) {
        const t = fanTurn + (k * TAU) / 4;
        const edge = (s: number, sweep: number): V3 => [FAN.x + 22, FW.y + Math.cos(t + sweep * s) * FAN.r * s, FAN.z + Math.sin(t + sweep * s) * FAN.r * s];
        add(line3(o, [edge(0.16, 0), edge(0.45, 0.32), edge(0.8, 0.3), edge(1, 0.12), edge(0.92, -0.12), edge(0.55, -0.14), edge(0.16, 0)]));
      }
      add(circleX(o, FAN.x + 23, FW.y, FAN.z, 10, 0, TAU, 14), {fill: true});
      // smoke from the tail pipe while it runs: rings that rise, grow and thin out
      // (last, and only while it runs, so the pen never has them to draw)
      if (power > 0.05) for (let k = 0; k < 3; k++) {
        const age = power > 0 ? (((f / 26 + k / 3) % 1) + 1) % 1 : 0;
        const c: V3 = [SIL.x1 + 46 + age * 40, SIL.y + 8, SIL.z + age * 130];
        add(circleX(o, c[0], c[1], c[2], 8 + age * 26, 0, TAU, 20), {faint: true, fade: power * (1 - age) ** 1.3});
      }

      return out;
    },
  };
}
