import {Img} from 'veymelo';
import {COLOR, SPEAKER} from '../content';
import {SANS} from '../fonts';
import {voice} from '../levels';
import type {Layout} from '../layout';

// Who is speaking: a ring around them breathes with their voice.
export function Header({f, box}: {f: number; box: Layout}) {
  const {u} = box;
  const shown = 1; // the first frame is the cover: the speaker is already there
  const level = voice(f);
  const size = 132 * u;
  return (
    <div style={{position: 'absolute', left: box.header.x, top: box.header.y, display: 'flex', alignItems: 'center', gap: 30 * u, opacity: shown, transform: `translateY(${(1 - shown) * 14 * u}px)`}}>
      <div style={{position: 'relative', width: size, height: size, flex: 'none'}}>
        <div style={{position: 'absolute', inset: -10 * u, borderRadius: '50%', border: `${3 * u}px solid ${COLOR.accent}`, opacity: 0.2 + 0.7 * level, transform: `scale(${1 + 0.1 * level})`}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', background: COLOR.avatar, display: 'grid', placeItems: 'center', color: COLOR.text, fontFamily: SANS, fontWeight: 800, fontSize: 40 * u, letterSpacing: '0.02em'}}>
          {SPEAKER.photo ? <Img src={SPEAKER.photo} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : SPEAKER.initials}
        </div>
      </div>
      <div style={{fontFamily: SANS}}>
        <div style={{fontSize: 40 * u, fontWeight: 700, color: COLOR.text, letterSpacing: '-0.01em'}}>{SPEAKER.name}</div>
        <div style={{fontSize: 27 * u, fontWeight: 500, color: COLOR.muted, marginTop: 6 * u}}>{SPEAKER.line}</div>
      </div>
    </div>
  );
}
