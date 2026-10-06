// Where things go in each shape of frame: square (Instagram, LinkedIn), tall
// (Stories, Reels, TikTok: clear of the top 12% and bottom 22%) and wide
// (YouTube, X). Everything is sized on the short side.
export type Layout = {
  u: number;
  header: {x: number; y: number};
  caption: {x: number; y: number; w: number; h: number; size: number};
  wave: {x: number; y: number; w: number; h: number};
};

export function layout(width: number, height: number): Layout {
  const u = Math.min(width, height) / 1080;
  if (height > width * 1.2) {
    return {u, header: {x: 90 * u, y: 300 * u}, caption: {x: 90 * u, y: 540 * u, w: width - 180 * u, h: 600 * u, size: 124 * u}, wave: {x: 90 * u, y: 1230 * u, w: width - 180 * u, h: 120 * u}};
  }
  if (width > height * 1.2) {
    return {u, header: {x: 120 * u, y: 90 * u}, caption: {x: 120 * u, y: 290 * u, w: Math.min(width - 240 * u, 1500 * u), h: 420 * u, size: 112 * u}, wave: {x: 120 * u, y: 820 * u, w: width - 240 * u, h: 100 * u}};
  }
  return {u, header: {x: 90 * u, y: 90 * u}, caption: {x: 90 * u, y: 300 * u, w: width - 180 * u, h: 440 * u, size: 100 * u}, wave: {x: 90 * u, y: 820 * u, w: width - 180 * u, h: 100 * u}};
}
