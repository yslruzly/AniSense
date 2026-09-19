import { useState } from "react";
import { EmptyState, ErrorState, SkeletonList } from "../components/states";
import { useResource } from "../hooks/useResource";
import { fetchPrices, PriceItem } from "../services/prices";
import { ArrowDownRight, ArrowUpRight, ArrowRight, Search, ChevronRight, X } from "lucide-react";
import { useLang } from "../i18n";
import { UserRole } from "../types";
import { CROP_GROUPS } from "../data/crops";
import { LSTM_DATA } from "../data/forecast";
import { Hdr } from "../components/layout/Hdr";
import { CropIcon } from "../components/icons";
import { cropPhoto } from "../data/cropPhotos";
import { Sheet } from "../components/ui/Sheet";
import { useRetained } from "../hooks/usePresence";

// ─── Prices ───────────────────────────────────────────────────────────────────
// Reads top to bottom as three questions:
//   1. How's the market today?   → one line and a bar: how many went up
//   2. What moved the most?      → a swipeable row of photo cards
//   3. What's my crop at?        → search, filter, the full list
// Every crop opens a sheet with its price story: last 7 days and the next 3
// where the forecast has it. The chevrons used to promise that and do nothing.

const dirOf = (change: number) => (change > 0 ? "up" : change < 0 ? "down" : "flat");
const peso = (n: number, digits = 2) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

function Change({ value, big = false }: { value: number; big?: boolean }) {
  const dir = dirOf(value);
  const Arrow = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : ArrowRight;
  return (
    <span className={`pr-chg ${dir} ${big ? "big" : ""}`}>
      <Arrow size={big ? 16 : 14} strokeWidth={2.6} aria-hidden="true" />
      {value > 0 ? "+" : value < 0 ? "−" : ""}{Math.abs(value)}%
    </span>
  );
}

function Thumb({ item, className }: { item: PriceItem; className: string }) {
  const photo = cropPhoto(item.id);
  return (
    <span className={className}>
      {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropIcon crop={item.group} size={22} />}
    </span>
  );
}

