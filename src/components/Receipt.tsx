import { useLang } from "../i18n";
import { haptic } from "../lib/platform";
import { CartItem } from "../types";
import { Sheet } from "./ui/Sheet";
import { AniSenseLogo } from "./AniSenseLogo";

// ─── Order receipt ────────────────────────────────────────────────────────────
// What a buyer sees after confirming an order: a paper receipt, printed out
// of the top of the screen, that stays until they put it away. The old
// confirmation was a card that vanished after three seconds, taking with it
// the one moment a buyer wants to check what they just ordered, from whom,
// and for how much.
//
// Grouped by farmer, because that is how the order is actually handled: each
// farmer calls about their own part of it. No payment line, because nothing
// has been paid; it says so, and says what happens instead.

export interface ReceiptOrder {
  no: string;
  placed: Date;
  buyer: string;
  location: string;
  lines: CartItem[];
}

/** "AS-260926-4821": the day it was placed, then four digits to tell orders apart. */
export function newOrderNo(d = new Date()): string {
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `AS-${ymd}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
}

const peso = (n: number) => `₱${n.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;

export function Receipt({ order, open, onClose }: { order: ReceiptOrder | null; open: boolean; onClose: () => void }) {
  const { t, lang } = useLang();
  if (!order) return null;

  // One block per farmer, in the order they were added to the cart.
  const groups: { seller: string; initials: string; location: string; lines: CartItem[] }[] = [];
  for (const l of order.lines) {
    const g = groups.find(x => x.seller === l.seller);
    if (g) g.lines.push(l);
    else groups.push({ seller: l.seller, initials: l.sellerInitials, location: l.location, lines: [l] });
  }
  const total = order.lines.reduce((s, l) => s + l.qty * l.pricePerKg, 0);
  const kg = order.lines.reduce((s, l) => s + l.qty, 0);
  const locale = lang === "tl" ? "fil-PH" : "en-PH";
  const when = order.placed.toLocaleString(locale, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <Sheet open={open} onClose={onClose} variant="center" className="rc-panel" label={t("rc_title")}>
      {/* The shadow lives on a wrapper: the paper's torn edge is a mask, and a
          mask would cut a box-shadow off with it. A drop-shadow filter on the
          parent follows the torn shape instead. */}
      <div className="rc-lift">
        <article className="rc-paper">
          <header className="rc-head">
            <span className="rc-brand"><AniSenseLogo size={34} /> AniSense</span>
            <span className="rc-kicker">{t("rc_kicker")}</span>
          </header>

          {/* The check draws itself once the paper is out: the order is done. */}
          <div className="rc-ok" aria-hidden="true">
            <svg viewBox="0 0 52 52" width="46" height="46">
              <circle className="rc-ok-ring" cx="26" cy="26" r="23" />
              <path className="rc-ok-tick" d="M15 27.5 L22.5 35 L37.5 19" />
            </svg>
          </div>
          {/* No subtitle: what happens next is said once, in the note under
              the total, where it sits beside the amount it is about. */}
          <h2 className="rc-title">{t("rc_title")}</h2>

          <dl className="rc-meta">
            <div><dt>{t("rc_no")}</dt><dd className="num">{order.no}</dd></div>
            <div><dt>{t("rc_date")}</dt><dd>{when}</dd></div>
            <div className="wide"><dt>{t("rc_buyer")}</dt><dd>{order.buyer}{order.location ? ` · ${order.location}` : ""}</dd></div>
          </dl>

          <div className="rc-perf" aria-hidden="true" />

          {groups.map(g => (
            <section className="rc-group" key={g.seller}>
              <div className="rc-seller">
                <span className="rc-ava" aria-hidden="true">{g.initials}</span>
                <span className="rc-seller-txt">
                  <span className="rc-seller-n">{g.seller}</span>
                  <span className="rc-seller-l">{g.location}</span>
                </span>
              </div>
              {g.lines.map(l => (
                <div className="rc-line" key={l.listingId}>
                  <span className="rc-item">
                    <span className="rc-item-n">{l.variety && l.variety !== l.crop ? l.variety : l.crop}</span>
                    <span className="rc-item-q">{l.qty} kg × {peso(l.pricePerKg)}</span>
                  </span>
                  <span className="rc-amt">{peso(l.qty * l.pricePerKg)}</span>
                </div>
              ))}
            </section>
          ))}

          <div className="rc-perf" aria-hidden="true" />

          <div className="rc-total">
            <span className="rc-total-l">
              {t("rc_total")}
              <small>{kg} kg · {groups.length} {groups.length !== 1 ? t("cart_sellers") : t("cart_seller")}</small>
            </span>
            <strong className="rc-total-v">{peso(total)}</strong>
          </div>

          {/* The one thing a buyer must not misunderstand: nothing is paid. */}
          <p className="rc-note">{t("cart_pay_note")}</p>

          <div className="rc-code" aria-hidden="true">
            <span className="rc-barcode" />
            <span className="rc-code-n">{order.no}</span>
          </div>
          <p className="rc-thanks">{t("rc_thanks")}</p>
        </article>
      </div>

      <button className="rc-done" onClick={() => { haptic.select(); onClose(); }}>{t("rc_done")}</button>
    </Sheet>
  );
}
