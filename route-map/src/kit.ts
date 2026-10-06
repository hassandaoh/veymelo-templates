import {Easing, interpolate, spring} from 'veymelo';

/** Helpers for this video: its design size, eases and springs (60 fps). */
export type Aspect = '16:9' | '9:16' | '1:1';
export const SIZE: Record<Aspect, {w: number; h: number}> = {
  '16:9': {w: 1920, h: 1080},
  '9:16': {w: 1080, h: 1920},
  '1:1': {w: 1080, h: 1080},
};
export type ResultProps = {w: number; h: number; /** 0→1: the "make the title bigger" edit */ edit?: number; /** one screen of a storyboard, where a result has them */ variant?: number; /** drawing resolution for 3D (1 = design size) */ res?: number};

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const outE = Easing.bezier(0.16, 1, 0.3, 1);
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);
/** 0→1 between frames a and b. */
export const k = (f: number, a: number, b: number, ease = outE) => interpolate(f, [a, b], [0, 1], {...cl, easing: ease});
export const sp = (f: number, at: number, cfg = {damping: 14, stiffness: 140, mass: 1}) => spring({frame: f - at, fps: 60, config: cfg});
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
