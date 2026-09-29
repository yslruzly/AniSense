import React, { useState } from "react";
import { haptic } from "../../lib/platform";
import { Wheat, ShoppingCart, ChevronLeft, Check } from "lucide-react";
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
// Tapping a row never navigates on its own; an accidental brush stays
// recoverable. Selection is confirmed with the dock button.
//
// Built like the language step before it: the same header, the same inset
// grouped list with a radio on each row, the same capsule Continue, so the
// two setup steps read as one flow.
export function RoleScreen({ onBack, onSelect, flow }: { onBack: () => void; onSelect: (role: UserRole, flow: "signin" | "signup") => void; flow: "signin" | "signup" }) {
  const [role, setRole] = useState<UserRole>(null);
  const { t } = useLang();

  // Each role on its own coloured tile, as in iOS Settings: the farmer in the
  // app's green, the buyer in the market's amber.
  const roles: { id: "farmer" | "buyer"; icon: React.ReactNode; title: string; desc: string }[] = [
    { id: "farmer", icon: <Wheat size={28} color="#fff" strokeWidth={2.2} />, title: t("role_farmer"), desc: t("role_farmer_desc") },
    { id: "buyer", icon: <ShoppingCart size={27} color="#fff" strokeWidth={2.2} />, title: t("role_buyer"), desc: t("role_buyer_desc") },
  ];
  const picked = roles.find(r => r.id === role);

  // Tapping the row that's already chosen changes nothing, so it gets no
  // haptic: feedback only for something that happened.
  const pick = (id: "farmer" | "buyer") => {
    if (id === role) return;
    haptic.select();
    setRole(id);
  };

  return (
    <div className="a-screen a-setup">
      {/* Three layers, read top to bottom: whose app, what we're asking, who's
          asking. The header takes the height the list leaves, so the stage
          grows on tall phones instead of leaving a dead gap above the list. */}
      <div className="a-inkhead a-rolehead">
        <div className="a-brandrow">
          <span className="a-brandmark"><AniSenseLogo size={26} /></span>
          <span className="a-brandname">AniSense</span>
        </div>
        <div className="a-rolehead-copy">
          <h1 className="a-title on-ink" id="role-title">{t("role_title")}</h1>
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

      <div className="a-scroll a-stagger a-choice-list">
        {/* One card, two rows: a single question with two answers. A radio
            group, so a screen reader says "1 of 2, checked". */}
        <div className="a-choice-group" role="radiogroup" aria-labelledby="role-title">
          {roles.map(r => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={role === r.id}
              className={`a-choice-row ${role === r.id ? "on" : ""}`}
              onClick={() => pick(r.id)}
            >
              <span className={`a-choice-tile ${r.id}`}>{r.icon}</span>
              <span className="a-choice-copy">
                <span className="a-choice-t">{r.title}</span>
                <span className="a-choice-d">{r.desc}</span>
              </span>
              <span className="a-choice-radio"><Check size={18} color="#fff" strokeWidth={3.2} /></span>
            </button>
          ))}
        </div>
      </div>

      {/* Back sits beside Continue, as on the language step, so the whole flow
          moves from the same place. Continue names the choice once one is made:
          the button confirms what will happen, not just that something will.
          Keyed by the choice, so the new wording swaps in with a short blur. */}
      <div className="a-dock">
        <div className="a-dockrow">
          <button className="a-iconbtn on-paper" onClick={onBack} aria-label={t("back")}>
            <ChevronLeft size={28} color="var(--ink)" strokeWidth={2.4} />
          </button>
          <button className="a-btn a-btn-green" disabled={!role} onClick={() => role && onSelect(role, flow)}>
            <span className="a-swap" key={role ?? "none"}>
              {picked ? `${t("role_continue_as")} ${picked.title}` : t("continue")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
