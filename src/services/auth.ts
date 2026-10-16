// ─── Auth Service ─────────────────────────────────────────────────────────────
// Everything about signing up, verifying (email code + SMS code), signing in,
// and the user's profile row. Used by AuthFormScreen and App.tsx whenever
// .env holds a Supabase project; without one the app keeps its demo sign-in.

import { Session, isAuthRetryableFetchError } from "@supabase/supabase-js";
import { Preferences } from "@capacitor/preferences";
import { supabase, SESSION_KEY } from "../lib/supabase";
import { kvGet, kvSet } from "../lib/localdb";
import { PHOTO_BUCKET, storedPhoto, photoPath } from "./photos";
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
// When SMS is added (docs/database-setup.md Step 5), these accounts can be moved to
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
// docs/database-setup.md Step 4). The profiles row is auto-created by the DB trigger.
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
// Requires an SMS provider connected in Supabase (docs/database-setup.md Step 5).
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

// ─── Opening without signal ───────────────────────────────────────────────────
// A session lasts an hour, then the library renews it over the network. With
// no signal it can't: getSession() keeps retrying for up to half a minute,
// then answers "no session", though the session is still saved on the phone.
// That would put a farmer in a field back on the welcome screen, unable to
// sign in, with everything the phone kept for them out of reach.
//
// So with no signal the app opens on the saved session straight away, and
// works from what the phone kept (lib/cache.ts) and queues what is changed
// (lib/outbox.ts). Once the signal is back the library renews the session by
// itself; if the server has ended it (signed out on another phone, password
// changed), the library signs out, and App goes back to the welcome screen.

/** The session saved on this phone, read straight from where the library keeps it. */
async function savedSession(): Promise<Session | null> {
  try {
    const raw = (await Preferences.get({ key: SESSION_KEY })).value;
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    return s?.refresh_token && s.user?.id ? s : null;
  } catch {
    return null;
  }
}

/** The session to open the app with, and whether it is the saved one, unrenewed. */
export async function restoreSession(): Promise<{ session: Session | null; offline: boolean }> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    const saved = await savedSession();
    if (saved) return { session: saved, offline: true };
  }
  const { data, error } = await supabase.auth.getSession();
  if (data.session) return { session: data.session, offline: false };
  // The phone said it had signal, but the renewal couldn't get through.
  if (error && isAuthRetryableFetchError(error)) {
    const saved = await savedSession();
    if (saved) return { session: saved, offline: true };
  }
  return { session: null, offline: false };
}

export function onAuthChange(cb: (session: Session | null, event: string) => void) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => cb(session, event));
  return () => data.subscription.unsubscribe(); // call in useEffect cleanup
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Deletes the signed-in account for good: the sign-in, the profile, and
 * everything that is this person's alone (see delete_my_account() in
 * schema.sql for exactly what goes and what other people keep).
 *
 * Listing photos are files in Storage, which the database function can't
 * reach, so they are removed first. If that step fails the account is still
 * deleted: a person asking to leave is not kept because a photo wouldn't go.
 */
export async function deleteMyAccount(): Promise<void> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("NOT_SIGNED_IN");
  const uid = u.user.id;
  try {
    const bucket = supabase.storage.from(PHOTO_BUCKET);
    const { data: files } = await bucket.list(uid, { limit: 1000 });
    if (files?.length) await bucket.remove(files.map(f => `${uid}/${f.name}`));
  } catch { /* the account goes regardless */ }
  const { error } = await supabase.rpc("delete_my_account");
  if (error) throw error;
  // The session on this phone now belongs to nobody.
  await supabase.auth.signOut({ scope: "local" }).catch(() => {});
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
  /** "2026-00001": given by the database when the account is made (schema.sql, Member numbers). */
  member_no?: string | null;
  /** Their own photo, for the Profile and the ID card (setMyPhoto). */
  avatar_url?: string | null;
  created_at?: string;
}

export async function getMyProfile(): Promise<ProfileRow | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  // The crops a farmer grows live in their own table (profile_crops), one
  // row per crop; they come back as a plain list of names.
  const { data, error } = await supabase
    .from("profiles").select("*, profile_crops(crop_groups(name))").eq("id", userData.user.id).single();
  if (error) throw error;
  const { profile_crops, ...row } = data as ProfileRow & { profile_crops?: { crop_groups: { name: string } | null }[] };
  return { ...row, crops: (profile_crops ?? []).map(pc => pc.crop_groups?.name).filter((n): n is string => !!n) };
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
  const { crops, ...details } = changes;
  if (Object.keys(details).length) {
    const { error } = await supabase.from("profiles").update(details).eq("id", userData.user.id);
    if (error) throw error;
  }
  // The crop list is replaced in one step by the database (set_my_crops).
  if (crops) {
    const { error } = await supabase.rpc("set_my_crops", { crop_names: crops });
    if (error) throw error;
  }
}

/**
 * The member's own photo, for their Profile and their ID card: put in their
 * own folder in Storage (so deleting the account clears it with everything
 * else of theirs), its address kept on their profile so it is there on the
 * next start and on another phone, and the one it replaces removed. Gives
 * back the address.
 */
export async function setMyPhoto(dataUrl: string): Promise<string> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("NOT_SIGNED_IN");
  const uid = userData.user.id;
  const { data: before } = await supabase.from("profiles").select("avatar_url").eq("id", uid).maybeSingle();
  const url = (await storedPhoto(uid, dataUrl, "avatar-"))!;
  const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", uid);
  if (error) {
    // Not recorded, so not kept: the file it would have pointed at goes too.
    const orphan = photoPath(uid, url);
    if (orphan) void supabase.storage.from(PHOTO_BUCKET).remove([orphan]).then(() => {}, () => {});
    throw error;
  }
  // The photo it replaces. If that fails, a stray file is all that is left.
  const old = photoPath(uid, (before as { avatar_url?: string | null } | null)?.avatar_url);
  if (old) void supabase.storage.from(PHOTO_BUCKET).remove([old]).then(() => {}, () => {});
  return url;
}

/** What this account signs in with, for a "forgot your password" code from
 *  Profile: its Gmail, or the CP number behind a CP-number account's
 *  stand-in address. Read from the session on the phone, so it works without
 *  signal. Null when nobody is signed in. */
export async function mySignInContact(): Promise<{ mode: ContactMode; contact: string } | null> {
  const { data } = await supabase.auth.getSession();
  const email = data.session?.user.email;
  if (!email) return null;
  return isPhoneLoginEmail(email) ? { mode: "phone", contact: email.split("@")[0] } : { mode: "gmail", contact: email };
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

// ─── Member number ────────────────────────────────────────────────────────────
// The number on the ID card ("2026-00001") is the database's: profiles.member_no,
// given in the order people join (supabase/schema.sql, "Member numbers"). This
// phone keeps the last one it saw for the account, so the card opens with it
// straight away, offline included, until the profile row arrives. The key
// carries the account's id, so deleting the account wipes it with the rest
// (wipeAccountData).

const memberKey = (accountId: string) => `member_no:${accountId}`;

export async function rememberedMemberNo(accountId: string): Promise<string | null> {
  try { return await kvGet(memberKey(accountId)); } catch { return null; }
}

export async function rememberMemberNo(accountId: string, memberNo: string): Promise<void> {
  try { await kvSet(memberKey(accountId), memberNo); } catch { /* storage unavailable: it is fetched again next time */ }
}
