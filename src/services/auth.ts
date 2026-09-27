// ─── Auth Service ─────────────────────────────────────────────────────────────
// Everything about signing up, verifying (email code + SMS code), signing in,
// and the user's profile row. Used by AuthFormScreen and App.tsx whenever
// .env holds a Supabase project; without one the app keeps its demo sign-in.

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

// ─── Accounts, the way the app's form asks for them ───────────────────────────
// The sign-up form offers two ways in: a Gmail address, or a CP number. Both
// end in a password.
//
// A CP-number account is an email account underneath, at an address nobody
// types: 639171234567@phone.anisense.app. Supabase's own phone sign-in needs
// an SMS provider, which costs per text, and the app does not text anyone
// yet. The number itself is kept on the profile, where buyers can call it.
// When SMS is added (SETUP_DATABASE.md Step 5), these accounts can be moved to
// real phone auth without anyone losing their login.
//
// Because nothing is ever sent to that address, email confirmation must be
// OFF in the Supabase dashboard for CP-number sign-ups to work.

export type ContactMode = "gmail" | "phone";

const PHONE_LOGIN_DOMAIN = "phone.anisense.app";

/** "0917 123 4567" → "639171234567@phone.anisense.app". Same address however the number was typed. */
export function phoneLoginEmail(phRaw: string): string {
  return `${toE164Phone(phRaw).slice(1)}@${PHONE_LOGIN_DOMAIN}`;
}

/** True for the stand-in address of a CP-number account: never show it to anyone. */
export const isPhoneLoginEmail = (email: string | undefined) => !!email?.endsWith(`@${PHONE_LOGIN_DOMAIN}`);

const loginEmail = (mode: ContactMode, contact: string) =>
  mode === "gmail" ? contact.trim().toLowerCase() : phoneLoginEmail(contact);

/** What the sign-up form has collected by its last step. */
export interface NewAccount {
  name: string;
  role: UserRole;
  mode: ContactMode;
  contact: string;
  password: string;
  location: string;
  /** The number buyers call, as typed ("9171234567"). */
  phone?: string;
  years?: number;
  crops: string[];
}

/**
 * Creates the account with everything the form asked, in one call: the
 * database trigger copies it into the profile row, so there is no moment
 * where an account exists without a name or a town.
 *
 * `session` is null when the project still has email confirmation on: the
 * caller then asks for the 6-digit code and finishes with verifyEmailCode().
 */
export async function createAccount(a: NewAccount): Promise<{ session: Session | null; email: string }> {
  const email = loginEmail(a.mode, a.contact);
  const phone = a.phone ? toE164Phone(a.phone) : a.mode === "phone" ? toE164Phone(a.contact) : null;
  const { data, error } = await supabase.auth.signUp({
    email,
    password: a.password,
    options: {
      data: {
        full_name: a.name.trim(),
        role: a.role,
        location: a.location,
        phone,
        years_farming: a.years ?? null,
        crops: a.crops,
      },
    },
  });
  if (error) throw error;
  // With confirmation off, signing up an address that already exists returns
  // a user with no identities instead of an error. Say so, rather than
  // pretending a second account was made.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new Error("User already registered");
  }
  return { session: data.session, email };
}

export async function signIn(mode: ContactMode, contact: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail(mode, contact), password });
  if (error) throw error;
  return data.session;
}

/**
 * Supabase's messages are for developers ("Invalid login credentials"). This
 * turns the ones a farmer can actually hit into a translation key.
 */
export function authErrorKey(err: unknown): string {
  const msg = (err as { message?: string })?.message?.toLowerCase() ?? "";
  const status = (err as { status?: number })?.status;
  if (msg.includes("invalid login")) return "err_login_wrong";
  if (msg.includes("already registered") || msg.includes("already been registered")) return "err_account_exists";
  if (msg.includes("email not confirmed")) return "err_email_unconfirmed";
  if (msg.includes("token has expired") || msg.includes("invalid") && msg.includes("otp")) return "err_code_wrong";
  if (status === 429 || msg.includes("rate limit") || msg.includes("for security purposes")) return "err_too_many";
  if (msg.includes("password should be")) return "err_password_short";
  if (msg.includes("failed to fetch") || msg.includes("network") || msg.includes("load failed")) return "err_auth_offline";
  return "err_auth_generic";
}

// ─── Sign up (email + password) ───────────────────────────────────────────────
// Sends the user a 6-digit code by email (after you set up the email template in
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
  // Keep the verified number on the profile. The "verified" flag itself is
  // not the phone's to set (schema.sql only lets users edit their own
  // details); set it from a server hook when SMS verification goes live.
  if (data.user) {
    await supabase.from("profiles").update({ phone }).eq("id", data.user.id);
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

export function onAuthChange(cb: (session: Session | null, event: string) => void) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => cb(session, event));
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

/** "+639171234567" → "+63 917 123 4567", the way the Profile screen shows it. */
function displayPhone(e164: string | null | undefined): string {
  if (!e164) return "";
  const d = e164.replace(/\D/g, "").replace(/^63/, "");
  return `+63 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`.trim();
}

/** Adapts a DB profile row to the FarmerProfile shape ProfileScreen already uses. */
export function toFarmerProfile(row: ProfileRow, email: string): FarmerProfile {
  return {
    name: row.full_name,
    phone: displayPhone(row.phone),
    // A CP-number account's login address is plumbing, not contact details.
    email: isPhoneLoginEmail(email) ? "" : email,
    location: row.location ?? "",
    experience: row.years_farming != null ? `${row.years_farming} years` : "",
    crops: row.crops ?? [],
  };
}

/**
 * The account as the session itself remembers it. Sign-up copies everything
 * into the session's metadata as well as the profile row, so the app can open
 * straight onto Home — offline included — and refresh from the row after.
 */
export function accountFromSession(session: Session): { role: UserRole; profile: FarmerProfile } {
  const m = (session.user.user_metadata ?? {}) as Record<string, unknown>;
  const role = (m.role === "buyer" ? "buyer" : "farmer") as UserRole;
  const row: ProfileRow = {
    id: session.user.id,
    role,
    full_name: typeof m.full_name === "string" ? m.full_name : "",
    phone: typeof m.phone === "string" ? m.phone : null,
    phone_verified: false,
    location: typeof m.location === "string" ? m.location : null,
    years_farming: typeof m.years_farming === "number" ? m.years_farming : null,
    crops: Array.isArray(m.crops) ? (m.crops as string[]) : [],
    bio: null, rating: 5, total_sales: 0,
  };
  return { role, profile: toFarmerProfile(row, session.user.email ?? "") };
}

/**
 * A member number that belongs to the account, not to the moment: the same
 * ID card on every phone and every sign-in. Year joined, then five digits
 * taken from the account's id.
 */
export function memberIdFor(session: Session): { id: string; since: Date } {
  const since = new Date(session.user.created_at ?? Date.now());
  const n = parseInt(session.user.id.replace(/-/g, "").slice(0, 8), 16) % 100000;
  return { id: `AS-${since.getFullYear()}-${String(n).padStart(5, "0")}`, since };
}
