import './fonts';
import {AbsoluteFill, Audio, Sequence, useVideoConfig} from 'veymelo';
import Coffee from './elements/coffee';

// Drawn at 1920×1080 (its design size) and scaled to cover any frame the video
// is rendered at. Every sound is caused by the picture, on its frame.

const DESIGN = {w: 1920, h: 1080};
/** The sounds: [frame, effect in assets/sfx, volume]. */
const SOUNDS: [number, string, number][] = [[20,"bloom",0.3]];
/** Each effect's length in frames. */
const LEN: Record<string, number> = {"bloom":108};

export default function Composition() {
  const {width, height} = useVideoConfig();
  const scale = Math.max(width / DESIGN.w, height / DESIGN.h);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: (width - DESIGN.w * scale) / 2, top: (height - DESIGN.h * scale) / 2, width: DESIGN.w, height: DESIGN.h, transform: `scale(${scale})`, transformOrigin: '0 0'}}>
        <Coffee w={DESIGN.w} h={DESIGN.h} />
      </div>
      {SOUNDS.map(([at, sound, volume], i) => (
        <Sequence key={i} from={at} durationInFrames={LEN[sound]} name={`sfx ${sound}`}>
          <Audio src={`assets/sfx/${sound}.wav`} volume={volume * 0.72} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
