import './fonts';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame, useVideoConfig} from 'veymelo';
import {COLOR} from './content';
import {Phone} from './elements/phone';
import {exit, prog} from './motion';
import {Captions} from './scenes/Captions';
import {End} from './scenes/End';
import {HookChips, HookWords} from './scenes/Hook';
import {Home} from './screens/Home';
import {DESIGN, PHONE_AT, PHONE_SCALE, phoneDrop} from './stage';
import {T} from './timing';

// A 15-second app ad, 9:16, told as one movement (the beats are in
// src/timing.ts): the money is the thread. Loose receipts land in the phone
// as rows, the week grows from them, the groceries row opens into what is
// left, what is left flows into the goal, and the goal becomes the mark.
// Nothing cuts or slides; the camera stays at rest while the app scrolls.
// Drawn at 1080×1920 and scaled to cover any frame. Words, numbers and
// colours live in src/content.ts.

/** Sounds, each on the frame its cause happens: [frame, effect, volume]. */
const SOUNDS: [number, string, number][] = [
  [0, 'enter', 0.4], [30, 'enter', 0.4], [60, 'enter', 0.45],
  [8, 'tick', 0.12], [26, 'tick', 0.12], [44, 'tick', 0.12],
  [T.pull - 2, 'whoosh', 0.35],
  [T.balance, 'pop', 0.2],
  [T.tapDay, 'click', 0.45], [T.tapDay + 2, 'pop', 0.3],
  [T.tapRow, 'click', 0.45], [T.open, 'whoosh', 0.14], [T.ring, 'rise', 0.2],
  [T.peel, 'whoosh', 0.16],
  [T.land, 'tick', 0.4], [T.land, 'bloom', 0.28],
  [T.end, 'whoosh', 0.25],
  [T.icon, 'chime', 0.45],
  [T.stores, 'pop', 0.2], [T.stores + 6, 'pop', 0.2],
];
const LEN: Record<string, number> = {enter: 14, tick: 8, whoosh: 36, pop: 6, click: 2, rise: 84, bloom: 108, chime: 96};

function Ad() {
  const f = useCurrentFrame();
  const leave = prog(f, T.end, 30, exit);
  return (
    <AbsoluteFill style={{background: COLOR.ground, overflow: 'hidden', fontFamily: "'Space Grotesk', sans-serif"}}>
      <HookWords f={f} />
      <Captions f={f} />
      {f >= T.pull - 6 && leave < 1 ? (
        <div style={{position: 'absolute', left: PHONE_AT.x, top: PHONE_AT.y, transform: `translateY(${phoneDrop(f) + leave * 1900}px) scale(${PHONE_SCALE * (1 - 0.08 * leave)})`, transformOrigin: '50% 0'}}>
          <Phone>
            <Home f={f} />
          </Phone>
        </div>
      ) : null}
      <HookChips f={f} />
      <End f={f} />
    </AbsoluteFill>
  );
}

export default function Composition() {
  const {width, height} = useVideoConfig();
  const scale = Math.max(width / DESIGN.w, height / DESIGN.h);
  return (
    <AbsoluteFill style={{background: COLOR.ground, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: (width - DESIGN.w * scale) / 2, top: (height - DESIGN.h * scale) / 2, width: DESIGN.w, height: DESIGN.h, transform: `scale(${scale})`, transformOrigin: '0 0'}}>
        <Ad />
      </div>
      <Audio src="assets/score.m4a" volume={1.12} />
      {SOUNDS.map(([frame, sound, volume], i) => (
        <Sequence key={i} from={frame} durationInFrames={LEN[sound]} name={`sfx ${sound}`}>
          <Audio src={`assets/sfx/${sound}.wav`} volume={volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
