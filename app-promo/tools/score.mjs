// The music bed, synthesized from nothing (no samples, no licences).
// node tools/score.mjs → assets/score.wav, then:
//   veymelo ffmpeg -- -y -i assets/score.wav -c:a aac -b:a 192k assets/score.m4a
// 120 BPM in F major, a bar every 2 seconds (src/timing.ts): pad alone for the
// hook, the beat from bar 2 when the phone arrives, the last chord rings out
// under the end card.
import fs from 'node:fs';

const SR = 48000;
const LEN = 15;
const N = SR * LEN;
const BEAT = 0.5;
const BAR = 2;
const L = new Float32Array(N);
const R = new Float32Array(N);

let seed = 7;
const noise = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const hz = midi => 440 * 2 ** ((midi - 69) / 12);
const add = (t, value, pan = 0) => {
  const i = Math.round(t * SR);
  if (i < 0 || i >= N) return;
  L[i] += value * (1 - pan) * 0.5 + value * 0.5;
  R[i] += value * (1 + pan) * 0.5 + value * 0.5;
};

const CHORDS = [
  [53, 57, 60, 64], // Fmaj7
  [50, 53, 57, 60], // Dm7
  [46, 50, 53, 57], // Bbmaj7
  [48, 52, 55, 60], // C
  [53, 57, 60, 64],
  [50, 53, 57, 60],
  [46, 50, 53, 57],
  [53, 57, 60, 67], // F add9, to the end
];
const chordAt = t => CHORDS[Math.min(CHORDS.length - 1, Math.floor(t / BAR))];

// Pad: three soft, slightly detuned sines per note, breathing in over each bar.
for (let bar = 0; bar < CHORDS.length; bar++) {
  const start = bar * BAR;
  const length = bar === CHORDS.length - 1 ? LEN - start : BAR + 0.3;
  for (const note of CHORDS[bar]) {
    for (const detune of [-0.08, 0, 0.08]) {
      const f = hz(note + 12 + detune);
      for (let s = 0; s < length * SR; s++) {
        const t = s / SR;
        const env = Math.min(1, t / 0.45) * Math.min(1, (length - t) / 0.6);
        add(start + t, Math.sin(2 * Math.PI * f * t) * env * 0.026, detune * 4);
      }
    }
  }
}

// Kick on every beat and a closed hat on the off-beats, from bar 2 until the end card.
for (let t = BAR; t < 12; t += BEAT) {
  for (let s = 0; s < 0.3 * SR; s++) {
    const u = s / SR;
    const f = 45 + 80 * Math.exp(-u * 30);
    add(t + u, Math.sin(2 * Math.PI * f * u) * Math.exp(-u * 11) * 0.3);
  }
  let last = 0;
  for (let s = 0; s < 0.04 * SR; s++) {
    const n = noise();
    add(t + BEAT / 2 + s / SR, (n - last) * Math.exp(-s / SR * 90) * 0.05, 0.3);
    last = n;
  }
}

// Pluck: an arpeggio on the eighths, up through the chord, from bar 2.
for (let t = BAR, k = 0; t < 12; t += BEAT / 2, k++) {
  const chord = chordAt(t);
  const note = chord[k % chord.length] + 24;
  for (let s = 0; s < 0.35 * SR; s++) {
    const u = s / SR;
    const env = Math.exp(-u * 9);
    add(t + u, (Math.sin(2 * Math.PI * hz(note) * u) + 0.3 * Math.sin(4 * Math.PI * hz(note) * u)) * env * 0.07, k % 2 ? 0.25 : -0.25);
  }
}

// The end: the last chord as soft bells.
for (const [i, note] of [65, 69, 72, 79].entries()) {
  for (let s = 0; s < 3 * SR; s++) {
    const u = s / SR;
    add(12.5 + i * 0.06 + u, Math.sin(2 * Math.PI * hz(note) * u) * Math.exp(-u * 1.4) * 0.05, (i - 1.5) * 0.2);
  }
}

let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = 0.7 / peak; // -3 dBFS
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * gain)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * gain)) * 32767), 46 + i * 4);
}
fs.writeFileSync(new URL('../assets/score.wav', import.meta.url), buf);
console.log('assets/score.wav', LEN + 's');
