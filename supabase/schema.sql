-- ═══════════════════════════════════════════════════════════════════════════
--  AniSense database
--
--  Run order (Dashboard → SQL Editor → New query → paste → Run):
--    1. supabase/schema.sql   ← this file: every table, rule and function
--    2. supabase/seed.sql     ← the crop catalog, today's prices, the badges
--
--  Safe to run again. Tables are created only if missing, and every rule and
--  function is replaced, so re-running after an edit fixes things up. (To
--  start completely fresh during development, run supabase/reset.sql first.)
--
--  The database in five sections (diagram: supabase/README.md):
--
--    0. Types          the fixed lists: roles, crop families, statuses
--    1. Catalog        crop_groups ─< crops ─< crop_prices   (+ crop_prices_latest)
--                                           └─< crop_forecasts
--    2. Accounts       profiles ─< profile_crops >─ crop_groups   (+ member_counters)
--    3. Market         listings ─< order_items >─ orders
--    4. Farm records   expenses · sales · plantings · price_alerts · harvest_plans
--    5. Rewards        achievements ─< user_achievements
--
--  followed by
--    6. Security       row level security: who may read and change what
--    7. Functions      sign-up, checkout, farm-record sync, badges
--    8. Storage        listing photos
--    9. Codes          6-digit codes, kept for the verify-code function
--   10. Passwords      each account's old passwords, so none is used twice
--   11. Admin          the admin website's accounts and what it may read
-- ═══════════════════════════════════════════════════════════════════════════


-- ═══ 0. TYPES ════════════════════════════════════════════════════════════════
-- Fixed lists, so a value outside them can never be saved.

do $$ begin create type public.user_role as enum ('farmer', 'buyer');
exception when duplicate_object then null; end $$;

do $$ begin create type public.crop_family as enum ('Crops', 'Vegetables', 'Fruits');
exception when duplicate_object then null; end $$;

do $$ begin create type public.listing_status as enum ('active', 'sold', 'removed');
exception when duplicate_object then null; end $$;

do $$ begin create type public.order_item_status as enum ('placed', 'confirmed', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin create type public.expense_category as enum ('Seeds', 'Fertilizer', 'Labor', 'Equipment', 'Irrigation', 'Other');
exception when duplicate_object then null; end $$;


-- ═══ 1. CATALOG ══════════════════════════════════════════════════════════════
-- What can be grown, sold and priced. Reference data: filled by seed.sql and
-- changed by the admin in the dashboard, never by the app.

-- The ten crop types a farmer picks from: Rice, Corn, Onions, …
create table if not exists public.crop_groups (
  id               text primary key,                     -- 'rice', 'onions'
  name             text not null unique,                 -- 'Rice', 'Onions'
  family           public.crop_family not null,          -- Crops / Vegetables / Fruits
  days_to_harvest  int check (days_to_harvest > 0),      -- typical, planting to harvest; null for tree crops
  sort_order       int not null default 0
);

-- The varieties within them: Special Rice, Red Onion, Carabao Mango, …
create table if not exists public.crops (
  id          text primary key,                          -- 'rice-special'
  group_id    text not null references public.crop_groups(id),
  name        text not null unique,                      -- 'Special Rice'
  sort_order  int not null default 0
);

-- The price records: one retail price per variety per date. The study's varieties
-- have one record a month from 2021 (dated the 1st of the month), loaded by
-- seed.sql from data/historical-prices.csv.
create table if not exists public.crop_prices (
  id            bigint generated always as identity primary key,
  crop_id       text not null references public.crops(id) on delete cascade,
  price_date    date not null default current_date,
  price_per_kg  numeric(10,2) not null check (price_per_kg > 0),
  change_pct    numeric(5,2) not null default 0,          -- against the record before (the month before), in %
  is_sample     boolean not null default false,           -- a placeholder for a variety with no records yet, not a market price
  unique (crop_id, price_date)
);
-- For a database built before price records were kept.
alter table public.crop_prices add column if not exists is_sample boolean not null default false;
-- A price put in on the admin website (Prices): where it came from ("DA
-- Bantay Presyo"), which admin put it in, and when. Empty for the records
-- seed.sql loads. Who put it in stays private (section 6).
alter table public.crop_prices add column if not exists source     text;
alter table public.crop_prices add column if not exists entered_by uuid references auth.users(id) on delete set null;
alter table public.crop_prices add column if not exists entered_at timestamptz;

-- What the models expect: one row per variety, model and month ahead, with
-- the range the price will likely land in and how far off that model was
-- when tested. Written by seed.sql from the training script's output
-- (ml/train_forecasts.py); never by the app.
create table if not exists public.crop_forecasts (
  id            bigint generated always as identity primary key,
  crop_id       text not null references public.crops(id) on delete cascade,
  model         text not null check (model in ('arima', 'lstm')),
  target_month  date not null,                             -- the 1st of the month forecast
  price_per_kg  numeric(10,2) not null check (price_per_kg > 0),
  low_per_kg    numeric(10,2) not null,                    -- likely range, 8 times in 10
  high_per_kg   numeric(10,2) not null,
  mape          numeric(6,2) not null,                     -- the model's average miss on its test months, in %
  generated_on  date not null default current_date,
  unique (crop_id, model, target_month)
);

-- The board: the newest price for each variety. Never a sample price.
create or replace view public.crop_prices_latest
  with (security_invoker = true) as
  select distinct on (crop_id) crop_id, price_date, price_per_kg, change_pct
  from public.crop_prices
  where not is_sample
  order by crop_id, price_date desc;


-- ═══ 2. ACCOUNTS ═════════════════════════════════════════════════════════════
-- One row per person, created by the sign-up trigger (section 7).

create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            public.user_role not null default 'farmer',
  full_name       text not null default '',
  phone           text,                                  -- E.164: +639171234567
  phone_verified  boolean not null default false,
  location        text,                                  -- 'Bagong Sikat, Cabanatuan City, Nueva Ecija'
  years_farming   int check (years_farming between 0 and 79),   -- under 80, as the sign-up form asks
  bio             text,
  rating          numeric(2,1) not null default 5.0 check (rating between 0 and 5),
  total_sales     int not null default 0,                -- orders received through the market
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
-- A farmer's rating is the average of the stars their buyers gave
-- (rate_order_item, section 7), and rating_count how many gave them. With
-- none yet, the count is 0 and the app says "New" rather than the 5.0 the
-- column starts at.
alter table public.profiles add column if not exists rating_count int not null default 0 check (rating_count >= 0);
-- For a database built when the limit was 0 to 80.
alter table public.profiles drop constraint if exists profiles_years_farming_check;
alter table public.profiles add constraint profiles_years_farming_check check (years_farming between 0 and 79);

-- The member number on a person's AniSense ID card: "2026-00001", the year
-- they joined (Philippine time) and their place in that year's count. The
-- database gives it when the profile is made (section 7), never the app; it
-- is never reused, even after an account is deleted, and nobody can change
-- it (section 6 grants no update on it).
alter table public.profiles add column if not exists member_no text;
create unique index if not exists profiles_member_no_key on public.profiles (member_no);
alter table public.profiles drop constraint if exists profiles_member_no_format;
alter table public.profiles add constraint profiles_member_no_format check (member_no ~ '^[0-9]{4}-[0-9]{5,}$');

-- The person's own photo, for their Profile and their ID card: the address
-- of a file in their own folder of the photos bucket (section 8). Set by the
-- app when they pick one; empty until then, and their initials stand in.
alter table public.profiles add column if not exists avatar_url text;

-- How far each year's count has got. Read and written only by the database
-- itself, when it numbers a new profile.
create table if not exists public.member_counters (
  year  int primary key,
  last  int not null default 0 check (last >= 0)
);

-- The crops a farmer grows: one row per farmer per crop type.
create table if not exists public.profile_crops (
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  crop_group_id  text not null references public.crop_groups(id),
  primary key (profile_id, crop_group_id)
);


-- ═══ 3. MARKET ═══════════════════════════════════════════════════════════════
-- What is for sale, and who bought what. An order is one checkout; its items
-- are one line per listing, so a basket from three farmers is one order with
-- three items, and each farmer sees only their own lines.

create table if not exists public.listings (
  id            uuid primary key default gen_random_uuid(),
  seller_id     uuid not null references public.profiles(id) on delete cascade,
  crop_id       text not null references public.crops(id),
  description   text not null default '',
  price_per_kg  numeric(10,2) not null check (price_per_kg > 0),
  quantity_kg   numeric(10,2) not null check (quantity_kg >= 0),   -- what is left; 0 once sold out
  location      text not null default '',
  photo_url     text,                                              -- the farmer's own photo, in Storage
  status        public.listing_status not null default 'active',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- buyer_id empties (it does not cascade) when a buyer deletes their account:
-- the order is also the farmer's record of a sale, so it stays, with no name
-- on it.
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  buyer_id      uuid references public.profiles(id) on delete set null,
  total_amount  numeric(12,2) not null default 0,
  created_at    timestamptz not null default now()
);
-- For a database made before the line above changed: the same rule, applied
-- to the table that already exists. Safe to run again.
alter table public.orders alter column buyer_id drop not null;
alter table public.orders drop constraint if exists orders_buyer_id_fkey;
alter table public.orders add constraint orders_buyer_id_fkey
  foreign key (buyer_id) references public.profiles(id) on delete set null;

-- Price, crop, seller and place are copied from the listing at the moment of
-- sale, so editing or removing a listing never rewrites what was bought.
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  listing_id    uuid references public.listings(id) on delete set null,
  seller_id     uuid references public.profiles(id) on delete set null,
  crop_id       text not null references public.crops(id),
  quantity_kg   numeric(10,2) not null check (quantity_kg > 0),
  price_per_kg  numeric(10,2) not null check (price_per_kg > 0),
  amount        numeric(12,2) generated always as (round(quantity_kg * price_per_kg, 2)) stored,
  location      text not null default '',
  status        public.order_item_status not null default 'placed',
  created_at    timestamptz not null default now()
);

-- After the two have spoken, each side's own figure for the line (the price
-- at checkout is only where the talk starts). Each is set through its own
-- call in section 7, by its own side only: the farmer's when confirming
-- (what they sold it for, which counts in their earnings), the buyer's when
-- recording what they paid (which counts in their spending). Added to an
-- existing database by running this file again.
alter table public.order_items add column if not exists sold_amount  numeric(12,2) check (sold_amount >= 0);
alter table public.order_items add column if not exists paid_amount  numeric(12,2) check (paid_amount >= 0);
alter table public.order_items add column if not exists confirmed_at timestamptz;
-- The buyer's stars for the farmer, on this line, once both sides have
-- settled it (the farmer confirmed, the buyer recorded paying).
alter table public.order_items add column if not exists rating   smallint check (rating between 1 and 5);
alter table public.order_items add column if not exists rated_at timestamptz;


