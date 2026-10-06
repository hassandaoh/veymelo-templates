import {EMPHASIS, END, SHOTS, WORDS} from './content';

// The edit, worked out from content.ts: each shot's place on the timeline,
// each kept word's time in the finished video, and the captions in chunks of
// a few words.

export const FPS = 30;
export type Shot = (typeof SHOTS)[number] & {start: number; frames: number};
export type Word = {text: string; start: number; end: number; emphasis: boolean; shot: number};
export type Chunk = {start: number; end: number; words: Word[]};

let frame = 0;
export const shots: Shot[] = SHOTS.map(shot => {
  const frames = Math.round((shot.to - shot.from) * FPS);
  const placed = {...shot, start: frame, frames};
  frame += frames;
  return placed;
});
export const CUT_FRAMES = frame;
export const TOTAL_FRAMES = CUT_FRAMES + Math.round(END.seconds * FPS);

/** A time in the clip, in seconds of the finished video (null when it was cut). */
const place = (t: number) => {
  const index = shots.findIndex(shot => t >= shot.from - 0.01 && t < shot.to);
  return index < 0 ? null : {index, t: shots[index].start / FPS + (t - shots[index].from)};
};

export const words: Word[] = WORDS.flatMap(([text, start, end]) => {
  const at = place(start);
  if (!at) return [];
  const shot = shots[at.index];
  return [{text, start: at.t, end: Math.min(at.t + (end - start), (shot.start + shot.frames) / FPS), emphasis: EMPHASIS.includes(text), shot: at.index}];
});

/** Up to four words and 16 letters a chunk; a new one after punctuation, a pause or a cut. */
export const chunks: Chunk[] = [];
for (const word of words) {
  const last = chunks.at(-1);
  const prev = last?.words.at(-1);
  const fits = last && prev && last.words.length < 4 && !/[.,!?]$/.test(prev.text) && word.start - prev.end < 0.35 && word.shot === prev.shot && last.words.map(w => w.text).join(' ').length + 1 + word.text.length <= 16;
  if (fits) last.words.push(word);
  else chunks.push({start: word.start, end: word.end, words: [word]});
}
chunks.forEach((chunk, i) => {
  const next = chunks[i + 1];
  const lastEnd = chunk.words.at(-1)!.end;
  chunk.end = next ? Math.min(next.start, lastEnd + 0.6) : Math.min(lastEnd + 0.4, CUT_FRAMES / FPS);
});
