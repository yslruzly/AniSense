// ─── Passwords ────────────────────────────────────────────────────────────────
// What a new password must be: for a new account, and for a new password
// after a reset. (Signing in takes whatever the account already has, so
// nobody with an older, shorter password is locked out.)
//
// Long enough, and not only letters: at least 8 characters, with a letter
// and a number or a symbol. A symbol isn't required on its own, because on a
// phone it is the hardest thing to find on the keyboard; a number does the
// same work. On top of the rules, the passwords people guess first are
// turned away, even when they tick every box ("password1", "abcd1234").
//
// The server function that saves a reset password applies the same rule
// (supabase/functions/verify-code), and Supabase Auth's own minimum length
// is set to 8 in the dashboard, so the app is not the only guard.

export const PW_MIN = 8;

export interface PasswordRules {
  long: boolean;
  letter: boolean;
  numOrSymbol: boolean;
}

/** Which of the three rules a password meets, for the ticks under the field. */
export function passwordRules(pw: string): PasswordRules {
  return {
    long: pw.length >= PW_MIN,
    letter: /\p{L}/u.test(pw),
    numOrSymbol: /[^\p{L}\s]/u.test(pw),
  };
}

// The first ones tried. Kept to ones that pass the three rules: anything
// else is turned away by them already.
const COMMON = new Set([
  "password1", "password12", "password123", "password!", "passw0rd", "p@ssword", "p@ssw0rd", "p@ssword1",
  "qwerty12", "qwerty123", "qwerty1!", "qwer1234", "asdf1234", "asdfgh12", "zxcv1234", "1q2w3e4r", "1qaz2wsx", "zaq12wsx",
  "abc12345", "abcd1234", "abcde123", "a1b2c3d4", "aa123456", "iloveyou1", "iloveyou123", "welcome1", "welcome123",
  "admin123", "letmein1", "monkey123", "dragon123", "sunshine1", "princess1", "football1", "baseball1",
  "anisense1", "anisense123", "farmer123", "magsasaka1", "pilipinas1", "philippines1", "mahalkita1", "palay123",
]);
const RUNS = ["abcdefghijklmnopqrstuvwxyz", "qwertyuiopasdfghjklzxcvbnm", "01234567890"];
const isRun = (s: string) => s.length >= 4 && RUNS.some(r => r.includes(s));

/** Easy to guess though it meets the rules: a well-known one, hardly any
 *  different characters ("aaaa1111"), or one straight run along the
 *  alphabet or the keyboard with a counted tail ("abcd1234", "qwerty12"). */
export function passwordTooEasy(pw: string): boolean {
  const s = pw.toLowerCase();
  if (COMMON.has(s)) return true;
  if (new Set(s).size < 4) return true;
  const letters = s.replace(/[^a-z]/g, ""), digits = s.replace(/\D/g, "");
  return isRun(letters) && (digits === "" || "01234567890".includes(digits)) && letters.length + digits.length >= s.length - 1;
}

/** What is wrong with a new password, if anything, in the order the ticks
 *  are listed; null when it will do. */
export function passwordProblem(pw: string): null | "short" | "letter" | "numOrSymbol" | "easy" {
  const r = passwordRules(pw);
  if (!r.long) return "short";
  if (!r.letter) return "letter";
  if (!r.numOrSymbol) return "numOrSymbol";
  return passwordTooEasy(pw) ? "easy" : null;
}
