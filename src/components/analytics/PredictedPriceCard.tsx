import { ArrowDownRight, ArrowUpRight, ArrowRight } from "lucide-react";
import { useLang } from "../../i18n";
import { forecastForGroup } from "../../data/forecast";
import { monthLabel } from "../../data/priceRecords";
import { CropEmoji } from "../CropEmoji";

// ─── Prices in the next 3 months ──────────────────────────────────────────────
// The advisor card says what to do; this one shows how the price gets there,
// month by month, from the ARIMA forecast trained on the price records. Each
// crop: where it ends up and by how much, then a small path from the newest
// record to the third month with the months under it, drawn against a dashed
// line at the newest price so "above" and "below" need no reading. Crops
// with no price records are left out.
//
// Not animated. Home is opened many times a day, and a line that draws itself
// every visit stops being information and starts being a wait.

const VB_W = 300, VB_H = 56, PAD_X = 10, PAD_Y = 10;

function PricePath({ values, dir }: { values: number[]; dir: "up" | "down" | "flat" }) {
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const xs = values.map((_, i) => PAD_X + (i * (VB_W - PAD_X * 2)) / (values.length - 1));
  const y = (v: number) => (max === min ? VB_H / 2 : PAD_Y + (1 - (v - min) / span) * (VB_H - PAD_Y * 2));
  const d = values.map((v, i) => `${i ? "L" : "M"}${xs[i].toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${d} L${xs[xs.length - 1]} ${VB_H} L${xs[0]} ${VB_H} Z`;
  return (
    <svg className={`pp-svg ${dir}`} viewBox={`0 0 ${VB_W} ${VB_H}`} aria-hidden="true">
      <line className="pp-base" x1={PAD_X} x2={VB_W - PAD_X} y1={y(values[0])} y2={y(values[0])} />
      <path className="pp-area" d={area} />
      <path className="pp-line" d={d} />
      {values.map((v, i) => (
        <circle key={i} className={i === values.length - 1 ? "pp-dot end" : "pp-dot"} cx={xs[i]} cy={y(v)} r={i === values.length - 1 ? 5 : 3.5} />
      ))}
    </svg>
  );
}

export function PredictedPriceCard({ farmerCrops = ["Rice", "Corn"] }: { farmerCrops?: string[] }) {
  const { t, tn, lang } = useLang();

  const items = farmerCrops.map(cropName => {
    const run = forecastForGroup(cropName, "arima");
    if (!run) return null;
    const current = run.current.price;
    const days = run.next.map(p => p.price);
    const d3 = days[days.length - 1];
    // The newest record's month, then the forecast months, under the
    // matching points.
    const labels = [run.current.month, ...run.next.map(p => p.month)].map(m => monthLabel(m, lang));
    return { name: cropName, current, days, d3, change: d3 - current, pct: (d3 / current - 1) * 100, labels };
  }).filter((r): r is NonNullable<typeof r> => r !== null);

  if (items.length === 0) return null;

  const peso = (n: number) => `₱${n.toLocaleString("en-PH", { maximumFractionDigits: 1 })}`;

  return (
    <div className="card pp-card">
      <div className="adv-head">
        <div className="adv-title">{t("ana_predicted")}</div>
        <div className="adv-sub">{t("ana_based_on")}</div>
      </div>

      <div className="stagger-list">
        {items.map(r => {
          const dir = r.change > 0.05 ? "up" : r.change < -0.05 ? "down" : "flat";
          const Arrow = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : ArrowRight;
          return (
            <div key={r.name} className="pp-row">
              <div className="pp-top">
                <span className="adv-ico"><CropEmoji crop={r.name} size={22} /></span>
                <div className="pp-id">
                  <div className="adv-name">{tn(r.name)}</div>
                  <div className="pp-now">{r.labels[0]} {peso(r.current)}/kg</div>
                </div>
                <div className="pp-end">
                  <div className="pp-target">{peso(r.d3)}</div>
                  {/* Arrow and sign as well as colour, so the direction never
                      rests on red and green alone. */}
                  <div className={`adv-delta ${dir === "flat" ? "" : dir}`}>
                    <Arrow size={14} strokeWidth={2.6} />
                    {dir === "down" ? "−" : dir === "up" ? "+" : "±"}{peso(Math.abs(r.change))} · {Math.abs(r.pct).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="pp-chart"
                role="img"
                aria-label={`${tn(r.name)}: ${[r.current, ...r.days].map((v, i) => `${r.labels[i]} ${peso(v)}`).join(", ")}`}>
                <PricePath values={[r.current, ...r.days]} dir={dir} />
                <div className="pp-days" aria-hidden="true">
                  {r.labels.map((l, i) => <span key={i}>{l}</span>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="adv-foot">{t("ana_forecast_note")}</p>
    </div>
  );
}
