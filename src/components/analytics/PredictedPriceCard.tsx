import { ArrowDownRight, ArrowUpRight, ArrowRight } from "lucide-react";
import { useLang } from "../../i18n";
import { CROP_GROUPS, RICE_VARIETIES } from "../../data/crops";
import { arimaProjection } from "../../data/forecast";
import { CropEmoji } from "../CropEmoji";

// ─── Prices in the next 3 days ────────────────────────────────────────────────
// The advisor card above says what to do; this one shows how the price gets
// there, day by day. Each crop: where it ends up and by how much, then a small
// path from today to day 3 with the weekdays under it, drawn against a dashed
// line at today's price so "above" and "below" need no reading.
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
  const locale = lang === "tl" ? "fil-PH" : "en-PH";
  const groupPriceMap: Record<string, number> = {};
  CROP_GROUPS.forEach(g => { groupPriceMap[g.group] = g.varieties[0].pricePerKg; });
  groupPriceMap["Rice"] = RICE_VARIETIES[0].pricePerKg;

  const items = farmerCrops.map(cropName => {
    const current = groupPriceMap[cropName] ?? 0;
    const proj = arimaProjection(cropName, current);
    if (!proj) return null;
    return { name: cropName, current, ...proj };
  }).filter((r): r is NonNullable<typeof r> => r !== null);

  if (items.length === 0) return null;

  // Today, then the next three weekdays, under the matching points.
  const now = new Date();
  const dayLabels = [0, 1, 2, 3].map(k =>
    k === 0 ? t("ana_today") : new Date(now.getFullYear(), now.getMonth(), now.getDate() + k).toLocaleDateString(locale, { weekday: "short" }));
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
                  <div className="pp-now">{t("ana_today")} {peso(r.current)}/kg</div>
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
                aria-label={`${tn(r.name)}: ${[r.current, ...r.days].map((v, i) => `${dayLabels[i]} ${peso(v)}`).join(", ")}`}>
                <PricePath values={[r.current, ...r.days]} dir={dir} />
                <div className="pp-days" aria-hidden="true">
                  {dayLabels.map((l, i) => <span key={i}>{l}</span>)}
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
