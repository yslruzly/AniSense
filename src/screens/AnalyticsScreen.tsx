import { BarChart2 } from "lucide-react";
import { useLang } from "../i18n";
import { CROPS, PRICE_HISTORY } from "../data/crops";
import { Hdr } from "../components/layout/Hdr";
import { PriceChart } from "../components/charts/PriceChart";
import { AIAdvisorCard } from "../components/analytics/AIAdvisorCard";
import { LSTMForecast } from "../components/analytics/LSTMForecast";

// ─── Analytics Screen ─────────────────────────────────────────────────────────
export function AnalyticsScreen({ onProfile, onBack, userInitials = "JD", farmerCrops = ["Rice", "Corn"] }: { onProfile: () => void; onBack: () => void; userInitials?: string; farmerCrops?: string[] }) {
  const { t } = useLang();
  const maxV = Math.max(...CROPS.map(c => c.volume));
  const risingCount = CROPS.filter(c => c.change > 0).length;
  const totalVol = CROPS.reduce((s, c) => s + c.volume, 0);
  const avgPrice = Math.round(CROPS.reduce((s, c) => s + c.pricePerKg, 0) / CROPS.length);

  return (
    <div className="screen">
      <Hdr icon={<BarChart2 size={20} color="var(--tanim)" />} title={t("ana_title")} sub={t("ana_sub")} onProfile={onProfile} onBack={onBack} userInitials={userInitials} />
      <div className="scroll screen-enter">
        <div>
          <div className="sec-title">{t("ana_glance")}</div>
          <div className="sec-sub">{t("ana_glance_sub")}</div>
        </div>
        <div className="card">
          <div className="sum-row">
            {[
              [`${risingCount}/${CROPS.length}`, t("ana_crops_rising")],
              [totalVol.toLocaleString(), t("ana_total_tons")],
              [`₱${avgPrice}`, t("ana_avg_price")],
            ].map(([v, l]) => (
              <div key={l}><div className="sum-val">{v}</div><div className="sum-lbl">{l}</div></div>
            ))}
          </div>
        </div>
        <AIAdvisorCard farmerCrops={farmerCrops} />
        <div className="card">
          <div className="card-title">{t("ana_trends")}</div>
          <PriceChart data={PRICE_HISTORY} />
        </div>
        <LSTMForecast />
        <div className="card">
          <div className="card-title">{t("ana_performance")}</div>
          <div className="perf-grid">
            {CROPS.map(c => (
              <div key={c.id} className="perf-card" style={{ background: c.change >= 0 ? "var(--tanim-sk)" : "var(--error-sk)" }}>
                <div className="perf-name">{c.name}</div>
                <div className="perf-price">₱{c.pricePerKg}<span className="unit-suffix">{t("per_kg_short")}</span></div>
                <div className="perf-chg" style={{ color: c.change >= 0 ? "var(--tanim)" : "var(--error)" }}>
                  {c.change >= 0 ? "▲" : "▼"} {Math.abs(c.change)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
