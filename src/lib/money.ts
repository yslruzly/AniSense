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

/** What a typed amount may hold: digits, one decimal point, centavos at
 *  most ("4a8.5.57" → "48.55"). For the app's number fields, which are text
 *  fields so the keyboard shows a point and nothing like "e" gets in. */
export const decimalText = (v: string) =>
  v.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1").replace(/^(\d*\.\d{0,2}).*$/, "$1");
