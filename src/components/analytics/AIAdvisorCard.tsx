import { ArrowDownRight, ArrowUpRight, ArrowRight } from "lucide-react";
import { useLang } from "../../i18n";
import { adviceFor, ACTION_ORDER, Action, Advice } from "../../lib/advice";
import { monthLabel } from "../../data/priceRecords";
import { CropEmoji } from "../icons/CropEmoji";

// ─── Sell now or wait? ────────────────────────────────────────────────────────
// One decision per crop, answered in the order a farmer reads: what to do (the
// pill), what the price does (the newest record → three months on), and why,
// in one plain sentence. The model's name moves to the footnote; "ARIMA"
// means nothing to the person deciding whether to load the truck.
//
// The decision itself is lib/advice.ts, shared with Home's "Sell now or wait?".

export function AIAdvisorCard({ farmerCrops = ["Rice", "Corn"] }: { farmerCrops?: string[] }) {
  const { t, tn, lang } = useLang();
  const recs = farmerCrops.map(adviceFor)
    .filter((a): a is Advice => a !== null)
    .map(({ group, run, action, last }) => ({
      name: group, action, price: run.current.price, next: last.price, change: last.price - run.current.price, unsure: !run.reliable,
      from: monthLabel(run.current.month, lang), to: monthLabel(last.month, lang),
    }))
    .sort((a, b) => ACTION_ORDER[a.action] - ACTION_ORDER[b.action]);

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
