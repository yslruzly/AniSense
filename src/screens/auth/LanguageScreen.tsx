import React, { useState } from "react";
import { haptic } from "../../lib/platform";
import { ChevronLeft, Check } from "lucide-react";
import { AniSenseLogo } from "../../components/brand/AniSenseLogo";
import juanPeek from "../../assets/juan-peek.webp";
import juanPeekBody from "../../assets/juan-peek-body.webp";
import juanPeekHand from "../../assets/juan-peek-hand.webp";
import juanMouthHalf from "../../assets/juan-peek-mouth-half.webp";
import juanMouthShut from "../../assets/juan-peek-mouth-shut.webp";
import { MascotStage } from "./MascotStage";
import { FlagPH, FlagUS } from "../../components/icons/Flags";
import { useLang, Lang } from "../../i18n";

// ─── Language Gate ────────────────────────────────────────────────────────────
// The first step of signing in or signing up, ahead of the role picker. Language
// used to live inside Profile, which meant a Tagalog reader had to navigate an
// English app to find the Tagalog switch.
//
// Laid out the way Apple lays out a setup step: one question as a large title,
// the answers as one inset grouped list, and one prominent button. The ink
// header and Juan stay, so it still reads as the start of the same flow as the
// role picker after it.
export function LanguageScreen({ onDone, onBack }: { onDone: () => void; onBack?: () => void }) {
  const { t, lang, setLang } = useLang();
  const [choice, setChoice] = useState<Lang>(lang);

  // The flag is the fastest way in: someone who reads little English still
  // recognises their own flag, and the native name ("Tagalog") is written the
  // same in both languages.
  const options: { id: Lang; title: string; desc: string; flag: React.ReactNode }[] = [
    { id: "tl", title: t("lang_tl"), desc: t("lang_tl_desc"), flag: <FlagPH /> },
    { id: "en", title: t("lang_en"), desc: t("lang_en_desc"), flag: <FlagUS /> },
  ];

  // The app switches language on the tap, so the choice is previewed on this
  // very screen. Tapping the row that's already chosen changes nothing, so it
  // gets no haptic: feedback only for something that happened.
  const pick = (id: Lang) => {
    if (id === choice) return;
    haptic.select();
    setChoice(id);
    setLang(id);
  };

  const confirm = () => {
    setLang(choice);
    onDone();
  };

  return (
    <div className="a-screen a-lang a-setup">
      {/* Same ink header as the role step, so the two setup screens read as
          one flow. Juan greets in whichever language is picked: the header
          answers the tap in the language the app is about to use. */}
      <div className="a-inkhead a-rolehead">
        <div className="a-brandrow">
          <span className="a-brandmark"><AniSenseLogo size={26} /></span>
          <span className="a-brandname">AniSense</span>
        </div>
        {/* Keyed by language, so when the app switches the heading swaps
            with a short blur: one line turning into the other, rather than
            text jumping in place. */}
        <div className="a-rolehead-copy a-swap" key={lang}>
          <h1 className="a-title on-ink" id="lang-title">{t("lang_title")}</h1>
          <p className="a-sub on-ink">{t("lang_sub")}</p>
        </div>

        {/* Written in the language it greets in, not through t(): the line is
            a preview of the choice, so it has to be in that language. */}
        <MascotStage
          figures={[{ id: "farmer", src: juanPeek, wave: { body: juanPeekBody, hand: juanPeekHand }, talk: { half: juanMouthHalf, shut: juanMouthShut } }]}
          active="farmer"
          say={choice === "tl"
            ? { key: "tl", title: "Kumusta!", emoji: "👋", sub: "Ako si Juan, ang gabay mo." }
            : { key: "en", title: "Hello!", emoji: "👋", sub: "I'm Juan, your guide." }}
        />
      </div>

      <div className="a-scroll a-stagger a-choice-list">
        {/* One card, two rows: a single question with two answers, rather
            than two separate things to weigh. A radio group, so a screen
            reader says "1 of 2, checked". */}
        <div className="a-choice-group" role="radiogroup" aria-labelledby="lang-title">
          {options.map(o => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={choice === o.id}
              className={`a-choice-row ${choice === o.id ? "on" : ""}`}
              onClick={() => pick(o.id)}
            >
              <span className="a-lang-flag">{o.flag}</span>
              <span className="a-choice-copy">
                <span className="a-choice-t">{o.title}</span>
                <span className="a-choice-d">{o.desc}</span>
              </span>
              <span className="a-choice-radio"><Check size={18} color="#fff" strokeWidth={3.2} /></span>
            </button>
          ))}
        </div>
        <p className="a-choice-foot"><span className="a-swap" key={lang}>{t("lang_change_later")}</span></p>
      </div>

      {/* Back lives in the dock, beside Continue: both steps of the decision sit
          in the thumb zone, and Back stays a quiet round button so Continue
          reads as the primary action. */}
      <div className="a-dock">
        <div className="a-dockrow">
          {onBack && (
            <button className="a-iconbtn on-paper" onClick={onBack} aria-label={t("back")}>
              <ChevronLeft size={28} color="var(--ink)" strokeWidth={2.4} />
            </button>
          )}
          <button className="a-btn a-btn-green" onClick={confirm}>
            <span className="a-swap" key={lang}>{t("continue")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
