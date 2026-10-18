import { useRef, useState, type PointerEvent } from "react";
import { ArrowUpRight, ArrowDownRight, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";
import { growArtFor } from "../../data/growArt";
import { CropIcon } from "../icons";
import { translations } from "../../i18n";
import { forecastForGroup, HORIZON } from "../../data/forecast";
import { monthLabel } from "../../data/priceRecords";
import { haptic } from "../../lib/platform";

// ─── Price forecast ───────────────────────────────────────────────────────────
// The page's centrepiece, answered in the order a farmer asks: which crop,
// what is it now, where is it headed over the next twelve months (the LSTM's
// long-term outlook), and how sure are we.
//
// Built for a phone held in a field: a white card (it reads in sunlight, where
// a dark one turns to a mirror), large figures, and nothing that has to be
// decoded first.
//
//   1. The crop, picked from chips with its drawing, as on Home.
//   2. Now → the last forecast month, as two large prices, and what it means
//      ("Expected to fall") on a chip with arrow, sign and colour.
//   3. The chart, one blue line: the past twelve months solid over a faint
//      wash, then the forecast dashed through hollow dots (they have not
//      happened yet) with the likely range shaded round it. The forecast
//      months sit in their own tinted zone, labelled "Forecast", the rest
//      "Past 12 months": no legend to match up. Touch and slide to read any
//      month; the page still scrolls through it (touch-action: pan-y).
//   4. The forecast months as a list, each with its likely range, so no
//      number needs the chart to be touched: every third month (3, 6, 9 and
//      12 months on), and all twelve a tap away.
//   5. How sure: how far off the model was when tested on the last year.
//      Where that is a lot (onion and calamansi swing by half in a month),
//      the chip stops saying "expected to rise" and says it is too uncertain.
//
// The line is the same blue whatever the price does; whether the months
// ahead are good news is said by the chip, so a falling forecast is never
// drawn in "good" green or a rising one in alarm red.
//
// Only the farmer's own crops, in the order they chose them. Crops they grow
// that have no forecast yet are named at the foot, so nothing just vanishes.

// Validated on white with the dataviz checker: L and chroma in band, 5.1:1.
const LINE = "#2F6FA8";
const W = 320, H = 200, P = { t: 30, r: 12, b: 30, l: 42 };

/** 1, 2 or 5 × a power of ten: tick steps that read as round numbers. */
function niceStep(raw: number) {
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
}
const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const en = (key: keyof typeof translations) => translations[key].en;

export function ForecastHero({ farmerCrops = [] }: { farmerCrops?: string[] }) {
  // The forecast is always in English, whatever language the app is set to, crop
  // names included: the market's words, the same on every phone.
  const t = en;
  const tn = (crop: string) => crop;
  const crops = farmerCrops.filter(c => forecastForGroup(c, "lstm"));
  const without = farmerCrops.filter(c => !forecastForGroup(c, "lstm"));
  const [picked, setPicked] = useState(() => crops[0] ?? "");
  // Follows the profile: if the crop on show is no longer one of theirs,
  // the first of theirs takes its place.
  const crop = crops.includes(picked) ? picked : crops[0];
  const listOf = (names: string[]) => names.map(tn).join(", ");
  // First paint plays the full entrance; a switch replays a shorter one.
  const [switched, setSwitched] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  // The list shows every third month; this opens all of them.
  const [allMonths, setAllMonths] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // None of their crops has a forecast yet: say so, in the same card.
  if (!crop) {
    return (
      <section className="fc" aria-labelledby="fc-t">
        <div className="fc-head">
          <h2 className="fc-t" id="fc-t">{t("ana_forecast")}</h2>
          <span className="fc-s">{t("ana_next_months").replace("{n}", String(HORIZON.lstm))}</span>
        </div>
        <p className="fc-none">{t("ana_fc_none").replace("{crops}", listOf(farmerCrops))}</p>
      </section>
    );
  }

  const run = forecastForGroup(crop, "lstm")!;
  // The recorded months, then the forecast ones. A recorded month has no
  // range: it happened.
  const s = [
    ...run.past.map(p => ({ month: p.month, price: p.price, lower: p.price, upper: p.price })),
    ...run.next,
  ];
  const n = s.length;
  const nowIdx = run.past.length - 1;
  const value = (i: number) => s[i].price;
  const month = (i: number, form: "short" | "long" = "short", year = false) => monthLabel(s[i].month, "en", form, year);

  const today = run.current.price;
  const next = s[n - 1].price;
  const diff = next - today;
  const pct = (diff / today) * 100;
  const dir = Math.abs(pct) < 0.5 ? "flat" : diff > 0 ? "up" : "down";
  const Arrow = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : ArrowRight;

  // Scales: round-number ticks around everything drawn, band included.
  const lo = Math.min(...s.map((d, i) => Math.min(d.lower, value(i))));
  const hi = Math.max(...s.map((d, i) => Math.max(d.upper, value(i))));
  const step = niceStep((hi - lo) / 3);
  const dMin = Math.floor(lo / step) * step, dMax = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = dMin; v <= dMax + 1e-9; v += step) ticks.push(Math.round(v * 100) / 100);
  const x = (i: number) => P.l + (i / (n - 1)) * (W - P.l - P.r);
  const y = (v: number) => P.t + ((dMax - v) / (dMax - dMin)) * (H - P.t - P.b);

  const line = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, k) => from + k)
      .map((i, k) => `${k === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(value(i)).toFixed(1)}`).join(" ");
  const band = [
    ...Array.from({ length: n - nowIdx }, (_, k) => nowIdx + k).map((i, k) => `${k === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(s[i].upper).toFixed(1)}`),
    ...Array.from({ length: n - nowIdx }, (_, k) => n - 1 - k).map(i => `L${x(i).toFixed(1)} ${y(s[i].lower).toFixed(1)}`),
    "Z",
  ].join(" ");

  // Scrubbing: the nearest month to the finger.
  const pick = (clientX: number) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const vx = ((clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(n - 1, Math.round(((vx - P.l) / (W - P.l - P.r)) * (n - 1))));
    setHover(h => { if (h !== i) haptic.select(); return i; });
  };
  const onDown = (e: PointerEvent<SVGSVGElement>) => { e.currentTarget.setPointerCapture?.(e.pointerId); pick(e.clientX); };
  const onMove = (e: PointerEvent<SVGSVGElement>) => { if (hover !== null || e.pointerType === "mouse") pick(e.clientX); };
  const onEnd = () => setHover(null);

  const when = (i: number) => month(i, "long", true);
  const pickCrop = (c: string) => {
    if (c === crop) return;
    haptic.select();
    setSwitched(true);
    setHover(null);
    setPicked(c);
  };

  const hx = hover !== null ? x(hover) : 0;
  const tipLeft = hover !== null ? Math.min(82, Math.max(18, (hx / W) * 100)) : 0;
  // Under the chart, a year back and a year on: the first month and the last
  // (with their years, which take room), now, and half a year on. One too
  // close to the last month to sit beside it is left out.
  const xLabels = [0, nowIdx, nowIdx + 6, n - 1]
    .filter((i, k, all) => i >= 0 && i <= n - 1 && all.indexOf(i) === k && (i === n - 1 || i === nowIdx || n - 1 - i > 2));
  // The list: every third month on (3, 6, 9, 12), and the last, unless all are open.
  const listed = allMonths ? run.next : run.next.filter((_, k) => (k + 1) % 3 === 0 || k === run.next.length - 1);
  const signed = (d: number) => `${d > 0.005 ? "+" : d < -0.005 ? "−" : "±"}${peso(Math.abs(d))}`;
  const past = `${line(0, nowIdx)} L${x(nowIdx).toFixed(1)} ${H - P.b} L${x(0).toFixed(1)} ${H - P.b} Z`;

  return (
    <section className="fc" aria-labelledby="fc-t">
      <div className="fc-head">
        <h2 className="fc-t" id="fc-t">{t("ana_forecast")}</h2>
        {/* Which variety the records are for: "Rice" is read from Special
            Rice, "Onions" from Red Onion. */}
        <span className="fc-s">{run.name} · {t("ana_next_months").replace("{n}", String(run.next.length))}</span>
      </div>

      {/* The crop, as on Home: chips with its drawing, wrapping, never a row to swipe. */}
      {crops.length > 1 && (
        <div className="cs-chips fc-chips" role="group" aria-label={t("ana_forecast")}>
          {crops.map(c => {
            const art = growArtFor(c);
            return (
              <button key={c} type="button" className="cs-chip" aria-pressed={crop === c} onClick={() => pickCrop(c)}>
                <span className="cs-chip-art">{art ? <img src={art} alt="" decoding="async" draggable={false} /> : <CropIcon crop={c} size={16} />}</span>
                {tn(c)}
              </button>
            );
          })}
        </div>
      )}

      {/* Now → the last forecast month: two large prices, then what it means. */}
      <div className="fc-read" key={`r-${crop}`}>
        <div className="fc-col">
          <span className="fc-k">{t("ana_now_month").replace("{month}", month(nowIdx, "long"))}</span>
          <span className="fc-v">{peso(today)}</span>
        </div>
        <ArrowRight size={22} strokeWidth={2.4} className="fc-to" aria-hidden="true" />
        <div className="fc-col">
          {/* With its year: a year on is often the same month name as now. */}
          <span className="fc-k">{month(n - 1, "long", true)}</span>
          <span className="fc-v">{peso(next)}</span>
        </div>
      </div>
      <div className="fc-verdict">
        <span className={`fc-chip ${run.reliable ? dir : "flat"}`}>
          <Arrow size={16} strokeWidth={2.6} aria-hidden="true" />
          {signed(diff)} · {pct >= 0 ? "+" : "−"}{Math.abs(pct).toFixed(1)}%
        </span>
        {/* A forecast that tested badly makes no promise about direction. */}
        <span className="fc-say">{t(!run.reliable ? "ana_exp_unsure" : dir === "up" ? "ana_exp_rise" : dir === "down" ? "ana_exp_fall" : "ana_exp_flat")}</span>
      </div>

      <div className="fc-chart">
        {hover !== null && (
          <div className="fc-tip" style={{ left: `${tipLeft}%` }} aria-hidden="true">
            <span className="fc-tip-k">{when(hover)}{hover === nowIdx ? ` · ${t("ana_now")}` : ""}</span>
            <span className="fc-tip-v">{peso(value(hover))}</span>
            {hover > nowIdx && <span className="fc-tip-r">{t("ana_likely").replace("{lo}", peso(s[hover].lower)).replace("{hi}", peso(s[hover].upper))}</span>}
          </div>
        )}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="fc-svg"
          role="img"
          aria-label={`${run.name}: ${when(nowIdx)} ${peso(today)}, ${when(n - 1)} ${peso(next)}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onEnd}
          onPointerCancel={onEnd}
          onPointerLeave={onEnd}
        >
          {/* The forecast months in their own tinted zone, named at its top;
              the recorded months named on the left. */}
          <rect x={x(nowIdx)} y={P.t - 22} width={W - x(nowIdx)} height={H - P.b - (P.t - 22)} rx={10} className="fc-zone" />
          <text x={P.l} y={P.t - 8} className="fc-zone-lbl" textAnchor="start">{t("ana_past_12")}</text>
          <text x={(x(nowIdx) + W) / 2} y={P.t - 8} className="fc-zone-lbl ahead" textAnchor="middle">{t("ana_leg_forecast")}</text>

          {/* Recessive grid: a few round numbers, hairlines. */}
          {ticks.map(v => (
            <g key={v}>
              <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} className="fc-grid" />
              <text x={P.l - 7} y={y(v) + 4.5} className="fc-axis" textAnchor="end">₱{Math.round(v)}</text>
            </g>
          ))}

          <g className={`fc-plot ${switched ? "swap" : "first"}`} key={crop}>
            <path d={past} className="fc-wash" fill={LINE} />
            <path d={band} className="fc-band" fill={LINE} />
            <path d={line(nowIdx, n - 1)} className="fc-future" stroke={LINE} />
            <path d={line(0, nowIdx)} className="fc-past" stroke={LINE} pathLength={1} />
            {/* The forecast months: hollow, since they have not happened. */}
            <g className="fc-end">
              {s.slice(nowIdx + 1).map((p, k) => (
                <circle key={p.month} cx={x(nowIdx + 1 + k)} cy={y(p.price)} r={4.5} className="fc-dot-ahead" stroke={LINE} />
              ))}
            </g>
            {/* Today's price: filled, ringed in white to sit on the line. */}
            <circle cx={x(nowIdx)} cy={y(today)} r={5.5} fill={LINE} className="fc-dot" />
          </g>

          {hover !== null && (
            <g className="fc-scrub" aria-hidden="true">
              <line x1={hx} x2={hx} y1={P.t - 4} y2={H - P.b} />
              <circle cx={hx} cy={y(value(hover))} r={6} fill="#fff" stroke={LINE} strokeWidth={3} />
            </g>
          )}

          {xLabels.map(i => (
            <text key={i} x={x(i)} y={H - 9} className={`fc-axis${i === nowIdx ? " now" : ""}`}
              textAnchor={i === n - 1 ? "end" : i === xLabels[0] && x(i) - P.l < 20 ? "start" : "middle"}>
              {i === nowIdx ? t("ana_now") : month(i, "short", i === 0 || i === n - 1)}
            </text>
          ))}
        </svg>
      </div>
      <p className="fc-hint">{t("ana_scrub_hint")}</p>

      {/* The months ahead as a list: the chart's numbers, no touching needed. */}
      <div className="fc-months">
        <h3 className="fc-months-t">{t("ana_month_by_month")}</h3>
        <ul>
          {listed.map(p => (
            <li key={p.month} className="fc-mrow">
              <span className="fc-mrow-l">
                <span className="fc-mrow-m">{monthLabel(p.month, "en", "long", true)}</span>
                <span className="fc-mrow-r">{t("ana_likely").replace("{lo}", peso(p.lower)).replace("{hi}", peso(p.upper))}</span>
              </span>
              <span className="fc-mrow-end">
                <span className="fc-mrow-p">{peso(p.price)}</span>
                <span className="fc-mrow-d">{signed(p.price - today)}</span>
              </span>
            </li>
          ))}
        </ul>
        {run.next.length > listed.length || allMonths ? (
          <button type="button" className="fc-more" aria-expanded={allMonths}
            onClick={() => { haptic.select(); setAllMonths(o => !o); }}>
            {allMonths ? t("ana_fewer_months") : t("ana_all_months").replace("{n}", String(run.next.length))}
          </button>
        ) : null}
      </div>

      {/* How sure: the model's average miss on the last year of prices. */}
      <p className={`fc-trust${run.reliable ? "" : " unsure"}`}>
        {run.reliable ? <ShieldCheck size={18} strokeWidth={2.4} aria-hidden="true" /> : <AlertTriangle size={18} strokeWidth={2.4} aria-hidden="true" />}
        <span>
          {t("ana_fc_tested").replace("{pct}", String(Math.round(run.mape)))}
          {!run.reliable && ` ${t("ana_fc_swings")}`}
        </span>
      </p>
      {without.length > 0 && (
        <p className="fc-hint">{t("ana_fc_missing").replace("{crops}", listOf(without))}</p>
      )}
    </section>
  );
}
