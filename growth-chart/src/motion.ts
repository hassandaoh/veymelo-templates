import {Easing, interpolate, spring} from 'veymelo';
import {FPS} from './timing';

export const enter = Easing.bezier(0.16, 1, 0.3, 1);
export const exit = Easing.bezier(0.7, 0, 0.84, 0);
export const move = Easing.bezier(0.65, 0, 0.35, 1);
/** The line's pace: a gentle start and finish, steady in the middle. */
export const pace = Easing.bezier(0.45, 0, 0.55, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const prog = (f: number, at: number, frames: number, ease = enter) => interpolate(f, [at, at + frames], [0, 1], {...clamp, easing: ease});
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
/** An annotation landing: one small overshoot. */
export const pop = (f: number, at: number) => spring({frame: f - at, fps: FPS, config: {damping: 12, stiffness: 220, mass: 0.7}});