-- ═══ 4. FARM RECORDS ═════════════════════════════════════════════════════════
-- A farmer's own books. Private: only the farmer who wrote a row can see it.

create table if not exists public.expenses (
  id             uuid primary key default gen_random_uuid(),
  farmer_id      uuid not null references public.profiles(id) on delete cascade,
  category       public.expense_category not null,
  description    text not null,
  crop_group_id  text not null references public.crop_groups(id),
  amount         numeric(12,2) not null check (amount > 0),
  spent_on       date not null default current_date,
  created_at     timestamptz not null default now()
);

-- Sales made outside the app (at the roadside, to a trader). Sales made
-- through the market are the farmer's order_items; the app adds the two up.
create table if not exists public.sales (
  id             uuid primary key default gen_random_uuid(),
  farmer_id      uuid not null references public.profiles(id) on delete cascade,
  crop_group_id  text not null references public.crop_groups(id),
  quantity_kg    numeric(10,2) not null check (quantity_kg > 0),
  price_per_kg   numeric(10,2) not null check (price_per_kg > 0),
  amount         numeric(12,2) generated always as (round(quantity_kg * price_per_kg, 2)) stored,
  sold_on        date not null default current_date,
  buyer_name     text,
  created_at     timestamptz not null default now()
);

-- What is in the ground, for the crop tracker's countdown.
create table if not exists public.plantings (
  id               uuid primary key default gen_random_uuid(),
  farmer_id        uuid not null references public.profiles(id) on delete cascade,
  crop_group_id    text not null references public.crop_groups(id),
  planted_on       date not null,
  days_to_harvest  int not null check (days_to_harvest > 0),
  created_at       timestamptz not null default now()
);

-- "Tell me when onions reach ₱50."
create table if not exists public.price_alerts (
  id              uuid primary key default gen_random_uuid(),
  farmer_id       uuid not null references public.profiles(id) on delete cascade,
  crop_id         text not null references public.crops(id),
  target_price    numeric(10,2) not null check (target_price > 0),
  price_when_set  numeric(10,2) not null check (price_when_set > 0),   -- which way the target lies
  set_at          timestamptz not null default now()
);

-- Expected kilos per crop, for the estimated profit.
create table if not exists public.harvest_plans (
  farmer_id      uuid not null references public.profiles(id) on delete cascade,
  crop_group_id  text not null references public.crop_groups(id),
  expected_kg    numeric(12,2) not null check (expected_kg > 0),
  updated_at     timestamptz not null default now(),
  primary key (farmer_id, crop_group_id)
);


-- ═══ 5. REWARDS ══════════════════════════════════════════════════════════════
-- The badges, and who has earned which. 'auto' badges are awarded without
-- anyone lifting a finger: joining, a first harvest and a first sale by the
-- database's own triggers (section 7), Farmer of the Week by the app from the
-- week's ratings. 'admin' ones are granted from the dashboard.

create table if not exists public.achievements (
  id           text primary key,                          -- 'first-harvest'
  name         text not null,
  description  text not null,
  awarded_by   text not null check (awarded_by in ('auto', 'admin')),
  sort_order   int not null default 0
);

create table if not exists public.user_achievements (
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  achievement_id  text not null references public.achievements(id),
  earned_at       timestamptz not null default now(),
  primary key (profile_id, achievement_id)
);


-- ─── Indexes: the lists the app reads most ──────────────────────────────────
create index if not exists crops_group_idx            on public.crops (group_id);
create index if not exists profile_crops_group_idx    on public.profile_crops (crop_group_id);
create index if not exists listings_market_idx        on public.listings (status, created_at desc);
create index if not exists listings_seller_idx        on public.listings (seller_id);
create index if not exists orders_buyer_idx           on public.orders (buyer_id, created_at desc);
create index if not exists order_items_order_idx      on public.order_items (order_id);
create index if not exists order_items_seller_idx     on public.order_items (seller_id, created_at desc);
create index if not exists expenses_farmer_idx        on public.expenses (farmer_id, spent_on desc);
create index if not exists sales_farmer_idx           on public.sales (farmer_id, sold_on desc);
create index if not exists plantings_farmer_idx       on public.plantings (farmer_id);
create index if not exists price_alerts_farmer_idx    on public.price_alerts (farmer_id);


