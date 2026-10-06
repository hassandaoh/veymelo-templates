// The score and the effects, synthesized from nothing (no samples, no licences).
// node tools/score.mjs  →  assets/score.wav and assets/sfx/*.wav
// 120 BPM, 48 kHz stereo. Sections follow the screens in src/timing.ts.
import fs from 'node:fs';

const SR = 48000;
const BPM = 120;
const BEAT = 60 / BPM; // 0.5 s
const BAR = BEAT * 4; // 2 s
const LEN = 90;
const N = Math.round(SR * LEN);

// Deterministic noise.
let seed = 12345;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const noise = () => rnd() * 2 - 1;

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

function writeWav(path, L, R) {
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    const l = Math.max(-1, Math.min(1, L[i]));
    const r = Math.max(-1, Math.min(1, R[i]));
    buf.writeInt16LE(Math.round(l * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(r * 32767), 46 + i * 4);
  }
  fs.writeFileSync(path, buf);
}

// ---------------------------------------------------------------- the song
// Sections in seconds (the screens): hook 0-5, get 5-10, setup 10-18, live 18-32,
// results 32-56, montage 56-71, wall 71-77, code 77-83, end 83-90.
const drums = new Float32Array(N); // mono bus
const bassBus = new Float32Array(N);
const padL = new Float32Array(N), padR = new Float32Array(N);
const leadL = new Float32Array(N), leadR = new Float32Array(N);
const fxL = new Float32Array(N), fxR = new Float32Array(N);
const send = new Float32Array(N); // reverb send (mono in)

// A minor: Am F C G, one chord a bar. Roots and voicings (MIDI).
const CHORDS = [
  {root: 45, notes: [57, 60, 64, 69]}, // Am
  {root: 41, notes: [57, 60, 65, 69]}, // F
  {root: 48, notes: [55, 60, 64, 67]}, // C
  {root: 43, notes: [55, 59, 62, 67]}, // G
];
const chordAt = (t) => CHORDS[Math.floor(t / BAR) % 4];

const add = (bus, start, arr, gain = 1) => {
  const s0 = Math.round(start * SR);
  for (let i = 0; i < arr.length; i++) {
    const j = s0 + i;
    if (j >= 0 && j < N) bus[j] += arr[i] * gain;
  }
};

