// ─── Money ────────────────────────────────────────────────────────────────────
// Prices are kept to the centavo, but subtracting two of them in JavaScript
// does not stay there: ₱80 − ₱57.20 comes out 22.799999999999997. Every
// amount the app works out (a gap, a saving, a difference from the market)
// goes through here before it is shown.

/** Rounded to the centavo, so 22.799999999999997 is 22.8. */
export const toCents = (n: number) => Math.round(n * 100) / 100;

/** "₱40,000" for a whole amount, "₱57.20" otherwise: never more than two
 *  decimals, and never one (₱57.2 reads like a typo). */
export function peso(n: number): string {
  const v = toCents(n);
  const whole = Number.isInteger(v);
  return `₱${v.toLocaleString("en-PH", { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 })}`;
}
