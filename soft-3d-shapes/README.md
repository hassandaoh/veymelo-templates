# Soft 3D shapes

Soft 3D shapes for a brand intro: a capsule, a ring, a cone, spheres and a cube bounce into place under a serif line.

![Soft 3D shapes](poster.jpg)

1080×1080 at 60 fps, 7 seconds, three.js. One scene, ready to grow into a
longer video.

## What to change

- **The picture**: `src/elements/shapes/index.tsx`. Its colours are constants at
  the top, its words, numbers and shapes are in the JSX, and its timing is in
  frames (60 a second) with `k()` (0 to 1 between two frames) and `sp()` (a
  spring) from `src/kit.ts`.
- **The length**: `durationInFrames` in `veymelo.config.json`; add screens in
  `src/Video.tsx`. It is drawn at its design size (1080×1080) and scaled
  to cover any frame you render.
- **The sound**: `SOUNDS` in `src/Video.tsx`: bounce (in `assets/sfx`), each on the frame its cause happens.
- **The type**: `src/fonts.ts`: Inter, Fraunces (open-licensed, in `assets/fonts`).
- **3D**: `src/three-kit.ts` builds the three.js stage once and draws it on
  every frame. Run `npm install` first.

## What to keep

Each shape bouncing in on its own beat, with its own sound.
