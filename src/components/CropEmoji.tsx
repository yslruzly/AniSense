import { useEffect, useState } from "react";
import { CropIcon } from "./icons";

// ─── Crop emoji ───────────────────────────────────────────────────────────────
// Emoji beat line icons here: they arrive in full colour, they're already
// familiar, and they're distinguishable at a glance, which the monochrome set
// wasn't (Onions and Tomatoes were both a leaf, Corn and Calamansi both a
// sprout). Two entries are approximations, flagged below.
export const CROP_EMOJI: Record<string, string> = {
  Rice: "🌾",
  Corn: "🌽",
  Onions: "🧅",      // Unicode 12, Android 10+
  Tomatoes: "🍅",
  Calamansi: "🍋",   // no calamansi emoji exists; lemon is the nearest
  Mango: "🥭",       // Unicode 11, Android 9+
  Garlic: "🧄",      // Unicode 12, Android 10+
  Squash: "🎃",      // no plain pumpkin emoji exists; this one is carved
  // rice price varieties, so the picker and the market list agree
  "Rice (All Varieties)": "🌾",
  "Special Rice": "🌾",
  "Well Milled": "🌾",
  "Regular Milled": "🌾",
};

// Onions and Garlic need Unicode 12. On Android 9 and below they render as an
// empty box, and a chunk of this audience is on older budget handsets, so test
// once at mount and fall back to the line icons if the font can't cope.
function emojiSupported(char: string): boolean {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 20;
    const ctx = canvas.getContext("2d");
    if (!ctx) return true;

    const render = (c: string) => {
      ctx.clearRect(0, 0, 20, 20);
      ctx.textBaseline = "top";
      ctx.font = "16px sans-serif";
      ctx.fillText(c, 0, 0);
      return canvas.toDataURL();
    };

    // U+10FFFF is permanently unassigned, so it always draws the fallback box.
    return render(char) !== render("\u{10FFFF}");
  } catch {
    return true;
  }
}

let cached: boolean | null = null;

export function CropEmoji({ crop, size = 30 }: { crop: string; size?: number }) {
  const [ok, setOk] = useState<boolean>(cached ?? true);

  useEffect(() => {
    if (cached === null) cached = emojiSupported("🧅");
    setOk(cached);
  }, []);

  if (!ok) return <CropIcon crop={crop} size={size} />;

  const glyph = CROP_EMOJI[crop];
  if (!glyph) return <CropIcon crop={crop} size={size} />;

  return (
    <span
      aria-hidden="true"
      style={{
        fontSize: size,
        lineHeight: 1,
        display: "block",
        // Keep the system emoji font; never let a webfont swallow these.
        fontFamily:
          '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
      }}
    >
      {glyph}
    </span>
  );
}
