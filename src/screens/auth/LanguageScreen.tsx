import React, { useState } from "react";
import { haptic } from "../../lib/platform";
import { ArrowLeft, Check } from "lucide-react";
import { AniSenseLogo } from "../../components/AniSenseLogo";
import juanPeek from "../../assets/juan-peek.webp";
import { MascotStage } from "./MascotStage";
import { FlagPH, FlagUS } from "../../components/Flags";
import { useLang, Lang } from "../../i18n";

// ─── Language Gate ────────────────────────────────────────────────────────────
// The first step of signing in or signing up, ahead of the role picker. Language
// used to live inside Profile, which meant a Tagalog reader had to navigate an
// English app to find the Tagalog switch.
export function LanguageScreen({ onDone, onBack }: { onDone: () => void; onBack?: () => void }) {
  const { t, lang, setLang } = useLang();
  const [choice, setChoice] = useState<Lang>(lang);

  // The flag is the fastest way in: someone who reads little English still
  // recognises their own flag, and the native name ("Tagalog") is written the
  // same in both languages.
  const options: { id: Lang; title: string; desc: string; note: string; flag: React.ReactNode }[] = [
    { id: "tl", title: t("lang_tl"), desc: t("lang_tl_desc"), note: "PH", flag: <FlagPH /> },
    { id: "en", title: t("lang_en"), desc: t("lang_en_desc"), note: "EN", flag: <FlagUS /> },
  ];

  const confirm = () => {
    setLang(choice);
    onDone();
  };

  return (
    <div className="a-screen">
      {/* Same ink header as the role step, so the two setup screens read as
          one flow. Juan greets in whichever language is picked: the header
          answers the tap in the language the app is about to use. */}
      <div className="a-inkhead a-rolehead">
        <div className="a-brandrow">
          <span className="a-brandmark"><AniSenseLogo size={26} /></span>
          <span className="a-brandname">AniSense</span>
        </div>
        <div className="a-rolehead-copy">
          <h1 className="a-title on-ink">{t("lang_title")}</h1>
          <p className="a-sub on-ink">{t("lang_sub")}</p>
        </div>

        {/* Written in the language it greets in, not through t(): the line is
            a preview of the choice, so it has to be in that language. */}
        <MascotStage
          figures={[{ id: "farmer", src: juanPeek }]}
          active="farmer"
          say={choice === "tl"
            ? { key: "tl", title: "Kumusta!", emoji: "👋", sub: "Ako si Juan, ang gabay mo." }
            : { key: "en", title: "Hello!", emoji: "👋", sub: "I'm Juan, your guide." }}
        />
      </div>

      <div className="a-scroll a-stagger a-rolelist">
        {options.map(o => (
          <button
            key={o.id}
            className={`a-pick ${choice === o.id ? "on" : ""}`}
            aria-pressed={choice === o.id}
            onClick={() => { haptic.select(); setChoice(o.id); setLang(o.id); }}
          >
            <span className="a-pick-flag">{o.flag}</span>
            <span className="a-pick-copy">
              <span className="a-pick-t">{o.title} <small>{o.note}</small></span>
              <span className="a-pick-d">{o.desc}</span>
            </span>
            <span className="a-tick"><Check size={19} color="#fff" strokeWidth={3.4} /></span>
          </button>
        ))}
        <p className="a-help" style={{ marginTop: 2 }}>{t("lang_change_later")}</p>
      </div>
      {/* Back lives in the dock, beside Continue: both steps of the decision sit
          in the thumb zone, and Back stays a quiet square so Continue reads as
          the primary action. */}
      <div className="a-dock">
        <div className="a-dockrow">
          {onBack && (
            <button className="a-iconbtn on-paper" onClick={onBack} aria-label={t("back")}>
              <ArrowLeft size={24} color="var(--ink)" strokeWidth={2.4} />
            </button>
          )}
          <button className="a-btn a-btn-green" onClick={confirm}>{t("continue")}</button>
        </div>
      </div>
    </div>
  );
}
