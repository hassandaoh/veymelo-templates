# Cozy 3D world

A 10-second trailer for a cozy island game, "Harbor Tales", told as one
camera move: the player's little sailboat is the thread. Low behind it on
the open sea, the camera rises as the island comes up; the boat ties up as
dusk falls and the windows light one by one; the lighthouse comes on, and
its beam leaves the title in its glare. Low-poly three.js, 1920×1080 at 60
fps, with its own music and sound. Run `npm install` before the first render.

![Cozy 3D world](poster.jpg)

## The beats

Each beat becomes the next (`BEATS` in `src/timing.ts`):

| At | Beat | What it is | How it becomes the next |
|---|---|---|---|
| 0s | Open sea | low and three-quarter behind the boat, the island small ahead in the golden light | the camera rises off the water and lets the boat sail on |
| 2.7s | Land ahead | the island comes up out of the sea: the windmill turning, gulls over the harbour | the boat slows into the harbour |
| 5.3s | Home | the boat ties up by the jetty (the bell); dusk falls, and the windows light one by one | it is dark enough for the lighthouse |
| 6.7s | The light | the lamp comes on and its beam turns | the beam swings round to look straight down the lens |
| 8s | Harbor Tales | the title is left behind in the glare; then the line and "Coming soon", and it holds | — |

## What to change

- **The words**: `src/content.ts` (`GAME`): the kicker, the title, when it
  comes. The colours of the island, and of golden hour and dusk, are there
  too (`PALETTE`, `LIGHT`).
- **The moments**: `src/timing.ts`, on the music's grid (90 BPM: a beat is
  40 frames, a bar 160).
- **The island**: `src/world/island.ts` is one height function: the coast,
  the bay for the harbour, the cape for the lighthouse, the hill for the
  windmill. Change the shape there and everything stands on it.
- **What stands on it**: `src/world/props.ts` (trees, houses, the windmill,
  the lighthouse and its beam, the boat, gulls, clouds), placed in
  `build()` in `src/world/scene.ts`.
- **The boat's way in and the camera**: `ROUTE` and `cameraAt()` in
  `src/world/scene.ts`. The camera's path only ever moves toward the island.
- **The sound**: `tools/sound.mjs` makes the music, the waves, the gulls,
  the bell and the lamp from nothing (no samples); run `node tools/sound.mjs`,
  then `veymelo ffmpeg -- -y -i assets/score.wav -c:a aac -b:a 192k assets/score.m4a`.
  Each effect plays on the frame its cause happens (`SOUNDS` in `src/Video.tsx`).

## What to keep

- One thread: the boat, from the open sea to the jetty. The camera follows
  it, then rises and lets it go home; nothing cuts.
- The light tells the time: golden hour into dusk, the windows, then the
  lighthouse. The title comes out of the light, not out of nowhere.
- One camera move in one direction, slowing to rest; no orbit in and out.
- Warm against cool: the sun and the windows against the sea.
