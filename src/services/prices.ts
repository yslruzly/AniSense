import { cachedFetch, FetchResult } from "../lib/cache";
import { RICE_VARIETIES, CROP_GROUPS, applyPrices } from "../data/crops";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export interface PriceItem {
  id: string;
  name: string;
  pricePerKg: number;
  change: number;
  group: string;
}

// ─── Market prices ────────────────────────────────────────────────────────────
// The screens used to import the data modules directly, which meant there was
// no point at which loading could fail, and therefore no loading or error
// state could exist. This is the seam.
//
// Signed in to a real account, today's prices come from the database
// (crop_prices_latest) and are written into the catalog every screen reads;
// otherwise the bundled prices stand. Either way cachedFetch handles the
// offline fallback, useResource the status, and the screen the skeleton,
// error and empty states.

function fromBundle(): PriceItem[] {
  return [
    ...RICE_VARIETIES.map(c => ({ ...c, group: "Rice" })),
    ...CROP_GROUPS.flatMap(g => g.varieties.map(v => ({ ...v, group: g.group }))),
  ] as PriceItem[];
}

export function fetchPrices(): Promise<FetchResult<PriceItem[]>> {
  return cachedFetch<PriceItem[]>("market_prices", async () => {
    if (isSupabaseConfigured) {
      const { data: s } = await supabase.auth.getSession();
      if (s.session) {
        const { data, error } = await supabase.from("crop_prices_latest").select("crop_id, price_per_kg, change_pct");
        if (error) throw error;
        applyPrices(data ?? []);
      }
    }
    return fromBundle();
  });
}
