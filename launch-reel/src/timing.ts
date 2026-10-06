// One timing grid for picture and sound. 120 BPM at 60 fps: a beat is 30 frames, a bar 120.
export const FPS = 60;
export const BPM = 120;
export const BEAT = (60 / BPM) * FPS; // 30
export const BAR = BEAT * 4; // 120
/** b(bar, beat, sixteenth): b(1) is frame 0, b(2) is 120. */
export const b = (bar: number, beat = 0, sixteenth = 0) =>
  Math.round(((bar - 1) * 4 + beat) * BEAT + sixteenth * (BEAT / 4));
export const sec = (s: number) => Math.round(s * FPS);

/** The screens, in frames. Their durations add up to 5400. */
export const SCENES = [
  {name: 'Hook', dur: sec(5)},
  {name: 'Get a video', dur: sec(5)},
  {name: 'Setup', dur: sec(8)},
  {name: 'AI live', dur: sec(14)},
  {name: 'Prompt to result', dur: sec(24)},
  {name: 'Montage', dur: sec(15)},
  {name: 'Wall', dur: sec(6)},
  {name: 'Code', dur: sec(6)},
  {name: 'End', dur: sec(7)},
] as const;

export const START: Record<string, number> = {};
{
  let t = 0;
  for (const s of SCENES) {
    START[s.name] = t;
    t += s.dur;
  }
}