-- ═══ 6. SECURITY ═════════════════════════════════════════════════════════════
-- Enforced by the database, so even a tampered app can only do what these
-- allow. Nothing is open to someone who is not signed in but the price
-- catalog - the crops, their prices and the forecasts - which a guest may
-- look at (the app's guest mode, "See prices"): public market figures, with
-- nothing of anyone's in them. Accounts, listings, orders, farm records and
-- badges stay closed to them.

alter table public.crop_groups        enable row level security;
alter table public.crops              enable row level security;
alter table public.crop_prices        enable row level security;
alter table public.crop_forecasts     enable row level security;
alter table public.profiles           enable row level security;
alter table public.profile_crops      enable row level security;
alter table public.listings           enable row level security;
alter table public.orders             enable row level security;
alter table public.order_items        enable row level security;
alter table public.expenses           enable row level security;
alter table public.sales              enable row level security;
alter table public.plantings          enable row level security;
alter table public.price_alerts       enable row level security;
alter table public.harvest_plans      enable row level security;
alter table public.achievements       enable row level security;
alter table public.user_achievements  enable row level security;
alter table public.member_counters    enable row level security;
-- No rules for the counter: only the numbering function (section 7) uses it.
revoke all on public.member_counters from anon, authenticated;

-- Helpers that look across tables without tripping each other's rules.
create or replace function public.can_see_order(p_order uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from orders where id = p_order and buyer_id = auth.uid())
      or exists (select 1 from order_items where order_id = p_order and seller_id = auth.uid());
$$;

create or replace function public.is_my_buyer(p_profile uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from order_items oi join orders o on o.id = oi.order_id
    where oi.seller_id = auth.uid() and o.buyer_id = p_profile
  );
$$;

-- The catalog: read by anyone, signed in or a guest; the badge list by
-- everyone signed in. Both changed by the admin only.
drop policy if exists "catalog: read" on public.crop_groups;
create policy "catalog: read" on public.crop_groups for select to anon, authenticated using (true);
drop policy if exists "catalog: read" on public.crops;
create policy "catalog: read" on public.crops for select to anon, authenticated using (true);
drop policy if exists "catalog: read" on public.crop_prices;
create policy "catalog: read" on public.crop_prices for select to anon, authenticated using (true);
-- Every column of a price but which admin put it in.
revoke select on public.crop_prices from anon, authenticated;
grant select (id, crop_id, price_date, price_per_kg, change_pct, is_sample, source, entered_at) on public.crop_prices to anon, authenticated;
drop policy if exists "catalog: read" on public.crop_forecasts;
create policy "catalog: read" on public.crop_forecasts for select to anon, authenticated using (true);
drop policy if exists "rewards: read" on public.achievements;
create policy "rewards: read" on public.achievements for select to authenticated using (true);

-- Profiles: your own, every farmer (buyers need to see who they buy from),
-- and the buyers who have ordered from you. A buyer's phone number is not
-- open to everyone signed in, only to farmers they have ordered from.
drop policy if exists "profiles: read" on public.profiles;
create policy "profiles: read" on public.profiles for select to authenticated
  using (id = auth.uid() or role = 'farmer' or public.is_my_buyer(id));
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
-- Only the details a person may change about themselves. Rating, sales count,
-- role and verification are the database's to set.
revoke update on public.profiles from authenticated, anon;
grant update (full_name, phone, location, years_farming, bio, avatar_url) on public.profiles to authenticated;

drop policy if exists "profile crops: read" on public.profile_crops;
create policy "profile crops: read" on public.profile_crops for select to authenticated using (true);
drop policy if exists "profile crops: manage own" on public.profile_crops;
create policy "profile crops: manage own" on public.profile_crops for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Listings: everyone signed in can browse; only the seller manages theirs.
drop policy if exists "listings: read" on public.listings;
create policy "listings: read" on public.listings for select to authenticated using (true);
drop policy if exists "listings: add own" on public.listings;
create policy "listings: add own" on public.listings for insert to authenticated with check (seller_id = auth.uid());
drop policy if exists "listings: edit own" on public.listings;
create policy "listings: edit own" on public.listings for update to authenticated
  using (seller_id = auth.uid()) with check (seller_id = auth.uid());
drop policy if exists "listings: delete own" on public.listings;
create policy "listings: delete own" on public.listings for delete to authenticated using (seller_id = auth.uid());

-- Orders and their items: seen by the buyer and by each farmer in them.
-- Created only through place_order() (section 7), never written directly,
-- so prices and stock cannot be faked. A farmer may move their own lines
-- along (placed → confirmed → completed) and nothing else.
drop policy if exists "orders: read" on public.orders;
create policy "orders: read" on public.orders for select to authenticated using (public.can_see_order(id));
drop policy if exists "order items: read" on public.order_items;
create policy "order items: read" on public.order_items for select to authenticated
  using (seller_id = auth.uid() or public.can_see_order(order_id));
drop policy if exists "order items: seller updates status" on public.order_items;
create policy "order items: seller updates status" on public.order_items for update to authenticated
  using (seller_id = auth.uid()) with check (seller_id = auth.uid());
revoke update on public.order_items from authenticated, anon;
grant update (status) on public.order_items to authenticated;

-- Farm records: strictly the farmer's own.
drop policy if exists "expenses: own" on public.expenses;
create policy "expenses: own" on public.expenses for all to authenticated
  using (farmer_id = auth.uid()) with check (farmer_id = auth.uid());
drop policy if exists "sales: own" on public.sales;
create policy "sales: own" on public.sales for all to authenticated
  using (farmer_id = auth.uid()) with check (farmer_id = auth.uid());
drop policy if exists "plantings: own" on public.plantings;
create policy "plantings: own" on public.plantings for all to authenticated
  using (farmer_id = auth.uid()) with check (farmer_id = auth.uid());
drop policy if exists "price alerts: own" on public.price_alerts;
create policy "price alerts: own" on public.price_alerts for all to authenticated
  using (farmer_id = auth.uid()) with check (farmer_id = auth.uid());
drop policy if exists "harvest plans: own" on public.harvest_plans;
create policy "harvest plans: own" on public.harvest_plans for all to authenticated
  using (farmer_id = auth.uid()) with check (farmer_id = auth.uid());

-- Badges earned: public (they belong on a farmer's profile), written only
-- by the database's own triggers or the admin.
drop policy if exists "earned badges: read" on public.user_achievements;
create policy "earned badges: read" on public.user_achievements for select to authenticated using (true);


-- ═══ 7. FUNCTIONS ════════════════════════════════════════════════════════════

-- ─── Keep updated_at honest ─────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end;
$$;
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
drop trigger if exists listings_touch on public.listings;
create trigger listings_touch before update on public.listings for each row execute function public.touch_updated_at();

-- ─── Badges the database awards itself ──────────────────────────────────────
create or replace function public.award(p_profile uuid, p_achievement text)
returns void language sql security definer set search_path = public as $$
  insert into user_achievements (profile_id, achievement_id)
  select p_profile, p_achievement
  where p_profile is not null and exists (select 1 from achievements where id = p_achievement)
  on conflict do nothing;
$$;
revoke all on function public.award(uuid, text) from public, anon, authenticated;

create or replace function public.award_on_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin perform award(new.id, 'newbie'); return new; end;
$$;
create or replace function public.award_on_listing() returns trigger
language plpgsql security definer set search_path = public as $$
begin perform award(new.seller_id, 'first-harvest'); return new; end;
$$;
create or replace function public.award_on_sale() returns trigger
language plpgsql security definer set search_path = public as $$
begin perform award(new.farmer_id, 'first-sale'); return new; end;
$$;
create or replace function public.award_on_order_item() returns trigger
language plpgsql security definer set search_path = public as $$
begin perform award(new.seller_id, 'first-sale'); return new; end;
$$;
drop trigger if exists award_newbie on public.profiles;
create trigger award_newbie after insert on public.profiles for each row execute function public.award_on_profile();
drop trigger if exists award_first_harvest on public.listings;
create trigger award_first_harvest after insert on public.listings for each row execute function public.award_on_listing();
drop trigger if exists award_first_sale on public.sales;
create trigger award_first_sale after insert on public.sales for each row execute function public.award_on_sale();
drop trigger if exists award_first_market_sale on public.order_items;
create trigger award_first_market_sale after insert on public.order_items for each row execute function public.award_on_order_item();

-- ─── Member numbers ─────────────────────────────────────────────────────────
-- The next number in a year's count, taken in one step (the counter's row is
-- locked while it moves), so two people joining at the same moment never get
-- the same one. Five digits, more only if a year ever passes 99,999.
create or replace function public.next_member_no(p_at timestamptz)
returns text language plpgsql security definer set search_path = public as $$
declare
  y int := extract(year from p_at at time zone 'Asia/Manila')::int;
  n int;
begin
  insert into member_counters as c (year, last) values (y, 1)
  on conflict (year) do update set last = c.last + 1
  returning c.last into n;
  return y::text || '-' || lpad(n::text, greatest(5, length(n::text)), '0');
end;
$$;
revoke all on function public.next_member_no(timestamptz) from public, anon, authenticated;

-- Every new profile gets the next number, however the profile is made.
create or replace function public.set_member_no()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.member_no is null then
    new.member_no := next_member_no(coalesce(new.created_at, now()));
  end if;
  return new;
end;
$$;
revoke all on function public.set_member_no() from public, anon, authenticated;
drop trigger if exists profiles_member_no on public.profiles;
create trigger profiles_member_no before insert on public.profiles
  for each row execute function public.set_member_no();

-- Accounts made before member numbers existed get theirs now, in the order
-- they joined. Only where one is missing, so running this file again
-- changes nobody's number.
do $$
declare r record;
begin
  for r in select id, created_at from public.profiles where member_no is null order by created_at, id loop
    update public.profiles set member_no = public.next_member_no(r.created_at) where id = r.id;
  end loop;
end $$;
alter table public.profiles alter column member_no set not null;

-- ─── Sign-up: the profile, complete from its first second ───────────────────
-- Everything the sign-up form asked arrives as metadata from createAccount()
-- in src/services/auth.ts: name, role, town, phone, years, and crop names.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into profiles (id, full_name, role, location, phone, years_farming)
  values (
    new.id,
    coalesce(meta ->> 'full_name', ''),
    case when meta ->> 'role' = 'buyer' then 'buyer'::user_role else 'farmer'::user_role end,
    meta ->> 'location',
    meta ->> 'phone',
    nullif(meta ->> 'years_farming', '')::int
  )
  on conflict (id) do nothing;

  insert into profile_crops (profile_id, crop_group_id)
  select new.id, g.id
  from crop_groups g
  where jsonb_typeof(meta -> 'crops') = 'array'
    and g.name in (select jsonb_array_elements_text(meta -> 'crops'))
  on conflict do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── The crops I grow (Profile → Edit) ──────────────────────────────────────
-- Replaces the farmer's list with the crop names given, in one step.
create or replace function public.set_my_crops(crop_names text[])
returns void language plpgsql set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  delete from profile_crops where profile_id = auth.uid();
  insert into profile_crops (profile_id, crop_group_id)
  select auth.uid(), id from crop_groups where name = any(crop_names)
  on conflict do nothing;
end;
$$;

-- ─── Checkout: place_order(items) ───────────────────────────────────────────
-- items = [{"listing_id": "…", "kg": 5}, …]
-- All or nothing: every line is checked against live stock, stock goes down,
-- each line is written with the listing's own price, and each farmer's sales
-- count goes up. If any line fails, none of it happens.
-- Errors the app turns into messages: LISTING_GONE, NOT_ENOUGH, OWN_LISTING.
create or replace function public.place_order(items jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  buyer    uuid := auth.uid();
  new_id   uuid;
  item     jsonb;
  l        listings%rowtype;
  q        numeric;
  total    numeric := 0;
begin
  if buyer is null then raise exception 'NOT_SIGNED_IN'; end if;
  if items is null or jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 then
    raise exception 'EMPTY_ORDER';
  end if;

  insert into orders (buyer_id) values (buyer) returning id into new_id;

  for item in select * from jsonb_array_elements(items) loop
    q := (item ->> 'kg')::numeric;
    if q is null or q <= 0 then raise exception 'BAD_QUANTITY'; end if;

    -- Locks the row, so two buyers can't both take the last 10 kg.
    select * into l from listings
      where id = (item ->> 'listing_id')::uuid and status = 'active'
      for update;
    if not found then raise exception 'LISTING_GONE'; end if;
    if l.seller_id = buyer then raise exception 'OWN_LISTING'; end if;
    if l.quantity_kg < q then raise exception 'NOT_ENOUGH'; end if;

    update listings
      set quantity_kg = quantity_kg - q,
          status = case when quantity_kg - q <= 0 then 'sold'::listing_status else status end
      where id = l.id;

    insert into order_items (order_id, listing_id, seller_id, crop_id, quantity_kg, price_per_kg, location)
    values (new_id, l.id, l.seller_id, l.crop_id, q, l.price_per_kg, l.location);

    update profiles set total_sales = total_sales + 1 where id = l.seller_id;
    total := total + round(q * l.price_per_kg, 2);
  end loop;

  update orders set total_amount = total where id = new_id;
  return new_id;
end;
$$;

-- ─── After the call ─────────────────────────────────────────────────────────
-- The farmer confirms a line of an order they sold, with what they sold it
-- for: the line becomes a sale in their earnings. Confirming again only
-- corrects the amount (the day it was confirmed stays). Only the farmer of
-- that line can; NOT_FOUND for anyone else, or a cancelled line.
create or replace function public.confirm_order_item(p_item uuid, p_sold numeric)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  if p_sold is null or p_sold < 0 or p_sold > 100000000 then raise exception 'BAD_AMOUNT'; end if;
  update order_items
     set status = case when status = 'placed' then 'confirmed'::order_item_status else status end,
         sold_amount = round(p_sold, 2),
         confirmed_at = coalesce(confirmed_at, now())
   where id = p_item and seller_id = auth.uid() and status <> 'cancelled';
  if not found then raise exception 'NOT_FOUND'; end if;
end;
$$;

-- The buyer records what they actually paid for a line of their order, or
-- clears it (null) to go back to the order's price. Only the buyer of that
-- order can.
create or replace function public.record_order_payment(p_item uuid, p_paid numeric)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  if p_paid is not null and (p_paid < 0 or p_paid > 100000000) then raise exception 'BAD_AMOUNT'; end if;
  update order_items i
     set paid_amount = round(p_paid, 2)
    from orders o
   where i.id = p_item and o.id = i.order_id and o.buyer_id = auth.uid();
  if not found then raise exception 'NOT_FOUND'; end if;
end;
$$;

-- A farmer's rating, worked out again from every star their buyers gave:
-- the average to one decimal, and how many. With none, back to 5.0 and 0.
-- Only the functions here call it.
create or replace function public.refresh_rating(p_seller uuid)
returns void language sql security definer set search_path = public as $$
  update profiles set
    rating = coalesce((select round(avg(rating)::numeric, 1) from order_items where seller_id = p_seller and rating is not null), 5.0),
    rating_count = (select count(*) from order_items where seller_id = p_seller and rating is not null)
  where id = p_seller;
$$;

-- The buyer rates the farmer of one line of their order, 1 to 5 stars, or
-- changes the stars they gave. Only once the line is settled on both sides:
-- the farmer has confirmed it and the buyer has recorded paying (NOT_YET
-- before that). Only the buyer of that order (NOT_FOUND for anyone else).
create or replace function public.rate_order_item(p_item uuid, p_stars int)
returns void language plpgsql security definer set search_path = public as $$
declare
  line order_items%rowtype;
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  if p_stars is null or p_stars < 1 or p_stars > 5 then raise exception 'BAD_RATING'; end if;
  select i.* into line from order_items i join orders o on o.id = i.order_id
   where i.id = p_item and o.buyer_id = auth.uid()
   for update of i;
  if not found then raise exception 'NOT_FOUND'; end if;
  if line.status not in ('confirmed', 'completed') or line.paid_amount is null then raise exception 'NOT_YET'; end if;
  update order_items set rating = p_stars, rated_at = now() where id = p_item;
  if line.seller_id is not null then perform refresh_rating(line.seller_id); end if;
end;
$$;

-- ─── Farm-record sync ───────────────────────────────────────────────────────
-- The app keeps each of these lists whole and sends the whole list when it
-- changes (they are short: a few dozen rows at most). Each call replaces the
-- farmer's rows in one step, so an edit made offline and sent later lands
-- exactly as the farmer left it. Crops arrive by name, as the app shows them.

-- [{ "crop": "Rice", "kg": 120, "price_per_kg": 42, "sold_on": "2026-09-20", "buyer": "Aling Rosa" }]
create or replace function public.replace_my_sales(items jsonb)
returns void language plpgsql set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  delete from sales where farmer_id = auth.uid();
  insert into sales (farmer_id, crop_group_id, quantity_kg, price_per_kg, sold_on, buyer_name)
  select auth.uid(), g.id, x.kg, x.price_per_kg, x.sold_on, nullif(x.buyer, '')
  from jsonb_to_recordset(coalesce(items, '[]'::jsonb))
       as x(crop text, kg numeric, price_per_kg numeric, sold_on date, buyer text)
  join crop_groups g on g.name = x.crop;
end;
$$;

-- [{ "crop": "Rice", "planted_on": "2026-08-01", "days": 110 }]
create or replace function public.replace_my_plantings(items jsonb)
returns void language plpgsql set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  delete from plantings where farmer_id = auth.uid();
  insert into plantings (farmer_id, crop_group_id, planted_on, days_to_harvest)
  select auth.uid(), g.id, x.planted_on, x.days
  from jsonb_to_recordset(coalesce(items, '[]'::jsonb))
       as x(crop text, planted_on date, days int)
  join crop_groups g on g.name = x.crop;
end;
$$;

-- [{ "crop_id": "onion-red", "target": 50, "price_when_set": 45, "set_at": "…" }]
create or replace function public.replace_my_price_alerts(items jsonb)
returns void language plpgsql set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  delete from price_alerts where farmer_id = auth.uid();
  insert into price_alerts (farmer_id, crop_id, target_price, price_when_set, set_at)
  select auth.uid(), x.crop_id, x.target, x.price_when_set, coalesce(x.set_at, now())
  from jsonb_to_recordset(coalesce(items, '[]'::jsonb))
       as x(crop_id text, target numeric, price_when_set numeric, set_at timestamptz)
  where exists (select 1 from crops c where c.id = x.crop_id);
end;
$$;

-- { "Rice": 2000, "Corn": 800 }
create or replace function public.replace_my_harvest_plans(plans jsonb)
returns void language plpgsql set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  delete from harvest_plans where farmer_id = auth.uid();
  insert into harvest_plans (farmer_id, crop_group_id, expected_kg)
  select auth.uid(), g.id, p.value::numeric
  from jsonb_each_text(coalesce(plans, '{}'::jsonb)) as p(key, value)
  join crop_groups g on g.name = p.key
  where p.value::numeric > 0;
end;
$$;

-- ─── Delete my account ──────────────────────────────────────────────────────
-- A signed-in person removes their own account, and only their own: it takes
-- no argument, so there is no id to tamper with. Deleting the sign-in row
-- takes the profile with it, and the profile takes everything that is theirs
-- alone: their crops, listings, expenses, sales, plantings, price alerts,
-- harvest plans and badges.
--
-- What other people still need is kept, with this person's name gone from
-- it: an order a buyer placed stays in the farmer's sales (buyer_id empties),
-- and a line a farmer sold stays in the buyer's purchases (seller_id empties).
--
-- Listing photos are files, not rows; the app removes them through Storage
-- before calling this.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'NOT_SIGNED_IN'; end if;
  delete from auth.users where id = uid;
end;
$$;

-- ─── Setup check ────────────────────────────────────────────────────────────
-- How much of the catalog is loaded, as counts only. Open to the setup
-- checker (npm run check:db), which has no account: it reveals nothing but
-- whether seed.sql has been run.
create or replace function public.catalog_status()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'crop_groups', (select count(*) from crop_groups),
    'crops', (select count(*) from crops),
    'prices', (select count(*) from crop_prices_latest),
    'price_records', (select count(*) from crop_prices where not is_sample),
    'forecasts', (select count(*) from crop_forecasts),
    'badges', (select count(*) from achievements)
  );
$$;
grant execute on function public.catalog_status() to anon, authenticated;

-- Who may call what: signed-in users only, never anonymous visitors.
revoke all on function public.can_see_order(uuid)               from public, anon;
revoke all on function public.is_my_buyer(uuid)                 from public, anon;
revoke all on function public.set_my_crops(text[])              from public, anon;
revoke all on function public.place_order(jsonb)                from public, anon;
revoke all on function public.confirm_order_item(uuid, numeric)  from public, anon;
revoke all on function public.record_order_payment(uuid, numeric) from public, anon;
revoke all on function public.rate_order_item(uuid, int)         from public, anon;
revoke all on function public.refresh_rating(uuid)               from public, anon, authenticated;
revoke all on function public.replace_my_sales(jsonb)           from public, anon;
revoke all on function public.replace_my_plantings(jsonb)       from public, anon;
revoke all on function public.replace_my_price_alerts(jsonb)    from public, anon;
revoke all on function public.replace_my_harvest_plans(jsonb)   from public, anon;
revoke all on function public.delete_my_account()               from public, anon;
grant execute on function public.can_see_order(uuid)             to authenticated;
grant execute on function public.is_my_buyer(uuid)               to authenticated;
grant execute on function public.set_my_crops(text[])            to authenticated;
grant execute on function public.place_order(jsonb)              to authenticated;
grant execute on function public.confirm_order_item(uuid, numeric) to authenticated;
grant execute on function public.record_order_payment(uuid, numeric) to authenticated;
grant execute on function public.rate_order_item(uuid, int)       to authenticated;
grant execute on function public.replace_my_sales(jsonb)         to authenticated;
grant execute on function public.replace_my_plantings(jsonb)     to authenticated;
grant execute on function public.replace_my_price_alerts(jsonb)  to authenticated;
grant execute on function public.replace_my_harvest_plans(jsonb) to authenticated;
grant execute on function public.delete_my_account()             to authenticated;


-- ═══ 8. STORAGE: listing photos ══════════════════════════════════════════════
-- A public bucket, so a photo loads from its address like any image. Each
-- member can only write inside their own folder ("<their user id>/..."): their
-- listings' photos, and their own profile photo ("avatar-..."). Photos are
-- shrunk on the phone first; the 3 MB cap is a guard, not a target.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "farmers upload own listing photos" on storage.objects;
create policy "farmers upload own listing photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "farmers replace own listing photos" on storage.objects;
create policy "farmers replace own listing photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
-- Listing their own folder. Storage only removes a file the caller can also
-- see, so without this the delete rule below would never find anything, and
-- deleting an account would leave its photos behind.
drop policy if exists "farmers see own listing photos" on storage.objects;
create policy "farmers see own listing photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "farmers delete own listing photos" on storage.objects;
create policy "farmers delete own listing photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);


-- ═══ 9. CODES ════════════════════════════════════════════════════════════════
-- The 6-digit codes that prove a Gmail is the person's own (creating an
-- account, resetting a password). Written and read only by the verify-code
-- Edge Function (supabase/functions/verify-code), which runs on the server
-- with the service key. Row level security is on and there are no policies,
-- so the app, signed in or not, can neither read nor write a single row:
-- nobody can look a code up. Codes are stored as hashes.
create table if not exists public.verification_codes (
  key               text primary key,                    -- 'signup:gmail:juan@gmail.com'
  code_hash         text not null,                       -- sha-256, or 'used' once it has passed
  expires_at        timestamptz not null,                -- 10 minutes after it was sent
  tries             int not null default 0,              -- wrong tries; 5 and a new code is needed
  sent_at           timestamptz not null default now(),  -- for the 30-second wait between codes
  hour_started      timestamptz not null default now(),  -- for at most 5 codes an hour
  sends_this_hour   int not null default 1,
  token_hash        text,                                -- after a reset code passes: the one-time
  token_expires_at  timestamptz                          -- right to set the new password
);
alter table public.verification_codes enable row level security;
revoke all on public.verification_codes from anon, authenticated;
grant select, insert, update, delete on public.verification_codes to service_role;

