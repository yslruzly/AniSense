-- ═══════════════════════════════════════════════════════════════════════════
--  ⚠  AniSense: WIPE THE DATABASE  (development only)
--
--  Deletes every AniSense table, rule, function and type, and ALL their data:
--  profiles, listings, orders, expenses, everything. It cannot be undone.
--
--  Use it only to start over while building or testing, then run schema.sql
--  and seed.sql again. Never run it on a project real people are using.
--
--  Not touched here, do these by hand if you want a truly clean slate:
--    · Authentication → Users: delete the test accounts (their profiles are
--      gone after this script, so old logins would open with no profile)
--    · Storage → listing-photos: empty the bucket
-- ═══════════════════════════════════════════════════════════════════════════

drop trigger if exists on_auth_user_created on auth.users;

drop view if exists public.crop_prices_latest;

drop table if exists
  public.user_achievements,
  public.achievements,
  public.harvest_plans,
  public.price_alerts,
  public.plantings,
  public.sales,
  public.expenses,
  public.order_items,
  public.orders,
  public.transactions,        -- from the first version of the schema
  public.listings,
  public.profile_crops,
  public.profiles,
  public.crop_prices,
  public.crops,
  public.crop_groups
cascade;

drop function if exists
  public.handle_new_user(),
  public.touch_updated_at(),
  public.award(uuid, text),
  public.award_on_profile(),
  public.award_on_listing(),
  public.award_on_sale(),
  public.award_on_order_item(),
  public.can_see_order(uuid),
  public.is_my_buyer(uuid),
  public.set_my_crops(text[]),
  public.place_order(jsonb),
  public.replace_my_sales(jsonb),
  public.replace_my_plantings(jsonb),
  public.replace_my_price_alerts(jsonb),
  public.replace_my_harvest_plans(jsonb),
  public.delete_my_account(),
  public.catalog_status()
cascade;

drop type if exists
  public.user_role,
  public.crop_family,
  public.listing_status,
  public.order_item_status,
  public.expense_category
cascade;
