import {Icon} from '../elements/icon';
import {SCREEN} from '../elements/phone';
import {Touch} from '../elements/touch';
import {APP, BALANCE, BUDGETS, CHIPS, COLOR, DAYS_LEFT, GOAL, OPENED, OTHER_GOALS, TAPPED_DAY, WEEK, WEEK_SPENT, money} from '../content';
import {enter, exit, land, mix, move, prog, snap} from '../motion';
import {T} from '../timing';

// The app is one screen that scrolls, never a slide to another. The
// receipts land as its rows; the week grows from them; the groceries row
// opens in place into its budget; what is left of it flows out in mint, and
// the screen follows it down into the goal.

export const CHART = {x: 24, y: 262, w: SCREEN.w - 48, h: 330, pad: 28, gap: 14, letters: 34};
const inner = CHART.w - 2 * CHART.pad;
const barW = (inner - (WEEK.length - 1) * CHART.gap) / WEEK.length;
const tallest = Math.max(...WEEK.map(day => day.spent));
const barMax = CHART.h - 2 * CHART.pad - CHART.letters - 40;
export const barCenter = (i: number) => CHART.x + CHART.pad + i * (barW + CHART.gap) + barW / 2;
const barBottom = CHART.y + CHART.h - CHART.pad - CHART.letters;
export const TAP_POINT: [number, number] = [barCenter(TAPPED_DAY), barBottom - (WEEK[TAPPED_DAY].spent / tallest) * barMax * 0.5];

const ROW_TOP = (i: number) => 668 + i * 92;
/** Where each receipt of the hook lands: its row in Recent (left edge, middle), and when. */
export const ROW_AT = (i: number): [number, number] => [40, ROW_TOP(i) + 38];
export const LANDS = (i: number) => T.pull + 30 + i * 5;
/** The rows that fit the screen; the other receipts go into the phone below them. */
export const ROWS = 4;
export const ROW_W = 480;

/** The row that opens: the receipt of the opened budget. */
const OPEN_ROW = CHIPS.findIndex(chip => chip.label === BUDGETS[OPENED].name);
const ROW_TAP: [number, number] = [300, ROW_TOP(OPEN_ROW) + 38];
/** The row, opened: a card at the top of the screen, with its ring. */
const CARD = {x: 24, top: 120, w: SCREEN.w - 48, h: 480};
const RING = {cy: 250, r: 110, stroke: 22};
const OPEN_SCROLL = ROW_TOP(OPEN_ROW) - CARD.top;
const GROW = CARD.h - 76;

/** The goals sit below the rows, out of sight until what is left goes there. */
const GOALS_TOP = 1480;
export const GOAL_CARD = {x: 24, w: SCREEN.w - 48, h: 280, r: 32};
/** Where the goal card comes to rest on the screen. */
export const GOAL_AT = 200;
const KEEP_SCROLL = GOALS_TOP + 40 + GROW - OPEN_SCROLL - GOAL_AT;
const BAR = {x: 32, y: 200, w: GOAL_CARD.w - 64, h: 18};
const before = GOAL.saved / GOAL.target;
const after = (GOAL.saved + GOAL.added) / GOAL.target;
const LAND_AT: [number, number] = [GOAL_CARD.x + BAR.x + BAR.w * after, GOAL_AT + BAR.y + BAR.h / 2];

/** The goal: it fills on the frame the money lands. Drawn in the phone, and lifted out of it at the end. */
export function GoalCard({f}: {f: number}) {
  const filled = prog(f, T.land, 36);
  return (
    <div style={{position: 'relative', width: GOAL_CARD.w, height: GOAL_CARD.h, borderRadius: GOAL_CARD.r, background: COLOR.brand, color: '#fff'}}>
      <div style={{position: 'absolute', left: 32, top: 32, width: 64, height: 64, borderRadius: 20, background: COLOR.accent, display: 'grid', placeItems: 'center'}}>
        <Icon name={GOAL.icon} size={34} color={COLOR.brand} />
      </div>
      <div style={{position: 'absolute', left: 32, top: 112, fontSize: 30, fontWeight: 700}}>{GOAL.name}</div>
      <div style={{position: 'absolute', left: 32, top: 152, fontSize: 24, opacity: 0.75, fontVariantNumeric: 'tabular-nums'}}>
        {money(GOAL.saved + GOAL.added * filled, false)} of {money(GOAL.target, false)}
      </div>
      <div style={{position: 'absolute', left: BAR.x, top: BAR.y, width: BAR.w, height: BAR.h, borderRadius: BAR.h / 2, background: 'rgba(255,255,255,0.2)'}}>
        <div style={{width: `${mix(before, after, filled) * 100}%`, height: '100%', borderRadius: BAR.h / 2, background: COLOR.accent}} />
      </div>
    </div>
  );
}

