// ─── Auth Service ─────────────────────────────────────────────────────────────
// Everything about signing up, verifying (email code + SMS code), signing in,
// and the user's profile row. NOT wired into the UI yet — see SETUP_DATABASE.md
// Step 7 for exactly where each function goes.

import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { UserRole, FarmerProfile } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "09171234567" or "9171234567" → "+639171234567" (E.164, required by SMS providers). */
export function toE164Phone(phRaw: string): string {
  const digits = phRaw.replace(/\D/g, "");
  if (digits.startsWith("63")) return `+${digits}`;
  if (digits.startsWith("0")) return `+63${digits.slice(1)}`;
  return `+63${digits}`;
}

// ─── Sign up (email + password) ───────────────────────────────────────────────
// Sends the user a 6-digit code by email (after you set up the email template —
// SETUP_DATABASE.md Step 4). The profiles row is auto-created by the DB trigger.
export async function signUpWithEmail(opts: {
  name: string;
  role: UserRole;
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: opts.email,
    password: opts.password,
    options: {
      data: { full_name: opts.name, role: opts.role }, // read by handle_new_user() trigger
    },
  });
  if (error) throw error;
  return data; // user exists but is unverified until verifyEmailCode() succeeds
}

/** User types the 6-digit code from their Gmail inbox → verified + logged in. */
export async function verifyEmailCode(email: string, code: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "signup",
  });
  if (error) throw error; // wrong/expired code → error.message to show in .auth-error
  return data.session;
}

/** "Didn't get the code?" button. Supabase rate-limits this automatically. */
export async function resendEmailCode(email: string) {
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) throw error;
}

// ─── Sign in ──────────────────────────────────────────────────────────────────
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

// ─── Phone (SMS) verification ─────────────────────────────────────────────────
// Requires an SMS provider connected in Supabase (SETUP_DATABASE.md Step 5).
// Flow: sendPhoneCode() texts a 6-digit code → user types it → verifyPhoneCode().

export async function sendPhoneCode(phRaw: string) {
  const { error } = await supabase.auth.signInWithOtp({ phone: toE164Phone(phRaw) });
  if (error) throw error;
}

export async function verifyPhoneCode(phRaw: string, code: string) {
  const phone = toE164Phone(phRaw);
  const { data, error } = await supabase.auth.verifyOtp({ phone, token: code, type: "sms" });
  if (error) throw error;
  // Mark it on the profile so the UI can show a "verified" badge.
  if (data.user) {
    await supabase.from("profiles")
      .update({ phone, phone_verified: true })
      .eq("id", data.user.id);
  }
  return data.session;
}

// ─── Session management ───────────────────────────────────────────────────────
// In App.tsx these replace the isAuthed/userName/userRole useState mocks:
// call getSession() on startup, and onAuthChange() to react to sign-in/out.

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(cb: (session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe(); // call in useEffect cleanup
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─── Profile (the profiles table row) ─────────────────────────────────────────

export interface ProfileRow {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  phone_verified: boolean;
  location: string | null;
  years_farming: number | null;
  crops: string[];
  bio: string | null;
  rating: number;
  total_sales: number;
}

export async function getMyProfile(): Promise<ProfileRow | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data, error } = await supabase
    .from("profiles").select("*").eq("id", userData.user.id).single();
  if (error) throw error;
  return data as ProfileRow;
}

/** Saves the farm-details + crop-picker steps of signup, and ProfileScreen edits. */
export async function updateMyProfile(changes: Partial<{
  full_name: string;
  phone: string;
  location: string;
  years_farming: number;
  crops: string[];
  bio: string;
}>) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not signed in");
  const { error } = await supabase
    .from("profiles").update(changes).eq("id", userData.user.id);
  if (error) throw error;
}

/** Adapts a DB profile row to the FarmerProfile shape ProfileScreen already uses. */
export function toFarmerProfile(row: ProfileRow, email: string): FarmerProfile {
  return {
    name: row.full_name,
    phone: row.phone ?? "",
    email,
    location: row.location ?? "",
    experience: row.years_farming != null ? `${row.years_farming} years` : "",
    crops: row.crops,
  };
}
