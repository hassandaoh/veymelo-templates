// The island's shape, as one height function: a coast that wanders, a bay
// on the south side for the harbour, a cape to the east for the lighthouse
// and a hill to the north-west for the windmill. Everything placed on the
// island stands at height(x, z). Sea level is 0.

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const smooth = (t: number) => t * t * (3 - 2 * t);
/** Value noise in [0, 1], the same everywhere every time. */
export function noise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  const u = smooth(xf), v = smooth(yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x: number, y: number) => noise(x, y) * 0.6 + noise(x * 2.1, y * 2.1) * 0.3 + noise(x * 4.3, y * 4.3) * 0.1;
const bump = (a: number, at: number, width: number) => {
  let d = a - at;
  d = Math.atan2(Math.sin(d), Math.cos(d));
  return Math.exp(-((d / width) ** 2));
};
export const smoothstep = (a: number, b: number, x: number) => smooth(Math.min(1, Math.max(0, (x - a) / (b - a))));

/** Which way the harbour opens (radians, from +x toward +z: south, toward the camera). */
export const HARBOUR = 1.62;
/** Which way the cape points (east). */
export const CAPE = 0.2;
export const HILL = {x: -3.4, z: -3.2};

/** How far the coast is from the middle, in this direction. */
export function coast(a: number) {
  return 9 + 2.2 * (fbm(Math.cos(a) * 1.3 + 4, Math.sin(a) * 1.3 + 4) - 0.5) + 3.2 * bump(a, CAPE, 0.22) - 2.4 * bump(a, HARBOUR, 0.3);
}

export function height(x: number, z: number) {
  const r = Math.hypot(x, z);
  const a = Math.atan2(z, x);
  const t = 1 - r / coast(a); // above 0 on land
  if (t < 0) return -0.5 - Math.min(1, -t * 2.5) * 2.2; // the sea floor falls away
  const beach = smoothstep(0, 0.07, t) * 0.55 - 0.18;
  const land = smoothstep(0.05, 0.4, t);
  const hills = (fbm(x * 0.16 + 9, z * 0.16 + 3) - 0.35) * 2.4 * land;
  const hill = 3.1 * Math.exp(-(((x - HILL.x) ** 2 + (z - HILL.z) ** 2) / 14)) * land;
  // the harbour's ground is flat, for the houses
  const flat = 1 - 0.85 * bump(a, HARBOUR, 0.45) * smoothstep(0.15, 0.55, t);
  // the cape rises into a rock for the lighthouse
  const cape = 1.1 * bump(a, CAPE, 0.16) * smoothstep(0.0, 0.25, t);
  return beach + Math.max(0, hills) * flat + hill + cape;
}

/** A point on land at this angle, `inland` of the way from the coast to the middle. */
export function onLand(a: number, inland: number): [number, number] {
  const r = coast(a) * (1 - inland);
  return [Math.cos(a) * r, Math.sin(a) * r];
}
