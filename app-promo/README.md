# App promo

A 15-second 9:16 app ad for "Kept", a made-up money app: a question, the
week's receipts pulled into the phone as rows, three features each shown by a
tap (a chart, a budget, a goal), and the end card. 1080×1920 at 60 fps, with
its own music.

![App promo](poster.jpg)

| Time | What happens |
|---|---|
| 0–2s | "Where did your money go?" lands on three beats among loose receipts |
| 2–3s | The phone rises; each receipt flies in and lands as its row in Recent |
| 3–6s | See every dollar: the week's chart grows, a tap opens Friday |
| 6–9.5s | Know what's left: a tap opens Groceries into a ring of what is left |
| 9.5–12s | Save as you go: "+$240" leaves the notification and fills the goal |
| 12–15s | The icon, the name, one line, where to get it; then it holds |

## What to change

- **Everything it says**: `src/content.ts`: the app's name and line, the
  colours, the hook, the receipts, the captions, the week, the budgets and
  the goal. Keep the numbers consistent (the week adds up, the ring shows what
  is left).
- **The moments**: `src/timing.ts`, on one grid: 120 BPM at 60 fps, a beat
  is 30 frames, a bar 120; the screens change on bars.
- **The screens**: `src/screens/` (Overview, Budgets, Goals) are the app,
  drawn on the phone's screen (`src/elements/phone`). Replace them with your
  app's own screens, at the same size, and keep what is tapped in the upper
  part.
- **The sound**: `SOUNDS` in `src/Video.tsx`, each on the frame its cause
  happens (a tap, a pop, the money landing). The music is made by
  `tools/score.mjs` from nothing (no samples): change it, run
  `node tools/score.mjs`, then
  `veymelo ffmpeg -- -y -i assets/score.wav -c:a aac -b:a 192k assets/score.m4a`.
- **Other sizes**: it is drawn at 1080×1920 and scaled to cover any frame;
  for a wide or square cut, move the phone and the captions in
  `src/stage.ts` and `src/scenes/Captions.tsx`.

## What to keep

- One idea: the mess put in order. The receipts of the hook are the rows of
  the app, and the "+$240" of the notification is the money in the goal.
- One tap per feature, and the screen answers on the frame of the tap.
- Mint means money kept, and nothing else.
- The phone large, running off the bottom edge; words and taps clear of the
  apps' own buttons and captions (top 12%, bottom 22%, right 14%).
- The end holds: the most resolved moment, not the loudest.
