import './fonts';
import {AbsoluteFill, Audio, Sequence, useVideoConfig} from 'veymelo';
import World from './elements/world';
import {T} from './timing';

// A 10-second game trailer told as one camera move (the beats are in
// src/timing.ts): the player's boat is the thread. Low behind it on the
// open sea, the camera rises as the island comes up; the boat ties up as
// dusk falls and the windows light; the lighthouse comes on, and its beam
// leaves the title in its glare. Drawn at 1920×1080 and scaled to cover any
// frame. Every sound has its cause in the picture, on its frame.

const DESIGN = {w: 1920, h: 1080};
/** The sounds: [frame, effect in assets/sfx, volume, length in frames]. */
const SOUNDS: [number, string, number, number][] = [
  [0, 'waves', 0.5, 600],
  [T.gulls, 'gull', 0.3, 90],
  [T.gulls + 70, 'gull', 0.22, 90],
  [T.dock, 'bell', 0.32, 180],
  [T.lamp, 'lamp', 0.45, 60],
  [T.sweep - 30, 'swell', 0.42, 108],
  [T.sweep, 'shimmer', 0.32, 96],
];

export default function Composition() {
  const {width, height} = useVideoConfig();
  const scale = Math.max(width / DESIGN.w, height / DESIGN.h);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: (width - DESIGN.w * scale) / 2, top: (height - DESIGN.h * scale) / 2, width: DESIGN.w, height: DESIGN.h, transform: `scale(${scale})`, transformOrigin: '0 0'}}>
        <World w={DESIGN.w} h={DESIGN.h} />
      </div>
      <Audio src="assets/score.m4a" volume={0.85} />
      {SOUNDS.map(([at, sound, volume, frames], i) => (
        <Sequence key={i} from={at} durationInFrames={frames} name={`sfx ${sound}`}>
          <Audio src={`assets/sfx/${sound}.wav`} volume={volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
