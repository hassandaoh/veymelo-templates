import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {GAME} from '../../content';
import {k} from '../../kit';
import {useThree} from '../../three-kit';
import {T} from '../../timing';
import {build, draw, glare} from '../../world/scene';

/**
 * The world (src/world/scene.ts) and the title. The title is left behind by
 * the lighthouse's glare: it comes up as the beam looks down the lens.
 */
export default function World({w, h, res = 1}: {w: number; h: number; res?: number}) {
  const f = useCurrentFrame();
  const ref = useThree(w, h, res, build, draw);
  const shine = glare(f);
  const title = k(f, T.sweep - 8, T.sweep + 26);
  const kicker = k(f, T.kicker, T.kicker + 24);
  const when = k(f, T.when, T.when + 24);
  return (
    <AbsoluteFill style={{background: '#f6c9a0'}}>
      <canvas ref={ref} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
      <div style={{position: 'absolute', left: 130, top: 120, color: '#fffaf2', fontFamily: 'Unbounded, sans-serif'}}>
        <div style={{fontSize: 28, fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase', opacity: kicker * 0.92, transform: `translateY(${(1 - kicker) * 14}px)`, textShadow: '0 2px 18px rgba(40,20,50,0.35)'}}>{GAME.kicker}</div>
        <div style={{fontSize: 156, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 14, opacity: title, filter: `blur(${(1 - title) * 10}px)`, transform: `scale(${1.04 - 0.04 * title})`, transformOrigin: '0 50%', textShadow: `0 4px 30px rgba(40,20,50,0.35), 0 0 ${40 + 80 * shine}px rgba(255,236,190,${0.25 + 0.6 * shine})`}}>{GAME.title}</div>
        <div style={{fontSize: 30, fontWeight: 500, letterSpacing: '0.06em', marginTop: 26, opacity: when * 0.9, transform: `translateY(${(1 - when) * 12}px)`, textShadow: '0 2px 18px rgba(40,20,50,0.35)'}}>{GAME.when}</div>
      </div>
    </AbsoluteFill>
  );
}
