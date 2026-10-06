# Lyric video

A square lyric video: the line appears in a serif italic inside a pulsing ring of red bars.

![Lyric video](poster.jpg)

1080×1080 at 60 fps, 5 seconds. One scene, ready to grow into a
longer video.

## What to change

- **The picture**: `src/elements/lyric/index.tsx`. Its colours are constants at
  the top, its words, numbers and shapes are in the JSX, and its timing is in
  frames (60 a second) with `k()` (0 to 1 between two frames) and `sp()` (a
  spring) from `src/kit.ts`.
- **The length**: `durationInFrames` in `veymelo.config.json`; add screens in
  `src/Video.tsx`. It is drawn at its design size (1080×1080) and scaled
  to cover any frame you render.
- **The sound**: `SOUNDS` in `src/Video.tsx`: shimmer (in `assets/sfx`), each on the frame its cause happens.
- **The type**: `src/fonts.ts`: Inter, Instrument Serif Italic (open-licensed, in `assets/fonts`).

## What to keep

The ring pulsing, and the words calm in the middle.