-- Whether a Gmail already has an account, and which: for "there is already
-- an account" on sign-up, and to find the account a reset is for. Only the
-- function may call it; it is closed to the app.
create or replace function public.auth_user_id_by_email(p_email text)
returns uuid language sql stable security definer set search_path = '' as $$
  select id from auth.users where lower(email) = lower(trim(p_email)) limit 1;
$$;
revoke all on function public.auth_user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.auth_user_id_by_email(text) to service_role;


-- ═══ 10. PASSWORDS: no password used twice ═══════════════════════════════════
-- A new password, whether made on Profile (Change password) or after a
-- forgotten one (the reset code), may not be the account's current password
-- or any of its last ten. To tell, the database keeps each account's old
-- passwords - never the passwords, only their hashes: bcrypt, salted, exactly
-- as Supabase Auth keeps the current one - and compares a new one against
-- them the way signing in does.
--
-- The history fills itself: whenever an account's password changes, however
-- it changed (Profile, a reset, the dashboard), the one it replaces is added
-- here by the trigger below. Only the last ten are kept. Nobody can read the
-- table, not even its owner signed in: row level security is on and there are
-- no policies. Only password_was_used() looks into it, and only the
-- verify-code Edge Function (which has the new password in hand while it
-- sets it) may call that. Deleting an account takes its history with it.

