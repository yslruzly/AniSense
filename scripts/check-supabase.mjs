// ─── npm run check:db ─────────────────────────────────────────────────────────
// Checks that the Supabase project in .env is set up the way the app needs,
// without signing anyone up or writing anything: only reads with the public
// key, the same access a signed-out phone has.
//
//   ✓ the key is the public one (never the secret / service_role key)
//   ✓ the project answers
//   ✓ "Confirm email" is OFF (CP-number accounts have no inbox)
//   ✓ the four tables exist (schema.sql ran)
//   ✓ the checkout function exists
//   ✓ the listing-photos bucket exists

import { readFileSync, existsSync } from "node:fs";

const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m, fix) => { console.log(`  ✗ ${m}`); if (fix) console.log(`      → ${fix}`); failures++; };
let failures = 0;

if (!existsSync(".env")) {
  console.log("No .env file yet.\n  → Copy .env.example to .env and paste your Project URL and publishable (anon) key. See SETUP_DATABASE.md, Step 3.");
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
  "Authentication → Sign In / Providers → Email: turn “Confirm email” OFF. (SETUP_DATABASE.md, Step 4)");
if (settings.body?.disable_signup) bad("New sign-ups are disabled", "Authentication → Sign In / Providers: allow new users to sign up.");

// 2. Tables. With no one signed in, row security returns an empty list:
//    that still proves the table is there.
const missing = [];
for (const t of ["profiles", "listings", "expenses", "transactions"]) {
  const r = await get(`/rest/v1/${t}?select=id&limit=1`);
  if (r.status === 200) continue;
  missing.push(`${t} (${r.body?.code || r.status})`);
}
if (missing.length) bad(`Missing tables: ${missing.join(", ")}`, "SQL Editor → paste all of supabase/schema.sql → Run. (Step 2)");
else ok("Tables: profiles, listings, expenses, transactions");

// 3. Checkout function. Signed-out callers are refused, which proves it exists;
//    "not found" means schema.sql hasn't been run (or is the old version).
const rpc = await get("/rest/v1/rpc/place_order", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: [] }),
});
if (rpc.body?.code === "PGRST202" || rpc.status === 404) bad("Checkout function place_order() is missing", "Run the latest supabase/schema.sql again (safe to re-run).");
else ok("Checkout function place_order()");

// 4. Photo bucket. Asking for a file that isn't there says whether the
//    bucket itself exists.
const photo = await fetch(`${url}/storage/v1/object/public/listing-photos/__anisense_check__.jpg`);
let photoMsg = "";
try { photoMsg = JSON.stringify(await photo.json()); } catch { /* empty */ }
if (/bucket not found/i.test(photoMsg)) bad("Storage bucket listing-photos is missing", "Run the latest supabase/schema.sql again (safe to re-run).");
else ok("Storage bucket listing-photos");

console.log(failures
  ? `\n${failures} thing${failures === 1 ? "" : "s"} to fix, then run: npm run check:db\n`
  : "\nAll set. Build the APK:  npm run build  →  npx cap sync android  →  cd android  →  .\\gradlew.bat assembleDebug\n");
process.exit(failures ? 1 : 0);
