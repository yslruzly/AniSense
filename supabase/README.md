# AniSense database

PostgreSQL on Supabase, in five sections. Every feature of the app keeps its data here once a project is connected (see `SETUP_DATABASE.md`).

| File | What it is | When to run it |
|---|---|---|
| `schema.sql` | Every table, security rule and function | First. Safe to run again. |
| `seed.sql` | The crop catalog, today's prices, the badges | Second. Safe to run again. Generated: edit `src/data/crops.ts`, then `node scripts/build-seed.mjs`. |
| `reset.sql` | ⚠ Deletes everything | Development only, to start over. |

## How the tables connect

```mermaid
erDiagram
  %% Catalog
  crop_groups ||--o{ crops : "has varieties"
  crops ||--o{ crop_prices : "priced daily"

  %% Accounts
  profiles ||--o{ profile_crops : "grows"
  crop_groups ||--o{ profile_crops : ""

  %% Market
  profiles ||--o{ listings : "sells"
  crops ||--o{ listings : "listed as"
  profiles ||--o{ orders : "buys"
  orders ||--|{ order_items : "contains"
  listings ||--o{ order_items : "bought from"
  crops ||--o{ order_items : ""

  %% Farm records
  profiles ||--o{ expenses : "spends"
  profiles ||--o{ sales : "records"
  profiles ||--o{ plantings : "plants"
  profiles ||--o{ price_alerts : "watches"
  profiles ||--o{ harvest_plans : "expects"
  crop_groups ||--o{ expenses : ""
  crop_groups ||--o{ sales : ""
  crop_groups ||--o{ plantings : ""
  crop_groups ||--o{ harvest_plans : ""
  crops ||--o{ price_alerts : ""

  %% Rewards
  achievements ||--o{ user_achievements : "earned as"
  profiles ||--o{ user_achievements : "earns"

  crop_groups {
    text id PK "rice"
    text name UK "Rice"
    crop_family family "Crops / Vegetables / Fruits"
    int days_to_harvest
  }
  crops {
    text id PK "rice-special"
    text group_id FK
    text name UK "Special Rice"
  }
  crop_prices {
    bigint id PK
    text crop_id FK
    date price_date
    numeric price_per_kg
    numeric change_pct
  }
  profiles {
    uuid id PK "= auth.users.id"
    user_role role "farmer / buyer"
    text full_name
    text phone
    text location
    int years_farming
    numeric rating
    int total_sales
  }
  profile_crops {
    uuid profile_id PK,FK
    text crop_group_id PK,FK
  }
  listings {
    uuid id PK
    uuid seller_id FK
    text crop_id FK
    numeric price_per_kg
    numeric quantity_kg "what is left"
    text location
    text photo_url
    listing_status status "active / sold / removed"
  }
  orders {
    uuid id PK
    uuid buyer_id FK
    numeric total_amount
    timestamptz created_at
  }
  order_items {
    uuid id PK
    uuid order_id FK
    uuid listing_id FK
    uuid seller_id FK
    text crop_id FK
    numeric quantity_kg
    numeric price_per_kg "at the time of sale"
    numeric amount "generated"
    order_item_status status "placed / confirmed / completed / cancelled"
  }
  expenses {
    uuid id PK
    uuid farmer_id FK
    expense_category category
    text description
    text crop_group_id FK
    numeric amount
    date spent_on
  }
  sales {
    uuid id PK
    uuid farmer_id FK
    text crop_group_id FK
    numeric quantity_kg
    numeric price_per_kg
    numeric amount "generated"
    date sold_on
    text buyer_name
  }
  plantings {
    uuid id PK
    uuid farmer_id FK
    text crop_group_id FK
    date planted_on
    int days_to_harvest
  }
  price_alerts {
    uuid id PK
    uuid farmer_id FK
    text crop_id FK
    numeric target_price
    numeric price_when_set
  }
  harvest_plans {
    uuid farmer_id PK,FK
    text crop_group_id PK,FK
    numeric expected_kg
  }
  achievements {
    text id PK "first-harvest"
    text name
    text awarded_by "auto / admin"
  }
  user_achievements {
    uuid profile_id PK,FK
    text achievement_id PK,FK
    timestamptz earned_at
  }
```

## The tables

**1. Catalog.** What can be grown, sold and priced. Reference data, changed by the admin only.
- `crop_groups`: the 10 crop types (Rice, Corn, Onions…), their family and typical days to harvest.
- `crops`: the 24 varieties (Special Rice, Red Onion, Carabao Mango…).
- `crop_prices`: one price per variety per day. The view `crop_prices_latest` gives today's board.

**2. Accounts.**
- `profiles`: one per person, created automatically at sign-up.
- `profile_crops`: which crop types each farmer grows.

**3. Market.**
- `listings`: harvests for sale. `quantity_kg` goes down as orders come in.
- `orders`: one per checkout.
- `order_items`: one line per listing bought. Price, crop and seller are copied at the moment of sale, so history never changes.

**4. Farm records.** Private to each farmer.
- `expenses`: costs by category and crop.
- `sales`: sales made outside the app. Market sales are the farmer's `order_items`.
- `plantings`: what is in the ground, for the harvest countdown.
- `price_alerts`: target prices to watch.
- `harvest_plans`: expected kilos per crop, for estimated profit.

**5. Rewards.**
- `achievements`: the 6 badges.
- `user_achievements`: who earned which, and when.

## Functions

| Function | Does |
|---|---|
| `handle_new_user()` | Trigger: builds the profile and crop list from the sign-up form |
| `place_order(items)` | Checkout, all or nothing: checks stock, lowers it, writes the order at the listing's price |
| `set_my_crops(names)` | Replaces the farmer's crop list |
| `replace_my_sales / plantings / price_alerts / harvest_plans` | Saves one of the farmer's lists in one step (used by the app, also after being offline) |
| `award…` triggers | Awards Newbie on sign-up, First harvest on a first listing, First sale on a first sale |
| `catalog_status()` | Counts only, for `npm run check:db` |

## Security

Row Level Security is on for every table; the database enforces it, not the app.
- Nobody signed out can read anything.
- Farmers manage only their own listings and records.
- A buyer's phone number is visible only to farmers they have ordered from.
- Orders can only be made through `place_order()`.
- Nobody can edit their own rating or sales count.
- Farmers can move their own order lines to confirmed or completed, and change nothing else about them.

## Everyday admin

**Add a new day's prices.** In SQL Editor (or Table Editor → `crop_prices`). The app always shows the newest day.
```sql
insert into crop_prices (crop_id, price_date, price_per_kg, change_pct) values
  ('rice-special', current_date, 66, 1.5),
  ('onion-red',    current_date, 44, -2.2)
on conflict (crop_id, price_date) do update set price_per_kg = excluded.price_per_kg, change_pct = excluded.change_pct;
```

**Name a Farmer of the Month or Year.** Copy the farmer's id from Table Editor → `profiles`.
```sql
insert into user_achievements (profile_id, achievement_id)
values ('<farmer id>', 'farmer-of-the-month');
```
