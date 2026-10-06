import data from './data.json';

// What this chart says comes from src/data.json: change the numbers there and
// every label, the growth and the sound follow. The look is here: a printed
// page, one accent.
export const DATA = data;

export const COLOR = {
  paper: '#f7f4ee',
  ink: '#1d1d1b',
  accent: '#cc2f2a', // this year, and the change: nothing else is red
  ghost: '#968e81', // last year
  grid: '#dcd5c8',
  muted: '#6f6a60',
};

export const first = data.values[0];
export const last = data.values[data.values.length - 1];
/** January to December, in percent, from the data. */
export const GROWTH = Math.round((last / first - 1) * 100);
export const money = (v: number) => `${data.unit}${Math.round(v)}${data.scale}`;
