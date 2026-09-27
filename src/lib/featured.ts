import { SellerDetail } from "../types";

// ─── AniSense Farmer of the Week ──────────────────────────────────────────────
// One rule, used by Home's Featured farmers (to show them) and the farmer's
// Profile achievements (to award it), so the two can never disagree.
//
// Everyone with something on sale, best-rated first, then by sales. The
// spotlight rotates weekly through the top four, which is what makes "of the
// week" true rather than the same name forever.

export type RankedSeller = SellerDetail & { key: string };

export function rankSellers(sellers: Record<string, SellerDetail>): RankedSeller[] {
  return Object.entries(sellers)
    .map(([key, s]) => ({ key, ...s }))
    .sort((a, b) => b.rating - a.rating || b.totalSales - a.totalSales);
}

export function farmerOfTheWeek(sellers: Record<string, SellerDetail>, now = Date.now()): RankedSeller | undefined {
  const ranked = rankSellers(sellers);
  if (!ranked.length) return undefined;
  const week = Math.floor(now / (7 * 864e5));
  return ranked[week % Math.min(4, ranked.length)];
}
