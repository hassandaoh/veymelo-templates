import {Easing, interpolate} from 'veymelo';
import {WORDS} from './content';
import {engine, type Run} from './engine';
import type {Stroke} from './pen/iso';
import {measure, write} from './pen/text';
import {plan, type Job, type Plan, type Pt} from './pen/route';
import {T} from './timing';

// The story as the pen draws it, laid out for a frame of any shape. The
// words; the full stop pulled out into a line that runs on to become the
// ground; on it, one machine drawn part by part; the machine starting up;
// the line running on to the name. Worked out once for a frame size.

/** A piece of the drawing: its strokes at frame f. */
export type Piece = {id: string; strokes(f: number): Stroke[]};
type Shot = {cx: number; cy: number; scale: number};
export type Story = {w: number; h: number; u: number; pieces: Piece[]; plan: Plan; start: number; shots: Shot[]; cuts: [number, number][]};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const move = Easing.bezier(0.65, 0, 0.35, 1);
const k = (f: number, a: number, b: number, ease = move) => interpolate(f, [a, b], [0, 1], {...clamp, easing: ease});
const still = (strokes: Pt[][]) => (): Stroke[] => strokes.map(pts => ({pts}));

/** The crank's angle and how hard it runs, `start` being when it fires. */
export function runAt(f: number, start: number): Run {
  const t = f - start;
  if (!(t > 0)) return {angle: 0, power: 0, f};
  const SPEED = (1.5 * Math.PI * 2) / 60; // a turn and a half a second
  const RAMP = 70; // frames to come up to speed
  const angle = t < RAMP ? (SPEED * t * t) / (2 * RAMP) : SPEED * (RAMP / 2 + t - RAMP);
  return {angle, power: k(f, start, start + RAMP, Easing.bezier(0.3, 0, 0.3, 1)), f};
}

const cache = new Map<string, Story>();

export function story(w: number, h: number, fps: number): Story {
  const key = `${w}x${h}@${fps}`;
  if (cache.has(key)) return cache.get(key)!;
  const wide = w >= h;
  const u = Math.min(w, h) / 1080;
  const size = 112 * u;
  const x0 = Math.max(90 * u, w * 0.08);
  const ground = h / 2 + 150 * u;
  const words1 = write(WORDS.first, x0, ground - size * 1.3, size);
  const words2 = write(WORDS.second, x0, ground, size);
  const start = words2.at(-1)!.at(-1)!;
  const textEnd = x0 + measure(WORDS.second, size);

  // the engine, large, standing on the line well along from the words
  const big = u * (wide ? 1.5 : 1.25);
  const probe = engine(0, ground, big);
  const machine = engine(textEnd + 300 * u - probe.left, ground, big);
  const touch: Pt = [machine.touch, ground];

  // the name: on the line to the right of the engine (wide), or under the line below it (tall)
  const nameSize = (wide ? 150 : 132) * u;
  const nameW = measure(WORDS.name, nameSize);
  const tagSize = 54 * u;
  const tagW = measure(WORDS.line, tagSize);
  const nameX = wide ? machine.right + 120 * u : (machine.left + machine.right) / 2 - nameW / 2;
  const nameY = wide ? ground - 34 * u : ground + 230 * u;
  const name = write(WORDS.name, nameX, nameY, nameSize);
  const tag = write(WORDS.line, nameX + nameW / 2 - tagW / 2, wide ? ground + 96 * u : nameY + 100 * u, tagSize);
  const onward: Pt[] = [touch, [wide ? nameX + nameW + 160 * u : machine.right + w * 0.6, ground]];

  const jobs = (fire: number): Job[] => [
    {id: 'first', strokes: words1, speed: 2400 * u, hop: 3200 * u, at: T.write},
    {id: 'second', strokes: words2, speed: 2400 * u, hop: 3200 * u},
    {id: 'line', strokes: [[start, touch]], speed: 2600 * u},
    {id: 'engine', strokes: machine.strokes(runAt(0, Infinity)).map(s => s.pts), speed: 7600 * big, hop: 9600 * big},
    {id: 'onward', strokes: [onward], speed: 2600 * u, at: fire + 50},
    {id: 'name', strokes: name, speed: 2800 * u, hop: 3600 * u},
    {id: 'tag', strokes: tag, speed: 2000 * u, hop: 3000 * u},
  ];
  const enter: Pt = [-80 * u, ground - 60 * u];
  const exit: Pt = [Math.max(onward[1][0], tag.at(-1)!.at(-1)![0]) + 260 * u, ground - 420 * u];
  const first = plan(jobs(0), {fps, enter, exit, travel: 2000 * u});
  // it starts a moment after the pen finishes it
  const fire = first.end.engine + 26;
  const p = plan(jobs(fire), {fps, enter, exit, travel: 2000 * u});

  const pieces: Piece[] = [
    {id: 'first', strokes: still(words1)},
    {id: 'second', strokes: still(words2)},
    {id: 'line', strokes: still([[start, touch]])},
    {id: 'engine', strokes: f => machine.strokes(runAt(f, fire))},
    {id: 'onward', strokes: still([onward])},
    {id: 'name', strokes: still(name)},
    {id: 'tag', strokes: still(tag)},
  ];

  // the shots: the words; the engine; the engine and the name
  const fitTo = (l: number, r: number, t: number, b: number, most = 1): Shot => {
    const scale = Math.min(most, (w * 0.86) / (r - l), (h * 0.8) / (b - t));
    return {cx: (l + r) / 2, cy: (t + b) / 2, scale};
  };
  const words: Shot = {cx: x0 + w * 0.42, cy: ground - 80 * u, scale: 1};
  const machineShot = fitTo(machine.left, machine.right, machine.top, ground + 40 * u);
  const last = wide ? fitTo(machine.left, nameX + nameW + 40 * u, machine.top, ground + 140 * u) : fitTo(machine.left, machine.right, machine.top, nameY + 140 * u);
  const shots = [words, machineShot, last];
  const cuts: [number, number][] = [
    [p.begin.line - 10, p.end.line + 40],
    [p.begin.onward - 20, p.begin.onward + 90],
  ];
  const s: Story = {w, h, u, pieces, plan: p, start: fire, shots, cuts};
  cache.set(key, s);
  return s;
}

/** The camera: from the words along the line to the engine, then drawing back to take in the name. Never back the way it came. */
export function cameraAt(s: Story, f: number): Shot {
  let shot = s.shots[0];
  s.cuts.forEach(([a, b], i) => {
    const t = k(f, a, b);
    const next = s.shots[i + 1];
    shot = {cx: shot.cx + (next.cx - shot.cx) * t, cy: shot.cy + (next.cy - shot.cy) * t, scale: shot.scale + (next.scale - shot.scale) * t};
  });
  return shot;
}
