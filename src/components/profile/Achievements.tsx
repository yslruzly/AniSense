import type { ReactNode } from "react";
import { Sprout, Wheat, HandCoins, Award, Medal, Trophy, Lock } from "lucide-react";
import { useLang } from "../../i18n";
import { useMarket } from "../../lib/market";
import { farmerOfTheWeek } from "../../lib/featured";
import { Sale } from "../../lib/sales";

// ─── Achievements ─────────────────────────────────────────────────────────────
// What a farmer has earned on AniSense, in the order they earn it: joining,
// a first harvest posted, a first sale, then the three awards. Every badge is
// worked out from what the app already knows, never typed in, so a badge
// means the thing happened.
//
// Earned badges are in colour. The rest are grey with a lock and say how to
// earn them: a goal to aim for, not a blank. Farmer of the Week is the same
// pick Home's Featured farmers shows buyers (src/lib/featured.ts); Farmer of
// the Month and of the Year are named goals until those awards are run.

type Badge = { id: string; ico: ReactNode; tone: string; earned: boolean; note: string };

export function Achievements({ sales = [], memberSince }: { sales?: Sale[]; memberSince?: Date }) {
  const { t, lang } = useLang();
  const { listings, isMine, sellers, sellerKeyOf } = useMarket();
  const locale = lang === "tl" ? "fil-PH" : "en-PH";

  const mine = listings.filter(isMine);
  const spot = farmerOfTheWeek(sellers);
  const isWeek = !!spot && mine.some(l => sellerKeyOf(l) === spot.key);
  const joined = memberSince
    ? t("ach_newbie_on").replace("{date}", memberSince.toLocaleDateString(locale, { month: "long", year: "numeric" }))
    : t("ach_newbie_welcome");

  const badges: Badge[] = [
    { id: "newbie", ico: <Sprout size={24} strokeWidth={2.2} />, tone: "blue", earned: true, note: joined },
    { id: "harvest", ico: <Wheat size={24} strokeWidth={2.2} />, tone: "green", earned: mine.length > 0,
      note: t(mine.length > 0 ? "ach_harvest_done" : "ach_harvest_how") },
    { id: "sale", ico: <HandCoins size={24} strokeWidth={2.2} />, tone: "orange", earned: sales.length > 0,
      note: t(sales.length > 0 ? "ach_sale_done" : "ach_sale_how") },
    { id: "week", ico: <Award size={24} strokeWidth={2.2} />, tone: "gold", earned: isWeek,
      note: t(isWeek ? "ach_week_done" : "ach_week_how") },
    { id: "month", ico: <Medal size={24} strokeWidth={2.2} />, tone: "violet", earned: false, note: t("ach_month_how") },
    { id: "year", ico: <Trophy size={24} strokeWidth={2.2} />, tone: "trophy", earned: false, note: t("ach_year_how") },
  ];
  const earned = badges.filter(b => b.earned).length;

  return (
    <div className="card ach">
      <div className="card-head">
        <span className="card-ico tint-gold"><Trophy size={20} strokeWidth={2.2} /></span>
        <div className="card-title" style={{ margin: 0 }}>{t("ach_title")}</div>
        <span className="ach-count">{t("ach_count").replace("{n}", String(earned)).replace("{total}", String(badges.length))}</span>
      </div>
      <div className="ach-grid stagger-list">
        {badges.map(b => (
          <div key={b.id} className={`ach-badge ${b.earned ? "on" : "off"}`}>
            <span className={`ach-medal ${b.tone}`} aria-hidden="true">
              {b.ico}
              {!b.earned && <span className="ach-lock"><Lock size={11} strokeWidth={2.8} /></span>}
            </span>
            <span className="ach-name">
              {t(`ach_${b.id}_t`)}
              {!b.earned && <span className="sr-only">, {t("ach_locked")}</span>}
            </span>
            <span className="ach-note">{b.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
