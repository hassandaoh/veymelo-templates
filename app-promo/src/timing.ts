// One grid for picture and sound: 120 BPM at 60 fps, a beat is 30 frames and
// a bar 120 (tools/score.mjs plays on the same grid).
export const FPS = 60;
export const BEAT = 30;

/**
 * The story's beats, where it turns. Nothing cuts and nothing slides: the
 * money is the thread, and each beat becomes the next.
 */
export const BEATS = [
  {at: 0, name: 'The question'}, // "Where did your money go?" among loose receipts
  {at: 120, name: 'Into order'}, // the receipts land in the phone as its rows
  {at: 180, name: 'Every dollar'}, // the week grows from them; a tap opens Friday
  {at: 360, name: "What's left"}, // the groceries row opens into its budget
  {at: 540, name: 'Kept'}, // what is left flows out of the ring into the goal
  {at: 720, name: 'The mark'}, // the goal card lifts out and becomes the icon
];

/** Every moment, in frames. */
export const T = {
  words: [0, 30, 60], // the hook's three beats
  chips: 8, // receipts drift in
  pull: 120, // bar 2: the phone arrives and the receipts go into it
  balance: 140,
  bars: 180,
  touchIn: 225,
  tapDay: 270,
  tapRow: 360, // bar 4: the groceries row is tapped
  open: 364, // ... and opens into its budget
  ring: 384,
  left: 432, // what is left fills the ring in mint
  peel: 540, // it flows out of the ring
  keep: 548, // the screen follows it down to the goal
  go: 556,
  land: 600, // bar 6: it lands in the goal
  end: 720, // bar 7: the goal card lifts out, the phone leaves
  icon: 760,
  name: 772,
  line: 786,
  stores: 800,
  length: 900,
};
