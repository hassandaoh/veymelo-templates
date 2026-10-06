import {Easing, interpolate} from 'veymelo';

/** Eases and a 0→1 helper for this video (60 fps). */
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const outE = Easing.bezier(0.16, 1, 0.3, 1);
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);
/** 0→1 between frames a and b. */
export const k = (f: number, a: number, b: number, ease: (t: number) => number = outE) => interpolate(f, [a, b], [0, 1], {...cl, easing: ease});
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
