// The music and the effects, synthesized from nothing (no samples, no licences):
//   node tools/sound.mjs
// writes assets/score.wav (then: veymelo ffmpeg -- -y -i assets/score.wav -c:a aac -b:a 192k assets/score.m4a),
// assets/sfx/nib.wav (the pen on paper, which the video only lets through
// while the pen draws), engine.wav (the engine running: a beat a turn and a
// half a second, as src/story.ts turns it) and note0.wav to note2.wav (a soft
// note as each part of the story begins). 90 BPM. The long ones go in as
// m4a: for each of score, sfx/nib and sfx/engine,
//   veymelo ffmpeg -- -y -i assets/<name>.wav -c:a aac -b:a 160k assets/<name>.m4a
import fs from 'node:fs';

const SR = 48000;
const TAU = Math.PI * 2;
let seed = 3;
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
  fs.mkdirSync(new URL('../assets/sfx/', import.meta.url), {recursive: true});
  fs.writeFileSync(new URL(`../${path}`, import.meta.url), buf);
}

/** A felt-piano-like note: a few partials, soft attack, long gentle decay. */
function note(L, R, start, f, amp, pan = 0, decay = 1.6) {
  const N = L.length;
  for (let s = Math.max(0, Math.round(start * SR)); s < N; s++) {
    const t = s / SR - start;
    if (t > 6) break;
    const env = Math.min(1, t / 0.012) * Math.exp(-t * decay);
    const v = amp * env * (Math.sin(TAU * f * t) + 0.32 * Math.sin(TAU * 2 * f * t) * Math.exp(-t * 2) + 0.12 * Math.sin(TAU * 3.01 * f * t) * Math.exp(-t * 3));
    L[s] += v * (1 - pan);
    R[s] += v * (1 + pan);
  }
}

// The score: quiet, mostly air. A low pad and a few notes that leave room
// for the pen; it gathers as the engine starts, and opens out under the name.
{
  const LEN = 16.5, N = Math.round(SR * LEN), BEAT = 60 / 90;
  const L = new Float32Array(N), R = new Float32Array(N);
  const pad = (start, length, chord, amp) => {
    for (const m of chord) for (const detune of [-0.05, 0.05]) {
      const f = hz(m + detune);
      for (let s = Math.round(start * SR); s < Math.min(N, Math.round((start + length) * SR)); s++) {
        const t = s / SR - start;
        const env = Math.min(1, t / 1.2) * Math.min(1, (length - t) / 1.5);
        const v = amp * env * (Math.sin(TAU * f * t) + 0.18 * Math.sin(TAU * 2 * f * t));
        L[s] += v * (1 - detune * 4);
        R[s] += v * (1 + detune * 4);
      }
    }
  };
  pad(0, 3.6, [45, 52, 57, 64], 0.022); // A minor, open, under the words
  pad(3.0, 7.0, [41, 48, 57, 64], 0.02); // F, A on top, while the machine is drawn
  pad(9.4, 3.2, [43, 50, 55, 62], 0.024); // G as it starts
  pad(12.0, 4.5, [48, 55, 60, 64, 67], 0.026); // C, opening out under the name
  const TUNE = [[0.3, 76], [1.6, 72], [2.3, 74], [3.6, 76], [5.0, 72], [6.4, 77], [7.7, 76], [9.0, 74], [9.8, 79], [11.0, 76], [11.7, 79], [12.4, 84], [13.4, 79]];
  TUNE.forEach(([t, m], i) => note(L, R, t, hz(m), 0.07, ((i % 3) - 1) * 0.25));
  void BEAT;
  wav('assets/score.wav', L, R, 0.85);
}

// The nib on paper: fine grainy noise with the tiny stutters of a pen's
// grain, bright but soft. The video turns it up only while the pen draws.
{
  const N = Math.round(SR * 16.5);
  const L = new Float32Array(N), R = new Float32Array(N);
  let lp = 0, hp = 0, prev = 0;
  for (let s = 0; s < N; s++) {
    const t = s / SR;
    const x = noise();
    lp += (x - lp) * 0.35; // soften the very top
    hp = lp - prev; // and take away the rumble
    prev = lp;
    const grain = 0.55 + 0.45 * Math.abs(Math.sin(TAU * 31 * t + Math.sin(TAU * 7 * t) * 3)) * (0.7 + 0.3 * noise());
    L[s] = hp * grain;
    R[s] = hp * grain * 0.92 + noise() * 0.02;
  }
  wav('assets/sfx/nib.wav', L, R, 0.55);
}

// The engine: a soft thump each time a cylinder fires (twice a turn, a turn
// and a half a second), the tick of the valves between, and a low hum.
{
  const LEN = 8, N = SR * LEN;
  const L = new Float32Array(N), R = new Float32Array(N);
  const FIRE = 1 / 3; // seconds between firings
  for (let s = 0; s < N; s++) {
    const t = s / SR;
    const since = t % FIRE, n = Math.floor(t / FIRE);
    const thump = Math.exp(-since * 22) * (Math.sin(TAU * 58 * since) + 0.5 * Math.sin(TAU * 87 * since)) * (n % 2 ? 0.85 : 1);
    const tick = Math.exp(-((t + FIRE / 2) % (FIRE / 2)) * 160) * noise() * 0.18;
    const hum = 0.12 * Math.sin(TAU * 44 * t + 0.6 * Math.sin(TAU * 3 * t)) + 0.05 * Math.sin(TAU * 88 * t);
    const body = thump * 0.8 + tick + hum;
    L[s] = body;
    R[s] = body * 0.92 + tick * 0.2;
  }
  wav('assets/sfx/engine.wav', L, R, 0.75);
}

// A soft note as each part begins, rising through the chord.
[69, 76, 81].forEach((m, i) => {
  const N = SR * 2;
  const L = new Float32Array(N), R = new Float32Array(N);
  note(L, R, 0, hz(m), 1, (i - 1) * 0.2, 2.2);
  wav(`assets/sfx/note${i}.wav`, L, R, 0.6);
});
