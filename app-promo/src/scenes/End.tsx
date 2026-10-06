import {Icon} from '../elements/icon';
import {APP, COLOR} from '../content';
import {enter, mix, move, prog} from '../motion';
import {GOAL_AT, GOAL_CARD, GoalCard} from '../screens/Home';
import {PHONE_SCALE, onScreen} from '../stage';
import {T} from '../timing';

const ICON = {x: 440, y: 560, size: 200, r: 54};

/** The goal card lifts out of the phone as it leaves, and becomes the app's icon: the money kept is the mark. */
function Mark({f}: {f: number}) {
  const k = prog(f, T.end, 40, move);
  const [x0, y0] = onScreen(T.end, [GOAL_CARD.x, GOAL_AT]);
  const card = 1 - prog(f, T.end + 4, 16);
  return (
    <div style={{position: 'absolute', left: mix(x0, ICON.x, k), top: mix(y0, ICON.y, k), width: mix(GOAL_CARD.w * PHONE_SCALE, ICON.size, k), height: mix(GOAL_CARD.h * PHONE_SCALE, ICON.size, k), borderRadius: mix(GOAL_CARD.r * PHONE_SCALE, ICON.r, k), background: COLOR.brand, overflow: 'hidden', boxShadow: `0 ${30 * k}px ${60 * k}px rgba(15,77,58,${0.25 * k})`}}>
      {card > 0 ? (
        <div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${PHONE_SCALE})`, transformOrigin: '0 0', opacity: card}}>
          <GoalCard f={f} />
        </div>
      ) : null}
      <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
        <Icon name="leaf" size={116} color={COLOR.accent} stroke={2} draw={prog(f, T.end + 26, 34, enter)} />
      </div>
    </div>
  );
}

// The end: the mark, the name, one line, and where to get it. Then it holds:
// the most resolved moment, not the loudest.
export function End({f}: {f: number}) {
  if (f < T.end) return null;
  const name = prog(f, T.name, 24);
  const line = prog(f, T.line, 22);
  const creep = 1 + 0.025 * prog(f, T.icon, T.length - T.icon, (t: number) => t); // a slow lean in while it holds
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${creep})`, transformOrigin: '50% 45%'}}>
      <Mark f={f} />
      <div style={{position: 'absolute', top: 800, overflow: 'hidden', paddingBottom: 10}}>
        <div style={{fontSize: 160, fontWeight: 700, color: COLOR.brand, letterSpacing: '-0.05em', lineHeight: 1, transform: `translateY(${(1 - name) * 110}%)`}}>{APP.name}</div>
      </div>
      <div style={{position: 'absolute', top: 990, fontSize: 48, color: COLOR.muted, opacity: line, transform: `translateY(${(1 - line) * 16}px)`}}>{APP.line}</div>
      <div style={{position: 'absolute', top: 1110, display: 'flex', gap: 20}}>
        {APP.stores.map((store, i) => {
          const k = prog(f, T.stores + i * 6, 20);
          return (
            <div key={store} style={{padding: '22px 40px', borderRadius: 999, border: `3px solid ${COLOR.brand}`, color: COLOR.brand, fontSize: 32, fontWeight: 600, opacity: k, transform: `translateY(${(1 - k) * 16}px)`}}>
              {store}
            </div>
          );
        })}
      </div>
    </div>
  );
}
