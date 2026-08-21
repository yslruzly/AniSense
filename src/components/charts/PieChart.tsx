import { useLang } from "../../i18n";
import { Expense } from "../../types";
import { CAT_COLORS, DATA_NEUTRAL } from "../../constants/colors";

export function PieChart({ transactions }: { transactions: Expense[] }) {
  const { t, tn } = useLang();
  const cx = 90, cy = 90, r = 70;

  // Filter to current month & year only
  const now = new Date();
  const thisMonthTxns = transactions.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  // Build slices dynamically from live transactions
  const totals: Record<string, number> = {};
  thisMonthTxns.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
  const grand = Object.values(totals).reduce((s, v) => s + v, 0);

  if (grand === 0) return (
    <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-faint)", fontSize: "var(--fs-label)" }}>
      {t("exp_none_yet")}
    </div>
  );

  const sliceData = Object.entries(totals).map(([cat, amt]) => ({
    label: cat, pct: Math.round((amt / grand) * 100),
    amount: amt, color: CAT_COLORS[cat] || DATA_NEUTRAL,
  }));

  let cumPct = 0;
  const slices = sliceData.map(d => {
    const start = cumPct / 100 * Math.PI * 2 - Math.PI / 2;
    cumPct += d.pct;
    const end = cumPct / 100 * Math.PI * 2 - Math.PI / 2;
    const midAngle = start + (end - start) / 2;
    const lr = r * 0.65;
    const isFull = d.pct >= 100;
    const path = isFull
      ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`
      : (() => {
        const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
        const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
        const large = d.pct > 50 ? 1 : 0;
        return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
      })();
    return {
      ...d,
      path,
      lx: cx + lr * Math.cos(midAngle),
      ly: cy + lr * Math.sin(midAngle),
    };
  });

  return (
    <div>
      <svg viewBox="0 0 180 180" style={{ width: "100%", maxWidth: 200, display: "block", margin: "0 auto" }}>
        {slices.map(s => (
          <g key={s.label}>
            <path d={s.path} fill={s.color} stroke="#fff" strokeWidth="2" />
            {s.pct >= 5 && (
              <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill="#fff">
                {s.pct}%
              </text>
            )}
          </g>
        ))}
      </svg>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", marginTop: 12 }}>
        {slices.map(d => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "var(--fs-label)", color: "var(--text-soft)", fontWeight: 600 }}>{tn(d.label)}</div>
              <div style={{ fontSize: "var(--fs-label)", color: DATA_NEUTRAL }}>₱{d.amount.toLocaleString()} · {d.pct}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
