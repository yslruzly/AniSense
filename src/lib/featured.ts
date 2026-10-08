import { SellerDetail } from "../types";
import { rankOf } from "./rating";

// ─── AniSense Farmer of the Week ──────────────────────────────────────────────
// One rule, used by Home's and the Market's Featured farmers (to show them)
// and the farmer's Profile achievements (to award it), so they can never
// disagree.
//
// Everyone with something on sale, best-rated first (a farmer nobody has
// rated yet after every rated one, lib/rating.ts), then by sales. The
// spotlight rotates weekly through the top four, which is what makes "of the
// week" true rather than the same name forever.

export type RankedSeller = SellerDetail & { key: string };

export function rankSellers(sellers: Record<string, SellerDetail>): RankedSeller[] {
  return Object.entries(sellers)
    .map(([key, s]) => ({ key, ...s }))
    .sort((a, b) => rankOf(b) - rankOf(a) || b.totalSales - a.totalSales);
}

export function farmerOfTheWeek(sellers: Record<string, SellerDetail>, now = Date.now()): RankedSeller | undefined {
  const ranked = rankSellers(sellers);
  if (!ranked.length) return undefined;
  const week = Math.floor(now / (7 * 864e5));
  return ranked[week % Math.min(4, ranked.length)];
}

/** "Talavera, Nueva Ecija" → "Talavera". */
export const townOf = (loc: string) => loc.split(",")[0].trim();

export type FeaturedFarmer = RankedSeller & { near: boolean };

/**
 * Who Featured farmers shows, on Home and in the Market alike: the Farmer of
 * the Week, then four more from the ranking, anyone growing in the viewer's
 * own town first (near, so the screen can say why). A farmer with no town
 * on record is never "near".
 */
export function featuredLineup(sellers: Record<string, SellerDetail>, viewerLocation = "", now = Date.now()):
  { spot?: FeaturedFarmer; rest: FeaturedFarmer[] } {
  const spot = farmerOfTheWeek(sellers, now);
  if (!spot) return { rest: [] };
  const near = (loc: string) => { const town = townOf(loc); return !!viewerLocation && !!town && viewerLocation.includes(town); };
  const rest = rankSellers(sellers)
    .filter(s => s.key !== spot.key)
    .map(s => ({ ...s, near: near(s.location) }))
    .sort((a, b) => Number(b.near) - Number(a.near))
    .slice(0, 4);
  return { spot: { ...spot, near: near(spot.location) }, rest };
}
