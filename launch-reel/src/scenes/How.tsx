import {AbsoluteFill, interpolate, spring, useCurrentFrame} from 'veymelo';
import {Chat, Msg, Step, H as CHAT_H, W as CHAT_W} from '../elements/chat';
import {keyFrames} from '../elements/prompt';
import {ResultView} from '../elements/results/ResultView';
import {CMD, CMD_AT, CMD_RATE, ENTER_AT, H as TERM_H, Terminal, TICKS, W as TERM_W} from '../elements/terminal';
import {Chip, H as VIEW_H, STAGE_H, STAGE_W, STAGE_X, STAGE_Y, StoryCard, Viewer, W as VIEW_W} from '../elements/viewer';
import {enter, move} from '../motion';
import {C} from '../theme';

/**
 * 0:10-0:32. One command (terminal), the viewer opens, then the AI works live:
 * chat on the left, the viewer on the right filling itself, an edit landing, and the camera flies into the stage.
 */
export const HOW = 1320;
const OPEN = 330; // the viewer opens out of the terminal
const SPLIT = 480; // chat arrives, viewer moves right (0:18)
const ASK = 'make a 20-second ad for our sneaker launch, bold';
const ASK_AT = 528;
const ASK_RATE = 0.9;
const SEND = 600; // 0:20
const REPLY = 630;
const BOARD = 660; // the storyboard chips arrive (0:21)
const MADE = [720, 780, 840, 900, 960]; // each screen becomes real, one a second
const PLAY = 1020; // the whole ad plays
const EDIT = 'make the title bigger';
const EDIT_AT = 1088;
const EDIT_RATE = 0.6;
const EDIT_SEND = 1140; // 0:29
const DONE = 1170;
const PUSH = 1230; // the camera flies into the stage
const SCREENS = ['Drop', 'Shoe', 'Details', 'Colours', 'End card'];
const PEEKS = [4, 16, 34, 60, 150];
const AD_SECONDS = 8;

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const howSounds = () => [
  ...keyFrames(CMD, CMD_AT, CMD_RATE, 2).map((f, i) => ({f, s: `key${i % 4}`, v: 0.2})),
  {f: ENTER_AT, s: 'enter', v: 0.4},
  ...TICKS.map((f) => ({f, s: 'tick', v: 0.28})),
  {f: OPEN, s: 'whoosh', v: 0.3},
  ...keyFrames(ASK, ASK_AT, ASK_RATE, 4).map((f, i) => ({f, s: `key${i % 4}`, v: 0.14})),
  {f: SEND, s: 'click', v: 0.4},
  ...MADE.map((f) => ({f, s: 'pop', v: 0.3})),
  ...keyFrames(EDIT, EDIT_AT, EDIT_RATE, 3).map((f, i) => ({f, s: `key${i % 4}`, v: 0.14})),
  {f: EDIT_SEND, s: 'click', v: 0.4},
  {f: DONE, s: 'pop', v: 0.34},
  {f: PUSH + 10, s: 'whoosh', v: 0.26},
];

const fmt = (s: number) => `00:${String(Math.floor(s)).padStart(2, '0')}`;

