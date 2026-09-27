-- ═══════════════════════════════════════════════════════════════════════════
-- AniSense Database Schema
-- Dashboard → SQL Editor → New query → paste everything → Run.
-- (See SETUP_DATABASE.md, Step 2.)
--
-- Safe to run again: every table, column, policy and function is created
-- "if not exists" or replaced, so re-running after an edit or a failed first
-- attempt fixes things up instead of erroring out.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. PROFILES ─────────────────────────────────────────────────────────────
-- Extends Supabase's built-in auth.users. One row per user, created
-- automatically by the trigger at the bottom of this file when someone signs up.
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  role           text not null default 'farmer' check (role in ('farmer', 'buyer')),
  full_name      text not null default '',
  phone          text,                          -- E.164 format: +639171234567
  phone_verified boolean not null default false,
  location       text,                          -- e.g. "Cabanatuan City, Nueva Ecija"
  years_farming  int,
  crops          text[] not null default '{}',  -- e.g. {"Rice","Corn"}
  bio            text,
  rating         numeric(2,1) not null default 5.0,
  total_sales    int not null default 0,
  created_at     timestamptz not null default now()
);

-- ─── 2. LISTINGS (marketplace) ───────────────────────────────────────────────
create table if not exists public.listings (
  id            uuid primary key default gen_random_uuid(),
  seller_id     uuid not null references public.profiles(id) on delete cascade,
  crop          text not null,                 -- e.g. "Special Rice"
  variety       text not null default '',
  description   text not null default '',
  price_per_kg  numeric(10,2) not null check (price_per_kg > 0),
  kg            numeric(10,2) not null check (kg >= 0),   -- what is left; 0 once sold out
  location      text not null default '',
  photo_url     text,                          -- the farmer's own photo, in Storage
  status        text not null default 'active' check (status in ('active', 'sold', 'removed')),
  created_at    timestamptz not null default now()
);
alter table public.listings add column if not exists photo_url text;
-- Stock goes down as orders come in, so a sold-out listing sits at 0 kg.
alter table public.listings drop constraint if exists listings_kg_check;
alter table public.listings add constraint listings_kg_check check (kg >= 0);

-- ─── 3. EXPENSES (farmer expense tracker) ────────────────────────────────────
create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  farmer_id   uuid not null references public.profiles(id) on delete cascade,
  category    text not null,                   -- Seeds / Fertilizer / Labor / Equipment / Irrigation / Other
  description text not null,
  crop        text not null default 'Rice',
  amount      numeric(12,2) not null check (amount > 0),
  spent_on    date not null default current_date,
  created_at  timestamptz not null default now()
);

