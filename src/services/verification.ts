// ─── Verification codes ───────────────────────────────────────────────────────
// A 6-digit code sent to the CP number or Gmail an account signs in with, and
// typed back, for two things: checking it is theirs before an account is made
// ("signup"), and letting them make a new password when they forgot theirs
// ("reset").
//
// Two ways it runs, and the screens never know which:
//
//   · ON THE DATABASE: real. The verify-code Edge Function
//     (supabase/functions/verify-code) makes the code, keeps it on the server,
//     emails it to a Gmail through Brevo or texts it to a CP number through
//     Semaphore, and checks it. A passed code earns a one-time token, kept
//     here in memory, with which the function then makes the account
//     (createAccountWithCode) or sets the new password. The phone never sees
//     a code before the person types it, and cannot make an account without
//     one: public sign-up is off on the database.
//
//   · A BUILD WITHOUT A DATABASE (no .env): a mockup made here, on the
//     phone, and shown on screen in a "Demo" note.
//
//   · While a sender is not set up yet (the function not deployed, Step 7
//     of docs/database-setup.md; or no Semaphore key, Step 8, for a CP
//     number), sign-up and reset with it are refused, never faked: a code
//     shown on screen would let anyone claim any number. npm run check:db
//     says which sender is missing.

import type { ContactMode } from "./auth";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export type CodePurpose = "signup" | "reset";

/** Why a code could not be sent, an account made or a password saved, for
 *  the screen to say. ACCOUNT_EXISTS · NO_ACCOUNT · WAIT · TOO_MANY_SENDS ·
 *  SMS_NOT_READY · RESET_NOT_READY · SIGNUP_NOT_READY · CODE_EXPIRED (the
 *  passed code's time ran out: send a new one) · OFFLINE · WEAK_PASSWORD ·
 *  SEND_FAILED · USED_BEFORE (a password the account has had before) · and
 *  for Change password: WRONG_PASSWORD · SAME_AS_CURRENT · TOO_MANY_TRIES
 *  (wait = minutes) · NOT_SIGNED_IN · NOT_DEPLOYED */
export class CodeError extends Error {
  constructor(public code: string, public wait?: number) { super(code); this.name = "CodeError"; }
}

/** How long a code is good for, and how many wrong tries it takes. */
const CODE_LIFE_MS = 10 * 60_000;
const MAX_TRIES = 5;

/** The number or address a code belongs to, however it was typed, and what
 *  the code is for. */
export const codeKey = (purpose: CodePurpose, mode: ContactMode, contact: string) =>
  `${purpose}:${mode}:${mode === "phone" ? contact.replace(/\D/g, "").replace(/^0/, "") : contact.trim().toLowerCase()}`;

/** On the database, the server does both; without one, the phone does. */
const onServer = () => isSupabaseConfigured;

const lang = () => { try { return localStorage.getItem("anisense-lang") === "tl" ? "tl" : "en"; } catch { return "en"; } };

async function callServer(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.functions.invoke("verify-code", { body: { ...body, lang: lang() } });
  if (error) {
    // No signal, or the function could not be reached at all.
    if (error.name === "FunctionsFetchError" || (typeof navigator !== "undefined" && navigator.onLine === false)) throw new CodeError("OFFLINE");
    // The project answered, but has no such function: not deployed yet.
    if ((error as { context?: { status?: number } }).context?.status === 404) throw new CodeError("NOT_DEPLOYED");
    throw new CodeError("SEND_FAILED");
  }
  return (data ?? {}) as Record<string, unknown>;
}

// After a code passes, the server hands back a one-time right to make the
// account (sign-up) or set the new password (reset). Kept in memory only,
// for the pages that follow.
const tokens = new Map<string, string>();

// ── The demo, on the phone ──
type Pending = { code: string; expires: number; tries: number };
const pending = new Map<string, Pending>();
// Numbers and addresses whose reset code passed, until when.
const resetPassed = new Map<string, number>();

