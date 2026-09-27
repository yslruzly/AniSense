import { useRef, useState, type PointerEvent } from "react";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import { translations } from "../../i18n";
import { LSTM_DATA } from "../../data/forecast";
import { haptic } from "../../lib/platform";

// ─── Price forecast ───────────────────────────────────────────────────────────
// The page's centrepiece, answered in the order a farmer asks: which crop,
// what is it today, what will it be in a week, and how sure are we.
//
// One price line per crop: solid for the days that happened, dashed for the
// forecast, with the shaded band showing where the price will likely land.
// The line is always the same blue; whether the week is good news is said by
// the chip above it (arrow, sign and colour), so a falling forecast is never
// drawn in "good" green or a rising one in alarm red.
//
// Touch and slide along the chart to read any day. The page still scrolls
// vertically through it (touch-action: pan-y).
//
// Only the farmer's own crops, in the order they chose them: a forecast for
// something they don't grow is noise on their page. Crops they grow that
// have no forecast yet are named under the chart, so nothing just vanishes.

// Validated on --ink with the dataviz checker: L 0.48–0.67, C ≥ 0.10, ≥ 3:1.
const LINE = "#4E9BDB";
const W = 320, H = 170, P = { t: 22, r: 52, b: 26, l: 36 };

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
  const crops = farmerCrops.filter(c => LSTM_DATA[c]);
  const without = farmerCrops.filter(c => !LSTM_DATA[c]);
  const [picked, setPicked] = useState(() => crops[0] ?? "");
  // Follows the profile: if the crop on show is no longer one of theirs,
  // the first of theirs takes its place.
  const crop = crops.includes(picked) ? picked : crops[0];
  const listOf = (names: string[]) => names.map(tn).join(", ");
  // First paint plays the full entrance; a switch replays a shorter one.
  const [switched, setSwitched] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // None of their crops has a forecast yet: say so, in the same card.
  if (!crop) {
    return (
      <section className="fc" aria-labelledby="fc-t">
        <div className="fc-head">
          <h2 className="fc-t" id="fc-t">{t("ana_forecast")}</h2>
          <span className="fc-s">{t("ana_next7")}</span>
        </div>
        <p className="fc-none">{t("ana_fc_none").replace("{crops}", listOf(farmerCrops))}</p>
      </section>
    );
  }

  const data = LSTM_DATA[crop];
  const s = data.series;
  const n = s.length;
  const nowIdx = Math.max(0, s.findIndex(d => d.day === "Now"));
  const value = (i: number) => (i <= nowIdx ? (s[i].actual ?? s[i].predicted) : s[i].predicted);

  const today = data.current;
  const next = s[n - 1].predicted;
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

  // Scrubbing: the nearest day to the finger.
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

  const when = (i: number) => {
    const d = i - nowIdx;
    if (d === 0) return t("ana_today");
    if (d === -1) return t("ana_yesterday");
    if (d === 1) return t("ana_tomorrow");
    return (d < 0 ? t("ana_days_ago") : t("ana_in_days")).replace("{n}", String(Math.abs(d)));
  };
  const pickCrop = (c: string) => {
    if (c === crop) return;
    haptic.select();
    setSwitched(true);
    setHover(null);
    setPicked(c);
  };

  const hx = hover !== null ? x(hover) : 0;
  const tipLeft = hover !== null ? Math.min(84, Math.max(16, (hx / W) * 100)) : 0;

  return (
    <section className="fc" aria-labelledby="fc-t">
      <div className="fc-head">
        <h2 className="fc-t" id="fc-t">{t("ana_forecast")}</h2>
        {/* One crop: its name here, instead of a switch with one choice. */}
        <span className="fc-s">{crops.length === 1 ? `${tn(crop)} · ` : ""}{t("ana_next7")}</span>
      </div>

      {/* The crop switch: the same sliding pill as the marketplace's, on ink,
          sized to however many crops the farmer grows that have a forecast. */}
      {crops.length > 1 && (
        <div className="fseg on-ink" role="tablist" aria-label={t("ana_forecast")}>
          <span className="fseg-pill" aria-hidden="true" style={{
            width: `calc((100% - 10px) / ${crops.length})`,
            transform: `translateX(${crops.indexOf(crop) * 100}%)`,
          }} />
          {crops.map(c => (
            <button key={c} role="tab" aria-selected={crop === c} className={`fseg-tab ${crop === c ? "on" : ""}`} onClick={() => pickCrop(c)}>
              {tn(c)}
            </button>
          ))}
        </div>
      )}

      {/* Today → in 7 days: two labelled numbers, then what it means. */}
      <div className="fc-read" key={`r-${crop}`}>
        <div className="fc-col">
          <span className="fc-k">{t("ana_today")}</span>
          <span className="fc-v">{peso(today)}</span>
        </div>
        <ArrowRight size={20} strokeWidth={2.4} className="fc-to" aria-hidden="true" />
        <div className="fc-col">
          <span className="fc-k">{t("ana_in_7_days")}</span>
          <span className="fc-v">{peso(next)}</span>
        </div>
      </div>
      <div className="fc-verdict">
        <span className={`fc-chip ${dir}`}>
          <Arrow size={16} strokeWidth={2.6} aria-hidden="true" />
          {diff >= 0 ? "+" : "−"}{peso(Math.abs(diff))} · {pct >= 0 ? "+" : "−"}{Math.abs(pct).toFixed(1)}%
        </span>
        <span className="fc-say">{t(dir === "up" ? "ana_exp_rise" : dir === "down" ? "ana_exp_fall" : "ana_exp_flat")}</span>
      </div>

      <div className="fc-chart">
        {hover !== null && (
          <div className="fc-tip" style={{ left: `${tipLeft}%` }} aria-hidden="true">
            <span className="fc-tip-k">{when(hover)}</span>
            <span className="fc-tip-v">{peso(value(hover))}</span>
            {hover > nowIdx && <span className="fc-tip-r">{t("ana_likely").replace("{lo}", peso(s[hover].lower)).replace("{hi}", peso(s[hover].upper))}</span>}
          </div>
        )}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="fc-svg"
          role="img"
          aria-label={`${tn(crop)}: ${t("ana_today")} ${peso(today)}, ${t("ana_in_7_days")} ${peso(next)}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onEnd}
          onPointerCancel={onEnd}
          onPointerLeave={onEnd}
        >
          {/* Recessive grid: three round numbers, faint lines. */}
          {ticks.map(v => (
            <g key={v}>
              <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} className="fc-grid" />
              <text x={P.l - 6} y={y(v) + 3.5} className="fc-axis" textAnchor="end">₱{Math.round(v)}</text>
            </g>
          ))}
          {/* Today, as a divider the eye can hang the story on. */}
          <line x1={x(nowIdx)} x2={x(nowIdx)} y1={P.t - 10} y2={H - P.b} className="fc-now" />

          <g className={`fc-plot ${switched ? "swap" : "first"}`} key={crop}>
            <path d={band} className="fc-band" fill={LINE} />
            <path d={line(nowIdx, n - 1)} className="fc-future" stroke={LINE} />
            <path d={line(0, nowIdx)} className="fc-past" stroke={LINE} pathLength={1} />
            {/* Today's dot, ringed in the surface colour so it sits on the line. */}
            <circle cx={x(nowIdx)} cy={y(today)} r={4.5} className="fc-dot" fill="#fff" />
            <g className="fc-end">
              <circle cx={x(n - 1)} cy={y(next)} r={4} fill={LINE} className="fc-dot" />
              <text x={x(n - 1) + 8} y={y(next) + 4} className="fc-endlbl">₱{next.toFixed(1)}</text>
            </g>
          </g>

          {hover !== null && (
            <g className="fc-scrub" aria-hidden="true">
              <line x1={hx} x2={hx} y1={P.t - 10} y2={H - P.b} />
              <circle cx={hx} cy={y(value(hover))} r={5} fill="#fff" stroke={LINE} strokeWidth={2.5} />
            </g>
          )}

          <text x={x(0)} y={H - 7} className="fc-axis" textAnchor="start">{t("ana_last_week")}</text>
          <text x={x(nowIdx)} y={H - 7} className="fc-axis now" textAnchor="middle">{t("ana_today")}</text>
          <text x={x(n - 1)} y={H - 7} className="fc-axis" textAnchor="end">{t("ana_next_week")}</text>
        </svg>
      </div>

      {/* Two series and a band: a legend, drawn with the marks themselves. */}
      <div className="fc-legend">
        <span><i className="solid" style={{ background: LINE }} />{t("ana_actual")}</span>
        <span><i className="dashed" style={{ color: LINE }} />{t("ana_leg_forecast")}</span>
        <span><i className="band" style={{ background: LINE }} />{t("ana_leg_range")}</span>
      </div>
      <p className="fc-hint">{t("ana_scrub_hint")}</p>
      {without.length > 0 && (
        <p className="fc-hint">{t("ana_fc_missing").replace("{crops}", listOf(without))}</p>
      )}
    </section>
  );
}
