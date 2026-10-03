import { ArrowDownRight, ArrowUpRight, ArrowRight, X } from "lucide-react";
import { useLang } from "../../i18n";
import { PriceItem } from "../../services/prices";
import { forecastOf } from "../../data/forecast";
import { historyOf, monthLabel } from "../../data/priceRecords";
import { cropPhoto } from "../../data/cropPhotos";
import { CropIcon } from "../icons";
import { Sheet } from "../ui/Sheet";
import { useRetained } from "../../hooks/usePresence";

// ─── A crop's price sheet ─────────────────────────────────────────────────────
// What opens when a crop is tapped: its photo and name, the price and the
// change from the month before, then its price story (this year's records and
// the forecast). One component, opened from two places: any crop on the
// Prices page, and a farmer's own crop under "Your crops' prices" on Home. A
// farmer asking "what is my rice at?" gets the same answer, in the same
// shape, wherever they ask it.

export const dirOf = (change: number) => (change > 0 ? "up" : change < 0 ? "down" : "flat");
export const peso = (n: number, digits = 2) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

export function Change({ value, big = false }: { value: number; big?: boolean }) {
  const dir = dirOf(value);
  const Arrow = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : ArrowRight;
  return (
    <span className={`pr-chg ${dir} ${big ? "big" : ""}`}>
      <Arrow size={big ? 16 : 14} strokeWidth={2.6} aria-hidden="true" />
      {value > 0 ? "+" : value < 0 ? "−" : ""}{Math.abs(value)}%
    </span>
  );
}

export function Thumb({ item, className }: { item: PriceItem; className: string }) {
  const photo = cropPhoto(item.id);
  return (
    <span className={className}>
      {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropIcon crop={item.group} size={22} />}
    </span>
  );
}