-- ─── 4. TRANSACTIONS (one row per line of a buyer's order) ───────────────────
-- Written only by place_order() below, never directly by the app, so the
-- price and the amount always come from the listing, not from the phone.
create table if not exists public.transactions (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null default gen_random_uuid(),  -- the lines of one checkout share it
  buyer_id      uuid not null references public.profiles(id) on delete cascade,
  listing_id    uuid not null references public.listings(id),
  seller_id     uuid not null references public.profiles(id),
  crop          text not null,
  variety       text not null default '',
  kg            numeric(10,2) not null check (kg > 0),
  price_per_kg  numeric(10,2) not null default 0,
  amount        numeric(12,2) not null,                   -- kg * price_per_kg at time of sale
  location      text not null default '',
  created_at    timestamptz not null default now()
);
alter table public.transactions add column if not exists order_id uuid not null default gen_random_uuid();
alter table public.transactions add column if not exists price_per_kg numeric(10,2) not null default 0;

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists listings_seller_idx     on public.listings (seller_id);
create index if not exists listings_status_idx     on public.listings (status, created_at desc);
create index if not exists expenses_farmer_idx     on public.expenses (farmer_id, spent_on desc);
create index if not exists transactions_buyer_idx  on public.transactions (buyer_id, created_at desc);
create index if not exists transactions_seller_idx on public.transactions (seller_id, created_at desc);
create index if not exists transactions_order_idx  on public.transactions (order_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- These rules are enforced BY THE DATABASE, so even a tampered app can only
-- do what the policies allow. The anon key in the app is safe because of this.
-- Nothing here is open to signed-out visitors.
-- ═══════════════════════════════════════════════════════════════════════════
alter table public.profiles     enable row level security;
alter table public.listings     enable row level security;
alter table public.expenses     enable row level security;
alter table public.transactions enable row level security;

-- Profiles: your own, every farmer (buyers need to see who they buy from),
-- and the buyers who have ordered from you. A buyer's phone number is not
-- visible to everyone signed in, only to farmers they have ordered from.
drop policy if exists "profiles are viewable by signed-in users" on public.profiles;
drop policy if exists "profiles visible to self, farmers, trading partners" on public.profiles;
create policy "profiles visible to self, farmers, trading partners"
  on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or role = 'farmer'
    or exists (select 1 from public.transactions t
               where t.seller_id = auth.uid() and t.buyer_id = profiles.id)
  );

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
-- Only the fields a person may change about themselves. Rating, sales count,
-- role and verification are the app's to set, not the account holder's.
revoke update on public.profiles from authenticated, anon;
grant update (full_name, phone, location, years_farming, crops, bio) on public.profiles to authenticated;

-- Listings: everyone signed in can browse; only the seller can manage theirs.
drop policy if exists "listings are viewable by signed-in users" on public.listings;
create policy "listings are viewable by signed-in users"
  on public.listings for select to authenticated using (true);
drop policy if exists "farmers can create own listings" on public.listings;
create policy "farmers can create own listings"
  on public.listings for insert to authenticated with check (auth.uid() = seller_id);
drop policy if exists "farmers can update own listings" on public.listings;
create policy "farmers can update own listings"
  on public.listings for update to authenticated
  using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
drop policy if exists "farmers can delete own listings" on public.listings;
create policy "farmers can delete own listings"
  on public.listings for delete to authenticated using (auth.uid() = seller_id);

-- Expenses: strictly private to the farmer who recorded them.
drop policy if exists "farmers manage own expenses" on public.expenses;
create policy "farmers manage own expenses"
  on public.expenses for all to authenticated
  using (auth.uid() = farmer_id) with check (auth.uid() = farmer_id);

-- Transactions: visible to the buyer and the seller involved. No insert
-- policy on purpose: orders go through place_order(), which checks stock and
-- takes the price from the listing.
drop policy if exists "participants can view transactions" on public.transactions;
create policy "participants can view transactions"
  on public.transactions for select to authenticated
  using (auth.uid() = buyer_id or auth.uid() = seller_id);
drop policy if exists "buyers can create transactions" on public.transactions;

-- ═══════════════════════════════════════════════════════════════════════════
-- CHECKOUT: place_order(items)
-- items = [{"listing_id": "...", "kg": 5}, ...]
-- All or nothing: every line is checked against live stock, stock goes down,
-- the lines are written with the listing's own price, and the farmer's sales
-- count goes up. If any line fails, none of it happens.
-- Errors the app turns into messages: LISTING_GONE, NOT_ENOUGH, OWN_LISTING.
-- ═══════════════════════════════════════════════════════════════════════════
create or replace function public.place_order(items jsonb)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  buyer   uuid := auth.uid();
  new_id  uuid := gen_random_uuid();
  item    jsonb;
  l       public.listings%rowtype;
  q       numeric;
begin
  if buyer is null then
    raise exception 'NOT_SIGNED_IN';
  end if;
  if items is null or jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 then
    raise exception 'EMPTY_ORDER';
  end if;

  for item in select * from jsonb_array_elements(items) loop
    q := (item ->> 'kg')::numeric;
    if q is null or q <= 0 then
      raise exception 'BAD_QUANTITY';
    end if;

    -- Locks the row, so two buyers can't both take the last 10 kg.
    select * into l from public.listings
      where id = (item ->> 'listing_id')::uuid and status = 'active'
      for update;
    if not found then
      raise exception 'LISTING_GONE';
    end if;
    if l.seller_id = buyer then
      raise exception 'OWN_LISTING';
    end if;
    if l.kg < q then
      raise exception 'NOT_ENOUGH';
    end if;

    update public.listings
      set kg = kg - q,
          status = case when kg - q <= 0 then 'sold' else status end
      where id = l.id;

    insert into public.transactions
      (order_id, buyer_id, listing_id, seller_id, crop, variety, kg, price_per_kg, amount, location)
    values
      (new_id, buyer, l.id, l.seller_id, l.crop, l.variety, q, l.price_per_kg, round(q * l.price_per_kg, 2), l.location);

    update public.profiles set total_sales = total_sales + 1 where id = l.seller_id;
  end loop;

  return new_id;
end;
$$;

revoke all on function public.place_order(jsonb) from public, anon;
grant execute on function public.place_order(jsonb) to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGER: auto-create a profile row when a new user signs up.
-- Everything the sign-up form asked arrives as metadata from createAccount()
-- in src/services/auth.ts, so the profile is complete from its first second.
-- ═══════════════════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, location, phone, years_farming, crops)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when new.raw_user_meta_data ->> 'role' = 'buyer' then 'buyer' else 'farmer' end,
    new.raw_user_meta_data ->> 'location',
    new.raw_user_meta_data ->> 'phone',
    nullif(new.raw_user_meta_data ->> 'years_farming', '')::int,
    coalesce(
      array(select jsonb_array_elements_text(
        case when jsonb_typeof(new.raw_user_meta_data -> 'crops') = 'array'
             then new.raw_user_meta_data -> 'crops' else '[]'::jsonb end)),
      '{}'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════
-- STORAGE: listing photos
-- A public bucket, so a photo loads from its URL like any image. Each farmer
-- can only write inside their own folder ("<their user id>/..."). Photos are
-- shrunk on the phone first; the 3 MB cap is a guard, not a target.
-- ═══════════════════════════════════════════════════════════════════════════
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
