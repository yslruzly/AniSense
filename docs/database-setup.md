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
| Crop catalog, price records and forecasts | Yes: every screen shows the database's newest prices, their history and the forecasts |
| Achievements | Yes: Newbie, First harvest and First sale are awarded by the database itself; Farmer of the Month and Year can be granted from the dashboard |
| Deleting an account | Yes: from Profile in the app, or from the web page in `site/` (see "Before the Play Store") |

Without `.env` the app runs exactly as before on the built-in sample data, so
an APK built without keys still works for demos.

**Still kept on the phone only:** the ID photo, and which achievements have
already been celebrated. **Still sample data:** weather, the prices of the 19
varieties with no records, and the farmer's order alerts (two invented orders,
shown in the demo only; a real account sees none until that feature is
connected to the database).

The database is organized in five sections (catalog, accounts, market, farm
records, rewards). The table diagram and what each table holds are in
`supabase/README.md`.

It takes about 15 minutes. You need Steps 1 to 6. Step 7 (real codes by
email, through Brevo) is optional and takes another 15 minutes.

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
   This creates the 17 tables, the security rules, the functions (checkout,
   sign-up, farm-record sync, badges) and the `listing-photos` storage bucket.
2. **New query** again. Open `supabase/seed.sql`, copy all of it, paste,
   **Run**. This fills the catalog: 10 crop types, 23 varieties, 320 monthly
   price records for the study's five varieties (January 2021 to September
   2026), one sample price for each of the other 18 varieties, 30 forecasts
   and the 6 badges.

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
- all 16 tables the app reads exist, section by section (the 17th, for codes,
  is checked through the function in Step 7)
- every database function exists
- the catalog, the price records and the forecasts are loaded (seed.sql ran)
- the photo bucket exists
- whether real Gmail codes are set up (Step 7): a `!` note until they are

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

## Step 7 (optional): Real codes for Gmail, through Brevo

Without this step, the 6-digit codes on Create account and Forgot password
are a demo: the app makes them itself and shows them on screen. With it,
**Gmail** accounts get a real code by email, and Forgot password really
changes a Gmail account's password. CP numbers keep the demo code for
sign-up until Semaphore is connected (Step 8), and Forgot password for a CP
number says it is not ready yet, rather than pretending.

How it works: a small server function in your Supabase project,
`supabase/functions/verify-code/index.ts`, makes each code, keeps it on the
server, emails it through Brevo, checks it, and sets the new password. The
code never reaches the phone before the person types it.

**A. Brevo (free, 300 emails a day)**

1. Sign up at https://www.brevo.com.
2. **Senders, Domains & Dedicated IPs → Senders → Add a sender.** Name:
   `AniSense`. Email: the address the codes come from, e.g.
   `AniSense2026@gmail.com`. Brevo emails that address a link: open it to
   verify the sender.
3. **SMTP & API → API Keys → Generate a new API key.** Name it `anisense`.
   Copy it now: Brevo shows it only once. Keep it to yourself; it goes only
   into Supabase (B2), never into the app or GitHub.

**B. Supabase**

1. **SQL Editor:** run `supabase/schema.sql` again (all of it). It adds the
   `verification_codes` table, which only the function can read, and is safe
   to re-run.
2. **Edge Functions → Secrets → Add new secret**, three times:
   | Name | Value |
   |---|---|
   | `BREVO_API_KEY` | the key from A3 |
   | `BREVO_SENDER_EMAIL` | the sender from A2, e.g. `AniSense2026@gmail.com` |
   | `BREVO_SENDER_NAME` | `AniSense` |
3. **Edge Functions → Deploy a new function → Via Editor.** Name it exactly
   `verify-code`. Replace the sample code with all of
   `supabase/functions/verify-code/index.ts`, then **Deploy function**.
4. Open the function → **Details** (or Settings) → turn **Enforce JWT
   verification** OFF → **Save**. The app asks for a code before anyone has
   an account, so the function has to accept the app's publishable key.
   (The function protects itself: at most one code every 30 seconds and 5 an
   hour for each address.)

**C. Check it**

```
npm run check:db
```

The last line should read `✓ Gmail codes: verify-code is deployed and sends
through Brevo`. Then rebuild the APK (Step 6) and try Create account with
your own Gmail: the code arrives by email, and no gold "Demo" note appears.

If no email arrives:
- Look in **Spam**. Mail sent through Brevo from a Gmail address is often
  filtered at first; marking one as "Not spam" helps. For a public release,
  a domain of your own (e.g. `anisense.ph`) verified in Brevo fixes this.
- In Brevo, **Transactional → Logs** shows each email and what happened.
- Brevo may block requests from addresses it doesn't know and email you
  about it. Supabase's servers change address, so under **Security →
  Authorised IPs**, turn the blocking off.
- In Supabase, **Edge Functions → verify-code → Logs** shows the function's
  own errors.

