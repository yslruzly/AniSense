import { ArrowDownRight, ArrowUpRight, ArrowRight } from "lucide-react";
import { useLang } from "../../i18n";
import { CROPS } from "../../data/crops";
import { forecastForGroup } from "../../data/forecast";
import { monthLabel } from "../../data/priceRecords";
import { CropEmoji } from "../icons/CropEmoji";

// ─── Sell now or wait? ────────────────────────────────────────────────────────
// One decision per crop, answered in the order a farmer reads: what to do (the
// pill), what the price does (the newest record → three months on), and why,
// in one plain sentence. The model's name moves to the footnote; "ARIMA"
// means nothing to the person deciding whether to load the truck.
//
// Only crops with price records get advice, from the ARIMA forecast trained
// on them. Where that forecast tested badly (onion, calamansi), the advice
// is "Watch", with the reason said plainly: nobody should hold a harvest on a
// number that has been half wrong.

type Action = "SELL" | "HOLD" | "WATCH";

export function AIAdvisorCard({ farmerCrops = ["Rice", "Corn"] }: { farmerCrops?: string[] }) {
  const { t, tn, lang } = useLang();
  const order: Record<Action, number> = { SELL: 0, HOLD: 1, WATCH: 2 };

  const recs = farmerCrops.map(cropName => {
    const run = forecastForGroup(cropName, "arima");
    if (!run) return null;
    const price = run.current.price;
    const last = run.next[run.next.length - 1];
    const pct = (last.price / price - 1) * 100;
    // Both in percent: the forecast's move over the months ahead, plus half
    // of the move the price has just made.
    const score = pct + (CROPS.find(c => c.id === run.id)?.change ?? 0) * 0.5;
    const action: Action = !run.reliable ? "WATCH" : score > 1.5 ? "HOLD" : score < -1.5 ? "SELL" : "WATCH";
    return {
      name: cropName, action, price, next: last.price, change: last.price - price, unsure: !run.reliable,
      from: monthLabel(run.current.month, lang), to: monthLabel(last.month, lang),
    };
  })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    // Sell first: it's the one that costs money if it waits.
    .sort((a, b) => order[a.action] - order[b.action]);

  const label: Record<Action, string> = { SELL: t("ana_act_sell"), HOLD: t("ana_act_hold"), WATCH: t("ana_act_watch") };
  const reason: Record<Action, string> = { SELL: t("ana_sell_reason"), HOLD: t("ana_hold_reason"), WATCH: t("ana_watch_reason") };
  const peso = (n: number) => `₱${n.toLocaleString("en-PH", { maximumFractionDigits: 1 })}`;

  // None of their crops has price records yet: no advice to give.
  if (recs.length === 0) return null;

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

                {/* The newest record → three months on, as two labelled
                    numbers, so the change is something you can see rather
                    than a sum to work out. */}
                <div className="adv-prices">
                  <span className="adv-p">
                    <span className="adv-p-lbl">{r.from}</span>
                    <span className="adv-p-val">{peso(r.price)}</span>
                  </span>
                  <Arrow size={18} strokeWidth={2.4} className={`adv-arrow ${up ? "up" : down ? "down" : ""}`} aria-hidden="true" />
                  <span className="adv-p">
                    <span className="adv-p-lbl">{r.to}</span>
                    <span className="adv-p-val">{peso(r.next)}</span>
                  </span>
                  <span className={`adv-delta ${up ? "up" : down ? "down" : ""}`}>
                    {up ? "+" : down ? "−" : "±"}{peso(Math.abs(r.change))}
                  </span>
                </div>

                <p className="adv-why">{r.unsure ? t("ana_unsure_reason") : reason[r.action]}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="adv-foot">{t("ana_forecast_by")} {t("ana_disclaimer")}</p>
    </div>
  );
}