// --- instruments (return Float32Array)
function kick(gain = 1) {
  const n = Math.round(SR * 0.45);
  const out = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 45 + 110 * Math.exp(-t * 28);
    ph += (2 * Math.PI * f) / SR;
    const env = Math.exp(-t * 7.5);
    const click = i < 90 ? noise() * 0.25 * (1 - i / 90) : 0;
    out[i] = (Math.sin(ph) * env + click) * gain;
  }
  return out;
}
function snare(gain = 1) {
  const n = Math.round(SR * 0.3);
  const out = new Float32Array(n);
  let lp = 0, hp = 0, prev = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const w = noise();
    lp += 0.45 * (w - lp);
    hp = lp - prev; prev = lp;
    const body = Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t * 30) * 0.5;
    out[i] = (hp * 1.6 * Math.exp(-t * 16) + body) * gain;
  }
  return out;
}
function clap(gain = 1) {
  const n = Math.round(SR * 0.25);
  const out = new Float32Array(n);
  let bp1 = 0, bp2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const bursts = [0, 0.011, 0.022].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 90) : 0), 0) + Math.exp(-t * 14) * 0.6;
    const w = noise();
    bp1 += 0.35 * (w - bp1);
    bp2 += 0.35 * (bp1 - bp2);
    out[i] = (bp1 - bp2) * 2.2 * bursts * gain;
  }
  return out;
}
function hat(open = false, gain = 1) {
  const n = Math.round(SR * (open ? 0.28 : 0.05));
  const out = new Float32Array(n);
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const w = noise();
    const hp = w - prev; prev = w;
    out[i] = hp * Math.exp(-t * (open ? 11 : 70)) * 0.5 * gain;
  }
  return out;
}
function bassNote(m, dur, gain = 1) {
  const n = Math.round(SR * dur);
  const out = new Float32Array(n);
  const f = mtof(m);
  let ph = 0, lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph = (ph + f / SR) % 1;
    const saw = ph * 2 - 1;
    const sub = Math.sin(2 * Math.PI * ph);
    const cutoff = 0.04 + 0.12 * Math.exp(-t * 9);
    lp += cutoff * (saw - lp);
    const env = Math.min(1, t / 0.006) * Math.min(1, (dur - t) / 0.03) * (0.75 + 0.25 * Math.exp(-t * 5));
    out[i] = (lp * 0.55 + sub * 0.65) * env * gain;
  }
  return out;
}
function padChord(notes, dur, bright, gain = 1) {
  const n = Math.round(SR * dur);
  const L = new Float32Array(n), R = new Float32Array(n);
  const voices = [];
  for (const m of notes) for (const d of [-0.09, 0.0, 0.08]) voices.push({f: mtof(m) * Math.pow(2, d / 12), ph: rnd(), pan: d});
  let lpL = 0, lpR = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let l = 0, r = 0;
    for (const v of voices) {
      v.ph = (v.ph + v.f / SR) % 1;
      const s = v.ph * 2 - 1;
      l += s * (0.5 - v.pan * 3);
      r += s * (0.5 + v.pan * 3);
    }
    const c = 0.015 + 0.05 * bright;
    lpL += c * (l - lpL);
    lpR += c * (r - lpR);
    const env = Math.min(1, t / 0.35) * Math.min(1, (dur - t) / 0.4);
    L[i] = lpL * env * gain * 0.09;
    R[i] = lpR * env * gain * 0.09;
  }
  return [L, R];
}
function pluck(m, gain = 1, decay = 7) {
  const n = Math.round(SR * 0.6);
  const out = new Float32Array(n);
  const f = mtof(m);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const s = Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 14) + 0.12 * Math.sin(6 * Math.PI * f * t) * Math.exp(-t * 20);
    out[i] = s * Math.exp(-t * decay) * Math.min(1, t / 0.002) * gain;
  }
  return out;
}
function riser(dur, gain = 1) {
  const n = Math.round(SR * dur);
  const out = new Float32Array(n);
  let bp1 = 0, bp2 = 0;
  for (let i = 0; i < n; i++) {
    const k = i / n;
    const c = 0.02 + 0.5 * k * k;
    const w = noise();
    bp1 += c * (w - bp1);
    bp2 += c * (bp1 - bp2);
    out[i] = (bp1 - bp2) * Math.pow(k, 2.2) * gain * 1.4;
  }
  return out;
}
function impact(gain = 1) {
  const n = Math.round(SR * 2.4);
  const out = new Float32Array(n);
  let ph = 0, lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 38 + 70 * Math.exp(-t * 10);
    ph += (2 * Math.PI * f) / SR;
    lp += 0.08 * (noise() - lp);
    out[i] = (Math.sin(ph) * Math.exp(-t * 2.2) * 0.9 + lp * Math.exp(-t * 3) * 0.8) * gain;
  }
  return out;
}

// --- arrangement
const sections = [
  // name, from, to, levels
  {from: 0, to: 2, kick: 0, snare: 0, hats: 0, bass: 0, pad: 0.55, bright: 0.1, arp: 0},
  {from: 2, to: 10, kick: 1, snare: 0.7, hats: 1, bass: 1, pad: 0.8, bright: 0.6, arp: 0.6},
  {from: 10, to: 18, kick: 0.6, snare: 0, hats: 0.5, bass: 0.6, pad: 0.6, bright: 0.25, arp: 0.8},
  {from: 18, to: 32, kick: 0.85, snare: 0.5, hats: 0.8, bass: 0.9, pad: 0.7, bright: 0.45, arp: 0.7},
  // the six results, each scored to its picture (src/scenes/Results.tsx: world, perfume, mountains, kinetic, isocity, shapes)
  {from: 32, to: 36, kick: 1, snare: 0.6, hats: 0.8, bass: 1, pad: 0.95, bright: 0.8, arp: 0.9, lead: 0.8},
  {from: 36, to: 40, kick: 0.6, snare: 0, hats: 0.3, bass: 0.7, pad: 1, bright: 0.95, arp: 0.5, lead: 0.5},
  {from: 40, to: 44, kick: 0.6, snare: 0, hats: 0, bass: 0.8, pad: 1.15, bright: 0.6, arp: 0.9},
  {from: 44, to: 48, kick: 1, snare: 1, hats: 1.2, bass: 1.05, pad: 0.7, bright: 0.7, arp: 0.4, lead: 0, claps: 1},
  {from: 48, to: 52, kick: 1, snare: 1, hats: 1.2, bass: 1, pad: 0.8, bright: 0.8, arp: 1, lead: 1},
  {from: 52, to: 56, kick: 1, snare: 0.8, hats: 1, bass: 1, pad: 0.85, bright: 0.85, arp: 1, lead: 1},
  {from: 56, to: 71, kick: 1, snare: 1, hats: 1.2, bass: 1.05, pad: 0.9, bright: 0.9, arp: 1, lead: 1, open: 1},
  {from: 71, to: 77, kick: 0, snare: 0, hats: 0.4, bass: 0.9, pad: 1.1, bright: 1, arp: 0.7, lead: 0.6},
  {from: 77, to: 83, kick: 0.7, snare: 0, hats: 0.5, bass: 0.6, pad: 0.6, bright: 0.35, arp: 0.7},
  {from: 83, to: 90, kick: 0, snare: 0, hats: 0, bass: 0, pad: 0.7, bright: 0.4, arp: 0},
];
const sec = (t) => sections.find((s) => t >= s.from && t < s.to) || sections[sections.length - 1];

