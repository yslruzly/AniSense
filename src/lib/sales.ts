import { Preferences } from "@capacitor/preferences";

// ─── Sales ────────────────────────────────────────────────────────────────────
// What the farmer sold: the income half of the profit snapshot. The app had no
// such record — EXPENSES is money out, and BUYER_TRANSACTIONS belongs to the
// buyer — so a farmer records a sale when it happens, the way they would in a
// notebook.
//
// This is the stand-in, not the destination. Once checkout writes to the
// database, sales should arrive from there and this becomes the manual entry
// for the deals made at the roadside that never touched the app.

const KEY = "sales";

export interface Sale {
  id: string;
  /** Crop group ("Rice", "Onions"). */
  crop: string;
  kg: number;
  pricePerKg: number;
  /** kg × price, kept so an edited price list never rewrites history. */
  amount: number;
  /** YYYY-MM-DD, the farmer's own day. */
  date: string;
  /** Who bought it, if they said. */
  buyer?: string;
}

export async function loadSales(): Promise<Sale[]> {
  try {
    const { value } = await Preferences.get({ key: KEY });
    return value ? (JSON.parse(value) as Sale[]) : [];
  } catch {
    return [];
  }
}

export async function saveSales(list: Sale[]): Promise<void> {
  try {
    await Preferences.set({ key: KEY, value: JSON.stringify(list) });
  } catch {
    // Storage unavailable: the figures still add up for this session.
  }
}

export const newSaleId = () => `sl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/** Sum of sales on or after a date (inclusive), by YYYY-MM-DD string order. */
export const soldSince = (sales: Sale[], from: string) =>
  sales.filter(s => s.date >= from).reduce((sum, s) => sum + s.amount, 0);
