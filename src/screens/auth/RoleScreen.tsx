import React, { useState } from "react";
import { haptic } from "../../lib/platform";
import { Wheat, ShoppingCart, ArrowLeft, Check } from "lucide-react";
import { AniSenseLogo } from "../../components/AniSenseLogo";
import juanPeek from "../../assets/juan-peek.webp";
import juanPeekBody from "../../assets/juan-peek-body.webp";
import juanPeekHand from "../../assets/juan-peek-hand.webp";
import juanMouthHalf from "../../assets/juan-peek-mouth-half.webp";
import juanMouthShut from "../../assets/juan-peek-mouth-shut.webp";
import buyerMascot from "../../assets/buyer-mascot.webp";
import buyerEyes from "../../assets/buyer-mascot-eyes.webp";
import buyerMouth from "../../assets/buyer-mascot-mouth.webp";
import { MascotStage } from "./MascotStage";
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
      {/* Three layers, read top to bottom: whose app, what we're asking, who's
          asking. The header takes the height the cards leave, so the stage
          grows on tall phones instead of leaving a dead gap above the cards. */}
      <div className="a-inkhead a-rolehead">
        <div className="a-brandrow">
          <span className="a-brandmark"><AniSenseLogo size={26} /></span>
          <span className="a-brandname">AniSense</span>
        </div>
        <div className="a-rolehead-copy">
          <h1 className="a-title on-ink">{t("role_title")}</h1>
          <p className="a-sub on-ink">{t("role_pick_one")}</p>
        </div>

        {/* Decorative stage. Juan by default and for farmers; picking Buyer
            swaps in the buyer mascot, so the header answers the tap. Both stay
            mounted and crossfade, so switching never reloads an image. */}
        <MascotStage
          figures={[{ id: "farmer", src: juanPeek, wave: { body: juanPeekBody, hand: juanPeekHand }, talk: { half: juanMouthHalf, shut: juanMouthShut } }, { id: "buyer", src: buyerMascot, face: { eyes: buyerEyes, mouth: buyerMouth } }]}
          active={role === "buyer" ? "buyer" : "farmer"}
          say={role === "buyer"
            ? { key: "buyer", title: t("role_say_buyer"), emoji: "🥬", sub: t("role_say_buyer_sub") }
            : role === "farmer"
              ? { key: "farmer", title: t("role_say_farmer"), emoji: "🌾", sub: t("role_say_farmer_sub") }
              : { key: "hi", title: `${t("hi")}!`, emoji: "👋", sub: t("role_say_hi_sub") }}
        />
      </div>

      <div className="a-scroll a-stagger a-rolelist">
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

      {/* Back sits beside Continue, as on the language step, so the whole flow
          moves from the same place. Continue names the choice once one is made:
          the button confirms what will happen, not just that something will. */}
      <div className="a-dock">
        <div className="a-dockrow">
          <button className="a-iconbtn on-paper" onClick={onBack} aria-label={t("back")}>
            <ArrowLeft size={24} color="var(--ink)" strokeWidth={2.4} />
          </button>
          <button className="a-btn a-btn-green" disabled={!role} onClick={() => role && onSelect(role, flow)}>
            {picked ? `${t("role_continue_as")} ${picked.title}` : t("continue")}
          </button>
        </div>
      </div>
    </div>
  );
}
