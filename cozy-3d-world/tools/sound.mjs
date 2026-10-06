// The music and the effects, synthesized from nothing (no samples, no licences):
//   node tools/sound.mjs
// writes assets/score.wav (then: veymelo ffmpeg -- -y -i assets/score.wav -c:a aac -b:a 192k assets/score.m4a)
// and assets/sfx/waves.wav, gull.wav, bell.wav and lamp.wav. 90 BPM: a bar every 2.67 seconds,
// on the same grid as src/timing.ts.
import fs from 'node:fs';

const SR = 48000;
let seed = 7;
const noise = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const hz = midi => 440 * 2 ** ((midi - 69) / 12);
const TAU = Math.PI * 2;

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
  fs.mkdirSync(new URL('../assets/sfx/', import.meta.url), {recursive: true});
  fs.writeFileSync(new URL(`../${path}`, import.meta.url), buf);
}

// The score: a warm pad under a music-box tune, in F, 10 seconds. It opens
// out on the last bar, where the title comes.
{
  const LEN = 10, N = SR * LEN, BAR = 8 / 3, BEAT = BAR / 4;
  const L = new Float32Array(N), R = new Float32Array(N);
  const tone = (start, length, f, amp, pan, attack, shape) => {
    for (let s = Math.max(0, Math.round(start * SR)); s < Math.min(N, Math.round((start + length) * SR)); s++) {
      const t = s / SR - start;
      const env = shape(t, length, attack);
      const v = amp * env * (Math.sin(TAU * f * t) + 0.28 * Math.sin(TAU * 2 * f * t) + 0.08 * Math.sin(TAU * 3 * f * t));
      L[s] += v * (1 - pan);
      R[s] += v * (1 + pan);
    }
  };
  const pad = (t, length, attack) => Math.min(1, t / attack) * Math.min(1, (length - t) / 1.2);
  const pluck = (t, length) => Math.exp(-t * 3.2) * Math.min(1, t / 0.004) * Math.min(1, (length - t) / 0.05);
  // Fmaj7, Dm9, Bbmaj7 then C6, and Fmaj9 opening out under the title
  const CHORDS = [
    [0, BAR + 0.5, [41, 53, 57, 60, 64]],
    [BAR, BAR + 0.5, [38, 50, 53, 57, 64]],
    [BAR * 2, BAR / 2 + 0.4, [46, 50, 53, 57, 62]],
    [BAR * 2.5, BAR / 2 + 0.4, [48, 52, 55, 57, 64]],
    [BAR * 3, LEN - BAR * 3, [41, 53, 57, 60, 64, 67]],
  ];
  for (const [start, length, chord] of CHORDS) {
    chord.forEach((note, i) => {
      for (const detune of [-0.07, 0.07]) tone(start, length, hz(note + detune), i === 0 ? 0.05 : 0.026, detune * 3, start === BAR * 3 ? 1.4 : 0.6, pad);
    });
  }
  // the tune, one note a beat, a little busier as the island comes up
  const TUNE = [72, 69, 65, 69, 74, 72, 69, 65, 77, 74, 72, 67, 79, 76, 72];
  TUNE.forEach((note, i) => tone(i * BEAT + 0.02, 1.2, hz(note), 0.11, ((i % 3) - 1) * 0.3, 0, pluck));
  for (const [i, note] of [[0, 84], [1, 81], [2, 77], [3, 81]]) tone(BAR * 3 + i * BEAT * 0.5 + 0.1, 1.6, hz(note), 0.07, (i - 1.5) * 0.25, 0, pluck);
  wav('assets/score.wav', L, R, 0.9);
}

// Waves on the shore: soft noise, rising and falling, wider than the picture.
{
  const N = SR * 10;
  const L = new Float32Array(N), R = new Float32Array(N);
  let a = 0, b = 0;
  for (let s = 0; s < N; s++) {
    const t = s / SR;
    a += (noise() - a) * 0.035;
    b += (noise() - b) * 0.035;
    const swell = 0.45 + 0.55 * Math.max(0, Math.sin(TAU * t / 3.7 + 0.6)) ** 2 + 0.2 * Math.max(0, Math.sin(TAU * t / 2.3 + 2)) ** 3;
    const fade = Math.min(1, t / 0.6) * Math.min(1, (10 - t) / 0.8);
    L[s] = a * swell * fade;
    R[s] = b * swell * fade;
  }
  wav('assets/sfx/waves.wav', L, R, 0.8);
}

// A gull: two calls, each a falling cry.
{
  const N = Math.round(SR * 1.5);
  const L = new Float32Array(N);
  for (const [start, length, from, to] of [[0, 0.36, 1900, 1150], [0.5, 0.26, 1750, 1200]]) {
    let phase = 0;
    for (let s = Math.round(start * SR); s < Math.round((start + length) * SR); s++) {
      const t = s / SR - start;
      const u = t / length;
      const f = from + (to - from) * u + Math.sin(TAU * 28 * t) * 40;
      phase += (TAU * f) / SR;
      const env = Math.sin(Math.PI * Math.min(1, u * 1.15)) ** 1.5;
      L[s] += env * (Math.sin(phase) + 0.45 * Math.sin(2 * phase) + 0.2 * Math.sin(3 * phase) + 0.08 * noise());
    }
  }
  wav('assets/sfx/gull.wav', L, L, 0.7);
}

// The harbour bell, struck once as the boat ties up.
{
  const N = SR * 3;
  const L = new Float32Array(N);
  const base = 620;
  for (const [ratio, amp, decay] of [[1, 1, 1.4], [2.0, 0.5, 1.9], [2.76, 0.35, 2.6], [5.4, 0.18, 4], [8.9, 0.08, 6]]) {
    for (let s = 0; s < N; s++) {
      const t = s / SR;
      L[s] += amp * Math.exp(-t * decay) * Math.min(1, t / 0.002) * Math.sin(TAU * base * ratio * t);
    }
  }
  wav('assets/sfx/bell.wav', L, L, 0.8);
}

// The lamp coming on: the switch, then the light's soft hum.
{
  const N = SR * 1;
  const L = new Float32Array(N);
  for (let s = 0; s < N; s++) {
    const t = s / SR;
    const thunk = Math.exp(-t * 30) * (Math.sin(TAU * 95 * t) * 0.9 + noise() * Math.exp(-t * 120) * 0.5);
    const hum = Math.min(1, t / 0.25) * Math.min(1, (1 - t) / 0.3) * 0.18 * (Math.sin(TAU * 240 * t) + 0.5 * Math.sin(TAU * 360 * t)) * (0.8 + 0.2 * Math.sin(TAU * 7 * t));
    L[s] = thunk + hum;
  }
  wav('assets/sfx/lamp.wav', L, L, 0.7);
}
