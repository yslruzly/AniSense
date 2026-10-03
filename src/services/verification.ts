// ─── Sign-up verification codes ───────────────────────────────────────────────
// Before an account is made, the CP number or Gmail address it will sign in
// with is checked: a 6-digit code is sent there, and typed back.
//
// MOCKUP: nothing is sent yet. There is no SMS provider (Semaphore, chosen
// for the launch) and no mail sender behind sign-up, so the code is made
// here, on the phone, and handed back for the screen to show, marked as a
// demo. To make it real, these two functions are the only thing to change:
// sendSignupCode() asks a server function to text or email a code and keeps
// it there (never on the phone); checkSignupCode() asks the same function
// whether the typed code matches. The form does not change.

import type { ContactMode } from "./auth";

/** How long a code is good for, and how many wrong tries it takes. */
const CODE_LIFE_MS = 10 * 60_000;
const MAX_TRIES = 5;

type Pending = { code: string; expires: number; tries: number };
const pending = new Map<string, Pending>();

/** The number or address a code belongs to, however it was typed. */
export const codeKey = (mode: ContactMode, contact: string) =>
  `${mode}:${mode === "phone" ? contact.replace(/\D/g, "").replace(/^0/, "") : contact.trim().toLowerCase()}`;

const sixDigits = () => {
  const n = new Uint32Array(1);
  crypto.getRandomValues(n);
  return String(100000 + (n[0] % 900000));
};

/** Sends a new code (a new one replaces any earlier). In the mockup, the
 *  code comes back so the screen can show it; a real sender returns none. */
export async function sendSignupCode(mode: ContactMode, contact: string): Promise<{ demoCode?: string }> {
  const code = sixDigits();
  pending.set(codeKey(mode, contact), { code, expires: Date.now() + CODE_LIFE_MS, tries: 0 });
  // About as long as a real send takes, so the button's "Sending…" is seen.
  await new Promise(r => setTimeout(r, 600));
  return { demoCode: code };
}

export type CodeCheck = "ok" | "wrong" | "expired" | "too-many";

/** Whether a typed code is the one sent to this number or address. */
export async function checkSignupCode(mode: ContactMode, contact: string, code: string): Promise<CodeCheck> {
  const key = codeKey(mode, contact);
  const p = pending.get(key);
  if (!p || Date.now() > p.expires) { pending.delete(key); return "expired"; }
  if (p.tries >= MAX_TRIES) return "too-many";
  if (code !== p.code) { p.tries++; return p.tries >= MAX_TRIES ? "too-many" : "wrong"; }
  pending.delete(key);
  return "ok";
}
