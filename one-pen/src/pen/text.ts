import {GLYPHS, STAND_IN, UNITS} from './glyphs';
import type {Pt} from './route';

// Words as pen strokes: each character's single-line path from glyphs.ts,
// set on a baseline. Only Latin characters have pen paths; other text has
// to be set in a typeface instead.

/** The text with stand-ins for the few characters drawn as others (curly quotes, an ellipsis). */
const expand = (text: string) => [...text].map(ch => STAND_IN[ch] ?? ch).join('');
const glyph = (ch: string) => GLYPHS[ch] ?? GLYPHS['?'];

/** How wide the text is at this size, in pixels. */
export function measure(text: string, size: number) {
  return [...expand(text)].reduce((w, ch) => w + glyph(ch)[0], 0) * (size / UNITS);
}

/** The strokes of the text, its baseline starting at (x, y). */
export function write(text: string, x: number, y: number, size: number): Pt[][] {
  const s = size / UNITS;
  const out: Pt[][] = [];
  let pen = x;
  for (const ch of expand(text)) {
    const [advance, strokes] = glyph(ch);
    for (const st of strokes) {
      const pts: Pt[] = [];
      for (let i = 0; i < st.length; i += 2) pts.push([pen + st[i] * s, y - st[i + 1] * s]);
      out.push(pts);
    }
    pen += advance * s;
  }
  return out;
}

/** Can the pen write this text (every character has a pen path)? */
export const penable = (text: string) => [...expand(text)].every(ch => /\s/.test(ch) || GLYPHS[ch]);
