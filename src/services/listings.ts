// ─── Listings Service ─────────────────────────────────────────────────────────
// The marketplace on the database: what is for sale, who is selling it, and
// the seller's own photo of it. The market store (src/lib/market.tsx) is the
// only caller; screens never talk to Supabase directly.

import { supabase } from "../lib/supabase";
import { Listing, SellerDetail } from "../types";
import { cachedFetch, requireOnline, FetchResult } from "../lib/cache";

const PHOTO_BUCKET = "listing-photos";

export const initialsOf = (name: string) =>
  name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

// The seller's public side, joined onto every listing.
interface SellerRow {
  id: string;
  full_name: string;
  rating: number;
  phone: string | null;
  location: string | null;
  years_farming: number | null;
  total_sales: number;
  crops: string[] | null;
  bio: string | null;
}

interface ListingRow {
  id: string;
  seller_id: string;
  crop: string;
  variety: string;
  description: string;
  price_per_kg: number;
  kg: number;
  location: string;
  photo_url: string | null;
  created_at: string;
  seller: SellerRow | null;
}

/** "+639171234567" → "+63 917 123 4567", the way the app shows numbers. */
const displayPhone = (e164: string | null) => {
  if (!e164) return "";
  const d = e164.replace(/\D/g, "").replace(/^63/, "");
  return `+63 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`.trim();
};

function toListing(row: ListingRow): Listing {
  const name = row.seller?.full_name || "AniSense farmer";
  return {
    id: row.id,
    sellerId: row.seller_id,
    crop: row.crop,
    variety: row.variety,
    desc: row.description,
    pricePerKg: Number(row.price_per_kg),
    kg: Number(row.kg),
    date: row.created_at.split("T")[0],
    seller: name,
    sellerInitials: initialsOf(name),
    rating: Number(row.seller?.rating ?? 5),
    location: row.location,
    photo: row.photo_url ?? undefined,
  };
}

function toSeller(row: SellerRow): SellerDetail {
  const name = row.full_name || "AniSense farmer";
  return {
    id: row.id,
    name,
    initials: initialsOf(name),
    phone: displayPhone(row.phone),
    location: row.location ?? "",
    yearsfarming: row.years_farming ?? 0,
    rating: Number(row.rating ?? 5),
    totalSales: row.total_sales ?? 0,
    crops: row.crops ?? [],
    bio: row.bio ?? "",
  };
}

export interface MarketSnapshot {
  listings: Listing[];
  /** Everyone with something for sale, keyed by their account id. */
  sellers: Record<string, SellerDetail>;
}

/**
 * Every active listing with its seller, newest first. Offline: the last list
 * fetched (browsing works, buying waits for a connection); `fromCache` says so.
 */
export async function fetchMarket(): Promise<FetchResult<MarketSnapshot>> {
  return cachedFetch("market", async () => {
    const { data, error } = await supabase
      .from("listings")
      .select("id, seller_id, crop, variety, description, price_per_kg, kg, location, photo_url, created_at, " +
        "seller:profiles!seller_id(id, full_name, rating, phone, location, years_farming, total_sales, crops, bio)")
      .eq("status", "active")
      .gt("kg", 0)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const rows = data as unknown as ListingRow[];
    const sellers: Record<string, SellerDetail> = {};
    for (const r of rows) if (r.seller) sellers[r.seller_id] = toSeller(r.seller);
    return { listings: rows.map(toListing), sellers };
  });
}

export interface ListingInput {
  crop: string; variety: string; desc: string;
  pricePerKg: number; kg: number; location: string;
  /** A new photo arrives as a data URL, a kept one as its https URL, none as null. */
  photo: string | null;
}

/** A name for the upload that won't collide, without relying on crypto.randomUUID. */
const fileId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * Puts a photo taken on the phone into Storage, in the farmer's own folder,
 * and gives back the address the listing will show it from. A photo already
 * in Storage (an edit that kept it) passes straight through.
 */
async function storedPhoto(uid: string, photo: string | null): Promise<string | null> {
  if (!photo) return null;
  if (!photo.startsWith("data:")) return photo;
  const blob = await (await fetch(photo)).blob();
  const type = blob.type || "image/jpeg";
  const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  const path = `${uid}/${fileId()}.${ext}`;
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: type, upsert: false });
  if (error) throw error;
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function myId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("NOT_SIGNED_IN");
  return data.user.id;
}

/**
 * A farmer posts a harvest. Online-only by design: a listing others can buy
 * from shouldn't exist only on one phone.
 */
export async function createListing(form: ListingInput): Promise<void> {
  requireOnline("Posting a listing");
  const uid = await myId();
  const photo_url = await storedPhoto(uid, form.photo);
  const { error } = await supabase.from("listings").insert({
    seller_id: uid,
    crop: form.crop,
    variety: form.variety,
    description: form.desc,
    price_per_kg: form.pricePerKg,
    kg: form.kg,
    location: form.location,
    photo_url,
  });
  if (error) throw error;
}

export async function updateListing(id: string, form: ListingInput): Promise<void> {
  requireOnline("Editing a listing");
  const uid = await myId();
  const photo_url = await storedPhoto(uid, form.photo);
  const { error } = await supabase.from("listings").update({
    crop: form.crop,
    variety: form.variety,
    description: form.desc,
    price_per_kg: form.pricePerKg,
    kg: form.kg,
    location: form.location,
    photo_url,
    // Restocking a sold-out listing puts it back on the market.
    ...(form.kg > 0 ? { status: "active" } : {}),
  }).eq("id", id);
  if (error) throw error;
}

/** Soft-delete, so past orders keep a valid reference. Online-only. */
export async function removeListing(id: string): Promise<void> {
  requireOnline("Removing a listing");
  const { error } = await supabase.from("listings").update({ status: "removed" }).eq("id", id);
  if (error) throw error;
}
