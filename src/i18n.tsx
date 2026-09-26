// ─────────────────────────────────────────────────────────────────────────────
// AniSense i18n: English / Filipino (Tagalog)
//
// HOW TO USE
// 1. Put this file in src/ (next to App.tsx).
// 2. Wrap your app once, in main.tsx:
//      import { LanguageProvider } from "./i18n";
//      <LanguageProvider><App /></LanguageProvider>
// 3. In any component:
//      import { useLang } from "./i18n";
//      const { t, lang, setLang } = useLang();
//      <div>{t("home_current_prices")}</div>
// 4. For the Profile > Language row, drop in the ready-made toggle:
//      import { LanguageToggle } from "./i18n";
//      <LanguageToggle />
//
// The chosen language is kept in React state (in-memory). If you later add
// Capacitor Preferences, persist `lang` there in setLang.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState } from "react";

export type Lang = "en" | "tl";

type Dict = Record<string, { en: string; tl: string }>;

export const translations: Dict = {
  // ── Common ────────────────────────────────────────────────────────────────
  continue: { en: "Continue", tl: "Magpatuloy" },
  back: { en: "Back", tl: "Bumalik" },
  cancel: { en: "Cancel", tl: "Kanselahin" },
  save: { en: "Save", tl: "I-save" },
  delete: { en: "Delete", tl: "Burahin" },
  edit: { en: "Edit", tl: "I-edit" },
  close: { en: "Close", tl: "Isara" },
  search: { en: "Search", tl: "Maghanap" },
  all: { en: "All", tl: "Lahat" },
  online: { en: "Online", tl: "Online" },
  offline: { en: "Offline", tl: "Offline" },
  per_kg: { en: "per kg", tl: "kada kilo" },
  /** Compact suffix that sits directly against a figure: ₱24.50/kilo */
  per_kg_short: { en: "/kg", tl: "/kilo" },
  good_morning: { en: "Good Morning", tl: "Magandang Umaga" },
  good_afternoon: { en: "Good Afternoon", tl: "Magandang Hapon" },
  good_evening: { en: "Good Evening", tl: "Magandang Gabi" },

  // ── Splash ────────────────────────────────────────────────────────────────
  splash_tagline: {
    en: "Harvest smarter. Earn better.",
    tl: "Mas matalinong pag-ani. Mas malaking kita.",
  },
  splash_slogan: {
    en: "Ani mo, alam mo.",
    tl: "Ani mo, alam mo.",
  },
  splash_create_account: { en: "Create an Account", tl: "Gumawa ng Account" },
  splash_sign_in: { en: "Sign In", tl: "Mag-sign In" },

  // ── Role selection ────────────────────────────────────────────────────────
  role_title: { en: "Who are you?", tl: "Sino ka?" },
  role_sub: {
    en: "Tell us who you are and we'll set things up for you.",
    tl: "Sabihin kung sino ka at aayusin namin ang lahat para sa iyo.",
  },
  role_farmer: { en: "Farmer", tl: "Magsasaka" },
  welcome_title: { en: "Welcome to AniSense, {name}!", tl: "Maligayang pagdating sa AniSense, {name}!" },
  welcome_sub: { en: "Your member ID is ready.", tl: "Handa na ang iyong member ID." },
  welcome_home: { en: "Go to Home", tl: "Pumunta sa Home" },
  welcome_add_photo: { en: "Add your photo", tl: "Maglagay ng litrato" },
  welcome_change_photo: { en: "Change photo", tl: "Palitan ang litrato" },
  id_show: { en: "Show Member ID", tl: "Ipakita ang Member ID" },
  id_view_title: { en: "Your member ID", tl: "Ang iyong member ID" },
  id_view_sub: { en: "Tap the photo to change it.", tl: "I-tap ang litrato para palitan ito." },
  id_download: { en: "Download ID", tl: "I-download ang ID" },
  id_preparing: { en: "Preparing…", tl: "Inihahanda…" },
  id_saved: { en: "Saved to Downloads", tl: "Na-save sa Downloads" },
  id_save_failed: { en: "Couldn't save. Try again", tl: "Hindi na-save. Subukan ulit" },
  role_farmer_desc: {
    en: "Post listings, track expenses, and monitor crop market prices.",
    tl: "Mag-post ng paninda, subaybayan ang gastos, at bantayan ang presyo ng pananim.",
  },
  role_buyer: { en: "Buyer", tl: "Mamimili" },
  role_buyer_desc: {
    en: "Browse listings, compare prices, and connect with local farmers.",
    tl: "Tingnan ang mga paninda, ikumpara ang presyo, at makipag-ugnayan sa mga magsasaka.",
  },

  // ── Auth form ─────────────────────────────────────────────────────────────
  auth_create_title: { en: "Create account", tl: "Gumawa ng account" },
  auth_create_sub: {
    en: "Create your free account in under a minute.",
    tl: "Gumawa ng libreng account sa loob ng isang minuto.",
  },
  auth_signin_title: { en: "Welcome back", tl: "Maligayang pagbabalik" },
  auth_signin_sub: {
    en: "Sign in to continue to AniSense.",
    tl: "Mag-sign in para magpatuloy sa AniSense.",
  },
  auth_farmer_account: { en: "Farmer Account", tl: "Account ng Magsasaka" },
  auth_buyer_account: { en: "Buyer Account", tl: "Account ng Mamimili" },
  auth_sign_in_with: { en: "Sign in with", tl: "Mag-sign in gamit ang" },
  auth_cp_number: { en: "CP Number", tl: "Numero ng CP" },
  auth_full_name: { en: "Full Name", tl: "Buong Pangalan" },
  auth_full_name_ph: { en: "e.g. Juan Dela Cruz", tl: "hal. Juan Dela Cruz" },
  auth_gmail_address: { en: "Gmail Address", tl: "Gmail Address" },
  auth_password: { en: "Password", tl: "Password" },
  auth_password_ph: { en: "Enter password", tl: "Ilagay ang password" },
  auth_confirm_password: { en: "Confirm Password", tl: "Kumpirmahin ang Password" },
  auth_confirm_password_ph: { en: "Re-enter password", tl: "Ilagay muli ang password" },
  auth_create_btn: { en: "Create Account", tl: "Gumawa ng Account" },
  auth_signin_btn: { en: "Sign In", tl: "Mag-sign In" },
  auth_have_account: { en: "Already have an account?", tl: "May account ka na ba?" },
  auth_no_account: { en: "Don't have an account?", tl: "Wala ka pang account?" },
  auth_sign_up_link: { en: "Sign Up", tl: "Mag-sign Up" },
  auth_or: { en: "or", tl: "o" },

  // ── Crop picker ───────────────────────────────────────────────────────────
  crops_title: { en: "What you grow", tl: "Anong tinatanim mo?" },
  crops_sub: {
    en: "Select all the crops you grow or plan to grow.",
    tl: "Piliin ang lahat ng pananim na itinatanim mo o balak mong itanim.",
  },
  crops_select_label: { en: "Select your crops", tl: "Piliin ang mga tinatanim mo" },
  crops_selected: { en: "selected", tl: "ang napili" },
  crops_continue_with: { en: "Continue with", tl: "Magpatuloy gamit ang" },
  crops_crops: { en: "crops", tl: "pananim" },
  crop_rice: { en: "Rice", tl: "Palay" },
  crop_corn: { en: "Corn", tl: "Mais" },
  crop_onions: { en: "Onions", tl: "Sibuyas" },
  crop_tomatoes: { en: "Tomatoes", tl: "Kamatis" },
  crop_calamansi: { en: "Calamansi", tl: "Kalamansi" },
  crop_mango: { en: "Mango", tl: "Mangga" },
  crop_garlic: { en: "Garlic", tl: "Bawang" },
  crop_squash: { en: "Squash", tl: "Kalabasa" },
  crop_ampalaya: { en: "Ampalaya", tl: "Ampalaya" },
  crop_watermelon: { en: "Watermelon", tl: "Pakwan" },

  // ── Bottom nav ────────────────────────────────────────────────────────────
  nav_home: { en: "Home", tl: "Home" },
  nav_market: { en: "Prices", tl: "Presyo" },
  nav_trade: { en: "Market", tl: "Merkado" },
  nav_expenses: { en: "Expenses", tl: "Gastos" },
  nav_orders: { en: "Orders", tl: "Mga Order" },
  nav_profile: { en: "Profile", tl: "Profile" },

  // ── Home ──────────────────────────────────────────────────────────────────
  home_crops_rising: { en: "Going up today", tl: "Tumataas na Pananim Ngayon" },
  home_crops_up: { en: "crops up in price", tl: "pananim na tumaas ang presyo" },
  home_total_expenses: { en: "Total Expenses", tl: "Kabuuang Gastos" },
  home_this_month: { en: "This Month", tl: "Ngayong Buwan" },
  home_current_prices: { en: "Current Prices", tl: "Presyo ngayon" },
  home_tap_market: { en: "Tap Market for full details", tl: "Pindutin ang Merkado para sa detalye" },
  home_what_to_do: { en: "What would you like to do?", tl: "Ano ang gusto mong gawin?" },
  home_tap_any: { en: "Tap any button to open", tl: "Pindutin ang kahit anong button" },
  home_mod_market: { en: "Market Prices", tl: "Presyo sa Merkado" },
  home_mod_market_desc: { en: "View today's crop prices", tl: "Tingnan ang presyo ngayon" },
  home_mod_expenses: { en: "Expenses", tl: "Mga Gastos" },
  home_mod_expenses_desc: { en: "Track your costs", tl: "Subaybayan ang gastos" },
  home_mod_analytics: { en: "Analytics", tl: "Analytics" },
  home_mod_analytics_desc: { en: "Trends & forecasts", tl: "Trend at taya ng presyo" },
  home_mod_marketplace: { en: "Marketplace", tl: "Bentahan" },
  home_mod_marketplace_desc: { en: "Buy & sell crops", tl: "Bumili at magbenta" },
  home_mod_weather: { en: "Weather", tl: "Panahon" },
  home_mod_weather_desc: { en: "Farm conditions", tl: "Lagay ng panahon" },

  /** Heading for the two model cards (ARIMA + AI, ARIMA forecast). */
  home_ai_recos: { en: "AI Recommendations", tl: "Mga rekomendasyon ng AI" },
  home_your_crops: { en: "Your crops today", tl: "Ang iyong mga pananim ngayon" },
  home_spent_month: { en: "Spent this month", tl: "Nagastos ngayong buwan" },
  home_vs_last: { en: "vs last month", tl: "kumpara noong nakaraang buwan" },
  home_spent_none: { en: "Nothing recorded yet this month", tl: "Wala pang naitala ngayong buwan" },
  home_tools: { en: "More tools", tl: "Iba pang gamit" },
  home_mod_weather_buyer: { en: "Before you drive out", tl: "Bago ka pumunta" },
  home_market_chip: { en: "{n} listings · {s} farmers", tl: "{n} listing · {s} magsasaka" },
  home_deals: { en: "Cheapest today", tl: "Pinakamura ngayon" },
  home_deals_sub: { en: "Lowest price per kilo in the marketplace now.", tl: "Pinakamababang presyo kada kilo sa bentahan ngayon." },
  home_below: { en: "under market", tl: "mas mura" },
  home_no_deals: { en: "No listings yet.", tl: "Wala pang listing." },
  home_buy_again: { en: "Buy again", tl: "Bilhin ulit" },
  home_buy_again_sub: { en: "What you bought before, one tap away.", tl: "Ang dati mong binili, isang pindot lang." },
  home_spent_purchases: { en: "Spent on purchases", tl: "Nagastos sa pagbili" },
  home_purchases_n: { en: "purchases", tl: "binili" },
  home_purchase_one: { en: "purchase", tl: "binili" },
  home_buyer_cta_t: { en: "Fresh from local farms", tl: "Sariwa mula sa lokal na bukid" },
  home_buyer_cta_s: { en: "Buy straight from Nueva Ecija farmers.", tl: "Bumili nang diretso sa mga magsasaka ng Nueva Ecija." },

  // ── Market ────────────────────────────────────────────────────────────────
  market_title: { en: "Prices", tl: "Presyo" },
  market_sub: { en: "Crop prices", tl: "Presyo ng pananim" },
  market_dashboard: { en: "Market Dashboard", tl: "Market Dashboard" },
  market_tracked: {
    en: "crop varieties tracked across Nueva Ecija markets",
    tl: "uri ng pananim na binabantayan sa mga merkado ng Nueva Ecija",
  },
  market_top_gainers: { en: "Top Gainers", tl: "Pinakatumaas" },
  market_top_decliners: { en: "Top Decliners", tl: "Pinakabumaba" },
  market_search_ph: { en: "Search for a crop...", tl: "Maghanap ng pananim..." },
  market_crops_count: { en: "crops", tl: "pananim" },
  market_crop_count_one: { en: "crop", tl: "pananim" },
  market_in: { en: "in", tl: "sa" },
  market_no_match: { en: "No crops match your search.", tl: "Walang pananim na tumugma sa hinanap mo." },
  market_up_to_date: { en: "Prices up to date", tl: "Napapanahon ang mga presyo" },
  mkt_pulse_label: { en: "Today's market", tl: "Merkado ngayon" },
  mkt_pulse_head: { en: "{up} of {n} prices went up", tl: "{up} sa {n} na presyo ang tumaas" },
  mkt_up: { en: "up", tl: "tumaas" },
  mkt_down: { en: "down", tl: "bumaba" },
  mkt_same: { en: "no change", tl: "walang galaw" },
  mkt_movers: { en: "Biggest moves today", tl: "Pinakamalaking galaw ngayon" },
  mkt_all: { en: "All prices", tl: "Lahat ng presyo" },
  // Buyer price-moves chart on Home.
  mv_verdict_up: { en: "Most prices went up today", tl: "Karamihan ng presyo ay tumaas ngayon" },
  mv_verdict_down: { en: "Most prices went down today", tl: "Karamihan ng presyo ay bumaba ngayon" },
  mv_verdict_mixed: { en: "Prices were mixed today", tl: "Halo-halo ang galaw ng presyo ngayon" },
  mv_count: { en: "{up} up · {down} down, compared with yesterday", tl: "{up} tumaas · {down} bumaba, kumpara kahapon" },
  mv_axis_cheaper: { en: "Cheaper", tl: "Mas mura" },
  mv_axis_pricier: { en: "Pricier", tl: "Mas mahal" },
  bm_cheaper_aria: { en: "cheaper than yesterday", tl: "mas mura kaysa kahapon" },
  bm_pricier_aria: { en: "pricier than yesterday", tl: "mas mahal kaysa kahapon" },
  pick_crop_title: { en: "Choose a crop", tl: "Pumili ng pananim" },

  // Farmer Home: profit snapshot.
  ps_title: { en: "Earned and spent", tl: "Kita at gastos" },
  ps_month: { en: "Month", tl: "Buwan" },
  ps_season: { en: "Season", tl: "Panahon" },
  ps_earned: { en: "Earned", tl: "Kita" },
  ps_spent: { en: "Spent", tl: "Gastos" },
  ps_net_up: { en: "left over", tl: "ang natira" },
  ps_net_down: { en: "short", tl: "ang kulang" },
  ps_hint: {
    en: "Record a sale and it lands here, beside what the farm cost you.",
    tl: "Itala ang benta at lalabas ito rito, katabi ng gastos sa bukid.",
  },
  ps_record: { en: "Record a sale", tl: "Itala ang benta" },
  ps_kg: { en: "Kilos sold", tl: "Kilong naibenta" },
  ps_kg_less: { en: "Fewer kilos", tl: "Bawasan ang kilo" },
  ps_kg_more: { en: "More kilos", tl: "Dagdagan ang kilo" },
  ps_price: { en: "Price per kilo", tl: "Presyo kada kilo" },
  ps_price_less: { en: "Lower the price", tl: "Babaan ang presyo" },
  ps_price_more: { en: "Raise the price", tl: "Itaas ang presyo" },
  ps_date: { en: "Date sold", tl: "Petsa ng benta" },
  ps_total: { en: "Total for this sale: ", tl: "Kabuuan ng bentang ito: " },
  ps_save: { en: "Save the sale", tl: "I-save ang benta" },

  // Farmer Home: crop tracker.
  ct_title: { en: "In the ground", tl: "Nakatanim ngayon" },
  ct_sub: {
    en: "How far along each planting is, counted from the day you planted.",
    tl: "Gaano na katagal ang bawat tanim, bilang mula sa araw ng pagtatanim.",
  },
  ct_empty: { en: "Nothing tracked yet.", tl: "Wala pang sinusubaybayan." },
  ct_add: { en: "Add a planting", tl: "Magdagdag ng tanim" },
  ct_crop: { en: "Crop", tl: "Pananim" },
  ct_planted: { en: "Date planted", tl: "Petsa ng pagtatanim" },
  ct_days_lbl: { en: "Days to harvest", tl: "Araw bago anihin" },
  ct_days: { en: "days", tl: "araw" },
  ct_days_help: {
    en: "The usual figure for this crop. Change it if your variety runs longer or shorter.",
    tl: "Ito ang karaniwan para sa pananim na ito. Palitan kung mas matagal o mas maikli ang klase mo.",
  },
  ct_days_less: { en: "Fewer days", tl: "Bawasan ang araw" },
  ct_days_more: { en: "More days", tl: "Dagdagan ang araw" },
  ct_save: { en: "Start tracking", tl: "Simulan ang pagsubaybay" },
  ct_remove: { en: "Stop tracking", tl: "Itigil ang pagsubaybay" },
  ct_day: { en: "Day {day} of {days}", tl: "Araw {day} ng {days}" },
  ct_ready: { en: "Ready to harvest", tl: "Pwede nang anihin" },
  ct_days_left: { en: "about {n} days to harvest", tl: "mga {n} araw na lang bago anihin" },
  ct_weeks_left: { en: "about {n} weeks to harvest", tl: "mga {n} linggo na lang bago anihin" },
  ct_stage_seedling: { en: "Seedling", tl: "Punla" },
  ct_stage_growing: { en: "Growing", tl: "Lumalaki" },
  ct_stage_flowering: { en: "Flowering", tl: "Namumulaklak" },
  ct_stage_filling: { en: "Filling", tl: "Nagbubunga" },
  ct_stage_ready: { en: "Ready", tl: "Handa na" },
  ct_alert_title: { en: "Ready to harvest", tl: "Pwede nang anihin" },
  ct_alert_body: { en: "{crop} has reached day {days}", tl: "Umabot na sa araw {days} ang {crop}" },

  // Farmer Home: price alerts.
  pa_title: { en: "Price alerts", tl: "Abiso sa presyo" },
  pa_sub: {
    en: "Pick a price. The app tells you when a crop reaches it.",
    tl: "Pumili ng presyo. Sasabihin ng app kapag naabot ito ng pananim.",
  },
  pa_empty: { en: "No alerts yet.", tl: "Wala pang abiso." },
  pa_add: { en: "Add a price alert", tl: "Magdagdag ng abiso" },
  pa_crop: { en: "Crop", tl: "Pananim" },
  pa_target: { en: "Tell me when the price is", tl: "Sabihin kapag ang presyo ay" },
  pa_today: { en: "Today: {price} per kilo", tl: "Ngayon: {price} kada kilo" },
  pa_less: { en: "Lower the price", tl: "Babaan ang presyo" },
  pa_more: { en: "Raise the price", tl: "Itaas ang presyo" },
  pa_save: { en: "Set the alert", tl: "Itakda ang abiso" },
  pa_remove: { en: "Remove alert for", tl: "Alisin ang abiso para sa" },
  pa_promise_up: {
    en: "We will tell you when {crop} reaches {target} per kilo.",
    tl: "Sasabihin namin kapag umabot ang {crop} sa {target} kada kilo.",
  },
  pa_promise_down: {
    en: "We will tell you when {crop} falls to {target} per kilo.",
    tl: "Sasabihin namin kapag bumaba ang {crop} sa {target} kada kilo.",
  },
  pa_waiting_up: { en: "Waiting for {target} · {gap} to go", tl: "Hinihintay ang {target} · {gap} na lang" },
  pa_waiting_down: { en: "Waiting for {target} · {gap} to fall", tl: "Hinihintay ang {target} · {gap} pa ang ibababa" },
  pa_reached: { en: "Reached {price} today", tl: "Umabot sa {price} ngayon" },
  pa_alert_title: { en: "Your price alert", tl: "Ang abiso mo sa presyo" },
  pa_alert_body: { en: "{crop} reached {price} per kilo", tl: "Umabot ang {crop} sa {price} kada kilo" },

  // Farmer Home: their own listings.
  fh_title: { en: "Your harvest", tl: "Ang ani mo" },
  fh_summary: { en: "listed across {n} · {kg} kg on sale", tl: "nakalista sa {n} · {kg} kilo ang benta" },
  fh_listing_one: { en: "1 listing", tl: "1 listing" },
  fh_listings_n: { en: "{n} listings", tl: "{n} listing" },
  fh_left: { en: "kg left", tl: "kilo ang natitira" },
  fh_above: { en: "above market", tl: "mas mataas sa merkado" },
  fh_below: { en: "below market", tl: "mas mababa sa merkado" },
  fh_at: { en: "at market price", tl: "kapantay ng merkado" },
  fh_post: { en: "Post a harvest", tl: "Mag-post ng ani" },
  fh_empty_t: { en: "Nothing on sale yet", tl: "Wala ka pang benta" },
  fh_empty_s: {
    en: "Post your harvest and buyers across Nueva Ecija can find it.",
    tl: "I-post ang ani mo para makita ka ng mga bumibili sa buong Nueva Ecija.",
  },

  // Buyer Home.
  fp_title: { en: "Featured products", tl: "Mga tampok na produkto" },
  fp_sub: { en: "From the best-rated farmers selling today.", tl: "Mula sa may pinakamataas na rating na nagbebenta ngayon." },
  fp_see_all: { en: "See all", tl: "Lahat" },
  home_poster_alt: {
    en: "AniSense: fresh local produce, from our farms to your table.",
    tl: "AniSense: sariwang ani mula sa lokal na bukid, diretso sa hapag mo.",
  },
  poster_alt: {
    en: "AniSense: fresh produce, better prices, stronger communities. Browse the marketplace.",
    tl: "AniSense: sariwang ani, mas magandang presyo, mas matibay na komunidad. Buksan ang bentahan.",
  },
  home_search_ph: { en: "Search rice, onions, or a farmer", tl: "Maghanap ng bigas, sibuyas, o magsasaka" },
  home_shop_by_crop: { en: "Shop by crop", tl: "Mamili ayon sa pananim" },
  ff_title: { en: "Featured farmers", tl: "Mga tampok na magsasaka" },
  ff_sub: { en: "Top-rated growers selling on AniSense", tl: "Mga pinakamataas ang rating na nagbebenta sa AniSense" },
  ff_week: { en: "AniSense Farmer of the Week", tl: "AniSense Magsasaka ng Linggo" },
  ff_sales: { en: "sales", tl: "benta" },
  ff_years: { en: "yrs farming", tl: "taon sa bukid" },
  ff_cta: { en: "See their harvest", tl: "Tingnan ang ani nila" },
  ff_near: { en: "Near you", tl: "Malapit sa iyo" },
  yp_title: { en: "Your purchases", tl: "Mga binili mo" },
  yp_history: { en: "History", tl: "Kasaysayan" },
  yp_farmers: { en: "farmers", tl: "magsasaka" },
  yp_farmer_one: { en: "farmer", tl: "magsasaka" },
  yp_order_one: { en: "order", tl: "order" },
  yp_orders_n: { en: "orders", tl: "order" },
  yp_summary: { en: "spent on {orders} from {farmers}", tl: "nagastos sa {orders} mula sa {farmers}" },
  yp_where: { en: "Where it went", tl: "Saan napunta" },
  yp_other: { en: "Other", tl: "Iba pa" },
  mkt_history: { en: "Last 7 days and next 3", tl: "Nakaraang 7 araw at susunod na 3" },
  mkt_no_history: { en: "No price history for this crop yet.", tl: "Wala pang kasaysayan ng presyo para rito." },
  mkt_low: { en: "7-day low", tl: "Pinakamababa" },
  mkt_high: { en: "7-day high", tl: "Pinakamataas" },
  mkt_in_3: { en: "In 3 days", tl: "Sa 3 araw" },
  mkt_actual: { en: "Actual", tl: "Aktwal" },
  mkt_forecast: { en: "Forecast", tl: "Taya" },
  mkt_chart_note: { en: "Forecast by LSTM. A guide, not a promise.", tl: "Taya ng LSTM. Gabay lamang, hindi pangako." },
  mkt_change_today: { en: "Change since yesterday", tl: "Pagbabago mula kahapon" },
  market_offline_cached: {
    en: "Offline: showing cached prices",
    tl: "Offline: lumang presyo ang ipinapakita",
  },

  // ── Trade / Marketplace ───────────────────────────────────────────────────
  trade_title: { en: "Market", tl: "Merkado" },
  hi: { en: "Hi", tl: "Hi" },
  trade_marketplace: { en: "Marketplace", tl: "Bentahan" },
  mp_poster_sell_alt: {
    en: "Sell your ani now: post your harvest and buyers find you.",
    tl: "Ibenta ang ani mo ngayon: i-post ang ani at makikita ka ng mga bumibili.",
  },
  mp_poster_alt: {
    en: "AniSense marketplace: connect directly with local farmers, fresh and quality produce, support local communities.",
    tl: "AniSense bentahan: direktang kumonekta sa lokal na magsasaka, sariwa at de-kalidad na ani, suportahan ang lokal na komunidad.",
  },
  trade_sub: {
    en: "Buy and sell crops directly with local farmers",
    tl: "Bumili at magbenta ng pananim nang direkta sa mga magsasaka",
  },
  trade_sell: { en: "Sell", tl: "Magbenta" },
  trade_search_ph: {
    en: "Search crops, sellers, locations...",
    tl: "Maghanap ng pananim, nagbebenta, lugar...",
  },
  trade_select_category: { en: "Pick a crop type", tl: "Piliin ang Uri ng Pananim" },
  trade_active_listings: { en: "Active Listings", tl: "Aktibong Paninda" },
  trade_avg_price: { en: "Avg. Price/kg", tl: "Avg. Presyo/kilo" },
  trade_total_kg: { en: "Total kg Available", tl: "Kabuuang Kilo" },
  trade_avg_rating: { en: "Avg. Rating", tl: "Avg. Rating" },
  trade_listings: { en: "listings", tl: "paninda" },
  trade_listing_one: { en: "listing", tl: "paninda" },
  trade_sort_newest: { en: "Newest first", tl: "Pinakabago muna" },
  trade_sort_price_asc: { en: "Low to High", tl: "Mababa pataas" },
  trade_sort_price_desc: { en: "High to Low", tl: "Mataas pababa" },
  trade_sort_rating: { en: "Best rated", tl: "Pinakamataas ang rating" },
  trade_kg_available: { en: "kg available", tl: "kilong available" },
  trade_call_seller: { en: "Call seller", tl: "Tawagan ang nagbebenta" },
  trade_view_details: { en: "View details", tl: "Tingnan ang detalye" },
  mp_your_listing: { en: "Your listing", tl: "Iyong listing" },
  mp_seller_photo: { en: "Seller's photo", tl: "Litrato ng nagbebenta" },
  mp_step_photo: { en: "Photo of your harvest", tl: "Litrato ng iyong ani" },
  mp_step_photo_sub: { en: "Optional. Buyers trust listings with a real photo.", tl: "Hindi kailangan. Mas pinagkakatiwalaan ng mamimili ang may totoong litrato." },
  mp_add_photo: { en: "Take or choose a photo", tl: "Kumuha o pumili ng litrato" },
  mp_change_photo: { en: "Change photo", tl: "Palitan" },
  mp_remove_photo: { en: "Remove", tl: "Alisin" },
  mp_photo_working: { en: "Preparing photo…", tl: "Inihahanda ang litrato…" },
  mp_photo_failed: { en: "Couldn't use that photo. Try another.", tl: "Hindi magamit ang litratong iyon. Subukan ang iba." },
  mp_today: { en: "today", tl: "ngayon" },
  mp_yesterday: { en: "yesterday", tl: "kahapon" },
  mp_days_ago: { en: "{n} days ago", tl: "{n} araw na ang nakalipas" },
  mp_posted: { en: "Posted", tl: "Nai-post" },
  mp_family: { en: "Show", tl: "Ipakita" },
  fam_crops: { en: "Crops", tl: "Palay/Mais" },
  fam_vegetables: { en: "Vegetables", tl: "Gulay" },
  fam_fruits: { en: "Fruits", tl: "Prutas" },
  mp_avg: { en: "avg", tl: "karaniwan" },
  mp_sort: { en: "Sort listings", tl: "Ayusin ang mga listing" },
  mp_how_many: { en: "How many kilos?", tl: "Ilang kilo?" },
  trade_no_listings: {
    en: "No listings found. Try a different search or filter.",
    tl: "Walang nahanap na paninda. Subukan ang ibang hanap o filter.",
  },
  trade_rating: { en: "rating", tl: "rating" },

  // ── Cart ──────────────────────────────────────────────────────────────────
  cart_title: { en: "My Cart", tl: "Aking Cart" },
  cart_item_selected: { en: "item selected", tl: "napiling item" },
  cart_items_selected: { en: "items selected", tl: "napiling item" },
  cart_add: { en: "Add to Cart", tl: "Idagdag sa Cart" },
  cart_in_cart: { en: "In Cart", tl: "Nasa Cart" },
  cart_buy_now: { en: "Buy Now", tl: "Bilhin Ngayon" },
  cart_total: { en: "Total Amount", tl: "Kabuuang Halaga" },
  cart_across: { en: "across", tl: "mula sa" },
  cart_seller: { en: "seller", tl: "nagbebenta" },
  cart_sellers: { en: "sellers", tl: "nagbebenta" },
  cart_confirm: { en: "Confirm Order", tl: "Kumpirmahin ang Order" },
  cart_less: { en: "Remove 1 kg", tl: "Bawasan ng 1 kg" },
  cart_more: { en: "Add 1 kg", tl: "Dagdagan ng 1 kg" },
  cart_remove: { en: "Remove from cart", tl: "Alisin sa cart" },
  cart_removed: { en: "Removed", tl: "Inalis ang" },
  cart_undo: { en: "Undo", tl: "Ibalik" },
  cart_all_avail: { en: "That's all the seller has", tl: "Iyan na lahat ng meron ang nagbebenta" },
  cart_pay_note: {
    en: "No payment yet. Each seller will call you to arrange delivery and payment.",
    tl: "Wala pang bayad. Tatawagan ka ng bawat nagbebenta para sa delivery at bayad.",
  },
  cart_browse: { en: "Browse the marketplace", tl: "Tumingin sa bentahan" },
  cart_empty_title: { en: "Your cart is empty", tl: "Walang laman ang cart mo" },
  cart_empty_sub: {
    en: "Add crops from the marketplace to get started",
    tl: "Magdagdag ng pananim mula sa bentahan para makapagsimula",
  },
  cart_order_placed: { en: "Order Placed!", tl: "Naipadala ang Order!" },
  rc_title: { en: "Order placed!", tl: "Naipadala ang order!" },
  rc_kicker: { en: "Order receipt", tl: "Resibo ng order" },
  rc_date: { en: "Placed", tl: "Petsa" },
  rc_buyer: { en: "Buyer", tl: "Mamimili" },
  rc_total: { en: "Total", tl: "Kabuuan" },
  rc_thanks: { en: "Salamat, suki! Thank you for buying local.", tl: "Salamat, suki! Salamat sa pagbili sa lokal." },
  rc_done: { en: "Done", tl: "Tapos na" },
  rc_save: { en: "Save this receipt", tl: "I-save ang resibo" },
  rc_saving: { en: "Preparing…", tl: "Inihahanda…" },
  rc_saved: { en: "Saved to Downloads", tl: "Na-save sa Downloads" },
  cart_order_placed_sub: {
    en: "The sellers will contact you to arrange delivery and payment.",
    tl: "Tatawagan ka ng mga nagbebenta para sa delivery at bayad.",
  },

  // ── Seller modal ──────────────────────────────────────────────────────────
  seller_phone: { en: "Phone Number", tl: "Numero ng Telepono" },
  seller_location: { en: "Farm Location", tl: "Lokasyon ng Bukid" },
  seller_years: { en: "Years of Farming", tl: "Taon sa Pagsasaka" },
  seller_years_suffix: { en: "years", tl: "taon" },
  seller_rating: { en: "Seller Rating", tl: "Rating ng Nagbebenta" },
  seller_listings: { en: "Selling right now", tl: "Ibinebenta ngayon" },
  seller_listings_none: { en: "Nothing listed right now.", tl: "Wala pang nakalista ngayon." },
  seller_crops_sold: { en: "Crops Sold", tl: "Mga Pananim na Binebenta" },
  seller_experience: { en: "Experience", tl: "Karanasan" },
  seller_sales: { en: "Sales", tl: "Benta" },
  seller_call: { en: "Call", tl: "Tawagan si" },

  // ── Expenses ──────────────────────────────────────────────────────────────
  exp_title: { en: "Expenses", tl: "Mga Gastos" },
  orders_title: { en: "Orders", tl: "Mga Order" },
  exp_sub: { en: "Farm cost tracker", tl: "Tala ng gastos sa bukid" },
  exp_total_month: {
    en: "Farm expenses this month",
    tl: "Kabuuang Gastos sa Bukid Ngayong Buwan",
  },
  exp_vs_last_month: { en: "vs last month", tl: "kumpara noong nakaraang buwan" },
  exp_overview: { en: "Overview", tl: "Buod" },
  exp_by_crop: { en: "By Crop", tl: "Pananim" },
  exp_by_month: { en: "By Month", tl: "Buwan" },
  exp_breakdown: { en: "Expense Breakdown", tl: "Hati-hati ng Gastos" },
  exp_none_yet: {
    en: "No expenses this month yet. Add an expense to see the breakdown.",
    tl: "Wala pang gastos ngayong buwan. Magdagdag ng gastos para makita ang buod.",
  },
  exp_by_specialization: {
    en: "By crop this month",
    tl: "Ayon sa Pananim Ngayong Buwan",
  },
  exp_total: { en: "Total", tl: "Kabuuan" },
  exp_monthly_breakdown: { en: "Monthly Breakdown", tl: "Buwanang Buod" },
  exp_recent: { en: "Recent Transactions", tl: "Mga Kamakailang Gastos" },
  exp_items: { en: "items", tl: "item" },
  exp_add: { en: "+ Add Expense", tl: "+ Magdagdag ng Gastos" },
  exp_calculator: { en: "Open Calculator", tl: "Buksan ang Calculator" },
  exp_cat_seeds: { en: "Seeds", tl: "Binhi" },
  exp_cat_fertilizer: { en: "Fertilizer", tl: "Pataba" },
  exp_cat_labor: { en: "Labor", tl: "Paggawa" },
  exp_cat_equipment: { en: "Equipment", tl: "Kagamitan" },
  exp_cat_irrigation: { en: "Irrigation", tl: "Patubig" },
  exp_cat_other: { en: "Other", tl: "Iba pa" },

  // ── Analytics ─────────────────────────────────────────────────────────────
  ana_title: { en: "Analytics", tl: "Analytics" },
  ana_sub: { en: "Market insights", tl: "Pagsusuri ng merkado" },
  ana_glance: { en: "This Week at a Glance", tl: "Buod ng Linggong Ito" },
  ana_glance_sub: {
    en: "A quick read on Nueva Ecija crop markets",
    tl: "Mabilis na buod ng merkado ng pananim sa Nueva Ecija",
  },
  ana_crops_rising: { en: "Crops Rising", tl: "Tumataas" },
  ana_total_tons: { en: "Total Tons", tl: "Kabuuang Tonelada" },
  ana_avg_price: { en: "Avg Price/kg", tl: "Avg Presyo/kilo" },
  ana_trends: { en: "7-Day Price Trends", tl: "7-Araw na Galaw ng Presyo" },
  ana_forecast: { en: "Price Forecast", tl: "Taya ng Presyo" },
  ana_today_price: { en: "Today's Price", tl: "Presyo Ngayon" },
  ana_day7: { en: "Day +7 Forecast", tl: "Taya sa Ika-7 Araw" },
  ana_change7: { en: "7-Day Change", tl: "Pagbabago sa 7 Araw" },
  ana_suggestion: { en: "Sell now or wait?", tl: "Ibenta na o hintayin?" },
  ana_suggestion_sub: {
    en: "Our advice for your crops, from the next 3 days of prices.",
    tl: "Payo para sa iyong mga pananim, batay sa presyo sa susunod na 3 araw.",
  },
  ana_disclaimer: {
    en: "Predictions are not guaranteed. Always verify with local market conditions.",
    tl: "Hindi garantisado ang mga taya. Laging suriin ang aktwal na presyo sa merkado.",
  },
  ana_performance: { en: "Price Performance: All Crops", tl: "Galaw ng Presyo: Lahat ng Pananim" },
  ana_predicted: { en: "Prices in the next 3 days", tl: "Presyo sa susunod na 3 araw" },
  ana_based_on: {
    en: "How the price of each crop you grow is expected to move.",
    tl: "Kung paano inaasahang gagalaw ang presyo ng bawat tanim mo.",
  },
  ana_current: { en: "Current", tl: "Kasalukuyan" },
  ana_sell: { en: "SELL", tl: "IBENTA" },
  ana_buy: { en: "BUY", tl: "BUMILI" },
  ana_hold: { en: "HOLD", tl: "HINTAYIN" },

  // ── Weather ───────────────────────────────────────────────────────────────
  wx_title: { en: "Weather", tl: "Panahon" },
  wx_sub: { en: "Farm conditions", tl: "Lagay ng panahon sa bukid" },
  wx_sub_buyer: { en: "Local conditions", tl: "Lagay ng panahon dito" },
  wx_partly_cloudy: { en: "Partly Cloudy", tl: "Bahagyang Maulap" },
  wx_humidity: { en: "Humidity", tl: "Halumigmig" },
  wx_wind: { en: "Wind", tl: "Hangin" },
  wx_rain_chance: { en: "Rain Chance", tl: "Tsansa ng Ulan" },
  wx_uv: { en: "UV Index", tl: "UV Index" },
  wx_uv_high: { en: "High", tl: "Mataas" },
  wx_forecast: { en: "5-Day Forecast", tl: "5-Araw na Taya" },
  wx_advisory: { en: "Farming Advisory", tl: "Payo sa Pagsasaka" },
  wx_best_window: { en: "Best window for fieldwork", tl: "Pinakamainam na araw para sa bukid" },
  wx_best_window_sub: {
    en: "Clear, dry conditions ahead. Good for planting, spraying, or drying harvest.",
    tl: "Maaliwalas at tuyo. Mainam para magtanim, mag-spray, o magbilad ng ani.",
  },
  wx_adv_good: {
    en: "Good conditions for rice planting this week",
    tl: "Mainam ang panahon para magtanim ng palay ngayong linggo",
  },
  wx_adv_rain: { en: "Possible rain on", tl: "Posibleng umulan sa" },
  wx_adv_harvest: { en: "harvest now", tl: "mag-ani na" },
  wx_adv_humidity: {
    en: "Humidity is rising. Check crops for early signs of fungal disease",
    tl: "Tumataas ang halumigmig. Suriin ang pananim laban sa amag o sakit",
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  prof_title: { en: "My Profile", tl: "Aking Profile" },
  prof_farmer: { en: "Farmer Account", tl: "Account ng Magsasaka" },
  prof_buyer: { en: "Buyer Account", tl: "Account ng Mamimili" },
  prof_stats: { en: "My farm at a glance", tl: "Estadistika ng Aking Bukid" },
  prof_years_farming: { en: "Years Farming", tl: "Taon sa Pagsasaka" },
  prof_monthly_revenue: { en: "Monthly Revenue", tl: "Buwanang Kita" },
  prof_active_listings: { en: "Active Listings", tl: "Aktibong Paninda" },
  prof_seller_rating: { en: "Seller Rating", tl: "Rating" },
  prof_trades: { en: "Trades Done", tl: "Natapos na Bentahan" },
  prof_contact: { en: "Contact Information", tl: "Impormasyon sa Pakikipag-ugnayan" },
  prof_phone: { en: "Phone Number", tl: "Numero ng Telepono" },
  prof_email: { en: "Email Address", tl: "Email Address" },
  prof_location: { en: "Location", tl: "Lokasyon" },
  prof_farm_details: { en: "Farm Details", tl: "Detalye ng Bukid" },
  prof_experience: { en: "Experience", tl: "Karanasan" },
  prof_crop_spec: { en: "Crop Specialization", tl: "Espesyalisasyon sa Pananim" },
  prof_preferences: { en: "Preferences", tl: "Mga Kagustuhan" },
  prof_notifications: { en: "Notifications", tl: "Mga Abiso" },
  prof_notifications_sub: {
    en: "Price alerts & market updates",
    tl: "Alerto sa presyo at balita sa merkado",
  },
  prof_language: { en: "Language", tl: "Wika" },
  prof_language_sub: { en: "Filipino / English", tl: "Filipino / English" },
  prof_support: { en: "Support & About", tl: "Suporta at Tungkol Dito" },
  prof_privacy: { en: "Privacy & Security", tl: "Privacy at Seguridad" },
  prof_privacy_sub: { en: "Password, data settings", tl: "Password at datos" },
  prof_help: { en: "Help & Support", tl: "Tulong at Suporta" },
  prof_help_sub: { en: "FAQs, contact support", tl: "Mga FAQ at suporta" },
  prof_help_sub_farmer: { en: "How to use AniSense, step by step", tl: "Paano gamitin ang AniSense, hakbang-hakbang" },
  prof_tour_sub: { en: "About a minute", tl: "Mga isang minuto" },
  prof_about: { en: "About", tl: "Tungkol Dito" },
  prof_version: { en: "Version 1.0.0", tl: "Bersyon 1.0.0" },
  prof_sign_out: { en: "Sign Out", tl: "Mag-sign Out" },

  // ── Extra: shared ─────────────────────────────────────────────────────────
  please_wait: { en: "Please wait…", tl: "Sandali lang…" },
  save_changes: { en: "Save Changes", tl: "I-save ang Pagbabago" },
  crop_vegetables: { en: "Vegetables", tl: "Gulay" },

  // ── Extra: auth validation ────────────────────────────────────────────────
  err_full_name: { en: "Full name is required.", tl: "Kailangan ang buong pangalan." },
  err_gmail_required: { en: "Gmail address is required.", tl: "Kailangan ang Gmail address." },
  err_cp_required: { en: "CP number is required.", tl: "Kailangan ang numero ng CP." },
  err_valid_gmail: { en: "Enter a valid Gmail address.", tl: "Maglagay ng wastong Gmail address." },
  err_valid_phone: {
    en: "Enter a valid PH mobile number (e.g. 0912 345 6789).",
    tl: "Maglagay ng wastong numero ng cellphone (hal. 0912 345 6789).",
  },
  err_password_required: { en: "Password is required.", tl: "Kailangan ang password." },
  err_password_short: {
    en: "Password must be at least 6 characters.",
    tl: "Dapat hindi bababa sa 6 na karakter ang password.",
  },
  // Real accounts: what can go wrong once there is a server on the other end.
  // Said in the farmer's terms, with what to do next, never the server's words.
  err_login_wrong: {
    en: "That number, Gmail or password is wrong. Check them and try again.",
    tl: "Mali ang numero, Gmail o password. Tingnan at subukan ulit.",
  },
  err_account_exists: {
    en: "There is already an account with this. Sign in instead.",
    tl: "May account na gamit ito. Mag-sign in na lang.",
  },
  err_email_unconfirmed: {
    en: "Confirm your Gmail first with the code we sent you.",
    tl: "I-confirm muna ang Gmail mo gamit ang code na ipinadala namin.",
  },
  err_code_wrong: {
    en: "That code is wrong or has expired. Check it, or send a new one.",
    tl: "Mali o expired na ang code. Tingnan ulit, o magpadala ng bago.",
  },
  err_code_required: { en: "Enter the 6-digit code.", tl: "Ilagay ang 6-digit na code." },
  err_too_many: {
    en: "Too many tries. Wait a minute, then try again.",
    tl: "Masyadong maraming subok. Maghintay ng isang minuto, tapos subukan ulit.",
  },
  err_auth_offline: {
    en: "No internet. Connect to data or Wi-Fi and try again.",
    tl: "Walang internet. Kumonekta sa data o Wi-Fi at subukan ulit.",
  },
  err_auth_generic: {
    en: "Something went wrong. Please try again.",
    tl: "May nangyaring mali. Pakisubukan ulit.",
  },
  // Only a misconfigured project can show this one; it names the fix.
  err_phone_confirm_on: {
    en: "CP number sign-up is not available yet. Use Gmail for now.",
    tl: "Hindi pa puwede ang pag-sign up gamit ang CP number. Gmail muna ang gamitin.",
  },
  verify_title: { en: "Check your Gmail", tl: "Tingnan ang Gmail mo" },
  verify_sub: { en: "We sent a 6-digit code to {email}.", tl: "Nagpadala kami ng 6-digit na code sa {email}." },
  verify_lbl: { en: "Verification code", tl: "Verification code" },
  verify_help: {
    en: "It can take a minute. Check Spam if it is not in your inbox.",
    tl: "Puwedeng umabot ng isang minuto. Tingnan ang Spam kung wala sa inbox.",
  },
  verify_btn: { en: "Verify and continue", tl: "I-verify at magpatuloy" },
  verify_resend: { en: "Send a new code", tl: "Magpadala ng bagong code" },
  verify_resent: { en: "A new code is on its way.", tl: "Paparating na ang bagong code." },
  err_password_mismatch: { en: "Passwords do not match.", tl: "Hindi magkatugma ang mga password." },
  err_select_crop: { en: "Please select at least one crop.", tl: "Pumili ng kahit isang pananim." },

  // ── Extra: farm details step (farmer signup) ─────────────────────────────
  // ── Buyer location ────────────────────────────────────────────────────────
  buyer_loc_title: { en: "Where do you buy?", tl: "Saan ka bumibili?" },
  buyer_loc_sub: {
    en: "So the listings you see are ones you can actually reach.",
    tl: "Para ang mga listing na makikita mo ay yung kaya mong puntahan.",
  },
  buyer_loc_lbl: { en: "Your area", tl: "Lugar mo" },
  buyer_municipality_help: {
    en: "We put the nearest farmers first.",
    tl: "Ipapakita muna ang pinakamalapit na magsasaka.",
  },
  buyer_barangay_help: {
    en: "Sellers use this to estimate delivery. Skip it if you would rather not say.",
    tl: "Ginagamit ito ng nagbebenta para tantiyahin ang hatid. Pwedeng laktawan.",
  },
  optional: { en: "optional", tl: "opsyonal" },

  farm_details_title: { en: "About your farm", tl: "Tungkol sa bukid mo" },
  farm_details_sub: {
    en: "Tell us a bit about your farming background.",
    tl: "Ikwento mo nang kaunti ang pagsasaka mo.",
  },
  farm_years_lbl: { en: "Years of Farming", tl: "Taon sa Pagsasaka" },
  farm_years_ph: { en: "e.g. 12", tl: "hal. 12" },
  farm_loc_lbl: { en: "Farm Location", tl: "Lokasyon ng Bukid" },
  farm_province_lbl: { en: "Province", tl: "Probinsya" },
  farm_municipality_lbl: { en: "City / Municipality", tl: "Lungsod / Bayan" },
  farm_barangay_lbl: { en: "Barangay", tl: "Barangay" },
  pick_search: { en: "Search the list…", tl: "Maghanap sa listahan…" },
  pick_none: { en: "Nothing matches “{q}”. Check the spelling, or scroll the list.", tl: "Walang tumugma sa “{q}”. Suriin ang baybay, o i-scroll ang listahan." },
  farm_pick_municipality: { en: "Choose your city or municipality", tl: "Piliin ang lungsod o bayan" },
  farm_pick_barangay: { en: "Choose your barangay", tl: "Piliin ang barangay" },
  farm_pick_municipality_first: { en: "Choose a city or municipality first", tl: "Piliin muna ang lungsod o bayan" },
  err_municipality_required: {
    en: "Choose your city or municipality.",
    tl: "Piliin ang iyong lungsod o bayan.",
  },
  err_barangay_required: { en: "Choose your barangay.", tl: "Piliin ang iyong barangay." },
  farm_loc_ph: {
    en: "e.g. Cabanatuan City, Nueva Ecija",
    tl: "hal. Cabanatuan City, Nueva Ecija",
  },
  farm_phone_lbl: { en: "Phone Number", tl: "Numero ng Telepono" },
  err_years_required: {
    en: "Enter a valid number of years (0–80).",
    tl: "Maglagay ng wastong bilang ng taon (0–80).",
  },
  err_phone_required: { en: "Phone number is required.", tl: "Kailangan ang numero ng telepono." },
  crops_setting_up: { en: "Setting up your profile…", tl: "Inaayos ang profile mo…" },

  // ── Extra: home ───────────────────────────────────────────────────────────
  home_offline_cached: { en: "Offline: cached data", tl: "Offline: naka-save na datos" },
  // ── Alerts (header bell) ──────────────────────────────────────────────────
  alerts_title: { en: "Alerts", tl: "Mga Abiso" },
  alerts_sub: {
    en: "Prices and weather worth knowing today",
    tl: "Presyo at panahon na dapat mong malaman ngayon",
  },
  alerts_none: { en: "Nothing to flag right now", tl: "Wala munang abiso ngayon" },
  alerts_none_sub: {
    en: "We'll tell you when a price moves sharply or rain is coming.",
    tl: "Sasabihin namin kapag biglang gumalaw ang presyo o may paparating na ulan.",
  },
  alert_price_up: { en: "Price going up", tl: "Tumataas ang presyo" },
  alert_price_down: { en: "Price going down", tl: "Bumababa ang presyo" },
  alerts_open: { en: "Open alerts", tl: "Buksan ang mga abiso" },
  // Buyer set: same sheet, different news.
  alerts_sub_buyer: {
    en: "Deals and new harvests worth knowing today",
    tl: "Mga sulit at bagong ani na dapat mong malaman ngayon",
  },
  alerts_none_sub_buyer: {
    en: "We'll tell you when prices drop or a farmer near you posts a harvest.",
    tl: "Sasabihin namin kapag bumaba ang presyo o may bagong ani malapit sa iyo.",
  },
  alert_new_near: { en: "New harvest near you", tl: "Bagong ani malapit sa iyo" },
  alert_buy_cheaper: { en: "Cheaper today", tl: "Mas mura ngayon" },
  alert_buy_cheaper_note: { en: "good time to buy", tl: "magandang bumili ngayon" },
  alert_buy_rising: { en: "Price rising", tl: "Tumataas ang presyo" },
  alert_buy_rising_note: { en: "buy before it climbs", tl: "bumili na bago tumaas pa" },

  home_advisory: { en: "Today's Advisory", tl: "Payo Ngayon" },
  home_advisory_sub: { en: "From your local DA office", tl: "Mula sa lokal na opisina ng DA" },
  home_adv_planting: { en: "Good planting conditions", tl: "Mainam ang panahon sa pagtatanim" },
  home_adv_planting_sub: {
    en: "Rice and corn seedlings can be transplanted this week.",
    tl: "Pwede nang ilipat ang punla ng palay at mais ngayong linggo.",
  },
  home_adv_rain: { en: "Rain expected Wednesday", tl: "Inaasahang uulan sa Miyerkules" },
  home_adv_rain_sub: {
    en: "Harvest now. Protect harvested crops from moisture.",
    tl: "Mag-ani na. Protektahan ang ani mula sa halumigmig.",
  },

  // ── Extra: market ─────────────────────────────────────────────────────────
  market_hello: { en: "Hello", tl: "Kumusta" },

  // ── Extra: trade / marketplace ────────────────────────────────────────────
  trade_select_variety: { en: "Select Variety", tl: "Piliin ang Klase" },
  trade_post_title: { en: "Post your crops", tl: "I-post ang pananim mo" },
  trade_post_sub: { en: "Sell your harvest", tl: "Ibenta ang ani mo" },
  trade_edit_listing: { en: "Edit Listing", tl: "I-edit ang Paninda" },
  trade_edit_listing_sub: { en: "Update your listing", tl: "I-update ang paninda mo" },
  trade_step_type: { en: "What type of crop?", tl: "Anong uri ng pananim?" },
  trade_step_type_sub: { en: "Tap your crop type", tl: "Pindutin ang uri ng pananim mo" },
  trade_step_variety: { en: "Which variety?", tl: "Aling klase?" },
  trade_step_variety_sub: { en: "Select the specific variety", tl: "Piliin ang tiyak na klase" },
  trade_step_price: { en: "How much per kilo? (₱/kg)", tl: "Magkano kada kilo? (₱/kg)" },
  trade_step_price_sub: { en: "Enter the price in pesos", tl: "Ilagay ang presyo sa piso" },
  trade_step_qty: { en: "How many kilos to sell?", tl: "Ilang kilo ang ibebenta?" },
  trade_step_qty_sub: { en: "Enter the quantity in kilos", tl: "Ilagay ang dami sa kilo" },
  trade_step_desc: { en: "Describe your product", tl: "Ilarawan ang produkto mo" },
  trade_step_desc_sub: { en: "State if fresh, clean, etc.", tl: "Sabihin kung sariwa, malinis, atbp." },
  trade_step_loc: { en: "Where are you located?", tl: "Saan ka matatagpuan?" },
  trade_step_loc_sub: { en: "Your city or barangay", tl: "Ang lungsod o barangay mo" },
  trade_ph_price: { en: "Example: 48", tl: "Halimbawa: 48" },
  trade_ph_qty: { en: "Example: 500", tl: "Halimbawa: 500" },
  trade_ph_desc: {
    en: "Example: Freshly harvested, clean and ready for sale...",
    tl: "Halimbawa: Bagong ani, malinis at handang ibenta...",
  },
  trade_ph_loc: { en: "Example: Cabanatuan City", tl: "Halimbawa: Cabanatuan City" },
  trade_post_now: { en: "Post Now!", tl: "I-post Na!" },
  trade_remove: { en: "Remove", tl: "Alisin" },
  trade_remove_title: { en: "Remove Listing?", tl: "Alisin ang Paninda?" },
  trade_remove_sub: {
    en: "Your listing will be permanently deleted. This cannot be undone.",
    tl: "Mabubura nang tuluyan ang paninda mo. Hindi na ito maibabalik.",
  },
  trade_yes_remove: { en: "Yes, Remove", tl: "Oo, Alisin" },
  err_desc_required: { en: "Description is required.", tl: "Kailangan ang paglalarawan." },
  err_valid_price: { en: "Enter a valid price.", tl: "Maglagay ng wastong presyo." },
  err_valid_qty: { en: "Enter a valid quantity.", tl: "Maglagay ng wastong dami." },
  err_loc_required: { en: "Location is required.", tl: "Kailangan ang lokasyon." },
  cart_order_sent: {
    en: "Your order has been sent to the sellers. They will contact you shortly.",
    tl: "Naipadala na ang order mo. Sila na ang lalapit sa iyo.",
  },
  cart_txn_recorded: { en: "Transaction recorded", tl: "Naitala ang transaksyon" },
  seller_about: { en: "About the Seller", tl: "Tungkol sa Nagbebenta" },

  // ── Extra: expenses ───────────────────────────────────────────────────────
  exp_add_title: { en: "Add New Expense", tl: "Magdagdag ng Bagong Gastos" },
  exp_add_sub: { en: "Fill in your expense details", tl: "Punan ang detalye ng gastos" },
  exp_edit_title: { en: "Edit Expense", tl: "I-edit ang Gastos" },
  date_today: { en: "Today", tl: "Ngayon" },
  date_yesterday: { en: "Yesterday", tl: "Kahapon" },
  date_other: { en: "Other date", tl: "Ibang petsa" },
  date_prev_month: { en: "Previous month", tl: "Nakaraang buwan" },
  date_next_month: { en: "Next month", tl: "Susunod na buwan" },
  exp_delete_this: { en: "Delete this expense", tl: "Burahin ang gastos na ito" },
  exp_edit_sub: { en: "Update the details below", tl: "I-update ang mga detalye" },
  exp_crop: { en: "Crop", tl: "Pananim" },
  exp_desc_lbl: { en: "Description", tl: "Paglalarawan" },
  exp_amount: { en: "Amount (₱)", tl: "Halaga (₱)" },
  exp_date: { en: "Date", tl: "Petsa" },
  exp_category: { en: "Category", tl: "Kategorya" },
  exp_ph_desc: {
    en: "e.g. Hybrid Rice Seeds, Urea Fertilizer...",
    tl: "hal. Binhi ng Palay, Urea na Pataba...",
  },
  exp_delete_title: { en: "Delete Transaction?", tl: "Burahin ang Gastos?" },
  exp_delete_sub: { en: "This action cannot be undone.", tl: "Hindi na ito maibabalik." },
  exp_no_txn: { en: "No transactions found.", tl: "Walang nahanap na gastos." },
  exp_expense_one: { en: "expense", tl: "gastos" },
  exp_expenses_many: { en: "expenses", tl: "gastos" },
  exp_per_crop_stacked: { en: "per crop · stacked", tl: "kada pananim · nakasalansan" },
  exp_no_data: {
    en: "No data yet. Add expenses to see monthly breakdown.",
    tl: "Wala pang datos. Magdagdag ng gastos para makita ang buwanang buod.",
  },
  exp_none: { en: "No expenses yet.", tl: "Wala pang gastos." },
  err_amount: { en: "Enter a valid amount.", tl: "Maglagay ng wastong halaga." },
  calc_title: { en: "Farm Calculator", tl: "Calculator ng Bukid" },
  calc_use: { en: "Use as Expense Amount", tl: "Gamitin bilang Halaga ng Gastos" },
  exp_total_spent: { en: "Total Spent", tl: "Kabuuang Nagastos" },
  exp_purchases_n: { en: "purchases", tl: "binili" },
  exp_purchase_one: { en: "purchase", tl: "binili" },
  exp_purchase_history: { en: "Purchase History", tl: "Kasaysayan ng Binili" },
  exp_past_txn: { en: "past transactions", tl: "nakaraang transaksyon" },
  exp_past_txn_one: { en: "past transaction", tl: "nakaraang transaksyon" },
  exp_no_purchases: { en: "No purchases yet.", tl: "Wala pang binili." },
  exp_buyer_sub: { en: "Purchase history", tl: "Mga binili" },

  // ── Extra: analytics ──────────────────────────────────────────────────────
  ana_outlook: { en: "7-Day Price Outlook", tl: "7-Araw na Taya ng Presyo" },
  ana_actual: { en: "Actual Price", tl: "Aktwal na Presyo" },
  ana_pred: { en: "LSTM Prediction", tl: "Taya ng LSTM" },
  ana_band: { en: "Confidence Band", tl: "Saklaw ng Kumpiyansa" },
  ana_uptrend: { en: "Uptrend", tl: "Pataas" },
  ana_downtrend: { en: "Downtrend", tl: "Pababa" },
  ana_stable: { en: "Stable", tl: "Matatag" },
  ana_over7: { en: "₱/kg over 7 days", tl: "₱/kg sa loob ng 7 araw" },
  ana_watch: { en: "WATCH", tl: "BANTAYAN" },
  ana_act_sell: { en: "Sell now", tl: "Ibenta na" },
  ana_act_hold: { en: "Hold", tl: "Hintayin" },
  ana_act_watch: { en: "Watch", tl: "Bantayan" },
  ana_today: { en: "Today", tl: "Ngayon" },
  ana_in_3_days: { en: "In 3 days", tl: "Sa 3 araw" },
  ana_forecast_by: { en: "Forecast by ARIMA + AI.", tl: "Taya ng ARIMA + AI." },
  ana_hold_reason: {
    en: "Price is going up. Waiting a few days may earn you more.",
    tl: "Tumataas ang presyo. Baka mas kumita ka kung maghihintay ng ilang araw.",
  },
  ana_sell_reason: {
    en: "Price is going down. Selling soon avoids a lower price.",
    tl: "Bumababa ang presyo. Mas mabuting magbenta na agad.",
  },
  ana_watch_reason: {
    en: "No clear direction yet. Check again tomorrow.",
    tl: "Wala pang malinaw na direksyon. Tingnan ulit bukas.",
  },
  ana_lstm_note: {
    en: "Predictions generated by an LSTM neural network trained on 3 years of Nueva Ecija market data. Confidence intervals shown at 95%. Not financial advice. Always verify with local market conditions.",
    tl: "Ang mga taya ay galing sa LSTM neural network na sinanay sa 3 taong datos ng merkado ng Nueva Ecija. 95% ang confidence interval. Hindi ito payong pinansyal. Laging suriin ang aktwal na presyo sa merkado.",
  },
  ana_forecast_note: {
    en: "Forecast by ARIMA. A guide, not a promise: check your local market too.",
    tl: "Taya ng ARIMA. Gabay lamang, hindi pangako: tingnan din ang lokal na merkado.",
  },

  // ── Language gate (first run) ─────────────────────────────────────────────
  lang_title: { en: "Choose your language", tl: "Piliin ang wika" },
  lang_sub: { en: "Piliin ang wika", tl: "Choose your language" },
  lang_tl: { en: "Tagalog", tl: "Tagalog" },
  lang_tl_desc: {
    en: "Buong app, sa Tagalog",
    tl: "Buong app, sa Tagalog",
  },
  lang_en: { en: "English", tl: "English" },
  lang_en_desc: {
    en: "Whole app, in English",
    tl: "Whole app, in English",
  },
  lang_change_later: {
    en: "You can change this any time in Settings.",
    tl: "Pwede mo itong palitan anumang oras sa Setting.",
  },

  // ── Welcome / price board ─────────────────────────────────────────────────
  splash_board_label: { en: "Palay today", tl: "Palay ngayon" },
  /** Suffix for the other crop groups on the welcome board: "Onions today". */
  splash_board_today: { en: "today", tl: "ngayon" },
  splash_from_yesterday: { en: "from yesterday", tl: "mula kahapon" },
  splash_last_update: { en: "Last updated 6:05 AM", tl: "Huling update 6:05 ng umaga" },
  splash_lines: {
    en: "Prices, marketplace, expenses,\nand weather: all in one place.",
    tl: "Presyo, bentahan, gastos, at panahon:\nnasa isang lugar na lang.",
  },
  splash_have_account: { en: "I already have an account", tl: "Mayroon na akong account" },
  splash_free: { en: "Free. No paid account.", tl: "Libre. Walang bayad na account." },

  // ── Role ──────────────────────────────────────────────────────────────────
  role_pick_one: {
    en: "Tap one. We'll set up the app to match.",
    tl: "Pumili lamang ng isa.",
  },
  role_continue_as: { en: "Continue as", tl: "Magpatuloy bilang" },
  role_say_farmer: { en: "Ready to sell your harvest?", tl: "Handa ka nang magbenta ng ani?" },
  role_say_buyer: { en: "Looking for fresh veggies?", tl: "Naghahanap ng sariwang gulay?" },
  role_say_hi_sub: { en: "I'm Juan. Which one are you?", tl: "Ako si Juan. Alin ka rito?" },
  role_say_farmer_sub: { en: "Let's get you the best price.", tl: "Hanapan natin ng magandang presyo." },
  role_say_buyer_sub: { en: "Straight from local farms.", tl: "Diretso mula sa mga lokal na bukid." },

  // ── Form helpers ──────────────────────────────────────────────────────────
  auth_show: { en: "Show", tl: "Ipakita" },
  auth_hide: { en: "Hide", tl: "Itago" },
  auth_help_cp: {
    en: "We'll send your confirmation here.",
    tl: "Dito namin ipapadala ang kumpirmasyon.",
  },
  auth_help_pw: {
    en: "6 letters or numbers, or more.",
    tl: "6 na letra o numero pataas.",
  },
  auth_help_years: {
    en: "Roughly how long you've been farming.",
    tl: "Humigit-kumulang na taon mo nang pagsasaka.",
  },
  auth_forgot: { en: "Forgot your password?", tl: "Nakalimutan ang password?" },
  auth_contact_method: { en: "How we'll reach you", tl: "Paano ka namin makokontak" },
  auth_pw_match: { en: "Passwords match", tl: "Magkatugma ang password" },
  crops_none_yet: { en: "None selected yet", tl: "Wala pang napili" },

  // ── Empty / error / loading states ────────────────────────────────────────
  // "No results" and "nothing yet" are deliberately different messages.
  state_no_match_title: { en: "No crop found", tl: "Walang nahanap na pananim" },
  state_no_match_body: {
    en: "Nothing matches that search. Check the spelling, or clear it to see everything.",
    tl: "Walang tugma sa hinahanap mo. Tingnan ang baybay, o burahin para makita lahat.",
  },
  state_clear_search: { en: "Clear search", tl: "Burahin ang hinahanap" },

  state_no_expenses_title: { en: "No expenses yet", tl: "Wala pang gastos" },
  state_no_expenses_body: {
    en: "Record seeds, fertilizer, and labor here. Your totals per crop build up from these.",
    tl: "Itala dito ang binhi, abono, at upa sa tao. Dito magmumula ang kabuuan kada pananim.",
  },
  state_add_first_expense: { en: "Record first expense", tl: "Itala ang unang gastos" },

  state_no_filtered_exp_title: { en: "Nothing in this filter", tl: "Walang laman ang salaan" },
  state_no_filtered_exp_body: {
    en: "You have expenses recorded, just none matching this filter.",
    tl: "May naitala kang gastos, pero walang tugma sa salaang ito.",
  },
  state_show_all: { en: "Show all", tl: "Ipakita lahat" },

  state_no_purchases_title: { en: "No purchases yet", tl: "Wala pang binili" },
  state_no_purchases_body: {
    en: "Crops you buy from farmers will appear here.",
    tl: "Makikita dito ang mga aning binili mo sa magsasaka.",
  },

  state_error_title: { en: "Couldn't load prices", tl: "Hindi makuha ang presyo" },
  state_error_body: {
    en: "Check your signal and try again. Saved prices are still shown below.",
    tl: "Tingnan ang signal at subukan ulit. Nasa ibaba pa rin ang naka-save na presyo.",
  },
  state_retry: { en: "Try again", tl: "Subukan ulit" },
  state_loading_prices: { en: "Loading prices", tl: "Kinukuha ang presyo" },

  // ── Guided tour, farmer ─────────────────────────────────────────
  // Every line is read once, by someone holding the phone for the first time.
  // Short sentences, the real button names, and nothing about the app that
  // isn't about their farm.
  tour_title: { en: "Quick tour", tl: "Mabilis na gabay" },
  tour_step: { en: "Step {n} of {total}", tl: "Hakbang {n} sa {total}" },
  tour_start: { en: "Start", tl: "Simulan" },
  tour_next: { en: "Next", tl: "Susunod" },
  tour_skip: { en: "Skip", tl: "Laktawan" },
  tour_done: { en: "Done", tl: "Tapos na" },

  tour_intro_t: { en: "Welcome to AniSense", tl: "Maligayang pagdating sa AniSense" },
  tour_intro_b: {
    en: "A quick look at your Home screen — {n} short steps, about a minute. You can skip it now and open it again any time from More tools or Profile.",
    tl: "Mabilis na pasyal sa Home mo — {n} maikling hakbang, mga isang minuto. Puwede mong laktawan ngayon at buksan ulit kahit kailan sa Iba pang gamit o sa Profile.",
  },
  tour_harvest_t: { en: "What you are selling", tl: "Ang binebenta mo" },
  tour_harvest_b: {
    en: "Your listings and what they are worth today. The green button posts a new harvest — it goes straight to the Market, where buyers look.",
    tl: "Ang mga nakalista mo at ang halaga nito ngayon. Ang berdeng buton ang nagpo-post ng bagong ani — diretso ito sa Merkado, kung saan tumitingin ang mga bumibili.",
  },
  tour_prices_t: { en: "Today's prices", tl: "Presyo ngayon" },
  tour_prices_b: {
    en: "The farmgate price of the crops you grow, and whether it rose or fell. Tap one to see its last seven days.",
    tl: "Ang presyo sa bukid ng mga tinatanim mo, at kung tumaas o bumaba. Pindutin ang isa para makita ang huling pitong araw.",
  },
  tour_forecast_t: { en: "Sell, hold, or wait", tl: "Ibenta, itago, o maghintay" },
  tour_forecast_b: {
    en: "What the model expects the price to do next, and what it suggests you do about it. Treat it as advice, not a promise.",
    tl: "Ang inaasahan ng modelo sa presyo, at ang mungkahi nito sa iyo. Gabay lang ito, hindi katiyakan.",
  },
  tour_tracker_t: { en: "What is in the ground", tl: "Ang nakatanim mo" },
  tour_tracker_b: {
    en: "Add the day you planted and the app counts for you: \u201Crice, day 62 of 110\u201D. You never have to work out the date again.",
    tl: "Ilagay ang araw ng pagtatanim at ito na ang bibilang: \u201Cpalay, ika-62 araw sa 110\u201D. Hindi mo na kailangang bilangin ang petsa.",
  },
  tour_alerts_t: { en: "Tell it your price", tl: "Sabihin ang presyo mo" },
  tour_alerts_b: {
    en: "Waiting for calamansi to reach ₱170? Set it here and the app tells you the day the market gets there.",
    tl: "Hinihintay mong umabot sa ₱170 ang kalamansi? Ilagay dito at sasabihin ng app kung kailan ito naabot ng merkado.",
  },
  tour_profit_t: { en: "Earned, spent, left over", tl: "Kita, gastos, natira" },
  tour_profit_b: {
    en: "Record each sale here. With your expenses it shows what you actually kept this month or this season.",
    tl: "Itala ang bawat benta dito. Kasama ang mga gastos, makikita mo kung magkano talaga ang natira ngayong buwan o anihan.",
  },
  tour_tools_t: { en: "More tools", tl: "Iba pang gamit" },
  tour_tools_b: {
    en: "Weather before you spray or dry palay, Analytics for the longer view, and this guide whenever you need it again.",
    tl: "Panahon bago mag-spray o magbilad ng palay, Analytics para sa mas malawak na tanaw, at ang gabay na ito kahit kailan.",
  },
  tour_nav_t: { en: "The five tabs", tl: "Ang limang tab" },
  tour_nav_b: {
    en: "Home, Prices, Market, Expenses, Profile. Everything in AniSense is one tap from this bar.",
    tl: "Home, Presyo, Merkado, Gastos, Profile. Isang pindot lang ang lahat mula sa bar na ito.",
  },
  tour_done_t: { en: "That's everything", tl: "Ayan na ang lahat" },
  tour_done_b: {
    en: "Open this again whenever you like: More tools → How to use AniSense. It has step-by-step instructions for each job as well.",
    tl: "Buksan ulit ito kahit kailan: Iba pang gamit → Paano gamitin ang AniSense. May hakbang-hakbang din doon sa bawat gawain.",
  },

  // ── Guided tour, buyer ──────────────────────────────────────────
  // The same voice as the farmer's, for someone on the other side of the
  // sale: where to look, how to tell a fair price, how to buy again.
  tour_b_intro_t: { en: "Welcome to AniSense", tl: "Maligayang pagdating sa AniSense" },
  tour_b_intro_b: {
    en: "A quick look at how to buy straight from Nueva Ecija farmers — {n} short steps, about a minute. Skip it now and replay it any time from Profile.",
    tl: "Mabilis na pasyal kung paano bumili nang direkta sa mga magsasaka ng Nueva Ecija — {n} maikling hakbang, mga isang minuto. Puwede mong laktawan ngayon at ulitin kahit kailan sa Profile.",
  },
  tour_b_search_t: { en: "Find anything", tl: "Hanapin ang kahit ano" },
  tour_b_search_b: {
    en: "Type a crop or a farmer's name. The Market opens with the results already waiting.",
    tl: "I-type ang pananim o pangalan ng magsasaka. Bubukas ang Merkado na may resulta na.",
  },
  tour_b_crops_t: { en: "Shop by crop", tl: "Mamili ayon sa pananim" },
  tour_b_crops_b: {
    en: "Tap a picture to see every listing of that crop in the Market.",
    tl: "Pindutin ang larawan para makita ang lahat ng listing ng pananim na iyon sa Merkado.",
  },
  tour_b_featured_t: { en: "Worth a look today", tl: "Sulit tingnan ngayon" },
  tour_b_featured_b: {
    en: "The best-rated harvest of each crop right now. Swipe sideways for more.",
    tl: "Ang pinakamataas ang rating na ani ng bawat pananim ngayon. Mag-swipe pakanan para sa iba pa.",
  },
  tour_b_moves_t: { en: "Which prices moved", tl: "Aling presyo ang gumalaw" },
  tour_b_moves_b: {
    en: "What went up and what came down at the farmgate today, so you know a fair price before you pay one.",
    tl: "Ang tumaas at bumaba sa bukid ngayon, para alam mo ang tamang presyo bago ka magbayad.",
  },
  tour_b_farmers_t: { en: "The people who grow it", tl: "Ang mga nagtatanim" },
  tour_b_farmers_b: {
    en: "Farmers near you, with their ratings. Tap one to see everything they are selling right now.",
    tl: "Mga magsasakang malapit sa iyo at ang rating nila. Pindutin ang isa para makita ang lahat ng binebenta niya ngayon.",
  },
  tour_b_purchases_t: { en: "What you bought", tl: "Ang mga binili mo" },
  tour_b_purchases_b: {
    en: "What you have spent, and your last orders with Buy again — one tap and it is back in your cart.",
    tl: "Ang nagastos mo, at ang mga huling order mo na may Bilhin ulit — isang pindot at nasa cart mo na ulit.",
  },
  tour_b_bell_t: { en: "The bell", tl: "Ang kampana" },
  tour_b_bell_b: {
    en: "It tells you when a farmer in your town posts a new harvest, and when a price drops.",
    tl: "Sinasabi nito kapag may bagong ani ang magsasaka sa bayan mo, at kapag bumaba ang presyo.",
  },
  tour_b_nav_t: { en: "The five tabs", tl: "Ang limang tab" },
  tour_b_nav_b: {
    en: "Home, Prices, Market, Orders, Profile. You buy in Market — add to your cart there — and Orders keeps everything you have bought.",
    tl: "Home, Presyo, Merkado, Mga Order, Profile. Sa Merkado ka bumibili — idagdag sa cart doon — at nasa Mga Order ang lahat ng binili mo.",
  },
  tour_b_done_t: { en: "You're ready to shop", tl: "Handa ka nang mamili" },
  tour_b_done_b: {
    en: "Open this again whenever you like: Profile → Take the tour again.",
    tl: "Buksan ulit ito kahit kailan: Profile → Ulitin ang gabay.",
  },

  // ── The guide page ─────────────────────────────────────────────
  gd_title: { en: "How to use AniSense", tl: "Paano gamitin ang AniSense" },
  gd_sub: { en: "Step by step", tl: "Hakbang-hakbang" },
  gd_replay_t: { en: "Take the tour again", tl: "Ulitin ang gabay" },
  gd_replay_s: {
    en: "The same walkthrough the app ran the first time you opened it. About a minute.",
    tl: "Ang parehong gabay noong una mong binuksan ang app. Mga isang minuto.",
  },
  gd_replay_btn: { en: "Start the tour", tl: "Simulan ang gabay" },
  gd_topics: { en: "What do you want to do?", tl: "Ano ang gusto mong gawin?" },
  gd_foot: {
    en: "AniSense v1.0.0 · Ani mo, alam mo.",
    tl: "AniSense v1.0.0 · Ani mo, alam mo.",
  },

  gd_post_t: { en: "Post a harvest for sale", tl: "Mag-post ng ani para ibenta" },
  gd_post_s: { en: "From your Home to the Market", tl: "Mula sa Home papunta sa Merkado" },
  gd_post_1: { en: "On Home, go to Your harvest — the first card on the page.", tl: "Sa Home, pumunta sa Ang ani mo — ang unang card sa pahina." },
  gd_post_2: { en: "Tap Post a harvest. The Market opens with the form ready.", tl: "Pindutin ang Mag-post ng ani. Bubukas ang Merkado kasama ang form." },
  gd_post_3: { en: "Choose the kind of crop, then the variety — Rice, then Well Milled, for example.", tl: "Piliin ang uri ng pananim, tapos ang klase — halimbawa Bigas, tapos Well Milled." },
  gd_post_4: { en: "Fill in the price per kilo, how many kilos, a short description, and where you are.", tl: "Ilagay ang presyo kada kilo, ilang kilo, maikling paglalarawan, at kung saan ka." },
  gd_post_5: { en: "Tap Post Now! Your listing appears in the Market immediately, and on your own Home under Your harvest.", tl: "Pindutin ang I-post Na! Agad itong lalabas sa Merkado, at sa sarili mong Home sa ilalim ng Ang ani mo." },
  gd_post_note: {
    en: "Add a photo of the actual harvest if you can. A listing with a real photo is the one a buyer opens first.",
    tl: "Maglagay ng litrato ng totoong ani kung kaya. Ang listing na may litrato ang unang binubuksan ng bumibili.",
  },

  gd_alerts_t: { en: "Set a price alert", tl: "Maglagay ng abiso sa presyo" },
  gd_alerts_s: { en: "Be told when your price arrives", tl: "Malaman kung kailan dumating ang presyo mo" },
  gd_alerts_1: { en: "On Home, scroll down to Price alerts.", tl: "Sa Home, mag-scroll pababa sa Abiso sa presyo." },
  gd_alerts_2: { en: "Tap Add a price alert.", tl: "Pindutin ang Magdagdag ng abiso." },
  gd_alerts_3: { en: "Choose the crop, then set the price you are waiting for with the − and + buttons.", tl: "Piliin ang pananim, tapos itakda ang hinihintay mong presyo gamit ang − at +." },
  gd_alerts_4: { en: "Save it. When the market reaches that price, the alert waits for you under the bell at the top of the screen.", tl: "I-save. Kapag inabot ng merkado ang presyong iyon, naghihintay ang abiso sa ilalim ng kampana sa itaas ng screen." },

  gd_tracker_t: { en: "Track what you planted", tl: "Subaybayan ang itinanim mo" },
  gd_tracker_s: { en: "The app counts the days for you", tl: "Ang app na ang bibilang ng araw" },
  gd_tracker_1: { en: "On Home, find In the ground.", tl: "Sa Home, hanapin ang Nakatanim ngayon." },
  gd_tracker_2: { en: "Tap Add a planting.", tl: "Pindutin ang Magdagdag ng tanim." },
  gd_tracker_3: { en: "Choose the crop and the day you planted it. The usual days to harvest are filled in for you — change them with − and + if your variety is different.", tl: "Piliin ang pananim at ang araw ng pagtatanim. Nakalagay na ang karaniwang bilang ng araw bago mag-ani — baguhin gamit ang − at + kung iba ang klase mo." },
  gd_tracker_4: { en: "Save. From then on the card counts on its own, and the bell tells you the week your harvest is due.", tl: "I-save. Mula noon, mag-isa nang bibilang ang card, at sasabihin ng kampana kung anong linggo dapat anihin." },

  gd_sale_t: { en: "Record a sale", tl: "Itala ang isang benta" },
  gd_sale_s: { en: "So the net figure is true", tl: "Para totoo ang natirang halaga" },
  gd_sale_1: { en: "On Home, go to Earned and spent.", tl: "Sa Home, pumunta sa Kita at gastos." },
  gd_sale_2: { en: "Tap Record a sale.", tl: "Pindutin ang Itala ang benta." },
  gd_sale_3: { en: "Choose the crop, the kilos you sold, and the price you were paid.", tl: "Piliin ang pananim, ang kilong naibenta, at ang presyong ibinayad sa iyo." },
  gd_sale_4: { en: "Save. The green figure is what came in; the one under it is what is left after your expenses.", tl: "I-save. Ang berdeng halaga ang pumasok; ang nasa ilalim nito ang natira pagkatapos ng gastos." },
  gd_sale_note: {
    en: "Record the small sales too. The net figure is only as honest as what you put into it.",
    tl: "Itala rin ang maliliit na benta. Kasingtotoo lang ng inilagay mo ang halagang lalabas.",
  },

  gd_prices_t: { en: "Read today's prices", tl: "Basahin ang presyo ngayon" },
  gd_prices_s: { en: "Seven days back, three days forward", tl: "Pitong araw pabalik, tatlong araw pasulong" },
  gd_prices_1: { en: "Tap Prices in the bar at the bottom.", tl: "Pindutin ang Presyo sa bar sa ibaba." },
  gd_prices_2: { en: "The dark card at the top says how many crops went up today.", tl: "Sinasabi ng maitim na card sa itaas kung ilang pananim ang tumaas ngayon." },
  gd_prices_3: { en: "Search for a crop, or tap one in the list.", tl: "Maghanap ng pananim, o pindutin ang isa sa listahan." },
  gd_prices_4: { en: "Inside you get the last seven days and the next three as the model expects them.", tl: "Sa loob makikita mo ang huling pitong araw at ang susunod na tatlo ayon sa modelo." },
  gd_prices_note: {
    en: "A forecast is a guide, not a guarantee. Weigh it against what traders are actually paying you this week.",
    tl: "Ang hula ay gabay, hindi garantiya. Timbangin ito sa aktuwal na binabayad sa iyo ngayong linggo.",
  },

  gd_expenses_t: { en: "Keep your costs", tl: "Itala ang mga gastos" },
  gd_expenses_s: { en: "Seeds, fertiliser, labour, fuel", tl: "Binhi, abono, trabaho, gasolina" },
  gd_expenses_1: { en: "Tap Expenses in the bar at the bottom.", tl: "Pindutin ang Gastos sa bar sa ibaba." },
  gd_expenses_2: { en: "Tap + Add Expense, then choose what it was for, the amount, and the crop.", tl: "Pindutin ang + Magdagdag ng Gastos, tapos piliin kung para saan, ang halaga, at ang pananim." },
  gd_expenses_3: { en: "The total at the top is this month against last month; the tabs break it down by crop and by month.", tl: "Ang kabuuan sa itaas ay ngayong buwan kumpara noong nakaraan; hinahati ito ng mga tab ayon sa pananim at buwan." },

  gd_weather_t: { en: "Check the weather", tl: "Tingnan ang panahon" },
  gd_weather_s: { en: "Before you spray or dry palay", tl: "Bago mag-spray o magbilad ng palay" },
  gd_weather_1: { en: "On Home, open More tools, then Weather.", tl: "Sa Home, buksan ang Iba pang gamit, tapos Panahon." },
  gd_weather_2: { en: "You get the next hours and the rest of the week for your own town.", tl: "Makikita mo ang susunod na oras at ang natitirang linggo para sa bayan mo." },
  gd_weather_3: { en: "The advisory card on Home is the short version: when it is a poor week to spray, or to dry palay outside.", tl: "Ang payo sa Home ang maikling bersyon: kung hindi magandang linggo para mag-spray, o magbilad ng palay sa labas." },

  gd_profile_t: { en: "Your profile and ID", tl: "Ang profile at ID mo" },
  gd_profile_s: { en: "How buyers reach you", tl: "Paano ka maaabot ng mga bumibili" },
  gd_profile_1: { en: "Tap Profile in the bar at the bottom.", tl: "Pindutin ang Profile sa bar sa ibaba." },
  gd_profile_2: { en: "Tap Edit to correct your phone number — that is the number a buyer calls when they want your harvest.", tl: "Pindutin ang I-edit para itama ang numero mo — iyan ang tinatawagan ng bumibili kapag gusto nila ang ani mo." },
  gd_profile_3: { en: "Show Member ID opens your AniSense card. You can save it to your phone.", tl: "Binubuksan ng Ipakita ang Member ID ang card mo sa AniSense. Puwede mo itong i-save sa telepono." },
  gd_profile_4: { en: "Language switches the whole app between English and Tagalog. Nothing is lost when you switch.", tl: "Pinapalitan ng Wika ang buong app sa Ingles o Tagalog. Walang mawawala kapag nagpalit ka." },

  // The guide's own tile in More tools.
  home_mod_guide: { en: "How to use", tl: "Paano gamitin" },
  home_mod_guide_desc: { en: "A step-by-step guide", tl: "Gabay hakbang-hakbang" },
  home_mod_tour: { en: "How to use", tl: "Paano gamitin" },

  // ── Profit on the Expenses page ────────────────────────────────────────────
  pf_title: { en: "Your profit", tl: "Ang kita mo" },
  pf_sub: {
    en: "What each crop has cost you, what your harvest is worth at today's price, and what it actually sold for.",
    tl: "Ang nagastos sa bawat pananim, ang halaga ng ani sa presyo ngayon, at ang aktuwal na naibenta.",
  },
  pf_est: { en: "Estimated profit", tl: "Tantiyang kita" },
  pf_est_sub: { en: "If you sold your expected harvest at today's price", tl: "Kung ibebenta ang inaasahang ani sa presyo ngayon" },
  pf_final: { en: "Final profit", tl: "Totoong kita" },
  pf_final_sub: { en: "From the sales you recorded, less all expenses", tl: "Mula sa naitalang benta, bawas ang lahat ng gastos" },
  pf_none_set: { en: "Set an expected harvest below", tl: "Ilagay ang inaasahang ani sa ibaba" },
  pf_no_sales: { en: "No sales recorded yet", tl: "Wala pang naitalang benta" },
  pf_spent: { en: "Spent", tl: "Gastos" },
  pf_sold: { en: "Sold", tl: "Naibenta" },
  pf_not_sold: { en: "Not sold yet", tl: "Hindi pa naibebenta" },
  pf_worth: { en: "{kg} kg × ₱{price} today", tl: "{kg} kg × ₱{price} ngayon" },
  pf_set_harvest: { en: "How much do you expect to harvest?", tl: "Gaano karami ang inaasahang ani?" },
  pf_set: { en: "Set", tl: "Ilagay" },
  pf_record_hint: {
    en: "Record your sales on Home, in Earned and spent, to see your final profit.",
    tl: "Itala ang benta sa Home, sa Kita at gastos, para makita ang totoong kita.",
  },
  pf_sheet_title: { en: "Expected harvest", tl: "Inaasahang ani" },
  pf_sheet_q: { en: "About how many kilos of {crop} do you expect?", tl: "Mga ilang kilo ng {crop} ang inaasahan mo?" },
  pf_sheet_worth: { en: "Worth about {amount} at today's price of {price}/kg.", tl: "Halagang mga {amount} sa presyo ngayon na {price}/kg." },
  pf_save: { en: "Save expected harvest", tl: "I-save ang inaasahang ani" },
  pf_less: { en: "Less", tl: "Bawasan" },
  pf_more: { en: "More", tl: "Dagdagan" },
  pf_after: { en: "After this, {crop}'s estimated profit: {amount}", tl: "Pagkatapos nito, tantiyang kita sa {crop}: {amount}" },
  pf_set_hint: {
    en: "Set {crop}'s expected harvest in Your profit to see what this cost does to it.",
    tl: "Ilagay ang inaasahang ani ng {crop} sa Ang kita mo para makita ang epekto ng gastos na ito.",
  },
  home_mod_tour_desc: { en: "A quick tour of the app", tl: "Mabilis na pasyal sa app" },
};

// ── Data-name labels (crop groups, expense categories) ───────────────────────
// Data values stay in English internally; this maps them to a display label.
const NAME_KEYS: Record<string, keyof typeof translations> = {
  Rice: "crop_rice",
  Corn: "crop_corn",
  Onions: "crop_onions",
  Tomatoes: "crop_tomatoes",
  Calamansi: "crop_calamansi",
  Mango: "crop_mango",
  Garlic: "crop_garlic",
  Squash: "crop_squash",
  Ampalaya: "crop_ampalaya",
  Watermelon: "crop_watermelon",
  Vegetables: "crop_vegetables",
  Seeds: "exp_cat_seeds",
  Fertilizer: "exp_cat_fertilizer",
  Labor: "exp_cat_labor",
  Equipment: "exp_cat_equipment",
  Irrigation: "exp_cat_irrigation",
  Other: "exp_cat_other",
};

// ── Context / hook ───────────────────────────────────────────────────────────

type LangContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof translations) => string;
  tn: (name: string) => string;
};

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => translations[key]?.en ?? String(key),
  tn: (name) => name,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("anisense-lang");
    return saved === "tl" ? "tl" : "en";
  });
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("anisense-lang", l);
  };
  const t = (key: keyof typeof translations) =>
    translations[key]?.[lang] ?? translations[key]?.en ?? String(key);
  const tn = (name: string) => {
    const key = NAME_KEYS[name];
    return key ? translations[key][lang] : name;
  };
  return (
    <LangContext.Provider value={{ lang, setLang, t, tn }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

// ── Ready-made toggle (drop into the Profile > Language row) ─────────────────

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  const btn = (l: Lang, label: string): React.CSSProperties => ({
    flex: 1,
    padding: "11px 8px",
    borderRadius: 10,
    border: lang === l ? "2px solid #0d7a4d" : "1.5px solid #e2e8e4",
    background: lang === l ? "#e3f3ea" : "#ffffff",
    color: lang === l ? "#0d7a4d" : "#6b7a71",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  });
  return (
    <div style={{ display: "flex", gap: 9 }}>
      <button style={btn("en", "English")} onClick={() => setLang("en")}>
        English
      </button>
      <button style={btn("tl", "Filipino")} onClick={() => setLang("tl")}>
        Filipino
      </button>
    </div>
  );
}
