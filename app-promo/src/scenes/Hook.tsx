import {Icon} from '../elements/icon';
import {CHIPS, COLOR, HOOK} from '../content';
import {exit, mix, move, prog} from '../motion';
import {LANDS, ROWS, ROW_AT, ROW_W} from '../screens/Overview';
import {PHONE_SCALE} from '../stage';
import {onScreen} from '../stage';

const CHIP = {w: 380, h: 84, pad: 12};
/** Landed, a receipt is its row: the same size, icon and words in the same places. */
const LANDED_SCALE = PHONE_SCALE * (76 / CHIP.h) * 1.1;
import {T} from '../timing';

// The hook: the question in three beats, among the week's receipts drifting
// loose. On bar 2 the question leaves, the phone rises, and each receipt
// flies into it and lands as its row in Recent: the mess, put in order.

export function HookWords({f}: {f: number}) {
  if (f > T.pull + 20) return null;
  const gone = prog(f, T.pull - 12, 20, exit);
  return (
    <div style={{position: 'absolute', left: 90, top: 690, color: COLOR.brand, fontSize: 132, fontWeight: 700, lineHeight: 1.0, letterSpacing: '-0.045em', opacity: 1 - gone, transform: `translateY(${gone * -60}px)`}}>
      {HOOK.map((line, i) => {
        const k = prog(f, T.words[i] - 16, 22); // lands on its beat; the first frame already asks
        return (
          <div key={line} style={{overflow: 'hidden', paddingBottom: 14, marginBottom: -14}}>
            <div style={{transform: `translateY(${(1 - k) * 110}%)`}}>{line}</div>
          </div>
        );
      })}
    </div>
  );
}

export function HookChips({f}: {f: number}) {
  if (f > LANDS(CHIPS.length - 1) + 12) return null;
  return (
    <>
      {CHIPS.map((chip, i) => {
        const shown = prog(f, T.chips - 14 + i * 9, 24);
        const go = T.pull - 8 + i * 5;
        const fly = prog(f, go, LANDS(i) - go, move);
        const [tx, ty] = onScreen(f, ROW_AT(i));
        const scale = mix(0.92 + 0.08 * shown, LANDED_SCALE, fly);
        const x = mix(chip.x + Math.cos((f + i * 25) / 50) * 6, tx - CHIP.pad * scale, fly);
        const y = mix(chip.y + CHIP.h / 2 + Math.sin((f + i * 40) / 38) * 10, ty, fly);
        // Receipts with no row on the screen go into the phone below the rows.
        const landed = i < ROWS ? prog(f, LANDS(i), 10) : prog(f, LANDS(i) - 14, 12);
        const width = mix(CHIP.w, (ROW_W * PHONE_SCALE) / LANDED_SCALE + CHIP.pad, fly);
        return (
          <div key={chip.label} style={{position: 'absolute', left: x, top: y - CHIP.h / 2, width, height: CHIP.h, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 16, padding: `0 ${mix(28, 0, fly)}px 0 ${CHIP.pad}px`, borderRadius: 42, background: `rgba(255,255,255,${1 - fly})`, boxShadow: `0 12px 30px rgba(15,77,58,${0.12 * (1 - fly)})`, opacity: shown * (1 - landed), transform: `rotate(${(chip.r + Math.sin(f / 60 + i) * 1.2) * (1 - fly)}deg) scale(${scale})`, transformOrigin: '0 50%', whiteSpace: 'nowrap'}}>
            <div style={{width: 60, height: 60, borderRadius: 30, background: COLOR.ground, display: 'grid', placeItems: 'center'}}>
              <Icon name={chip.icon} size={30} color={COLOR.brand} />
            </div>
            <span style={{fontSize: 28, color: COLOR.ink, fontWeight: 500, flex: 1}}>{chip.label}</span>
            <span style={{fontSize: 28, color: COLOR.ink, fontWeight: 700, fontVariantNumeric: 'tabular-nums'}}>{chip.amount}</span>
          </div>
        );
      })}
    </>
  );
}
