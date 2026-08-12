import { TrendingUp, TrendingDown } from "lucide-react";
import { useLang } from "../../i18n";
import { CROP_GROUPS, RICE_VARIETIES } from "../../data/crops";
import { ARIMA_DATA } from "../../data/forecast";
import { CropIcon } from "../icons";

// ─── Predicted Price Card ─────────────────────────────────────────────────────
export function PredictedPriceCard({ farmerCrops = ["Rice", "Corn"] }: { farmerCrops?: string[] }) {
  const { t, tn } = useLang();
  const groupPriceMap: Record<string, number> = {};
  CROP_GROUPS.forEach(g => { groupPriceMap[g.group] = g.varieties[0].pricePerKg; });
  groupPriceMap["Rice"] = RICE_VARIETIES[0].pricePerKg;

  const items = farmerCrops.map(cropName => {
    const arima = ARIMA_DATA[cropName];
    if (!arima) return null;
    const current = groupPriceMap[cropName] ?? 0;
    const predicted = arima.d3;
    const diff = predicted - current;
    const pct = current > 0 ? ((diff / current) * 100).toFixed(1) : "0.0";
    const up = diff >= 0;
    return { name: cropName, current, predicted, diff, pct, up };
  }).filter(Boolean) as { name: string; current: number; predicted: number; diff: number; pct: string; up: boolean }[];

  if (items.length === 0) return null;

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ background: "#22406b", color: "#b4c8e0", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 99, display: "flex", alignItems: "center", gap: 4 }}>
          <TrendingUp size={12} color="#b4c8e0" /> ARIMA FORECAST
        </span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{t("ana_predicted")}</span>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>{t("ana_based_on")}</div>
      {items.map(r => (
        <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#e6f2e9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CropIcon crop={r.name} size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{tn(r.name)}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{t("ana_current")}: ₱{r.current}/kg</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: r.up ? "#2e7d4f" : "#c74133" }}>₱{r.predicted.toFixed(1)}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: r.up ? "#2e7d4f" : "#c74133", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
              {r.up ? <TrendingUp size={12} color="#2e7d4f" /> : <TrendingDown size={12} color="#c74133" />}
              {r.up ? "+" : ""}{r.diff.toFixed(1)} ({r.up ? "+" : ""}{r.pct}%)
            </div>
          </div>
        </div>
      ))}
      <div style={{ fontSize: 11, color: "#aa9d8a", marginTop: 10, textAlign: "center" }}>
        {t("ana_forecast_note")}
      </div>
    </div>
  );
}