const sixDigits = () => {
  const n = new Uint32Array(1);
  crypto.getRandomValues(n);
  return String(100000 + (n[0] % 900000));
};

/** Sends a new code (a new one replaces any earlier). On the server it is
 *  emailed or texted and nothing comes back; in the demo the code comes back
 *  so the screen can show it. Throws a CodeError when it cannot be sent. */
export async function sendCode(purpose: CodePurpose, mode: ContactMode, contact: string): Promise<{ demoCode?: string }> {
  const key = codeKey(purpose, mode, contact);
  if (onServer()) {
    try {
      const r = await callServer({ action: "send", purpose, mode, contact });
      if (!r.ok) throw new CodeError(String(r.error ?? "SEND_FAILED"), typeof r.wait === "number" ? r.wait : undefined);
      tokens.delete(key);
      return {};
    } catch (err) {
      // No sender for this yet: the function is missing. Refused, never
      // faked with a code on screen (SMS_NOT_READY, for a CP number with no
      // Semaphore key, comes through as it is).
      if (err instanceof CodeError && err.code === "NOT_DEPLOYED") throw new CodeError(purpose === "reset" ? "RESET_NOT_READY" : "SIGNUP_NOT_READY");
      throw err;
    }
  }
  const code = sixDigits();
  pending.set(key, { code, expires: Date.now() + CODE_LIFE_MS, tries: 0 });
  // About as long as a real send takes, so the button's "Sending…" is seen.
  await new Promise(r => setTimeout(r, 600));
  return { demoCode: code };
}

export type CodeCheck = "ok" | "wrong" | "expired" | "too-many";

/** Whether a typed code is the one sent to this number or address. */
export async function checkCode(purpose: CodePurpose, mode: ContactMode, contact: string, code: string): Promise<CodeCheck> {
  const key = codeKey(purpose, mode, contact);
  if (onServer()) {
    const r = await callServer({ action: "check", purpose, mode, contact, code });
    const result = (["ok", "wrong", "expired", "too-many"].includes(String(r.result)) ? r.result : "expired") as CodeCheck;
    if (result === "ok" && typeof r.token === "string") tokens.set(key, r.token);
    return result;
  }
  const p = pending.get(key);
  if (!p || Date.now() > p.expires) { pending.delete(key); return "expired"; }
  if (p.tries >= MAX_TRIES) return "too-many";
  if (code !== p.code) { p.tries++; return p.tries >= MAX_TRIES ? "too-many" : "wrong"; }
  pending.delete(key);
  if (purpose === "reset") resetPassed.set(key, Date.now() + CODE_LIFE_MS);
  return "ok";
}

/** The new password, once the reset code has passed. "expired" when it
 *  passed too long ago (or never did): a new code is needed. Throws a
 *  CodeError for no signal or a password the server will not take. */
export async function saveNewPassword(mode: ContactMode, contact: string, password: string): Promise<"ok" | "expired"> {
  const key = codeKey("reset", mode, contact);
  if (onServer()) {
    const token = tokens.get(key);
    if (!token) return "expired";
    const r = await callServer({ action: "reset-password", mode, contact, token, password });
    if (r.ok) { tokens.delete(key); return "ok"; }
    if (r.error === "EXPIRED" || r.error === "NO_ACCOUNT") { tokens.delete(key); return "expired"; }
    throw new CodeError(String(r.error ?? "SEND_FAILED"));
  }
  const until = resetPassed.get(key);
  await new Promise(r => setTimeout(r, 600));
  if (!until || Date.now() > until) { resetPassed.delete(key); return "expired"; }
  // One had before is turned away, and the code stays good for another try.
  if (await demoUsedBefore(password)) throw new CodeError("USED_BEFORE");
  resetPassed.delete(key);
  await demoRemember(password);
  return "ok";
}

