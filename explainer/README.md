# Explainer

How something works in four steps (rooftop solar: sun, panels, battery, home), as icons joined by a flowing line.

![Explainer](poster.jpg)

1920×1080 at 60 fps, 6 seconds. One scene, ready to grow into a
longer video.

## What to change

- **The picture**: `src/elements/explainer/index.tsx`. Its colours are constants at
  the top, its words, numbers and shapes are in the JSX, and its timing is in
  frames (60 a second) with `k()` (0 to 1 between two frames) and `sp()` (a
  spring) from `src/kit.ts`.
- **The length**: `durationInFrames` in `veymelo.config.json`; add screens in
  `src/Video.tsx`. It is drawn at its design size (1920×1080) and scaled
  to cover any frame you render.
- **The sound**: `SOUNDS` in `src/Video.tsx`: pop (in `assets/sfx`), each on the frame its cause happens.
- **The type**: `src/fonts.ts`: Inter (open-licensed, in `assets/fonts`).

## What to keep

One step at a time in reading order, joined by the line that carries the energy.