const KICK = kick(), SNARE = snare(), CLAP = clap(), HAT = hat(false), OHAT = hat(true);

for (let step = 0; step < LEN / (BEAT / 4); step++) {
  const t = step * (BEAT / 4); // sixteenths
  const s = sec(t);
  const inBeat = step % 4; // sixteenth within beat
  const beat = Math.floor(step / 4) % 4;
  // kick: four on the floor; in setup (half energy) on 1 and 3
  if (inBeat === 0 && s.kick > 0) {
    if (s.kick >= 0.8 || beat % 2 === 0) add(drums, t, KICK, 0.95 * Math.min(1, s.kick + 0.15));
  }
  // the kinetic stretch: a clap on every beat, with the words
  if (s.claps && inBeat === 0) add(drums, t, CLAP, 0.42);
  // snare + clap on 2 and 4
  if (inBeat === 0 && (beat === 1 || beat === 3) && s.snare > 0) {
    add(drums, t, SNARE, 0.42 * s.snare);
    add(drums, t, CLAP, 0.5 * s.snare);
    add(send, t, CLAP, 0.25 * s.snare);
  }
  // hats: offbeat 8ths, plus 16ths when hats > 0.9
  if (s.hats > 0) {
    const vel = (inBeat === 2 ? 1 : 0.45) * (0.85 + 0.3 * rnd());
    if (inBeat === 2 || (s.hats > 0.9 && inBeat % 2 === 1)) add(drums, t, HAT, 0.5 * s.hats * vel);
    if (s.open && inBeat === 2 && beat === 3) add(drums, t, OHAT, 0.32);
  }
}

// bass: eighth-note pulse on the root, octave jump on the last eighth of the bar
for (let e = 0; e < LEN / (BEAT / 2); e++) {
  const t = e * (BEAT / 2);
  const s = sec(t);
  if (!s.bass) continue;
  const c = chordAt(t);
  const isLast = e % 8 === 7;
  const m = c.root - 12 + (isLast ? 12 : 0);
  // in calm sections play only on beats
  if (s.bass < 0.8 && e % 2 === 1) continue;
  add(bassBus, t, bassNote(m, BEAT / 2 - 0.02), 0.32 * s.bass);
}

// pad: one chord per bar, crossfaded
for (let bar = 0; bar < LEN / BAR; bar++) {
  const t = bar * BAR;
  const s = sec(t + 0.01);
  if (!s.pad) continue;
  const c = CHORDS[bar % 4];
  const isLast = t >= 83;
  const dur = isLast ? 7 : BAR + 0.4;
  const notes = isLast ? [45, 57, 60, 64, 71, 76] : c.notes; // Am(add9) to end, resolved
  const [L, R] = padChord(notes, dur, s.bright, s.pad);
  add(padL, t - 0.2, L);
  add(padR, t - 0.2, R);
  for (let i = 0; i < L.length; i += 1) send[Math.round((t - 0.2) * SR) + i] += (L[i] + R[i]) * 0.25;
}

