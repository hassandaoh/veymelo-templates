import './fonts';
import {AbsoluteFill, Audio, Caption, Sequence, useCurrentFrame, useVideoConfig} from 'veymelo';
import {COLOR, CUES} from './content';
import {End} from './elements/End';
import {Header} from './elements/Header';
import {Wave} from './elements/Wave';
import {Words} from './elements/Words';
import {layout} from './layout';
import {CLIP_FRAMES} from './levels';
import {exit, prog} from './motion';

// An audiogram: a clip of someone speaking, made to be watched with the sound
// off as much as with it on. The real sound drives everything: the words light
// as they are said, the timeline is the clip's own loudness, the speaker's
// ring breathes with their voice. Square by default; tall and wide lay out
// their own way (src/layout.ts).

export default function Composition() {
  const f = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const box = layout(width, height);
  const done = prog(f, CLIP_FRAMES, Math.round(0.3 * fps), exit);
  return (
    <AbsoluteFill style={{background: COLOR.ground}}>
      <Sequence from={0} durationInFrames={CLIP_FRAMES} name="The clip">
        <Audio src="assets/clip.m4a" />
      </Sequence>
      <Header f={f} box={box} />
      <div style={{position: 'absolute', inset: 0, opacity: 1 - done}}>
        <Words f={f} fps={fps} box={box} />
        <Wave f={f} fps={fps} box={box} />
      </div>
      <End f={f} fps={fps} box={box} />
      {/* The same words as a captions file (SRT/VTT) for the platforms; the picture's own words are above. */}
      <Caption cues={CUES.map(cue => ({start: cue.start, end: cue.end, text: cue.note ?? cue.words!.map(word => word.text).join(' '), words: cue.words}))} style={{opacity: 0}} name="Captions file" />
    </AbsoluteFill>
  );
}
