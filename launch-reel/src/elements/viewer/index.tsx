import type {ReactNode} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {C, MONO, SANS} from '../../theme';
import {Caret} from '../prompt';

/**
 * viewer: the Veymelo live viewer rebuilt from veymelo.com (studio/data/brand.json):
 * a browser window, the site header, the black stage, and the timeline with its chips and red playhead.
 * Design size W×H; the stage is STAGE_W×STAGE_H and draws whatever it is given.
 */
export const W = 1700;
export const STAGE_W = 1640;
export const STAGE_H = Math.round((STAGE_W * 9) / 16); // 923
const BAR = 52;
const HEAD = 66;
const TL = 66;
export const H = BAR + HEAD + STAGE_H + TL + 4 + 26;
/** where the stage sits inside the window (for the camera to fly into it) */
export const STAGE_X = 30;
export const STAGE_Y = BAR + HEAD + 2;

export type Chip = {label: string; state: 'placeholder' | 'done'; weight?: number; appear?: number};

export function Viewer({stage, chips = [], playhead = 0, time = '00:00 / 00:20', status = 'Connected', f = 0, playing = false}: {stage?: ReactNode; chips?: Chip[]; playhead?: number; time?: string; status?: string; f?: number; playing?: boolean}) {
  const total = chips.reduce((a, c) => a + (c.weight ?? 1), 0) || 1;
  let acc = 0;
  const activeIndex = chips.findIndex((c) => {
    const w = (c.weight ?? 1) / total;
    const hit = playhead >= acc && playhead < acc + w + 1e-6;
    acc += w;
    return hit;
  });
  return (
    <div style={{width: W, height: H, borderRadius: 20, background: '#fff', boxShadow: '0 40px 100px rgba(11,11,15,0.22), 0 0 0 1px rgba(11,11,15,0.06)', overflow: 'hidden', fontFamily: SANS, color: C.ink, position: 'relative'}}>
      {/* browser bar */}
      <div style={{height: BAR, background: C.surface, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 20px', position: 'relative'}}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <div key={c} style={{width: 14, height: 14, borderRadius: '50%', background: c, marginRight: 9}} />
        ))}
        <div style={{position: 'absolute', left: W / 2 - 230, width: 460, height: 32, borderRadius: 9, background: C.surface2, display: 'grid', placeItems: 'center', fontSize: 16, color: C.muted, fontWeight: 500}}>veymelo.com</div>
      </div>
      {/* site header */}
      <div style={{height: HEAD, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em'}}>
          <Caret size={26} color={C.ink} rot={90} weight={0.2} />
          Veymelo
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 16}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '7px 15px', borderRadius: 999, border: `1px solid ${C.border}`, color: C.muted}}>
            <div style={{width: 9, height: 9, borderRadius: '50%', background: status === 'Connected' ? C.ok : C.red}} />
            {status}
          </div>
          <div style={{padding: '7px 15px', borderRadius: 999, border: `1px solid ${C.border}`, fontWeight: 600}}>♡ Support</div>
          <div style={{padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`, fontWeight: 600}}>Disconnect</div>
        </div>
      </div>
      {/* stage + timeline card */}
      <div style={{margin: `2px ${STAGE_X - 2}px 0`, border: `2px solid ${C.ink}`, borderRadius: 20, overflow: 'hidden'}}>
        <div style={{width: STAGE_W, height: STAGE_H, background: C.ink, position: 'relative', overflow: 'hidden'}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />
          {stage}
        </div>
        <div style={{height: TL, background: '#fff', display: 'flex', alignItems: 'center', gap: 14, padding: '0 14px', position: 'relative'}}>
          <div style={{width: 40, height: 40, borderRadius: '50%', background: C.ink, display: 'grid', placeItems: 'center', flex: 'none'}}>
            {playing ? (
              <div style={{display: 'flex', gap: 4}}>
                <div style={{width: 4, height: 13, background: '#fff', borderRadius: 1}} />
                <div style={{width: 4, height: 13, background: '#fff', borderRadius: 1}} />
              </div>
            ) : (
              <div style={{width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '12px solid #fff', marginLeft: 3}} />
            )}
          </div>
          <div style={{flex: 1, height: 34, position: 'relative', display: 'flex', gap: 3}}>
            {chips.map((c, i) => {
              const a = c.appear ?? 1;
              const done = c.state === 'done';
              const active = done && i === activeIndex;
              return (
                <div
                  key={c.label}
                  style={{
                    flex: c.weight ?? 1,
                    height: '100%',
                    borderRadius: 7,
                    background: active ? C.accent : done ? C.surface2 : C.surface,
                    border: done ? '1px solid transparent' : `1.5px dashed ${C.border}`,
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    fontSize: 15,
                    fontWeight: 600,
                    color: done ? C.ink : C.muted,
                    opacity: a,
                    transform: `translateY(${(1 - a) * 8}px)`,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {c.label}
                </div>
              );
            })}
            {chips.length > 0 && (
              <div style={{position: 'absolute', left: `${playhead * 100}%`, top: -12, bottom: -6, width: 2, background: C.red}}>
                <div style={{position: 'absolute', left: -5, top: -4, width: 12, height: 12, borderRadius: '50%', background: C.red}} />
              </div>
            )}
          </div>
          <div style={{fontFamily: MONO, fontSize: 15, color: C.muted, flex: 'none'}}>{time}</div>
        </div>
      </div>
    </div>
  );
}

/** The stage when nothing is built yet: Veymelo's own storyboard card. */
export function StoryCard({title, text, tag = 'STORYBOARD', note = 'Scene not built yet', dur = ''}: {title: string; text?: string; tag?: string; note?: string; dur?: string}) {
  return (
    <AbsoluteFill style={{background: C.surface2, padding: 26}}>
      <div style={{position: 'absolute', inset: 26, border: '2px dashed #b9b9c2', borderRadius: 16, padding: '34px 44px', fontFamily: SANS, color: C.ink}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <div style={{fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', color: C.muted, border: '1.5px solid #b9b9c2', borderRadius: 6, padding: '4px 10px'}}>{tag}</div>
          <div style={{fontSize: 17, color: C.muted}}>{note}</div>
          <div style={{marginLeft: 'auto', fontSize: 17, color: C.muted}}>{dur}</div>
        </div>
        <div style={{position: 'absolute', left: 44, right: 44, top: '40%'}}>
          <div style={{fontSize: 58, fontWeight: 700, letterSpacing: '-0.025em'}}>{title}</div>
          {text && <div style={{fontSize: 27, color: '#55555f', marginTop: 18, lineHeight: 1.5, maxWidth: 1200}}>{text}</div>}
        </div>
      </div>
    </AbsoluteFill>
  );
}

export default function Element() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#e9e9ee', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: 'scale(0.86)'}}>
        <Viewer
          f={f}
          playhead={(f % 240) / 240}
          playing
          chips={[
            {label: 'Drop', state: 'done'},
            {label: 'Shoe', state: 'done'},
            {label: 'Details', state: 'placeholder'},
            {label: 'Colours', state: 'placeholder'},
            {label: 'End card', state: 'placeholder'},
          ]}
          stage={<StoryCard title="Your video starts here" text="Your AI studies your material and plans the video first. Its storyboard appears here, then every piece as it is made." />}
        />
      </div>
    </AbsoluteFill>
  );
}
