import data from './levels.json';

// The clip's loudness on every frame, 0 to 1 (tools/prepare.mjs measures it).
export const LEVELS: number[] = data.levels;
export const CLIP_FRAMES = LEVELS.length;

/** The voice's level now, held a little so the ring breathes instead of flickering. */
export const voice = (f: number) => {
  let peak = 0;
  for (let i = Math.max(0, f - 5); i <= Math.min(CLIP_FRAMES - 1, f); i++) peak = Math.max(peak, LEVELS[i] * (1 - (f - i) * 0.12));
  return peak;
};
