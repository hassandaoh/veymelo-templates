import {Icon} from '../elements/icon';
import {SCREEN} from '../elements/phone';
import {Touch} from '../elements/touch';
import {BUDGETS, COLOR, DAYS_LEFT, OPENED, money} from '../content';
import {mix, move, prog} from '../motion';
import {T} from '../timing';

// Budgets: each category against its budget; the tapped one opens into a
// ring of what is spent, with what is left in the middle.
const ROW = {x: 24, y: 196, w: SCREEN.w - 48, h: 118, gap: 14};
export const BUDGET_TAP: [number, number] = [ROW.x + ROW.w / 2, ROW.y + ROW.h / 2];
const RING = {r: 118, stroke: 24};

export function Budgets({f}: {f: number}) {
  const open = prog(f, T.tapBudget + 4, 30, move);
  const ring = prog(f, T.ring, 54);
  const opened = BUDGETS[OPENED];
  const share = opened.spent / opened.of;
  const left = opened.of - opened.spent;
  const circumference = 2 * Math.PI * RING.r;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: 40, top: 92, fontSize: 24, color: COLOR.muted}}>October</div>
      <div style={{position: 'absolute', left: 40, top: 120, fontSize: 48, fontWeight: 700, color: COLOR.brand, letterSpacing: '-0.03em'}}>Budgets</div>
      {BUDGETS.map((budget, i) => {
        const isOpen = i === OPENED;
        const shown = prog(f, T.budgets + 14 + i * 5, 22);
        const fill = prog(f, T.budgets + 24 + i * 5, 36);
        const y = ROW.y + i * (ROW.h + ROW.gap) + (isOpen ? 0 : open * 620);
        const h = isOpen ? mix(ROW.h, 640, open) : ROW.h;
        return (
          <div key={budget.name} style={{position: 'absolute', left: ROW.x, top: y, width: ROW.w, height: h, borderRadius: 28, background: '#fff', border: `2px solid ${COLOR.line}`, boxSizing: 'border-box', opacity: shown * (isOpen ? 1 : 1 - open), overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 22, top: 26, width: 60, height: 60, borderRadius: 18, background: COLOR.ground, display: 'grid', placeItems: 'center'}}>
              <Icon name={budget.icon} size={32} color={COLOR.brand} />
            </div>
            <div style={{position: 'absolute', left: 100, top: 24, fontSize: 26, fontWeight: 600, color: COLOR.ink}}>{budget.name}</div>
            <div style={{position: 'absolute', right: 24, top: 26, fontSize: 22, color: COLOR.muted, fontVariantNumeric: 'tabular-nums'}}>
              {money(budget.spent, false)} of {money(budget.of, false)}
            </div>
            <div style={{position: 'absolute', left: 100, right: 24, top: 72, height: 10, borderRadius: 5, background: COLOR.line, opacity: isOpen ? 1 - open : 1}}>
              <div style={{width: `${(budget.spent / budget.of) * 100 * fill}%`, height: '100%', borderRadius: 5, background: COLOR.brand}} />
            </div>
            {isOpen && open > 0 ? (
              <div style={{position: 'absolute', left: 0, right: 0, top: 120, height: 500, opacity: prog(f, T.tapBudget + 14, 16)}}>
                <svg width={ROW.w} height={300} style={{position: 'absolute', left: 0, top: 20}}>
                  <circle cx={ROW.w / 2} cy={150} r={RING.r} fill="none" stroke={COLOR.line} strokeWidth={RING.stroke} />
                  <circle cx={ROW.w / 2} cy={150} r={RING.r} fill="none" stroke={COLOR.brand} strokeWidth={RING.stroke} strokeLinecap="round" strokeDasharray={`${circumference * share * ring} ${circumference}`} transform={`rotate(-90 ${ROW.w / 2} 150)`} />
                </svg>
                <div style={{position: 'absolute', left: 0, right: 0, top: 128, textAlign: 'center'}}>
                  <div style={{fontSize: 58, fontWeight: 700, color: COLOR.brand, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums'}}>{money(opened.of - opened.spent * ring, false)}</div>
                  <div style={{fontSize: 22, color: COLOR.muted, marginTop: 2}}>left</div>
                </div>
                <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontSize: 22, color: COLOR.muted, opacity: prog(f, T.ring + 40, 16)}}>
                  {money(left, false)} left · {DAYS_LEFT} days to go
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
      <Touch f={f} from={[440, 1040]} to={BUDGET_TAP} appear={T.touchBudget} tap={T.tapBudget} leave={T.tapBudget + 22} />
    </div>
  );
}
