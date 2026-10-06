import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {C, MONO} from '../../theme';
import {BEAT} from '../../timing';

/**
 * prompt: the yellow caret and a typed one-line prompt in mono — the thing that travels.
 * The caret is drawn (not a glyph) so that at the end the same shape turns 90° into the V.
 */

/** The chevron ">" drawn in a 1×1 box. rot 90 makes it a "V". */
export function Caret({size, color = C.accent, rot = 0, weight = 0.17}: {size: number; color?: string; rot?: number; weight?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block', overflow: 'visible', transform: `rotate(${rot}deg)`}}>
      <path d="M26 14 L74 50 L26 86" fill="none" stroke={color} strokeWidth={weight * 100} strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

/** How many characters are shown at `frame` when typing starts at `start`, `rate` characters a frame. */
export const typedCount = (text: string, frame: number, start: number, rate: number) =>
  Math.max(0, Math.min(text.length, Math.floor((frame - start) * rate)));
/** The frame the last character appears. */
export const typedEnd = (text: string, start: number, rate: number) => start + Math.ceil(text.length / rate);
/** Frames where a key sound belongs: every second character, so it ticks rather than buzzes. */
export const keyFrames = (text: string, start: number, rate: number, every = 2) => {
  const out: number[] = [];
  for (let i = 0; i < text.length; i += every) if (text[i] !== ' ') out.push(start + Math.ceil(i / rate));
  return out;
};

export type PromptProps = {
  text: string;
  /** frame typing starts (local) */
  start?: number;
  /** characters per frame */
  rate?: number;
  /** font size in px */
  size?: number;
  color?: string;
  /** frame Enter is pressed: the cursor goes */
  enterAt?: number;
  /** show the caret ">" */
  caret?: boolean;
  /** frame override */
  frame?: number;
};

/** One prompt line: caret, typed text, block cursor (solid while typing, blinking on the beat when idle). */
export function PromptLine({text, start = 0, rate = 0.5, size = 56, color = C.white, enterAt = Infinity, caret = true, frame: f}: PromptProps) {
  const own = useCurrentFrame();
  const frame = f ?? own;
  const n = typedCount(text, frame, start, rate);
  const typing = frame >= start && n < text.length;
  const idleBlink = Math.floor(frame / (BEAT / 2)) % 2 === 0;
  const cursorOn = frame < enterAt && (typing || idleBlink);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: size * 0.42, fontFamily: MONO, fontSize: size, color, whiteSpace: 'pre', lineHeight: 1, fontWeight: 400, letterSpacing: '-0.01em'}}>
      {caret && <Caret size={size * 0.78} />}
      <span style={{position: 'relative'}}>
        {text.slice(0, n)}
        <span
          style={{
            display: 'inline-block',
            width: size * 0.56,
            height: size * 1.05,
            marginLeft: size * 0.06,
            verticalAlign: 'middle',
            transform: `translateY(${-size * 0.06}px)`,
            background: C.accent,
            opacity: cursorOn ? 1 : 0,
          }}
        />
      </span>
    </div>
  );
}

/** On its own: the hook's prompt, typing then idle. */
export default function Element() {
  return (
    <AbsoluteFill style={{background: C.ink, alignItems: 'center', justifyContent: 'center'}}>
      <PromptLine text="make a launch ad, bold" start={12} rate={0.45} size={64} enterAt={120} />
    </AbsoluteFill>
  );
}
