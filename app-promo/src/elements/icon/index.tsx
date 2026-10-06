// Line icons, one weight: drawn on a 24 grid, sized by `size`.
const PATHS: Record<string, string> = {
  cup: 'M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9Zm11 1h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c-.6 1 .6 1.5 0 2.5M11 3.5c-.6 1 .6 1.5 0 2.5',
  car: 'M4 15.5V12l2-5h12l2 5v3.5M4 15.5h16M4 15.5V18h3v-2.5M20 15.5V18h-3v-2.5M7.5 12.5h.01M16.5 12.5h.01',
  cart: 'M3 4h2.5l2.2 10.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L20 8H6.3M9 19.5h.01M17 19.5h.01',
  ticket: 'M4 7.5V6h16v1.5a2.5 2.5 0 0 0 0 5V18H4v-5.5a2.5 2.5 0 0 0 0-5ZM14 6v12',
  fork: 'M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 1.5-2.5 4-2.5 7H17v11M17 3v18',
  bag: 'M5 8h14l-1 12H6L5 8Zm4 0V7a3 3 0 0 1 6 0v1',
  plane: 'M21 15.5 13.5 11V5.5a1.5 1.5 0 0 0-3 0V11L3 15.5V17l7.5-2.5v4L8.5 20v1.5l3.5-1 3.5 1V20l-2-1.5v-4L21 17v-1.5Z',
  coin: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm2.8-11.5c-.4-.9-1.5-1.5-2.8-1.5-1.7 0-3 .9-3 2s1.3 1.8 3 2 3 .9 3 2-1.3 2-3 2c-1.3 0-2.4-.6-2.8-1.5M12 6.5v11',
  leaf: 'M5 19c0-8 5-13 14-14 0 9-5 14-13 14H5Zm0 0 7-7',
};

/** `draw` (0 to 1) draws the line in, from its start. */
export function Icon({name, size = 32, color = 'currentColor', stroke = 1.8, draw = 1}: {name: string; size?: number; color?: string; stroke?: number; draw?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}>
      <path d={PATHS[name] ?? ''} {...(draw < 1 ? {pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - draw} : {})} />
    </svg>
  );
}
