import {Easing, interpolate} from 'veymelo';

// Arrivals ease out, departures ease in. Words never bounce.
export const enter = Easing.bezier(0.16, 1, 0.3, 1);
export const exit = Easing.bezier(0.7, 0, 0.84, 0);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** 0 to 1 from frame `at` over `frames`. */
export const prog = (f: number, at: number, frames: number, ease = enter) => interpolate(f, [at, at + frames], [0, 1], {...clamp, easing: ease});
