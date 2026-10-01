// ─── Catalog & rewards service ────────────────────────────────────────────────
// The newest prices (crop_prices_latest), the price records behind them
// (crop_prices), the forecasts (crop_forecasts), and the badges the database
// has awarded this account (user_achievements). All cached, so they still
// show offline.

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

export interface HistoryRow { crop_id: string; price_date: string; price_per_kg: number }

/** "2024-10-01": the 1st of the month, `months` months before this one. */
const monthsAgo = (months: number) => {
  const d = new Date();
  const m = d.getFullYear() * 12 + d.getMonth() - months;
  return `${Math.floor(m / 12)}-${String((m % 12) + 1).padStart(2, "0")}-01`;
};

/** The last two years of price records (never the sample prices of
 *  varieties that have none). The charts show one year; the rest is margin. The phone already carries the full history it shipped with,
 *  and these are laid over it. */
export async function fetchPriceHistory(): Promise<FetchResult<HistoryRow[]>> {
  return cachedFetch("price_history", async () => {
    const { data, error } = await supabase.from("crop_prices")
      .select("crop_id, price_date, price_per_kg").eq("is_sample", false).gte("price_date", monthsAgo(24)).order("price_date");
    if (error) throw error;
    return (data ?? []) as HistoryRow[];
  });
}

export interface ForecastRow { crop_id: string; model: string; target_month: string; price_per_kg: number; low_per_kg: number; high_per_kg: number; mape: number }

/** The models' forecasts for this month onward (and a few months back, in
 *  case the newest record is behind). */
export async function fetchForecasts(): Promise<FetchResult<ForecastRow[]>> {
  return cachedFetch("price_forecasts", async () => {
    const { data, error } = await supabase.from("crop_forecasts")
      .select("crop_id, model, target_month, price_per_kg, low_per_kg, high_per_kg, mape").gte("target_month", monthsAgo(6)).order("target_month");
    if (error) throw error;
    return (data ?? []) as ForecastRow[];
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