/** What the sign-up form asked, for the new account's profile. */
export interface NewProfile {
  full_name: string;
  /** Always set by the form; the server turns away an account without one. */
  role: "farmer" | "buyer" | null;
  location: string;
  /** "+639171234567", or null. */
  phone: string | null;
  years_farming: number | null;
  crops: string[];
}

/**
 * Makes the account on the server, once the sign-up code for this number or
 * address has passed on this phone: the verify-code function checks the
 * one-time token that code earned, then makes the account. Throws a
 * CodeError: CODE_EXPIRED (no token, or its time ran out: a new code is
 * needed), ACCOUNT_EXISTS, WEAK_PASSWORD, OFFLINE, SIGNUP_NOT_READY, or
 * SEND_FAILED for anything else.
 */
export async function createAccountWithCode(mode: ContactMode, contact: string, password: string, profile: NewProfile): Promise<void> {
  const key = codeKey("signup", mode, contact);
  const token = tokens.get(key);
  if (!token) throw new CodeError("CODE_EXPIRED");
  let r: Record<string, unknown>;
  try { r = await callServer({ action: "create-account", mode, contact, token, password, profile }); }
  catch (err) { throw err instanceof CodeError && err.code === "NOT_DEPLOYED" ? new CodeError("SIGNUP_NOT_READY") : err; }
  if (r.ok) { tokens.delete(key); return; }
  if (r.error === "EXPIRED") { tokens.delete(key); throw new CodeError("CODE_EXPIRED"); }
  throw new CodeError(String(r.error ?? "SEND_FAILED"));
}

/**
 * Profile's Change password: the current password and a new one. On the
 * database, the server checks the current one (counting wrong tries), turns
 * away one the account has had before, and sets it. Throws a CodeError for
 * anything that stops it (see CodeError for the codes).
 */
export async function changePassword(current: string, next: string): Promise<void> {
  if (onServer()) {
    const r = await callServer({ action: "change-password", current, password: next });
    if (r.ok) return;
    throw new CodeError(String(r.error ?? "SEND_FAILED"), typeof r.wait === "number" ? r.wait : undefined);
  }
  await new Promise(r => setTimeout(r, 600));
  const d = readDemoPasswords();
  // The demo knows its current password once it has set one; until then it
  // takes whatever was typed as the current one.
  if (d.current && (await hashDemo(current)) !== d.current) throw new CodeError("WRONG_PASSWORD");
  if (current === next) throw new CodeError("SAME_AS_CURRENT");
  if (await demoUsedBefore(next)) throw new CodeError("USED_BEFORE");
  if (!d.current) { d.current = await hashDemo(current); writeDemoPasswords(d); }
  await demoRemember(next);
}

// ── Passwords had before, in the demo ──
// On the database each account's old passwords are kept as hashes and a
// used one is turned away (schema.sql, section 10). A build without a
// database does the same on the phone for its demo account: hashes only,
// the last ten, in the phone's own storage.
const DEMO_PW_KEY = "anisense-demo-passwords";
type DemoPasswords = { current?: string; past: string[] };
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
const hashDemo = async (pw: string) => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`anisense-demo:${pw}`)));
function readDemoPasswords(): DemoPasswords {
  try {
    const d = JSON.parse(localStorage.getItem(DEMO_PW_KEY) ?? "null") as DemoPasswords | null;
    return d && Array.isArray(d.past) ? d : { past: [] };
  } catch { return { past: [] }; }
}
function writeDemoPasswords(d: DemoPasswords) {
  try { localStorage.setItem(DEMO_PW_KEY, JSON.stringify(d)); } catch { /* storage unavailable: the demo forgets */ }
}
async function demoUsedBefore(pw: string): Promise<boolean> {
  const d = readDemoPasswords(), h = await hashDemo(pw);
  return d.current === h || d.past.includes(h);
}
async function demoRemember(next: string) {
  const d = readDemoPasswords();
  if (d.current) d.past = [d.current, ...d.past].slice(0, 10);
  d.current = await hashDemo(next);
  writeDemoPasswords(d);
}
