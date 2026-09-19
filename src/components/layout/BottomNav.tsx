import React from "react";
import { haptic } from "../../lib/platform";
import { Home as HomeIcon, Store, TrendingUp, PhilippinePeso, User } from "lucide-react";
import { useLang } from "../../i18n";
import { Screen } from "../../types";

// ─── Bottom Navigation ──────────────────────────────────────────────────────
// A floating glass capsule. One pill sits under the active tab and slides to
// the next, so the eye follows the move instead of watching one highlight
// vanish and another appear. The pill is a CSS transition, so a second tap
// mid-slide simply re-targets it from wherever it is.
export function BottomNav({ active, onNavigate }: { active: Screen; onNavigate: (s: Screen) => void }) {
  const { t } = useLang();
  const items: { id: Screen; lbl: string; Ico: typeof HomeIcon }[] = [
    { id: "home", lbl: t("nav_home"), Ico: HomeIcon },
    { id: "market", lbl: t("nav_market"), Ico: TrendingUp },
    { id: "trade", lbl: t("nav_trade"), Ico: Store },
    { id: "expenses", lbl: t("nav_expenses"), Ico: PhilippinePeso },
    { id: "profile", lbl: t("nav_profile"), Ico: User },
  ];
  const idx = items.findIndex(it => it.id === active);

  return (
    <nav className="bnav">
      <div className="bnav-track" style={{ "--n": items.length } as React.CSSProperties}>
        {/* Hidden on screens that aren't tabs (Weather, Analytics), rather
            than parked on a tab the user isn't on. */}
        <span
          className="bnav-pill"
          aria-hidden="true"
          style={{ transform: `translateX(${Math.max(idx, 0) * 100}%)`, opacity: idx < 0 ? 0 : 1 }}
        />
        {items.map(({ id, lbl, Ico }) => {
          const on = active === id;
          return (
            <button
              key={id}
              className={`ntab ${on ? "on" : ""}`}
              aria-current={on ? "page" : undefined}
              onClick={() => { if (!on) haptic.select(); onNavigate(id); }}
            >
              <span className="ntab-ico"><Ico size={23} strokeWidth={on ? 2.4 : 1.9} /></span>
              <span className="ntab-lbl">{lbl}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