## Step 8 (optional): Real codes for CP numbers, through Semaphore

Needs Step 7 first (the same function sends both). Without this step a CP
number gets the on-screen demo code on Create account, and Forgot password
says it is not ready. With it, the code arrives **by text**, and Forgot
password really changes a CP-number account's password.

Each text costs credits, so the function guards them: one code every 30
seconds and 5 an hour for each number, and at most 100 numbers an hour in
all (change it with the `SMS_MAX_PER_HOUR` secret).

**A. Semaphore** (https://semaphore.co)

1. **Credits.** Semaphore is prepaid: buy credits in the dashboard. The
   codes go out on Semaphore's OTP route, which reaches phones ahead of bulk
   texts and costs more credits per text than a normal message: see their
   pricing page. A small top-up is enough to start.
2. **Sender name (recommended).** Under **Sender Names**, ask for
   `AniSense` (11 characters at most). Semaphore reviews it, which can take
   a few days. Until it is approved, texts come from Semaphore's own name
   and still work.
3. **API key.** In the dashboard's account / API page, copy your API key.
   Keep it to yourself; it goes only into Supabase (B1), never into the app
   or GitHub.

**B. Supabase**

1. **Edge Functions → Secrets → Add new secret:**
   | Name | Value |
   |---|---|
   | `SEMAPHORE_API_KEY` | the key from A3 |
   | `SEMAPHORE_SENDER_NAME` | `AniSense`, **only once Semaphore has approved it** (a name it hasn't approved makes it refuse every text) |
2. **Deploy the new function code.** Edge Functions → **verify-code** →
   **Code** → replace everything with the latest
   `supabase/functions/verify-code/index.ts` → **Deploy**. Leave **Enforce
   JWT verification** OFF.
3. Rebuild the APK (Step 6): the app has to know to ask the server for
   CP-number codes too.

**C. Check it**

```
npm run check:db
```

It should end with `✓ CP-number codes: verify-code texts through
Semaphore`. Then try Create account with your own CP number: the code
arrives by text, and no gold "Demo" note appears. Forgot password with a
CP-number account now works too.

If no text arrives:
- In Semaphore, the dashboard's message log shows each text and its status
  (sent, pending, failed), and whether credits ran out.
- In Supabase, **Edge Functions → verify-code → Logs**: "Semaphore did not
  send the text" is followed by Semaphore's own reason.
- The app says "We couldn't send the code" when Semaphore refused it, and
  "too many codes" when the hourly limit was reached.

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
- [ ] Prices shows the same numbers as the newest rows in **crop_prices** (Special Rice ₱57.20 for September 2026), and a crop's chart shows its forecast from **crop_forecasts**
- [ ] Change the newest price of a variety in **crop_prices**, reopen Prices: the app shows the new price
- [ ] Add next month's row for Special Rice (dated the 1st), reopen Prices: the new month is the price shown, and the chart gains it
- [ ] Airplane mode, posting a listing or checking out: a clear "No internet" message, and the cart is kept
- [ ] Profile → Manage account → Delete my account, as a buyer who has ordered: the buyer disappears from **Authentication → Users** and **profiles**; the order stays in **orders** with an empty `buyer_id`, and the farmer still sees the sale
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
Both are in `site/`:

- `site/privacy-policy.html` is generated from the same text the app shows
  (`src/data/privacyPolicy.ts`). After editing the policy, run
  `node scripts/build-privacy.mjs` to rewrite the page.
- `site/delete-account.html` is the deletion page.

1. Open `site/config.js` and fill in the Project URL, the **publishable** key
   (the same two values as `.env`) and a support email address.
2. Put the `site/` folder online, on Vercel (free, works with a private
   repository): vercel.com → **Add New → Project** → this repository →
   **Root Directory: `site`**, no build command → **Deploy**. Every push to
   `main` publishes it again. Add your own domain later under the project's
   **Settings → Domains**.
3. In Play Console, paste the two addresses:
   - `https://<your-domain>/privacy-policy` under **App content → Privacy
     policy**
   - `https://<your-domain>/delete-account` under **App content → Data
     safety → Delete account URL**

The policy is a draft. Have a lawyer or a data protection officer read it
before the release.

## Good to know

- Free projects **pause after 7 days with no activity**. If sign-in suddenly
  fails for everyone, open the dashboard and press **Restore project**.
- Two accounts on one phone never see each other's saved data. Offline
  changes wait for the account that made them.
- Do NOT add the `READ_SMS` permission for code autofill; Google Play rejects it.

## Later (optional)

**Verify Gmail sign-ups with a 6-digit code.** Step 7 above. Keep
**Confirm email** OFF: the codes come from the verify-code function, not
from Supabase's own confirmation email.

**Verify CP numbers by SMS.** Step 8 above (Semaphore). It costs per text,
so keep an eye on the credits in Semaphore's dashboard.

**Add a new month of prices.** See "Everyday admin" in `supabase/README.md`.
