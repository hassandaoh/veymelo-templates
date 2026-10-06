import {Sequence} from 'veymelo';
import {SIZE} from './kit';
import {RESULTS} from './registry';

/**
 * One result drawn at its design size and scaled to cover the box it is given
 * (the box may be any shape while it morphs; the middle of the design stays in view).
 * `from` is the frame (in the parent's time) its own clock starts at.
 */
export function ResultView({id, w, h, from = 0, peek = 0, edit = 0, variant}: {id: string; w: number; h: number; from?: number; peek?: number; edit?: number; variant?: number}) {
  const r = RESULTS[id];
  const d = SIZE[r.aspect];
  const s = Math.max(w / d.w, h / d.h);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: (w - d.w * s) / 2, top: (h - d.h * s) / 2, width: d.w, height: d.h, transform: `scale(${s})`, transformOrigin: '0 0'}}>
        <Sequence from={from - peek} name={id}>
          <r.Comp w={d.w} h={d.h} edit={edit} variant={variant} res={Math.min(1, Math.max(0.3, Math.round(s * 1.25 * 4) / 4))} />
        </Sequence>
      </div>
    </div>
  );
}
