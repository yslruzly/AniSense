// ─── Photos in Storage ────────────────────────────────────────────────────────
// Every photo a member puts up - a listing's, their own for the Profile and
// the ID card - goes into their own folder ("<their user id>/...") in one
// public bucket. The bucket's rules (schema.sql, section 8) let each person
// write only there, and deleting the account clears that folder in one go.

import { supabase } from "../lib/supabase";

export const PHOTO_BUCKET = "listing-photos";

/** A name for the upload that won't collide, without relying on crypto.randomUUID. */
const fileId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * Puts a photo taken on the phone into Storage, in the member's own folder,
 * and gives back the address it will be shown from. A photo already in
 * Storage (an edit that kept it) passes straight through.
 */
export async function storedPhoto(uid: string, photo: string | null, prefix = ""): Promise<string | null> {
  if (!photo) return null;
  if (!photo.startsWith("data:")) return photo;
  const blob = await (await fetch(photo)).blob();
  const type = blob.type || "image/jpeg";
  const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  const path = `${uid}/${prefix}${fileId()}.${ext}`;
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: type, upsert: false });
  if (error) throw error;
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** The file behind one of the bucket's addresses, if it is in `uid`'s folder. */
export function photoPath(uid: string, url: string | null | undefined): string | null {
  const path = url?.split(`/${PHOTO_BUCKET}/`)[1]?.split("?")[0];
  return path && path.startsWith(`${uid}/`) ? decodeURIComponent(path) : null;
}
