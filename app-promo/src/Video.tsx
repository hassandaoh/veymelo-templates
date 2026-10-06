import './fonts';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame, useVideoConfig} from 'veymelo';
import {COLOR} from './content';
import {PHONE, Phone, SCREEN} from './elements/phone';
import {exit, move, prog} from './motion';
import {Captions} from './scenes/Captions';
import {End} from './scenes/End';
import {HookChips, HookWords} from './scenes/Hook';
import {BUDGET_TAP, Budgets} from './screens/Budgets';
import {COIN_TO, Goals} from './screens/Goals';
import {Overview, TAP_POINT} from './screens/Overview';
import {DESIGN, PHONE_AT, PHONE_SCALE, phoneDrop} from './stage';
import {T} from './timing';

// A 15-second app ad, 9:16: the question, three things the app does (each a
// tap and its answer), and where to get it. Drawn at 1080×1920 and scaled to
// cover any frame. Words, numbers and colours live in src/content.ts.


/** Sounds, each on the frame its cause happens: [frame, effect, volume]. */
const SOUNDS: [number, string, number][] = [
  [0, 'enter', 0.4], [30, 'enter', 0.4], [60, 'enter', 0.45],
  [8, 'tick', 0.12], [26, 'tick', 0.12], [44, 'tick', 0.12],
  [T.pull - 2, 'whoosh', 0.35],
  [T.balance, 'pop', 0.2],
  [T.tapDay, 'click', 0.45], [T.tapDay + 2, 'pop', 0.3],
  [T.budgets, 'whoosh', 0.16],
  [T.tapBudget, 'click', 0.45], [T.ring, 'rise', 0.2],
  [T.goals, 'whoosh', 0.16],
  [T.notify, 'pop', 0.45],
  [T.coinAt, 'tick', 0.4], [T.coinAt, 'bloom', 0.28],
  [T.end, 'whoosh', 0.25],
  [T.icon, 'chime', 0.45],
  [T.stores, 'pop', 0.2], [T.stores + 6, 'pop', 0.2],
];
const LEN: Record<string, number> = {enter: 14, tick: 8, whoosh: 36, pop: 6, click: 2, rise: 84, bloom: 108, chime: 96};

/** The camera leans in on what is being tapped, then back. Origins are on the phone. */
const at = ([x, y]: [number, number]): [number, number] => [x + PHONE.bezel, y + PHONE.bezel];
const PUSHES = [
  {from: T.touchIn + 10, hold: T.tapDay + 10, back: T.budgets - 34, scale: 1.1, origin: at(TAP_POINT)},
  {from: T.tapBudget + 10, hold: T.ring + 50, back: T.goals - 34, scale: 1.08, origin: at([BUDGET_TAP[0], BUDGET_TAP[1] + 260])},
  {from: T.notify + 10, hold: T.coinAt, back: T.end - 30, scale: 1.06, origin: at(COIN_TO)},
];

function camera(f: number) {
  for (const push of PUSHES) {
    if (f < push.from || f > push.back + 30) continue;
    const s = (prog(f, push.from, push.hold - push.from, move) - prog(f, push.back, 30, move)) * (push.scale - 1);
    return {scale: 1 + s, origin: push.origin};
  }
  return {scale: 1, origin: at([SCREEN.w / 2, SCREEN.h / 2])};
}

function Ad() {
  const f = useCurrentFrame();
  const leave = prog(f, T.end, 30, exit);
  const view = camera(f);
  const toBudgets = prog(f, T.budgets, 26, move);
  const toGoals = prog(f, T.goals, 26, move);
  return (
    <AbsoluteFill style={{background: COLOR.ground, overflow: 'hidden', fontFamily: "'Space Grotesk', sans-serif"}}>
      <HookWords f={f} />
      <Captions f={f} />
      {f >= T.pull - 6 && leave < 1 ? (
        <div style={{position: 'absolute', left: PHONE_AT.x, top: PHONE_AT.y, transform: `translateY(${phoneDrop(f) + leave * 1900}px) scale(${PHONE_SCALE * (1 - 0.08 * leave)})`, transformOrigin: '50% 0'}}>
          <div style={{transform: `scale(${view.scale})`, transformOrigin: `${view.origin[0]}px ${view.origin[1]}px`}}>
            <Phone>
              {toBudgets < 1 ? (
                <div style={{position: 'absolute', inset: 0, transform: `translateX(${-SCREEN.w * toBudgets}px)`}}>
                  <Overview f={f} />
                </div>
              ) : null}
              {f >= T.budgets && toGoals < 1 ? (
                <div style={{position: 'absolute', inset: 0, background: COLOR.paper, transform: `translateX(${SCREEN.w * (1 - toBudgets) - SCREEN.w * toGoals}px)`}}>
                  <Budgets f={f} />
                </div>
              ) : null}
              {f >= T.goals ? (
                <div style={{position: 'absolute', inset: 0, background: COLOR.paper, transform: `translateX(${SCREEN.w * (1 - toGoals)}px)`}}>
                  <Goals f={f} />
                </div>
              ) : null}
            </Phone>
          </div>
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
