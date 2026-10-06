import {Easing, interpolate, spring} from 'veymelo';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** Arriving: fast, then gentle. */
export const enter = Easing.bezier(0.16, 1, 0.3, 1);
/** Leaving: gentle, then gone. Quicker than arriving. */
export const exit = Easing.bezier(0.7, 0, 0.84, 0);
/** Travelling from one place to another, both ends soft (camera, shared elements). */
export const move = Easing.bezier(0.65, 0, 0.35, 1);
/** UI landing: settles without bouncing. */
export const settle = {damping: 20, stiffness: 170, mass: 1};
/** A result frame landing: one small overshoot. Never for words. */
export const snap = {damping: 12, stiffness: 200, mass: 0.8};

export const DUR = {small: 0.35, medium: 0.6, large: 0.9, exit: 0.3};

/** 0→1 from frame `at` over `frames`, eased. */
export const prog = (frame: number, at: number, frames: number, ease = enter) =>
  interpolate(frame, [at, at + frames], [0, 1], {...clamp, easing: ease});
export const land = (frame: number, fps: number, at: number, config = settle) =>
  spring({frame: frame - at, fps, config});
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
