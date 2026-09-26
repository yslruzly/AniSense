import { useState } from "react";
import { Download, Check, AlertCircle } from "lucide-react";
import { useLang } from "../i18n";
import { haptic, saveImage } from "../lib/platform";
import { renderReceipt } from "../lib/receiptImage";
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
  placed: Date;
  buyer: string;
  lines: CartItem[];
}

const peso = (n: number) => `₱${n.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;

export function Receipt({ order, open, onClose }: { order: ReceiptOrder | null; open: boolean; onClose: () => void }) {
  const { t, lang } = useLang();
  // idle → busy → done (or failed), then back to idle: the button says each
  // step in place, the way the member ID's download does.
  const [save, setSave] = useState<"idle" | "busy" | "done" | "failed">("idle");
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
  const itemName = (l: CartItem) => (l.variety && l.variety !== l.crop ? l.variety : l.crop);
  const totalSub = `${kg} kg · ${groups.length} ${groups.length !== 1 ? t("cart_sellers") : t("cart_seller")}`;

  const saveReceipt = async () => {
    if (save === "busy") return;
    setSave("busy");
    try {
      const blob = await renderReceipt({
        brandKicker: t("rc_kicker"), title: t("rc_title"),
        placedLabel: t("rc_date"), placed: when,
        buyerLabel: t("rc_buyer"), buyer: order.buyer,
        groups: groups.map(g => ({
          seller: g.seller, initials: g.initials, location: g.location,
          lines: g.lines.map(l => ({ name: itemName(l), qtyLine: `${l.qty} kg × ${peso(l.pricePerKg)}`, amount: peso(l.qty * l.pricePerKg) })),
        })),
        totalLabel: t("rc_total"), totalSub, total: peso(total),
        note: t("cart_pay_note"), thanks: t("rc_thanks"),
      });
      const p = order.placed;
      const stamp = `${p.getFullYear()}-${String(p.getMonth() + 1).padStart(2, "0")}-${String(p.getDate()).padStart(2, "0")}-${String(p.getHours()).padStart(2, "0")}${String(p.getMinutes()).padStart(2, "0")}`;
      const result = await saveImage(blob, `AniSense-receipt-${stamp}.png`, t("rc_kicker"));
      if (result === "failed") { haptic.warn(); setSave("failed"); }
      else if (result === "downloaded") { haptic.success(); setSave("done"); }
      // On the phone the share sheet was the confirmation; nothing to add.
      else { setSave("idle"); return; }
    } catch {
      haptic.warn();
      setSave("failed");
    }
    window.setTimeout(() => setSave("idle"), 2400);
  };

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
            <div><dt>{t("rc_date")}</dt><dd>{when}</dd></div>
            <div><dt>{t("rc_buyer")}</dt><dd>{order.buyer}</dd></div>
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
                    <span className="rc-item-n">{itemName(l)}</span>
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
              <small>{totalSub}</small>
            </span>
            <strong className="rc-total-v">{peso(total)}</strong>
          </div>

          {/* The one thing a buyer must not misunderstand: nothing is paid. */}
          <p className="rc-note">{t("cart_pay_note")}</p>
          <p className="rc-thanks">{t("rc_thanks")}</p>
        </article>
      </div>

      <div className="rc-actions">
        <button className={`rc-save ${save === "done" ? "is-done" : ""} ${save === "failed" ? "is-failed" : ""}`}
          onClick={saveReceipt} aria-busy={save === "busy"}>
          {/* Keyed on the state, so each label arrives rather than cutting. */}
          <span className="rc-save-lbl" key={save}>
            {save === "busy" && <><span className="wid-spin" aria-hidden="true" /> {t("rc_saving")}</>}
            {save === "done" && <><Check size={18} strokeWidth={2.6} /> {t("rc_saved")}</>}
            {save === "failed" && <><AlertCircle size={18} strokeWidth={2.4} /> {t("id_save_failed")}</>}
            {save === "idle" && <><Download size={18} strokeWidth={2.4} /> {t("rc_save")}</>}
          </span>
        </button>
        <button className="rc-done" onClick={() => { haptic.select(); onClose(); }}>{t("rc_done")}</button>
      </div>
    </Sheet>
  );
}
