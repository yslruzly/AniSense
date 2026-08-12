import React, { useState } from "react";
import { Wheat, ShoppingCart, ArrowLeft } from "lucide-react";
import { useLang } from "../../i18n";
import { UserRole } from "../../types";

// ─── Role Picker ──────────────────────────────────────────────────────────────
export function RoleScreen({ onBack, onSelect, flow }: { onBack: () => void; onSelect: (role: UserRole, flow: "signin" | "signup") => void; flow: "signin" | "signup" }) {
  const [role, setRole] = useState<UserRole>(null);
  const { t } = useLang();

  const roles: { id: UserRole; icon: React.ReactNode; bg: string; title: string; desc: string }[] = [
    { id: "farmer", icon: <Wheat size={28} color="#2e7d4f" />, bg: "#e6f2e9", title: t("role_farmer"), desc: t("role_farmer_desc") },
    { id: "buyer", icon: <ShoppingCart size={28} color="#3a6ea5" />, bg: "#e9eff6", title: t("role_buyer"), desc: t("role_buyer_desc") },
  ];

  return (
    <div className="role-wrap">
      <div className="role-top">
        <button className="role-back-btn" onClick={onBack}>
          <ArrowLeft size={16} color="#fff" />
        </button>
        <div className="role-heading">{t("role_title")}</div>
        <div className="role-sub">{t("role_sub")}</div>
      </div>
      <div className="role-cards">
        {roles.map(r => (
          <div key={r.id} className={`role-card ${role === r.id ? "active" : ""}`} onClick={() => setRole(r.id)}>
            <div className="role-card-ico" style={{ background: r.bg }}>{r.icon}</div>
            <div style={{ flex: 1 }}>
              <div className="role-card-title">{r.title}</div>
              <div className="role-card-desc">{r.desc}</div>
            </div>
            <div className={`role-radio ${role === r.id ? "checked" : ""}`} />
          </div>
        ))}
      </div>
      <button className="role-continue-btn" disabled={!role} onClick={() => role && onSelect(role, "signup")}>
        {t("continue")}
      </button>
    </div>
  );
}
