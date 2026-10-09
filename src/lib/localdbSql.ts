// ─── The phone's database, in SQL ─────────────────────────────────────────────
// What AniSense keeps on the phone so it works without signal, as SQLite
// tables. This file is the SQL only: it talks to the database through a small
// driver (SqlDriver), so the same code runs on the phone (the SQLite plugin,
// src/lib/localdb.ts) and in tests (sql.js).
//
// Three tables:
//   cache   the last copy of each list fetched from the server (the market,
//           prices, purchases, expenses…), one row per list and account,
//           kept as JSON with the time it was fetched
//   outbox  changes made without signal, waiting to be sent, oldest first
//   kv      small records of this phone: the demo's own sales and plantings,
//           which tours were seen, the last member number shown…
// and a fourth, meta, for the database's own bookkeeping (its version).
//
// The schema grows by migrations: each has a number, they run in order, once,
// each in one transaction, and the version reached is written in meta. A
// later change adds a migration at the end; it never edits one that shipped.

/** How the SQL reaches a database. */
export interface SqlDriver {
  /** Statements with no values (schema). */
  exec(sql: string): Promise<void>;
  /** One statement with values. */
  run(sql: string, values?: unknown[]): Promise<void>;
  /** Rows, as objects keyed by column. */
  all<T = Record<string, unknown>>(sql: string, values?: unknown[]): Promise<T[]>;
  /** Several statements, all or none (one transaction). */
  batch(steps: { sql: string; values?: unknown[] }[]): Promise<void>;
}

/** A change waiting to be sent. */
export interface OutboxRow {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  queuedAt: string;
  owner?: string;
}

/** What the rest of the app asks of the phone's storage. */
export interface LocalStore {
  kvGet(key: string): Promise<string | null>;
  kvSet(key: string, value: string): Promise<void>;
  kvRemove(key: string): Promise<void>;
  cacheGet(key: string): Promise<{ data: string; updatedAt: string } | null>;
  cacheSet(key: string, data: string, updatedAt: string): Promise<void>;
  outboxAll(): Promise<OutboxRow[]>;
  outboxAdd(op: OutboxRow): Promise<void>;
  /** Puts these in place of every change waiting, in this order. */
  outboxReplace(ops: OutboxRow[]): Promise<void>;
  /** Every cached list and record of one account (their keys carry its id). */
  removeAccount(accountId: string): Promise<void>;
}

export const MIGRATIONS: { version: number; steps: string[] }[] = [
  {
    version: 1,
    steps: [
      `CREATE TABLE IF NOT EXISTS kv (
         key   TEXT PRIMARY KEY NOT NULL,
         value TEXT NOT NULL
       )`,
      `CREATE TABLE IF NOT EXISTS cache (
         key        TEXT PRIMARY KEY NOT NULL,
         data       TEXT NOT NULL,
         updated_at TEXT NOT NULL
       )`,
      `CREATE TABLE IF NOT EXISTS outbox (
         seq       INTEGER PRIMARY KEY AUTOINCREMENT,
         id        TEXT NOT NULL UNIQUE,
         owner     TEXT NOT NULL DEFAULT '',
         type      TEXT NOT NULL,
         payload   TEXT NOT NULL,
         queued_at TEXT NOT NULL
       )`,
      `CREATE INDEX IF NOT EXISTS outbox_by_owner ON outbox (owner, seq)`,
    ],
  },
];
export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;

const META = `CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)`;
const setMeta = (key: string, value: string) => ({ sql: "INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)", values: [key, value] });

async function getMeta(db: SqlDriver, key: string): Promise<string | null> {
  const rows = await db.all<{ value: string }>("SELECT value FROM meta WHERE key = ?", [key]);
  return rows[0]?.value ?? null;
}

/** Brings the database up to the newest version. Returns the version it found. */
export async function migrate(db: SqlDriver): Promise<number> {
  await db.exec(META);
  const found = Number(await getMeta(db, "schema_version") ?? 0);
  for (const m of MIGRATIONS) {
    if (m.version <= found) continue;
    await db.batch([...m.steps.map(sql => ({ sql })), setMeta("schema_version", String(m.version))]);
  }
  return found;
}

// ─── Moving in: what the phone kept before SQLite ────────────────────────────
// Until now everything sat in Preferences (Android's SharedPreferences), as
// text under keys: "cache_<account>_<list>" for the lists, "outbox_ops" for
// the queue, and plain keys for the rest. On the first start with SQLite it
// is copied across, once, in one transaction, so nobody loses a saved list or
// a change still waiting. The sign-in session is left where it is: the
// sign-in library keeps it there itself ("sb-…" keys).

