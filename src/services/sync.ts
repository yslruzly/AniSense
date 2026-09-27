// ─── Sync Coordinator ─────────────────────────────────────────────────────────
// Drains the offline outbox. The market store (src/lib/market.tsx) calls
// syncNow() when an account opens and whenever the connection comes back,
// before it fetches, so a fresh list already includes what was queued.
//
// New offline-capable services just add their handlers to ALL_HANDLERS below.

import { processOutbox, OutboxHandler } from "../lib/outbox";
import { expenseSyncHandlers } from "./expenses";

const ALL_HANDLERS: Record<string, OutboxHandler> = {
  ...expenseSyncHandlers,
  // ...future offline-capable features register their handlers here
};

let syncing = false;

/** Replay all queued offline operations now. Safe to call repeatedly. */
export async function syncNow(): Promise<number> {
  if (syncing || !navigator.onLine) return 0;
  syncing = true;
  try {
    return await processOutbox(ALL_HANDLERS);
  } finally {
    syncing = false;
  }
}
