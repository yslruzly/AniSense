// ─── Verification codes ───────────────────────────────────────────────────────
// A 6-digit code sent to the CP number or Gmail an account signs in with, and
// typed back, for two things: checking it is theirs before an account is made
// ("signup"), and letting them make a new password when they forgot theirs
// ("reset").
//
// MOCKUP: nothing is sent yet. There is no SMS provider (Semaphore, chosen
// for the launch) and no mail sender behind these, so the code is made here,
// on the phone, and handed back for the screen to show, marked as a demo. To
// make it real, only this file changes; the screens do not:
//   · sendCode() asks a server function to text or email a code and keeps it
//     there (never on the phone), and returns no demo code.
//   · checkCode() asks the same function whether the typed code matches.
//   · saveNewPassword() sends the new password with proof the reset code
//     passed. For a Gmail account Supabase does this itself
//     (resetPasswordForEmail with a {{ .Token }} email, verifyOtp of type
//     "recovery", then updateUser); a CP-number account needs the server
//     function, which texts through Semaphore and sets the password there.

import type { ContactMode } from "./auth";

export type CodePurpose = "signup" | "reset";

/** How long a code is good for, and how many wrong tries it takes. */
const CODE_LIFE_MS = 10 * 60_000;
const MAX_TRIES = 5;

type Pending = { code: string; expires: number; tries: number };
const pending = new Map<string, Pending>();
// Numbers and addresses whose reset code passed, until when.
const resetPassed = new Map<string, number>();

/** The number or address a code belongs to, however it was typed, and what
 *  the code is for. */
export const codeKey = (purpose: CodePurpose, mode: ContactMode, contact: string) =>
  `${purpose}:${mode}:${mode === "phone" ? contact.replace(/\D/g, "").replace(/^0/, "") : contact.trim().toLowerCase()}`;

const sixDigits = () => {
  const n = new Uint32Array(1);
  crypto.getRandomValues(n);
  return String(100000 + (n[0] % 900000));
};

/** Sends a new code (a new one replaces any earlier). In the mockup, the
 *  code comes back so the screen can show it; a real sender returns none. */
export async function sendCode(purpose: CodePurpose, mode: ContactMode, contact: string): Promise<{ demoCode?: string }> {
  const code = sixDigits();
  pending.set(codeKey(purpose, mode, contact), { code, expires: Date.now() + CODE_LIFE_MS, tries: 0 });
  // About as long as a real send takes, so the button's "Sending…" is seen.
  await new Promise(r => setTimeout(r, 600));
  return { demoCode: code };
}

export type CodeCheck = "ok" | "wrong" | "expired" | "too-many";

/** Whether a typed code is the one sent to this number or address. */
export async function checkCode(purpose: CodePurpose, mode: ContactMode, contact: string, code: string): Promise<CodeCheck> {
  const key = codeKey(purpose, mode, contact);
  const p = pending.get(key);
  if (!p || Date.now() > p.expires) { pending.delete(key); return "expired"; }
  if (p.tries >= MAX_TRIES) return "too-many";
  if (code !== p.code) { p.tries++; return p.tries >= MAX_TRIES ? "too-many" : "wrong"; }
  pending.delete(key);
  if (purpose === "reset") resetPassed.set(key, Date.now() + CODE_LIFE_MS);
  return "ok";
}

/** The new password, once the reset code has passed. "expired" when it
 *  passed too long ago (or never did): a new code is needed. */
export async function saveNewPassword(mode: ContactMode, contact: string, _password: string): Promise<"ok" | "expired"> {
  const key = codeKey("reset", mode, contact);
  const until = resetPassed.get(key);
  resetPassed.delete(key);
  await new Promise(r => setTimeout(r, 600));
  return until && Date.now() <= until ? "ok" : "expired";
}
