# AniSense: Supabase setup

The app side is finished. Once a `.env` with your project's keys is in place
and the APK is rebuilt, AniSense runs on the database:

| What | On the database |
|---|---|
| Sign up, sign in, stay signed in, sign out | Yes, CP number or Gmail, farmer or buyer |
| Profile edits | Yes, saved to the account, so they follow it to any phone |
| Marketplace listings | Yes: post, edit and remove, with the farmer's photo uploaded to Storage |
| Seller profiles and Featured farmers | Yes, built from the farmers who have something for sale |
| Checkout | Yes, all or nothing: stock is checked and lowered, the price comes from the listing |
| Buyer's purchases (Home and history) | Yes |
| Farmer's expenses | Yes, and they also work offline, syncing when the signal returns |
| Farmer's marketplace sales | Yes, counted in the profit figures automatically |
| Sales typed in, crop tracker, price alerts, expected harvests | Yes, and they work offline too |
| Crop catalog and today's prices | Yes: every screen shows the database's newest prices |
| Achievements | Yes: Newbie, First harvest and First sale are awarded by the database itself; Farmer of the Month and Year can be granted from the dashboard |
| Deleting an account | Yes: from Profile in the app, or from the web page in `docs/` (see "Before the Play Store") |

Without `.env` the app runs exactly as before on the built-in sample data, so
an APK built without keys still works for demos.

**Still kept on the phone only:** the ID photo, and which achievements have
already been celebrated. **Still built in:** weather and the price forecasts.

The database is organized in five sections (catalog, accounts, market, farm
records, rewards). The table diagram and what each table holds are in
`supabase/README.md`.

It takes about 15 minutes. You need Steps 1 to 6.

---

## Step 1: Create the project

1. Go to https://supabase.com and sign in with GitHub or Google (free, no card).
2. **New project**. Name: `anisense`. Set a strong database password and keep
   it somewhere safe.
3. Region: **Southeast Asia (Singapore)**, the closest to the Philippines.
4. Wait about 2 minutes while it sets up.

## Step 2: Create the tables, then fill the catalog

Two files, in this order, each in its own query:

1. Sidebar: **SQL Editor → New query**. Open `supabase/schema.sql`, copy
   **all** of it, paste, **Run**. You should see "Success. No rows returned".
   This creates the 15 tables, the security rules, the functions (checkout,
   sign-up, farm-record sync, badges) and the `listing-photos` storage bucket.
2. **New query** again. Open `supabase/seed.sql`, copy all of it, paste,
   **Run**. This fills the catalog: 10 crop types, 24 varieties, today's
   prices and the 6 badges.

Both are safe to run again. If anything went wrong, or a file changes later,
just paste and run it again.

> Ran an older version of `schema.sql` before (it had a `transactions`
> table)? Run `supabase/reset.sql` first, then both files. It deletes all
> AniSense data, so only do it before real people use the app.

## Step 3: Turn off "Confirm email"

CP-number accounts have no inbox to confirm, and Supabase's free mailer only
sends a couple of emails an hour.

1. **Authentication → Sign In / Providers → Email**.
2. Turn **Confirm email** OFF and save. Leave the Email provider itself ON,
   because CP-number accounts use it underneath.

> A CP number is stored as a login address nobody types, such as
> `639171234567@phone.anisense.app`, with the real number on the profile.
> You'll see these under **Authentication → Users**; that's expected. The
> number isn't verified by SMS, which is fine for a study. See "Later" below.

## Step 4: Put the keys in the app

1. **Project Settings → API Keys**.
2. Copy the **Project URL** and the **publishable** key (`sb_publishable_…`).
   On older dashboards this is the key labelled **anon / public**.
   ⚠️ Never the **secret** / `service_role` key. It bypasses every security
   rule and must never be in the app.
3. In this project, copy `.env.example` to a new file named `.env` and paste
   both values:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxx
   ```
   `.env` is gitignored; it never goes to GitHub.

## Step 5: Check it

```
npm run check:db
```

This reads your project with the public key, without creating anything, and
checks that:

- the key is the public one
- the project answers
- Confirm email is off
- all 15 tables exist, section by section
- every database function exists
- the catalog is filled (seed.sql ran)
- the photo bucket exists

Anything wrong is listed with its fix.

## Step 6: Build the APK

The keys are baked in when the app is built, so rebuild after adding `.env`:

```
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

The APK is at `android/app/build/outputs/apk/debug/app-debug.apk`.
**An APK built before `.env` existed still uses the sample data.**

---

## Test checklist