-- bcrypt in SQL, the same that Supabase Auth's hashes are made with. On by
-- default in a Supabase project; this only makes sure.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.password_history (
  id             bigint generated always as identity primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  password_hash  text not null,                           -- bcrypt, as in auth.users
  replaced_at    timestamptz not null default now()       -- when it stopped being the password
);
create index if not exists password_history_user_idx on public.password_history (user_id, replaced_at desc);
alter table public.password_history enable row level security;
revoke all on public.password_history from anon, authenticated;

-- When a password changes, the old one goes into the history, and anything
-- older than the last ten comes out.
create or replace function public.remember_old_password()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(old.encrypted_password, '') <> '' then
    insert into public.password_history (user_id, password_hash) values (old.id, old.encrypted_password);
    delete from public.password_history h
     where h.user_id = old.id
       and h.id not in (select x.id from public.password_history x
                         where x.user_id = old.id order by x.replaced_at desc, x.id desc limit 10);
  end if;
  return new;
end;
$$;
revoke all on function public.remember_old_password() from public, anon, authenticated;
drop trigger if exists on_auth_password_changed on auth.users;
create trigger on_auth_password_changed after update on auth.users
  for each row when (old.encrypted_password is distinct from new.encrypted_password)
  execute function public.remember_old_password();