/** The part of Preferences the move needs. */
export interface OldStore {
  keys(): Promise<string[]>;
  get(key: string): Promise<string | null>;
  remove(key: string): Promise<void>;
}

export const isSessionKey = (key: string) => key.startsWith("sb-");

/** Copies the old keys in, once. Returns how many it moved (0 if done before). */
export async function importOldStore(db: SqlDriver, old: OldStore): Promise<number> {
  if (await getMeta(db, "imported_preferences")) return 0;
  const keys = (await old.keys()).filter(k => !isSessionKey(k));
  const steps: { sql: string; values?: unknown[] }[] = [];
  const moved: string[] = [];
  for (const key of keys) {
    const value = await old.get(key);
    if (value == null) continue;
    if (key === "outbox_ops") {
      let ops: OutboxRow[] = [];
      try { ops = JSON.parse(value) as OutboxRow[]; } catch { /* unreadable: nothing to keep */ }
      for (const op of ops) steps.push(outboxInsert(op));
    } else if (key.startsWith("cache_")) {
      try {
        const entry = JSON.parse(value) as { data: unknown; updatedAt: string };
        steps.push({ sql: "INSERT OR REPLACE INTO cache (key, data, updated_at) VALUES (?, ?, ?)", values: [key.slice(6), JSON.stringify(entry.data), entry.updatedAt] });
      } catch { /* a damaged copy: the next fetch replaces it */ }
    } else {
      steps.push({ sql: "INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)", values: [key, value] });
    }
    moved.push(key);
  }
  await db.batch([...steps, setMeta("imported_preferences", new Date().toISOString())]);
  // Only once they are safely in: the old copies go. If that fails, the
  // mark above keeps them from being moved twice.
  for (const key of moved) await old.remove(key).catch(() => {});
  return moved.length;
}

function outboxInsert(op: OutboxRow) {
  return {
    sql: "INSERT OR REPLACE INTO outbox (id, owner, type, payload, queued_at) VALUES (?, ?, ?, ?, ?)",
    values: [op.id, op.owner ?? "", op.type, JSON.stringify(op.payload ?? {}), op.queuedAt],
  };
}

// ─── The store ───────────────────────────────────────────────────────────────
// LIKE patterns are escaped, so an id with "_" or "%" in it matches itself only.
const likeEscape = (s: string) => s.replace(/[\\%_]/g, c => `\\${c}`);

export function sqlStore(db: SqlDriver): LocalStore {
  return {
    async kvGet(key) {
      const rows = await db.all<{ value: string }>("SELECT value FROM kv WHERE key = ?", [key]);
      return rows[0]?.value ?? null;
    },
    async kvSet(key, value) {
      await db.run("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)", [key, value]);
    },
    async kvRemove(key) {
      await db.run("DELETE FROM kv WHERE key = ?", [key]);
    },
    async cacheGet(key) {
      const rows = await db.all<{ data: string; updated_at: string }>("SELECT data, updated_at FROM cache WHERE key = ?", [key]);
      return rows[0] ? { data: rows[0].data, updatedAt: rows[0].updated_at } : null;
    },
    async cacheSet(key, data, updatedAt) {
      await db.run("INSERT OR REPLACE INTO cache (key, data, updated_at) VALUES (?, ?, ?)", [key, data, updatedAt]);
    },
    async outboxAll() {
      const rows = await db.all<{ id: string; owner: string; type: string; payload: string; queued_at: string }>(
        "SELECT id, owner, type, payload, queued_at FROM outbox ORDER BY seq");
      return rows.map(r => {
        let payload: Record<string, unknown> = {};
        try { payload = JSON.parse(r.payload); } catch { /* kept empty: its handler will refuse it */ }
        return { id: r.id, owner: r.owner, type: r.type, payload, queuedAt: r.queued_at };
      });
    },
    async outboxAdd(op) {
      await db.run(outboxInsert(op).sql, outboxInsert(op).values);
    },
    async outboxReplace(ops) {
      await db.batch([{ sql: "DELETE FROM outbox" }, ...ops.map(outboxInsert)]);
    },
    async removeAccount(accountId) {
      const pattern = `%${likeEscape(accountId)}%`;
      await db.batch([
        { sql: "DELETE FROM cache WHERE key LIKE ? ESCAPE '\\'", values: [pattern] },
        { sql: "DELETE FROM kv WHERE key LIKE ? ESCAPE '\\'", values: [pattern] },
      ]);
    },
  };
}
