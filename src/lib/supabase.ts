// ─── Supabase Client ──────────────────────────────────────────────────────────
// Single shared client for the whole app. Import it anywhere with:
//   import { supabase } from "../lib/supabase";
//
// SETUP REQUIRED before this works (see SETUP_DATABASE.md):
//   1. Create a Supabase project and run supabase/schema.sql
//   2. Copy .env.example → .env and paste your project URL + anon key
//
// The anon key is SAFE to ship inside the Android app; Row Level Security
// (defined in schema.sql) is what actually protects the data.

import { createClient } from "@supabase/supabase-js";
import { Preferences } from "@capacitor/preferences";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't crash the app in dev; screens still using mock data work fine.
  // Any real service call will fail loudly with a clear message instead.
  console.warn(
    "[AniSense] Supabase is not configured yet. " +
    "Copy .env.example to .env and add your project keys. See SETUP_DATABASE.md."
  );
}

// Android/Capacitor: localStorage inside the WebView can be wiped by the OS
// under storage pressure, which would randomly log users out. @capacitor/preferences
// writes to real native storage (SharedPreferences on Android), so sessions
// survive app restarts and OS cleanups. On the web it falls back to localStorage
// automatically inside the plugin.
const capacitorStorage = {
  getItem: async (key: string) => (await Preferences.get({ key })).value,
  setItem: async (key: string, value: string) => {
    await Preferences.set({ key, value });
  },
  removeItem: async (key: string) => {
    await Preferences.remove({ key });
  },
};

export const supabase = createClient(
  supabaseUrl ?? "https://not-configured.supabase.co",
  supabaseAnonKey ?? "not-configured",
  {
    auth: {
      storage: capacitorStorage,
      autoRefreshToken: true,   // keeps the user logged in indefinitely
      persistSession: true,
      detectSessionInUrl: false, // we use OTP codes, not magic links, so no URL handling needed
    },
  }
);

/** True once .env is filled in; use to gate features while developing. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
