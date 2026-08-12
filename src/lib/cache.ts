// ─── Offline Cache ────────────────────────────────────────────────────────────
// Read-side of offline support: every successful fetch is saved to native
// storage (@capacitor/preferences → SharedPreferences on Android), and when a
// fetch fails (offline / bad signal) the last-known data is served instead.
//
// Usage — services wrap their server calls with cachedFetch():
//   const { data, fromCache, updatedAt } = await fetchListings();
//   if (fromCache) → show the "offline, as of {updatedAt}" banner (already in the UI)

import { Preferences } from "@capacitor/preferences";

interface CacheEntry<T> {
  data: T;
  updatedAt: string; // ISO timestamp of the successful fetch
}

export async function cacheSet<T>(key: string, data: T): Promise<void> {
  const entry: CacheEntry<T> = { data, updatedAt: new Date().toISOString() };
  await Preferences.set({ key: `cache_${key}`, value: JSON.stringify(entry) });
}

export async function cacheGet<T>(key: string): Promise<CacheEntry<T> | null> {
  const { value } = await Preferences.get({ key: `cache_${key}` });
  if (!value) return null;
  try {
    return JSON.parse(value) as CacheEntry<T>;
  } catch {
    return null; // corrupted entry — treat as no cache
  }
}

export interface FetchResult<T> {
  data: T;
  /** true = you're looking at cached data because the network fetch failed */
  fromCache: boolean;
  /** when this data was last fetched successfully (null = never) */
  updatedAt: string | null;
}

/**
 * Network-first, cache-fallback. Tries the real fetch; on success caches and
 * returns fresh data. On failure returns the cached copy if one exists,
 * otherwise rethrows (first-ever launch with no connection).
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<FetchResult<T>> {
  try {
    const data = await fetcher();
    await cacheSet(key, data);
    return { data, fromCache: false, updatedAt: new Date().toISOString() };
  } catch (err) {
    const cached = await cacheGet<T>(key);
    if (cached) return { data: cached.data, fromCache: true, updatedAt: cached.updatedAt };
    throw err;
  }
}

// ─── Connectivity helpers ─────────────────────────────────────────────────────

/**
 * True when an error looks like a connectivity failure (fetch throws TypeError
 * when there's no network) rather than a real server rejection (wrong data,
 * RLS denial…). Used to decide "queue for later" vs "show the error".
 */
export function isNetworkError(err: unknown): boolean {
  if (!navigator.onLine) return true;
  if (err instanceof TypeError) return true; // fetch's network failure
  const msg = err instanceof Error ? err.message.toLowerCase() : "";
  return msg.includes("fetch") || msg.includes("network") || msg.includes("timeout");
}

/** Guard for actions that genuinely need a connection (checkout, posting listings). */
export function requireOnline(actionLabel = "This action"): void {
  if (!navigator.onLine) {
    throw new Error(`${actionLabel} needs an internet connection. Please try again when you're back online.`);
  }
}
