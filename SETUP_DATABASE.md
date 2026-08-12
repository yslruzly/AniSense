# AniSense — Database & Auth Setup Guide

Everything is scaffolded and compiles already. Follow these steps in order when
you're ready to go live. The app keeps working with mock data until Step 7,
so you can do Steps 1–6 without breaking anything.

**What's already done for you:**

| File | What it is |
|---|---|
| `supabase/schema.sql` | All tables, security rules, and the signup trigger |
| `src/lib/supabase.ts` | The Supabase client (with Android-safe session storage) |
| `src/services/auth.ts` | Signup, email code, SMS code, sign-in, profile |
| `src/services/listings.ts` | Marketplace CRUD (reads cached for offline) |
| `src/services/expenses.ts` | Expense tracker CRUD — works FULLY offline |
| `src/services/transactions.ts` | Checkout + purchase history (history cached) |
| `src/lib/cache.ts` | Offline read cache (network-first, cache-fallback) |
| `src/lib/outbox.ts` | Offline write queue (changes made offline sync later) |
| `src/services/sync.ts` | Auto-sync: drains the outbox when back online |
| `src/hooks/useOutboxCount.ts` | Live "N changes waiting to sync" count for a badge |
| `.env.example` | Template for your project keys |

Packages `@supabase/supabase-js` and `@capacitor/preferences` are already installed.

---

## Step 1 — Create the Supabase project (~5 min)

1. Go to https://supabase.com → sign in with GitHub or Google (free, no card).
2. **New project** → name it `anisense`, set a strong database password
   (save it somewhere — you rarely need it but losing it is a pain).
3. Region: pick **Southeast Asia (Singapore)** — closest to the Philippines.
4. Wait ~2 minutes while it provisions.

## Step 2 — Create the tables

1. In the dashboard sidebar: **SQL Editor → New query**.
2. Open `supabase/schema.sql` from this repo, copy ALL of it, paste, **Run**.
3. You should see "Success. No rows returned". Check **Table Editor** —
   you should now have `profiles`, `listings`, `expenses`, `transactions`.

## Step 3 — Connect the app to your project

1. Dashboard → **Project Settings → API**.
2. Copy the **Project URL** and the **anon / public** key
   (⚠️ NOT the `service_role` key — that one bypasses all security and must
   never be in the app).
3. In this repo: copy `.env.example` → rename the copy to `.env` → paste both values.
4. Restart `npm run dev`. The console warning "Supabase is not configured"
   should be gone.

## Step 4 — Email verification with a 6-digit code

By default Supabase emails a *link*. You want a *code* (better for a mobile app —
no browser redirect needed):

1. Dashboard → **Authentication → Email Templates → Confirm signup**.
2. Replace the template body with something like:

   ```html
   <h2>Welcome to AniSense! 🌾</h2>
   <p>Your verification code is:</p>
   <h1 style="letter-spacing: 6px;">{{ .Token }}</h1>
   <p>This code expires in 1 hour. Ani mo, alam mo.</p>
   ```

   `{{ .Token }}` is the 6-digit code — that's the whole trick.
3. **Authentication → Sign In / Up → Email**: make sure "Confirm email" is ON.

**Sending limits:** Supabase's built-in mailer only sends ~2 emails/hour — fine
for your own testing, useless for real users. When you need more, plug in your
own SMTP under **Project Settings → Auth → SMTP Settings**:

- **Gmail (quick, free, demo-grade):** Google Account → Security → 2-Step
  Verification → App passwords → generate one. SMTP host `smtp.gmail.com`,
  port `465`, username = your Gmail, password = the app password.
  Limit ~100–150 emails/day, and Google may throttle you. OK for a defense/demo.
- **Resend or Brevo (recommended for launch):** free tiers (~100–300 emails/day),
  built for exactly this, 10-minute setup, much better deliverability.

## Step 5 — Phone number verification (SMS)

SMS always costs money (carriers charge per text), so this is the only step
with a bill attached. Two options:

**Option A — Twilio (easiest):**
1. Create a account at https://twilio.com → get a trial number.
2. Supabase dashboard → **Authentication → Sign In / Up → Phone** → enable,
   choose Twilio, paste your Account SID, Auth Token, and Twilio phone number.
3. ⚠️ Trial accounts can ONLY text numbers you verify in the Twilio console
   first — perfect for development, add your own number there.
4. Going live: ~₱2–3 per SMS to PH numbers.

**Option B — Semaphore (Philippine provider, ~₱0.50/SMS):**
Cheaper for PH but not a built-in Supabase integration — you connect it via a
"Send SMS hook" (Supabase dashboard → Authentication → Hooks) pointing at a
small Edge Function that calls Semaphore's API. Do this later if SMS volume
gets expensive; start with Twilio.

**Or defer it:** skip this step entirely for now — the code in
`src/services/auth.ts` is ready, and email verification alone is enough to
launch. The phone number just stays as unverified profile info.

## Step 6 — Try it from the SQL editor

Before touching the app, sanity-check in **Authentication → Users**: nothing
there yet. Then after your first real signup (Step 7) you should see the user
appear here AND a matching row in **Table Editor → profiles** (created by the
trigger automatically).

## Step 7 — Wire the services into the screens

This is the coding part. Each service function maps to one spot in the UI:

