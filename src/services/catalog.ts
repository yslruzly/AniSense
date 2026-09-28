// ─── Catalog & rewards service ────────────────────────────────────────────────
// Today's prices (crop_prices_latest) and the badges the database has awarded
// this account (user_achievements). Both cached, so they still show offline.

import { supabase } from "../lib/supabase";
import { cachedFetch, FetchResult } from "../lib/cache";
import type { AchievementId } from "../lib/achievements";

export interface PriceRow { crop_id: string; price_per_kg: number; change_pct: number; price_date: string }

/** The newest price of every variety. */
export async function fetchLatestPrices(): Promise<FetchResult<PriceRow[]>> {
  return cachedFetch("prices_latest", async () => {
    const { data, error } = await supabase.from("crop_prices_latest").select("crop_id, price_per_kg, change_pct, price_date");
    if (error) throw error;
    return (data ?? []) as PriceRow[];
  });
}

// The database's badge ids, and the app's names for them.
const BADGE: Record<string, AchievementId> = {
  "newbie": "newbie",
  "first-harvest": "harvest",
  "first-sale": "sale",
  "farmer-of-the-week": "week",
  "farmer-of-the-month": "month",
  "farmer-of-the-year": "year",
};

/** Badges on record for this account: the ones the database awarded itself,
 *  and any the admin granted (Farmer of the Month, of the Year). */
export async function fetchMyAwards(): Promise<FetchResult<AchievementId[]>> {
  return cachedFetch("awards", async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("NOT_SIGNED_IN");
    const { data, error } = await supabase.from("user_achievements").select("achievement_id").eq("profile_id", u.user.id);
    if (error) throw error;
    return (data ?? []).map(r => BADGE[(r as { achievement_id: string }).achievement_id]).filter(Boolean);
  });
}
