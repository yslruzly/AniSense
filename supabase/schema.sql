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
--    2. Accounts       profiles ─< profile_crops >─ crop_groups
--    3. Market         listings ─< order_items >─ orders
--    4. Farm records   expenses · sales · plantings · price_alerts · harvest_plans
--    5. Rewards        achievements ─< user_achievements
--
--  followed by
--    6. Security       row level security: who may read and change what
--    7. Functions      sign-up, checkout, farm-record sync, badges
--    8. Storage        listing photos
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

-- One price per variety per day: the market's history.
create table if not exists public.crop_prices (
  id            bigint generated always as identity primary key,
  crop_id       text not null references public.crops(id) on delete cascade,
  price_date    date not null default current_date,
  price_per_kg  numeric(10,2) not null check (price_per_kg > 0),
  change_pct    numeric(5,2) not null default 0,          -- against the day before, in %
  unique (crop_id, price_date)
);

-- Today's board: the newest price for each variety.
create or replace view public.crop_prices_latest
  with (security_invoker = true) as
  select distinct on (crop_id) crop_id, price_date, price_per_kg, change_pct
  from public.crop_prices
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
  years_farming   int check (years_farming between 0 and 80),
  bio             text,
  rating          numeric(2,1) not null default 5.0 check (rating between 0 and 5),
  total_sales     int not null default 0,                -- orders received through the market
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
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

create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  buyer_id      uuid not null references public.profiles(id) on delete cascade,
  total_amount  numeric(12,2) not null default 0,
  created_at    timestamptz not null default now()
);

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
-- allow. Nothing at all is open to someone who is not signed in.

alter table public.crop_groups        enable row level security;
alter table public.crops              enable row level security;
alter table public.crop_prices        enable row level security;
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

-- Catalog and badge list: read by everyone signed in; changed by the admin.
drop policy if exists "catalog: read" on public.crop_groups;
create policy "catalog: read" on public.crop_groups for select to authenticated using (true);
drop policy if exists "catalog: read" on public.crops;
create policy "catalog: read" on public.crops for select to authenticated using (true);
drop policy if exists "catalog: read" on public.crop_prices;
create policy "catalog: read" on public.crop_prices for select to authenticated using (true);
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
grant update (full_name, phone, location, years_farming, bio) on public.profiles to authenticated;

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
    'badges', (select count(*) from achievements)
  );
$$;
grant execute on function public.catalog_status() to anon, authenticated;

-- Who may call what: signed-in users only, never anonymous visitors.
revoke all on function public.can_see_order(uuid)               from public, anon;
revoke all on function public.is_my_buyer(uuid)                 from public, anon;
revoke all on function public.set_my_crops(text[])              from public, anon;
revoke all on function public.place_order(jsonb)                from public, anon;
revoke all on function public.replace_my_sales(jsonb)           from public, anon;
revoke all on function public.replace_my_plantings(jsonb)       from public, anon;
revoke all on function public.replace_my_price_alerts(jsonb)    from public, anon;
revoke all on function public.replace_my_harvest_plans(jsonb)   from public, anon;
grant execute on function public.can_see_order(uuid)             to authenticated;
grant execute on function public.is_my_buyer(uuid)               to authenticated;
grant execute on function public.set_my_crops(text[])            to authenticated;
grant execute on function public.place_order(jsonb)              to authenticated;
grant execute on function public.replace_my_sales(jsonb)         to authenticated;
grant execute on function public.replace_my_plantings(jsonb)     to authenticated;
grant execute on function public.replace_my_price_alerts(jsonb)  to authenticated;
grant execute on function public.replace_my_harvest_plans(jsonb) to authenticated;


-- ═══ 8. STORAGE: listing photos ══════════════════════════════════════════════
-- A public bucket, so a photo loads from its address like any image. Each
-- farmer can only write inside their own folder ("<their user id>/..."). Photos
-- are shrunk on the phone first; the 3 MB cap is a guard, not a target.
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
drop policy if exists "farmers delete own listing photos" on storage.objects;
create policy "farmers delete own listing photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
