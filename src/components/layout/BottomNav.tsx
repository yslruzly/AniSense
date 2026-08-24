import React from "react";
import { haptic } from "../../lib/platform";
import { Home as HomeIcon, Store, TrendingUp, PhilippinePeso, User } from "lucide-react";
import { useLang } from "../../i18n";
import { Screen } from "../../types";

// ─── Bottom Navigation ──────────────────────────────────────────────────────
export function BottomNav({ active, onNavigate }: { active: Screen; onNavigate: (s: Screen) => void }) {
  const { t } = useLang();
  const items: { id: Screen; lbl: string; ico: React.ReactNode }[] = [
    { id: "home", lbl: t("nav_home"), ico: <HomeIcon size={22} /> },
    { id: "market", lbl: t("nav_market"), ico: <TrendingUp size={22} /> },
    { id: "trade", lbl: t("nav_trade"), ico: <Store size={22} /> },
    { id: "expenses", lbl: t("nav_expenses"), ico: <PhilippinePeso size={22} /> },
    { id: "profile", lbl: t("nav_profile"), ico: <User size={22} /> },
  ];
  return (
    <div className="bnav">
      {items.map(it => (
        <button key={it.id} className={`ntab ${active === it.id ? "on" : ""}`} onClick={() => { haptic.select(); onNavigate(it.id); }}>
          <span className="ntab-ico">{it.ico}</span>
          <span className="ntab-lbl">{it.lbl}</span>
        </button>
      ))}
    </div>
  );
}
