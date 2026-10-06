import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'veymelo';
import {SIZE} from '../elements/results/kit';
import {RESULTS} from '../elements/results/registry';
import {ResultView} from '../elements/results/ResultView';
import {move} from '../motion';
import {C} from '../theme';
import {LAST_BOX, LAST_PEEK, M_IDS} from './Results';

/**
 * 1:11-1:17. The last result is one tile of a wall: the camera pulls back until every result
 * plays at once. The middle row is symmetric so the explainer sits exactly in the centre.
 */
export const WALL = 360;
const ROW_H = 220;
const GAP = 18;
const LAST = M_IDS[M_IDS.length - 1];
// the middle row is symmetric around the montage's last result (a 16:9)
const ROWS = [
  ['coffee', 'poster', 'botanical', 'world', 'social', 'lyric', 'kinetic'],
  ['logo', 'collage', 'app', 'perfume', 'shapes', 'food'],
  ['watch', 'sport', 'infographic', LAST, 'sneaker', 'poster', 'lyric'],
  ['food', 'social', 'isocity', 'podcast', 'mountains', 'app'],
  ['explainer', 'botanical', 'logo', 'kinetic', 'watch', 'infographic'],
];
export const wallSounds = () => [
  {f: 0, s: 'rise', v: 0.3},
  {f: 190, s: 'shimmer', v: 0.4},
];
const tileW = (id: string) => (ROW_H * SIZE[RESULTS[id].aspect].w) / SIZE[RESULTS[id].aspect].h;

type Tile = {id: string; x: number; y: number; w: number; peek: number; key: string};
const TILES: Tile[] = [];
ROWS.forEach((row, r) => {
  const total = row.reduce((a, id) => a + tileW(id), 0) + GAP * (row.length - 1);
  let x = 960 - total / 2;
  const y = 540 + (r - 2) * (ROW_H + GAP) - ROW_H / 2;
  row.forEach((id, c) => {
    const w = tileW(id);
    const centre = r === 2 && id === LAST;
    const peek = centre ? LAST_PEEK : RESULTS[id].peek + Math.floor(random(`wall-${r}-${c}`) * 90);
    TILES.push({id, x, y, w, peek, key: `${r}-${c}`});
    x += w + GAP;
  });
});
const centre = TILES.find((t) => t.key.startsWith('2-') && t.id === LAST)!;

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export function Wall() {
  const f = useCurrentFrame();
  const pull = interpolate(f, [0, 210], [0, 1], {...cl, easing: move});
  const creep = interpolate(f, [210, WALL], [0, 1], cl);
  // start: the centre tile exactly where the montage left its frame; end: the whole wall
  const s0 = LAST_BOX.w / centre.w;
  const s = interpolate(pull, [0, 1], [s0, 1]) * (1 - 0.035 * creep);
  const cx = centre.x + centre.w / 2;
  const cy = centre.y + ROW_H / 2;
  const tx = interpolate(pull, [0, 1], [LAST_BOX.x + LAST_BOX.w / 2, 960]);
  const ty = interpolate(pull, [0, 1], [LAST_BOX.y + LAST_BOX.h / 2, 540]);
  const radius = interpolate(pull, [0, 1], [28 / s0, 12]);
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s}) translate(${-cx}px, ${-cy}px)`}}>
        {TILES.map((t) => {
          // tiles far from the centre are off screen at the start: skip drawing them until they can be seen
          const visible = Math.abs(t.x + t.w / 2 - cx) * s < 1300 && Math.abs(t.y + ROW_H / 2 - cy) * s < 800;
          return (
            <div key={t.key} style={{position: 'absolute', left: t.x, top: t.y, width: t.w, height: ROW_H, borderRadius: radius, overflow: 'hidden', background: '#16161c'}}>
              {visible && <ResultView id={t.id} w={t.w} h={ROW_H} from={0} peek={t.peek} />}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
