-- ═══════════════════════════════════════════════════════════════════════════
-- AniSense — Database Schema
-- Run this ONCE in your Supabase project: Dashboard → SQL Editor → New query
-- → paste everything → Run. (See SETUP_DATABASE.md, Step 2.)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. PROFILES ─────────────────────────────────────────────────────────────
-- Extends Supabase's built-in auth.users. One row per user, created
-- automatically by the trigger at the bottom of this file when someone signs up.
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          text not null default 'farmer' check (role in ('farmer', 'buyer')),
  full_name     text not null default '',
  phone         text,                          -- E.164 format: +639171234567
  phone_verified boolean not null default false,
  location      text,                          -- e.g. "Cabanatuan City, Nueva Ecija"
  years_farming int,
  crops         text[] not null default '{}',  -- e.g. {"Rice","Corn"}
  bio           text,
  rating        numeric(2,1) not null default 5.0,
  total_sales   int not null default 0,
  created_at    timestamptz not null default now()
);

-- ─── 2. LISTINGS (marketplace) ───────────────────────────────────────────────
create table public.listings (
  id            uuid primary key default gen_random_uuid(),
  seller_id     uuid not null references public.profiles(id) on delete cascade,
  crop          text not null,                 -- e.g. "Special Rice"
  variety       text not null default '',
  description   text not null default '',
  price_per_kg  numeric(10,2) not null check (price_per_kg > 0),
  kg            numeric(10,2) not null check (kg > 0),
  location      text not null default '',
  status        text not null default 'active' check (status in ('active', 'sold', 'removed')),
  created_at    timestamptz not null default now()
);

-- ─── 3. EXPENSES (farmer expense tracker) ────────────────────────────────────
create table public.expenses (
  id          uuid primary key default gen_random_uuid(),
  farmer_id   uuid not null references public.profiles(id) on delete cascade,
  category    text not null,                   -- Seeds / Fertilizer / Labor / Equipment / Irrigation / Other
  description text not null,
  crop        text not null default 'Rice',
  amount      numeric(12,2) not null check (amount > 0),
  spent_on    date not null default current_date,
  created_at  timestamptz not null default now()
);

-- ─── 4. TRANSACTIONS (buyer purchases / checkout) ────────────────────────────
create table public.transactions (
  id          uuid primary key default gen_random_uuid(),
  buyer_id    uuid not null references public.profiles(id) on delete cascade,
  listing_id  uuid not null references public.listings(id),
  seller_id   uuid not null references public.profiles(id),
  crop        text not null,
  variety     text not null default '',
  kg          numeric(10,2) not null check (kg > 0),
  amount      numeric(12,2) not null,          -- kg * price_per_kg at time of sale
  location    text not null default '',
  created_at  timestamptz not null default now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index listings_seller_idx     on public.listings (seller_id);
create index listings_status_idx     on public.listings (status);
create index expenses_farmer_idx     on public.expenses (farmer_id, spent_on desc);
create index transactions_buyer_idx  on public.transactions (buyer_id, created_at desc);
create index transactions_seller_idx on public.transactions (seller_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- These rules are enforced BY THE DATABASE, so even a tampered app can only
-- do what the policies allow. The anon key in the app is safe because of this.
-- ═══════════════════════════════════════════════════════════════════════════
alter table public.profiles     enable row level security;
alter table public.listings     enable row level security;
alter table public.expenses     enable row level security;
alter table public.transactions enable row level security;

-- Profiles: any signed-in user can view profiles (buyers need to see seller
-- details), but you can only edit your own.
create policy "profiles are viewable by signed-in users"
  on public.profiles for select to authenticated using (true);
create policy "users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- Listings: everyone signed in can browse; only the seller can manage theirs.
create policy "listings are viewable by signed-in users"
  on public.listings for select to authenticated using (true);
create policy "farmers can create own listings"
  on public.listings for insert to authenticated with check (auth.uid() = seller_id);
create policy "farmers can update own listings"
  on public.listings for update to authenticated using (auth.uid() = seller_id);
create policy "farmers can delete own listings"
  on public.listings for delete to authenticated using (auth.uid() = seller_id);

-- Expenses: strictly private to the farmer who recorded them.
create policy "farmers manage own expenses"
  on public.expenses for all to authenticated
  using (auth.uid() = farmer_id) with check (auth.uid() = farmer_id);

-- Transactions: visible to the buyer and the seller involved; created by buyers.
create policy "participants can view transactions"
  on public.transactions for select to authenticated
  using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "buyers can create transactions"
  on public.transactions for insert to authenticated with check (auth.uid() = buyer_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGER: auto-create a profile row when a new user signs up.
-- The name/role/crops come from the metadata passed by signUpWithEmail()
-- in src/services/auth.ts.
-- ═══════════════════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'farmer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
