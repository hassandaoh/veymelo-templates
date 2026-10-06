import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {C, MONO, SANS} from '../../theme';
import {typedCount} from '../prompt';

/**
 * terminal: a macOS terminal window running the real `npx veymelo@latest` (its output word for word,
 * from studio/data/brand.json). Local frames: the command types from CMD_AT, Enter on ENTER_AT,
 * then each ✓ arrives on its own frame (TICKS).
 */
export const W = 1240;
export const H = 560;
export const CMD = 'npx veymelo@latest';
export const CMD_AT = 30;
export const CMD_RATE = 0.5;
export const ENTER_AT = 90;
const CHECKS = ['Node.js', 'FFmpeg', 'FFprobe', 'git', 'Chrome'];
/** the frames each ✓ lands: five on eighths, then the three lines on beats */
export const TICKS = [120, 135, 150, 165, 180, 210, 240, 270];
export const READY_AT = 300;
const GREEN = '#2fd27a';

function Tick({at, f}: {at: number; f: number}) {
  const on = f >= at;
  const fresh = on ? Math.max(0, 1 - (f - at) / 18) : 0;
  return <span style={{color: GREEN, opacity: on ? 1 : 0, display: 'inline-block', transform: `scale(${1 + fresh * 0.35})`}}>✓</span>;
}

export function Terminal({f}: {f: number}) {
  const n = typedCount(CMD, f, CMD_AT, CMD_RATE);
  const typing = f < ENTER_AT;
  const blink = Math.floor(f / 15) % 2 === 0;
  const line = (at: number) => ({opacity: f >= at ? 1 : 0, transform: `translateY(${f >= at ? 0 : 6}px)`});
  return (
    <div style={{width: W, height: H, borderRadius: 16, background: '#141418', boxShadow: '0 40px 90px rgba(11,11,15,0.28), 0 0 0 1px rgba(255,255,255,0.06) inset', overflow: 'hidden', fontFamily: MONO}}>
      <div style={{height: 52, background: '#1e1e24', display: 'flex', alignItems: 'center', padding: '0 20px', position: 'relative'}}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <div key={c} style={{width: 15, height: 15, borderRadius: '50%', background: c, marginRight: 9}} />
        ))}
        <div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontSize: 17, fontWeight: 600, color: '#9a9aa6'}}>my-video — zsh</div>
      </div>
      <div style={{padding: '34px 40px', fontSize: 27, lineHeight: 1.75, color: '#dcdce2', whiteSpace: 'pre'}}>
        <div>
          <span style={{color: '#8a8a96'}}>~/my-video % </span>
          <span style={{color: '#ffffff'}}>{CMD.slice(0, n)}</span>
          <span style={{display: 'inline-block', width: 15, height: 32, verticalAlign: 'middle', background: C.accent, opacity: typing && (n < CMD.length || blink) ? 1 : 0, marginLeft: 2}} />
        </div>
        <div style={line(TICKS[0])}>
          {CHECKS.map((c, i) => (
            <span key={c} style={{opacity: f >= TICKS[i] ? 1 : 0}}>
              <Tick at={TICKS[i]} f={f} /> {c}
              {'  '}
            </span>
          ))}
        </div>
        <div style={line(TICKS[5])}>
          <Tick at={TICKS[5]} f={f} /> Project  ~/my-video (new)
        </div>
        <div style={line(TICKS[6])}>
          <Tick at={TICKS[6]} f={f} /> Live viewer running in the background and opened in the browser
        </div>
        <div style={line(TICKS[7])}>
          <Tick at={TICKS[7]} f={f} /> Veymelo skill added for Claude Code, Codex, Gemini CLI
        </div>
        <div style={{...line(READY_AT), marginTop: 22, color: '#ffffff', fontWeight: 700}}>
          <span style={{color: C.accent}}>{'› '}</span>Veymelo is ready.
        </div>
      </div>
    </div>
  );
}

export default function Element() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#e9e9ee', alignItems: 'center', justifyContent: 'center'}}>
      <Terminal f={f} />
    </AbsoluteFill>
  );
}
