import { useLang } from "../../i18n";
import { Expense } from "../../types";
import { CROP_BAR_COLORS } from "../../constants/colors";
import { CropIcon } from "../icons";

// ─── Per-Crop Expense Summary ─────────────────────────────────────────────────
export function CropExpenseSummary({ transactions, farmerCrops }: { transactions: Expense[]; farmerCrops: string[] }) {
  const { t, tn } = useLang();
  // Filter to current month & year only
  const now = new Date();
  const thisMonthTxns = transactions.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  // Total per crop (this month only)
  const cropTotals: Record<string, number> = {};
  farmerCrops.forEach(c => { cropTotals[c] = 0; });
  thisMonthTxns.forEach(e => {
    const crop = e.crop || "Other";
    if (farmerCrops.includes(crop)) cropTotals[crop] = (cropTotals[crop] || 0) + e.amount;
  });

  const grand = Object.values(cropTotals).reduce((s, v) => s + v, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {farmerCrops.map(crop => {
        const amt = cropTotals[crop] || 0;
        const pct = grand > 0 ? Math.round((amt / grand) * 100) : 0;
        const color = CROP_BAR_COLORS[crop] || "#2f9e63";
        return (
          <div key={crop}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CropIcon crop={crop} size={14} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{tn(crop)}</span>
                <span style={{ fontSize: 11, color: "#82735f" }}>{pct}%</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>₱{amt.toLocaleString()}</span>
            </div>
            <div style={{ height: 8, background: "#f1e9dc", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.4s" }} />
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)" }}>{t("exp_total")}</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#2e7d4f" }}>₱{grand.toLocaleString()}</span>
      </div>
    </div>
  );
}
