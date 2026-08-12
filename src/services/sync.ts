// ─── Sync Coordinator ─────────────────────────────────────────────────────────
// Drains the offline outbox whenever the connection comes back. Wire this once
// in App.tsx (see SETUP_DATABASE.md Step 8):
//
//   useEffect(() => initAutoSync(), []);
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

/**
 * Start automatic syncing: runs once on startup (in case ops were queued last
 * session) and again every time the device comes back online.
 * Returns a cleanup function for useEffect.
 */
export function initAutoSync(): () => void {
  const run = () => { void syncNow(); };
  window.addEventListener("online", run);
  run(); // catch anything queued from a previous session
  return () => window.removeEventListener("online", run);
}