### `src/screens/auth/AuthFormScreen.tsx`
- `submit()` — replace the `setTimeout(...)` fake with:
  - signup flow → `await signUpWithEmail({ name, role, email: contact, password })`
    then show a **new "enter the code" step** (add `"verify"` to the `step` state,
    render 6 inputs or one input, then `await verifyEmailCode(contact, code)`).
  - signin flow → `await signInWithPassword` via `signInWithEmail(contact, password)`.
  - wrap in try/catch and put `err.message` into the existing `setError(...)`.
- `finishCrops()` — after verification succeeds, save the extra steps:
  `await updateMyProfile({ years_farming: Number(farmYears), location: farmLocation, phone: farmPhone, crops: selectedCrops })`.
- Phone verification (optional): after they enter the CP number, call
  `sendPhoneCode(farmPhone)` → new code input → `verifyPhoneCode(farmPhone, code)`.
  On the code `<input>`, add `autocomplete="one-time-code"` so Android
  auto-fills the SMS code.

### `src/App.tsx`
- On mount: `getSession()` + `onAuthChange(...)` in a `useEffect` — replace the
  `isAuthed` mock. If a session exists, `getMyProfile()` →
  `toFarmerProfile(row, session.user.email)` → `setFarmerProfile`, set role
  from `row.role`, skip the auth screens.
- Same `useEffect`: start offline auto-sync → `useEffect(() => initAutoSync(), [])`
  (from `src/services/sync.ts`).
- `handleSignOut` → also `await signOut()`.

### `src/screens/ExpensesScreen.tsx`
- `useState([...EXPENSES])` → start empty, then in a `useEffect`:
  ```ts
  const { data, fromCache } = await fetchExpenses();
  setTransactions(data);   // fromCache === true → you're offline, banner time
  ```
- `saveForm()` → `addExpense(...)` / `updateExpense(editId, ...)` — these work
  even offline (queued + synced automatically), so no special handling needed.
- `deleteEntry()` → `deleteExpense(id)` — also offline-safe.
- Optional badge: `const pending = useOutboxCount();` → show
  "⏳ {pending} waiting to sync" when `pending > 0`.

### `src/screens/TradeScreen.tsx`
- `useState([...LISTINGS])` → `useEffect` → `const { data, fromCache } = await fetchListings()`.
  Offline buyers can still browse the cached listings (read-only).
- `saveForm()` → `createListing(...)` / `updateListing(editId, ...)` — these
  are online-only and throw a friendly message when offline; show it via the
  existing `setFormError(err.message)`.
- `deleteListing()` → `removeListing(id)` (online-only, same handling).
- `handleCheckout()` → `try { await checkout(cart) } catch (err) { /* show message */ }`
  before clearing the cart — checkout requires a connection by design.
- Buyer purchase history (passed to ExpensesScreen) → `fetchMyPurchases()`.

### `src/screens/ProfileScreen.tsx`
- `save()` → also `updateMyProfile({ full_name: draft.name, location: draft.location, crops: draft.crops, ... })`.

## Step 8 — Offline support (ALREADY BUILT — just know how it works)

The offline layer is implemented; you don't need to write it. How it behaves:

| Feature | Offline behavior |
|---|---|
| Listings, purchase history | Cached automatically — `fromCache: true` tells the UI to show the "as of {time}" banner |
| Expenses | Full add/edit/delete offline; changes queue in the outbox and sync when back online |
| Posting/editing listings, checkout | Online-only — throws a friendly message to display |
| Login (existing session) | Works offline (session lives in native storage) |

The moving parts:
- `src/lib/cache.ts` — every successful fetch is saved to native storage;
  failed fetches fall back to the saved copy.
- `src/lib/outbox.ts` — offline writes are queued in order. Expenses created
  offline get temporary `local-...` ids; when synced, the real database ids
  replace them everywhere (even in queued edits/deletes of that same row).
- `src/services/sync.ts` — `initAutoSync()` (you wire this in App.tsx, Step 7)
  drains the queue on app start and whenever the device comes back online.
- `src/hooks/useOutboxCount.ts` — live pending-changes count for a sync badge.

The only wiring needed is what's already listed in Step 7: `initAutoSync()` in
App.tsx and using `fromCache` for the banner.

## Step 9 — Ship to Android

Nothing Supabase-specific is needed in the Android project (it's all HTTPS),
just the normal Capacitor cycle:

```
npm run build
npx cap sync android
npx cap open android   # then Run ▶ in Android Studio
```

Notes:
- `.env` values are baked in at `npm run build` time — rebuild after changing them.
- Sessions persist natively (already handled via `@capacitor/preferences` in
  `src/lib/supabase.ts`) — users stay logged in across app restarts.
- Do NOT add `READ_SMS` permission for OTP autofill — Google Play rejects it.
  The `autocomplete="one-time-code"` attribute is the safe route.

## Step 10 — Test checklist

- [ ] Sign up as a farmer → code arrives in Gmail → correct code logs you in
- [ ] Wrong code shows an error, "resend" sends a fresh one
- [ ] Profile row auto-appears in Supabase Table Editor with name + role
- [ ] Farm details + crops from signup show on the Profile screen after re-login
- [ ] Farmer posts a listing → visible when logged in as a buyer account
- [ ] Farmer A cannot edit farmer B's listing (RLS working)
- [ ] Buyer checkout → rows in `transactions` → appear in buyer's history
- [ ] Expenses are private: two farmer accounts see only their own
- [ ] Kill the app, reopen → still logged in
- [ ] Airplane mode → app opens with cached data, no crash
- [ ] Airplane mode → add/edit an expense → appears in the list instantly →
      turn internet back on → row shows up in Supabase Table Editor by itself
- [ ] Airplane mode → try to post a listing / checkout → friendly error, no crash
