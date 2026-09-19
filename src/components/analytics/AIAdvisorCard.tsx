import { ArrowDownRight, ArrowUpRight, ArrowRight } from "lucide-react";
import { useLang } from "../../i18n";
import { CROP_GROUPS, RICE_VARIETIES } from "../../data/crops";
import { arimaProjection } from "../../data/forecast";
import { CropEmoji } from "../CropEmoji";

// ─── Sell now or wait? ────────────────────────────────────────────────────────
// One decision per crop, answered in the order a farmer reads: what to do (the
// pill), what the price does (today → in 3 days), and why, in one plain
// sentence. The model's name moves to the footnote; "ARIMA" means nothing to
// the person deciding whether to load the truck.

type Action = "SELL" | "HOLD" | "WATCH";

export function AIAdvisorCard({ farmerCrops = ["Rice", "Corn"] }: { farmerCrops?: string[] }) {
  const { t, tn } = useLang();
  const groupPriceMap: Record<string, number> = {};
  const groupChangeMap: Record<string, number> = {};
  CROP_GROUPS.forEach(g => {
    groupPriceMap[g.group] = g.varieties[0].pricePerKg;
    groupChangeMap[g.group] = g.varieties[0].change;
  });
  // Rice uses RICE_VARIETIES representative
  groupPriceMap["Rice"] = RICE_VARIETIES[0].pricePerKg;
  groupChangeMap["Rice"] = RICE_VARIETIES[0].change;

  const order: Record<Action, number> = { SELL: 0, HOLD: 1, WATCH: 2 };

  const recs = farmerCrops.map(cropName => {
    const price = groupPriceMap[cropName] ?? 0;
    const proj = arimaProjection(cropName, price);
    if (!proj) return null;
    // Both in percent now: the 3-day forecast plus half of this week's trend.
    // (Before, peso and percent were added together.)
    const score = proj.pct + (groupChangeMap[cropName] ?? 0) * 0.5;
    const action: Action = score > 1.5 ? "HOLD" : score < -1.5 ? "SELL" : "WATCH";
    return { name: cropName, action, price, next: proj.d3, change: proj.change };
  })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    // Sell first: it's the one that costs money if it waits.
    .sort((a, b) => order[a.action] - order[b.action]);

  const label: Record<Action, string> = { SELL: t("ana_act_sell"), HOLD: t("ana_act_hold"), WATCH: t("ana_act_watch") };
  const reason: Record<Action, string> = { SELL: t("ana_sell_reason"), HOLD: t("ana_hold_reason"), WATCH: t("ana_watch_reason") };
  const peso = (n: number) => `₱${n.toLocaleString("en-PH", { maximumFractionDigits: 1 })}`;

  return (
    <div className="card adv-card">
      <div className="adv-head">
        <div className="adv-title">{t("ana_suggestion")}</div>
        <div className="adv-sub">{t("ana_suggestion_sub")}</div>
      </div>

      <div className="stagger-list">
        {recs.map(r => {
          const up = r.change > 0.05, down = r.change < -0.05;
          const Arrow = up ? ArrowUpRight : down ? ArrowDownRight : ArrowRight;
          return (
            <div key={r.name} className="adv-row">
              <span className="adv-ico"><CropEmoji crop={r.name} size={22} /></span>
              <div className="adv-body">
                <div className="adv-top">
                  <span className="adv-name">{tn(r.name)}</span>
                  {/* Colour never works alone: each action also has its own
                      word, and the arrow below says which way price moves. */}
                  <span className={`adv-pill ${r.action.toLowerCase()}`}>{label[r.action]}</span>
                </div>

                {/* Today → in 3 days, as two labelled numbers, so the change
                    is something you can see rather than a sum to work out. */}
                <div className="adv-prices">
                  <span className="adv-p">
                    <span className="adv-p-lbl">{t("ana_today")}</span>
                    <span className="adv-p-val">{peso(r.price)}</span>
                  </span>
                  <Arrow size={18} strokeWidth={2.4} className={`adv-arrow ${up ? "up" : down ? "down" : ""}`} aria-hidden="true" />
                  <span className="adv-p">
                    <span className="adv-p-lbl">{t("ana_in_3_days")}</span>
                    <span className="adv-p-val">{peso(r.next)}</span>
                  </span>
                  <span className={`adv-delta ${up ? "up" : down ? "down" : ""}`}>
                    {up ? "+" : down ? "−" : "±"}{peso(Math.abs(r.change))}
                  </span>
                </div>

                <p className="adv-why">{reason[r.action]}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="adv-foot">{t("ana_forecast_by")} {t("ana_disclaimer")}</p>
    </div>
  );
}