/** The groceries row: a receipt that opens in place into its budget, a ring of what is spent and, in mint, what is left. */
function OpenRow({f, open, shown}: {f: number; open: number; shown: number}) {
  const item = CHIPS[OPEN_ROW];
  const budget = BUDGETS[OPENED];
  const w = mix(ROW_W, CARD.w, open);
  const share = budget.spent / budget.of;
  const C = 2 * Math.PI * RING.r;
  const ring = prog(f, T.ring, 54);
  const left = prog(f, T.left, 26);
  const flow = prog(f, T.peel, 28, move); // what is left flows round to the top and out
  const edge = `rgba(230,236,232,${open})`;
  const pad = mix(0, 22, open);
  const top = mix(12, 22, open);
  return (
    <div style={{position: 'absolute', left: mix(40, CARD.x, open), top: ROW_TOP(OPEN_ROW), width: w, height: 76 + GROW * open, boxSizing: 'border-box', borderRadius: 28 * open, background: `rgba(255,255,255,${open})`, border: '2px solid', borderColor: `${edge} ${edge} ${COLOR.line} ${edge}`, opacity: shown, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: pad, top, height: 52, display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{width: 52, height: 52, borderRadius: 16, background: COLOR.ground, display: 'grid', placeItems: 'center'}}>
          <Icon name={item.icon} size={28} color={COLOR.brand} />
        </div>
        <span style={{fontSize: mix(24, 26, open), color: COLOR.ink, fontWeight: open > 0.5 ? 600 : 500}}>{item.label}</span>
      </div>
      <span style={{position: 'absolute', right: pad, top: top + 12, fontSize: 24, color: COLOR.ink, fontWeight: 600, fontVariantNumeric: 'tabular-nums', opacity: 1 - Math.min(1, open * 2)}}>{item.amount}</span>
      <span style={{position: 'absolute', right: pad, top: top + 14, fontSize: 22, color: COLOR.muted, fontVariantNumeric: 'tabular-nums', opacity: Math.max(0, open * 2 - 1)}}>This month</span>
      {open > 0 ? (
        <div style={{position: 'absolute', left: 0, top: 0, width: w, height: CARD.h, opacity: prog(f, T.open + 20, 16)}}>
          <svg width={w} height={CARD.h} style={{position: 'absolute', left: 0, top: 0}}>
            <circle cx={w / 2} cy={RING.cy} r={RING.r} fill="none" stroke={COLOR.line} strokeWidth={RING.stroke} />
            <circle cx={w / 2} cy={RING.cy} r={RING.r} fill="none" stroke={COLOR.accent} strokeWidth={RING.stroke} strokeDasharray={`${C * (1 - share) * left * (1 - flow)} ${C}`} strokeDashoffset={-C * (share + (1 - share) * flow)} transform={`rotate(-90 ${w / 2} ${RING.cy})`} />
            <circle cx={w / 2} cy={RING.cy} r={RING.r} fill="none" stroke={COLOR.brand} strokeWidth={RING.stroke} strokeLinecap="round" strokeDasharray={`${C * share * ring} ${C}`} transform={`rotate(-90 ${w / 2} ${RING.cy})`} />
          </svg>
          <div style={{position: 'absolute', left: 0, right: 0, top: RING.cy - 44, textAlign: 'center', opacity: 1 - prog(f, T.peel, 14)}}>
            <div style={{fontSize: 58, fontWeight: 700, color: COLOR.brand, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1}}>{money(budget.of - budget.spent * ring, false)}</div>
            <div style={{fontSize: 22, color: COLOR.muted}}>left</div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', fontSize: 22, color: COLOR.muted, fontVariantNumeric: 'tabular-nums', opacity: prog(f, T.left + 10, 16)}}>
            {money(budget.spent, false)} of {money(budget.of, false)} · {DAYS_LEFT} days to go
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** What is left, as money: out of the ring's top, down into the goal. */
function Kept({f, keep}: {f: number; keep: number}) {
  if (f < T.peel + 14 || f >= T.land + 10) return null;
  const from: [number, number] = [CARD.x + CARD.w / 2, CARD.top + RING.cy - RING.r - KEEP_SCROLL * keep];
  // down, then along to the new end of the bar; the ring's words have gone before it passes
  const x = mix(from[0], LAND_AT[0], prog(f, T.go, T.land - T.go, exit));
  const y = mix(from[1], LAND_AT[1], prog(f, T.go, T.land - T.go, move));
  const grow = prog(f, T.peel + 14, 16, enter);
  const landed = prog(f, T.land, 10);
  return (
    <div style={{position: 'absolute', left: x - 58, top: y - 26, width: 116, height: 52, borderRadius: 26, background: COLOR.accent, color: COLOR.brand, fontSize: 24, fontWeight: 700, display: 'grid', placeItems: 'center', fontVariantNumeric: 'tabular-nums', transform: `scale(${(0.4 + 0.6 * grow) * (1 - 0.5 * landed)})`, opacity: 1 - landed, boxShadow: '0 10px 24px rgba(15,77,58,0.25)'}}>
      +{money(GOAL.added, false)}
    </div>
  );
}

export function Home({f}: {f: number}) {
  const open = prog(f, T.open, 40, move);
  const keep = prog(f, T.keep, T.land - T.keep, move); // the screen follows the money down
  const scroll = OPEN_SCROLL * open + KEEP_SCROLL * keep;
  const grow = GROW * open;
  const balance = prog(f, T.balance, 24);
  const counted = WEEK_SPENT * prog(f, T.bars, 60);
  const tapped = f >= T.tapDay;
  const tip = land(f, T.tapDay + 2, snap);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: SCREEN.w, transform: `translateY(${-scroll}px)`}}>
        <div style={{position: 'absolute', left: 40, top: 96, fontSize: 24, color: COLOR.muted, opacity: balance}}>Good morning, {APP.user}</div>
        <div style={{position: 'absolute', left: 40, top: 128, fontSize: 64, fontWeight: 700, color: COLOR.brand, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', opacity: balance, transform: `translateY(${(1 - balance) * 16}px)`}}>
          {money(BALANCE)}
        </div>
        <div style={{position: 'absolute', left: 40, width: SCREEN.w - 80, top: 222, display: 'flex', justifyContent: 'space-between', fontSize: 22, opacity: prog(f, T.bars - 6, 16)}}>
          <span style={{color: COLOR.muted}}>Spent this week</span>
          <span style={{color: COLOR.ink, fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>{money(counted)}</span>
        </div>
        <div style={{position: 'absolute', left: CHART.x, top: CHART.y, width: CHART.w, height: CHART.h, borderRadius: 32, background: COLOR.brand, opacity: prog(f, T.bars - 10, 14)}}>
          {WEEK.map((day, i) => {
            const h = (day.spent / tallest) * barMax * prog(f, T.bars + i * 4, 30);
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
        {CHIPS.slice(0, ROWS).map((item, i) => {
          const shown = prog(f, LANDS(i), 10);
          if (i === OPEN_ROW) return <OpenRow key={item.label} f={f} open={open} shown={shown} />;
          return (
            <div key={item.label} style={{position: 'absolute', left: 40, width: ROW_W, top: ROW_TOP(i) + (i > OPEN_ROW ? grow : 0), height: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${COLOR.line}`, opacity: shown * (1 - open)}}>
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
        <div style={{position: 'absolute', left: 40, top: GOALS_TOP + grow, fontSize: 22, color: COLOR.muted}}>Goals</div>
        <div style={{position: 'absolute', left: GOAL_CARD.x, top: GOALS_TOP + 40 + grow, visibility: f >= T.end ? 'hidden' : 'visible'}}>
          <GoalCard f={f} />
        </div>
        {OTHER_GOALS.map((goal, i) => (
          <div key={goal.name} style={{position: 'absolute', left: GOAL_CARD.x, top: GOALS_TOP + 40 + GOAL_CARD.h + 18 + i * 168 + grow, width: GOAL_CARD.w, height: 150, borderRadius: 28, background: '#fff', border: `2px solid ${COLOR.line}`, boxSizing: 'border-box'}}>
            <div style={{position: 'absolute', left: 28, top: 28, fontSize: 26, fontWeight: 600, color: COLOR.ink}}>{goal.name}</div>
            <div style={{position: 'absolute', right: 28, top: 30, fontSize: 22, color: COLOR.muted}}>
              {money(goal.saved, false)} of {money(goal.target, false)}
            </div>
            <div style={{position: 'absolute', left: 28, right: 28, top: 86, height: 10, borderRadius: 5, background: COLOR.line}}>
              <div style={{width: `${(goal.saved / goal.target) * 100}%`, height: '100%', borderRadius: 5, background: COLOR.brand}} />
            </div>
          </div>
        ))}
      </div>
      {/* the page passes under the status bar */}
      <div style={{position: 'absolute', left: 0, top: 0, width: SCREEN.w, height: 88, background: `linear-gradient(${COLOR.paper} 72%, rgba(251,252,251,0))`}} />
      <Kept f={f} keep={keep} />
      <Touch f={f} from={[470, 1060]} appear={T.touchIn} stops={[{at: TAP_POINT, tap: T.tapDay}, {at: ROW_TAP, tap: T.tapRow}]} leave={T.tapRow + 16} />
    </div>
  );
}