-- Whether a password is this account's current one, or one of its last ten.
-- Compared the way signing in compares: the candidate hashed with each
-- stored hash's own salt.
create or replace function public.password_was_used(p_user uuid, p_password text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
           select 1 from auth.users u
            where u.id = p_user and coalesce(u.encrypted_password, '') <> ''
              and extensions.crypt(p_password, u.encrypted_password) = u.encrypted_password)
      or exists (
           select 1 from public.password_history h
            where h.user_id = p_user
              and extensions.crypt(p_password, h.password_hash) = h.password_hash);
$$;
revoke all on function public.password_was_used(uuid, text) from public, anon, authenticated;
grant execute on function public.password_was_used(uuid, text) to service_role;

-- Whether a password is this account's current one: for Change password on
-- Profile, which asks for it first. The Edge Function counts the wrong tries.
create or replace function public.password_is_current(p_user uuid, p_password text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from auth.users u
     where u.id = p_user and coalesce(u.encrypted_password, '') <> ''
       and extensions.crypt(p_password, u.encrypted_password) = u.encrypted_password);
$$;
revoke all on function public.password_is_current(uuid, text) from public, anon, authenticated;
grant execute on function public.password_is_current(uuid, text) to service_role;
grant select, insert, delete on public.password_history to service_role;


