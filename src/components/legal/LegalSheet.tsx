import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Sheet } from "../ui/Sheet";
import { LegalDocument } from "./LegalDocument";
import { useLang } from "../../i18n";
import { LegalDocData, PRIVACY } from "../../data/privacyPolicy";
import { TERMS } from "../../data/termsOfService";
import { useRetained } from "../../hooks/usePresence";
import leafMask from "../../assets/anisense-leaf-mask.png";
import mascotBody from "../../assets/mascot-wave-body.webp";
import mascotHand from "../../assets/mascot-wave-hand.webp";
import mascotEyes from "../../assets/mascot-wave-eyes.webp";
import buyerBody from "../../assets/buyer-wave-body.webp";
import buyerHand from "../../assets/buyer-wave-hand.webp";
import buyerEyes from "../../assets/buyer-wave-eyes.webp";

// ─── The Terms and the Privacy Policy ─────────────────────────────────────────
// Both documents in one full-screen sheet, read without leaving the screen it
// was opened from (welcome, sign-up, Profile). The AniSense green across the
// top with a word of welcome, then the document on a white card: a switch
// between the two, the title, the date, the text, which is the only part
// that scrolls, and the buttons fixed at the foot under a soft fade.
//
// At sign-up it asks: the farmer or buyer waves, says what is being asked,
// and the foot has Decline and Accept - the same agreement as the box on the
// form, so accepting ticks it and declining leaves it clear. Read again later
// (welcome, Profile), it is a document to look at, with one button to close.
//
// The documents and their names are always in English; the words around
// them follow the app's language.
//
// `doc` null closes it; otherwise it is the one to open on. The last one is
// kept while the sheet slides away, so it never empties on the way out.

const DOCS = [TERMS, PRIVACY];

export function LegalSheet({ doc, onClose, onAccept, onDecline, figure }: {
  doc: LegalDocData | null;
  onClose: () => void;
  /** Sign-up: the agreement is being asked for. Both are given, or neither. */
  onAccept?: () => void;
  onDecline?: () => void;
  /** Who waves at sign-up. */
  figure?: "farmer" | "buyer";
}) {
  const { t } = useLang();
  const shown = useRetained(doc);
  const asking = !!onAccept && !!onDecline;
  const [tab, setTab] = useState<LegalDocData | null>(doc);
  const body = useRef<HTMLDivElement>(null);
  // Opened on the document that was tapped; a new opening starts there again.
  useEffect(() => { if (doc) setTab(doc); }, [doc]);
  const current = tab ?? shown;
  const pick = (d: LegalDocData) => { setTab(d); body.current?.scrollTo({ top: 0 }); };

  const [askA, rest = ""] = t("legal_ask").split("{terms}");
  const [askB, askC = ""] = rest.split("{privacy}");
  const buyer = figure === "buyer";

  return (
    <Sheet open={!!doc} onClose={onClose} className="lg-sheet" label={current?.title ?? ""}>
      {current && <>
        <img className="lg-mark" src={leafMask} alt="" aria-hidden="true" />
        <div className="lg-top">
          <button type="button" className="lg-x" onClick={onClose} aria-label={t("close")}>
            <X size={22} strokeWidth={2.4} />
          </button>
          <span className="lg-brand">
            <span className="lg-brand-mark" aria-hidden="true" style={{ WebkitMaskImage: `url(${leafMask})`, maskImage: `url(${leafMask})` }} />
            AniSense
          </span>
        </div>

        {/* A word of welcome: at sign-up, what is being asked, with the one
            who gave the tour waving beside it; afterwards, what these are. */}
        <div className={`lg-hello${asking ? " is-asking" : ""}`}>
          <div className="lg-hello-txt">
            <h2 className="lg-hello-t">{asking ? t("legal_hello") : t("legal_read_t")}</h2>
            <p className="lg-hello-s">
              {asking
                ? <>{askA}<b lang="en">{TERMS.title}</b>{askB}<b lang="en">{PRIVACY.title}</b>{askC}</>
                : t("legal_read_s")}
            </p>
          </div>
          {asking && (
            <div className={`lg-fig${buyer ? " buyer" : ""}`} aria-hidden="true">
              <img className="tm-body" src={buyer ? buyerBody : mascotBody} alt="" width={420} height={435} decoding="async" />
              <img className="tm-eyes" src={buyer ? buyerEyes : mascotEyes} alt="" width={420} height={435} decoding="async" />
              <img className="tm-hand" src={buyer ? buyerHand : mascotHand} alt="" width={420} height={435} decoding="async" />
            </div>
          )}
        </div>

        <div className="lg-card">
          {/* The two documents, a tap apart. */}
          <div className="lg-tabs" role="tablist" aria-label={t("legal_docs")}>
            {DOCS.map(d => (
              <button key={d.title} type="button" role="tab" id={`lg-tab-${d.title.replace(/\s/g, "")}`} lang="en"
                aria-selected={current.title === d.title} aria-controls="lg-panel"
                className="lg-tab" onClick={() => pick(d)}>
                {d.title}
              </button>
            ))}
          </div>
          <div className="lg-body" ref={body} id="lg-panel" role="tabpanel" aria-labelledby={`lg-tab-${current.title.replace(/\s/g, "")}`} tabIndex={0}>
            <h2 className="lg-title" lang="en">{current.title}</h2>
            <LegalDocument doc={current} key={current.title} />
          </div>
          <div className={`lg-foot${asking ? "" : " one"}`}>
            {asking ? <>
              <button type="button" className="lg-decline" onClick={onDecline}>{t("legal_decline")}</button>
              <button type="button" className="lg-accept" onClick={onAccept}>{t("legal_accept")}</button>
            </> : (
              <button type="button" className="lg-accept" onClick={onClose}>{t("pp_done")}</button>
            )}
          </div>
        </div>
      </>}
    </Sheet>
  );
}
