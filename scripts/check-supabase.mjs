// ─── npm run check:db ─────────────────────────────────────────────────────────
// Checks that the Supabase project in .env is set up the way the app needs,
// without signing anyone up or writing anything: only reads with the public
// key, the same access a signed-out phone has.
//
//   ✓ the key is the public one (never the secret / service_role key)
//   ✓ the project answers
//   ✓ "Confirm email" is OFF (CP-number accounts have no inbox)
//   ✓ all 16 tables and the price view exist (schema.sql ran)
//   ✓ every database function exists (checkout, farm-record sync, crops,
//     account deletion)
//   ✓ the crop catalog, price records, forecasts and badges are loaded
//     (seed.sql ran)
//   ✓ the listing-photos bucket exists
//   ✓ member numbers: profiles carry the database's member_no
//   ✓ orders after the call: confirm with what it sold for, record what was
//     paid, rate the farmer (the latest schema.sql ran)
//   ✓ (optional) real Gmail codes: the verify-code Edge Function is deployed,
//     open to the app, has its Brevo key, and its table exists
//   ✓ (optional) real CP-number codes: verify-code has its Semaphore key

import { readFileSync, existsSync } from "node:fs";

const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m, fix) => { console.log(`  ✗ ${m}`); if (fix) console.log(`      → ${fix}`); failures++; };
let failures = 0;

