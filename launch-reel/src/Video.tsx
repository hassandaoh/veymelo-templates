import {AbsoluteFill, Audio, Sequence, useCurrentFrame, useVideoConfig} from 'veymelo';
import {Vertical} from './Vertical';
import {BAR_FROM, Code, DONE_AT, SIZES_AT} from './elements/code';
import {CMD_AT as END_CMD, EndCard, NAME_AT, TURN_AT} from './elements/endcard';
import {How, howSounds} from './scenes/How';
import {Opening, openingSounds} from './scenes/Opening';
import {Results, resultsSounds} from './scenes/Results';
import {Wall, wallSounds} from './scenes/Wall';
import {C} from './theme';
import {START} from './timing';

// The video: Veymelo, "Brief your AI. Get a video." Scenes in order (src/timing.ts),
// the synthesized score (tools/score.mjs) and each effect on the frame its cause happens.

function Local({children}: {children: (f: number) => React.ReactNode}) {
  const f = useCurrentFrame();
  return <>{children(f)}</>;
}

type Cue = {f: number; s: string; v: number};
/** each effect's length in frames (assets/sfx, measured with ffprobe) */
const LEN: Record<string, number> = {beep: 10, bloom: 108, bounce: 14, chime: 96, click: 2, enter: 14, hit: 24, key0: 3, key1: 3, key2: 3, key3: 3, paper: 11, plop: 8, pop: 6, rise: 84, shimmer: 96, swell: 108, thud: 18, tick: 8, whoosh: 36};
const SFX_GAIN = 0.72;
const SOUNDS: Cue[] = [
  ...openingSounds().map((c) => ({...c, f: c.f + START['Hook']})),
  ...howSounds().map((c) => ({...c, f: c.f + START['Setup']})),
  ...resultsSounds().map((c) => ({...c, f: c.f + START['Prompt to result']})),
  ...wallSounds().map((c) => ({...c, f: c.f + START['Wall']})),
  {f: START['Code'] + 6, s: 'whoosh', v: 0.2},
  {f: START['Code'] + BAR_FROM, s: 'rise', v: 0.22},
  {f: START['Code'] + DONE_AT, s: 'chime', v: 0.4},
  ...SIZES_AT.map((t) => ({f: START['Code'] + t, s: 'pop', v: 0.3})),
  {f: START['End'] + TURN_AT, s: 'whoosh', v: 0.25},
  {f: START['End'] + NAME_AT, s: 'bloom', v: 0.35},
  {f: START['End'] + END_CMD, s: 'tick', v: 0.25},
];

export default function Composition() {
  const {width, height} = useVideoConfig();
  const film = <Film />;
  // the tall cut: the film as a picture in the middle, a headline above, the prompt below
  return height > width ? <Vertical>{film}</Vertical> : film;
}

function Film() {
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Audio src="assets/score.m4a" volume={0.86} />
      {SOUNDS.map((c, i) => (
        <Sequence key={i} from={c.f} durationInFrames={LEN[c.s]} name={`sfx ${c.s}`}>
          <Audio src={`assets/sfx/${c.s}.wav`} volume={c.v * SFX_GAIN} />
        </Sequence>
      ))}
      <Sequence from={START['Hook']} durationInFrames={600} name="Hook · Get a video">
        <Opening />
      </Sequence>
      <Sequence from={START['Setup']} durationInFrames={1320} name="Setup · AI live">
        <How />
      </Sequence>
      <Sequence from={START['Prompt to result']} durationInFrames={2340} name="Prompt to result · Montage">
        <Results />
      </Sequence>
      <Sequence from={START['Wall']} durationInFrames={360} name="Wall">
        <Wall />
      </Sequence>
      <Sequence from={START['Code']} durationInFrames={360} name="Every frame is code">
        <Local>{(f) => <Code f={f} />}</Local>
      </Sequence>
      <Sequence from={START['End']} durationInFrames={420} name="End">
        <Local>{(f) => <EndCard f={f} />}</Local>
      </Sequence>
    </AbsoluteFill>
  );
}
