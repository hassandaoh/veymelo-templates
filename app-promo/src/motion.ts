import {Easing, interpolate, spring} from 'veymelo';
import {FPS} from './timing';

// The house moves. Arrivals ease out, departures ease in and are quicker,
// travel eases both ways. UI lands with `settle`; only a result that pops
// (the tooltip, the notification, the icon) gets `snap`'s small overshoot.
// Words never bounce.
export const enter = Easing.bezier(0.16, 1, 0.3, 1);
export const exit = Easing.bezier(0.7, 0, 0.84, 0);
export const move = Easing.bezier(0.65, 0, 0.35, 1);
export const settle = {damping: 20, stiffness: 170, mass: 1};
export const snap = {damping: 12, stiffness: 210, mass: 0.8};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** 0 to 1 from frame `at` over `frames`. */
export const prog = (f: number, at: number, frames: number, ease = enter) => interpolate(f, [at, at + frames], [0, 1], {...clamp, easing: ease});
export const land = (f: number, at: number, config = settle) => spring({frame: f - at, fps: FPS, config});
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
