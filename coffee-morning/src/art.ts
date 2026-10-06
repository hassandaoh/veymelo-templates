import {COLOR} from './content';

// The coffee's surface, drawn on a canvas that the 3D cup wears: the crema,
// then the milk: a round of foam growing in rings while it is poured, which
// the pour pulls through into a heart.
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** A closed outline: a circle at 0, a heart at 1. */
function outline(g: CanvasRenderingContext2D, x: number, y: number, r: number, heart: number, wobble: number, f: number) {
  g.beginPath();
  for (let i = 0; i <= 120; i++) {
    const t = (i / 120) * 2 * Math.PI;
    const hx = Math.sin(t) ** 3;
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16 - 0.15;
    const w = 1 + wobble * Math.sin(5 * t + f / 5) * 0.045;
    const px = x + mix(Math.sin(t), hx, heart) * r * w;
    const py = y + mix(-Math.cos(t), hy, heart) * r * w;
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
}

/** `fill` 0→1 the foam grows; `heart` 0→1 it becomes a heart; `pull` 0→1 the line drawn through it. */
export function drawSurface(g: CanvasRenderingContext2D, size: number, fill: number, heart: number, pull: number, f: number) {
  const c = size / 2;
  const crema = g.createRadialGradient(c, c * 0.95, 0, c, c, c);
  crema.addColorStop(0, '#cf8b4c');
  crema.addColorStop(0.55, COLOR.crema);
  crema.addColorStop(0.85, '#8a4a22');
  crema.addColorStop(1, COLOR.cremaEdge);
  g.fillStyle = crema;
  g.fillRect(0, 0, size, size);
  // the crema's tiger-striping: soft darker blobs, always in the same places
  for (let i = 0; i < 14; i++) {
    const a = i * 2.39996;
    const d = (0.25 + 0.6 * ((i * 37) % 11) / 11) * c;
    g.fillStyle = 'rgba(110,55,22,0.12)';
    g.beginPath();
    g.ellipse(c + Math.cos(a) * d, c + Math.sin(a) * d, c * 0.12, c * 0.05, a, 0, Math.PI * 2);
    g.fill();
  }
  const r = c * 0.62 * fill;
  if (r > 1) {
    const y = c + c * 0.04;
    g.fillStyle = COLOR.milk;
    outline(g, c, y, r, heart, 1 - heart, f);
    g.fill();
    g.lineWidth = size * 0.007;
    g.strokeStyle = 'rgba(160,95,50,0.5)';
    for (const k of [0.8, 0.6, 0.4]) {
      outline(g, c, y + r * (1 - k) * 0.25, r * k, heart, 1 - heart, f + k * 40);
      g.stroke();
    }
    if (pull > 0) {
      g.strokeStyle = 'rgba(150,85,45,0.65)';
      g.lineWidth = size * 0.006;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(c, y + c * 0.62 * 1.0);
      g.lineTo(c, mix(y + c * 0.62, y - c * 0.62 * 0.3, pull));
      g.stroke();
    }
  }
}
