// ─── Avatar colours ───────────────────────────────────────────────────────────
// One colour per farmer, worked out from their name, and the same list
// everywhere a farmer's initials appear: Home's featured farmers, the profile
// sheet, the marketplace. Two lists meant the same person could be one colour
// on Home and another in their own profile.
//
// No green: the app itself is green, and a green avatar on it reads as a
// button or a badge, not a person. Eight colours rather than five, and a
// proper hash of the whole name rather than a sum of its letters, which gave
// half the sample farmers the same colour. The fixed "231:" in front is only
// the setting under which the five sample farmers all come out different
// (gold, violet, red, blue, orange, in rating order, so no two neighbours in
// Featured farmers look alike); any name still maps to one colour, always.

const TONES = [
  "linear-gradient(135deg, #D19A2E, #8A5D0C)", // gold
  "linear-gradient(135deg, #4A8FCC, #235887)", // blue
  "linear-gradient(135deg, #7B64CF, #47348A)", // violet
  "linear-gradient(135deg, #D0564A, #86190F)", // red
  "linear-gradient(135deg, #E88A3C, #A2481A)", // orange
  "linear-gradient(135deg, #D35C94, #8E2A5C)", // pink
  "linear-gradient(135deg, #5B6FB8, #2E3B72)", // indigo
  "linear-gradient(135deg, #A87650, #5E3A1E)", // brown
];

/** FNV-1a with a final mix, so similar names still land far apart. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (const ch of s) { h ^= ch.codePointAt(0)!; h = Math.imul(h, 0x01000193); }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

// The same eight, pale: 30% of each colour's light end over white. For the
// band behind an avatar, so the card around a farmer carries their colour
// without competing with their initials or the words under them.
const TINTS = ["#F1E1C0", "#C9DDF0", "#D7D0F1", "#F1CCC9", "#F8DCC4", "#F2CEDF", "#CED4EA", "#E5D6CA"];

const toneIndex = (name: string) => hash(`231:${name.trim().toLowerCase()}`) % TONES.length;

export const avatarTone = (name: string) => TONES[toneIndex(name)];

/** The farmer's colour, pale, for a background behind their avatar. */
export const avatarTint = (name: string) => TINTS[toneIndex(name)];
