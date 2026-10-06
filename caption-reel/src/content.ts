// Everything this reel says and shows, in one place.
//
// The clip: astronaut Scott Kelly's message against bullying, made by NASA for
// the Federal Partners in Bullying Prevention campaign (NASA Johnson, via
// Wikimedia Commons; public domain in the United States as a work made solely
// by NASA). The NASA intro and the fade-in greeting are left out; NASA's insignia may not be used to
// suggest endorsement. Replace assets/clip.mp4 with your own talking clip and
// write its words below (tools/words.mjs turns a whisper.cpp transcript into
// these lines).

export const COLOR = {
  text: '#ffffff', // captions
  accent: '#ffd23f', // the word being said, and the words that carry the point
  ground: '#0b1a33', // the end card
  muted: '#9aa6bd',
};

/** The hook over the first seconds, and who is speaking. */
export const HOOK = {title: 'There is no space for bullying.', speaker: 'Scott Kelly · NASA astronaut', seconds: 3.2};

/** The end card: the last line again, and where to go. */
export const END = {line: 'There is no space for bullying.', link: 'stopbullying.gov', credit: 'Video: NASA', seconds: 2};

/** Where the face is in the clip (0 to 1): the tall frame is cut around it. */
export const FOCUS = {x: 0.55, y: 0.3};

/**
 * The shots, in seconds of assets/clip.mp4, in the order they play: the parts
 * kept, cut on the words, each with its own zoom (a punch-in on a new
 * sentence keeps a long take alive and hides the cuts).
 */
export const SHOTS = [
  {from: 3.8, to: 6.0, zoom: 1}, // opens on the story; the clip fades in from black under "Hi, I'm…"
  {from: 8.94, to: 14.48, zoom: 1.12},
  {from: 14.48, to: 19.8, zoom: 1},
  {from: 19.8, to: 21.84, zoom: 1.12},
  {from: 21.84, to: 26.42, zoom: 1.22},
  {from: 31.98, to: 34.95, zoom: 1.06},
  {from: 37.2, to: 39.2, zoom: 1.18},
];

/** Words that carry the point: they land bigger, in the accent. */
export const EMPHASIS = ['bullied,', 'wrong.', 'never', 'okay.', 'lifetime.', 'difference.', 'bystander,', 'action,', 'heights.', 'space'];

/** Every word said, in seconds of assets/clip.mp4 (only those inside SHOTS are shown); checked against the clip's sound at the cuts. */
export const WORDS: [string, number, number][] = [
  ["Hi,", 0.24, 0.54],
  ["I'm", 0.54, 1.08],
  ["astronaut", 1.08, 2.18],
  ["Scott", 2.18, 2.89],
  ["Kelly.", 2.89, 3.92],
  ["Growing", 3.92, 4.16],
  ["up", 4.16, 4.30],
  ["I", 4.30, 4.31],
  ["saw", 4.31, 4.52],
  ["a", 4.52, 4.59],
  ["lot", 4.59, 4.80],
  ["of", 4.80, 5.01],
  ["kids", 5.01, 5.30],
  ["get", 5.30, 5.50],
  ["bullied,", 5.50, 6.03],
  ["and", 6.03, 6.16],
  ["But", 9.03, 9.17],
  ["like", 9.17, 9.40],
  ["a", 9.40, 9.45],
  ["lot", 9.45, 9.62],
  ["of", 9.62, 9.73],
  ["kids,", 9.73, 10.07],
  ["I", 10.07, 10.32],
  ["often", 10.32, 10.48],
  ["stood", 10.48, 10.79],
  ["by", 10.79, 10.92],
  ["and", 10.92, 11.36],
  ["did", 11.36, 11.71],
  ["nothing", 11.71, 12.25],
  ["to", 12.25, 12.44],
  ["stop", 12.44, 12.73],
  ["it,", 12.73, 13.36],
  ["which", 13.36, 13.50],
  ["was", 13.50, 13.76],
  ["wrong.", 13.76, 14.48],
  ["Bullying", 14.48, 15.00],
  ["is", 15.00, 15.24],
  ["never", 15.24, 15.46],
  ["okay.", 15.46, 15.96],
  ["It", 15.96, 16.07],
  ["hurts", 16.07, 16.37],
  ["in", 16.37, 16.46],
  ["the", 16.46, 16.67],
  ["moment", 16.67, 17.00],
  ["and", 17.00, 17.18],
  ["causes", 17.18, 17.64],
  ["harm", 17.64, 18.01],
  ["which", 18.01, 18.32],
  ["can", 18.32, 18.55],
  ["last", 18.55, 18.85],
  ["a", 18.85, 19.18],
  ["lifetime.", 19.18, 19.80],
  ["The", 19.80, 19.96],
  ["good", 19.96, 20.18],
  ["news", 20.18, 20.40],
  ["is", 20.40, 20.51],
  ["you", 20.51, 20.67],
  ["can", 20.67, 20.92],
  ["make", 20.92, 21.06],
  ["a", 21.06, 21.10],
  ["difference.", 21.10, 21.84],
  ["Be", 21.84, 21.95],
  ["more", 21.95, 22.11],
  ["than", 22.11, 22.38],
  ["just", 22.38, 22.65],
  ["a", 22.65, 22.73],
  ["bystander,", 22.73, 23.44],
  ["take", 23.44, 23.84],
  ["action,", 23.84, 24.24],
  ["and", 24.24, 24.44],
  ["do", 24.44, 24.57],
  ["something", 24.57, 25.17],
  ["to", 25.17, 25.30],
  ["stop", 25.30, 25.72],
  ["bullying.", 25.72, 26.36],
  ["Pulling", 32.08, 32.32],
  ["someone", 32.32, 32.74],
  ["down", 32.74, 32.98],
  ["will", 32.98, 33.40],
  ["never", 33.40, 33.52],
  ["take", 33.52, 33.75],
  ["you", 33.75, 33.94],
  ["to", 33.94, 34.28],
  ["great", 34.28, 34.36],
  ["heights.", 34.36, 34.95],
  ["There", 37.3, 37.53],
  ["is", 37.53, 37.72],
  ["no", 37.72, 37.80],
  ["space", 37.80, 38.16],
  ["for", 38.16, 38.64],
  ["bullying.", 38.64, 39.0],
];
