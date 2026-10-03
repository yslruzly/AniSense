import React from "react";
import { PRIVACY, PrivacySection, fillPrivacy, privacyDate } from "../../data/privacyPolicy";

// ─── Privacy policy ───────────────────────────────────────────────────────────
// The policy. Shown on the Privacy screen (Profile) and in a sheet from the
// welcome screen. It ships inside the app, so it can be read without signal.
//
// Always in English, whichever language the app is set to: there is one text
// and it is never translated. It is marked lang="en" so a screen reader reads
// it with an English voice even when the rest of the app is in Tagalog.
//
// Set as a document, because that is what it is, and a document is what
// people trust: the date it took effect, a short summary set apart at the
// top, then numbered sections with plain headings and plain bullets, all of
// it on the page with nothing to tap open. No icons: here they would be
// decoration, and decoration makes a legal text look less serious, not more.
// The reading is done by the type: 17px on open leading, headings a clear
// step above the text, and room between sections.

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

function Blocks({ section }: { section: PrivacySection }) {
  return (
    <>
      {section.body.map((b, i) => "p" in b
        // A paragraph ending in a colon introduces the list under it, so it
        // is set as that list's heading.
        ? <p key={i} className={b.p.endsWith(":") ? "pp-sub" : "pp-p"}>{withEmail(b.p)}</p>
        : <ul key={i} className="pp-ul">{b.list.map((li, j) => <li key={j}>{withEmail(li)}</li>)}</ul>)}
    </>
  );
}

export function PrivacyPolicy() {
  const [short, ...rest] = PRIVACY.sections;
  return (
    <article className="pp" lang="en">
      <p className="pp-date">{PRIVACY.effectiveLabel.replace("{date}", privacyDate())}</p>

      <section className="pp-summary" aria-labelledby="pp-summary-t">
        <h2 className="pp-summary-t" id="pp-summary-t">{short.title}</h2>
        <Blocks section={short} />
      </section>

      {rest.map((s, i) => (
        <section key={s.id} className="pp-sec">
          <h2 className="pp-h"><span className="pp-num">{i + 1}.</span> {s.title}</h2>
          <Blocks section={s} />
        </section>
      ))}
    </article>
  );
}
