# Kinetic type

Kinetic type on the beat for a run club: RUN, FASTER, TOGETHER land on hits over an outlined pattern of the club's name.

![Kinetic type](poster.jpg)

1920×1080 at 60 fps, 5 seconds. One scene, ready to grow into a
longer video. It began as one of the results in the [launch reel](../launch-reel).

## What to change

- **The picture**: `src/elements/kinetic/index.tsx`. Its colours are constants at
  the top, its words, numbers and shapes are in the JSX, and its timing is in
  frames (60 a second) with `k()` (0 to 1 between two frames) and `sp()` (a
  spring) from `src/kit.ts`.
- **The length**: `durationInFrames` in `veymelo.config.json`; add screens in
  `src/Video.tsx`. It is drawn at its design size (1920×1080) and scaled
  to cover any frame you render.
- **The sound**: `SOUNDS` in `src/Video.tsx`: hit, thud (in `assets/sfx`), each on the frame its cause happens.
- **The type**: `src/fonts.ts`: Inter (open-licensed, in `assets/fonts`).

## What to keep

Each word on a hit; the last word in the accent.
