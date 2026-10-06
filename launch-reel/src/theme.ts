import {loadFont} from 'veymelo';

loadFont('Inter', 'assets/fonts/Inter.woff2');
loadFont('JetBrains Mono', 'assets/fonts/JetBrainsMono.woff2');
loadFont('Space Grotesk', 'assets/fonts/SpaceGrotesk.woff2');
loadFont('Instrument Serif', 'assets/fonts/InstrumentSerif.woff2');
loadFont('Instrument Serif Italic', 'assets/fonts/InstrumentSerifItalic.woff2');
loadFont('Fraunces', 'assets/fonts/Fraunces.woff2');
loadFont('Anton', 'assets/fonts/Anton.woff2');
loadFont('Unbounded', 'assets/fonts/Unbounded.woff2');
loadFont('Syne', 'assets/fonts/Syne.woff2');

/** Veymelo's own tokens, from studio/data/brand.json (veymelo.com). */
export const C = {
  accent: '#ffd84d',
  ink: '#0b0b0f',
  ink2: '#15151b',
  white: '#ffffff',
  surface: '#f6f6f7',
  surface2: '#ececef',
  border: '#e3e3e7',
  muted: '#6b6b76',
  red: '#d92d20',
  ok: '#12a150',
  video: '#dfe6ff',
  image: '#f2e3ff',
  audio: '#dff3e7',
  caption: '#fff1cc',
};
export const SANS = "Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif";
export const MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";
/** The site's heading tracking. */
export const TIGHT = '-0.045em';
export const SHADOW = '0 12px 40px #0b0b0f1f';
