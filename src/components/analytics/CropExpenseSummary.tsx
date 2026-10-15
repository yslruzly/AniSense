import { useLang } from "../../i18n";
import { Expense } from "../../types";
import { CropIcon } from "../icons";
import { growArtFor } from "../../data/growArt";

// ─── This month, by crop ──────────────────────────────────────────────────────
// Each crop the farmer grows, biggest spend first: its drawing, its name and
// the pesos, a bar for its share of the month, and that share in words. One
// series, so one colour for every bar: the bar shows how much, the name says
// which. The month's total at the foot. A crop with nothing spent on it this
// month says so, quietly, rather than showing an empty bar and ₱0 alone.

export function CropExpenseSummary({ transactions, farmerCrops }: { transactions: Expense[]; farmerCrops: string[] }) {
  const { t, tn } = useLang();
  const now = new Date();
  const totals: Record<string, number> = {};
  farmerCrops.forEach(c => { totals[c] = 0; });
  transactions.forEach(e => {
    const d = new Date(e.date);
    if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return;
    if (farmerCrops.includes(e.crop)) totals[e.crop] += e.amount;
  });
  const grand = Object.values(totals).reduce((s, v) => s + v, 0);
  // Biggest first; crops with the same spend keep the farmer's own order.
  const rows = farmerCrops.map((crop, i) => ({ crop, amt: totals[crop] || 0, i })).sort((a, b) => b.amt - a.amt || a.i - b.i);

  return (
    <div className="xs">
      <ul className="xs-list">
        {rows.map(({ crop, amt }) => {
          const art = growArtFor(crop);
          const share = grand > 0 ? amt / grand : 0;
          return (
            <li key={crop} className={`xs-row${amt === 0 ? " none" : ""}`}>
              <span className="xs-art" aria-hidden="true">
                {art ? <img src={art} alt="" decoding="async" draggable={false} /> : <CropIcon crop={crop} size={20} />}
              </span>
              <span className="xs-mid">
                <span className="xs-top">
                  <span className="xs-name">{tn(crop)}</span>
                  <span className="xs-amt">₱{amt.toLocaleString()}</span>
                </span>
                <span className="xs-bar" aria-hidden="true"><span className="xs-fill" style={{ transform: `scaleX(${share})` }} /></span>
                <span className="xs-pct">{amt > 0 ? t("exp_share").replace("{pct}", String(Math.round(share * 100))) : t("exp_nothing")}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <div className="xs-total">
        <span>{t("exp_total")}</span>
        <b>₱{grand.toLocaleString()}</b>
      </div>
    </div>
  );
}
