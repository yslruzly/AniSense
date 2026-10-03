import { PRICE_MONTHS, PRICE_SERIES } from "./generated/priceHistory";

// ─── Price records ────────────────────────────────────────────────────────────
// The monthly price history of the crops the study covers, per variety id.
// It starts as the copy bundled with the app (generated/priceHistory.ts, built from
// data/historical-prices.csv), so prices and their history show with no
// signal at all. Signed in to a real account, the database's records are laid
// over it (applyHistory), so a month added there reaches the phone without a
// new version of the app.
//
// These are RETAIL prices: what a kilo sells for at market, not what a
// trader pays the farmer at the farm, which is lower. The screens say
// "retail" wherever a farmer's own harvest is valued with them.
//
// The records are monthly. Nothing here is a daily price, and the screens say
// "month", never "today" or "yesterday", about what comes from here.

export interface MonthPrice { month: string; price: number }

const history: Record<string, MonthPrice[]> = {};
for (const [id, prices] of Object.entries(PRICE_SERIES)) {
  history[id] = prices.flatMap((p, i) => (p === null ? [] : [{ month: PRICE_MONTHS[i], price: p }]));
}

/** A variety's recorded months, oldest first. Months with no record are
 *  simply absent. Empty for a variety with no records. */
export const historyOf = (cropId: string): MonthPrice[] => history[cropId] ?? [];

/** Whether this variety's price comes from the records. */
export const hasRecords = (cropId: string) => historyOf(cropId).length > 0;

/** The newest record, and how far it moved from the record before it, in
 *  percent to one decimal: 57.20 after 59.10 is −3.2. */
export function latestOf(cropId: string): (MonthPrice & { change: number; previous?: MonthPrice }) | null {
  const h = historyOf(cropId);
  if (h.length === 0) return null;
  const now = h[h.length - 1], previous = h[h.length - 2];
  const change = previous ? Math.round((now.price / previous.price - 1) * 1000) / 10 : 0;
  return { ...now, change, previous };
}

/** The newest month any variety has a record for: "2026-09". */
export function latestMonth(): string | null {
  const months = Object.values(history).map(h => h[h.length - 1]?.month).filter(Boolean) as string[];
  return months.length ? months.sort()[months.length - 1] : null;
}

/** Lays the database's records over the bundled ones. A month the database
 *  has replaces the bundled price for that month; months it lacks stay. */
export function applyHistory(rows: { crop_id: string; price_date: string; price_per_kg: number | string }[]) {
  const byCrop: Record<string, Map<string, number>> = {};
  // Oldest first, so the last record of a month is the one kept.
  const sorted = [...rows].sort((a, b) => a.price_date.localeCompare(b.price_date));
  for (const r of sorted) {
    const price = Number(r.price_per_kg);
    if (!(price > 0)) continue;
    (byCrop[r.crop_id] ??= new Map(historyOf(r.crop_id).map(p => [p.month, p.price]))).set(r.price_date.slice(0, 7), price);
  }
  for (const [id, months] of Object.entries(byCrop)) {
    history[id] = [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, price]) => ({ month, price }));
  }
}

/** "2026-09" → "Sep", "September", "Sep 2026" or "September 2026". */
export function monthLabel(month: string, lang: "en" | "tl", form: "short" | "long" = "short", year = false): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(lang === "tl" ? "fil-PH" : "en-PH", { month: form, ...(year ? { year: "numeric" } : {}) });
}
