import {Icon} from '../elements/icon';
import {SCREEN} from '../elements/phone';
import {Touch} from '../elements/touch';
import {APP, BALANCE, CHIPS, COLOR, TAPPED_DAY, WEEK, WEEK_SPENT, money} from '../content';
import {land, prog, snap} from '../motion';
import {T} from '../timing';

// Home: the balance, this week as a chart (one day tapped open), the recent
// spending: the hook's receipts, now in order.
export const CHART = {x: 24, y: 262, w: SCREEN.w - 48, h: 330, pad: 28, gap: 14, letters: 34};
const inner = CHART.w - 2 * CHART.pad;
const barW = (inner - (WEEK.length - 1) * CHART.gap) / WEEK.length;
const tallest = Math.max(...WEEK.map(day => day.spent));
const barMax = CHART.h - 2 * CHART.pad - CHART.letters - 40;
export const barCenter = (i: number) => CHART.x + CHART.pad + i * (barW + CHART.gap) + barW / 2;
const barBottom = CHART.y + CHART.h - CHART.pad - CHART.letters;
export const TAP_POINT: [number, number] = [barCenter(TAPPED_DAY), barBottom - (WEEK[TAPPED_DAY].spent / tallest) * barMax * 0.5];
/** Where each receipt of the hook lands: its row in Recent (left edge, middle), and when. */
export const ROW_AT = (i: number): [number, number] => [40, 668 + i * 92 + 38];
export const LANDS = (i: number) => T.pull + 30 + i * 5;
/** The rows that fit the screen; the other receipts go into the phone below them. */
export const ROWS = 4;
export const ROW_W = 480;

export function Overview({f}: {f: number}) {
  const balance = prog(f, T.balance, 24);
  const counted = WEEK_SPENT * prog(f, T.bars, 60);
  const tapped = f >= T.tapDay;
  const tip = land(f, T.tapDay + 2, snap);
  const recent = CHIPS.slice(0, ROWS);
  return (
    <div style={{position: 'absolute', inset: 0, padding: '0 40px'}}>
      <div style={{position: 'absolute', left: 40, top: 96, fontSize: 24, color: COLOR.muted, opacity: balance}}>Good morning, {APP.user}</div>
      <div style={{position: 'absolute', left: 40, top: 128, fontSize: 64, fontWeight: 700, color: COLOR.brand, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', opacity: balance, transform: `translateY(${(1 - balance) * 16}px)`}}>
        {money(BALANCE)}
      </div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 222, display: 'flex', justifyContent: 'space-between', fontSize: 22, opacity: prog(f, T.bars - 6, 16)}}>
        <span style={{color: COLOR.muted}}>Spent this week</span>
        <span style={{color: COLOR.ink, fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>{money(counted)}</span>
      </div>
      <div style={{position: 'absolute', left: CHART.x, top: CHART.y, width: CHART.w, height: CHART.h, borderRadius: 32, background: COLOR.brand, opacity: prog(f, T.bars - 10, 14)}}>
        {WEEK.map((day, i) => {
          const grow = prog(f, T.bars + i * 4, 30);
          const h = (day.spent / tallest) * barMax * grow;
          const on = tapped && i === TAPPED_DAY;
          return (
            <div key={i}>
              <div style={{position: 'absolute', left: barCenter(i) - CHART.x - barW / 2, top: barBottom - CHART.y - h, width: barW, height: h, borderRadius: 12, background: on ? COLOR.accent : 'rgba(255,255,255,0.26)'}} />
              <div style={{position: 'absolute', left: barCenter(i) - CHART.x - 20, width: 40, top: barBottom - CHART.y + 12, textAlign: 'center', fontSize: 18, color: on ? COLOR.accent : 'rgba(255,255,255,0.6)', fontWeight: on ? 700 : 500}}>{day.day}</div>
            </div>
          );
        })}
      </div>
      {tapped ? (
        <div style={{position: 'absolute', left: barCenter(TAPPED_DAY) - 90, width: 180, top: barBottom - barMax - 58, textAlign: 'center', transform: `scale(${tip})`, transformOrigin: '50% 100%'}}>
          <span style={{display: 'inline-block', padding: '10px 18px', borderRadius: 18, background: COLOR.paper, color: COLOR.ink, fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', boxShadow: '0 8px 20px rgba(16,19,18,0.18)'}}>
            Fri · {money(WEEK[TAPPED_DAY].spent)}
          </span>
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 40, top: 626, fontSize: 22, color: COLOR.muted, opacity: prog(f, T.pull + 20, 16)}}>Recent</div>
      {recent.map((item, i) => {
        const shown = prog(f, LANDS(i), 10);
        return (
          <div key={item.label} style={{position: 'absolute', left: 40, right: 40, top: 668 + i * 92, height: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${COLOR.line}`, opacity: shown}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <div style={{width: 52, height: 52, borderRadius: 16, background: COLOR.ground, display: 'grid', placeItems: 'center'}}>
                <Icon name={item.icon} size={28} color={COLOR.brand} />
              </div>
              <span style={{fontSize: 24, color: COLOR.ink, fontWeight: 500}}>{item.label}</span>
            </div>
            <span style={{fontSize: 24, color: COLOR.ink, fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>{item.amount}</span>
          </div>
        );
      })}
      <Touch f={f} from={[470, 1060]} to={TAP_POINT} appear={T.touchIn} tap={T.tapDay} />
    </div>
  );
}