-- ═══ 11. ADMIN: the web dashboard ═════════════════════════════════════════════
-- The AniSense admin website (site/admin.html), never the app. An admin is an
-- account listed in public.admins. It signs in on the website with its email
-- and password like anyone, and every admin function below checks that list
-- first: anyone else gets NOT_ADMIN. They only read, but for two things: the
-- month's crop prices (Prices), and the badges the admin gives (Farmer of
-- the Month, Farmer of the Year).
--
-- To make an admin (once, by the project's owner, here in the SQL Editor):
--   1. Authentication → Users → Add user → Create new user: the email and a
--      password, with Auto Confirm User ticked.
--   2. Run:  select public.make_admin('the.same@email.com');
-- make_admin takes away the app profile the sign-up trigger gave the new
-- account, so an admin is never one of the app's users: not in the Market,
-- not in any count, and the app will not sign it in. It refuses an account
-- that is already in use in the app, so a farmer's or buyer's account can
-- never be turned into one by mistake.

create table if not exists public.admins (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  added_at  timestamptz not null default now()
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

-- Whether the person signed in is an admin: for the website, and for the
-- app, which turns an admin account away.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- The first line of every admin function.
create or replace function public.admin_guard()
returns void language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.admins where user_id = auth.uid()) then
    raise exception 'NOT_ADMIN' using errcode = '42501';
  end if;
end;
$$;
revoke all on function public.admin_guard() from public, anon, authenticated;

create or replace function public.make_admin(p_email text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  uid uuid;
  prof public.profiles;
begin
  select u.id into uid from auth.users u where lower(u.email) = lower(trim(p_email));
  if uid is null then
    return 'No account has that email yet. Add it under Authentication → Users first, then run this again.';
  end if;
  if exists (select 1 from public.admins where user_id = uid) then
    return trim(p_email) || ' is already an admin.';
  end if;
  select * into prof from public.profiles where id = uid;
  -- Made in the app: it has the name the sign-up form asked, or something in it.
  if coalesce(prof.full_name, '') <> ''
     or exists (select 1 from public.listings where seller_id = uid)
     or exists (select 1 from public.orders where buyer_id = uid)
     or exists (select 1 from public.expenses where farmer_id = uid)
     or exists (select 1 from public.sales where farmer_id = uid)
     or exists (select 1 from public.plantings where farmer_id = uid) then
    return 'That account is in use in the app. Make the admin a new account with an email of its own.';
  end if;
  insert into public.admins (user_id) values (uid);
  delete from public.profiles where id = uid;
  -- Its member number goes back if nobody has joined since, so the members
  -- still count 00001, 00002, … with no gap.
  if prof.member_no is not null then
    update public.member_counters c set last = c.last - 1
     where c.year = split_part(prof.member_no, '-', 1)::int
       and c.last = split_part(prof.member_no, '-', 2)::int;
  end if;
  return 'Done: ' || trim(p_email) || ' is an admin. Sign in on the admin website with it.';
end;
$$;
revoke all on function public.make_admin(text) from public, anon, authenticated;

-- The town in a written location: "Bantug, Talavera, Nueva Ecija" →
-- "Talavera" (the part before the province), "Talavera" → "Talavera".
create or replace function public.town_of(p_location text)
returns text language sql immutable set search_path = '' as $$
  select case
    when p_location is null or trim(p_location) = '' then null
    else (select nullif(trim(parts[greatest(array_length(parts, 1) - 1, 1)]), '')
            from (select regexp_split_to_array(p_location, ',') as parts) x)
  end;
$$;
revoke all on function public.town_of(text) from public, anon, authenticated;

-- The dashboard's numbers, in one call: users, listings, orders and the
-- farm records, the last twelve months of sign-ups and of orders (Philippine
-- time), what is for sale by crop, and where the users are.
create or replace function public.admin_overview()
returns json language plpgsql stable security definer set search_path = '' as $$
declare
  r json;
  this_month timestamp := date_trunc('month', now() at time zone 'Asia/Manila');
begin
  perform public.admin_guard();
  select json_build_object(
    'generated_at', now(),
    'users', (select json_build_object(
        'total', count(*),
        'farmers', count(*) filter (where p.role = 'farmer'),
        'buyers', count(*) filter (where p.role = 'buyer'),
        'new_7d', count(*) filter (where p.created_at >= now() - interval '7 days'),
        'new_30d', count(*) filter (where p.created_at >= now() - interval '30 days'))
      from public.profiles p),
    'active_7d', (select count(*) from auth.users u join public.profiles p on p.id = u.id
                   where u.last_sign_in_at >= now() - interval '7 days'),
    'listings', (select json_build_object(
        'active', count(*) filter (where l.status = 'active'),
        'sold', count(*) filter (where l.status = 'sold'),
        'removed', count(*) filter (where l.status = 'removed'),
        'active_kg', coalesce(sum(l.quantity_kg) filter (where l.status = 'active'), 0))
      from public.listings l),
    'orders', (select json_build_object(
        'orders', (select count(*) from public.orders),
        'items', count(*),
        'placed', count(*) filter (where i.status = 'placed'),
        'confirmed', count(*) filter (where i.status = 'confirmed'),
        'completed', count(*) filter (where i.status = 'completed'),
        'cancelled', count(*) filter (where i.status = 'cancelled'),
        'value', coalesce(sum(i.amount) filter (where i.status <> 'cancelled'), 0),
        'sold_value', coalesce(sum(i.sold_amount) filter (where i.status <> 'cancelled'), 0))
      from public.order_items i),
    'ratings', (select json_build_object(
        'rated_farmers', count(*) filter (where p.rating_count > 0),
        'average', round(avg(p.rating) filter (where p.rating_count > 0), 2))
      from public.profiles p where p.role = 'farmer'),
    'records', json_build_object(
        'expenses', (select count(*) from public.expenses),
        'expenses_total', (select coalesce(sum(e.amount), 0) from public.expenses e),
        'sales', (select count(*) from public.sales),
        'sales_total', (select coalesce(sum(s.amount), 0) from public.sales s),
        'plantings', (select count(*) from public.plantings)),
    'signups_by_month', (select coalesce(json_agg(json_build_object('month', to_char(t.m, 'YYYY-MM'), 'farmers', t.f, 'buyers', t.b) order by t.m), '[]'::json)
       from (select g.m,
                    count(p.id) filter (where p.role = 'farmer') as f,
                    count(p.id) filter (where p.role = 'buyer') as b
               from generate_series(this_month - interval '11 months', this_month, interval '1 month') as g(m)
               left join public.profiles p on date_trunc('month', p.created_at at time zone 'Asia/Manila') = g.m
              group by g.m) t),
    'orders_by_month', (select coalesce(json_agg(json_build_object('month', to_char(t.m, 'YYYY-MM'), 'items', t.n, 'value', t.v) order by t.m), '[]'::json)
       from (select g.m,
                    count(i.id) as n,
                    coalesce(sum(i.amount), 0) as v
               from generate_series(this_month - interval '11 months', this_month, interval '1 month') as g(m)
               left join public.order_items i on i.status <> 'cancelled'
                     and date_trunc('month', i.created_at at time zone 'Asia/Manila') = g.m
              group by g.m) t),
    'listings_by_crop', (select coalesce(json_agg(json_build_object('crop', cg.name, 'listings', t.n, 'kg', t.kg) order by t.n desc, cg.name), '[]'::json)
       from (select c.group_id, count(*) as n, sum(l.quantity_kg) as kg
               from public.listings l join public.crops c on c.id = l.crop_id
              where l.status = 'active' group by c.group_id) t
       join public.crop_groups cg on cg.id = t.group_id),
    'users_by_town', (select coalesce(json_agg(json_build_object('town', t.town, 'users', t.n) order by t.n desc, t.town), '[]'::json)
       from (select public.town_of(p.location) as town, count(*) as n
               from public.profiles p where public.town_of(p.location) is not null
              group by 1 order by 2 desc, 1 limit 8) t)
  ) into r;
  return r;
end;
$$;

-- The users, newest first, a page at a time, found by name, member number,
-- phone (typed as 0917…, or +63 917…), email or town. A CP-number account's
-- stand-in address is never shown: its number is.
create or replace function public.admin_users(p_search text default '', p_role text default null, p_limit int default 50, p_offset int default 0)
returns table (
  id uuid, full_name text, role text, member_no text, location text, phone text, email text, avatar_url text,
  created_at timestamptz, last_sign_in_at timestamptz,
  listings bigint, purchases bigint, sales bigint, rating numeric, rating_count int, crops text[], total bigint)
language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
declare
  q text := coalesce(trim(p_search), '');
  digits text := regexp_replace(regexp_replace(coalesce(trim(p_search), ''), '^0', '63'), '\D', '', 'g');
begin
  perform public.admin_guard();
  return query
  select p.id, p.full_name, p.role::text, p.member_no, p.location, p.phone,
         (case when u.email like '%@phone.anisense.app' then null else u.email end)::text, p.avatar_url,
         p.created_at, u.last_sign_in_at,
         (select count(*) from public.listings l where l.seller_id = p.id),
         (select count(*) from public.orders o where o.buyer_id = p.id),
         (select count(*) from public.order_items i where i.seller_id = p.id and i.status <> 'cancelled'),
         p.rating, p.rating_count,
         coalesce((select array_agg(cg.name order by cg.sort_order) from public.profile_crops pc
                     join public.crop_groups cg on cg.id = pc.crop_group_id where pc.profile_id = p.id), '{}'::text[]),
         count(*) over ()
    from public.profiles p
    left join auth.users u on u.id = p.id
   where (p_role is null or p.role::text = p_role)
     and (q = ''
          or p.full_name ilike '%' || q || '%'
          or p.member_no ilike '%' || q || '%'
          or coalesce(p.location, '') ilike '%' || q || '%'
          or (u.email not like '%@phone.anisense.app' and coalesce(u.email, '') ilike '%' || q || '%')
          or (length(digits) >= 3 and regexp_replace(coalesce(p.phone, ''), '\D', '', 'g') like '%' || digits || '%'))
   order by p.created_at desc
   limit greatest(1, least(coalesce(p_limit, 50), 200)) offset greatest(0, coalesce(p_offset, 0));
end;
$$;

-- One user, all of it: the profile, crops, badges, their latest listings,
-- purchases and sales, and how much they keep in their farm records.
create or replace function public.admin_user(p_id uuid)
returns json language plpgsql stable security definer set search_path = '' as $$
declare
  r json;
begin
  perform public.admin_guard();
  select json_build_object(
    'id', p.id, 'full_name', p.full_name, 'role', p.role, 'member_no', p.member_no,
    'location', p.location, 'phone', p.phone,
    'email', case when u.email like '%@phone.anisense.app' then null else u.email end,
    'years_farming', p.years_farming, 'rating', p.rating, 'rating_count', p.rating_count,
    'avatar_url', p.avatar_url, 'created_at', p.created_at, 'last_sign_in_at', u.last_sign_in_at,
    'crops', coalesce((select json_agg(cg.name order by cg.sort_order) from public.profile_crops pc
                         join public.crop_groups cg on cg.id = pc.crop_group_id where pc.profile_id = p.id), '[]'::json),
    'badges', coalesce((select json_agg(json_build_object('id', a.id, 'name', a.name, 'earned_at', ua.earned_at) order by a.sort_order)
                          from public.user_achievements ua join public.achievements a on a.id = ua.achievement_id
                         where ua.profile_id = p.id), '[]'::json),
    'listings', coalesce((select json_agg(x order by x.created_at desc) from (
        select l.id, c.name as crop, l.price_per_kg, l.quantity_kg, l.status, l.location, l.created_at
          from public.listings l join public.crops c on c.id = l.crop_id
         where l.seller_id = p.id order by l.created_at desc limit 20) x), '[]'::json),
    'purchases', coalesce((select json_agg(x order by x.created_at desc) from (
        select i.created_at, c.name as crop, i.quantity_kg, i.amount, i.paid_amount, i.status, s.full_name as seller
          from public.order_items i join public.orders o on o.id = i.order_id
          join public.crops c on c.id = i.crop_id left join public.profiles s on s.id = i.seller_id
         where o.buyer_id = p.id order by i.created_at desc limit 20) x), '[]'::json),
    'sales', coalesce((select json_agg(x order by x.created_at desc) from (
        select i.created_at, c.name as crop, i.quantity_kg, i.amount, i.sold_amount, i.status, i.rating, b.full_name as buyer
          from public.order_items i join public.orders o on o.id = i.order_id
          join public.crops c on c.id = i.crop_id left join public.profiles b on b.id = o.buyer_id
         where i.seller_id = p.id order by i.created_at desc limit 20) x), '[]'::json),
    'records', json_build_object(
        'expenses', (select count(*) from public.expenses e where e.farmer_id = p.id),
        'expenses_total', (select coalesce(sum(e.amount), 0) from public.expenses e where e.farmer_id = p.id),
        'sales', (select count(*) from public.sales s where s.farmer_id = p.id),
        'sales_total', (select coalesce(sum(s.amount), 0) from public.sales s where s.farmer_id = p.id),
        'plantings', (select count(*) from public.plantings pl where pl.farmer_id = p.id))
  ) into r
  from public.profiles p left join auth.users u on u.id = p.id
  where p.id = p_id;
  if r is null then raise exception 'NOT_FOUND'; end if;
  return r;
end;
$$;

-- What is for sale, newest first, by status, found by crop, seller or town.
create or replace function public.admin_listings(p_status text default null, p_search text default '', p_limit int default 50, p_offset int default 0)
returns table (
  id uuid, crop text, crop_group text, seller_id uuid, seller text, member_no text,
  price_per_kg numeric, quantity_kg numeric, location text, status text, photo_url text, created_at timestamptz, total bigint)
language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
declare
  q text := coalesce(trim(p_search), '');
begin
  perform public.admin_guard();
  return query
  select l.id, c.name, cg.name, l.seller_id, p.full_name, p.member_no,
         l.price_per_kg, l.quantity_kg, l.location, l.status::text, l.photo_url, l.created_at,
         count(*) over ()
    from public.listings l
    join public.crops c on c.id = l.crop_id
    join public.crop_groups cg on cg.id = c.group_id
    left join public.profiles p on p.id = l.seller_id
   where (p_status is null or l.status::text = p_status)
     and (q = '' or c.name ilike '%' || q || '%' or cg.name ilike '%' || q || '%'
          or coalesce(p.full_name, '') ilike '%' || q || '%' or l.location ilike '%' || q || '%')
   order by l.created_at desc
   limit greatest(1, least(coalesce(p_limit, 50), 200)) offset greatest(0, coalesce(p_offset, 0));
end;
$$;

-- What has been ordered, a line each, newest first, by status.
create or replace function public.admin_orders(p_status text default null, p_limit int default 50, p_offset int default 0)
returns table (
  id uuid, order_id uuid, created_at timestamptz, buyer_id uuid, buyer text, seller_id uuid, seller text, crop text,
  quantity_kg numeric, price_per_kg numeric, amount numeric, sold_amount numeric, paid_amount numeric,
  status text, rating smallint, total bigint)
language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
begin
  perform public.admin_guard();
  return query
  select i.id, i.order_id, i.created_at, o.buyer_id, b.full_name, i.seller_id, s.full_name, c.name,
         i.quantity_kg, i.price_per_kg, i.amount, i.sold_amount, i.paid_amount,
         i.status::text, i.rating, count(*) over ()
    from public.order_items i
    join public.orders o on o.id = i.order_id
    join public.crops c on c.id = i.crop_id
    left join public.profiles b on b.id = o.buyer_id
    left join public.profiles s on s.id = i.seller_id
   where (p_status is null or i.status::text = p_status)
   order by i.created_at desc
   limit greatest(1, least(coalesce(p_limit, 50), 200)) offset greatest(0, coalesce(p_offset, 0));
end;
$$;

-- The badges the admin gives, and who holds them.
create or replace function public.admin_awards()
returns table (profile_id uuid, full_name text, member_no text, location text, achievement_id text, achievement text, earned_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
begin
  perform public.admin_guard();
  return query
  select ua.profile_id, p.full_name, p.member_no, p.location, a.id, a.name, ua.earned_at
    from public.user_achievements ua
    join public.achievements a on a.id = ua.achievement_id and a.awarded_by = 'admin'
    join public.profiles p on p.id = ua.profile_id
   order by ua.earned_at desc;
end;
$$;

-- Gives or takes back one of the admin's badges, to a farmer only.
create or replace function public.admin_set_award(p_user uuid, p_badge text, p_on boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.admin_guard();
  if not exists (select 1 from public.achievements a where a.id = p_badge and a.awarded_by = 'admin') then
    raise exception 'NOT_AN_ADMIN_BADGE';
  end if;
  if not exists (select 1 from public.profiles p where p.id = p_user and p.role = 'farmer') then
    raise exception 'NOT_A_FARMER';
  end if;
  if p_on then
    insert into public.user_achievements (profile_id, achievement_id) values (p_user, p_badge) on conflict do nothing;
  else
    delete from public.user_achievements where profile_id = p_user and achievement_id = p_badge;
  end if;
end;
$$;

-- ─── Prices: the month's retail prices, put in by the admin ────────────────
-- What the Prices page shows for one month (this month, Philippine time,
-- when none is given): every variety in the catalog, with its price for that
-- month if it has one, the record before it, its last twelve records for the
-- little trend line, and how many records it has in all; and when the
-- forecasts were made, so the page can say when new prices have overtaken
-- them.
create or replace function public.admin_price_board(p_month date default null)
returns json language plpgsql stable security definer set search_path = '' as $$
declare
  this_month date := date_trunc('month', now() at time zone 'Asia/Manila')::date;
  m date := coalesce(date_trunc('month', p_month)::date, date_trunc('month', now() at time zone 'Asia/Manila')::date);
  r json;
begin
  perform public.admin_guard();
  select json_build_object(
    'month', m,
    'this_month', this_month,
    'latest_month', (select max(p.price_date) from public.crop_prices p where not p.is_sample),
    'forecasts', (select json_build_object('made_on', max(f.generated_on), 'first_month', min(f.target_month), 'last_month', max(f.target_month))
                    from public.crop_forecasts f),
    'crops', coalesce((select json_agg(x order by x.group_sort, x.sort, x.name) from (
        select c.id, c.name, c.sort_order as sort, g.name as group_name, g.sort_order as group_sort,
               cur.price_per_kg as price, cur.change_pct as change, cur.source, cur.entered_at, u.email as entered_by,
               (select json_build_object('month', b.price_date, 'price', b.price_per_kg) from public.crop_prices b
                 where b.crop_id = c.id and not b.is_sample and b.price_date < m order by b.price_date desc limit 1) as before,
               coalesce((select json_agg(json_build_object('month', h.price_date, 'price', h.price_per_kg) order by h.price_date) from (
                   select hh.price_date, hh.price_per_kg from public.crop_prices hh
                    where hh.crop_id = c.id and not hh.is_sample and hh.price_date < m
                    order by hh.price_date desc limit 12) h), '[]'::json) as history,
               (select count(*) from public.crop_prices n where n.crop_id = c.id and not n.is_sample) as records,
               exists (select 1 from public.crop_forecasts f where f.crop_id = c.id) as forecast
          from public.crops c
          join public.crop_groups g on g.id = c.group_id
          left join public.crop_prices cur on cur.crop_id = c.id and cur.price_date = m and not cur.is_sample
          left join auth.users u on u.id = cur.entered_by) x), '[]'::json)
  ) into r;
  return r;
end;
$$;

-- Saves one month's prices from the Prices page, all or none.
-- p_prices = {"rice-special": 57.80, "onion-red": null}: a number is that
-- variety's price per kilo for the month (put in, or put right); null takes
-- the month's price away. Dated the 1st of the month, like every record. Not
-- a month still to come. Each record's move from the one before it
-- (change_pct, in %) is worked out again for the varieties saved, so a month
-- put in late or put right leaves the month after it right too.
-- Errors the page turns into words: FUTURE_MONTH, BAD_MONTH, NO_PRICES,
-- UNKNOWN_CROP, BAD_PRICE.
create or replace function public.admin_set_prices(p_month date, p_prices jsonb, p_source text default null)
returns json language plpgsql security definer set search_path = '' as $$
declare
  m date := date_trunc('month', p_month)::date;
  k text;
  v jsonb;
  price numeric;
  touched text[] := '{}';
  n_saved int := 0;
  n_removed int := 0;
begin
  perform public.admin_guard();
  if m is null or m < date '2000-01-01' then raise exception 'BAD_MONTH'; end if;
  if m > date_trunc('month', now() at time zone 'Asia/Manila')::date then raise exception 'FUTURE_MONTH'; end if;
  if p_prices is null or jsonb_typeof(p_prices) <> 'object' or p_prices = '{}'::jsonb then raise exception 'NO_PRICES'; end if;
  for k, v in select e.key, e.value from jsonb_each(p_prices) e loop
    if not exists (select 1 from public.crops c where c.id = k) then raise exception 'UNKNOWN_CROP'; end if;
    if jsonb_typeof(v) = 'null' then
      delete from public.crop_prices where crop_id = k and price_date = m;
      if found then n_removed := n_removed + 1; end if;
    else
      if jsonb_typeof(v) <> 'number' then raise exception 'BAD_PRICE'; end if;
      price := round((v #>> '{}')::numeric, 2);
      if price <= 0 or price > 100000 then raise exception 'BAD_PRICE'; end if;
      insert into public.crop_prices (crop_id, price_date, price_per_kg, change_pct, is_sample, source, entered_by, entered_at)
      values (k, m, price, 0, false, nullif(trim(p_source), ''), auth.uid(), now())
      on conflict (crop_id, price_date) do update
        set price_per_kg = excluded.price_per_kg, is_sample = false,
            source = excluded.source, entered_by = excluded.entered_by, entered_at = excluded.entered_at;
      n_saved := n_saved + 1;
    end if;
    touched := touched || k;
  end loop;
  -- Each record against the one before it, to one decimal, as seed.sql does.
  update public.crop_prices p
     set change_pct = x.change
    from (select cp.id,
                 greatest(-999.9, least(999.9, coalesce(round((cp.price_per_kg / lag(cp.price_per_kg) over w - 1) * 100, 1), 0))) as change
            from public.crop_prices cp
           where cp.crop_id = any(touched) and not cp.is_sample
          window w as (partition by cp.crop_id order by cp.price_date)) x
   where p.id = x.id and p.change_pct is distinct from x.change;
  return json_build_object('saved', n_saved, 'removed', n_removed);
end;
$$;

revoke all on function public.admin_price_board(date)                from public, anon;
revoke all on function public.admin_set_prices(date, jsonb, text)    from public, anon;
grant execute on function public.admin_price_board(date)              to authenticated;
grant execute on function public.admin_set_prices(date, jsonb, text)  to authenticated;
revoke all on function public.admin_overview()                       from public, anon;
revoke all on function public.admin_users(text, text, int, int)      from public, anon;
revoke all on function public.admin_user(uuid)                       from public, anon;
revoke all on function public.admin_listings(text, text, int, int)   from public, anon;
revoke all on function public.admin_orders(text, int, int)           from public, anon;
revoke all on function public.admin_awards()                         from public, anon;
revoke all on function public.admin_set_award(uuid, text, boolean)   from public, anon;
grant execute on function public.admin_overview()                     to authenticated;
grant execute on function public.admin_users(text, text, int, int)    to authenticated;
grant execute on function public.admin_user(uuid)                     to authenticated;
grant execute on function public.admin_listings(text, text, int, int) to authenticated;
grant execute on function public.admin_orders(text, int, int)         to authenticated;
grant execute on function public.admin_awards()                       to authenticated;
grant execute on function public.admin_set_award(uuid, text, boolean) to authenticated;