// arp: sixteenths over chord tones, up an octave in the montage
for (let step = 0; step < LEN / (BEAT / 4); step++) {
  const t = step * (BEAT / 4);
  const s = sec(t);
  if (!s.arp) continue;
  if (t < 10 && step % 2 === 1) continue; // eighths in the hook
  const c = chordAt(t);
  const pattern = [0, 1, 2, 3, 2, 1, 3, 2];
  const m = c.notes[pattern[step % 8]] + 12 + (s.open ? 12 : 0);
  const p = pluck(m, 0.12 * s.arp * (step % 4 === 0 ? 1 : 0.7), 9);
  const pan = Math.sin(step * 0.7) * 0.4;
  add(leadL, t, p, 0.5 - pan);
  add(leadR, t, p, 0.5 + pan);
  add(send, t, p, 0.35);
}

// lead hook: a short motif in the results and montage (bars of 4 notes)
const MOTIF = [76, 74, 72, 69, 72, 74, 76, 79];
for (let q = 0; q < LEN / BEAT; q++) {
  const t = q * BEAT;
  const s = sec(t);
  if (!s.lead) continue;
  if (q % 8 >= 6) continue; // breathe at the end of each two bars
  const c = chordAt(t);
  let m = MOTIF[q % 8];
  if (!c.notes.some((n) => (n - m) % 12 === 0) && q % 2 === 0) m = c.notes[3] + 12; // land on chord tones on strong beats
  const p = pluck(m, 0.1 * s.lead, 4.5);
  add(leadL, t, p, 0.55);
  add(leadR, t, p, 0.45);
  add(send, t, p, 0.5);
}

// risers and impacts on the section changes
add(fxL, 0.6, riser(1.4), 0.25); add(fxR, 0.6, riser(1.4), 0.25);
const IMP = impact();
for (const t of [2, 32, 36, 40, 44, 48, 52, 56, 71]) {
  const g2 = t === 2 ? 0.75 : [32, 56, 71].includes(t) ? 0.55 : 0.32;
  add(fxL, t, IMP, g2);
  add(fxR, t, IMP, g2);
}
for (const [t, d] of [[30, 2], [43, 1], [54, 2], [69, 2]]) {
  const r = riser(d);
  add(fxL, t, r, 0.22); add(fxR, t, r, 0.22);
}

// --- reverb (Schroeder): 4 combs, 2 allpasses, on the send
function reverb(input) {
  const combs = [1557, 1617, 1491, 1422].map((d) => ({d: Math.round(d * SR / 44100), buf: new Float32Array(Math.round(d * SR / 44100)), i: 0, fb: 0.84, lp: 0}));
  const aps = [225, 556].map((d) => ({d: Math.round(d * SR / 44100), buf: new Float32Array(Math.round(d * SR / 44100)), i: 0}));
  const out = new Float32Array(input.length);
  for (let n = 0; n < input.length; n++) {
    let s = 0;
    for (const c of combs) {
      const y = c.buf[c.i];
      c.lp = y * 0.7 + c.lp * 0.3;
      c.buf[c.i] = input[n] + c.lp * c.fb;
      c.i = (c.i + 1) % c.d;
      s += y;
    }
    for (const a of aps) {
      const y = a.buf[a.i];
      const x = s + y * -0.5;
      a.buf[a.i] = x;
      a.i = (a.i + 1) % a.d;
      s = y + x * 0.5;
    }
    out[n] = s * 0.25;
  }
  return out;
}
const wet = reverb(send);

// --- sidechain duck from the kick (pump) on pad, bass and lead
const kickTimes = [];
for (let q = 0; q < LEN / BEAT; q++) {
  const t = q * BEAT;
  const s = sec(t);
  if (s.kick > 0 && (s.kick >= 0.8 || q % 2 === 0)) kickTimes.push(t);
}
const duck = new Float32Array(N).fill(1);
for (const t of kickTimes) {
  const s0 = Math.round(t * SR);
  for (let i = 0; i < SR * 0.3; i++) {
    const j = s0 + i;
    if (j < N) duck[j] = Math.min(duck[j], 1 - 0.55 * Math.exp(-i / SR / 0.08));
  }
}

