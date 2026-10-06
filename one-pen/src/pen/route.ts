// One pen for the whole video: a single hairline that travels across the
// page and leaves ink where it passes. The pieces (a line of words, a line,
// a shape) are drawn one after another in their order; between them the pen
// swoops on to the next without lifting off the page. Everything is worked
// out from the frame number alone, so any frame draws the same picture.

export type Pt = [number, number];

/** A piece for the pen: its strokes, in page pixels, in the order they are drawn. */
export type Job = {
  id: string;
  strokes: Pt[][];
  /** Pixels a second while drawing. */
  speed: number;
  /** The earliest frame it may begin (the pen waits there, hovering). */
  at?: number;
  /** Pixels a second between its own strokes (a quick hop); the plan's travel speed if not given. */
  hop?: number;
};

type Ink = {kind: 'ink'; job: string; stroke: number; pts: Pt[]; lens: number[]; len: number; t0: number; t1: number};
type Move = {kind: 'move'; from: Pt; to: Pt; bend: number; t0: number; t1: number};
type Wait = {kind: 'wait'; at: Pt; t0: number; t1: number};
type Seg = Ink | Move | Wait;

export type Plan = {segs: Seg[]; begin: Record<string, number>; end: Record<string, number>; strokes: Record<string, number>; out: number};

const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);

/**
 * The pen's whole route: in from `enter`, through every job in order, out
 * to `exit`. `travel` is pixels a second between pieces; times are frames.
 */
export function plan(jobs: Job[], {fps, enter, exit, travel = 1900}: {fps: number; enter: Pt; exit: Pt; travel?: number}): Plan {
  const segs: Seg[] = [];
  const begin: Record<string, number> = {};
  const end: Record<string, number> = {};
  const strokes: Record<string, number> = {};
  let t = 0;
  let here = enter;
  const move = (to: Pt, bend: number, speed = travel) => {
    const d = dist(here, to);
    if (d < 0.5) return;
    const t1 = t + ((d * 1.1 + 1) / speed) * fps;
    segs.push({kind: 'move', from: here, to, bend, t0: t, t1});
    t = t1;
    here = to;
  };
  for (const job of jobs) {
    strokes[job.id] = job.strokes.length;
    job.strokes.forEach((pts, i) => {
      move(pts[0], i ? 0.3 : 0.18, i ? (job.hop ?? travel) : travel);
      if (i === 0 && job.at !== undefined && t < job.at) {
        segs.push({kind: 'wait', at: here, t0: t, t1: job.at});
        t = job.at;
      }
      if (i === 0) begin[job.id] = t;
      const lens = [0];
      for (let k = 1; k < pts.length; k++) lens.push(lens[k - 1] + dist(pts[k - 1], pts[k]));
      const len = Math.max(0.5, lens.at(-1)!);
      const t1 = t + (len / job.speed) * fps;
      segs.push({kind: 'ink', job: job.id, stroke: i, pts, lens, len, t0: t, t1});
      t = t1;
      here = pts.at(-1)!;
    });
    end[job.id] = t;
  }
  move(exit, -0.15);
  return {segs, begin, end, strokes, out: t};
}

function along(s: Ink, d: number): Pt {
  let k = 1;
  while (k < s.lens.length - 1 && s.lens[k] < d) k++;
  const a = s.pts[k - 1], b = s.pts[k], span = s.lens[k] - s.lens[k - 1] || 1;
  const u = Math.min(1, Math.max(0, (d - s.lens[k - 1]) / span));
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
}

function arc(s: Move, t: number): Pt {
  // a gentle arc, eased, so the pen swoops rather than slides
  const e = t * t * (3 - 2 * t);
  const [a, b] = [s.from, s.to];
  const c: Pt = [(a[0] + b[0]) / 2 - (b[1] - a[1]) * s.bend, (a[1] + b[1]) / 2 + (b[0] - a[0]) * s.bend];
  const u = 1 - e;
  return [u * u * a[0] + 2 * u * e * c[0] + e * e * b[0], u * u * a[1] + 2 * u * e * c[1] + e * e * b[1]];
}

/** Where the pen's head is at frame f, or null before it comes in and after it has gone. */
export function headAt(p: Plan, f: number): Pt | null {
  if (f < 0 || f > p.out || !p.segs.length) return null;
  let lo = 0, hi = p.segs.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (p.segs[mid].t0 <= f) lo = mid;
    else hi = mid - 1;
  }
  const s = p.segs[lo];
  const u = s.t1 > s.t0 ? Math.min(1, Math.max(0, (f - s.t0) / (s.t1 - s.t0))) : 1;
  if (s.kind === 'ink') return along(s, u * s.len);
  if (s.kind === 'move') return arc(s, u);
  // waiting: the pen hovers in a small slow loop over where it will begin
  const w = (f - s.t0) / 60;
  return [s.at[0] + Math.sin(w * 2.1) * 6, s.at[1] - 14 + Math.cos(w * 1.7) * 5];
}

/** How much of each stroke of a job is drawn at frame f, 0 to 1. */
export function inkAt(p: Plan, id: string, f: number): number[] {
  const out = new Array(p.strokes[id] ?? 0).fill(0);
  for (const s of p.segs) {
    if (s.kind !== 'ink' || s.job !== id) continue;
    out[s.stroke] = f >= s.t1 ? 1 : f <= s.t0 ? 0 : (f - s.t0) / (s.t1 - s.t0);
  }
  return out;
}

/** Is the pen drawing (not travelling or waiting) at frame f, and how fast, 0 to 1. For the sound of the nib. */
export function scratchAt(p: Plan, f: number): number {
  const s = p.segs.find(seg => seg.t0 <= f && f < seg.t1);
  if (!s || s.kind !== 'ink') return 0;
  return Math.min(1, s.len / Math.max(1, s.t1 - s.t0) / 30);
}

/** The pen's tail: where its head was over the last moments, newest first. */
export function tailAt(p: Plan, f: number, steps = 16, gap = 0.6): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const h = headAt(p, f - i * gap);
    if (!h) break;
    out.push(h);
  }
  return out;
}
