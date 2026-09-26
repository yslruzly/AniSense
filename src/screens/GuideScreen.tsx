import React, { useState } from "react";
import {
  BookOpen, PlayCircle, ChevronRight, Sprout, BellPlus, CalendarPlus,
  HandCoins, TrendingUp, CloudSun, PhilippinePeso, IdCard, Lightbulb,
} from "lucide-react";
import { useLang } from "../i18n";
import { haptic } from "../lib/platform";
import { Hdr } from "../components/layout/Hdr";
import { AutoHeight } from "../components/ui/AutoHeight";
import mascotBody from "../assets/mascot-wave-body.webp";
import mascotHand from "../assets/mascot-wave-hand.webp";
import mascotEyes from "../assets/mascot-wave-eyes.webp";

// ─── How to use AniSense ──────────────────────────────────────────────────────
// The walkthrough runs once; this is where it lives afterwards. Eight jobs a
// farmer actually does in the app, each as numbered steps that name the real
// buttons — "Post a harvest", "Post Now!" — so the page can be followed with
// a thumb rather than interpreted.
//
// One topic open at a time. A farmer arrives with one question, and a page
// that answers eight at once is a page they have to read to use.

type Topic = { id: string; ico: React.ReactNode; steps: number; note?: boolean };

const TOPICS: Topic[] = [
  { id: "post",     ico: <Sprout size={21} strokeWidth={2.2} />,         steps: 5, note: true },
  { id: "alerts",   ico: <BellPlus size={21} strokeWidth={2.2} />,       steps: 4 },
  { id: "tracker",  ico: <CalendarPlus size={21} strokeWidth={2.2} />,   steps: 4 },
  { id: "sale",     ico: <HandCoins size={21} strokeWidth={2.2} />,      steps: 4, note: true },
  { id: "prices",   ico: <TrendingUp size={21} strokeWidth={2.2} />,     steps: 4, note: true },
  { id: "expenses", ico: <PhilippinePeso size={21} strokeWidth={2.2} />, steps: 3 },
  { id: "weather",  ico: <CloudSun size={21} strokeWidth={2.2} />,       steps: 3 },
  { id: "profile",  ico: <IdCard size={21} strokeWidth={2.2} />,         steps: 4 },
];

export function GuideScreen({ onBack, onReplay }: { onBack: () => void; onReplay: () => void }) {
  const { t } = useLang();
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (id: string) => {
    haptic.select();
    setOpen(cur => (cur === id ? null : id));
  };

  return (
    <div className="screen">
      <Hdr icon={<BookOpen size={20} color="var(--tanim)" />} title={t("gd_title")} sub={t("gd_sub")} onBack={onBack} />
      <div className="scroll screen-enter">

        {/* The tour, on demand. It is the same one the app ran on the first
            launch, so this is a second chance rather than a different lesson. */}
        <section className="gd-intro">
          <div className="gd-intro-copy">
            <h2 className="gd-intro-t">{t("gd_replay_t")}</h2>
            <p className="gd-intro-s">{t("gd_replay_s")}</p>
          </div>
          {/* The one who gives the tour, offering to give it again. He waves
              once as the page opens and blinks after; his waist is tucked
              behind the button, the way he leans over the tour's cards. */}
          <div className="gd-mascot" aria-hidden="true">
            <img className="tm-body" src={mascotBody} alt="" width={420} height={435} decoding="async" />
            <img className="tm-eyes" src={mascotEyes} alt="" width={420} height={435} decoding="async" />
            <img className="tm-hand" src={mascotHand} alt="" width={420} height={435} decoding="async" />
          </div>
          <button className="gd-replay" onClick={() => { haptic.select(); onReplay(); }}>
            <PlayCircle size={21} strokeWidth={2.4} aria-hidden="true" /> {t("gd_replay_btn")}
          </button>
        </section>

        <h2 className="hm-title hm-out">{t("gd_topics")}</h2>

        <div className="gd-list">
          {TOPICS.map(topic => {
            const on = open === topic.id;
            return (
              <section key={topic.id} className={`gd-item ${on ? "on" : ""}`}>
                <button className="gd-head" onClick={() => toggle(topic.id)} aria-expanded={on}>
                  <span className="gd-ico">{topic.ico}</span>
                  <span className="gd-head-body">
                    <span className="gd-head-t">{t(`gd_${topic.id}_t`)}</span>
                    <span className="gd-head-s">{t(`gd_${topic.id}_s`)}</span>
                  </span>
                  <ChevronRight className="gd-chev" size={20} strokeWidth={2.4} aria-hidden="true" />
                </button>
                <AutoHeight>
                  {on && (
                    <div className="gd-steps">
                      {Array.from({ length: topic.steps }, (_, n) => (
                        <div className="gd-step" key={n}>
                          <span className="gd-n">{n + 1}</span>
                          <span className="gd-step-b">{t(`gd_${topic.id}_${n + 1}`)}</span>
                        </div>
                      ))}
                      {topic.note && (
                        <p className="gd-note">
                          <Lightbulb size={18} strokeWidth={2.2} aria-hidden="true" />
                          <span>{t(`gd_${topic.id}_note`)}</span>
                        </p>
                      )}
                    </div>
                  )}
                </AutoHeight>
              </section>
            );
          })}
        </div>

        <p className="version-txt">{t("gd_foot")}</p>
      </div>
    </div>
  );
}
