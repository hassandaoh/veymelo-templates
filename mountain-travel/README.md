# Mountain travel

A 2.5D travel film: mountains at dawn in layers, the sun rising, birds passing, a serif title.

![Mountain travel](poster.jpg)

1920×1080 at 60 fps, 7 seconds, three.js. One scene, ready to grow into a
longer video.

## What to change

- **The picture**: `src/elements/mountains/index.tsx`. Its colours are constants at
  the top, its words, numbers and shapes are in the JSX, and its timing is in
  frames (60 a second) with `k()` (0 to 1 between two frames) and `sp()` (a
  spring) from `src/kit.ts`.
- **The length**: `durationInFrames` in `veymelo.config.json`; add screens in
  `src/Video.tsx`. It is drawn at its design size (1920×1080) and scaled
  to cover any frame you render.
- **The sound**: `SOUNDS` in `src/Video.tsx`: swell, bloom (in `assets/sfx`), each on the frame its cause happens.
- **The type**: `src/fonts.ts`: Inter, Instrument Serif (open-licensed, in `assets/fonts`).
- **3D**: `src/three-kit.ts` builds the three.js stage once and draws it on
  every frame. Run `npm install` first.

## What to keep

Depth in layers, and the sun rising slowly.
