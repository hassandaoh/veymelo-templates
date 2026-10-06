import '../../theme';
import {AbsoluteFill} from 'veymelo';
import {SIZE} from './kit';
import {ORDER, RESULTS} from './registry';
import {ResultView} from './ResultView';
import {PEEK} from './peek';

/** On its own: every result, side by side, each at its own shape. */
export default function Element() {
  if (PEEK) {
    const d = SIZE[RESULTS[PEEK].aspect];
    return (
      <AbsoluteFill style={{background: '#0b0b0f'}}>
        <ResultView id={PEEK} w={d.w} h={d.h} />
      </AbsoluteFill>
    );
  }
  const H = 300;
  return (
    <AbsoluteFill style={{background: '#0b0b0f', flexDirection: 'row', flexWrap: 'wrap', gap: 16, padding: 24, alignContent: 'flex-start'}}>
      {ORDER.map((id) => {
        const d = SIZE[RESULTS[id].aspect];
        const w = (H * d.w) / d.h;
        return (
          <div key={id} style={{position: 'relative', width: w, height: H, borderRadius: 12, overflow: 'hidden'}}>
            <ResultView id={id} w={w} h={H} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
