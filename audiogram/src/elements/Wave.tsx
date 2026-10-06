import {COLOR} from '../content';
import {SANS} from '../fonts';
import {CLIP_FRAMES, LEVELS} from '../levels';
import type {Layout} from '../layout';

// The clip as a timeline of its real loudness: what has been said is solid,
// what is to come is faint, and the playhead is where the voice is now.
const BARS = 64;
const bars = Array.from({length: BARS}, (_, i) => {
  const from = Math.floor((i * CLIP_FRAMES) / BARS);
  const to = Math.floor(((i + 1) * CLIP_FRAMES) / BARS);
  return {from, peak: Math.sqrt(Math.max(...LEVELS.slice(from, Math.max(from + 1, to))))};
});
const clock = (frames: number, fps: number) => {
  const s = Math.floor(frames / fps);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export function Wave({f, fps, box}: {f: number; fps: number; box: Layout}) {
  const {u, wave} = box;
  const now = Math.min(f, CLIP_FRAMES);
  const gap = 6 * u;
  const barW = (wave.w - gap * (BARS - 1)) / BARS;
  return (
    <div style={{position: 'absolute', left: wave.x, top: wave.y, width: wave.w, height: wave.h + 50 * u}}>
      {bars.map((bar, i) => {
        const h = Math.max(6 * u, bar.peak * wave.h);
        const played = bar.from < now;
        const current = played && (i === BARS - 1 || bars[i + 1].from >= now);
        return <div key={i} style={{position: 'absolute', left: i * (barW + gap), top: (wave.h - h) / 2, width: barW, height: h, borderRadius: barW / 2, background: current ? COLOR.accent : COLOR.text, opacity: played ? 1 : 0.18}} />;
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: wave.h + 16 * u, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 24 * u, color: COLOR.muted, fontVariantNumeric: 'tabular-nums', }}>
        <span>{clock(now, fps)}</span>
        <span>{clock(CLIP_FRAMES, fps)}</span>
      </div>
    </div>
  );
}
