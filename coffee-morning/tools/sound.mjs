// The music and the effects, synthesized from nothing (no samples, no licences):
//   node tools/sound.mjs
// writes assets/score.wav (then: veymelo ffmpeg -- -y -i assets/score.wav -c:a aac -b:a 192k assets/score.m4a)
// and assets/sfx/birds.wav and pour.wav. 80 BPM, a bar every 3 seconds.
import fs from 'node:fs';

const SR = 48000;
let seed = 11;
const noise = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const hz = midi => 440 * 2 ** ((midi - 69) / 12);

function wav(path, L, R = L, gain = 1) {
  const n = L.length;
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = (0.7 / (peak || 1)) * gain;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4);
  }
  fs.writeFileSync(new URL(`../${path}`, import.meta.url), buf);
}

// The score: a warm pad and a soft plucked line, 80 BPM in D, 12 seconds.
{
  const LEN = 12, N = SR * LEN, BAR = 3, BEAT = 0.75;
  const L = new Float32Array(N), R = new Float32Array(N);
  const add = (t, v, pan = 0) => { const i = Math.round(t * SR); if (i >= 0 && i < N) { L[i] += v * (1 - pan); R[i] += v * (1 + pan); } };
  const CHORDS = [[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 66]]; // Dmaj7 Bm7 Gmaj7 A6
  CHORDS.forEach((chord, bar) => {
    const start = bar * BAR, length = bar === 3 ? LEN - start : BAR + 0.4;
    for (const note of chord) for (const detune of [-0.06, 0.06]) {
      const f = hz(note + detune);
      for (let s = 0; s < length * SR; s++) {
        const t = s / SR;
        const env = Math.min(1, t / 0.8) * Math.min(1, (length - t) / 0.9) * (0.85 + 0.15 * Math.sin(2 * Math.PI * 4.5 * t));
        add(start + t, (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t)) * env * 0.02, detune * 5);
      }
    }
  });
  // the pluck, from the pour on (bar 2), up through each chord
  for (let t = BAR, k = 0; t < 10.5; t += BEAT / 2, k++) {
    const chord = CHORDS[Math.min(3, Math.floor(t / BAR))];
    const f = hz(chord[[0, 2, 1, 3][k % 4]] + 12);
    for (let s = 0; s < 0.6 * SR; s++) { const u = s / SR; add(t + u, Math.sin(2 * Math.PI * f * u) * Math.exp(-u * 6) * 0.06, k % 2 ? 0.3 : -0.3); }
  }
  wav('assets/score.wav', L, R);
}

// Birds: two short chirps, each a quick upward sweep with a trill.
{
  const N = Math.round(SR * 0.7), L = new Float32Array(N);
  for (const [at, base] of [[0, 3200], [0.28, 3600]]) {
    let phase = 0;
    for (let s = 0; s < 0.16 * SR; s++) {
      const u = s / SR, f = base + 1800 * (u / 0.16) + 300 * Math.sin(2 * Math.PI * 45 * u);
      phase += (2 * Math.PI * f) / SR;
      const i = Math.round(at * SR) + s;
      if (i < N) L[i] += Math.sin(phase) * Math.sin(Math.PI * (u / 0.16)) * 0.5;
    }
  }
  wav('assets/sfx/birds.wav', L, L, 0.8);
}

// The pour: milk into espresso, noise through a soft filter, rising as the cup fills.
{
  const LEN = 3.2, N = Math.round(SR * LEN), L = new Float32Array(N), R = new Float32Array(N);
  let a = 0, b = 0;
  for (let s = 0; s < N; s++) {
    const u = s / SR, k = 0.05 + 0.1 * (u / LEN); // the filter opens a little as it fills
    a += k * (noise() - a); b += k * (a - b);
    const env = Math.min(1, u / 0.12) * Math.min(1, (LEN - u) / 0.35) * (0.8 + 0.2 * Math.sin(2 * Math.PI * 7 * u));
    L[s] = b * env; R[s] = b * env * 0.92;
  }
  wav('assets/sfx/pour.wav', L, R);
}

console.log('assets/score.wav, assets/sfx/birds.wav, pour.wav');
