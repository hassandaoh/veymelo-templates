// One grid for picture and sound: 90 BPM at 60 fps, a beat is 40 frames and
// a bar 160 (tools/sound.mjs plays on the same grid).
export const BEAT = 40;

/**
 * The trailer's beats, where it turns: one camera move from the sea to the
 * title, with the player's boat as the thread. Nothing cuts.
 */
export const BEATS = [
  {at: 0, name: 'Open sea'}, // low behind the little boat, on golden water
  {at: 160, name: 'Land ahead'}, // the camera rises with it; the island comes up out of the sea
  {at: 320, name: 'Home'}, // the boat ties up in the harbour; dusk falls, the windows light
  {at: 400, name: 'The light'}, // the lighthouse lamp comes on; its beam turns
  {at: 480, name: 'Harbor Tales'}, // the beam sweeps the camera, and the title is left in its glare
];

/** Every moment, in frames. */
export const T = {
  rise: 40, // the camera begins to lift off the water
  gulls: 150,
  dock: 330, // the boat comes to rest by the jetty: the bell
  duskFrom: 230,
  duskTo: 470,
  windows: 330, // the first window lights; the rest follow
  lamp: 400,
  sweep: 480, // the beam points at the camera
  kicker: 506,
  when: 530,
  length: 600,
};
