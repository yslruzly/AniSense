// ─── Orders Service ───────────────────────────────────────────────────────────
// Checkout, the buyer's purchase history, and the farmer's side of the same
// orders: the ones waiting for their call, and what they sold. After the call
// each side keeps its own figure: the farmer confirms with what they sold it
// for (their earnings), the buyer records what they paid (their spending).
// Called only by the market store (src/store/market.tsx).

import { supabase } from "../lib/supabase";
import { BuyerTransaction, CartItem, IncomingOrder, OrderStatus } from "../types";
import { Sale } from "../lib/sales";
import { cachedFetch, requireOnline, FetchResult } from "../lib/cache";
import { initialsOf } from "./listings";

// One line of an order, with its crop (and the crop's type), its farmer, and
// the order it belongs to (for the buyer). Price and place are the ones at
// the moment of sale.
interface OrderItemRow {
  id: string;
  quantity_kg: number;
  price_per_kg: number;
  amount: number;
  location: string;
  created_at: string;
  status?: OrderStatus;
  sold_amount?: number | null;
  paid_amount?: number | null;
  confirmed_at?: string | null;
  rating?: number | null;
  crop: { name: string; group: { name: string } | null } | null;
  seller?: { full_name: string } | null;
  order?: { buyer_id: string; buyer?: { full_name: string; phone?: string | null; location?: string | null } | null } | null;
}

const num = (v: number | null | undefined) => (v === null || v === undefined ? undefined : Number(v));

const dayOf = (iso: string) => iso.split("T")[0];

/**
 * The signed-in buyer's purchases, one row per line bought, newest first.
 * Offline: the last history fetched; `fromCache` says so.
 */
export async function fetchMyPurchases(): Promise<FetchResult<BuyerTransaction[]>> {
  return cachedFetch("purchases", async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("NOT_SIGNED_IN");
    const { data, error } = await supabase
      .from("order_items")
      .select("id, quantity_kg, price_per_kg, amount, location, created_at, status, sold_amount, paid_amount, rating, " +
        "crop:crops(name, group:crop_groups(name)), seller:profiles!seller_id(full_name), orders!inner(buyer_id)")
      .eq("orders.buyer_id", u.user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as OrderItemRow[]).map(row => {
      const seller = row.seller?.full_name || "AniSense farmer";
      return {
        id: row.id,
        crop: row.crop?.group?.name ?? row.crop?.name ?? "",
        variety: row.crop?.name ?? "",
        kg: Number(row.quantity_kg),
        amount: Number(row.amount),
        date: dayOf(row.created_at),
        seller,
        sellerInitials: initialsOf(seller),
        location: row.location,
        status: row.status,
        agreed: num(row.sold_amount),
        paid: num(row.paid_amount),
        rating: num(row.rating),
      };
    });
  });
}

/**
 * What the signed-in farmer sold through the marketplace, as sales for the
 * profit figures: the lines they have confirmed, at what they said each sold
 * for, on the day they confirmed it. A line still waiting for the call is not
 * a sale yet. Ids are prefixed "tx-" so they are never mistaken for the sales
 * a farmer typed in by hand (those are in the sales table).
 */
export async function fetchMySales(): Promise<FetchResult<Sale[]>> {
  return cachedFetch("sales_market", async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("NOT_SIGNED_IN");
    const { data, error } = await supabase
      .from("order_items")
      .select("id, quantity_kg, price_per_kg, amount, location, created_at, status, sold_amount, confirmed_at, " +
        "crop:crops(name, group:crop_groups(name)), order:orders(buyer_id, buyer:profiles(full_name))")
      .eq("seller_id", u.user.id)
      .in("status", ["confirmed", "completed"])
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as OrderItemRow[]).map(row => {
      const kg = Number(row.quantity_kg);
      const amount = num(row.sold_amount) ?? Number(row.amount);
      return {
        id: `tx-${row.id}`,
        crop: row.crop?.group?.name ?? row.crop?.name ?? "",
        kg,
        pricePerKg: kg ? Math.round(amount / kg * 100) / 100 : Number(row.price_per_kg),
        amount,
        date: dayOf(row.confirmed_at ?? row.created_at),
        buyer: row.order?.buyer?.full_name || undefined,
      };
    });
  });
}

/**
 * Orders waiting for the signed-in farmer's call, and the ones they confirmed
 * in the last week (so the buyer's number is still to hand), newest first.
 * The buyer's name, number and town come from their profile, which a farmer
 * may read once that buyer has ordered from them.
 */
export async function fetchIncomingOrders(): Promise<FetchResult<IncomingOrder[]>> {
  return cachedFetch("orders_in", async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("NOT_SIGNED_IN");
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
    const { data, error } = await supabase
      .from("order_items")
      .select("id, quantity_kg, price_per_kg, amount, location, created_at, status, sold_amount, rating, " +
        "crop:crops(name, group:crop_groups(name)), order:orders(buyer_id, buyer:profiles(full_name, phone, location))")
      .eq("seller_id", u.user.id)
      .or(`status.eq.placed,and(status.eq.confirmed,confirmed_at.gte.${weekAgo})`)
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw error;
    return (data as unknown as OrderItemRow[]).map(row => ({
      id: row.id,
      buyer: row.order?.buyer?.full_name || "AniSense buyer",
      phone: row.order?.buyer?.phone ?? "",
      location: row.order?.buyer?.location ?? "",
      crop: row.crop?.name ?? "",
      kg: Number(row.quantity_kg),
      pricePerKg: Number(row.price_per_kg),
      amount: Number(row.amount),
      placedAt: row.created_at,
      status: row.status === "placed" ? "placed" : "confirmed",
      soldAmount: num(row.sold_amount),
      rating: num(row.rating),
    }));
  });
}

/** The farmer confirms a line after the call, with what it sold for. Online only. */
export async function confirmOrderItem(id: string, sold: number): Promise<void> {
  requireOnline("Confirming an order");
  const { error } = await supabase.rpc("confirm_order_item", { p_item: id, p_sold: sold });
  if (error) throw error;
}

/** The buyer records what they paid for a line, or clears it (null). Online only. */
export async function recordPayment(id: string, paid: number | null): Promise<void> {
  requireOnline("Recording a payment");
  const { error } = await supabase.rpc("record_order_payment", { p_item: id, p_paid: paid });
  if (error) throw error;
}

/**
 * The buyer rates the farmer of a line, 1 to 5 stars (again, to change it).
 * Only once it is settled on both sides: NOT_YET before. Online only.
 */
export async function rateOrderItem(id: string, stars: number): Promise<void> {
  requireOnline("Rating a farmer");
  const { error } = await supabase.rpc("rate_order_item", { p_item: id, p_stars: stars });
  if (error) throw error;
}

/** Why an order didn't go through, as a key the screen can translate. */
export type OrderError = "offline" | "stock" | "gone" | "own" | "sample" | "failed";

export function orderErrorOf(err: unknown): OrderError {
  const msg = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
  // Refused on the phone before anything is sent, whatever the signal.
  if (msg.includes("SAMPLE_LISTING")) return "sample";
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
