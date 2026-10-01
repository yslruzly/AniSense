import React, { useState } from "react";
import {
  ShieldCheck, Check, ChevronRight, UserRound, ClipboardList, Target, Eye, LockKeyhole,
  Clock, Scale, Trash2, Baby, RefreshCw, Mail,
} from "lucide-react";
import { useLang } from "../i18n";
import { haptic } from "../lib/platform";
import { AutoHeight } from "./ui/AutoHeight";
import { PRIVACY, fillPrivacy, privacyDate } from "../data/privacyPolicy";

// ─── Privacy policy ───────────────────────────────────────────────────────────
// The policy, in whichever language the app is set to. Shown on the Privacy
// screen (Profile) and in a sheet at sign-up. It ships inside the app, so it
// can be read without signal.
//
// A policy is twelve sections of text, and nobody reads twelve sections. So
// it is laid out to be understood at a glance and read in parts:
//   · the five promises that matter most, up top, each with a green tick
//   · every other section as a row that opens, one at a time, like the
//     topics on the How to use page: a list of questions, not a wall of text
//   · one button at the foot to write to us
// Nothing is left out; it is all one tap away.

const ICON: Record<string, React.ReactNode> = {
  who: <UserRound size={20} strokeWidth={2.2} />,
  collect: <ClipboardList size={20} strokeWidth={2.2} />,
  why: <Target size={20} strokeWidth={2.2} />,
  see: <Eye size={20} strokeWidth={2.2} />,
  where: <LockKeyhole size={20} strokeWidth={2.2} />,
  keep: <Clock size={20} strokeWidth={2.2} />,
  rights: <Scale size={20} strokeWidth={2.2} />,
  delete: <Trash2 size={20} strokeWidth={2.2} />,
  children: <Baby size={20} strokeWidth={2.2} />,
  changes: <RefreshCw size={20} strokeWidth={2.2} />,
  contact: <Mail size={20} strokeWidth={2.2} />,
};

// The support address is the one thing in the text a reader acts on, so it is
// a real link wherever it appears.
function withEmail(text: string): React.ReactNode {
  const parts = fillPrivacy(text).split(PRIVACY.email);
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {part}
      {i < parts.length - 1 && <a href={`mailto:${PRIVACY.email}`}>{PRIVACY.email}</a>}
    </React.Fragment>
  ));
}

export function PrivacyPolicy() {
  const { t, lang } = useLang();
  // One section open at a time: a reader arrives with one question.
  const [open, setOpen] = useState<string | null>(null);
  const [short, ...rest] = PRIVACY.sections;
  const promises = short.body.flatMap(b => ("list" in b ? b.list[lang] : []));

  const toggle = (id: string) => {
    haptic.select();
    setOpen(cur => (cur === id ? null : id));
  };

  return (
    <div className="pp">
      <div className="pp-hero">
        <span className="pp-hero-ico" aria-hidden="true"><ShieldCheck size={26} strokeWidth={2.2} /></span>
        <div>
          <h2 className="pp-hero-t">{t("pp_hero_t")}</h2>
          <p className="pp-hero-s">{PRIVACY.effectiveLabel[lang].replace("{date}", privacyDate(lang))}</p>
        </div>
      </div>

      <section aria-labelledby="pp-short">
        <h3 className="pp-label" id="pp-short">{short.title[lang]}</h3>
        <ul className="pp-promises">
          {promises.map((p, i) => (
            <li key={i}>
              <span className="pp-tick" aria-hidden="true"><Check size={14} strokeWidth={3.2} /></span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="pp-full">
        <h3 className="pp-label" id="pp-full">{t("pp_more")}</h3>
        <div className="pp-items">
          {rest.map(s => {
            const on = open === s.id;
            return (
              <div key={s.id} className={`pp-item ${on ? "on" : ""}`}>
                <button type="button" className="pp-head" onClick={() => toggle(s.id)} aria-expanded={on}>
                  <span className="pp-ico" aria-hidden="true">{ICON[s.id]}</span>
                  <span className="pp-head-t">{s.title[lang]}</span>
                  <ChevronRight className="pp-chev" size={20} strokeWidth={2.4} aria-hidden="true" />
                </button>
                <AutoHeight>
                  {on && (
                    <div className="pp-body">
                      {s.body.map((b, i) => "p" in b
                        // A paragraph ending in a colon introduces the list
                        // under it, so it is set as that list's heading.
                        ? <p key={i} className={b.p[lang].endsWith(":") ? "pp-sub" : "pp-p"}>{withEmail(b.p[lang])}</p>
                        : <ul key={i} className="pp-ul">{b.list[lang].map((li, j) => <li key={j}>{withEmail(li)}</li>)}</ul>)}
                    </div>
                  )}
                </AutoHeight>
              </div>
            );
          })}
        </div>
      </section>

      <a className="pp-mail" href={`mailto:${PRIVACY.email}`}>
        <Mail size={20} strokeWidth={2.3} aria-hidden="true" /> {t("pp_mail")}
      </a>
    </div>
  );
}
