import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Star } from "lucide-react";
import { useLang } from "../../i18n";
import { haptic } from "../../lib/platform";

// ─── Five stars to tap ────────────────────────────────────────────────────────
// A buyer's rating for a farmer. Each star is a 44px target round a 30px
// star, so a thumb can't miss and can't hit two. Tapping the third fills the
// first three, in palay gold, one after another from the left (45ms apart),
// each with a small pop: rating is something done now and then, at the end
// of a sale, so it can afford a moment of delight; a new tap replays it for
// the new choice. The choice shows at once; if it can't be saved it goes
// back, and the screen says why.
//
// Pressed, a star gives under the finger. On a desktop, pointing at a star
// previews it in a paler gold. It is a radio group: a screen reader hears
// "3 stars, 2 of 5" and the arrow keys move along it. With reduced motion
// the stars only change colour.

const gold = (n: number, t: (k: "rate_star_one" | "rate_star_n") => string) =>
  n === 1 ? t("rate_star_one") : t("rate_star_n").replace("{n}", String(n));

export function StarRating({ value, onRate, labelledBy }: {
  /** The stars given so far, 0 for none. */
  value: number;
  /** Save a choice; rejecting puts the stars back as they were. */
  onRate: (n: number) => Promise<void>;
  labelledBy: string;
}) {
  const { t } = useLang();
  const [picked, setPicked] = useState<number | null>(null);
  const [hover, setHover] = useState(0);
  // Bumped on every pick, so the pop plays again for the new choice.
  const [burst, setBurst] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const chosen = picked ?? value;
  const shown = hover || chosen;

  // Once the saved value catches up with the pick, the pick has done its job.
  useEffect(() => { if (picked !== null && value === picked) setPicked(null); }, [value, picked]);

  const pick = async (n: number) => {
    haptic.select();
    setPicked(n);
    setBurst(b => b + 1);
    try { await onRate(n); } catch { setPicked(null); }
  };

  const onKey = (e: KeyboardEvent, n: number) => {
    const to = e.key === "ArrowRight" || e.key === "ArrowUp" ? Math.min(5, n + 1)
      : e.key === "ArrowLeft" || e.key === "ArrowDown" ? Math.max(1, n - 1)
      : e.key === "Home" ? 1 : e.key === "End" ? 5 : 0;
    if (!to) return;
    e.preventDefault();
    refs.current[to - 1]?.focus();
    void pick(to);
  };

  return (
    <div className="stars" role="radiogroup" aria-labelledby={labelledBy} data-pop={burst > 0 || undefined}
      onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} ref={el => { refs.current[n - 1] = el; }} type="button" role="radio"
          className={`star${n <= shown ? " on" : ""}${hover && n <= hover && n > chosen ? " preview" : ""}`}
          aria-checked={chosen === n} aria-label={gold(n, t)} tabIndex={(chosen || 1) === n ? 0 : -1}
          onClick={() => { void pick(n); }} onKeyDown={e => onKey(e, n)}
          onMouseEnter={() => setHover(n)}
          style={{ "--i": n - 1 } as CSSProperties}>
          {/* Keyed on the pick, so a filled star's pop plays again. */}
          <span key={burst > 0 && n <= chosen ? `p${burst}` : "s"} className={`star-ico${burst > 0 && n <= chosen ? " pop" : ""}`}>
            <Star size={30} strokeWidth={2} aria-hidden="true" />
          </span>
        </button>
      ))}
    </div>
  );
}

/** Stars only to read, small: what a buyer gave, on the farmer's side. */
export function StarsShown({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="stars-shown" aria-hidden="true">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={size} strokeWidth={2} className={n <= value ? "on" : ""} />
      ))}
    </span>
  );
}
