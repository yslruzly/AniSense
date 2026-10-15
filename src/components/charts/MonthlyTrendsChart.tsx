import { useState } from "react";
import { useLang } from "../../i18n";
import { Expense } from "../../types";

// ─── Spending, month by month ─────────────────────────────────────────────────
// The last six months up to this one, in order, a month with nothing spent
// kept in its place so the gaps show too. One bar a month in one colour (the
// pesos are the story; the crops are told underneath), the picked month solid
// green and the others a paler step of the same green, its amount over it.
// Round numbers on a few hairlines up the side.
//
// The months are buttons under the bars: tap one (or its bar) and the panel
// under the chart says what it came to and what each crop took. It opens on
// this month, or the latest month with any spending.
//
// Grouped by year and month (2026-10), never by the month's name alone, which
// put October 2025 and October 2026 in one bar, and not in date order.

const W = 320, H = 170, P = { t: 24, r: 6, b: 6, l: 46 };

/** 1, 2 or 5 × a power of ten: steps that read as round numbers. */
function niceStep(raw: number) {
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
}
const short = (n: number) => (n >= 1000 ? `₱${(n / 1000).toLocaleString("en-PH", { maximumFractionDigits: 1 })}k` : `₱${n}`);

export function MonthlyTrendsChart({ transactions, farmerCrops }: { transactions: Expense[]; farmerCrops: string[] }) {
  const { t, tn, lang } = useLang();
  const locale = lang === "tl" ? "fil-PH" : "en-PH";
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, k) => new Date(now.getFullYear(), now.getMonth() - 5 + k, 1));
  const keyOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const data = months.map(d => ({ d, key: keyOf(d), total: 0, crops: {} as Record<string, number> }));
  const byKey = Object.fromEntries(data.map(m => [m.key, m]));
  transactions.forEach(e => {
    const m = byKey[keyOf(new Date(e.date))];
    if (!m) return;
    m.total += e.amount;
    m.crops[e.crop] = (m.crops[e.crop] || 0) + e.amount;
  });
  const latest = data.map(m => m.total > 0).lastIndexOf(true);
  const [sel, setSel] = useState(() => (data[5].total > 0 || latest < 0 ? 5 : latest));
  if (latest < 0) return <p className="xd-empty">{t("exp_no_data")}</p>;

  const max = Math.max(...data.map(m => m.total));
  const step = niceStep(max / 3);
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const plotW = W - P.l - P.r, plotH = H - P.t - P.b;
  const slot = plotW / data.length;
  const barW = 24, r = 4;
  const y = (v: number) => P.t + plotH - (v / top) * plotH;
  // A bar rounded at its top, square on the baseline.
  const bar = (cx: number, v: number) => {
    const x0 = cx - barW / 2, x1 = cx + barW / 2, y0 = y(v), yb = P.t + plotH;
    const rr = Math.min(r, (yb - y0) / 2);
    return `M${x0} ${yb} L${x0} ${y0 + rr} Q${x0} ${y0} ${x0 + rr} ${y0} L${x1 - rr} ${y0} Q${x1} ${y0} ${x1} ${y0 + rr} L${x1} ${yb} Z`;
  };
  const m = data[sel];
  const crops = Object.entries(m.crops).sort((a, b) => b[1] - a[1] || farmerCrops.indexOf(a[0]) - farmerCrops.indexOf(b[0]));

  return (
    <div className="xm">
      <svg viewBox={`0 0 ${W} ${H}`} className="xm-svg" role="img"
        aria-label={data.map(x => `${x.d.toLocaleDateString(locale, { month: "long", year: "numeric" })} ₱${x.total.toLocaleString()}`).join(", ")}>
        {ticks.map(v => (
          <g key={v}>
            <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} className="xm-grid" />
            <text x={P.l - 8} y={y(v) + 4.5} className="xm-axis" textAnchor="end">{short(v)}</text>
          </g>
        ))}
        {data.map((x, i) => {
          const cx = P.l + slot * (i + 0.5);
          return (
            <g key={x.key} onClick={() => setSel(i)} className="xm-col">
              {/* The whole column is the target, not just the painted bar. */}
              <rect x={cx - slot / 2} y={0} width={slot} height={H} fill="transparent" />
              {x.total > 0 && <path d={bar(cx, x.total)} className={`xm-bar${i === sel ? " on" : ""}`} />}
              {i === sel && x.total > 0 && (
                <text x={Math.min(Math.max(cx, P.l + 24), W - 24)} y={y(x.total) - 8} className="xm-val" textAnchor="middle">{short(x.total)}</text>
              )}
            </g>
          );
        })}
      </svg>
      {/* The months, as buttons, each under its bar. */}
      <div className="xm-months" style={{ marginLeft: `${(P.l / W) * 100}%`, marginRight: `${(P.r / W) * 100}%` }}>
        {data.map((x, i) => (
          <button key={x.key} type="button" className={`xm-m${i === sel ? " on" : ""}`} aria-pressed={i === sel} onClick={() => setSel(i)}
            aria-label={x.d.toLocaleDateString(locale, { month: "long", year: "numeric" })}>
            {x.d.toLocaleDateString(locale, { month: "short" }).replace(".", "")}
          </button>
        ))}
      </div>

      {/* The picked month: what it came to, and what each crop took. */}
      <div className="xm-read" aria-live="polite">
        <div className="xm-read-head">
          <span className="xm-read-m">{m.d.toLocaleDateString(locale, { month: "long", year: "numeric" })}</span>
          <span className="xm-read-v">₱{m.total.toLocaleString()}</span>
        </div>
        {crops.length > 0 ? (
          <ul className="xm-crops">
            {crops.map(([crop, amt]) => (
              <li key={crop}><span>{tn(crop)}</span><b>₱{amt.toLocaleString()}</b></li>
            ))}
          </ul>
        ) : (
          <p className="xm-none">{t("exp_nothing")}</p>
        )}
      </div>
    </div>
  );
}
