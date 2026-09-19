import React, { useState } from "react";
import { haptic } from "../../lib/platform";
import { Wheat, ShoppingCart, ArrowLeft, Check } from "lucide-react";
import { AniSenseLogo } from "../../components/AniSenseLogo";
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
  const picked = roles.find(r => r.id === role);

  return (
    <div className="a-screen">
      {/* Brand at the top, question at the bottom: the title sits right above
          the cards it asks about, not stranded under a block of empty ink. */}
      <div className="a-inkhead a-rolehead" style={{ minHeight: 300 }}>
        <div className="a-brandrow">
          <span className="a-brandmark"><AniSenseLogo size={26} /></span>
          <span className="a-brandname">AniSense</span>
        </div>
        <div>
          <h1 className="a-title on-ink">{t("role_title")}</h1>
          <p className="a-sub on-ink">{t("role_pick_one")}</p>
        </div>
      </div>

      <div className="a-scroll a-stagger" style={{ paddingTop: 22, paddingBottom: 22, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ flex: 1 }} />
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
        <div style={{ flex: 1 }} />
      </div>

      {/* Back sits beside Continue, as on the language step, so the whole flow
          moves from the same place. Continue names the choice once one is made:
          the button confirms what will happen, not just that something will. */}
      <div className="a-dock a-dockrow">
        <button className="a-iconbtn on-paper" onClick={onBack} aria-label={t("back")}>
          <ArrowLeft size={24} color="var(--ink)" strokeWidth={2.4} />
        </button>
        <button className="a-btn a-btn-green" disabled={!role} onClick={() => role && onSelect(role, flow)}>
          {picked ? `${t("role_continue_as")} ${picked.title}` : t("continue")}
        </button>
      </div>
    </div>
  );
}