// ── Price story chart ─────────────────────────────────────────────────────────
// The variety's own records for the year, solid, then the LSTM's forecast
// for the months after, dashed. The chart starts at January of the year the
// newest record is in, so with the forecast it reads as one calendar year:
// January to September recorded, October to December expected. Early in a
// year, before three of its months are on record, there is too little to
// draw, so it shows the last 12 months instead. A variety with no records
// says so and draws nothing: no line is better than an invented one.
function PriceStory({ item }: { item: PriceItem }) {
  const { t, lang } = useLang();
  const history = historyOf(item.id);
  const year = history.length ? history[history.length - 1].month.slice(0, 4) : "";
  const thisYear = history.filter(p => p.month.startsWith(year));
  const wholeYear = thisYear.length >= 3;
  const records = wholeYear ? thisYear : history.slice(-12);
  if (records.length < 3) return <p className="pr-story-none">{t("mkt_no_history")}</p>;

  const run = forecastOf(item.id, "lstm");
  const past = records.map(p => p.price);
  const next = run ? run.next.map(p => p.price) : [];
  const all = [...past, ...next];
  const lo = Math.min(...past), hi = Math.max(...past);
  const months = String(records.length);
  // "2026 prices and forecast", or "Past 12 months and forecast" early in a year.
  const title = wholeYear
    ? t(run ? "mkt_history_year" : "mkt_history_year_only").replace("{year}", year)
    : t(run ? "mkt_history" : "mkt_history_only").replace("{n}", months);
  const lowLabel = wholeYear ? t("mkt_low_year").replace("{year}", year) : t("mkt_low").replace("{n}", months);
  const highLabel = wholeYear ? t("mkt_high_year").replace("{year}", year) : t("mkt_high").replace("{n}", months);

  const W = 320, H = 118, PX = 8, PY = 14;
  const min = Math.min(...all), max = Math.max(...all), span = max - min || 1;
  const x = (i: number) => PX + (i * (W - PX * 2)) / (all.length - 1);
  const y = (v: number) => PY + (1 - (v - min) / span) * (H - PY * 2);
  const pastD = past.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const ti = past.length - 1;
  const nextD = [past[ti], ...next].map((v, i) => `${i ? "L" : "M"}${x(ti + i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${pastD} L${x(ti).toFixed(1)} ${H} L${x(0)} ${H} Z`;
  const end = next.length ? next[next.length - 1] : past[ti];
  const dir = dirOf(end - past[ti]);
  const lastMonth = run ? run.next[run.next.length - 1].month : records[ti].month;
  // Every month drawn, recorded then forecast, and which of them get a label
  // under the chart when it shows the year: the start of each quarter (Jan,
  // Apr, Jul, Oct) and the last month. A quarter's label right beside the
  // last one is dropped, so two never touch.
  const plotted = [...records.map(p => p.month), ...(run ? run.next.map(p => p.month) : [])];
  const lastPoint = plotted.length - 1;
  const ticks = wholeYear
    ? plotted.map((_, i) => i).filter(i => i === lastPoint || (Number(plotted[i].slice(5)) % 3 === 1 && lastPoint - i > 1))
    : null;

  return (
    <div className="pr-story">
      <div className="pr-story-head">
        <span className="pr-story-title">{title}</span>
        <span className="pr-legend">
          <span className="pr-key solid" /> {t("mkt_actual")}
          {run && <><span className="pr-key dashed" /> {t("mkt_forecast")}</>}
        </span>
      </div>
      <svg className={`pr-chart ${dir}`} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`${item.name}: ${records.map(p => `${monthLabel(p.month, lang, "short", true)} ${peso(p.price)}`).join(", ")}${run ? `; ${t("mkt_forecast")} ${run.next.map(p => `${monthLabel(p.month, lang, "short", true)} ${peso(p.price)}`).join(", ")}` : ""}`}>
        <defs>
          <linearGradient id="pr-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity=".18" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line className="pr-today" x1={x(ti)} x2={x(ti)} y1={4} y2={H} />
        <path d={area} fill="url(#pr-fill)" className="pr-area" />
        <path d={pastD} className="pr-line" pathLength={1} />
        {run && <path d={nextD} className="pr-next" />}
        <circle cx={x(ti)} cy={y(past[ti])} r={5.5} className="pr-dot" />
      </svg>
      <div className="pr-axis" aria-hidden="true">
        {ticks ? (
          // The year at a glance: Jan, Apr, Jul, Oct and the last month, each
          // under its own point. No year on them: the title already says it.
          ticks.map(i => (
            <span key={i} style={i === 0 ? { left: 0 } : i === lastPoint ? { right: 0 } : { left: `${(x(i) / W) * 100}%`, transform: "translateX(-50%)" }}>
              {monthLabel(plotted[i], lang, "short", !plotted[i].startsWith(year))}
            </span>
          ))
        ) : (
          // The last 12 months cross two years, so three anchors with the
          // year: where it started, the newest record, where it's headed.
          <>
            <span style={{ left: 0 }}>{monthLabel(records[0].month, lang, "short", true)}</span>
            {run && <span style={{ left: `${(x(ti) / W) * 100}%`, transform: "translateX(-50%)" }} className="now">{monthLabel(records[ti].month, lang)}</span>}
            <span style={{ right: 0 }} className={run ? "" : "now"}>{monthLabel(lastMonth, lang, "short", !run)}</span>
          </>
        )}
      </div>
      <div className="pr-facts">
        <div><span>{lowLabel}</span><strong>{peso(lo)}</strong></div>
        <div><span>{highLabel}</span><strong>{peso(hi)}</strong></div>
        {run && <div><span>{monthLabel(lastMonth, lang, "long")}</span><strong className={run.reliable ? dir : ""}>{peso(end)}</strong></div>}
      </div>
      {/* Who made the forecast and how far off it has been, said plainly. */}
      {run && (
        <p className="pr-note">
          {t("mkt_chart_note")} {t("mkt_chart_acc").replace("{pct}", String(Math.round(run.mape)))}
          {!run.reliable && ` ${t("mkt_chart_swings")}`}
        </p>
      )}
    </div>
  );
}

export function PriceSheet({ item, onClose }: { item: PriceItem | null; onClose: () => void }) {
  const { t, tn } = useLang();
  // Keeps the sheet filled while it slides away after `item` is cleared.
  const shown = useRetained(item);
  return (
    <Sheet open={!!item} onClose={onClose} className="pr-sheet modal-sheet" label={shown?.name ?? t("market_title")}>
      {shown && (
        <>
          <div className="pr-sheet-hero">
            <Thumb item={shown} className="pr-sheet-photo" />
            <div className="pr-sheet-shade" />
            <div className="pr-sheet-id">
              <div className="pr-sheet-group">{tn(shown.group)}</div>
              <div className="pr-sheet-name">{shown.name}</div>
            </div>
            <button className="pr-sheet-x" onClick={onClose} aria-label={t("close")}>
              <X size={22} strokeWidth={2.4} />
            </button>
          </div>
          <div className="pr-sheet-body">
            <div className="pr-sheet-price">
              <span className="pr-big">{peso(shown.pricePerKg)}<small>{t("per_kg_short")}</small></span>
              <Change value={shown.change} big />
            </div>
            <div className="pr-sheet-sub">{t("mkt_change_month")}</div>
            <PriceStory item={shown} />
          </div>
        </>
      )}
    </Sheet>
  );
}
