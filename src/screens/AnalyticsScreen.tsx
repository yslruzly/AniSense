import { BarChart2 } from "lucide-react";
import { useLang } from "../i18n";
import { Hdr } from "../components/layout/Hdr";
import { AIAdvisorCard } from "../components/analytics/AIAdvisorCard";
import { ForecastHero } from "../components/analytics/ForecastHero";
import { MarketChange } from "../components/analytics/MarketChange";

// ─── Analytics ────────────────────────────────────────────────────────────────
// Three questions, in the order a farmer asks them:
//   1. Where is my price going?         → the forecast, one crop at a time
//   2. So, sell now or wait?            → the advice for each crop they grow
//   3. How is the rest of the market?   → every crop's move today, on one scale
// The old summary strip (an "average price" across rice and calamansi, a sum
// of tonnages) is gone: numbers nobody could act on.
export function AnalyticsScreen({ onBack, farmerCrops = ["Rice", "Corn"] }: { onProfile: () => void; onBack: () => void; userInitials?: string; farmerCrops?: string[] }) {
  const { t } = useLang();
  return (
    <div className="screen">
      <Hdr icon={<BarChart2 size={20} color="var(--tanim)" />} title={t("ana_title")} sub={t("ana_sub")} onBack={onBack} />
      <div className="scroll screen-enter">
        <ForecastHero farmerCrops={farmerCrops} />
        <div className="an-stack stagger-list">
          <AIAdvisorCard farmerCrops={farmerCrops} />
          <MarketChange farmerCrops={farmerCrops} />
          <p className="an-note">{t("ana_models_note")}</p>
        </div>
      </div>
    </div>
  );
}
