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

// Expense categories, for the ring on Expenses: the dataviz reference
// palette, each kind on a hue that suits it (seeds green, fertilizer yellow,
// irrigation aqua, labour orange, equipment blue, other magenta). Validated
// with the dataviz checker as neighbours in the ring's own order, CAT_ORDER,
// last beside first: worst colour-blind ΔE 9.1, normal-vision 19.6. The ring's
// earlier colours had two near-identical reds side by side. Aqua, yellow and
// magenta are under 3:1 on white, so every slice is named, with its pesos, in
// the list beside it. Fixed per kind, so a kind keeps its colour everywhere.
export const CAT_ORDER = ["Equipment", "Labor", "Irrigation", "Fertilizer", "Other", "Seeds"];
export const CAT_COLORS: Record<string, string> = {
  Equipment: "#2a78d6",
  Labor: "#eb6834",
  Irrigation: "#1baf7a",
  Fertilizer: "#eda100",
  Other: "#e87ba4",
  Seeds: "#008300",
};

