import {Easing, interpolate} from 'veymelo';

export const enter = Easing.bezier(0.16, 1, 0.3, 1);
export const exit = Easing.bezier(0.7, 0, 0.84, 0);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const prog = (f: number, at: number, frames: number, ease = enter) => interpolate(f, [at, at + frames], [0, 1], {...clamp, easing: ease});
