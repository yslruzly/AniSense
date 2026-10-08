import { useEffect, useState } from "react";
import { Check, HandCoins, X } from "lucide-react";
import { useLang } from "../../i18n";
import { useMarket } from "../../store/market";
import { Sheet } from "../ui/Sheet";
import { PesoField, pesoText, pesoValue } from "../ui/PesoField";
import { useRetained } from "../../hooks/usePresence";
import { isNetworkError } from "../../lib/cache";
import { haptic } from "../../lib/platform";
import { peso } from "../../lib/money";
import { BuyerTransaction } from "../../types";

// ─── What the buyer paid ──────────────────────────────────────────────────────
// After talking with the farmer and paying them, the buyer writes down what
// actually changed hands for one line of an order. It is what their spending
// counts from then on (lib/purchases.ts). The field starts on the best figure
// there is: what they recorded before, else what the farmer confirmed, else
// the order's price. Under it, the order's price, and the farmer's figure
// when it differs, to check against. Recorded once, it can be changed, or
// cleared to go back to the order's price.

export function PaymentSheet({ tx, onClose, onSaved }: {
  tx: BuyerTransaction | null;
  onClose: () => void;
  /** A payment was written down (not cleared): the page can now offer the stars. */
  onSaved?: (id: string) => void;
}) {
  const { t } = useLang();
  const { recordPayment } = useMarket();
  // Kept through the closing slide, so the sheet doesn't empty as it goes.
  const shown = useRetained(tx);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Each opening starts from that order's own best figure. Keyed on which
  // order, not on the row itself: the history being fetched again while the
  // sheet is open must not wipe what is being typed.
  useEffect(() => {
    if (!tx) return;
    setDraft(pesoText(tx.paid ?? tx.agreed ?? tx.amount));
    setError("");
  }, [tx?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (paid: number | null) => {
    if (!shown) return;
    if (paid !== null && (!(paid > 0) || paid > 1e8)) { setError(t("pay_bad")); return; }
    setSaving(true); setError("");
    try {
      await recordPayment(shown.id, paid === null ? null : Math.round(paid * 100) / 100);
      haptic.success();
      if (paid !== null) onSaved?.(shown.id);
      onClose();
    } catch (e) {
      setError(t(isNetworkError(e) ? "err_offline_action" : "ord_save_failed"));
    } finally {
      setSaving(false);
    }
  };

  const hint = shown
    ? t("pay_order_was").replace("{amount}", peso(shown.amount)) +
      (shown.agreed !== undefined && shown.agreed !== shown.amount ? " " + t("pay_farmer_said").replace("{amount}", peso(shown.agreed)) : "")
    : "";

  return (
    <Sheet open={!!tx} onClose={onClose} className="pa-sheet pay-sheet" label={t("pay_title")}>
      {shown && <>
        <div className="pa-sheet-head">
          <span className="pa-sheet-ico"><HandCoins size={20} strokeWidth={2.4} /></span>
          <h3 className="pa-sheet-t">{t("pay_title")}</h3>
          <button className="pa-x" onClick={onClose} aria-label={t("close")}>
            <X size={20} strokeWidth={2.6} />
          </button>
        </div>

        {/* Which order this is, in a line. */}
        <p className="pay-what"><b>{shown.variety || shown.crop}</b> · {shown.kg} kg · {shown.seller}</p>

        <div className="pa-field">
          <label className="pa-lbl" htmlFor="pay-amt">{t("pay_lbl")}</label>
          <PesoField id="pay-amt" value={draft} onChange={v => { setDraft(v); setError(""); }} bad={!!error}
            describedBy={`pay-hint${error ? " pay-err" : ""}`} />
          <p className="pay-hint" id="pay-hint">{hint}</p>
          {error && <p className="ord-err" id="pay-err" role="alert">{error}</p>}
        </div>

        <button className="mp-sell-btn pa-save" onClick={() => { void save(pesoValue(draft)); }} disabled={saving} aria-busy={saving}>
          <Check size={19} strokeWidth={2.6} /> {t("pay_save")}
        </button>
        {shown.paid !== undefined && (
          <button type="button" className="pay-clear" onClick={() => { void save(null); }} disabled={saving}>{t("pay_clear")}</button>
        )}
      </>}
    </Sheet>
  );
}