export function How() {
  const f = useCurrentFrame();
  // --- the terminal
  const termIn = spring({frame: f, fps: 60, config: {damping: 20, stiffness: 170, mass: 1}});
  const open = interpolate(f, [OPEN, OPEN + 50], [0, 1], {...cl, easing: enter});
  const creep = 1 + 0.04 * interpolate(f, [0, OPEN], [0, 1], cl);
  const termScale = creep * (1 - 0.1 * open);
  const termAlpha = termIn * (1 - interpolate(f, [OPEN + 10, OPEN + 50], [0, 1], cl));

  // --- the viewer: opens to the centre, then moves right for the chat
  const split = interpolate(f, [SPLIT, SPLIT + 44], [0, 1], {...cl, easing: move});
  const vs = interpolate(split, [0, 1], [0.86, 0.7]) * interpolate(open, [0, 1], [0.35, 1]);
  const vx = interpolate(split, [0, 1], [960 - (VIEW_W * 0.86) / 2, 1920 - VIEW_W * 0.7 - 50]);
  const vy = interpolate(split, [0, 1], [540 - (VIEW_H * 0.86) / 2, 540 - (VIEW_H * 0.7) / 2]);
  // while opening, grow from the centre of the frame
  const vxo = 960 - (VIEW_W * vs) / 2 + (vx - (960 - (VIEW_W * interpolate(split, [0, 1], [0.86, 0.7])) / 2)) * 1;
  const vyo = 540 - (VIEW_H * vs) / 2 + (vy - (540 - (VIEW_H * interpolate(split, [0, 1], [0.86, 0.7])) / 2));

  // --- the chat
  const chatIn = interpolate(f, [SPLIT + 6, SPLIT + 50], [0, 1], {...cl, easing: enter});
  const msgs: Msg[] = [
    {at: SPLIT + 30, from: 'ai', body: 'Veymelo is connected. What should we make?'},
    {at: SEND, from: 'you', body: ASK},
    {at: REPLY, from: 'ai', body: 'Planning 5 screens. The storyboard is in your viewer.'},
    {
      at: MADE[0] - 24,
      from: 'ai',
      body: (
        <div>
          {SCREENS.map((s, i) => (
            <Step key={s} f={f} at={MADE[i]} label={s} />
          ))}
        </div>
      ),
    },
    {at: EDIT_SEND, from: 'you', body: EDIT},
    {at: DONE, from: 'ai', body: 'Done. The title is bigger.'},
  ];

  // --- what the viewer shows
  const chips: Chip[] = SCREENS.map((label, i) => ({
    label,
    state: f >= MADE[i] ? 'done' : 'placeholder',
    appear: interpolate(f, [BOARD + i * 5, BOARD + i * 5 + 14], [0, 1], {...cl, easing: enter}),
  }));
  const madeI = MADE.reduce((a, m, i) => (f >= m ? i : a), -1);
  let playhead = 0;
  if (madeI >= 0 && f < PLAY) {
    const prev = madeI > 0 ? (madeI - 1) / 5 + 0.012 : 0;
    playhead = interpolate(f, [MADE[madeI], MADE[madeI] + 14], [prev, madeI / 5 + 0.012], {...cl, easing: move});
  }
  if (f >= PLAY - 14 && f < PLAY) playhead = interpolate(f, [PLAY - 14, PLAY], [0.8, 0], {...cl, easing: move});
  if (f >= PLAY) playhead = Math.min(0.999, (f - PLAY) / 60 / AD_SECONDS);
  const edit = spring({frame: f - DONE, fps: 60, config: {damping: 16, stiffness: 160, mass: 1}});
  // the stage: Veymelo's empty card, then the storyboard as five cards that become real one by one,
  // then the first card opens to the whole stage and the ad plays
  const CW = 480, CH = 270, G = 40;
  const cardBox = (i: number) => {
    const row = i < 3 ? 0 : 1;
    const inRow = row === 0 ? 3 : 2;
    const col = row === 0 ? i : i - 3;
    const rowW = inRow * CW + (inRow - 1) * G;
    return {x: (STAGE_W - rowW) / 2 + col * (CW + G), y: (STAGE_H - (2 * CH + G)) / 2 + row * (CH + G)};
  };
  const grow = interpolate(f, [PLAY, PLAY + 30], [0, 1], {...cl, easing: move});
  let stage;
  if (f < BOARD) stage = <StoryCard title="Your video starts here" text="Your AI studies your material and plans the video first. Its storyboard appears here, then every piece as it is made." />;
  else
    stage = (
      <AbsoluteFill>
        {SCREENS.map((s, i) => {
          const a = interpolate(f, [BOARD + i * 5, BOARD + i * 5 + 16], [0, 1], {...cl, easing: enter});
          const real = f >= MADE[i];
          const pop = real ? spring({frame: f - MADE[i], fps: 60, config: {damping: 13, stiffness: 200, mass: 0.8}}) : 0;
          const b = cardBox(i);
          const isOpen = i === 0 && f >= PLAY;
          const x = isOpen ? b.x * (1 - grow) : b.x;
          const y = isOpen ? b.y * (1 - grow) : b.y;
          const w = isOpen ? CW + (STAGE_W - CW) * grow : CW;
          const h = isOpen ? CH + (STAGE_H - CH) * grow : CH;
          const fade = i > 0 ? 1 - grow : 1;
          return (
            <div key={s} style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 14 * (1 - grow * (isOpen ? 1 : 0)), overflow: 'hidden', opacity: a * fade, transform: `translateY(${(1 - a) * 20}px) scale(${real && !isOpen ? 0.94 + 0.06 * pop : 1})`, zIndex: isOpen ? 2 : 1}}>
              {real ? (
                isOpen ? (
                  <ResultView key="play" id="sneaker" w={w} h={h} from={PLAY} peek={0} edit={f >= DONE ? edit : 0} />
                ) : (
                  <ResultView key={`m${i}`} id="sneaker" w={w} h={h} from={MADE[i]} peek={0} variant={i} />
                )
              ) : (
                <div style={{position: 'absolute', inset: 0, background: C.surface2, border: '2px dashed #b9b9c2', borderRadius: 14, boxSizing: 'border-box', padding: 22, fontFamily: 'Inter, sans-serif'}}>
                  <div style={{fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', color: C.muted}}>STORYBOARD</div>
                  <div style={{position: 'absolute', left: 22, bottom: 22, fontSize: 30, fontWeight: 700, color: C.ink}}>
                    {i + 1} · {s}
                  </div>
                </div>
              )}
              {real && !isOpen && (
                <div style={{position: 'absolute', left: 12, top: 12, padding: '5px 12px', borderRadius: 8, background: 'rgba(11,11,15,0.78)', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600}}>
                  {i + 1} · {s}
                </div>
              )}
            </div>
          );
        })}
      </AbsoluteFill>
    );
  const stageFade = interpolate(f, [PUSH + 30, PUSH + 70], [1, 0], cl);

  // --- the camera: into the stage, so that the stage's black becomes the next scene's ground
  const push = interpolate(f, [PUSH, HOW], [0, 1], {...cl, easing: move});
  const sx = vxo + STAGE_X * vs;
  const sy = vyo + STAGE_Y * vs;
  const sw = STAGE_W * vs;
  const camS = interpolate(push, [0, 1], [1, 1920 / sw]);
  const camX = interpolate(push, [0, 1], [0, -sx * (1920 / sw)]);
  const camY = interpolate(push, [0, 1], [0, -sy * (1920 / sw)]);

  return (
    <AbsoluteFill style={{background: 'radial-gradient(120% 100% at 50% 40%, #f3f3f6 0%, #e4e4ea 100%)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${camX}px, ${camY}px) scale(${camS})`}}>
        {termAlpha > 0.001 && (
          <div style={{position: 'absolute', left: 960 - TERM_W / 2, top: 540 - TERM_H / 2, opacity: termAlpha, transform: `translateY(${(1 - termIn) * 40}px) scale(${termScale})`}}>
            <Terminal f={f} />
          </div>
        )}
        {f >= SPLIT && (
          <div style={{position: 'absolute', left: 50, top: 540 - (CHAT_H * 0.92) / 2, transform: `translateX(${(1 - chatIn) * -700}px) scale(0.92)`, transformOrigin: '0 0', opacity: chatIn}}>
            <Chat f={f} msgs={msgs} input={f < EDIT_AT ? ASK : EDIT} inputStart={f < EDIT_AT ? ASK_AT : EDIT_AT} inputRate={f < EDIT_AT ? ASK_RATE : EDIT_RATE} sendAt={f < EDIT_AT ? SEND : EDIT_SEND} />
          </div>
        )}
        {f >= OPEN && (
          <div style={{position: 'absolute', left: vxo, top: vyo, transform: `scale(${vs})`, transformOrigin: '0 0', opacity: Math.min(1, open * 2)}}>
            <Viewer
              f={f}
              chips={f >= BOARD ? chips : []}
              playhead={playhead}
              playing={f >= PLAY}
              time={`${fmt(playhead * AD_SECONDS)} / 00:0${AD_SECONDS}`}
              stage={<div style={{position: 'absolute', inset: 0, opacity: stageFade}}>{stage}</div>}
            />
          </div>
        )}
      </div>
      {/* the stage's grid fades with its picture so the push lands on plain ink */}
      <AbsoluteFill style={{background: C.ink, opacity: interpolate(f, [HOW - 24, HOW], [0, 1], cl)}} />
    </AbsoluteFill>
  );
}
export const CHAT_SIZE = {CHAT_W, CHAT_H};
