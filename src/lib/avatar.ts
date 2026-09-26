// ─── Avatar colours ───────────────────────────────────────────────────────────
// One colour per farmer, worked out from their name, and the same list
// everywhere a farmer's initials appear: Home's featured farmers, the profile
// sheet, the marketplace. Two lists meant the same person could be green on
// Home and blue in their own profile.

const TONES = [
  "linear-gradient(135deg, #1F8A5B, #0B5A37)",
  "linear-gradient(135deg, #D19A2E, #8A5D0C)",
  "linear-gradient(135deg, #4A8FCC, #235887)",
  "linear-gradient(135deg, #7B64CF, #47348A)",
  "linear-gradient(135deg, #D0564A, #86190F)",
];

export const avatarTone = (name: string) =>
  TONES[[...name].reduce((n, ch) => n + ch.charCodeAt(0), 0) % TONES.length];
