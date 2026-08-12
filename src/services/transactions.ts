// ─── Transactions Service ─────────────────────────────────────────────────────
// Buyer checkout + purchase history. Replaces the BUYER_TRANSACTIONS mock —
// see SETUP_DATABASE.md Step 7.

import { supabase } from "../lib/supabase";
import { BuyerTransaction, CartItem } from "../types";
import { cachedFetch, requireOnline, FetchResult } from "../lib/cache";

const initialsOf = (name: string) =>
  name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

interface TransactionRow {
  id: string;
  crop: string;
  variety: string;
  kg: number;
  amount: number;
  location: string;
  created_at: string;
  profiles: { full_name: string } | null; // joined seller
}

/**
 * The signed-in buyer's purchase history (ExpensesScreen buyer view).
 * Offline: serves the last-fetched history — check `fromCache` for the banner.
 */
export async function fetchMyPurchases(): Promise<FetchResult<BuyerTransaction[]>> {
  return cachedFetch("purchases", async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("id, crop, variety, kg, amount, location, created_at, profiles!seller_id(full_name)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as TransactionRow[]).map(row => ({
      id: row.id,
      crop: row.crop,
      variety: row.variety,
      kg: Number(row.kg),
      amount: Number(row.amount),
      date: row.created_at.split("T")[0],
      seller: row.profiles?.full_name ?? "Unknown",
      sellerInitials: initialsOf(row.profiles?.full_name ?? "??"),
      location: row.location,
    }));
  });
}

/**
 * Checkout: one transaction row per cart item (TradeScreen handleCheckout).
 * Needs the seller's user id, so look it up from each listing first.
 * Online-only by design — a purchase must be confirmed against live listings
 * (the item could already be sold). Offline → throws a friendly message.
 */
export async function checkout(cart: CartItem[]) {
  requireOnline("Checkout");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not signed in");

  const listingIds = cart.map(c => c.listingId);
  const { data: rows, error: lookupErr } = await supabase
    .from("listings").select("id, seller_id").in("id", listingIds);
  if (lookupErr) throw lookupErr;
  const sellerOf = Object.fromEntries((rows ?? []).map(r => [r.id, r.seller_id]));

  const { error } = await supabase.from("transactions").insert(
    cart.map(item => ({
      buyer_id: userData.user!.id,
      listing_id: item.listingId,
      seller_id: sellerOf[item.listingId],
      crop: item.crop,
      variety: item.variety,
      kg: item.qty,
      amount: item.qty * item.pricePerKg,
      location: item.location,
    }))
  );
  if (error) throw error;
}
