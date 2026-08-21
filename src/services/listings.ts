// ─── Listings Service ─────────────────────────────────────────────────────────
// Marketplace CRUD. Replaces the LISTINGS mock in TradeScreen;
// see SETUP_DATABASE.md Step 7.

import { supabase } from "../lib/supabase";
import { Listing } from "../types";
import { cachedFetch, requireOnline, FetchResult } from "../lib/cache";

const initialsOf = (name: string) =>
  name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

// Shape returned by the select below (listing + joined seller profile)
interface ListingRow {
  id: string;
  crop: string;
  variety: string;
  description: string;
  price_per_kg: number;
  kg: number;
  location: string;
  created_at: string;
  seller_id: string;
  profiles: { full_name: string; rating: number } | null;
}

function toListing(row: ListingRow): Listing {
  const sellerName = row.profiles?.full_name ?? "Unknown";
  return {
    id: row.id,
    crop: row.crop,
    variety: row.variety,
    desc: row.description,
    pricePerKg: Number(row.price_per_kg),
    kg: Number(row.kg),
    date: row.created_at.split("T")[0],
    seller: sellerName,
    sellerInitials: initialsOf(sellerName),
    rating: Number(row.profiles?.rating ?? 5),
    location: row.location,
  };
}

/**
 * All active listings, newest first. Offline: serves the last-fetched list
 * (read-only browsing); check `fromCache` to show the offline banner.
 */
export async function fetchListings(): Promise<FetchResult<Listing[]>> {
  return cachedFetch("listings", async () => {
    const { data, error } = await supabase
      .from("listings")
      .select("*, profiles!seller_id(full_name, rating)")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as ListingRow[]).map(toListing);
  });
}

/**
 * Farmer posts a listing (the "Sell" modal's saveForm). seller_id = current user.
 * Online-only by design: a listing others can buy from shouldn't exist only on
 * one phone. Offline → throws a friendly message for the error UI.
 */
export async function createListing(form: {
  crop: string; variety: string; desc: string;
  pricePerKg: number; kg: number; location: string;
}) {
  requireOnline("Posting a listing");
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not signed in");
  const { error } = await supabase.from("listings").insert({
    seller_id: userData.user.id,
    crop: form.crop,
    variety: form.variety,
    description: form.desc,
    price_per_kg: form.pricePerKg,
    kg: form.kg,
    location: form.location,
  });
  if (error) throw error;
}

export async function updateListing(id: string, form: {
  crop: string; variety: string; desc: string;
  pricePerKg: number; kg: number; location: string;
}) {
  requireOnline("Editing a listing");
  const { error } = await supabase.from("listings").update({
    crop: form.crop,
    variety: form.variety,
    description: form.desc,
    price_per_kg: form.pricePerKg,
    kg: form.kg,
    location: form.location,
  }).eq("id", id);
  if (error) throw error;
}

/** Soft-delete so past transactions keep a valid reference. Online-only. */
export async function removeListing(id: string) {
  requireOnline("Removing a listing");
  const { error } = await supabase.from("listings")
    .update({ status: "removed" }).eq("id", id);
  if (error) throw error;
}
