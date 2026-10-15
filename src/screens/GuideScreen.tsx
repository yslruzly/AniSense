import React, { useRef, useState } from "react";
import {
  BookOpen, PlayCircle, ChevronDown, Sprout, BellPlus, CalendarPlus,
  HandCoins, TrendingUp, CloudSun, PhilippinePeso, IdCard, Lightbulb,
  Search, ShoppingCart, ReceiptText, UserRound, Package,
} from "lucide-react";
import { useLang } from "../i18n";
import { haptic } from "../lib/platform";
import { Hdr } from "../components/layout/Hdr";
import { AutoHeight } from "../components/ui/AutoHeight";
import { useViewer } from "../store/viewer";
import mascotBody from "../assets/mascot-wave-body.webp";
import mascotHand from "../assets/mascot-wave-hand.webp";
import mascotEyes from "../assets/mascot-wave-eyes.webp";
import buyerBody from "../assets/buyer-wave-body.webp";
import buyerHand from "../assets/buyer-wave-hand.webp";
import buyerEyes from "../assets/buyer-wave-eyes.webp";

// ─── How to use AniSense ──────────────────────────────────────────────────────
// The walkthrough runs once; this is where it lives afterwards. Eight jobs
// the reader actually does in the app — a farmer's, or a buyer's — each as
// numbered steps that name the real buttons ("Post a harvest", "Confirm
// Order"), so the page can be followed with a thumb rather than interpreted.
//
// Organised the way the reader thinks of the work: the eight jobs sorted
// under a few plain names (selling, prices and weather, the farm), so the
// eye finds the right group first and then the one job in it, instead of
// reading eight rows. One topic open at a time: a farmer arrives with one
// question, and a page that answers eight at once is a page they have to
// read to use. The steps are a numbered path, joined by a line, so the order
// is something you see, not something you count.

type Topic = { id: string; ico: React.ReactNode; steps: number; note?: boolean };
type Group = { id: string; topics: Topic[] };

const I = { size: 22, strokeWidth: 2.2 } as const;

const FARMER_GROUPS: Group[] = [
  // Selling: putting a harvest up, writing down what it brought, and the
  // number buyers call.
  { id: "sell", topics: [
    { id: "post",     ico: <Sprout {...I} />,         steps: 5, note: true },
    { id: "sale",     ico: <HandCoins {...I} />,      steps: 4, note: true },
    { id: "profile",  ico: <IdCard {...I} />,         steps: 4 },
  ] },
  // Knowing when: the prices, the alert that waits for one, the weather.
  { id: "market", topics: [
    { id: "prices",   ico: <TrendingUp {...I} />,     steps: 4, note: true },
    { id: "alerts",   ico: <BellPlus {...I} />,       steps: 4 },
    { id: "weather",  ico: <CloudSun {...I} />,       steps: 3 },
  ] },
  // The farm's own records: what is planted, what it cost.
  { id: "farm", topics: [
    { id: "tracker",  ico: <CalendarPlus {...I} />,   steps: 4 },
    { id: "expenses", ico: <PhilippinePeso {...I} />, steps: 3 },
  ] },
];

// A buyer's eight in two: buying, in the order they meet it (find it, order
// it, keep the receipt, look back), then what is good to know around it.
const BUYER_GROUPS: Group[] = [
  { id: "buy", topics: [
    { id: "find",    ico: <Search {...I} />,       steps: 3 },
    { id: "order",   ico: <ShoppingCart {...I} />, steps: 4, note: true },
    { id: "receipt", ico: <ReceiptText {...I} />,  steps: 3 },
    { id: "history", ico: <Package {...I} />,      steps: 3 },
  ] },
  { id: "know", topics: [
    { id: "farmer",  ico: <UserRound {...I} />,    steps: 4 },
    { id: "prices",  ico: <TrendingUp {...I} />,   steps: 4, note: true },
    { id: "weather", ico: <CloudSun {...I} />,     steps: 2 },
    { id: "profile", ico: <IdCard {...I} />,       steps: 4 },
  ] },
];

const reduceMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function GuideScreen({ onBack, onReplay }: { onBack: () => void; onReplay: () => void }) {
  const { t } = useLang();
  const buyer = useViewer().role === "buyer";
  const GROUPS = buyer ? BUYER_GROUPS : FARMER_GROUPS;
  // gd_post_t for a farmer, gdb_order_t for a buyer.
  const k = buyer ? "gdb_" : "gd_";
  const [open, setOpen] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  // Opening a topic low on the page would put its steps under the fold, and
  // a reader who does not know to scroll thinks nothing happened. Once it has
  // opened, bring it up just enough for the steps to show, never so far that
  // its own name leaves the top.
  const reveal = (id: string) => {
    window.setTimeout(() => {
      const box = scroller.current, item = box?.querySelector<HTMLElement>(`[data-topic="${id}"]`);
      if (!box || !item) return;
      const b = box.getBoundingClientRect(), r = item.getBoundingClientRect();
      const under = r.bottom - (b.bottom - 96);
      if (under <= 0) return;
      const by = Math.min(under, r.top - b.top - 12);
      if (by > 0) box.scrollBy({ top: by, behavior: reduceMotion() ? "auto" : "smooth" });
    }, 260);
  };

  const toggle = (id: string) => {
    haptic.select();
    const opening = open !== id;
    setOpen(opening ? id : null);
    if (opening) reveal(id);
  };

  return (
    <div className="screen">
      <Hdr icon={<BookOpen size={20} color="var(--tanim)" />} title={t("gd_title")} sub={t("gd_sub")} onBack={onBack} />
      <div className="scroll screen-enter" ref={scroller}>

        {/* The tour, on demand, in AniSense green: the one who gives it
            waving at the right, and one gold button. It is the same tour the
            app ran on the first launch, so this is a second chance rather
            than a different lesson. */}
        <section className="gd-intro" aria-labelledby="gd-intro-t">
          <div className="gd-intro-copy">
            <h2 className="gd-intro-t" id="gd-intro-t">{t("gd_replay_t")}</h2>
            <p className="gd-intro-s">{t("gd_replay_s")}</p>
          </div>
          {/* The farmer for a farmer, the buyer for a buyer, as on the tour's
              first card. A wave as the page opens, a blink after; the waist
              is tucked behind the button, the way they lean over the tour's cards. */}
          <div className={`gd-mascot${buyer ? " buyer" : ""}`} aria-hidden="true">
            <img className="tm-body" src={buyer ? buyerBody : mascotBody} alt="" width={420} height={435} decoding="async" />
            <img className="tm-eyes" src={buyer ? buyerEyes : mascotEyes} alt="" width={420} height={435} decoding="async" />
            <img className="tm-hand" src={buyer ? buyerHand : mascotHand} alt="" width={420} height={435} decoding="async" />
          </div>
          <button className="gd-replay" onClick={() => { haptic.select(); onReplay(); }}>
            <PlayCircle size={22} strokeWidth={2.4} aria-hidden="true" /> {t("gd_replay_btn")}
          </button>
        </section>

        <h2 className="gd-ask">{t("gd_topics")}</h2>

        {GROUPS.map(g => (
          <section key={g.id} className="gd-group" aria-labelledby={`gd-g-${g.id}`}>
            <h3 className="gd-group-t" id={`gd-g-${g.id}`}>{t(`gd_group_${g.id}`)}</h3>
            {/* One white card per group, a row each, a hairline between. */}
            <div className="gd-list">
              {g.topics.map(topic => {
                const on = open === topic.id;
                const panel = `gd-p-${topic.id}`, head = `gd-h-${topic.id}`;
                return (
                  <div key={topic.id} className={`gd-item${on ? " on" : ""}`} data-topic={topic.id}>
                    <button className="gd-head" id={head} onClick={() => toggle(topic.id)} aria-expanded={on} aria-controls={panel}>
                      <span className="gd-ico" aria-hidden="true">{topic.ico}</span>
                      <span className="gd-head-body">
                        <span className="gd-head-t">{t(`${k}${topic.id}_t`)}</span>
                        <span className="gd-head-s">{t(`${k}${topic.id}_s`)}</span>
                      </span>
                      <span className="gd-chev" aria-hidden="true"><ChevronDown size={20} strokeWidth={2.6} /></span>
                    </button>
                    <AutoHeight>
                      {on && (
                        <div className="gd-body" id={panel} role="region" aria-labelledby={head}>
                          {/* The steps as a path: a numbered stop for each,
                              a line joining them, the words beside. */}
                          <ol className="gd-steps">
                            {Array.from({ length: topic.steps }, (_, n) => (
                              <li className="gd-step" key={n}>
                                <span className="gd-n" aria-hidden="true">{n + 1}</span>
                                <span className="gd-step-b">{t(`${k}${topic.id}_${n + 1}`)}</span>
                              </li>
                            ))}
                          </ol>
                          {topic.note && (
                            <div className="gd-note">
                              <span className="gd-note-ico" aria-hidden="true"><Lightbulb size={18} strokeWidth={2.4} /></span>
                              <p className="gd-note-txt">
                                <b className="gd-note-k">{t("gd_tip")}</b>{" "}
                                {t(`${k}${topic.id}_note`)}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </AutoHeight>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <p className="version-txt">{t("gd_foot")}</p>
      </div>
    </div>
  );
}
