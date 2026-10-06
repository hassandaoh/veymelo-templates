import {COLOR, DATA, GROWTH, first, last} from '../content';
import {x, y, type Frame} from '../chart';
import {SANS, SERIF} from '../fonts';
import {move, prog} from '../motion';
import {T} from '../timing';

// The change, marked as a printed chart marks it: dotted guides from January
// and December to a bracket beside the chart, and the growth in the accent.
export function Change({f, fr}: {f: number; fr: Frame}) {
  if (f < T.change) return null;
  const {u, chart, tall} = fr;
  const end = DATA.values.length - 1;
  const bx = chart.x + chart.w + (tall ? 125 : 150) * u; // clear of the lines' end labels
  const y0 = y(fr, first), y1 = y(fr, last);
  const guide = prog(f, T.change, 24);
  const bracket = prog(f, T.change + 14, 30, move);
  const words = prog(f, T.change + 34, 24);
  const top = y0 - (y0 - y1) * bracket;
  const label = tall ? {x: 90 * u, y: chart.y + chart.h + 90 * u} : {x: bx + 34 * u, y: (y0 + y1) / 2 - 95 * u};
  return (
    <>
      <svg width={fr.w} height={fr.h} style={{position: 'absolute', inset: 0}}>
        {/* dotted guides from January and December to the bracket, leaving the lines' end labels clear */}
        <line x1={x(fr, 0)} x2={x(fr, 0) + (x(fr, end) - x(fr, 0)) * guide} y1={y0} y2={y0} stroke={COLOR.muted} strokeWidth={1.5 * u} strokeDasharray={`${3 * u} ${6 * u}`} />
        {[y0, y1].map(level => (
          <line key={level} x1={x(fr, end) + 100 * u} x2={x(fr, end) + 100 * u + (bx - x(fr, end) - 100 * u) * guide} y1={level} y2={level} stroke={COLOR.muted} strokeWidth={1.5 * u} strokeDasharray={`${3 * u} ${6 * u}`} />
        ))}
        {bracket > 0 ? (
          <g stroke={COLOR.ink} strokeWidth={2.5 * u} fill="none">
            <line x1={bx} x2={bx} y1={y0} y2={top} />
            <line x1={bx - 14 * u} x2={bx} y1={y0} y2={y0} />
            {bracket > 0.98 ? <line x1={bx - 14 * u} x2={bx} y1={y1} y2={y1} /> : null}
          </g>
        ) : null}
      </svg>
      <div style={{position: 'absolute', left: label.x, top: label.y, opacity: words, transform: `translateY(${(1 - words) * 12 * u}px)`}}>
        <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 150 * u, lineHeight: 1, color: COLOR.accent, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums'}}>+{GROWTH}%</div>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 30 * u, lineHeight: 1.35, color: COLOR.muted, marginTop: 14 * u, whiteSpace: 'nowrap'}}>
          {DATA.months[0]} to {DATA.months[end]}
          <br />
          {DATA.unit}{first}{DATA.scale} → {DATA.unit}{last}{DATA.scale}
        </div>
      </div>
    </>
  );
}
