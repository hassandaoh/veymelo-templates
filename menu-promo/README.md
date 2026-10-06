# Menu promo

A menu promo for a ramen dish: the toppings drop into the bowl one by one, the name and price beside it.

![Menu promo](poster.jpg)

1920×1080 at 60 fps, 4 seconds. One scene, ready to grow into a
longer video. It began as one of the results in the [launch reel](../launch-reel).

## What to change

- **The picture**: `src/elements/food/index.tsx`. Its colours are constants at
  the top, its words, numbers and shapes are in the JSX, and its timing is in
  frames (60 a second) with `k()` (0 to 1 between two frames) and `sp()` (a
  spring) from `src/kit.ts`.
- **The length**: `durationInFrames` in `veymelo.config.json`; add screens in
  `src/Video.tsx`. It is drawn at its design size (1920×1080) and scaled
  to cover any frame you render.
- **The sound**: `SOUNDS` in `src/Video.tsx`: plop (in `assets/sfx`), each on the frame its cause happens.
- **The type**: `src/fonts.ts`: Inter, Fraunces (open-licensed, in `assets/fonts`).

## What to keep

Each topping landing with its own sound.
