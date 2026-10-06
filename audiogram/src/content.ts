// Everything this audiogram says, in one place.
//
// The clip: John F. Kennedy at Rice University, 12 September 1962 ("We choose
// to go to the Moon"), from the John F. Kennedy Presidential Library via
// Wikimedia Commons; public domain in the United States as a work of the
// federal government. Cut to 14 seconds, the applause between the lines
// shortened. Replace assets/clip.m4a with your own clip, run
// `node tools/prepare.mjs`, and write its words below.

export const SPEAKER = {
  name: 'John F. Kennedy',
  line: 'Rice University · September 12, 1962',
  initials: 'JFK',
  /** A square photo in assets/ (e.g. 'assets/speaker.jpg'), or null for the initials. */
  photo: null as string | null,
};

export const COLOR = {
  ground: '#12141a', // the night
  text: '#f2eadb', // words spoken
  accent: '#f2c14e', // the word being spoken, the playhead, the voice's ring
  muted: '#8b8f99',
  avatar: '#1f232d',
};

/** After the clip: what it was and where to hear the rest. */
export const END = {
  title: 'We choose to go to the Moon.',
  line: 'The full speech · John F. Kennedy Presidential Library',
};

type Word = {text: string; start: number; end: number};
export type Cue = {start: number; end: number; words?: Word[]; note?: string};

/** One phrase on screen at a time; every word at the second it is said (in the clip). */
const w = (pairs: [string, number, number][]): Word[] => pairs.map(([text, start, end]) => ({text, start, end}));
export const CUES: Cue[] = [
  {start: 0, end: 2.9, words: w([['We', 0.36, 0.5], ['choose', 0.5, 0.9], ['to', 0.9, 1.12], ['go', 1.12, 1.3], ['to', 1.3, 1.5], ['the', 1.5, 1.62], ['Moon.', 1.62, 1.95]])},
  {start: 2.95, end: 4.5, words: w([['We', 3.1, 3.27], ['choose', 3.27, 3.54], ['to', 3.54, 3.68], ['go', 3.68, 3.87], ['to', 3.87, 4.01], ['the', 4.01, 4.16], ['Moon.', 4.16, 4.45]])},
  {start: 4.55, end: 5.95, note: '(applause)'},
  {start: 5.95, end: 7.86, words: w([['We', 6.1, 6.32], ['choose', 6.32, 6.67], ['to', 6.67, 6.86], ['go', 6.86, 7.1], ['to', 7.1, 7.29], ['the', 7.29, 7.48], ['Moon', 7.48, 7.86]])},
  {start: 7.86, end: 10.35, words: w([['in', 7.86, 8.1], ['this', 8.1, 8.36], ['decade', 8.36, 8.82], ['and', 8.82, 8.98], ['do', 8.98, 9.14], ['the', 9.14, 9.41], ['other', 9.41, 9.7], ['things,', 9.7, 9.95]])},
  {start: 10.35, end: 12.2, words: w([['not', 10.5, 10.65], ['because', 10.65, 11.2], ['they', 11.2, 11.55], ['are', 11.55, 11.8], ['easy,', 11.8, 12.2]])},
  {start: 12.2, end: 14.3, words: w([['but', 12.25, 12.45], ['because', 12.45, 13.0], ['they', 13.0, 13.25], ['are', 13.25, 13.4], ['hard.', 13.4, 13.65]])},
];
