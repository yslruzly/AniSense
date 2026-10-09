// ─── Offline Cache ────────────────────────────────────────────────────────────
// Read-side of offline support: every successful fetch is saved on the phone
// (the cache table of its SQLite database, lib/localdb.ts), and when a fetch
// fails (offline / bad signal) the last-known data is served instead. With
// no signal at all, the saved copy is served at once, without trying.
//
// Usage: services wrap their server calls with cachedFetch():
//   const { data, fromCache, updatedAt } = await fetchMarket();
//   if (fromCache) → show the "offline, as of {updatedAt}" banner (already in the UI)

import { localStore } from "./localdb";

// Whose data this is. Two accounts on one phone must never see each other's
// cached expenses or purchases, so every key is filed under the signed-in
// account's id. Set by the market store when an account opens.
let scope = "";
export function setCacheScope(accountId: string | null): void {
  scope = accountId ? `${accountId}_` : "";
}
export const cacheScope = () => scope;

/** Removes everything this phone saved for one account: its cached lists and
 *  the note of which badges it was shown. Every such key carries the
 *  account's id, so nothing of another account on the same phone is touched. */
export async function wipeAccountData(accountId: string): Promise<void> {
  await (await localStore()).removeAccount(accountId);
}

interface CacheEntry<T> {
  data: T;
  updatedAt: string; // ISO timestamp of the successful fetch
}

export async function cacheSet<T>(key: string, data: T): Promise<void> {
  await (await localStore()).cacheSet(`${scope}${key}`, JSON.stringify(data), new Date().toISOString());
}

export async function cacheGet<T>(key: string): Promise<CacheEntry<T> | null> {
  const row = await (await localStore()).cacheGet(`${scope}${key}`);
  if (!row) return null;
  try {
    return { data: JSON.parse(row.data) as T, updatedAt: row.updatedAt };
  } catch {
    return null; // corrupted entry: treat as no cache
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
 *
 * With no signal at all it doesn't try: a request then only fails, and only
 * after the sign-in library has spent up to half a minute retrying to renew
 * an expired session. The saved copy comes at once instead.
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<FetchResult<T>> {
  if (isOffline()) {
    const cached = await cacheGet<T>(key);
    if (cached) return { data: cached.data, fromCache: true, updatedAt: cached.updatedAt };
    throw new TypeError("Offline, and nothing saved on this phone yet");
  }
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

/** The phone says it has no network at all. */
export const isOffline = (): boolean => typeof navigator !== "undefined" && navigator.onLine === false;

/**
 * For changes that can wait (an expense, a sale): with no signal, fail at once,
 * as a network failure, so the caller queues the change straight away rather
 * than after the sign-in library's half a minute of retries.
 */
export function throwIfOffline(): void {
  if (isOffline()) throw new TypeError("Offline");
}

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
