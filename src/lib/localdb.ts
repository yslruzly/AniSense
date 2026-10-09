// ─── The phone's own storage ──────────────────────────────────────────────────
// Everything AniSense keeps on the phone to work without signal goes through
// here: the last copy of each list (lib/cache.ts), the changes waiting to be
// sent (lib/outbox.ts), and small records (the demo's sales, which tours were
// seen…). On the phone it is a SQLite database, "anisense"
// (@capacitor-community/sqlite; its tables are in lib/localdbSql.ts). In a
// browser (development, tests) the same calls use Preferences, which keeps
// them in localStorage, as the app always did there.
//
// The database opens once, on first use. The first time on a phone it also
// moves in whatever the app kept in Preferences before SQLite. If SQLite
// can't open at all, the app carries on with Preferences rather than lose
// its offline copy: worse to stop working than to keep it the old way.
//
// The sign-in session is not here: the sign-in library keeps it in
// Preferences itself (lib/supabase.ts).

import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { LocalStore, OutboxRow, SqlDriver, importOldStore, isSessionKey, migrate, sqlStore } from "./localdbSql";

const DB_NAME = "anisense";

// ── On the phone: the SQLite plugin, behind the driver the SQL expects ──
async function openSqlite(): Promise<SqlDriver> {
  const { CapacitorSQLite, SQLiteConnection } = await import("@capacitor-community/sqlite");
  const sqlite = new SQLiteConnection(CapacitorSQLite);
  // After the app is reloaded the native side may still hold the connection.
  const consistent = (await sqlite.checkConnectionsConsistency().catch(() => ({ result: false }))).result;
  const held = (await sqlite.isConnection(DB_NAME, false)).result;
  const db = consistent && held
    ? await sqlite.retrieveConnection(DB_NAME, false)
    : await sqlite.createConnection(DB_NAME, false, "no-encryption", 1, false);
  await db.open();
  return {
    exec: async sql => { await db.execute(sql, true); },
    run: async (sql, values = []) => { await db.run(sql, values as unknown[], true); },
    all: async <T,>(sql: string, values: unknown[] = []) => ((await db.query(sql, values as unknown[])).values ?? []) as T[],
    batch: async steps => {
      if (steps.length) await db.executeSet(steps.map(s => ({ statement: s.sql, values: (s.values ?? []) as unknown[] })), true);
    },
  };
}

// ── In a browser, or if SQLite can't open: Preferences, keyed as before ──
const OUTBOX_KEY = "outbox_ops";
async function prefsKeys(): Promise<string[]> { return (await Preferences.keys()).keys; }
async function prefsGet(key: string) { return (await Preferences.get({ key })).value; }

export function prefsStore(): LocalStore {
  const readOutbox = async (): Promise<OutboxRow[]> => {
    const value = await prefsGet(OUTBOX_KEY);
    if (!value) return [];
    try { return JSON.parse(value) as OutboxRow[]; } catch { return []; }
  };
  return {
    kvGet: prefsGet,
    kvSet: async (key, value) => { await Preferences.set({ key, value }); },
    kvRemove: async key => { await Preferences.remove({ key }); },
    async cacheGet(key) {
      const value = await prefsGet(`cache_${key}`);
      if (!value) return null;
      try {
        const entry = JSON.parse(value) as { data: unknown; updatedAt: string };
        return { data: JSON.stringify(entry.data), updatedAt: entry.updatedAt };
      } catch { return null; }
    },
    async cacheSet(key, data, updatedAt) {
      await Preferences.set({ key: `cache_${key}`, value: `{"data":${data},"updatedAt":${JSON.stringify(updatedAt)}}` });
    },
    outboxAll: readOutbox,
    async outboxAdd(op) { await Preferences.set({ key: OUTBOX_KEY, value: JSON.stringify([...(await readOutbox()), op]) }); },
    async outboxReplace(ops) { await Preferences.set({ key: OUTBOX_KEY, value: JSON.stringify(ops) }); },
    async removeAccount(accountId) {
      const keys = (await prefsKeys()).filter(k => k.includes(accountId) && !isSessionKey(k));
      await Promise.all(keys.map(key => Preferences.remove({ key })));
    },
  };
}

async function open(): Promise<LocalStore> {
  if (!Capacitor.isNativePlatform()) return prefsStore();
  try {
    const db = await openSqlite();
    await migrate(db);
    await importOldStore(db, { keys: prefsKeys, get: prefsGet, remove: key => Preferences.remove({ key }) });
    return sqlStore(db);
  } catch (err) {
    console.warn("[AniSense] SQLite could not open; keeping data in Preferences.", err);
    return prefsStore();
  }
}

let opening: Promise<LocalStore> | null = null;
/** The store, opened on first use. */
export const localStore = (): Promise<LocalStore> => (opening ??= open());

// ── Small records, by key ──
export const kvGet = async (key: string) => (await localStore()).kvGet(key);
export const kvSet = async (key: string, value: string) => (await localStore()).kvSet(key, value);
export const kvRemove = async (key: string) => (await localStore()).kvRemove(key);
