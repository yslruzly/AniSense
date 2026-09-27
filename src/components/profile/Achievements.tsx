import type { ReactNode } from "react";
import { Sprout, Wheat, HandCoins, Award, Medal, Trophy, Lock } from "lucide-react";
import { useLang } from "../../i18n";
import { useMarket } from "../../lib/market";
import { Sale } from "../../lib/sales";
import { ACHIEVEMENTS, AchievementId, earnedAchievements } from "../../lib/achievements";

// ─── Achievements ─────────────────────────────────────────────────────────────
// What a farmer has earned on AniSense, in the order they earn it: joining,
// a first harvest posted, a first sale, then the three awards. Every badge is
// worked out from what the app already knows (src/lib/achievements.ts), never
// typed in, so a badge means the thing happened.
//
// Earned badges sit on a brushed-metal plate. The rest are grey with a lock
// and say how to earn them: a goal to aim for, not a blank.

export const ACH_ICON: Record<AchievementId, (size: number) => ReactNode> = {
  newbie: s => <Sprout size={s} strokeWidth={2.2} />,
  harvest: s => <Wheat size={s} strokeWidth={2.2} />,
  sale: s => <HandCoins size={s} strokeWidth={2.2} />,
  week: s => <Award size={s} strokeWidth={2.2} />,
  month: s => <Medal size={s} strokeWidth={2.2} />,
  year: s => <Trophy size={s} strokeWidth={2.2} />,
};

/** The line under a badge: what they did, or how to earn it. */
export function achNote(id: AchievementId, earned: boolean, t: (k: string) => string, locale: string, memberSince?: Date) {
  if (id === "newbie") {
    return memberSince
      ? t("ach_newbie_on").replace("{date}", memberSince.toLocaleDateString(locale, { month: "long", year: "numeric" }))
      : t("ach_newbie_welcome");
  }
  if (id === "month" || id === "year") return t(`ach_${id}_how`);
  return t(`ach_${id}_${earned ? "done" : "how"}`);
}

export function Achievements({ sales = [], memberSince }: { sales?: Sale[]; memberSince?: Date }) {
  const { t, lang } = useLang();
  const { listings, isMine, sellers, sellerKeyOf } = useMarket();
  const locale = lang === "tl" ? "fil-PH" : "en-PH";
  const have = earnedAchievements({ listings, isMine, sellers, sellerKeyOf, sales });

  return (
    <div className="card ach">
      <div className="card-head">
        <span className="card-ico tint-gold"><Trophy size={20} strokeWidth={2.2} /></span>
        <div className="card-title" style={{ margin: 0 }}>{t("ach_title")}</div>
        <span className="ach-count">{t("ach_count").replace("{n}", String(have.size)).replace("{total}", String(ACHIEVEMENTS.length))}</span>
      </div>
      <div className="ach-grid stagger-list">
        {ACHIEVEMENTS.map(({ id, tone }) => {
          const earned = have.has(id);
          return (
            <div key={id} className={`ach-badge ${earned ? "on" : "off"}`}>
              <span className={`ach-medal ${tone}`} aria-hidden="true">
                {ACH_ICON[id](24)}
                {!earned && <span className="ach-lock"><Lock size={11} strokeWidth={2.8} /></span>}
              </span>
              <span className="ach-name">
                {t(`ach_${id}_t`)}
                {!earned && <span className="sr-only">, {t("ach_locked")}</span>}
              </span>
              <span className="ach-note">{achNote(id, earned, t, locale, memberSince)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
