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
//     Semaphore, checks it, and after a reset sets the new password. The
//     phone never sees a code before the person types it.
//
//   · A BUILD WITHOUT A DATABASE (no .env): a mockup made here, on the
//     phone, and shown on screen in a "Demo" note.
//
//   · And while a sender is not set up yet (the function not deployed, Step 7
//     of docs/database-setup.md; or no Semaphore key, Step 8, for a CP
//     number): sign-up falls back to the demo code, so nobody is shut out,
//     and a reset is refused rather than faked: saying "your password has
//     been changed" when it was not would lock the farmer out. npm run
//     check:db says which sender is missing.

import type { ContactMode } from "./auth";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export type CodePurpose = "signup" | "reset";

/** Why a code could not be sent or a password saved, for the screen to say.
 *  ACCOUNT_EXISTS · NO_ACCOUNT · WAIT · TOO_MANY_SENDS · SMS_NOT_READY ·
 *  RESET_NOT_READY · OFFLINE · WEAK_PASSWORD · SEND_FAILED */
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

// After a reset code passes, the server hands back a one-time right to set
// the new password. Kept in memory only, for the next page.
const resetTokens = new Map<string, string>();
// Sign-ups that fell back to the demo because their sender is missing (the
// function, or Semaphore for a CP number): their code is checked here.
const demoKeys = new Set<string>();

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
      demoKeys.delete(key);
      return {};
    } catch (err) {
      // No sender for this yet: the function is missing, or (for a CP
      // number) Semaphore has no key. Anything else is a real refusal.
      const missing = err instanceof CodeError && (err.code === "NOT_DEPLOYED" || (mode === "phone" && err.code === "SMS_NOT_READY"));
      if (!missing) throw err;
      if (purpose === "reset") throw new CodeError(mode === "phone" ? "SMS_NOT_READY" : "RESET_NOT_READY");
      demoKeys.add(key);   // sign-up: the demo below, for now
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
  if (onServer() && !demoKeys.has(key)) {
    const r = await callServer({ action: "check", purpose, mode, contact, code });
    const result = (["ok", "wrong", "expired", "too-many"].includes(String(r.result)) ? r.result : "expired") as CodeCheck;
    if (result === "ok" && typeof r.token === "string") resetTokens.set(key, r.token);
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
    const token = resetTokens.get(key);
    if (!token) return "expired";
    const r = await callServer({ action: "reset-password", mode, contact, token, password });
    if (r.ok) { resetTokens.delete(key); return "ok"; }
    if (r.error === "EXPIRED" || r.error === "NO_ACCOUNT") { resetTokens.delete(key); return "expired"; }
    throw new CodeError(String(r.error ?? "SEND_FAILED"));
  }
  const until = resetPassed.get(key);
  resetPassed.delete(key);
  await new Promise(r => setTimeout(r, 600));
  return until && Date.now() <= until ? "ok" : "expired";
}
