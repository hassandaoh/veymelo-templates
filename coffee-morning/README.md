# Coffee morning

A layered 2.5D coffee ad: hills, the sun and a steaming cup on a warm morning, a serif title.

![Coffee morning](poster.jpg)

1920×1080 at 60 fps, 6 seconds. One scene, ready to grow into a
longer video. It began as one of the results in the [launch reel](../launch-reel).

## What to change

- **The picture**: `src/elements/coffee/index.tsx`. Its colours are constants at
  the top, its words, numbers and shapes are in the JSX, and its timing is in
  frames (60 a second) with `k()` (0 to 1 between two frames) and `sp()` (a
  spring) from `src/kit.ts`.
- **The length**: `durationInFrames` in `veymelo.config.json`; add screens in
  `src/Video.tsx`. It is drawn at its design size (1920×1080) and scaled
  to cover any frame you render.
- **The sound**: `SOUNDS` in `src/Video.tsx`: bloom (in `assets/sfx`), each on the frame its cause happens.
- **The type**: `src/fonts.ts`: Inter, Fraunces (open-licensed, in `assets/fonts`).

## What to keep

Layers moving at different speeds, and the steam as the one live detail.
