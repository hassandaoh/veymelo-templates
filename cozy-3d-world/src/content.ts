// Everything this trailer says, and its colours. "Harbor Tales" is made up.

export const GAME = {
  kicker: 'A cozy island adventure',
  title: 'Harbor Tales',
  when: 'Coming soon',
};

export const PALETTE = {
  trees: ['#3f9658', '#4fa862', '#2e7a4a', '#68b46a'],
  grass: ['#8fcf6c', '#79bf5f', '#62a955'],
  sand: '#f1d6a0',
  rock: '#b98f69',
  seaFloor: '#e3c48e',
  walls: '#fbf1e2',
  roofs: ['#d6543b', '#e2784c', '#c4493a', '#e9a04f'],
  window: '#ffb54d',
  lamp: '#fff0c2',
  hull: '#8a5a3c',
  sail: '#fff5e6',
};

/** The light at golden hour, and at dusk: everything in between is a mix of the two. */
export const LIGHT = {
  golden: {skyTop: '#5f97da', skyLow: '#ffc58c', sun: '#ffcf96', sunPower: 2.8, ambient: '#ffe6c8', ambientPower: 1.15, ground: '#3c6a8c', water: '#22a0b6', shallow: '#7fdccf', cloud: '#fff1e0'},
  dusk: {skyTop: '#3d4a8c', skyLow: '#ff9470', sun: '#ff8c5a', sunPower: 1.15, ambient: '#a99ad8', ambientPower: 0.78, ground: '#34477a', water: '#41709e', shallow: '#6aa3b4', cloud: '#ffb0a0'},
};
