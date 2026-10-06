import {Sequence, Video} from 'veymelo';
import {FOCUS} from '../content';
import {shots} from '../edit';

// The clip, cut into its shots and framed tall around the face. Each shot has
// its own zoom, a hard punch-in on the cut; its sound fades over two frames at
// each end so a cut never clicks.
const SOURCE = {w: 1280, h: 720};

export function Footage({width, height}: {width: number; height: number}) {
  const scale = Math.max(width / SOURCE.w, height / SOURCE.h);
  const w = SOURCE.w * scale;
  const h = SOURCE.h * scale;
  const left = Math.min(0, Math.max(width - w, width / 2 - FOCUS.x * w));
  const top = Math.min(0, Math.max(height - h, height / 2 - FOCUS.y * h));
  const face = {x: left + FOCUS.x * w, y: top + FOCUS.y * h};
  return (
    <>
      {shots.map((shot, i) => (
        <Sequence key={i} from={shot.start} durationInFrames={shot.frames} name={`shot ${i + 1}`}>
          <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
            <div style={{position: 'absolute', inset: 0, transform: `scale(${shot.zoom})`, transformOrigin: `${face.x}px ${face.y}px`}}>
              <div style={{position: 'absolute', left, top, width: w, height: h}}>
                <Video src="assets/clip.mp4" start={shot.from} volume={f => Math.max(0, Math.min(1, f / 2, (shot.frames - 1 - f) / 2))} />
              </div>
            </div>
          </div>
        </Sequence>
      ))}
    </>
  );
}
