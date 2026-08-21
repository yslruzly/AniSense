// ─── Data colour ramp ─────────────────────────────────────────────────────────
// One ramp for every chart in the app, derived from the brand rather than picked
// per feature. Six steps is the ceiling: past that nobody can match a swatch to
// a legend anyway.
//
// The steps are chosen by MEASURED relative luminance, not by eye. Every
// adjacent pair is at least 1.43:1 apart, so the series stay separable in
// greyscale and under red-green colour blindness, which affects roughly 1 in 12
// men, and this app's audience skews male and over 50. An earlier version of
// this file looked varied but had five of six colours clustered between 0.09 and
// 0.13 luminance; it would have collapsed into one grey for those users.
//
//   #07281C  lum 0.016
//   #A5231B  lum 0.093   (x2.15)
//   #C4453A  lum 0.163   (x1.49)
//   #489A66  lum 0.254   (x1.43)
//   #D89E1E  lum 0.391   (x1.45)
//   #F5C455  lum 0.595   (x1.46)
//
// Nothing is lighter than 0.60; a paler slice disappears against a white card.
// Colour is never the only signal: charts carry labels, and price movement
// carries a direction arrow as well as a hue.
export const DATA_RAMP = [
  "#07281C", // deep field green
  "#A5231B", // clay
  "#C4453A", // light clay
  "#489A66", // green
  "#D89E1E", // deep gold
  "#F5C455", // palay gold
];

/** Stable colour for the nth series. Cycles once past six. */
export const dataColor = (i: number) => DATA_RAMP[i % DATA_RAMP.length];

/** Fallback for anything unmapped: a neutral, never a random hue. */
export const DATA_NEUTRAL = "#454F49";

// Expense categories. Order is fixed so a category keeps its colour between
// sessions and between screens; a category that changes colour on reload is
// worse than no colour at all.
export const CAT_COLORS: Record<string, string> = {
  Seeds: DATA_RAMP[0],
  Fertilizer: DATA_RAMP[4],
  Labor: DATA_RAMP[3],
  Equipment: DATA_RAMP[1],
  Irrigation: DATA_RAMP[5],
  Other: DATA_RAMP[2],
};

// Crops only need distinct colours where several series share one chart. In a
// single-series bar chart the label already identifies the bar, so those render
// in one colour; see .bar-fill in appStyles.
export const CROP_BAR_COLORS: Record<string, string> = {
  Rice: DATA_RAMP[0],
  Corn: DATA_RAMP[4],
  Onions: DATA_RAMP[1],
  Tomatoes: DATA_RAMP[2],
  Calamansi: DATA_RAMP[5],
  Mango: DATA_RAMP[3],
  Garlic: DATA_RAMP[2],
  Squash: DATA_RAMP[4],
  Eggplant: DATA_RAMP[1],
  Mongo: DATA_RAMP[3],
};
