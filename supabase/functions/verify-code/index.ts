// ─── verify-code: AniSense's 6-digit codes, by email and by text ─────────────
// A Supabase Edge Function. It sends the code that proves a Gmail or a CP
// number is the person's own, when they create an account ("signup") or when
// they forgot their password ("reset"), checks it, and, after a reset code
// passes, sets the new password. It also changes the password of someone
// signed in, from Profile, once they have given their current one. Either
// way a new password may not be one the account has had before (the current
// one or any of its last ten: schema.sql, section 10). The app calls it from
// src/services/verification.ts.
//
// The code lives only here, on the server, as a keyed hash; the phone never
// sees it before the person types it in. Email goes out through Brevo, texts
// to CP numbers through Semaphore.
//
// It is also the only way an account is made. Public sign-up is OFF in
// Supabase (docs/database-setup.md, Step 3), so the app cannot make one
// itself: a passed sign-up code earns a one-time token, and "create-account"
// makes the account with it. Nobody can make an account in someone else's
// Gmail or number by going round the code.
//
// Against guessing: 5 wrong tries a code, 5 codes an hour and, whatever new
// codes are asked for, 10 codes and 10 wrong tries a day for each address or
// number. After a password reset every phone signed in to the account is
// signed out; after Change password, every phone but the one that changed it.
//
// SETUP (docs/database-setup.md, Steps 7 and 8):
//   · run supabase/schema.sql again (it adds the verification_codes table,
//     and the password history: section 10)
//   · Edge Functions → Secrets:
//       Gmail:  BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME (optional, "AniSense")
//       Texts:  SEMAPHORE_API_KEY, SEMAPHORE_SENDER_NAME (the name Semaphore
//               approved, exactly as its Sender Names page shows it: without an
//               approved one Semaphore refuses every text), SMS_MAX_PER_HOUR
//               (optional, 100)
//       Also:   OTP_SECRET (optional: a long random string the codes are
//               hashed with; without it, the service key is), EMAIL_MAX_PER_HOUR
//               (optional, 200)
//   · deploy this file as a function named  verify-code , with
//     "Enforce JWT verification" OFF (the app calls it before anyone has an
//     account, with the publishable key)
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are put here by Supabase
// itself: the service key never leaves the server and is never in the app.
//
// A CP-number account is an email account underneath, at an address nobody
// types (639171234567@phone.anisense.app, src/services/auth.ts), so both
// kinds of account are found the same way. Without SEMAPHORE_API_KEY a
// CP number gets SMS_NOT_READY: no account can be made with one, and no
// password reset by text, rather than either pretending it worked.
//
// Requests (POST, JSON):
//   { action: "ping" }                                   → { ok, email, sms, table, accounts }
//   { action: "send",  purpose, mode, contact, lang }    → { ok } | { ok: false, error, wait? }
//   { action: "check", purpose, mode, contact, code }    → { ok, result, token? }
//   { action: "create-account", mode, contact, token, password, profile } → { ok } | { ok: false, error }
//     (profile: full_name, role, location, phone, years_farming, crops: what
//     the sign-up form asked, copied into the profile by the database's
//     sign-up trigger)
//   { action: "reset-password", mode, contact, token, password } → { ok } | { ok: false, error }
//   { action: "change-password", current, password }    → { ok } | { ok: false, error, wait? }
//     (signed in: the app's own session token comes in the Authorization
//     header, and is checked here, since the function as a whole takes calls
//     from people not yet signed in)
// mode is "gmail" or "phone". Expected outcomes come back as 200 with
// ok: false and a code the app turns into words; only a broken request is an
// HTTP error.

import { createClient } from "jsr:@supabase/supabase-js@2";

