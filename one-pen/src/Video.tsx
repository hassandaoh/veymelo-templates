import {AbsoluteFill, Audio, Sequence, useVideoConfig} from 'veymelo';
import {COLORS} from './content';
import {Page} from './Page';
import {scratchAt} from './pen/route';
import {runAt, story} from './story';

// A 16.5-second piece drawn by one pen, the way veymelo.com is drawn: a
// single hairline writes the words in single-stroke letters, pulls the full
// stop out into a line, and on that line draws one machine in every detail;
// the machine starts and runs, and the line goes on to the name. One line from
// the first frame to the last. The beats are in src/timing.ts, the words in
// src/content.ts, the machine in src/engine.ts. Any frame shape works.

/** A soft note as the pieces of the story begin. */
const NOTES = ['first', 'engine', 'name'];

export default function Composition() {
  const {width, height, fps, durationInFrames} = useVideoConfig();
  const s = story(width, height, fps);
  // the nib on the paper: heard only while the pen draws, louder as it goes faster
  const scratch = (f: number) => {
    let sum = 0;
    for (let i = 0; i < 6; i++) sum += scratchAt(s.plan, f - i);
    return 0.5 * (sum / 6);
  };
  return (
    <AbsoluteFill style={{background: COLORS.paper}}>
      <Page />
      <Audio src="assets/score.m4a" volume={0.8} />
      <Audio src="assets/sfx/nib.m4a" volume={scratch} />
      {NOTES.map((id, i) => (
        <Sequence key={id} from={Math.round(s.plan.begin[id])} durationInFrames={120} name={`note ${id}`}>
          <Audio src={`assets/sfx/note${i}.wav`} volume={0.3} />
        </Sequence>
      ))}
      {/* the engine: it catches, then runs, as loud as it is running */}
      <Sequence from={Math.round(s.start)} durationInFrames={Math.max(1, durationInFrames - Math.round(s.start))} name="engine">
        <Audio src="assets/sfx/engine.m4a" volume={f => 0.75 * runAt(f + s.start, s.start).power} />
      </Sequence>
    </AbsoluteFill>
  );
}
