// ─── Outbox (offline write queue) ─────────────────────────────────────────────
// Write-side of offline support. When the user does something while offline
// (e.g. records an expense in a field with no signal), the operation is saved
// here and replayed against Supabase when the connection returns.
//
// Flow:
//   1. Service can't reach the server → enqueue({ type: "add_expense", payload })
//   2. The UI keeps working from the local cache (instant, optimistic)
//   3. Browser fires "online" → sync (src/services/sync.ts) drains the queue in order
//   4. Rows created offline get temporary "local-..." ids; when the real insert
//      happens, the id mapping is applied to any later queued ops that
//      reference them (edit/delete an expense that was also created offline).

import { Preferences } from "@capacitor/preferences";

export interface OutboxOp {
  id: string;
  type: string;                     // e.g. "add_expense", matched to a handler
  payload: Record<string, unknown>;
  queuedAt: string;
}

/** Handlers may return an id mapping when a temp local id got a real DB id. */
export type OutboxHandler = (
  payload: Record<string, unknown>
) => Promise<{ localId: string; realId: string } | void>;

const KEY = "outbox_ops";
const listeners = new Set<(count: number) => void>();

async function load(): Promise<OutboxOp[]> {
  const { value } = await Preferences.get({ key: KEY });
  if (!value) return [];
  try {
    return JSON.parse(value) as OutboxOp[];
  } catch {
    return [];
  }
}

async function save(ops: OutboxOp[]): Promise<void> {
  await Preferences.set({ key: KEY, value: JSON.stringify(ops) });
  listeners.forEach(cb => cb(ops.length));
}

export async function enqueue(type: string, payload: Record<string, unknown>): Promise<void> {
  const ops = await load();
  ops.push({
    id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    payload,
    queuedAt: new Date().toISOString(),
  });
  await save(ops);
}

export async function pendingCount(): Promise<number> {
  return (await load()).length;
}

/** Subscribe to queue-size changes (for a "3 waiting to sync" badge). Returns unsubscribe. */
export function onOutboxChange(cb: (count: number) => void): () => void {
  listeners.add(cb);
  pendingCount().then(cb); // fire immediately with current count
  return () => listeners.delete(cb);
}

/** Replace temp local ids in a payload with the real ids assigned during this drain. */
function remapIds(
  payload: Record<string, unknown>,
  idMap: Record<string, string>
): Record<string, unknown> {
  const out = { ...payload };
  for (const k of Object.keys(out)) {
    const v = out[k];
    if (typeof v === "string" && idMap[v]) out[k] = idMap[v];
  }
  return out;
}

/**
 * Replay queued operations in order. Stops at the first failure (keeps that op
 * and everything after it queued, preserving order for the next attempt).
 * Returns how many ops were synced.
 */
export async function processOutbox(handlers: Record<string, OutboxHandler>): Promise<number> {
  const ops = await load();
  if (ops.length === 0) return 0;

  const idMap: Record<string, string> = {};
  let synced = 0;

  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    const handler = handlers[op.type];
    if (!handler) { synced++; continue; } // unknown op type: drop it rather than block forever
    try {
      const result = await handler(remapIds(op.payload, idMap));
      if (result) idMap[result.localId] = result.realId;
      synced++;
    } catch {
      await save(ops.slice(i)); // keep the failed op + the rest, in order
      return synced;
    }
  }

  await save([]);
  return synced;
}
