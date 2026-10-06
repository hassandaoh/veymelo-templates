// Everything this ad says, in one place: change these for another app.
// "Kept" is a made-up money app. The numbers add up: keep them consistent.

export const APP = {
  name: 'Kept',
  line: 'Know where it went.',
  /** Text buttons, not store badges: say where it is, in your own words. */
  stores: ['App Store', 'Google Play'],
  user: 'Ana',
};

export const COLOR = {
  ground: '#dfeee4', // sage: the page everything sits on
  brand: '#0f4d3a', // deep green: words, the chart, the icon
  accent: '#b9f5c9', // mint: money kept, and nothing else
  ink: '#101312',
  paper: '#fbfcfb',
  muted: '#6a7a72',
  line: '#e6ece8',
};

/** The hook: a question in three beats. */
export const HOOK = ['Where did', 'your money', 'go?'];

/**
 * The receipts scattered in the hook: each flies into the phone and lands as
 * its row in Recent, top to bottom in the same order (so no paths cross). The
 * one named like the opened budget is the row that opens.
 */
export const CHIPS = [
  {icon: 'cup', label: 'Coffee', amount: '−$4.80', x: 110, y: 330, r: -5},
  {icon: 'car', label: 'Taxi', amount: '−$12.50', x: 600, y: 450, r: 6},
  {icon: 'cart', label: 'Groceries', amount: '−$62.40', x: 130, y: 1200, r: 4},
  {icon: 'ticket', label: 'Streaming', amount: '−$15.99', x: 560, y: 1310, r: -4},
] as const;

/** One caption a beat, at the top, clear of the apps' own buttons. */
export const CAPTIONS = {
  every: 'See every dollar.',
  left: "Know what's left.",
  kept: 'Keep it.',
};

export const BALANCE = 12480.2;

/** This week, Monday to Sunday; the tapped day is the biggest. */
export const WEEK = [
  {day: 'M', spent: 18.4},
  {day: 'T', spent: 32.1},
  {day: 'W', spent: 12.9},
  {day: 'T', spent: 41.5},
  {day: 'F', spent: 86.4},
  {day: 'S', spent: 15.3},
  {day: 'S', spent: 8.0},
];
export const TAPPED_DAY = 4;
export const WEEK_SPENT = WEEK.reduce((sum, day) => sum + day.spent, 0); // 214.60

export const BUDGETS = [
  {icon: 'cart', name: 'Groceries', spent: 312, of: 430},
  {icon: 'fork', name: 'Eating out', spent: 148, of: 200},
  {icon: 'car', name: 'Transport', spent: 96, of: 150},
  {icon: 'ticket', name: 'Fun', spent: 64, of: 120},
] as const;
/** The budget that is tapped open. */
export const OPENED = 0;
export const DAYS_LEFT = 9;

/** What is left of the opened budget goes into the goal. */
export const GOAL = {icon: 'plane', name: 'Trip to Japan', saved: 1062, target: 1500, added: BUDGETS[OPENED].of - BUDGETS[OPENED].spent};
export const OTHER_GOALS = [
  {name: 'Rainy day', saved: 2400, target: 5000},
  {name: 'New laptop', saved: 640, target: 1800},
];

export const money = (value: number, cents = true) =>
  '$' + value.toLocaleString('en-US', {minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0});