const CODE_LIFE_MIN = 10;      // a code works for 10 minutes
const MAX_TRIES = 5;           // wrong tries before a new code is needed
const RESEND_WAIT_S = 30;      // between two codes to the same address or number
const MAX_SENDS_PER_HOUR = 5;  // codes to one address or number in an hour
const MAX_SENDS_PER_DAY = 10;  // codes to one address or number in 24 hours
const MAX_FAILS_PER_DAY = 10;  // wrong tries for one address or number in 24 hours, across codes
const TOKEN_LIFE_MIN = 10;     // after a reset code passes, to save the password
const SIGNUP_TOKEN_LIFE_MIN = 30; // after a sign-up code passes, to finish the form's questions
const CHANGE_TRIES = 5;        // wrong current passwords on Profile before a wait
const CHANGE_LOCK_MIN = 15;    // ... and how long that wait is
// Every text costs credits, and every email counts against Brevo's daily
// allowance, so all numbers and all addresses together get a ceiling too: it
// caps what anyone could cost by asking for codes to one after another.
const smsPerHour = () => Number(Deno.env.get("SMS_MAX_PER_HOUR")) || 100;
const emailPerHour = () => Number(Deno.env.get("EMAIL_MAX_PER_HOUR")) || 200;

const PHONE_LOGIN_DOMAIN = "phone.anisense.app";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
const sha256 = async (s: string) => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
// A code's hash is keyed with a secret only this function has: a 6-digit
// code hashed plainly could be found from its hash in a moment.
let hmacKey: Promise<CryptoKey> | null = null;
async function codeHash(key: string, code: string): Promise<string> {
  hmacKey ??= crypto.subtle.importKey("raw",
    new TextEncoder().encode(Deno.env.get("OTP_SECRET") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return "h1:" + hex(await crypto.subtle.sign("HMAC", await hmacKey, new TextEncoder().encode(`${key}:${code}`)));
}
/** Compares two hashes in the same time whatever they hold, so how long a
 *  wrong guess takes says nothing about how close it was. */
const sameHash = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
};
// Every code from 100000 to 999999 equally likely: draws that would favour
// the low ones are thrown back.
const sixDigits = () => {
  const limit = Math.floor(0x100000000 / 900000) * 900000, n = new Uint32Array(1);
  do crypto.getRandomValues(n); while (n[0] >= limit);
  return String(100000 + (n[0] % 900000));
};
const randomToken = () => { const b = new Uint8Array(32); crypto.getRandomValues(b); return hex(b.buffer); };
const isEmail = (s: string) => s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const iso = (ms: number) => new Date(ms).toISOString();

/** "0917 123 4567", "+63 917 123 4567", "9171234567" → "639171234567", the
 *  way the app writes it (toE164Phone, without the +). Null when it is not a
 *  Philippine mobile number. */
function phDigits(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("0")) d = "63" + d.slice(1);
  else if (!d.startsWith("63")) d = "63" + d;
  return /^639\d{9}$/.test(d) ? d : null;
}

type Mode = "gmail" | "phone";
type Purpose = "signup" | "reset";
type Lang = "en" | "tl";
type Row = {
  key: string; code_hash: string; expires_at: string; tries: number;
  sent_at: string; hour_started: string; sends_this_hour: number;
  token_hash: string | null; token_expires_at: string | null;
  day_started: string | null; sends_today: number | null; fails_today: number | null;
};

/** This address's or number's day so far: when it began, and its codes and
 *  wrong tries in it. A day over (or none yet) starts from nothing. */
function today(row: Row | null, now: number) {
  const started = row?.day_started ? Date.parse(row.day_started) : NaN;
  return Number.isFinite(started) && now - started < 86_400_000
    ? { started, sends: row!.sends_today ?? 0, fails: row!.fails_today ?? 0 }
    : { started: now, sends: 0, fails: 0 };
}

async function rowFor(key: string): Promise<Row | null> {
  const { data, error } = await db.from("verification_codes").select("*").eq("key", key).maybeSingle();
  if (error) throw error;
  return data as Row | null;
}

async function userIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await db.rpc("auth_user_id_by_email", { p_email: email });
  if (error) throw error;
  return (data as string | null) ?? null;
}

/** CP numbers (or Gmails) that were sent a code in the last hour, all together. */
async function sentThisHour(mode: Mode): Promise<number> {
  const { count, error } = await db.from("verification_codes").select("key", { count: "exact", head: true })
    .like("key", `%:${mode}:%`).gte("sent_at", iso(Date.now() - 3_600_000));
  if (error) throw error;
  return count ?? 0;
}

/** Signs the account out on every phone but `keep` (none kept: all of them).
 *  A password is changed whether or not this works; it is logged if not. */
