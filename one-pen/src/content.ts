// Everything this video says, and its two colours. "Fieldnote" is made up.
// The pen writes Latin text only (src/pen/glyphs.ts): keep these in Latin.

export const WORDS = {
  first: 'Every idea',
  second: 'starts as a line.',
  name: 'Fieldnote',
  line: 'A small design studio.',
};

/** Ink on paper: 'light' is dark ink on white, 'dark' is light ink on black. */
export const THEME: 'light' | 'dark' = 'light';

export const COLORS = {
  light: {paper: '#fbfaf6', ink: '#161616'},
  dark: {paper: '#0e0e0e', ink: '#f1efe8'},
}[THEME];
