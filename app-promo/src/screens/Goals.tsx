import {Icon} from '../elements/icon';
import {SCREEN} from '../elements/phone';
import {COLOR, GOAL, money} from '../content';
import {enter, exit, land, mix, prog, snap} from '../motion';
import {T} from '../timing';

// Goals: a notification says what was saved, and the money itself travels
// from it into the goal, which fills on the frame it lands.
const CARD = {x: 24, y: 196, w: SCREEN.w - 48, h: 300};
const BAR = {x: CARD.x + 32, y: CARD.y + 214, w: CARD.w - 64, h: 18};
const NOTE = {x: 20, y: 64, w: SCREEN.w - 40, h: 118};
const after = (GOAL.saved + GOAL.added) / GOAL.target;
const before = GOAL.saved / GOAL.target;
export const COIN_TO: [number, number] = [BAR.x + BAR.w * after, BAR.y + BAR.h / 2];
// It leaves from the notification's empty right side and drops down the card's empty right side.
const COIN_FROM: [number, number] = [NOTE.x + NOTE.w - 70, NOTE.y + NOTE.h / 2];

export function Goals({f}: {f: number}) {
  const filled = prog(f, T.coinAt, 36);
  const amount = GOAL.saved + GOAL.added * filled;
  const note = land(f, T.notify, snap) * (1 - prog(f, T.notifyOut, 18, exit));
  // Down first, then along to the new end of the bar: never across the words.
  const coinX = mix(COIN_FROM[0], COIN_TO[0], prog(f, T.coinFrom, T.coinAt - T.coinFrom, exit));
  const coinY = mix(COIN_FROM[1], COIN_TO[1], prog(f, T.coinFrom, T.coinAt - T.coinFrom, enter));
  const coinShown = f >= T.coinFrom && f < T.coinAt + 10;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: 40, top: 92, fontSize: 24, color: COLOR.muted}}>Savings</div>
      <div style={{position: 'absolute', left: 40, top: 120, fontSize: 48, fontWeight: 700, color: COLOR.brand, letterSpacing: '-0.03em'}}>Goals</div>
      <div style={{position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: 32, background: COLOR.brand, color: '#fff'}}>
        <div style={{position: 'absolute', left: 32, top: 32, width: 64, height: 64, borderRadius: 20, background: COLOR.accent, display: 'grid', placeItems: 'center'}}>
          <Icon name={GOAL.icon} size={34} color={COLOR.brand} />
        </div>
        <div style={{position: 'absolute', left: 32, top: 116, fontSize: 30, fontWeight: 700}}>{GOAL.name}</div>
        <div style={{position: 'absolute', left: 32, top: 158, fontSize: 24, opacity: 0.75, fontVariantNumeric: 'tabular-nums'}}>
          {money(amount, false)} of {money(GOAL.target, false)}
        </div>
      </div>
      <div style={{position: 'absolute', left: BAR.x, top: BAR.y, width: BAR.w, height: BAR.h, borderRadius: BAR.h / 2, background: 'rgba(255,255,255,0.2)'}}>
        <div style={{width: `${mix(before, after, filled) * 100}%`, height: '100%', borderRadius: BAR.h / 2, background: COLOR.accent}} />
      </div>
      <div style={{position: 'absolute', left: CARD.x, top: CARD.y + CARD.h + 18, width: CARD.w, height: 150, borderRadius: 28, background: '#fff', border: `2px solid ${COLOR.line}`, boxSizing: 'border-box'}}>
        <div style={{position: 'absolute', left: 28, top: 28, fontSize: 26, fontWeight: 600, color: COLOR.ink}}>Rainy day</div>
        <div style={{position: 'absolute', right: 28, top: 30, fontSize: 22, color: COLOR.muted}}>$2,400 of $5,000</div>
        <div style={{position: 'absolute', left: 28, right: 28, top: 86, height: 10, borderRadius: 5, background: COLOR.line}}>
          <div style={{width: '48%', height: '100%', borderRadius: 5, background: COLOR.brand}} />
        </div>
      </div>
      {note > 0.001 ? (
        <div style={{position: 'absolute', left: NOTE.x, top: NOTE.y, width: NOTE.w, height: NOTE.h, borderRadius: 32, background: 'rgba(16,19,18,0.94)', color: '#fff', display: 'flex', alignItems: 'center', gap: 20, padding: '0 26px', boxSizing: 'border-box', transform: `translateY(${(1 - note) * -(NOTE.h + NOTE.y + 20)}px)`}}>
          <div style={{width: 60, height: 60, borderRadius: 18, background: COLOR.accent, display: 'grid', placeItems: 'center', flex: 'none'}}>
            <Icon name="coin" size={34} color={COLOR.brand} />
          </div>
          <div>
            <div style={{fontSize: 24, fontWeight: 700}}>Nice work</div>
            <div style={{fontSize: 22, opacity: 0.75}}>You kept {money(GOAL.added, false)} this week</div>
          </div>
        </div>
      ) : null}
      {coinShown ? (
        <div style={{position: 'absolute', left: coinX - 58, top: coinY - 26, width: 116, height: 52, borderRadius: 26, background: COLOR.accent, color: COLOR.brand, fontSize: 24, fontWeight: 700, display: 'grid', placeItems: 'center', fontVariantNumeric: 'tabular-nums', transform: `scale(${1 - 0.5 * prog(f, T.coinAt, 10)})`, opacity: 1 - prog(f, T.coinAt, 10), boxShadow: '0 10px 24px rgba(15,77,58,0.25)'}}>
          +{money(GOAL.added, false)}
        </div>
      ) : null}
    </div>
  );
}
