import type { ReactNode } from "react";
import { Sprout, Wheat, HandCoins, Award, Medal, Trophy, Lock } from "lucide-react";
import { useLang } from "../../i18n";
import { useMarket } from "../../store/market";
import { Sale } from "../../lib/sales";
import { ACHIEVEMENTS, AchievementId, earnedAchievements } from "../../lib/achievements";
import leafMask from "../../assets/anisense-leaf-mask.png";

// ─── Achievements ─────────────────────────────────────────────────────────────
// What a farmer has earned on AniSense, in the order they earn it: joining,
// a first harvest posted, a first sale, then the three awards. Every badge is
// worked out from what the app already knows (src/lib/achievements.ts), never
// typed in, so a badge means the thing happened.
//
// A trophy case in AniSense green: how many are earned and a bar of six to
// fill, then the medals. Earned ones hang on their ribbon in a gold-plated
// rim; the rest are outlines with a lock that say how to earn them, and the
// first of those is marked as the next goal, so there is always one thing to
// aim for.

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
  if ((id === "month" || id === "year") && !earned) return t(`ach_${id}_how`);
  if (id === "month" || id === "year") return t(`ach_${id}_done`);
  return t(`ach_${id}_${earned ? "done" : "how"}`);
}

/** A medal: the face in its colour in a gold-plated rim, hung on a ribbon
 *  once earned. Shared with the Achievement unlocked moment. */
export function AchMedal({ id, tone, earned, size, className = "" }: {
  id: AchievementId; tone: string; earned: boolean; size: number; className?: string;
}) {
  return (
    <span className={`ach-medalwrap ${className}`} aria-hidden="true">
      {earned && <span className={`ach-ribbon ${tone}`} />}
      <span className={`ach-medal ${tone}`}>
        {ACH_ICON[id](size)}
        {!earned && <span className="ach-lock"><Lock size={11} strokeWidth={2.8} /></span>}
      </span>
    </span>
  );
}

export function Achievements({ sales = [], memberSince }: { sales?: Sale[]; memberSince?: Date }) {
  const { t, lang } = useLang();
  const { listings, isMine, sellers, sellerKeyOf, awards } = useMarket();
  const locale = lang === "tl" ? "fil-PH" : "en-PH";
  const have = earnedAchievements({ listings, isMine, sellers, sellerKeyOf, sales, awarded: awards });
  const total = ACHIEVEMENTS.length;
  const next = ACHIEVEMENTS.find(a => !have.has(a.id))?.id;

  return (
    <section className="card prof-card ach" aria-labelledby="pg-ach">
      <img className="ach-mark" src={leafMask} alt="" aria-hidden="true" />

      {/* The head: the trophy on a gold-plated disc, the name, how many are
          earned, and a bar of six that fills in gold, one step a badge. */}
      <div className="ach-top">
        <span className="ach-cup" aria-hidden="true"><Trophy size={22} strokeWidth={2.3} /></span>
        <div className="ach-top-txt">
          <h2 className="ach-title" id="pg-ach">{t("ach_title")}</h2>
          <div className="ach-sub">{t("ach_count").replace("{n}", String(have.size)).replace("{total}", String(total))}</div>
        </div>
      </div>
      <div className="ach-bar" aria-hidden="true">
        {ACHIEVEMENTS.map((a, i) => <span key={a.id} className={i < have.size ? "on" : undefined} />)}
      </div>

      <ul className="ach-grid stagger-list">
        {ACHIEVEMENTS.map(({ id, tone }) => {
          const earned = have.has(id);
          const isNext = id === next;
          return (
            <li key={id} className={`ach-badge ${earned ? "on" : "off"}${isNext ? " next" : ""}`}>
              {isNext && <span className="ach-next">{t("ach_next")}</span>}
              <AchMedal id={id} tone={tone} earned={earned} size={24} />
              <span className="ach-name">
                {t(`ach_${id}_t`)}
                {!earned && <span className="sr-only">, {t("ach_locked")}</span>}
              </span>
              <span className="ach-note">{achNote(id, earned, t, locale, memberSince)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
