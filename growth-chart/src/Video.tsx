import './fonts';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame, useVideoConfig} from 'veymelo';
import {frame, reached} from './chart';
import {COLOR, DATA} from './content';
import {Change} from './scenes/Change';
import {Chart} from './scenes/Chart';
import {Header} from './scenes/Header';
import {T} from './timing';

// A year of growth as a printed chart, in 15 seconds: the headline says the
// finding (the cover), the line draws month by month with a note where things
// happened and a quiet tone that follows it, last year comes in for
// comparison, and a bracket marks the change. Everything it says comes from
// src/data.json. Wide by default; tall lays out its own way.

const SOUNDS: [number, string, number, number][] = [
  ...DATA.milestones.map(m => [reached(m.month), 'tick', 0.3, 15] as [number, string, number, number]),
  [T.change + 34, 'chime', 0.25, 96],
];

export default function Composition() {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const fr = frame(width, height);
  return (
    <AbsoluteFill style={{background: COLOR.paper, overflow: 'hidden'}}>
      <Header fr={fr} />
      <Chart f={f} fr={fr} />
      <Change f={f} fr={fr} />
      <Audio src="assets/score.m4a" volume={0.8} />
      {SOUNDS.map(([at, sound, volume, frames], i) => (
        <Sequence key={i} from={at} durationInFrames={frames} name={`sfx ${sound}`}>
          <Audio src={`assets/sfx/${sound}.wav`} volume={volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
