import React from "react";
import { Home as HomeIcon, LayoutDashboard, ShoppingCart, Banknote, User } from "lucide-react";
import { useLang } from "../../i18n";
import { Screen } from "../../types";

// ─── Bottom Navigation ──────────────────────────────────────────────────────
export function BottomNav({ active, onNavigate }: { active: Screen; onNavigate: (s: Screen) => void }) {
  const { t } = useLang();
  const items: { id: Screen; lbl: string; ico: React.ReactNode }[] = [
    { id: "home", lbl: t("nav_home"), ico: <HomeIcon size={22} /> },
    { id: "market", lbl: t("nav_market"), ico: <LayoutDashboard size={22} /> },
    { id: "trade", lbl: t("nav_trade"), ico: <ShoppingCart size={22} /> },
    { id: "expenses", lbl: t("nav_expenses"), ico: <Banknote size={22} /> },
    { id: "profile", lbl: t("nav_profile"), ico: <User size={22} /> },
  ];
  return (
    <div className="bnav">
      {items.map(it => (
        <button key={it.id} className={`ntab ${active === it.id ? "on" : ""}`} onClick={() => onNavigate(it.id)}>
          <span className="ntab-ico">{it.ico}</span>
          <span className="ntab-lbl">{it.lbl}</span>
        </button>
      ))}
    </div>
  );
}
