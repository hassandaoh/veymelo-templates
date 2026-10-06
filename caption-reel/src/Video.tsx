import './fonts';
import {AbsoluteFill, Caption, useCurrentFrame, useVideoConfig} from 'veymelo';
import {chunks} from './edit';
import {Captions} from './elements/Captions';
import {End} from './elements/End';
import {Footage} from './elements/Footage';
import {Hook} from './elements/Hook';

// A captioned talking reel, 9:16: the clip cut on the words (pauses and asides
// out, a punch-in on new sentences), big captions a few words at a time with
// the word being said lit, a hook over the first seconds, and an end card.
// The edit, the words and the colours are all in src/content.ts.

export default function Composition() {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const u = Math.min(width / 1080, height / 1920);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Footage width={width} height={height} />
      <Captions f={f} u={u} />
      <Hook f={f} u={u} />
      <End f={f} u={u} />
      {/* The same words as a captions file (SRT/VTT) for the platforms; the picture's own captions are above. */}
      <Caption cues={chunks.map(chunk => ({start: chunk.start, end: chunk.end, words: chunk.words.map(({text, start, end}) => ({text, start, end}))}))} style={{opacity: 0}} name="Captions file" />
    </AbsoluteFill>
  );
}
