import './fonts';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame, useVideoConfig} from 'veymelo';
import {layout} from './layout';
import {Cafe} from './scenes/Cafe';
import {Coffee3D} from './scenes/Coffee3D';
import {Dawn} from './scenes/Dawn';
import {Words} from './scenes/Words';
import {T} from './timing';

// A 12-second café ad: dawn over the town; the camera pulls back through the
// café's window to the counter, where a cup sits in the low sun; milk is
// poured into a heart; then the café's name. Wide by default; tall lays out
// its own way (src/layout.ts).

/** Sounds on the frame their cause happens: [frame, effect, volume, length in frames]. */
const SOUNDS: [number, string, number, number][] = [
  [T.birds + 20, 'birds', 0.22, 42],
  [T.birds + 75, 'birds', 0.16, 42],
  [T.back, 'whoosh', 0.14, 36],
  [T.pour, 'pour', 0.42, 192],
  [T.name, 'chime', 0.28, 96],
];

export default function Composition() {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const box = layout(width, height);
  return (
    <AbsoluteFill style={{background: '#efe2cf', overflow: 'hidden'}}>
      <Cafe f={f} w={width} h={height} box={box}>
        <Dawn f={f} w={width} h={height} box={box} />
      </Cafe>
      <Coffee3D f={f} h={height} box={box} />
      <Words f={f} box={box} />
      <Audio src="assets/score.m4a" volume={0.9} />
      {SOUNDS.map(([at, sound, volume, frames], i) => (
        <Sequence key={i} from={at} durationInFrames={frames} name={`sfx ${sound}`}>
          <Audio src={`assets/sfx/${sound}.wav`} volume={volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