// ── Price story chart ─────────────────────────────────────────────────────────
// The LSTM run is per crop group and at its own price level; its shape is
// scaled onto this variety's price so the line ends exactly at today's number.
function PriceStory({ item }: { item: PriceItem }) {
  const { t, lang } = useLang();
  const locale = lang === "tl" ? "fil-PH" : "en-PH";
  const run = LSTM_DATA[item.group];
  if (!run) return <p className="pr-story-none">{t("mkt_no_history")}</p>;

  const now = run.series.find(p => p.day === "Now")?.actual ?? run.current;
  const k = item.pricePerKg / now;
  const past = run.series.filter(p => p.actual !== null).map(p => (p.actual as number) * k);   // D-6 … Now
  const next = run.series.filter(p => p.actual === null).slice(0, 3).map(p => p.predicted * k); // +1 … +3
  const all = [...past, ...next];
  const lo = Math.min(...past), hi = Math.max(...past);

  const W = 320, H = 118, PX = 8, PY = 14;
  const min = Math.min(...all), max = Math.max(...all), span = max - min || 1;
  const x = (i: number) => PX + (i * (W - PX * 2)) / (all.length - 1);
  const y = (v: number) => PY + (1 - (v - min) / span) * (H - PY * 2);
  const pastD = past.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const ti = past.length - 1;
  const nextD = [past[ti], ...next].map((v, i) => `${i ? "L" : "M"}${x(ti + i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${pastD} L${x(ti).toFixed(1)} ${H} L${x(0)} ${H} Z`;
  const dir = dirOf(next[next.length - 1] - past[ti]);

  const day = (offset: number) => {
    const d = new Date(); d.setDate(d.getDate() + offset);
    return d.toLocaleDateString(locale, { weekday: "short" });
  };

  return (
    <div className="pr-story">
      <div className="pr-story-head">
        <span className="pr-story-title">{t("mkt_history")}</span>
        <span className="pr-legend">
          <span className="pr-key solid" /> {t("mkt_actual")}
          <span className="pr-key dashed" /> {t("mkt_forecast")}
        </span>
      </div>
      <svg className={`pr-chart ${dir}`} viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`${item.name}: ${past.map(v => peso(v)).join(", ")}; ${t("mkt_forecast")} ${next.map(v => peso(v)).join(", ")}`}>
        <defs>
          <linearGradient id="pr-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity=".18" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line className="pr-today" x1={x(ti)} x2={x(ti)} y1={4} y2={H} />
        <path d={area} fill="url(#pr-fill)" className="pr-area" />
        <path d={pastD} className="pr-line" pathLength={1} />
        <path d={nextD} className="pr-next" />
        <circle cx={x(ti)} cy={y(past[ti])} r={5.5} className="pr-dot" />
      </svg>
      {/* Three anchors, not ten labels: where it started, today, where it's headed. */}
      <div className="pr-axis" aria-hidden="true">
        <span style={{ left: 0 }}>{day(-6)}</span>
        <span style={{ left: `${(x(ti) / W) * 100}%`, transform: "translateX(-50%)" }} className="now">{t("ana_today")}</span>
        <span style={{ right: 0 }}>{day(3)}</span>
      </div>
      <div className="pr-facts">
        <div><span>{t("mkt_low")}</span><strong>{peso(lo)}</strong></div>
        <div><span>{t("mkt_high")}</span><strong>{peso(hi)}</strong></div>
        <div><span>{t("mkt_in_3")}</span><strong className={dir}>{peso(next[next.length - 1])}</strong></div>
      </div>
      <p className="pr-note">{t("mkt_chart_note")}</p>
    </div>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export function MarketScreen({ onProfile, isOffline, lastUpdated, onBack, userInitials = "JD" }: { onProfile: () => void; isOffline: boolean; lastUpdated: string; onBack: () => void; userInitials?: string; userRole?: UserRole }) {
  const { t, tn } = useLang();
  // Prices arrive through a resource, so this screen has a real loading path,
  // a real failure path, and a real offline path.
  const prices = useResource(fetchPrices, []);
  const ALL_ITEMS = prices.data ?? [];
  const categories = ["All", "Rice", ...CROP_GROUPS.map(g => g.group)];
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<PriceItem | null>(null);
  // Keeps the sheet filled while it slides away after `open` is cleared.
  const shown = useRetained(open);

  const filtered = ALL_ITEMS.filter(c => {
    const matchCat = activeCat === "All" || c.group === activeCat;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const up = ALL_ITEMS.filter(c => c.change > 0).length;
  const down = ALL_ITEMS.filter(c => c.change < 0).length;
  const flat = ALL_ITEMS.length - up - down;
  const movers = [...ALL_ITEMS].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 6);

  return (
    <div className="screen">
      <Hdr title={t("market_title")} onProfile={onProfile} onBack={onBack} userInitials={userInitials} />
      <div className="scroll screen-enter">

        {/* 1 ── Today's market ── */}
        <section className="pr-pulse" aria-label={t("mkt_pulse_label")}>
          <div className="pr-pulse-lbl">{t("mkt_pulse_label")} · Nueva Ecija</div>
          {prices.status === "ready" ? (
            <>
              <div className="pr-pulse-head">
                {t("mkt_pulse_head").replace("{up}", String(up)).replace("{n}", String(ALL_ITEMS.length))}
              </div>
              {/* Breadth bar: the share that rose, held, and fell. Colour plus
                  a counted legend underneath, never colour alone. */}
              <div className="pr-breadth" aria-hidden="true">
                {up > 0 && <span className="seg up" style={{ flexGrow: up }} />}
                {flat > 0 && <span className="seg flat" style={{ flexGrow: flat }} />}
                {down > 0 && <span className="seg down" style={{ flexGrow: down }} />}
              </div>
              <div className="pr-breadth-key">
                <span><i className="up" /> {up} {t("mkt_up")}</span>
                {flat > 0 && <span><i className="flat" /> {flat} {t("mkt_same")}</span>}
                <span><i className="down" /> {down} {t("mkt_down")}</span>
              </div>
            </>
          ) : (
            <div className="pr-pulse-head muted">{t("state_loading_prices")}</div>
          )}
          {/* Freshness belongs with the numbers it's about, not at the foot
              of a long list where nobody scrolls to it. */}
          <div className={`pr-fresh ${isOffline ? "off" : ""}`}>
            <span className="pr-fresh-dot" />
            {isOffline ? t("market_offline_cached") : `${t("market_up_to_date")} · ${lastUpdated}`}
          </div>
        </section>

        {/* 2 ── Biggest moves ── */}
        {prices.status === "ready" && movers.length > 0 && (
          <section>
            <h2 className="pr-sec">{t("mkt_movers")}</h2>
            <div className="pr-movers stagger-list">
              {movers.map(c => (
                <button key={c.id} className="pr-mover" onClick={() => setOpen(c)}>
                  <Thumb item={c} className="pr-mover-photo" />
                  <span className="pr-mover-body">
                    <span className="pr-mover-name">{c.name}</span>
                    <span className="pr-mover-price">{peso(c.pricePerKg, 0)}<small>{t("per_kg_short")}</small></span>
                    <Change value={c.change} />
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 3 ── All prices ── */}
        <section className="pr-all">
          <h2 className="pr-sec">{t("mkt_all")}</h2>
          <div className="search-box">
            <Search size={18} color="var(--text-faint)" />
            <input placeholder={t("market_search_ph")} value={search} onChange={e => setSearch(e.target.value)} enterKeyHint="search" />
            {search && (
              <button className="pr-clear" onClick={() => setSearch("")} aria-label={t("state_clear_search")}>
                <X size={16} strokeWidth={2.6} />
              </button>
            )}
          </div>

          <div className="frow">
            {categories.map(cat => (
              <button key={cat} className={`fchip ${activeCat === cat ? "on" : ""}`} onClick={() => setActiveCat(cat)}>
                {cat === "All" ? t("all") : tn(cat)}
              </button>
            ))}
          </div>

          <div className="mkt-list-hdr">
            {filtered.length} {filtered.length === 1 ? t("market_crop_count_one") : t("market_crops_count")}{activeCat !== "All" ? ` ${t("market_in")} ${tn(activeCat)}` : ""}
          </div>

          {prices.showSkeleton && <SkeletonList rows={6} label={t("state_loading_prices")} />}

          {prices.status === "error" && (
            <ErrorState title={t("state_error_title")} body={t("state_error_body")} retryLabel={t("state_retry")} onRetry={prices.reload} />
          )}

          {prices.status === "ready" && filtered.length === 0 && (
            <EmptyState
              icon={<Search size={26} aria-hidden="true" />}
              title={t("state_no_match_title")}
              body={t("state_no_match_body")}
              action={search ? t("state_clear_search") : undefined}
              onAction={search ? () => setSearch("") : undefined}
            />
          )}

          {/* Keyed on the category, not the search text: switching category
              replaces the whole list and gets a fade; typing narrows it a row
              at a time and must not flash on every keystroke. */}
          {prices.status === "ready" && filtered.length > 0 && (
            <div className="pr-list content-in" key={activeCat}>
              {filtered.map(c => (
                <button className="pr-row" key={c.id} onClick={() => setOpen(c)}>
                  <Thumb item={c} className="pr-row-photo" />
                  <span className="pr-row-body">
                    <span className="pr-row-name">{c.name}</span>
                    <span className="pr-row-group">{tn(c.group)}</span>
                  </span>
                  <span className="pr-row-end">
                    <span className="pr-row-price">{peso(c.pricePerKg)}<small>{t("per_kg_short")}</small></span>
                    <Change value={c.change} />
                  </span>
                  <ChevronRight size={18} className="pr-row-chev" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Crop detail ── */}
      <Sheet open={!!open} onClose={() => setOpen(null)} className="pr-sheet modal-sheet" label={shown?.name ?? t("market_title")}>
        {shown && (
          <>
            <div className="pr-sheet-hero">
              <Thumb item={shown} className="pr-sheet-photo" />
              <div className="pr-sheet-shade" />
              <div className="pr-sheet-id">
                <div className="pr-sheet-group">{tn(shown.group)}</div>
                <div className="pr-sheet-name">{shown.name}</div>
              </div>
              <button className="pr-sheet-x" onClick={() => setOpen(null)} aria-label={t("close")}>
                <X size={22} strokeWidth={2.4} />
              </button>
            </div>
            <div className="pr-sheet-body">
              <div className="pr-sheet-price">
                <span className="pr-big">{peso(shown.pricePerKg)}<small>{t("per_kg_short")}</small></span>
                <Change value={shown.change} big />
              </div>
              <div className="pr-sheet-sub">{t("mkt_change_today")}</div>
              <PriceStory item={shown} />
            </div>
          </>
        )}
      </Sheet>
    </div>
  );
}
