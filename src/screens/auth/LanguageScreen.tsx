import { useState } from "react";
import { haptic } from "../../lib/platform";
import { ArrowLeft, Check } from "lucide-react";
import { AniSenseLogo } from "../../components/AniSenseLogo";
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
      <div className="a-scroll a-stagger" style={{ paddingTop: 44 }}>
        <div>
          {onBack && (
            <button className="a-iconbtn on-paper" onClick={onBack} aria-label={t("back")} style={{ marginBottom: 22 }}>
              <ArrowLeft size={24} color="var(--ink)" strokeWidth={2.4} />
            </button>
          )}
          <div className="a-langmark"><AniSenseLogo size={44} /></div>
        </div>
        <div>
          <h1 className="a-title">{t("lang_title")}</h1>
          <p className="a-sub">{t("lang_sub")}</p>
        </div>
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 14 }}>
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
        </div>
        <p className="a-help" style={{ marginTop: 20 }}>{t("lang_change_later")}</p>
      </div>
      <div className="a-dock">
        <button className="a-btn a-btn-green" onClick={confirm}>{t("continue")}</button>
      </div>
    </div>
  );
}