async function endSessions(userId: string, keep: string | null) {
  const { error } = await db.rpc("end_sessions", { p_user: userId, p_keep: keep });
  if (error) console.error("verify-code could not end the account's other sessions:", error.message);
}

/** The session a signed-in request comes from, read from its token (already
 *  checked by auth.getUser before this is asked). */
function sessionIdOf(jwt: string): string | null {
  try {
    const part = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(part.padEnd(Math.ceil(part.length / 4) * 4, "=")));
    return typeof claims.session_id === "string" ? claims.session_id : null;
  } catch { return null; }
}

// ── The email ──
const WORDS = {
  en: {
    signup: { subject: "Your AniSense code: {code}", line: "Type this code in the AniSense app to confirm this Gmail is yours.", ignore: "If you did not sign up for AniSense, you can ignore this email." },
    reset: { subject: "Your AniSense password code: {code}", line: "Type this code in the AniSense app to make a new password.", ignore: "If you did not ask to reset your password, ignore this email. Your password stays the same." },
    lasts: "It works for 10 minutes.",
  },
  tl: {
    signup: { subject: "Ang AniSense code mo: {code}", line: "I-type ang code na ito sa AniSense app para makumpirma na sa iyo ang Gmail na ito.", ignore: "Kung hindi ka nag-sign up sa AniSense, huwag mo nang pansinin ang email na ito." },
    reset: { subject: "Ang code mo para sa password sa AniSense: {code}", line: "I-type ang code na ito sa AniSense app para gumawa ng bagong password.", ignore: "Kung hindi ka humiling na palitan ang password mo, huwag mo nang pansinin ito. Hindi magbabago ang password mo." },
    lasts: "Gagana ito sa loob ng 10 minuto.",
  },
};

async function sendEmail(to: string, code: string, purpose: Purpose, lang: Lang): Promise<boolean> {
  const apiKey = Deno.env.get("BREVO_API_KEY"), sender = Deno.env.get("BREVO_SENDER_EMAIL");
  if (!apiKey || !sender) return false;
  const w = WORDS[lang], p = w[purpose];
  const html = `<!doctype html><html><body style="margin:0;background:#f3f5f4;font-family:Arial,Helvetica,sans-serif;color:#16211b">
<div style="max-width:440px;margin:0 auto;padding:28px 20px">
  <div style="background:#ffffff;border-radius:16px;padding:28px 24px">
    <div style="font-weight:700;font-size:18px;color:#0b6b41">AniSense</div>
    <p style="font-size:16px;line-height:1.5;margin:18px 0 10px">${p.line}</p>
    <div style="font-size:34px;font-weight:700;letter-spacing:8px;margin:14px 0;color:#16211b">${code}</div>
    <p style="font-size:15px;line-height:1.5;margin:0 0 14px">${w.lasts}</p>
    <p style="font-size:13px;line-height:1.5;color:#606469;margin:0">${p.ignore}</p>
  </div>
</div></body></html>`;
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { name: Deno.env.get("BREVO_SENDER_NAME") || "AniSense", email: sender },
      to: [{ email: to }],
      subject: p.subject.replace("{code}", code),
      htmlContent: html,
      textContent: `${p.line}\n\n${code}\n\n${w.lasts}\n\n${p.ignore}`,
    }),
  });
  if (!res.ok) console.error("Brevo refused the email:", res.status, await res.text().catch(() => ""));
  return res.ok;
}

// ── The text ──
// One SMS each (160 characters at most, with the code in), the code early so
// it shows in the phone's notification. Semaphore puts the code where {otp} is.
const SMS = {
  en: {
    signup: "AniSense: Your code is {otp}. Type it in the app to confirm this number is yours. It works for 10 minutes. Do not share it.",
    reset: "AniSense: Your password code is {otp}. Type it in the app to make a new password. It works for 10 minutes. Do not share it.",
  },
  tl: {
    signup: "AniSense: Ang code mo ay {otp}. I-type ito sa app para makumpirma ang numero mo. Gagana ito nang 10 minuto. Huwag itong ibigay sa iba.",
    reset: "AniSense: Ang code mo sa password ay {otp}. I-type ito sa app para gumawa ng bagong password. Gagana ito nang 10 minuto. Huwag ibigay.",
  },
};

