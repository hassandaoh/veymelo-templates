import {COLOR, DATA} from '../content';
import type {Frame} from '../chart';
import {SANS, SERIF} from '../fonts';

// The page's head and foot: a short rule in the accent, a headline that says
// the finding (it is on the cover), what is measured, and the source.
export function Header({fr}: {fr: Frame}) {
  const {u, tall} = fr;
  return (
    <>
      <div style={{position: 'absolute', left: (tall ? 90 : 150) * u, top: (tall ? 240 : 56) * u, width: tall ? fr.w - 2 * fr.chart.x : 1300 * u, color: COLOR.ink}}>
        <div style={{width: 64 * u, height: 9 * u, background: COLOR.accent, marginBottom: 22 * u}} />
        <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: (tall ? 92 : 84) * u, lineHeight: 1.04, letterSpacing: '-0.02em'}}>{DATA.headline}</div>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 34 * u, color: COLOR.muted, marginTop: 16 * u}}>{DATA.subtitle}</div>
      </div>
      <div style={{position: 'absolute', left: (tall ? 90 : 150) * u, top: fr.chart.y + fr.chart.h + (tall ? 400 : 82) * u, fontFamily: SANS, fontSize: 25 * u, color: COLOR.muted}}>Source: {DATA.source}</div>
    </>
  );
}
