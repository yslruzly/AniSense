import { useState } from "react";
import { haptic } from "../../lib/platform";
import { ArrowLeft, Check } from "lucide-react";
import { AniSenseLogo } from "../../components/AniSenseLogo";
import juanPeek from "../../assets/juan-peek.webp";
import { useLang, Lang } from "../../i18n";

// ─── Language Gate ────────────────────────────────────────────────────────────
// The first step of signing in or signing up, ahead of the role picker. Language
// used to live inside Profile, which meant a Tagalog reader had to navigate an
// English app to find the Tagalog switch.
export function LanguageScreen({ onDone, onBack }: { onDone: () => void; onBack?: () => void }) {
  const { t, lang, setLang } = useLang();
  const [choice, setChoice] = useState<Lang>(lang);

  const options: { id: Lang; title: string; desc: string }[] = [
    { id: "tl", title: t("lang_tl"), desc: t("lang_tl_desc") },
    { id: "en", title: t("lang_en"), desc: t("lang_en_desc") },
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

        <div className="a-rolestage" data-role="farmer" aria-hidden="true">
          <span className="a-rolestage-bubble" key={choice}>{choice === "tl" ? "Kumusta!" : "Hello!"}</span>
          <img className="a-rolestage-img is-farmer" src={juanPeek} alt="" />
        </div>
      </div>

      <div className="a-scroll a-stagger a-rolelist">
        {options.map(o => (
          <button
            key={o.id}
            className={`a-pick ${choice === o.id ? "on" : ""}`}
            aria-pressed={choice === o.id}
            onClick={() => { haptic.select(); setChoice(o.id); setLang(o.id); }}
          >
            <span>
              <span className="a-pick-t" style={{ display: "block" }}>{o.title}</span>
              <span className="a-pick-d" style={{ display: "block" }}>{o.desc}</span>
            </span>
            <span className="a-tick"><Check size={17} color="#fff" strokeWidth={3.4} /></span>
          </button>
        ))}
        <p className="a-help" style={{ marginTop: 2 }}>{t("lang_change_later")}</p>
      </div>
      {/* Back lives in the dock, beside Continue: both steps of the decision sit
          in the thumb zone, and Back stays a quiet square so Continue reads as
          the primary action. */}
      <div className="a-dock a-dockrow">
        {onBack && (
          <button className="a-iconbtn on-paper" onClick={onBack} aria-label={t("back")}>
            <ArrowLeft size={24} color="var(--ink)" strokeWidth={2.4} />
          </button>
        )}
        <button className="a-btn a-btn-green" onClick={confirm}>{t("continue")}</button>
      </div>
    </div>
  );
}
