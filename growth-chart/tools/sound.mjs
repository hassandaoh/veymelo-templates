// The sound, made from nothing (no samples) and from the data itself:
//   node tools/sound.mjs
// writes assets/score.wav (then veymelo ffmpeg -- -y -i assets/score.wav -c:a aac -b:a 192k assets/score.m4a)
// and assets/sfx/tick.wav. The score is a soft pad and pulse, and while the
// line draws, a tone whose pitch follows the line (src/data.json, src/timing.json).
import fs from 'node:fs';

const read = name => JSON.parse(fs.readFileSync(new URL(`../src/${name}`, import.meta.url), 'utf8'));
const data = read('data.json');
const time = read('timing.json');
const SR = 48000;
const FPS = 60;
const LEN = time.length / FPS;
const N = Math.round(SR * LEN);
const L = new Float32Array(N), R = new Float32Array(N);
const add = (t, v, pan = 0) => { const i = Math.round(t * SR); if (i >= 0 && i < N) { L[i] += v * (1 - pan); R[i] += v * (1 + pan); } };
const hz = midi => 440 * 2 ** ((midi - 69) / 12);

function wav(path, left, right = left) {
  let peak = 0;
  for (let i = 0; i < left.length; i++) peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  const g = 0.7 / (peak || 1), n = left.length, buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[i] * g)) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[i] * g)) * 32767), 46 + i * 4);
  }
  fs.writeFileSync(new URL(`../${path}`, import.meta.url), buf);
}

// A pad: Am9 – Fmaj7 – Cmaj7 – G6, one chord every 3.75 seconds.
const CHORDS = [[57, 60, 64, 71], [53, 57, 60, 64], [48, 55, 59, 64], [55, 59, 62, 64]];
CHORDS.forEach((chord, k) => {
  const start = k * 3.75, length = k === 3 ? LEN - start : 4.1;
  for (const note of chord) for (const detune of [-0.05, 0.05]) {
    const f = hz(note + detune);
    for (let s = 0; s < length * SR; s++) {
      const t = s / SR, env = Math.min(1, t / 0.9) * Math.min(1, (length - t) / 1.0);
      add(start + t, Math.sin(2 * Math.PI * f * t) * env * 0.016, detune * 6);
    }
  }
});
// A soft pulse on the beat (96 BPM) while the line draws.
for (let t = time.draw[0] / FPS; t < time.draw[1] / FPS; t += 60 / 96 * 2) {
  for (let s = 0; s < 0.12 * SR; s++) { const u = s / SR; add(t + u, Math.sin(2 * Math.PI * 70 * u) * Math.exp(-u * 30) * 0.1); }
}
// The data, heard: a tone that follows the line from the first month to the last.
{
  const values = data.values, lo = Math.min(...values), hi = Math.max(...values);
  const [from, to] = time.draw.map(f => f / FPS);
  let phase = 0;
  for (let s = 0; s < (to - from) * SR; s++) {
    const t = s / SR, p = (t / (to - from)) * (values.length - 1);
    const i = Math.min(values.length - 2, Math.floor(p)), v = values[i] + (values[i + 1] - values[i]) * (p - i);
    const f = 220 * 2 ** (((v - lo) / (hi - lo)) * 1.2); // a little over an octave, low to high
    phase += (2 * Math.PI * f) / SR;
    const env = Math.min(1, t / 0.3) * Math.min(1, (to - from - t) / 0.4);
    add(from + t, (Math.sin(phase) + 0.25 * Math.sin(2 * phase)) * env * 0.045, 0.2);
  }
}
wav('assets/score.wav', L, R);

// A tick for each milestone: a short, bright click.
{
  const n = Math.round(SR * 0.25), T = new Float32Array(n);
  for (let s = 0; s < n; s++) { const u = s / SR; T[s] = (Math.sin(2 * Math.PI * 1760 * u) * 0.6 + Math.sin(2 * Math.PI * 2640 * u) * 0.3) * Math.exp(-u * 40); }
  wav('assets/sfx/tick.wav', T);
}
console.log('assets/score.wav, assets/sfx/tick.wav');