/** Texts the code through Semaphore's OTP route, which goes ahead of bulk
 *  messages. It is given our code; if it answers with another, that is the
 *  one the person got, so that is the one returned. Null when it was not sent. */
async function sendSms(number: string, code: string, purpose: Purpose, lang: Lang): Promise<string | null> {
  const apiKey = Deno.env.get("SEMAPHORE_API_KEY");
  if (!apiKey) return null;
  const form = new URLSearchParams({ apikey: apiKey, number, message: SMS[lang][purpose], code });
  // As typed into Secrets, less any spaces or quotes pasted round it: those
  // make Semaphore refuse the name ("The senderName supplied is not valid").
  const sender = (Deno.env.get("SEMAPHORE_SENDER_NAME") ?? "").trim().replace(/^["'“”]+|["'“”]+$/g, "").trim();
  if (sender) form.set("sendername", sender);
  let res: Response;
  try { res = await fetch("https://api.semaphore.co/api/v4/otp", { method: "POST", body: form }); }
  catch (err) { console.error("Semaphore could not be reached:", err); return null; }
  const body = await res.text().catch(() => "");
  let first: Record<string, unknown> | null = null;
  try { const data = JSON.parse(body); first = Array.isArray(data) ? data[0] ?? null : null; } catch { /* not JSON */ }
  // Semaphore's key is never in a log: only its answer is, with the sender
  // name it was given (not a secret), which shows at once whether that
  // matches the one Semaphore approved.
  if (!res.ok || !first || first.message_id == null) {
    console.error("Semaphore did not send the text:", res.status, body.slice(0, 300), sender ? `(sender name sent: "${sender}")` : "(no sender name set)");
    return null;
  }
  return first.code != null ? String(first.code).padStart(6, "0") : code;
}

// ── The three jobs ──
async function send(key: string, mode: Mode, contact: string, loginEmail: string, purpose: Purpose, lang: Lang) {
  const now = Date.now();
  // Say so now rather than at the last page: an address or number that
  // already has an account cannot make another, and a reset needs one.
  const userId = await userIdByEmail(loginEmail);
  if (purpose === "signup" && userId) return reply({ ok: false, error: "ACCOUNT_EXISTS" });
  if (purpose === "reset" && !userId) return reply({ ok: false, error: "NO_ACCOUNT" });

  const row = await rowFor(key);
  let hourStarted = now, sends = 0;
  const day = today(row, now);
  if (row) {
    const since = (now - Date.parse(row.sent_at)) / 1000;
    if (since < RESEND_WAIT_S) return reply({ ok: false, error: "WAIT", wait: Math.ceil(RESEND_WAIT_S - since) });
    if (now - Date.parse(row.hour_started) < 3_600_000) { hourStarted = Date.parse(row.hour_started); sends = row.sends_this_hour; }
    if (sends >= MAX_SENDS_PER_HOUR) return reply({ ok: false, error: "TOO_MANY_SENDS" });
  }
  // A new code starts its own 5 tries, so without a day's ceiling, asking
  // for code after code would allow guess after guess.
  if (day.sends >= MAX_SENDS_PER_DAY || day.fails >= MAX_FAILS_PER_DAY) return reply({ ok: false, error: "TOO_MANY_SENDS" });
  if ((await sentThisHour(mode)) >= (mode === "phone" ? smsPerHour() : emailPerHour())) {
    console.error(`verify-code: the hourly limit of ${mode === "phone" ? `${smsPerHour()} texts` : `${emailPerHour()} emails`} was reached`);
    return reply({ ok: false, error: "TOO_MANY_SENDS" });
  }

  const code = sixDigits();
  // Saved before it is sent, so a code that arrives can always be checked.
  // A new code replaces the last one, and starts its tries again.
  const { error } = await db.from("verification_codes").upsert({
    key, code_hash: await codeHash(key, code), expires_at: iso(now + CODE_LIFE_MIN * 60_000), tries: 0,
    sent_at: iso(now), hour_started: iso(hourStarted), sends_this_hour: sends + 1,
    day_started: iso(day.started), sends_today: day.sends + 1, fails_today: day.fails,
    token_hash: null, token_expires_at: null,
  });
  if (error) throw error;
  if (mode === "gmail") {
    if (!(await sendEmail(contact, code, purpose, lang))) return reply({ ok: false, error: "SEND_FAILED" });
  } else {
    const sent = await sendSms(contact, code, purpose, lang);
    if (!sent) return reply({ ok: false, error: "SEND_FAILED" });
    if (sent !== code) await db.from("verification_codes").update({ code_hash: await codeHash(key, sent) }).eq("key", key);
  }
  return reply({ ok: true });
}

async function check(key: string, purpose: Purpose, code: string) {
  const now = Date.now();
  const row = await rowFor(key);
  if (!row || row.code_hash === "used" || Date.parse(row.expires_at) < now) return reply({ ok: true, result: "expired" });
  const day = today(row, now);
  if (row.tries >= MAX_TRIES || day.fails >= MAX_FAILS_PER_DAY) return reply({ ok: true, result: "too-many" });
  if (!/^\d{6}$/.test(code) || !sameHash(await codeHash(key, code), row.code_hash)) {
    const tries = row.tries + 1, fails = day.fails + 1;
    await db.from("verification_codes").update({ tries, day_started: iso(day.started), fails_today: fails }).eq("key", key);
    return reply({ ok: true, result: tries >= MAX_TRIES || fails >= MAX_FAILS_PER_DAY ? "too-many" : "wrong" });
  }
  // It matches, so it is used up, and earns a one-time token for what comes
  // next: making the account (sign-up), or setting the new password (reset).
  // Only the phone that typed the code holds it.
  const token = randomToken();
  const life = purpose === "signup" ? SIGNUP_TOKEN_LIFE_MIN : TOKEN_LIFE_MIN;
  await db.from("verification_codes").update({
    code_hash: "used", token_hash: await sha256(token), token_expires_at: iso(now + life * 60_000),
  }).eq("key", key);
  return reply({ ok: true, result: "ok", token });
}

/** Whether `token` is the live one-time token a passed code earned for `key`. */
async function tokenHolds(key: string, token: string): Promise<boolean> {
  const row = await rowFor(key);
  return !!row && !!row.token_hash && !!row.token_expires_at && Date.parse(row.token_expires_at) >= Date.now()
    && /^[0-9a-f]{64}$/.test(token) && sameHash(await sha256(token), row.token_hash);
}

/** What the sign-up form asked, checked the way the database will check it,
 *  ready for the sign-up trigger (schema.sql, handle_new_user). Null when
 *  something is missing or not what the form could send. */
function profileFrom(p: unknown, mode: Mode, contact: string): Record<string, unknown> | null {
  const o = (p && typeof p === "object" ? p : {}) as Record<string, unknown>;
  const fullName = String(o.full_name ?? "").trim();
  const role = o.role === "farmer" || o.role === "buyer" ? o.role : null;
  const location = String(o.location ?? "").trim();
  let phone = o.phone == null || o.phone === "" ? null : String(o.phone).trim();
  if (!phone && mode === "phone") phone = `+${contact}`;
  const years = o.years_farming == null || o.years_farming === "" ? null : Number(o.years_farming);
  const crops = Array.isArray(o.crops) ? o.crops.map(c => String(c).trim()).filter(Boolean) : [];
  if (!fullName || fullName.length > 120 || !role || location.length > 200
      || (phone !== null && !/^\+639\d{9}$/.test(phone))
      || (years !== null && (!Number.isInteger(years) || years < 0 || years > 79))
      || crops.length > 20 || crops.some(c => c.length > 40)) return null;
  return { full_name: fullName, role, location: location || null, phone, years_farming: years, crops };
}

/** Makes the account, once the sign-up code for this address or number has
 *  passed (its token), with the password and what the form asked. */
async function createAccount(key: string, mode: Mode, contact: string, loginEmail: string, token: string, password: string, profile: unknown) {
  if (!(await tokenHolds(key, token))) return reply({ ok: false, error: "EXPIRED" });
  if (!strongEnough(password)) return reply({ ok: false, error: "WEAK_PASSWORD" });
  const data = profileFrom(profile, mode, contact);
  if (!data) return reply({ ok: false, error: "BAD_REQUEST" }, 400);
  if (await userIdByEmail(loginEmail)) return reply({ ok: false, error: "ACCOUNT_EXISTS" });
  const { error } = await db.auth.admin.createUser({ email: loginEmail, password, email_confirm: true, user_metadata: data });
  if (error) {
    if (/already|exists|registered/i.test(error.message)) return reply({ ok: false, error: "ACCOUNT_EXISTS" });
    if (/password/i.test(error.message)) return reply({ ok: false, error: "WEAK_PASSWORD" });
    console.error("verify-code could not make the account:", error.message);
    return reply({ ok: false, error: "FAILED" });
  }
  // The token is spent: another account needs another code.
  await db.from("verification_codes").delete().eq("key", key);
  return reply({ ok: true });
}

// The app's rule for a new password (src/lib/password.ts): 8 characters or
// more, with a letter and a number or a symbol. The app also turns away the
// ones guessed first ("password1"); this is the floor nobody gets under by
// calling the function without the app.
const strongEnough = (pw: string) => pw.length >= 8 && /\p{L}/u.test(pw) && /[^\p{L}\s]/u.test(pw);

/** Whether this account has had this password before: its current one, or
 *  one of its last ten (password_was_used, schema.sql section 10). */
async function usedBefore(userId: string, password: string): Promise<boolean> {
  const { data, error } = await db.rpc("password_was_used", { p_user: userId, p_password: password });
  if (error) throw error;
  return data === true;
}

async function resetPassword(key: string, loginEmail: string, token: string, password: string) {
  if (!strongEnough(password)) return reply({ ok: false, error: "WEAK_PASSWORD" });
  if (!(await tokenHolds(key, token))) return reply({ ok: false, error: "EXPIRED" });
  const userId = await userIdByEmail(loginEmail);
  if (!userId) return reply({ ok: false, error: "NO_ACCOUNT" });
  // One they have had before is turned away, and the token stays good, so
  // they can try another straight away.
  if (await usedBefore(userId, password)) return reply({ ok: false, error: "USED_BEFORE" });
  const { error } = await db.auth.admin.updateUserById(userId, { password });
  if (error) return reply({ ok: false, error: /password/i.test(error.message) ? "WEAK_PASSWORD" : "FAILED" });
  // The token is spent: another change needs another code.
  await db.from("verification_codes").delete().eq("key", key);
  // Whoever else was signed in to this account is signed out: a password is
  // often reset because someone else got in.
  await endSessions(userId, null);
  return reply({ ok: true });
}

/**
 * Profile's Change password: the person is signed in (their session token
 * says who), gives their current password and a new one. Wrong current
 * passwords are counted per account, in the codes table under its own key:
 * five and it waits fifteen minutes, so a phone left signed in cannot be
 * used to guess the password. The new one must meet the rule, differ from
 * the current one, and not be one the account has had before.
 */
async function changePassword(jwt: string, current: string, password: string) {
  const { data, error } = await db.auth.getUser(jwt);
  const user = data?.user;
  if (error || !user) return reply({ ok: false, error: "NOT_SIGNED_IN" });

  const key = `change:${user.id}`, now = Date.now();
  const row = await rowFor(key);
  const live = !!row && Date.parse(row.expires_at) > now;
  if (live && row!.tries >= CHANGE_TRIES) {
    return reply({ ok: false, error: "TOO_MANY_TRIES", wait: Math.ceil((Date.parse(row!.expires_at) - now) / 60_000) });
  }
  const { data: isCurrent, error: currentErr } = await db.rpc("password_is_current", { p_user: user.id, p_password: current });
  if (currentErr) throw currentErr;
  if (isCurrent !== true) {
    const tries = (live ? row!.tries : 0) + 1;
    const locked = tries >= CHANGE_TRIES;
    // The window runs from the first wrong try; reaching the limit starts the wait afresh.
    const until = locked ? now + CHANGE_LOCK_MIN * 60_000 : live ? Date.parse(row!.expires_at) : now + CHANGE_LOCK_MIN * 60_000;
    const { error: countErr } = await db.from("verification_codes").upsert({
      key, code_hash: "change", expires_at: iso(until), tries,
      sent_at: iso(now), hour_started: iso(now), sends_this_hour: 0, token_hash: null, token_expires_at: null,
    });
    if (countErr) throw countErr;
    return reply(locked ? { ok: false, error: "TOO_MANY_TRIES", wait: CHANGE_LOCK_MIN } : { ok: false, error: "WRONG_PASSWORD" });
  }

  if (!strongEnough(password)) return reply({ ok: false, error: "WEAK_PASSWORD" });
  if (password === current) return reply({ ok: false, error: "SAME_AS_CURRENT" });
  if (await usedBefore(user.id, password)) return reply({ ok: false, error: "USED_BEFORE" });
  const { error: updateErr } = await db.auth.admin.updateUserById(user.id, { password });
  if (updateErr) return reply({ ok: false, error: /password/i.test(updateErr.message) ? "WEAK_PASSWORD" : "FAILED" });
  // The old one is now in the history (the database's own trigger), and the count starts again.
  await db.from("verification_codes").delete().eq("key", key);
  // Every other phone signed in to the account is signed out; this one stays.
  await endSessions(user.id, sessionIdOf(jwt));
  return reply({ ok: true });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply({ ok: false, error: "BAD_REQUEST" }, 405);
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return reply({ ok: false, error: "BAD_REQUEST" }, 400); }

  // For npm run check:db: are Brevo and Semaphore set up, and did schema.sql make the table?
  if (b.action === "ping") {
    const { error } = await db.from("verification_codes").select("key").limit(1);
    // accounts: this version makes the accounts (public sign-up can be off).
    return reply({ ok: true, email: !!Deno.env.get("BREVO_API_KEY") && !!Deno.env.get("BREVO_SENDER_EMAIL"),
      sms: !!Deno.env.get("SEMAPHORE_API_KEY"), table: !error, accounts: true });
  }

  // Signed in, from Profile: no address or number involved.
  if (b.action === "change-password") {
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    try { return await changePassword(jwt, String(b.current ?? ""), String(b.password ?? "")); }
    catch (err) { console.error("verify-code change-password failed:", err); return reply({ ok: false, error: "FAILED" }, 500); }
  }

  const purpose = b.purpose === "signup" || b.purpose === "reset" ? b.purpose : null;
  const needsPurpose = b.action === "send" || b.action === "check";
  if ((b.mode !== "gmail" && b.mode !== "phone") || (needsPurpose && !purpose)) return reply({ ok: false, error: "BAD_REQUEST" }, 400);
  const mode = b.mode as Mode;
  if (mode === "phone" && !Deno.env.get("SEMAPHORE_API_KEY")) return reply({ ok: false, error: "SMS_NOT_READY" });

  // The address or number however it was typed, and the account's login address.
  const raw = String(b.contact ?? "").trim();
  const contact = mode === "gmail" ? raw.toLowerCase() : phDigits(raw);
  if (!contact || (mode === "gmail" && !isEmail(contact))) return reply({ ok: false, error: "BAD_REQUEST" }, 400);
  const loginEmail = mode === "gmail" ? contact : `${contact}@${PHONE_LOGIN_DOMAIN}`;
  const lang: Lang = b.lang === "tl" ? "tl" : "en";

  try {
    if (b.action === "send") return await send(`${purpose}:${mode}:${contact}`, mode, contact, loginEmail, purpose!, lang);
    if (b.action === "check") return await check(`${purpose}:${mode}:${contact}`, purpose!, String(b.code ?? ""));
    if (b.action === "create-account") return await createAccount(`signup:${mode}:${contact}`, mode, contact, loginEmail, String(b.token ?? ""), String(b.password ?? ""), b.profile);
    if (b.action === "reset-password") return await resetPassword(`reset:${mode}:${contact}`, loginEmail, String(b.token ?? ""), String(b.password ?? ""));
    return reply({ ok: false, error: "BAD_REQUEST" }, 400);
  } catch (err) {
    console.error("verify-code failed:", err);
    return reply({ ok: false, error: "FAILED" }, 500);
  }
});