// --- mix
const L = new Float32Array(N), R = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const t = i / SR;
  // the energy curve: the live scene climbs, the montage is the loudest stretch
  const db = t < 18 ? 0 : t < 32 ? -3.5 + 3 * ((t - 18) / 14) : t < 56 ? 0 : t < 71 ? 1.2 : 0;
  const fadeOut = (t > 87 ? Math.max(0, (90 - t) / 3) : 1) * Math.pow(10, db / 20);
  const d = duck[i];
  const l = drums[i] * 0.8 + bassBus[i] * d + padL[i] * d + leadL[i] * d + fxL[i] + wet[i] * 0.9;
  const r = drums[i] * 0.8 + bassBus[i] * d + padR[i] * d + leadR[i] * d + fxR[i] + wet[(i + 331) % N] * 0.9;
  L[i] = l * fadeOut;
  R[i] = r * fadeOut;
}
// soft clip and normalise to -3 dBFS peak (loudness is set at delivery)
let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * 1.2);
  R[i] = Math.tanh(R[i] * 1.2);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const g = 0.708 / peak;
for (let i = 0; i < N; i++) { L[i] *= g; R[i] *= g; }
fs.mkdirSync('assets/sfx', {recursive: true});
writeWav('assets/score.wav', L, R);

// ---------------------------------------------------------------- effects
const mono = (arr, name, gain = 1) => {
  let p = 0;
  for (const v of arr) p = Math.max(p, Math.abs(v));
  const a = arr.map((v) => (v / p) * 0.7 * gain);
  writeWav(`assets/sfx/${name}.wav`, a, a);
};
function keyClick(pitch) {
  const n = Math.round(SR * 0.04);
  const out = new Float32Array(n);
  let bp1 = 0, bp2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    bp1 += 0.5 * (noise() - bp1);
    bp2 += 0.5 * (bp1 - bp2);
    out[i] = ((bp1 - bp2) * Math.exp(-t * 260) + Math.sin(2 * Math.PI * pitch * t) * Math.exp(-t * 180) * 0.4);
  }
  return out;
}
for (let k = 0; k < 4; k++) mono(keyClick(1800 + k * 260), `key${k}`, 0.55);
{
  const n = Math.round(SR * 0.22);
  const out = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (90 + 160 * Math.exp(-t * 40))) / SR;
    out[i] = Math.sin(ph) * Math.exp(-t * 22) + noise() * 0.3 * Math.exp(-t * 120);
  }
  mono(out, 'enter', 0.9);
}
{
  const n = Math.round(SR * 0.12);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    out[i] = Math.sin(2 * Math.PI * 2093 * t) * Math.exp(-t * 45) + Math.sin(2 * Math.PI * 3136 * t) * Math.exp(-t * 70) * 0.4;
  }
  mono(out, 'tick', 0.5);
}
{
  const n = Math.round(SR * 0.6);
  const out = new Float32Array(n);
  let bp1 = 0, bp2 = 0;
  for (let i = 0; i < n; i++) {
    const k = i / n;
    const c = 0.03 + 0.25 * Math.sin(Math.PI * k);
    bp1 += c * (noise() - bp1);
    bp2 += c * (bp1 - bp2);
    out[i] = (bp1 - bp2) * Math.pow(Math.sin(Math.PI * k), 2);
  }
  mono(out, 'whoosh', 0.6);
}
{
  const n = Math.round(SR * 0.1);
  const out = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (500 + 700 * (1 - Math.exp(-t * 60)))) / SR;
    out[i] = Math.sin(ph) * Math.exp(-t * 40);
  }
  mono(out, 'pop', 0.5);
}
{
  const n = Math.round(SR * 0.03);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = noise() * Math.exp(-(i / SR) * 400) + Math.sin(2 * Math.PI * 900 * i / SR) * Math.exp(-(i / SR) * 300) * 0.5;
  mono(out, 'click', 0.5);
}
{
  const n = Math.round(SR * 1.6);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const a = Math.sin(2 * Math.PI * 1318.5 * t) * Math.exp(-t * 3.5);
    const b2 = t > 0.09 ? Math.sin(2 * Math.PI * 1975.5 * (t - 0.09)) * Math.exp(-(t - 0.09) * 3) : 0;
    out[i] = (a + b2 * 0.8) * Math.min(1, t / 0.003);
  }
  mono(out, 'chime', 0.55);
}
// --- effects caused by the results' own pictures
const env = (n, fn) => {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = fn(i / SR, i);
  return out;
};
{
  // hit: a punchy low thump with a snap (words landing, the poster)
  let ph = 0, lp = 0;
  mono(env(Math.round(SR * 0.4), (t) => {
    ph += (2 * Math.PI * (55 + 140 * Math.exp(-t * 30))) / SR;
    lp += 0.3 * (noise() - lp);
    return Math.sin(ph) * Math.exp(-t * 9) + lp * Math.exp(-t * 40) * 0.8;
  }), 'hit', 0.95);
}
{
  // thud: a soft low landing
  let ph = 0;
  mono(env(Math.round(SR * 0.3), (t) => {
    ph += (2 * Math.PI * (70 + 60 * Math.exp(-t * 25))) / SR;
    return Math.sin(ph) * Math.exp(-t * 14);
  }), 'thud', 0.85);
}
{
  // paper: crinkle bursts (collage pieces)
  let bp1 = 0, bp2 = 0;
  mono(env(Math.round(SR * 0.18), (t) => {
    bp1 += 0.6 * (noise() - bp1);
    bp2 += 0.6 * (bp1 - bp2);
    const grains = Math.abs(Math.sin(t * 900 + Math.sin(t * 2300) * 3));
    return (bp1 - bp2) * Math.exp(-t * 22) * (0.4 + grains);
  }), 'paper', 0.7);
}
// beep: the countdown
mono(env(Math.round(SR * 0.16), (t) => Math.sin(2 * Math.PI * 1046.5 * t) * Math.min(1, t / 0.004) * Math.exp(-t * 18)), 'beep', 0.5);
{
  // shimmer: a soft cluster of high bells (light passing, a title arriving)
  const notes = [2093, 2637, 3136, 3951, 2349];
  mono(env(Math.round(SR * 1.6), (t) => notes.reduce((a, fr, i) => {
    const o = i * 0.05;
    return a + (t > o ? Math.sin(2 * Math.PI * fr * (t - o)) * Math.exp(-(t - o) * 3.2) * 0.25 : 0);
  }, 0) * Math.min(1, t / 0.01)), 'shimmer', 0.45);
}
{
  // plop: a pitched pop (things popping into place: buildings, ingredients)
  let ph = 0;
  mono(env(Math.round(SR * 0.13), (t) => {
    ph += (2 * Math.PI * (320 + 520 * (1 - Math.exp(-t * 45)))) / SR;
    return Math.sin(ph) * Math.exp(-t * 32);
  }), 'plop', 0.5);
}
// bloom: a soft bell (flowers opening, the name landing)
mono(env(Math.round(SR * 1.8), (t) => (Math.sin(2 * Math.PI * 659.3 * t) + 0.4 * Math.sin(2 * Math.PI * 1318.5 * t) * Math.exp(-t * 2) + 0.25 * Math.sin(2 * Math.PI * 987.8 * t)) * Math.exp(-t * 2.4) * Math.min(1, t / 0.015)), 'bloom', 0.45);
{
  // swell: air rising and settling (a 3D world opening, light filling a room)
  let bp1 = 0, bp2 = 0;
  const n = Math.round(SR * 1.8);
  mono(env(n, (t) => {
    const k2 = t / 1.8;
    const c = 0.02 + 0.12 * Math.sin(Math.PI * Math.min(1, k2 * 1.4));
    bp1 += c * (noise() - bp1);
    bp2 += c * (bp1 - bp2);
    return (bp1 - bp2) * Math.pow(Math.sin(Math.PI * Math.min(1, k2 * 1.25)), 1.5);
  }), 'swell', 0.5);
}
{
  // bounce: a rubbery landing (soft 3D shapes)
  let ph = 0;
  mono(env(Math.round(SR * 0.22), (t) => {
    ph += (2 * Math.PI * (140 + 90 * Math.exp(-t * 20) + 12 * Math.sin(t * 90))) / SR;
    return Math.sin(ph) * Math.exp(-t * 16);
  }), 'bounce', 0.7);
}
// rise: a short riser (a counter running, the wall pulling back)
{
  const r = riser(1.4);
  mono(r, 'rise', 0.55);
}
console.log('score.wav peak normalised; sfx written');
