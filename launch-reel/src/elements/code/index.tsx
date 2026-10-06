import {AbsoluteFill, interpolate, spring, useCurrentFrame} from 'veymelo';
import {C, MONO, SANS} from '../../theme';
import {ResultView} from '../results/ResultView';

/**
 * code: "every frame is code". The element's real kind of source writes itself line by line,
 * the frame it draws plays beside it, the render bar fills, and the three sizes land.
 */
const SRC = `import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {Shoe, Title, Disc} from './parts';

export default function Sneaker() {
  const f = useCurrentFrame();
  const disc = spring({frame: f, fps: 60});
  const shoe = spring({frame: f - 8, fps: 60});
  return (
    <AbsoluteFill style={{background: '#f2ebdf'}}>
      <Disc scale={disc} />
      <Shoe x={(1 - shoe) * 900} tilt={-7} />
      <Title words={['NEW', 'DROP']} at={10} />
    </AbsoluteFill>
  );
}`.split('\n');

const KW = /\b(import|from|export|default|function|const|return)\b/g;
function paint(line: string) {
  // a small highlighter: strings, numbers, keywords, components
  const out: {t: string; c: string}[] = [];
  const re = /('[^']*'|\b\d+(?:\.\d+)?\b|\b(?:import|from|export|default|function|const|return)\b|<\/?[A-Z]\w*|\b[A-Z]\w*\b)/g;
  let last = 0;
  for (const m of line.matchAll(re)) {
    if (m.index! > last) out.push({t: line.slice(last, m.index), c: '#b8b8c4'});
    const t = m[0];
    const c = t.startsWith("'") ? '#9fe3b4' : /^\d/.test(t) ? '#8ec5ff' : KW.test(t) ? '#ff9d7a' : '#ffffff';
    KW.lastIndex = 0;
    out.push({t, c});
    last = m.index! + t.length;
  }
  if (last < line.length) out.push({t: line.slice(last), c: '#b8b8c4'});
  return out;
}

export const BAR_FROM = 120;
export const BAR_TO = 240;
export const DONE_AT = 252;
export const SIZES_AT = [270, 280, 290];

export function Code({f}: {f: number}) {
  const lineAt = (i: number) => 6 + i * 6;
  const p = interpolate(f, [BAR_FROM, BAR_TO], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const frames = Math.round(p * 5400);
  const done = f >= DONE_AT;
  const editorIn = spring({frame: f, fps: 60, config: {damping: 20, stiffness: 170, mass: 1}});
  const prevIn = spring({frame: f - 40, fps: 60, config: {damping: 20, stiffness: 170, mass: 1}});
  const sizes = [
    {label: '1920 × 1080', w: 176, h: 99},
    {label: '1080 × 1920', w: 62, h: 110},
    {label: '1080 × 1080', w: 104, h: 104},
  ];
  return (
    <AbsoluteFill style={{background: C.ink, fontFamily: SANS}}>
      <div style={{position: 'absolute', left: 120, top: 100, width: 900, height: 660, borderRadius: 18, background: '#141418', boxShadow: '0 0 0 1px rgba(255,255,255,0.07)', overflow: 'hidden', opacity: editorIn, transform: `translateY(${(1 - editorIn) * 24}px)`}}>
        <div style={{height: 50, display: 'flex', alignItems: 'center', padding: '0 22px', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.07)', color: '#9a9aa6', fontSize: 17, fontWeight: 600}}>
          src/elements/sneaker/index.tsx
        </div>
        <div style={{padding: '22px 0', fontFamily: MONO, fontSize: 21, lineHeight: 1.72, whiteSpace: 'pre'}}>
          {SRC.map((line, i) => {
            const shown = f >= lineAt(i);
            const fresh = shown ? Math.max(0, 1 - (f - lineAt(i)) / 24) : 0;
            return (
              <div key={i} style={{display: 'flex', opacity: shown ? 1 : 0, background: `rgba(255,216,77,${0.1 * fresh})`}}>
                <span style={{width: 56, textAlign: 'right', paddingRight: 22, color: '#4a4a55'}}>{i + 1}</span>
                <span>
                  {paint(line).map((s, j) => (
                    <span key={j} style={{color: s.c}}>
                      {s.t}
                    </span>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{position: 'absolute', left: 1080, top: 210, opacity: prevIn, transform: `translateY(${(1 - prevIn) * 24}px)`}}>
        <div style={{fontFamily: MONO, fontSize: 19, color: '#8a8a96', marginBottom: 14}}>frame {String(Math.min(5400, 3000 + f * 4)).padStart(4, '0')} · always the same picture</div>
        <div style={{position: 'relative', width: 720, height: 405, borderRadius: 16, overflow: 'hidden', boxShadow: '0 0 0 1px rgba(255,255,255,0.08)'}}>
          <ResultView id="sneaker" w={720} h={405} from={30} peek={0} />
        </div>
      </div>
      {/* the render */}
      <div style={{position: 'absolute', left: 120, right: 120, top: 820}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 22, color: done ? '#fff' : '#b8b8c4', opacity: f >= BAR_FROM - 10 ? 1 : 0}}>
          <span>
            {done ? (
              <>
                <span style={{color: C.ok}}>✓</span> renders/ad.mp4
              </>
            ) : (
              <>veymelo render · {frames.toLocaleString('en-US')} / 5,400 frames</>
            )}
          </span>
          <span style={{color: '#8a8a96'}}>60 fps · motion blur · −14 LUFS</span>
        </div>
        <div style={{marginTop: 16, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', opacity: f >= BAR_FROM - 10 ? 1 : 0}}>
          <div style={{height: '100%', width: `${p * 100}%`, borderRadius: 5, background: done ? C.ok : C.accent}} />
        </div>
        <div style={{display: 'flex', gap: 56, marginTop: 34, alignItems: 'flex-end'}}>
          {sizes.map((s, i) => {
            const a = spring({frame: f - SIZES_AT[i], fps: 60, config: {damping: 12, stiffness: 200, mass: 0.8}});
            return (
              <div key={s.label} style={{display: 'flex', alignItems: 'flex-end', gap: 16, opacity: f >= SIZES_AT[i] ? 1 : 0, transform: `scale(${0.6 + 0.4 * a})`, transformOrigin: '0% 100%'}}>
                <div style={{width: s.w * 0.62, height: s.h * 0.62, border: '3px solid #fff', borderRadius: 6}} />
                <span style={{fontFamily: MONO, fontSize: 21, color: '#dcdce2'}}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

export default function Element() {
  const f = useCurrentFrame();
  return <Code f={f} />;
}
