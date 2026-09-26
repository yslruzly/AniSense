// ─── Names ────────────────────────────────────────────────────────────────────
// A name is shown on the member ID, on every listing a farmer posts, and to
// every buyer who calls them, so it is stored the way it would be printed:
// "JUAN tamad  cRUZ" becomes "Juan Tamad Cruz".
//
//   · spaces trimmed, and runs of them collapsed to one
//   · every word: first letter capital, the rest small
//   · the same after a hyphen, an apostrophe or a dot, so "mary-anne",
//     "d'angelo" and "j.p." come out "Mary-Anne", "D'Angelo", "J.P."
//   · a roman-numeral suffix stays capitals: "Juan Cruz III", not "Iii" -
//     only as the last word, so a first name like "Vi" is left alone
//
// Particles are capitalised like any other word ("Dela Cruz", "De Los
// Santos"): that is how the app asks for names to be written.

const ROMAN = /^(ii|iii|iv|vi|vii|viii|ix|x)$/i;

const capitalise = (part: string) =>
  part.charAt(0).toLocaleUpperCase("en-PH") + part.slice(1).toLocaleLowerCase("en-PH");

export function formatName(raw: string): string {
  return raw
    .normalize("NFC")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, i, words) =>
      i > 0 && i === words.length - 1 && ROMAN.test(word)
        ? word.toUpperCase()
        // Split on the joiners but keep them, then capitalise each piece.
        : word.split(/([-'’.])/).map(p => (/^[-'’.]$/.test(p) || !p ? p : capitalise(p))).join(""),
    )
    .join(" ");
}
