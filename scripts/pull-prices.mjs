// ─── npm run prices:pull ──────────────────────────────────────────────────────
// Brings data/historical-prices.csv up to date with the database, where the
// prices now go in: the admin website's Prices page. Every price on record
// there (crop_prices, never a sample) becomes a cell of the CSV, so the
// steps after it work from what the admin put in:
//
//   npm run prices      the app's bundled copy, for phones with no signal
//   npm run forecasts   ARIMA and LSTM, trained again
//   npm run seed        supabase/seed.sql, with the new forecasts
//
// (npm run refresh does all four.) Only reads, with the public key in .env,
// the same access a guest has to the price catalog.
//
// The database is the record: a month or a price that differs there replaces
// the CSV's. A variety the database has no prices for at all keeps its
// column as it is in the CSV, with a warning: that is a database not yet
// seeded, not a variety to forget. Add --check to see what would change
// without writing anything.

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const CSV = "data/historical-prices.csv";
const check = process.argv.includes("--check");

if (!existsSync(".env")) {
  console.log("No .env file. Copy .env.example to .env and paste the Project URL and the publishable (anon) key.");
  process.exit(1);
}
const env = Object.fromEntries(
  readFileSync(".env", "utf8").split(/\r?\n/)
    .map(l => l.trim()).filter(l => l && !l.startsWith("#") && l.includes("="))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }),
);
const url = (env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const key = env.VITE_SUPABASE_ANON_KEY || "";
if (!url || !key) { console.log("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be filled in, in .env."); process.exit(1); }

/** Every row of a table, a thousand at a time (the API's most per request). */
async function all(path) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    let res;
    try {
      res = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}`, Range: `${from}-${from + 999}`, "Range-Unit": "items" } });
    } catch (e) {
      console.log(`Couldn't reach ${url}: ${e.message}. Check the internet.`); process.exit(1);
    }
    if (!res.ok) { console.log(`The database said ${res.status} for ${path.split("?")[0]}: ${await res.text()}`); process.exit(1); }
    const page = await res.json();
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}

const records = await all("crop_prices?select=crop_id,price_date,price_per_kg&is_sample=eq.false&order=price_date.asc,crop_id.asc");
if (!records.length) {
  console.log("The database has no prices on record yet. Run seed.sql in Supabase first; the CSV is left as it is.");
  process.exit(1);
}
const groups = await all("crop_groups?select=id,sort_order");
const crops = await all("crops?select=id,group_id,sort_order");
const catalogOrder = (id) => {
  const c = crops.find(x => x.id === id);
  const g = groups.find(x => x.id === c?.group_id);
  return (g?.sort_order ?? 999) * 1000 + (c?.sort_order ?? 999);
};

// What the CSV holds now.
const lines = readFileSync(CSV, "utf8").split(/\r?\n/).filter(l => l.trim());
const [head, ...body] = lines.map(l => l.split(",").map(c => c.trim()));
if (head[0] !== "month") throw new Error(`${CSV}: the first column must be "month"`);
const oldIds = head.slice(1);
const old = new Map();   // "2026-09|rice-special" → 57.2
for (const [month, ...cells] of body) cells.forEach((c, i) => { if (c !== "") old.set(`${month}|${oldIds[i]}`, Number(c)); });

// What the database holds.
const db = new Map();
for (const r of records) db.set(`${String(r.price_date).slice(0, 7)}|${r.crop_id}`, Number(r.price_per_kg));
const dbIds = new Set(records.map(r => r.crop_id));
const kept = oldIds.filter(id => !dbIds.has(id));
const ids = [...oldIds, ...[...dbIds].filter(id => !oldIds.includes(id)).sort((a, b) => catalogOrder(a) - catalogOrder(b))];

const price = (month, id) => (dbIds.has(id) ? db.get(`${month}|${id}`) : old.get(`${month}|${id}`));
const monthsOf = (m) => [...m.keys()].map(k => k.split("|")[0]);
// One row for every month from the first price to the last, a month with no
// price left empty, so the months stay evenly spaced for the forecasts.
const allMonths = [...monthsOf(db), ...monthsOf(old)].sort();
const nextMonth = (ym) => { const [y, m] = ym.split("-").map(Number); return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`; };
const rows = [];
for (let m = allMonths[0]; m <= allMonths[allMonths.length - 1]; m = nextMonth(m)) rows.push(m);

// What changes, said before it is written.
let added = 0, changed = 0, removed = 0;
const newMonths = rows.filter(m => !body.some(([month]) => month === m));
for (const month of rows) for (const id of ids) {
  const before = old.get(`${month}|${id}`), now = price(month, id);
  if (before === undefined && now !== undefined) added++;
  else if (before !== undefined && now === undefined) removed++;
  else if (before !== undefined && Math.abs(before - now) > 0.001) changed++;
}
for (const id of kept) console.log(`  ! ${id}: no prices for it in the database, so its column is kept as it is in the CSV.`);
const newIds = ids.filter(id => !oldIds.includes(id));
if (newIds.length) console.log(`  + new varieties with prices: ${newIds.join(", ")}`);

const out = [`month,${ids.join(",")}`, ...rows.map(month => [month, ...ids.map(id => { const p = price(month, id); return p === undefined ? "" : p.toFixed(2); })].join(","))].join("\n") + "\n";
const summary = `${rows.length} months (${rows[0]} to ${rows[rows.length - 1]}), ${ids.length} varieties. From the database: ${added} prices added${newMonths.length ? ` (new months: ${newMonths.join(", ")})` : ""}, ${changed} changed, ${removed} taken away.`;
if (check) {
  console.log(`${CSV} would have ${summary}\nNothing written (--check).`);
} else {
  writeFileSync(CSV, out);
  console.log(`${CSV}: ${summary}`);
}
