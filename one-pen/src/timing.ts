// One grid for picture and sound: 90 BPM at 60 fps, a beat is 40 frames and
// a bar 160. The pen keeps its own time: each piece takes as long as its
// lines are long (src/story.ts), so these are where the beats fall with the
// words and the machine as they are (wide; the tall frame is within a few
// frames).
export const BEAT = 40;

/** The beats, where the story turns. It is all one line: the pen never lifts. */
export const BEATS = [
  {at: 12, name: 'Every idea starts as a line'}, // the pen comes in and writes
  {at: 130, name: 'The line'}, // the full stop is pulled out into the ground, and the camera follows it
  {at: 175, name: 'The machine'}, // on the line, the engine, drawn part by part: skid, block, cylinders, heads, gears, gauge, exhaust, flywheel, fan
  {at: 537, name: 'It runs'}, // it catches and runs: flywheel, gears, fan, belt, rockers, needle, smoke
  {at: 587, name: 'The name'}, // the line runs on, and the name is written on it
];

/** Every moment, in frames. */
export const T = {
  write: 12,
  length: 990,
};
