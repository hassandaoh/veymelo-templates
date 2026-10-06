// Where things go, wide (1920×1080) or tall (1080×1920): the café window the
// town is seen through, the counter, the cup, and the words. Sizes on the
// short side.
export type Rect = {x: number; y: number; w: number; h: number};
export type Layout = {u: number; tall: boolean; window: Rect; sill: number; counter: number; cup: {x: number; y: number}; sun: {x: number; y: number}; title: {x: number; y: number; size: number}; end: {x: number; y: number}; horizon: number};

export function layout(width: number, height: number): Layout {
  const tall = height > width;
  const u = Math.min(width, height) / 1080;
  if (tall) {
    // tall: the words at the top, the window below them, the cup low and left of centre (the jug comes in from the right)
    const window = {x: 0.08 * width, y: 0.42 * height, w: 0.84 * width, h: 0.22 * height};
    return {u, tall, window, sill: window.y + window.h, counter: 0.7 * height, cup: {x: 0.44 * width, y: 0.8 * height}, sun: {x: 0.62 * width, y: 0.42 * height}, title: {x: 90 * u, y: 230 * u, size: 140 * u}, end: {x: 90 * u, y: 545 * u}, horizon: 0.56 * height};
  }
  const window = {x: 0.42 * width, y: 0.06 * height, w: 0.52 * width, h: 0.52 * height};
  return {u, tall, window, sill: window.y + window.h, counter: 0.71 * height, cup: {x: 0.69 * width, y: 0.755 * height}, sun: {x: 0.62 * width, y: 0.36 * height}, title: {x: 150 * u, y: 200 * u, size: 140 * u}, end: {x: 150 * u, y: 560 * u}, horizon: height * 0.62};
}
