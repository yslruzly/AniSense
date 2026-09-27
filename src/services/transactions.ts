// ─── Orders Service ───────────────────────────────────────────────────────────
// Checkout, the buyer's purchase history, and the farmer's side of the same
// orders (what they sold through the marketplace). Called only by the market
// store (src/lib/market.tsx).

import { supabase } from "../lib/supabase";
import { BuyerTransaction, CartItem } from "../types";
import { Sale } from "../lib/sales";
import { cachedFetch, requireOnline, FetchResult } from "../lib/cache";
import { initialsOf } from "./listings";

interface OrderRow {
  id: string;
  crop: string;
  variety: string;
  kg: number;
  price_per_kg: number;
  amount: number;
  location: string;
  created_at: string;
  seller?: { full_name: string } | null;
  buyer?: { full_name: string } | null;
}

const dayOf = (iso: string) => iso.split("T")[0];

/**
 * The signed-in buyer's purchase history, newest first. Offline: the last
 * history fetched; `fromCache` says so.
 */
export async function fetchMyPurchases(): Promise<FetchResult<BuyerTransaction[]>> {
  return cachedFetch("purchases", async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("NOT_SIGNED_IN");
    const { data, error } = await supabase
      .from("transactions")
      .select("id, crop, variety, kg, price_per_kg, amount, location, created_at, seller:profiles!seller_id(full_name)")
      .eq("buyer_id", u.user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as OrderRow[]).map(row => {
      const seller = row.seller?.full_name || "AniSense farmer";
      return {
        id: row.id,
        crop: row.crop,
        variety: row.variety,
        kg: Number(row.kg),
        amount: Number(row.amount),
        date: dayOf(row.created_at),
        seller,
        sellerInitials: initialsOf(seller),
        location: row.location,
      };
    });
  });
}

/**
 * What the signed-in farmer sold through the marketplace, as sales for the
 * profit figures. Ids are prefixed "tx-" so they are never mistaken for the
 * sales a farmer typed in by hand (those stay on the phone).
 */
export async function fetchMySales(groupOf: (crop: string) => string): Promise<FetchResult<Sale[]>> {
  return cachedFetch("sales_market", async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("NOT_SIGNED_IN");
    const { data, error } = await supabase
      .from("transactions")
      .select("id, crop, variety, kg, price_per_kg, amount, location, created_at, buyer:profiles!buyer_id(full_name)")
      .eq("seller_id", u.user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as OrderRow[]).map(row => ({
      id: `tx-${row.id}`,
      crop: groupOf(row.crop),
      kg: Number(row.kg),
      pricePerKg: Number(row.price_per_kg),
      amount: Number(row.amount),
      date: dayOf(row.created_at),
      buyer: row.buyer?.full_name || undefined,
    }));
  });
}

/** Why an order didn't go through, as a key the screen can translate. */
export type OrderError = "offline" | "stock" | "gone" | "own" | "failed";

export function orderErrorOf(err: unknown): OrderError {
  const msg = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
  if (!navigator.onLine || /fetch|network|timeout|internet connection/i.test(msg)) return "offline";
  if (msg.includes("NOT_ENOUGH")) return "stock";
  if (msg.includes("LISTING_GONE")) return "gone";
  if (msg.includes("OWN_LISTING")) return "own";
  return "failed";
}

/**
 * Checkout. One call, all or nothing: the database checks every line against
 * live stock, takes the price from the listing (never from the phone), lowers
 * the stock and records the order. Online-only by design.
 * Returns the order id.
 */
export async function placeOrder(cart: CartItem[]): Promise<string> {
  requireOnline("Checkout");
  const { data, error } = await supabase.rpc("place_order", {
    items: cart.map(c => ({ listing_id: c.listingId, kg: c.qty })),
  });
  if (error) throw error;
  return data as string;
}