if (!existsSync(".env")) {
  console.log("No .env file yet.\n  → Copy .env.example to .env and paste your Project URL and publishable (anon) key. See docs/database-setup.md, Step 3.");
  process.exit(1);
}
const env = Object.fromEntries(
  readFileSync(".env", "utf8").split(/\r?\n/)
    .map(l => l.trim()).filter(l => l && !l.startsWith("#") && l.includes("="))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }),
);
const url = (env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
const key = env.VITE_SUPABASE_ANON_KEY || "";

console.log(`\nChecking ${url || "(no URL)"}\n`);

if (!url || url.includes("YOUR-PROJECT-REF")) bad("VITE_SUPABASE_URL is not filled in", "Project Settings → API → Project URL");
if (!key || key.includes("YOUR-ANON")) bad("VITE_SUPABASE_ANON_KEY is not filled in", "Project Settings → API Keys → the publishable / anon key");
if (failures) process.exit(1);

// The one mistake that must never ship: a key that bypasses every rule.
let secret = key.startsWith("sb_secret_");
if (!secret && key.split(".").length === 3) {
  try { secret = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role === "service_role"; } catch { /* not a JWT */ }
}
if (secret) {
  bad("This is the SECRET (service_role) key. It bypasses all security and must never be in the app.",
    "Replace it with the publishable / anon key, then rotate the secret key in the dashboard.");
  process.exit(1);
}
ok("Public key (safe to ship in the APK)");

const headers = { apikey: key, Authorization: `Bearer ${key}` };
const get = async (path, init = {}) => {
  const res = await fetch(url + path, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  let body = null;
  try { body = await res.json(); } catch { /* empty */ }
  return { status: res.status, body };
};

// 1. Reachable, and how sign-up is configured.
let settings;
try {
  settings = await get("/auth/v1/settings");
} catch (e) {
  bad(`Can't reach the project (${e.message})`, "Check the URL, your internet, and that the project isn't paused (Dashboard → Restore project).");
  process.exit(1);
}
if (settings.status !== 200) {
  bad(`The project answered ${settings.status}`, "Check that the key belongs to this project.");
  process.exit(1);
}
ok("Project is reachable");
if (settings.body?.external?.email === false) bad("Email sign-in is turned off", "Authentication → Sign In / Providers → Email: turn it ON.");
if (settings.body?.mailer_autoconfirm) ok("Confirm email is OFF: people sign up and land on Home");
else bad("Confirm email is ON: CP-number accounts can't finish signing up",
  "Authentication → Sign In / Providers → Email: turn “Confirm email” OFF. (docs/database-setup.md, Step 4)");
if (settings.body?.disable_signup) bad("New sign-ups are disabled", "Authentication → Sign In / Providers: allow new users to sign up.");

// 2. Tables, section by section. With no one signed in, row security returns
//    an empty list: that still proves the table is there. crop_prices is
//    asked only for the columns anyone may read (which admin put a price in
//    is closed), including where a price came from, which the admin
//    website's Prices page added.
const SECTIONS = {
  Catalog: ["crop_groups", "crops", "crop_prices", "crop_prices_latest", "crop_forecasts"],
  Accounts: ["profiles", "profile_crops"],
  Market: ["listings", "orders", "order_items"],
  "Farm records": ["expenses", "sales", "plantings", "price_alerts", "harvest_plans"],
  Rewards: ["achievements", "user_achievements"],
};
const COLUMNS = { crop_prices: "crop_id,price_date,price_per_kg,change_pct,source,entered_at" };
const missing = [];
for (const [section, tables] of Object.entries(SECTIONS)) {
  const gone = [];
  for (const t of tables) {
    const r = await get(`/rest/v1/${t}?select=${COLUMNS[t] ?? "*"}&limit=1`);
    if (r.status !== 200) gone.push(t);
  }
  if (gone.length) missing.push(...gone);
  else ok(`${section}: ${tables.join(", ")}`);
}
if (missing.length) {
  // The first version of the schema had a "transactions" table instead of
  // orders + order_items. Its tables block the new ones: wipe, then rebuild.
  const old = (await get("/rest/v1/transactions?select=*&limit=1")).status === 200;
  bad(`Missing: ${missing.join(", ")}`, old
    ? "This project has the OLD schema. SQL Editor: run supabase/reset.sql, then schema.sql, then seed.sql."
    : "SQL Editor → paste all of supabase/schema.sql → Run. (Step 2)");
}

// 3. Functions. Signed-out callers are refused, which proves each exists;
//    "not found" means schema.sql hasn't been run (or is an older version).
const FUNCTIONS = {
  place_order: { items: [] },
  set_my_crops: { crop_names: [] },
  replace_my_sales: { items: [] },
  replace_my_plantings: { items: [] },
  replace_my_price_alerts: { items: [] },
  replace_my_harvest_plans: { plans: {} },
  delete_my_account: {},
};
const noFn = [];
for (const [fn, args] of Object.entries(FUNCTIONS)) {
  const r = await get(`/rest/v1/rpc/${fn}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(args) });
  if (r.body?.code === "PGRST202" || r.status === 404) noFn.push(fn);
}
if (noFn.length) bad(`Missing functions: ${noFn.join(", ")}`, "Run the latest supabase/schema.sql again (safe to re-run).");
else ok("Functions: checkout, crop list, farm-record sync, and account deletion");

// 3b. The admin website (schema.sql section 11): its functions are there,
//     closed to anyone signed out, and which admin put a price in can't be read.
const ADMIN_FUNCTIONS = {
  is_admin: {}, admin_overview: {}, admin_users: {}, admin_price_board: {},
  admin_set_prices: { p_month: "2000-01-01", p_prices: {} }, admin_set_award: { p_user: "00000000-0000-0000-0000-000000000000", p_badge: "x", p_on: false },
};
const noAdmin = [], openAdmin = [];
for (const [fn, args] of Object.entries(ADMIN_FUNCTIONS)) {
  const r = await get(`/rest/v1/rpc/${fn}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(args) });
  if (r.body?.code === "PGRST202" || r.status === 404) noAdmin.push(fn);
  else if (r.status === 200 || r.status === 204) openAdmin.push(fn);
}
const enteredBy = await get("/rest/v1/crop_prices?select=entered_by&limit=1");
if (noAdmin.length) bad(`Admin website: missing ${noAdmin.join(", ")}`, "Run the latest supabase/schema.sql again (safe to re-run).");
else if (openAdmin.length) bad(`Admin website: ${openAdmin.join(", ")} answered someone signed out`, "Run the latest supabase/schema.sql again: it closes them.");
else if (enteredBy.status === 200) bad("Admin website: anyone can read which admin put a price in", "Run the latest supabase/schema.sql again: it closes that column.");
else ok("Admin website: its functions are there, closed to anyone signed out (Prices, Members, Badges)");

// 3a. Member numbers (2026-00001) on the profiles. Signed out, no row comes
//     back, but asking for the column proves it is there.
const memberCol = await get("/rest/v1/profiles?select=member_no&limit=1");
if (memberCol.status === 200) ok("Member numbers: each profile gets the next one (2026-00001…)");
else bad("Profiles have no member numbers yet", "Run the latest supabase/schema.sql again (safe to re-run): it numbers existing accounts in the order they joined.");

// 3a2. After the call: the farmer's "sold for", the buyer's "paid", and the
//      buyer's stars (2026-10-07). Signed out, the three calls are refused
//      and no row comes back, but both prove the pieces are there.
const AFTER_CALL = {
  confirm_order_item: { p_item: "00000000-0000-0000-0000-000000000000", p_sold: 1 },
  record_order_payment: { p_item: "00000000-0000-0000-0000-000000000000", p_paid: 1 },
  rate_order_item: { p_item: "00000000-0000-0000-0000-000000000000", p_stars: 5 },
};
const noAfter = [];
for (const [fn, args] of Object.entries(AFTER_CALL)) {
  const r = await get(`/rest/v1/rpc/${fn}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(args) });
  if (r.body?.code === "PGRST202" || r.status === 404) noAfter.push(fn);
}
const lineCols = (await get("/rest/v1/order_items?select=sold_amount,paid_amount,confirmed_at,rating,rated_at&limit=1")).status === 200;
const ratingCount = (await get("/rest/v1/profiles?select=rating_count&limit=1")).status === 200;
if (noAfter.length || !lineCols || !ratingCount)
  bad(`Orders after the call are not set up yet${noAfter.length ? ` (missing: ${noAfter.join(", ")})` : ""}${!lineCols ? " (order_items has no sold/paid/rating columns)" : ""}${!ratingCount ? " (profiles has no rating_count)" : ""}`,
    "SQL Editor → paste all of the latest supabase/schema.sql over your saved query → Run (safe to re-run).");
else ok("Orders after the call: confirm with what it sold for, record what was paid, rate the farmer");

// 3b. Starter data. catalog_status() only counts rows, so it answers without
//     an account: were the crops, prices and badges loaded?
const status = await get("/rest/v1/rpc/catalog_status", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
const c = status.body || {};
if (status.status !== 200) bad("Can't read the catalog status", "Run the latest supabase/schema.sql again (safe to re-run).");
else if (!c.crop_groups || !c.crops || !c.prices || !c.badges)
  bad(`Starter data missing (crop groups ${c.crop_groups ?? 0}, varieties ${c.crops ?? 0}, prices ${c.prices ?? 0}, badges ${c.badges ?? 0})`,
    "SQL Editor → paste all of supabase/seed.sql → Run.");
else if (!c.forecasts || !c.price_records)
  bad(`Price records or forecasts missing (price records ${c.price_records ?? 0}, forecasts ${c.forecasts ?? 0})`,
    "Run the latest supabase/schema.sql, then supabase/seed.sql again (both safe to re-run).");
else ok(`Starter data: ${c.crop_groups} crop groups, ${c.crops} varieties, ${c.price_records} price records, ${c.forecasts} forecasts, ${c.badges} badges`);

// 4. Photo bucket. Asking for a file that isn't there says whether the
//    bucket itself exists.
const photo = await fetch(`${url}/storage/v1/object/public/listing-photos/__anisense_check__.jpg`);
let photoMsg = "";
try { photoMsg = JSON.stringify(await photo.json()); } catch { /* empty */ }
if (/bucket not found/i.test(photoMsg)) bad("Storage bucket listing-photos is missing", "Run the latest supabase/schema.sql again (safe to re-run).");
else ok("Storage bucket listing-photos");

// 5. Real Gmail and CP-number codes (optional). Without the function the app keeps its
//    on-screen demo code, so this is a note, not a failure, until it is
//    deployed; once it is, anything half-done is a failure.
const note = (m, fix) => { console.log(`  ! ${m}`); if (fix) console.log(`      → ${fix}`); };
const fn = await fetch(`${url}/functions/v1/verify-code`, {
  method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ action: "ping" }),
}).catch(() => null);
let fb = null;
try { fb = fn ? await fn.json() : null; } catch { /* empty */ }
if (!fn || fn.status === 404) note("Gmail codes are still the on-screen demo: the verify-code function isn't deployed", "Optional. docs/database-setup.md, Step 7 (Brevo).");
else if (fn.status === 401) bad("verify-code is deployed, but \"Enforce JWT verification\" is ON", "Edge Functions → verify-code → Details → turn Enforce JWT verification OFF → Save.");
else if (!fb?.ok) bad(`verify-code answered with an error (${fn.status})`, "Edge Functions → verify-code → Logs.");
else if (!fb.table) bad("verify-code can't find its table", "Run the latest supabase/schema.sql again (safe to re-run).");
else if (!fb.email) bad("verify-code has no Brevo key", "Edge Functions → Secrets: add BREVO_API_KEY and BREVO_SENDER_EMAIL.");
else ok("Gmail codes: verify-code is deployed and sends through Brevo");
// Texts to CP numbers: optional too, and a note until the key is in. An older
// verify-code (before texts) does not say at all.
if (fn?.ok && fb?.ok && fb.table) {
  if (fb.sms === undefined) note("CP-number codes: this verify-code is the older one, without texts", "Deploy the new supabase/functions/verify-code/index.ts (docs/database-setup.md, Step 8).");
  else if (!fb.sms) note("CP-number codes are still the on-screen demo: no Semaphore key", "Optional. docs/database-setup.md, Step 8 (Semaphore).");
  else ok("CP-number codes: verify-code texts through Semaphore");
}

console.log(failures
  ? `\n${failures} thing${failures === 1 ? "" : "s"} to fix, then run: npm run check:db\n`
  : "\nAll set. Build the APK:  npm run build  →  npx cap sync android  →  cd android  →  .\\gradlew.bat assembleDebug\n");
process.exit(failures ? 1 : 0);
