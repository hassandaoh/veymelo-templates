import {COLOR, DATA, money} from '../content';
import {SANS} from '../fonts';
import {TICKS, drawn, path, reached, valueAt, x, y, type Frame} from '../chart';
import {exit, prog} from '../motion';
import {T} from '../timing';

// The chart, as a printed page draws it: hairline gridlines, numbers on the
// lines, this year in the one accent, last year in grey for comparison, and
// short notes on the line where things happened, no boxes. The camera holds
// still; only the line moves.
export function Chart({f, fr}: {f: number; fr: Frame}) {
  const {u, chart} = fr;
  const t = drawn(f);
  const now = path(fr, DATA.values, Math.max(0.0001, t));
  const ghostT = (DATA.lastYear.length - 1) * prog(f, T.ghost[0], T.ghost[1]);
  const ghost = ghostT > 0 ? path(fr, DATA.lastYear, ghostT) : null;
  const tip = {x: x(fr, t), y: y(fr, valueAt(DATA.values, t))};
  const end = DATA.values.length - 1;
  const drawing = f >= T.draw[0] && f < T.draw[1] + 14;
  return (
    <svg width={fr.w} height={fr.h} style={{position: 'absolute', inset: 0}} fontFamily={SANS}>
      {TICKS.map((v, i) => {
        const grow = prog(f, T.grid[0] + i * 4, T.grid[1] - 20);
        const zero = v === 0;
        return (
          <g key={v}>
            <line x1={chart.x} x2={chart.x + chart.w * grow} y1={y(fr, v)} y2={y(fr, v)} stroke={zero ? COLOR.ink : COLOR.grid} strokeWidth={(zero ? 3 : 1.5) * u} />
            {zero ? null : <text x={chart.x - 18 * u} y={y(fr, v) + 9 * u} textAnchor="end" fill={COLOR.muted} fontSize={27 * u} fontWeight={500} opacity={grow} style={{fontVariantNumeric: 'tabular-nums'}}>{v}</text>}
          </g>
        );
      })}
      {DATA.months.map((m, i) => (
        <text key={m} x={x(fr, i)} y={y(fr, 0) + 44 * u} fill={COLOR.muted} fontSize={27 * u} fontWeight={500} textAnchor="middle" opacity={prog(f, T.grid[0] + 10 + i * 2, 20)}>
          {fr.tall ? m[0] : m}
        </text>
      ))}
      {ghost ? (
        <>
          <path d={ghost.line} fill="none" stroke={COLOR.ghost} strokeWidth={5 * u} strokeDasharray={`${10 * u} ${9 * u}`} strokeLinecap="round" />
          <text x={x(fr, end) + 18 * u} y={y(fr, DATA.lastYear[end]) + 10 * u} fill={COLOR.ghost} fontSize={30 * u} fontWeight={700} opacity={prog(f, T.ghost[0] + T.ghost[1] - 8, 14)}>{DATA.year - 1}</text>
        </>
      ) : null}
      {f >= T.draw[0] ? <path d={now.line} fill="none" stroke={COLOR.accent} strokeWidth={7.5 * u} strokeLinecap="round" strokeLinejoin="round" /> : null}
      {DATA.milestones.map(m => {
        const at = reached(m.month);
        if (f < at) return null;
        const lead = prog(f, at, 12);
        const words = prog(f, at + 8, 14);
        const px = x(fr, m.month), py = y(fr, DATA.values[m.month]);
        const top = py - 80 * u;
        return (
          <g key={m.month}>
            <line x1={px} y1={py - 10 * u} x2={px} y2={py - 10 * u - (py - 10 * u - top) * lead} stroke={COLOR.ink} strokeWidth={1.5 * u} />
            <circle cx={px} cy={py} r={9 * u} fill={COLOR.paper} stroke={COLOR.ink} strokeWidth={3.5 * u} />
            <g opacity={words}>
              <text x={px} y={top - 40 * u} fill={COLOR.ink} fontSize={30 * u} fontWeight={650} textAnchor="middle">{m.label}</text>
              <text x={px} y={top - 10 * u} fill={COLOR.muted} fontSize={24 * u} fontWeight={500} textAnchor="middle">{DATA.months[m.month]} · {money(DATA.values[m.month])}</text>
            </g>
          </g>
        );
      })}
      {drawing ? (
        <g opacity={1 - prog(f, T.draw[1], 14, exit)}>
          <circle cx={tip.x} cy={tip.y} r={10 * u} fill={COLOR.accent} />
          <text x={tip.x + 18 * u} y={tip.y + 36 * u} fill={COLOR.accent} fontSize={30 * u} fontWeight={700} style={{fontVariantNumeric: 'tabular-nums'}}>{money(valueAt(DATA.values, t))}</text>
        </g>
      ) : null}
      {f >= T.draw[1] ? (
        <g opacity={prog(f, T.draw[1], 16)}>
          <circle cx={x(fr, end)} cy={y(fr, DATA.values[end])} r={10 * u} fill={COLOR.accent} />
          <text x={x(fr, end) + 18 * u} y={y(fr, DATA.values[end]) + 10 * u} fill={COLOR.accent} fontSize={30 * u} fontWeight={700}>{DATA.year}</text>
        </g>
      ) : null}
    </svg>
  );
}
