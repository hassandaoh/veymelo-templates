// One grid for picture and sound: 120 BPM at 60 fps, a beat is 30 frames and
// a bar 120 (tools/score.mjs plays on the same grid).
export const FPS = 60;
export const BEAT = 30;

/** Every moment, in frames. */
export const T = {
  words: [0, 30, 60], // the hook's three beats
  chips: 8, // receipts drift in
  pull: 120, // bar 2: the phone arrives and the receipts go into it
  overview: 150,
  balance: 140,
  bars: 180,
  touchIn: 225,
  tapDay: 270,
  budgets: 360, // the next screen pushes on, on bar 4
  touchBudget: 405,
  tapBudget: 450,
  ring: 462,
  goals: 570,
  notify: 600, // bar 6
  coinFrom: 645,
  coinAt: 690,
  notifyOut: 705,
  end: 720, // the phone leaves, on bar 7
  icon: 750,
  name: 765,
  line: 780,
  stores: 795,
  length: 900,
};
