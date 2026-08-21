import { cachedFetch, FetchResult } from "../lib/cache";
import { RICE_VARIETIES, CROP_GROUPS } from "../data/crops";

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
// Today the "server call" resolves from the bundled dataset. Swap the body of
// loadPrices for the real Supabase query and every state around it already
// works: cachedFetch handles the offline fallback, useResource handles the
// status machine, and the screen already renders skeleton, error, and empty.

function fromBundle(): PriceItem[] {
  return [
    ...RICE_VARIETIES.map(c => ({ ...c, group: "Rice" })),
    ...CROP_GROUPS.flatMap(g => g.varieties.map(v => ({ ...v, group: g.group }))),
  ] as PriceItem[];
}

export function fetchPrices(): Promise<FetchResult<PriceItem[]>> {
  return cachedFetch<PriceItem[]>("market_prices", async () => {
    // TODO: replace with the Supabase query. Everything downstream is agnostic.
    return fromBundle();
  });
}
