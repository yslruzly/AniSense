import { useState } from "react";
import { useLang } from "../../i18n";
import { Expense } from "../../types";
import { CAT_COLORS, CAT_ORDER, DATA_NEUTRAL } from "../../constants/colors";
import { ExpenseIcon } from "../icons";

// ─── This month's spending, by kind ───────────────────────────────────────────
// A ring, this month's total in its middle, and under it every kind of expense
// ranked by what it cost: its colour, its picture, its name, the pesos and the
// share. The list is the chart's labels, so no number lives on a slice (white
// on pale gold was unreadable) and the paler colours never carry a value
// alone.
//
// The colours are the dataviz reference palette, validated as neighbours in
// the ring's own order, last beside first (constants/colors.ts). The ring is
// drawn in that fixed order; the list is ranked by amount.
//
// Tap a kind, in the list or on the ring: the others step back and its amount
// takes the middle. Tap it again to see the whole month.

const R = 74, SW = 24, C = 2 * Math.PI * R;
// A 2px gap of the card's white between neighbours, in arc length.
const GAP = 2.5;

export function PieChart({ transactions }: { transactions: Expense[] }) {
  const { t, tn, lang } = useLang();
  const [pick, setPick] = useState<string | null>(null);

  const now = new Date();
  const totals: Record<string, number> = {};
  transactions.forEach(e => {
    const d = new Date(e.date);
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) totals[e.category] = (totals[e.category] || 0) + e.amount;
  });
  const grand = Object.values(totals).reduce((s, v) => s + v, 0);
  if (grand === 0) return <p className="xd-empty">{t("exp_none_yet")}</p>;

  const ring = [...CAT_ORDER.filter(c => totals[c] > 0), ...Object.keys(totals).filter(c => !CAT_ORDER.includes(c) && totals[c] > 0)];
  let at = 0;
  const arcs = ring.map(c => {
    const share = totals[c] / grand;
    const len = ring.length === 1 ? C : Math.max(share * C - GAP, 0.5);
    const arc = { c, len, off: at };
    at += share * C;
    return arc;
  });
  const ranked = [...ring].sort((a, b) => totals[b] - totals[a]);
  const shown = pick && totals[pick] ? pick : null;
  const pct = (c: string) => Math.round((totals[c] / grand) * 100);
  const toggle = (c: string) => setPick(p => (p === c ? null : c));
  const color = (c: string) => CAT_COLORS[c] ?? DATA_NEUTRAL;
  const locale = lang === "tl" ? "fil-PH" : "en-PH";

  return (
    <div className="xd">
      <div className="xd-ring">
        <svg viewBox="0 0 200 200" role="img"
          aria-label={ranked.map(c => `${tn(c)} ₱${totals[c].toLocaleString()} (${pct(c)}%)`).join(", ")}>
          <circle cx={100} cy={100} r={R} className="xd-track" />
          {arcs.map(a => (
            <circle key={a.c} cx={100} cy={100} r={R} fill="none" stroke={color(a.c)} strokeWidth={SW}
              strokeDasharray={`${a.len} ${C - a.len}`} strokeDashoffset={-a.off} transform="rotate(-90 100 100)"
              className={`xd-arc${shown && shown !== a.c ? " dim" : ""}`} onClick={() => toggle(a.c)} />
          ))}
        </svg>
        {/* The month's total, or the picked kind's. */}
        <div className="xd-mid" aria-live="polite">
          <span className="xd-mid-k">{shown ? tn(shown) : now.toLocaleDateString(locale, { month: "long" })}</span>
          <span className="xd-mid-v">₱{(shown ? totals[shown] : grand).toLocaleString()}</span>
          <span className="xd-mid-p">{shown ? `${pct(shown)}%` : t("exp_this_month")}</span>
        </div>
      </div>

      <ul className="xd-list">
        {ranked.map(c => (
          <li key={c}>
            <button type="button" aria-pressed={shown === c} onClick={() => toggle(c)}
              className={`xd-row${shown === c ? " on" : ""}${shown && shown !== c ? " dim" : ""}`}>
              <span className="xd-key" style={{ background: color(c) }} aria-hidden="true" />
              <span className="xd-ico" aria-hidden="true"><ExpenseIcon cat={c} size={16} color="var(--text-soft)" /></span>
              <span className="xd-name">{tn(c)}</span>
              <span className="xd-amt">₱{totals[c].toLocaleString()}</span>
              <span className="xd-pct">{pct(c)}%</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
