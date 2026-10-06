import type {ReactNode} from 'react';
import {AbsoluteFill, spring, useCurrentFrame} from 'veymelo';
import {C, MONO, SANS} from '../../theme';
import {Caret, typedCount} from '../prompt';

/**
 * chat: the AI side. A panel with the conversation and an input that types.
 * Messages land with the house `settle` spring on their frame (`at`).
 */
export const W = 640;
export const H = 1000;

export type Msg = {at: number; from: 'you' | 'ai'; body: ReactNode};

function Arrive({f, at, children}: {f: number; at: number; children: ReactNode}) {
  const s = spring({frame: f - at, fps: 60, config: {damping: 20, stiffness: 170, mass: 1}});
  if (f < at) return null;
  return <div style={{opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 18}px)`}}>{children}</div>;
}

export function Chat({f, msgs, input = '', inputStart = 0, inputRate = 0.7, sendAt = Infinity}: {f: number; msgs: Msg[]; input?: string; inputStart?: number; inputRate?: number; sendAt?: number}) {
  const n = f < sendAt ? typedCount(input, f, inputStart, inputRate) : 0;
  const typing = f >= inputStart && f < sendAt;
  const blink = Math.floor(f / 15) % 2 === 0;
  return (
    <div style={{width: W, height: H, borderRadius: 22, background: '#fff', boxShadow: '0 40px 100px rgba(11,11,15,0.18), 0 0 0 1px rgba(11,11,15,0.06)', overflow: 'hidden', fontFamily: SANS, color: C.ink, display: 'flex', flexDirection: 'column'}}>
      <div style={{height: 76, display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px', borderBottom: `1px solid ${C.border}`}}>
        <div style={{width: 40, height: 40, borderRadius: 12, background: C.ink, display: 'grid', placeItems: 'center'}}>
          <Caret size={20} />
        </div>
        <div style={{fontSize: 21, fontWeight: 700}}>Your AI</div>
        <div style={{marginLeft: 'auto', fontSize: 15, color: C.muted, fontFamily: MONO}}>~/my-video</div>
      </div>
      <div style={{flex: 1, padding: '26px 26px 0', display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'flex-end', overflow: 'hidden'}}>
        {msgs.map((m, i) => (
          <Arrive key={i} f={f} at={m.at}>
            {m.from === 'you' ? (
              <div style={{alignSelf: 'flex-end', marginLeft: 70, background: C.ink, color: '#fff', borderRadius: '20px 20px 6px 20px', padding: '16px 22px', fontSize: 25, lineHeight: 1.38, fontWeight: 500}}>{m.body}</div>
            ) : (
              <div style={{display: 'flex', gap: 14, marginRight: 30}}>
                <div style={{width: 32, height: 32, flex: 'none', borderRadius: 10, background: C.ink, display: 'grid', placeItems: 'center', marginTop: 2}}>
                  <Caret size={16} />
                </div>
                <div style={{fontSize: 24, lineHeight: 1.45, color: '#2a2a32'}}>{m.body}</div>
              </div>
            )}
          </Arrive>
        ))}
      </div>
      <div style={{margin: 22, minHeight: 70, borderRadius: 16, border: `1.5px solid ${typing ? C.ink : C.border}`, display: 'flex', alignItems: 'center', padding: '0 12px 0 20px', gap: 10}}>
        <div style={{flex: 1, fontSize: 23, color: n ? C.ink : C.muted, whiteSpace: 'nowrap', overflow: 'hidden'}}>
          {n ? input.slice(0, n) : 'Ask your AI to make a video…'}
          {typing && <span style={{display: 'inline-block', width: 2, height: 24, background: C.ink, marginLeft: 2, verticalAlign: 'middle', opacity: n < input.length || blink ? 1 : 0}} />}
        </div>
        <div style={{width: 44, height: 44, borderRadius: '50%', background: n === input.length && n > 0 ? C.ink : C.surface2, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 22, fontWeight: 700}}>↑</div>
      </div>
    </div>
  );
}

/** A checklist line in the AI's reply: ✓ when its screen is made. */
export function Step({f, at, label}: {f: number; at: number; label: string}) {
  const done = f >= at;
  return (
    <div style={{fontFamily: MONO, fontSize: 21, color: done ? C.ink : '#a0a0aa', lineHeight: 1.75}}>
      <span style={{color: done ? C.ok : '#c4c4cc'}}>{done ? '✓' : '·'}</span> {label}
    </div>
  );
}

export default function Element() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#e9e9ee', alignItems: 'center', justifyContent: 'center'}}>
      <Chat
        f={f}
        input="make a 20-second ad for our sneaker launch, bold"
        inputStart={10}
        sendAt={90}
        msgs={[
          {at: 90, from: 'you', body: 'make a 20-second ad for our sneaker launch, bold'},
          {at: 130, from: 'ai', body: 'Planning 5 screens. The storyboard is in your viewer.'},
        ]}
      />
    </AbsoluteFill>
  );
}