- [ ] Sign up as a farmer with a CP number: you land on Home, a row appears in **Table Editor → profiles**, their crops in **profile_crops**, and the Newbie badge in **user_achievements**
- [ ] Close and reopen the app: still signed in
- [ ] Farmer posts a harvest with a photo: it appears in **listings**, the photo in **Storage → listing-photos**, and the First harvest pop-up shows
- [ ] Sign up as a buyer on another phone: the farmer's harvest is in the marketplace, and the farmer is under Featured farmers
- [ ] Buyer orders 5 kg: the receipt shows, the listing drops by 5 kg, and a row appears in **orders** with its line in **order_items**
- [ ] Buyer asks for more kilos than are left: "A farmer has less left than you asked for"
- [ ] Buyer's Home shows the order under Your purchases
- [ ] Farmer's Profit snapshot counts the sale
- [ ] Farmer adds an expense in airplane mode: it shows at once; turn the internet back on and it appears in **expenses**
- [ ] Two farmer accounts each see only their own expenses
- [ ] Farmer records a sale, adds a planting and a price alert: rows appear in **sales**, **plantings** and **price_alerts**; they are still there after reinstalling the app
- [ ] Change a price in **crop_prices** (today's row), reopen Prices: the app shows the new price
- [ ] Airplane mode, posting a listing or checking out: a clear "No internet" message, and the cart is kept
- [ ] Profile → Delete my account, as a buyer who has ordered: the buyer disappears from **Authentication → Users** and **profiles**; the order stays in **orders** with an empty `buyer_id`, and the farmer still sees the sale
- [ ] Delete my account, as a farmer with a listing photo: their rows are gone from **listings**, **expenses**, **sales**, and their folder is gone from **Storage → listing-photos**

## How the security works

The public key in the app is safe because every rule is enforced by the
database itself (Row Level Security in `schema.sql`), not by the app:

- Nothing is readable by someone who is not signed in.
- A farmer can only change their own listings and see their own expenses.
- A buyer's phone number is visible only to farmers they have ordered from.
- Nobody can edit their own rating or sales count.
- Orders can only be created through `place_order()`, which takes the price
  from the listing and refuses to sell more than is left.
- Photos can only be uploaded into the uploader's own folder.
- Anyone can delete their own account, and only their own. Orders stay in the
  other person's history with the name removed.

## Before the Play Store

Google Play asks every app with accounts for two web addresses: a privacy
policy, and a page where someone can delete their account without the app.
Both are in `docs/`:

- `docs/privacy-policy.html` is generated from the same text the app shows
  (`src/data/privacyPolicy.ts`). After editing the policy, run
  `node scripts/build-privacy.mjs` to rewrite the page.
- `docs/delete-account.html` is the deletion page.

1. Open `docs/config.js` and fill in the Project URL, the **publishable** key
   (the same two values as `.env`) and a support email address.
2. Put the `docs/` folder online. The simplest way is GitHub Pages: in the
   repository, **Settings → Pages → Deploy from a branch → `main` / `docs`**.
   The page is then at `https://<your-username>.github.io/<repository>/delete-account.html`.
   (GitHub Pages needs a public repository on the free plan; Netlify and
   Cloudflare Pages host a folder for free from a private one.)
3. In Play Console, paste the two addresses:
   - `…/privacy-policy.html` under **App content → Privacy policy**
   - `…/delete-account.html` under **App content → Data safety → Delete
     account URL**

The policy is a draft. Have a lawyer or a data protection officer read it
before the release.

## Good to know

- Free projects **pause after 7 days with no activity**. If sign-in suddenly
  fails for everyone, open the dashboard and press **Restore project**.
- Two accounts on one phone never see each other's saved data. Offline
  changes wait for the account that made them.
- Do NOT add the `READ_SMS` permission for code autofill; Google Play rejects it.

## Later (optional)

**Verify Gmail sign-ups with a 6-digit code.** The app already has the code
screen.

1. **Authentication → Email Templates → Confirm signup**: put `{{ .Token }}`
   in the body.
2. Turn **Confirm email** back ON.

CP-number sign-ups are then asked to use Gmail instead. For more than a few
emails an hour, add SMTP (Resend, Brevo, or a Gmail app password) under
**Project Settings → Auth → SMTP Settings**.

**Verify CP numbers by SMS.** This costs per text. The easiest route is
Twilio: **Authentication → Sign In / Providers → Phone**, then paste the
Twilio details. Semaphore is cheaper in the Philippines, but needs a small
Edge Function as a "Send SMS hook". `sendPhoneCode` and `verifyPhoneCode` in
`src/services/auth.ts` are ready for it.
