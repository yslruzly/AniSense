import React, { useState } from "react";
import { haptic } from "../../lib/platform";
import { Wheat, ShoppingCart, ArrowLeft, Check } from "lucide-react";
import { useLang } from "../../i18n";
import { UserRole } from "../../types";

// ─── Role Picker ──────────────────────────────────────────────────────────────
// Tapping a card never navigates on its own; an accidental brush stays
// recoverable. Selection is confirmed with the dock button.
export function RoleScreen({ onBack, onSelect, flow }: { onBack: () => void; onSelect: (role: UserRole, flow: "signin" | "signup") => void; flow: "signin" | "signup" }) {
  const [role, setRole] = useState<UserRole>(null);
  const { t } = useLang();

  const roles: { id: UserRole; icon: React.ReactNode; title: string; desc: string }[] = [
    { id: "farmer", icon: <Wheat size={32} color="#0B6B41" />, title: t("role_farmer"), desc: t("role_farmer_desc") },
    { id: "buyer", icon: <ShoppingCart size={32} color="#0B6B41" />, title: t("role_buyer"), desc: t("role_buyer_desc") },
  ];

  return (
    <div className="a-screen">
      <div className="a-inkhead">
        <button className="a-iconbtn" onClick={onBack} aria-label={t("back")}>
          <ArrowLeft size={24} color="#fff" strokeWidth={2.4} />
        </button>
        <h1 className="a-title on-ink" style={{ marginTop: 20 }}>{t("role_title")}</h1>
        <p className="a-sub on-ink">{t("role_pick_one")}</p>
      </div>

      <div className="a-scroll a-stagger" style={{ paddingTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
        {roles.map(r => (
          <button
            key={r.id}
            className={`a-role ${role === r.id ? "on" : ""}`}
            aria-pressed={role === r.id}
            onClick={() => { haptic.select(); setRole(r.id); }}
          >
            <span className="a-role-ico">{r.icon}</span>
            <span style={{ flex: 1 }}>
              <span className="a-role-t">{r.title}</span>
              <span className="a-role-d">{r.desc}</span>
            </span>
            <span className="a-tick"><Check size={17} color="#fff" strokeWidth={3.4} /></span>
          </button>
        ))}
      </div>

      <div className="a-dock">
        <button className="a-btn a-btn-green" disabled={!role} onClick={() => role && onSelect(role, flow)}>
          {t("continue")}
        </button>
      </div>
    </div>
  );
}
