import { useEffect } from "react";
import { useLang } from "../../i18n";
import { haptic } from "../../lib/platform";
import { ACHIEVEMENTS, AchievementId } from "../../lib/achievements";
import { Sheet } from "../ui/Sheet";
import { ACH_ICON, achNote } from "./Achievements";
import mascotThumbs from "../../assets/mascot-thumbs.webp";
import mascotThumbsEyes from "../../assets/mascot-thumbs-eyes.webp";

// ─── Achievement unlocked ─────────────────────────────────────────────────────
// The moment a farmer earns a badge: the screen dims, as for the welcome ID,
// Juan comes up giving a thumbs-up, and the badge lands on its metal plate.
// Rare by nature (six badges in a farmer's whole life on the app), so this is
// where the app is allowed a little ceremony:
//   · the plate lands with a small overshoot, the medal stamps onto it,
//     and one pass of light crosses the metal once it has settled
//   · Juan rises from behind the plate and keeps blinking while it is open
// Several earned at once play one after another: each "Next" re-mounts the
// content, so every badge gets its own arrival.

export function AchievementUnlocked({ id, open, remaining, memberSince, onNext, onSeeAll }: {
  id: AchievementId | null;
  open: boolean;
  /** How many more are waiting after this one. */
  remaining: number;
  memberSince?: Date;
  onNext: () => void;
  onSeeAll: () => void;
}) {
  const { t, lang } = useLang();
  const locale = lang === "tl" ? "fil-PH" : "en-PH";
  const tone = ACHIEVEMENTS.find(a => a.id === id)?.tone ?? "gold";

  // The buzz of a win, once per badge, as it lands.
  useEffect(() => {
    if (!open || !id) return;
    const t = window.setTimeout(() => haptic.success(), 520);
    return () => window.clearTimeout(t);
  }, [open, id]);

  return (
    <Sheet open={open} onClose={onNext} variant="center" className="au-panel" label={t("au_kicker")}>
      {id && (
        <div className="au" key={id}>
          <div className="au-kicker">{t("au_kicker")}</div>

          <div className="au-stage">
            <div className="au-mascot" aria-hidden="true">
              <img className="au-m-body" src={mascotThumbs} alt="" width={420} height={443} decoding="async" />
              <img className="au-m-eyes" src={mascotThumbsEyes} alt="" width={420} height={443} decoding="async" />
            </div>
            <div className="au-plate">
              <span className={`ach-medal au-medal ${tone}`} aria-hidden="true">{ACH_ICON[id](36)}</span>
              <h2 className="au-name">{t(`ach_${id}_t`)}</h2>
              <p className="au-note">{achNote(id, true, t, locale, memberSince)}</p>
              <span className="au-shine" aria-hidden="true" />
            </div>
          </div>

          <div className="au-actions">
            <button type="button" className="wid-btn primary" onClick={onNext}>
              {remaining > 0 ? t("au_next") : t("au_ok")}
            </button>
            <button type="button" className="wid-btn ghost" onClick={onSeeAll}>{t("au_see")}</button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
