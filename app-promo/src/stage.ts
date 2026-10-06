import {PHONE} from './elements/phone';
import {land} from './motion';
import {T} from './timing';

// Where the phone stands in the 1080×1920 frame. It is the subject: large,
// running off the bottom edge (where the apps' own captions sit anyway); what
// is tapped stays in the upper part of its screen.
export const DESIGN = {w: 1080, h: 1920};
export const PHONE_AT = {x: (DESIGN.w - PHONE.w) / 2, y: 420};
export const PHONE_SCALE = 1.3;

/** How far below its place the phone is: it rises in on bar 2. */
export const phoneDrop = (f: number) => (1 - land(f, T.pull - 4)) * 1900;

/** A point on the phone's screen, in the frame, while the phone rises (camera at rest). */
export function onScreen(f: number, [x, y]: [number, number]): [number, number] {
  const px = x + PHONE.bezel;
  const py = y + PHONE.bezel;
  return [PHONE_AT.x + PHONE.w / 2 + (px - PHONE.w / 2) * PHONE_SCALE, PHONE_AT.y + phoneDrop(f) + py * PHONE_SCALE];
}
