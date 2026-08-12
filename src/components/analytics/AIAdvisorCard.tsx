import { Bot } from "lucide-react";
import { useLang } from "../../i18n";
import { CROP_GROUPS, RICE_VARIETIES } from "../../data/crops";
import { ARIMA_DATA } from "../../data/forecast";
import { CropIcon } from "../icons";

export function AIAdvisorCard({ farmerCrops = ["Rice", "Corn"] }: { farmerCrops?: string[] }) {
  const { t, tn } = useLang();
  // Build a price map from CROP_GROUPS (group name -> first variety price)
  const groupPriceMap: Record<string, number> = {};
  const groupChangeMap: Record<string, number> = {};
  CROP_GROUPS.forEach(g => {
    groupPriceMap[g.group] = g.varieties[0].pricePerKg;
    groupChangeMap[g.group] = g.varieties[0].change;
  });
  // Rice uses RICE_VARIETIES representative
  groupPriceMap["Rice"] = RICE_VARIETIES[0].pricePerKg;
  groupChangeMap["Rice"] = RICE_VARIETIES[0].change;

  const recs = farmerCrops.map(cropName => {
    const arima = ARIMA_DATA[cropName];
    if (!arima) return null;
    const price = groupPriceMap[cropName] ?? 0;
    const trendChange = groupChangeMap[cropName] ?? 0;
    const arimaChange = arima.d3 - price;
    const score = arimaChange + trendChange;
    const action = score > 1.5 ? "HOLD" : score < -1 ? "SELL" : "WATCH";
    const color = action === "HOLD" ? "#2e7d4f" : action === "SELL" ? "#c74133" : "#b97d10";
    const bg = action === "HOLD" ? "#e6f2e9" : action === "SELL" ? "#f9e4dc" : "#fdf3dd";
    const actionLabel = action === "HOLD" ? t("ana_hold") : action === "SELL" ? t("ana_sell") : t("ana_watch");
    const reason = (action === "HOLD"
      ? t("ana_hold_reason")
      : action === "SELL"
        ? t("ana_sell_reason")
        : t("ana_watch_reason")
    ).replace("{x}", Math.abs(arimaChange).toFixed(1));
    return { name: cropName, action, actionLabel, color, bg, reason, price };
  }).filter(Boolean) as { name: string; action: string; actionLabel: string; color: string; bg: string; reason: string; price: number }[];

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ background: "#2c2350", color: "#b9a5e2", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 99, display: "flex", alignItems: "center", gap: 4 }}>
          <Bot size={12} color="#b9a5e2" /> ARIMA + AI
        </span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{t("ana_suggestion")}</span>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>{t("ana_suggestion_sub")}</div>
      {recs.map(r => (
        <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#e6f2e9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CropIcon crop={r.name} size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{tn(r.name)}</span>
              <span style={{ background: r.bg, color: r.color, fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 99, border: `1px solid ${r.color}33` }}>{r.actionLabel}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{r.reason}</div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", flexShrink: 0 }}>₱{r.price}</div>
        </div>
      ))}
      <div style={{ fontSize: 11, color: "#aa9d8a", marginTop: 10, textAlign: "center", lineHeight: 1.5 }}>
        {t("ana_disclaimer")}
      </div>
    </div>
  );
}
