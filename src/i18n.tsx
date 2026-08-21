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

  // ── Bottom nav ────────────────────────────────────────────────────────────
  nav_home: { en: "Home", tl: "Home" },
  nav_market: { en: "Market", tl: "Merkado" },
  nav_trade: { en: "Trade", tl: "Bentahan" },
  nav_expenses: { en: "Expenses", tl: "Gastos" },
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

  // ── Market ────────────────────────────────────────────────────────────────
  market_title: { en: "Market", tl: "Merkado" },
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
  market_offline_cached: {
    en: "Offline: showing cached prices",
    tl: "Offline: lumang presyo ang ipinapakita",
  },

  // ── Trade / Marketplace ───────────────────────────────────────────────────
  trade_title: { en: "Trade", tl: "Bentahan" },
  trade_marketplace: { en: "Marketplace", tl: "Bentahan" },
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
  trade_sort_price_asc: { en: "Price: Low to High", tl: "Presyo: Mababa pataas" },
  trade_sort_price_desc: { en: "Price: High to Low", tl: "Presyo: Mataas pababa" },
  trade_sort_rating: { en: "Best-rated sellers", tl: "Pinakamataas ang rating" },
  trade_kg_available: { en: "kg available", tl: "kilong available" },
  trade_call_seller: { en: "Call seller", tl: "Tawagan ang nagbebenta" },
  trade_view_details: { en: "View details", tl: "Tingnan ang detalye" },
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
  cart_empty_title: { en: "Your cart is empty", tl: "Walang laman ang cart mo" },
  cart_empty_sub: {
    en: "Add crops from the marketplace to get started",
    tl: "Magdagdag ng pananim mula sa bentahan para makapagsimula",
  },
  cart_order_placed: { en: "Order Placed!", tl: "Naipadala ang Order!" },
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
  seller_crops_sold: { en: "Crops Sold", tl: "Mga Pananim na Binebenta" },
  seller_experience: { en: "Experience", tl: "Karanasan" },
  seller_sales: { en: "Sales", tl: "Benta" },
  seller_call: { en: "Call", tl: "Tawagan si" },

  // ── Expenses ──────────────────────────────────────────────────────────────
  exp_title: { en: "Expenses", tl: "Mga Gastos" },
  exp_sub: { en: "Farm cost tracker", tl: "Tala ng gastos sa bukid" },
  exp_total_month: {
    en: "Farm expenses this month",
    tl: "Kabuuang Gastos sa Bukid Ngayong Buwan",
  },
  exp_vs_last_month: { en: "vs last month", tl: "kumpara noong nakaraang buwan" },
  exp_overview: { en: "Overview", tl: "Buod" },
  exp_by_crop: { en: "By Crop", tl: "Ayon sa Pananim" },
  exp_by_month: { en: "By Month", tl: "Ayon sa Buwan" },
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
  ana_suggestion: { en: "Buy / Sell / Hold - Suggestion", tl: "Bili / Benta / Hintay - Mungkahi" },
  ana_suggestion_sub: {
    en: "3-day ARIMA forecast combined with current trend",
    tl: "3-araw na ARIMA na taya kasama ang kasalukuyang trend",
  },
  ana_disclaimer: {
    en: "Predictions are not guaranteed. Always verify with local market conditions.",
    tl: "Hindi garantisado ang mga taya. Laging suriin ang aktwal na presyo sa merkado.",
  },
  ana_performance: { en: "Price Performance: All Crops", tl: "Galaw ng Presyo: Lahat ng Pananim" },
  ana_predicted: { en: "3-Day Predicted Price", tl: "3-Araw na Tayang Presyo" },
  ana_based_on: {
    en: "Based on your crop specialization",
    tl: "Batay sa mga tinatanim mo",
  },
  ana_current: { en: "Current", tl: "Kasalukuyan" },
  ana_sell: { en: "SELL", tl: "IBENTA" },
  ana_buy: { en: "BUY", tl: "BUMILI" },
  ana_hold: { en: "HOLD", tl: "HINTAYIN" },

  // ── Weather ───────────────────────────────────────────────────────────────
  wx_title: { en: "Weather", tl: "Panahon" },
  wx_sub: { en: "Farm conditions", tl: "Lagay ng panahon sa bukid" },
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
  err_password_mismatch: { en: "Passwords do not match.", tl: "Hindi magkatugma ang mga password." },
  err_select_crop: { en: "Please select at least one crop.", tl: "Pumili ng kahit isang pananim." },

  // ── Extra: farm details step (farmer signup) ─────────────────────────────
  farm_details_title: { en: "About your farm", tl: "Tungkol sa bukid mo" },
  farm_details_sub: {
    en: "Tell us a bit about your farming background.",
    tl: "Ikwento mo nang kaunti ang pagsasaka mo.",
  },
  farm_years_lbl: { en: "Years of Farming", tl: "Taon sa Pagsasaka" },
  farm_years_ph: { en: "e.g. 12", tl: "hal. 12" },
  farm_loc_lbl: { en: "Farm Location", tl: "Lokasyon ng Bukid" },
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
  ana_hold_reason: {
    en: "ARIMA projects a rise of ₱{x}/kg in 3 days. Consider holding stock.",
    tl: "Tinataya ng ARIMA na tataas ng ₱{x}/kg sa 3 araw. Isaalang-alang na itago muna ang stock.",
  },
  ana_sell_reason: {
    en: "Price expected to drop ₱{x}/kg. Sell before further decline.",
    tl: "Inaasahang bababa ng ₱{x}/kg ang presyo. Magbenta na bago pa bumaba.",
  },
  ana_watch_reason: {
    en: "Mixed signals. Monitor closely before deciding.",
    tl: "Halo-halong senyales. Bantayan muna bago magdesisyon.",
  },
  ana_lstm_note: {
    en: "Predictions generated by an LSTM neural network trained on 3 years of Nueva Ecija market data. Confidence intervals shown at 95%. Not financial advice. Always verify with local market conditions.",
    tl: "Ang mga taya ay galing sa LSTM neural network na sinanay sa 3 taong datos ng merkado ng Nueva Ecija. 95% ang confidence interval. Hindi ito payong pinansyal. Laging suriin ang aktwal na presyo sa merkado.",
  },
  ana_forecast_note: {
    en: "Forecast is indicative only. Verify with local market conditions.",
    tl: "Pahiwatig lamang ang taya. Suriin ang aktwal na presyo sa merkado.",
  },

  // ── Language gate (first run) ─────────────────────────────────────────────
  lang_title: { en: "Choose your language", tl: "Piliin ang wika" },
  lang_sub: { en: "Piliin ang wika", tl: "Choose your language" },
  lang_tl: { en: "Tagalog", tl: "Tagalog" },
  lang_tl_desc: {
    en: "Ito ang gagamitin sa buong app",
    tl: "Ito ang gagamitin sa buong app",
  },
  lang_en: { en: "English", tl: "English" },
  lang_en_desc: {
    en: "Use English across the app",
    tl: "Use English across the app",
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
