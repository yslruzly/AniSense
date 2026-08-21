import { useLang } from "../../i18n";
import { Expense } from "../../types";
import { CROP_BAR_COLORS, DATA_NEUTRAL } from "../../constants/colors";
import { CropIcon } from "../icons";

// ─── Monthly Trends Bar Chart (live from transactions) ────────────────────────
// ─── Monthly Breakdown Per Crop ───────────────────────────────────────────────
export function MonthlyTrendsChart({ transactions, farmerCrops }: { transactions: Expense[]; farmerCrops: string[] }) {
  const { t, tn } = useLang();
  const W = 280, H = 130, P = { t: 10, r: 8, b: 24, l: 44 };

  // Group by month then by crop
  const monthCropMap: Record<string, Record<string, number>> = {};
  transactions.forEach(e => {
    let mon = "Other";
    if (e.date && e.date.includes("-")) {
      const d = new Date(e.date);
      mon = d.toLocaleDateString("en-PH", { month: "short" });
    } else {
      mon = (e.date.split(" ")[0]) || "Other";
    }
    if (!monthCropMap[mon]) monthCropMap[mon] = {};
    const crop = e.crop || "Other";
    monthCropMap[mon][crop] = (monthCropMap[mon][crop] || 0) + e.amount;
  });

  const months = Object.keys(monthCropMap).slice(-4);
  if (months.length === 0) {
    return <div style={{ textAlign: "center", fontSize: "var(--fs-label)", color: "var(--text-faint)", padding: "16px 0" }}>{t("exp_no_data")}</div>;
  }

  const maxVal = Math.max(...months.map(m => Object.values(monthCropMap[m]).reduce((s, v) => s + v, 0)), 1);
  const chartW = W - P.l - P.r;
  const chartH = H - P.t - P.b;
  const groupW = chartW / months.length;
  const barW = Math.min(36, groupW - 10);
  const ticks = [0, Math.round(maxVal * 0.5), maxVal];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
        {ticks.map(t => {
          const yy = P.t + chartH - (t / maxVal) * chartH;
          return (
            <g key={t}>
              <line x1={P.l} y1={yy} x2={W - P.r} y2={yy} stroke="var(--line)" strokeWidth="1" strokeDasharray="3 3" />
              <text x={P.l - 4} y={yy + 3} fontSize="9" fill="var(--text-faint)" textAnchor="end">{t >= 1000 ? `${(t / 1000).toFixed(0)}k` : t}</text>
            </g>
          );
        })}
        {months.map((mon, mi) => {
          const cx = P.l + mi * groupW + groupW / 2;
          const cropData = monthCropMap[mon];
          let stackY = P.t + chartH;
          const total = Object.values(cropData).reduce((s, v) => s + v, 0);

          return (
            <g key={mon}>
              {farmerCrops.map(crop => {
                const val = cropData[crop] || 0;
                if (!val) return null;
                const bh = Math.max((val / maxVal) * chartH, 1);
                stackY -= bh;
                const color = CROP_BAR_COLORS[crop] || DATA_NEUTRAL;
                return (
                  <rect key={crop} x={cx - barW / 2} y={stackY} width={barW} height={bh}
                    rx={val === total ? 4 : 0} fill={color} opacity="0.88" />
                );
              })}
              <text x={cx} y={H - P.b + 12} fontSize="10" fill={DATA_NEUTRAL} textAnchor="middle">{mon}</text>
              <text x={cx} y={P.t + chartH - (total / maxVal) * chartH - 4} fontSize="9" fill="var(--text-soft)" textAnchor="middle">
                {total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", marginTop: 8 }}>
        {farmerCrops.map(crop => (
          <div key={crop} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: CROP_BAR_COLORS[crop] || DATA_NEUTRAL, flexShrink: 0 }} />
            <span style={{ fontSize: "var(--fs-label)", color: "var(--text-soft)", fontWeight: 600 }}>{tn(crop)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
