import { useRef, useState } from "react";
import { EmptyState, ErrorState, SkeletonList } from "../components/states";
import { useResource } from "../hooks/useResource";
import { fetchPrices, PriceItem } from "../services/prices";
import { ArrowDownRight, ArrowUpRight, ArrowRight, Search, ChevronRight, X } from "lucide-react";
import { haptic } from "../lib/platform";
import { useLang } from "../i18n";
import { UserRole } from "../types";
import { CROP_FAMILIES, FAMILY_GROUPS } from "../data/crops";
import { forecastOf } from "../data/forecast";
import { historyOf, latestMonth, monthLabel } from "../data/priceRecords";
import { Hdr } from "../components/layout/Hdr";
import { CropIcon } from "../components/icons";
import { cropPhoto, cropGroupPhoto } from "../data/cropPhotos";
import { Sheet } from "../components/ui/Sheet";
import { useRetained } from "../hooks/usePresence";
import mascotBasket from "../assets/mascot-basket.webp";
import basketBlink from "../assets/mascot-basket-blink.webp";
import basketMouthHalf from "../assets/mascot-basket-mouth-half.webp";
import basketMouthShut from "../assets/mascot-basket-mouth-shut.webp";

// ─── Prices ───────────────────────────────────────────────────────────────────
// Reads top to bottom as three questions:
//   1. How's the market?         → one line and a bar: how many went up
//   2. What moved the most?      → a swipeable row of photo cards
//   3. What's my crop at?        → search, filter, the full list
// Every crop opens a sheet with its price story: the past 12 months of
// records and the next 3 where the forecast has them.
//
// Prices are monthly records, so every move here is "from the month before",
// and the card at the top names the month the prices are for.

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
// The variety's own records: up to the last 12 months, solid, then the LSTM's
// forecast for the months after, dashed. A variety with no records says so
// and draws nothing: no line is better than an invented one.
function PriceStory({ item }: { item: PriceItem }) {
  const { t, lang } = useLang();
  const records = historyOf(item.id).slice(-12);
  if (records.length < 3) return <p className="pr-story-none">{t("mkt_no_history")}</p>;

  const run = forecastOf(item.id, "lstm");
  const past = records.map(p => p.price);
  const next = run ? run.next.map(p => p.price) : [];
  const all = [...past, ...next];
  const lo = Math.min(...past), hi = Math.max(...past);
  const months = String(records.length);

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

  return (
    <div className="pr-story">
      <div className="pr-story-head">
        <span className="pr-story-title">{t(run ? "mkt_history" : "mkt_history_only").replace("{n}", months)}</span>
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
      {/* Three anchors, not fifteen labels: where it started, the newest
          record, where it's headed. */}
      <div className="pr-axis" aria-hidden="true">
        <span style={{ left: 0 }}>{monthLabel(records[0].month, lang, "short", true)}</span>
        {run && <span style={{ left: `${(x(ti) / W) * 100}%`, transform: "translateX(-50%)" }} className="now">{monthLabel(records[ti].month, lang)}</span>}
        <span style={{ right: 0 }} className={run ? "" : "now"}>{monthLabel(lastMonth, lang, "short", !run)}</span>
      </div>
      <div className="pr-facts">
        <div><span>{t("mkt_low").replace("{n}", months)}</span><strong>{peso(lo)}</strong></div>
        <div><span>{t("mkt_high").replace("{n}", months)}</span><strong>{peso(hi)}</strong></div>
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

// ─── Screen ───────────────────────────────────────────────────────────────────
export function MarketScreen({ onProfile, isOffline, lastUpdated, onBack, userInitials = "JD", userRole }: { onProfile: () => void; isOffline: boolean; lastUpdated: string; onBack: () => void; userInitials?: string; userRole?: UserRole }) {
  const { t, tn, lang } = useLang();
  // The month the records run to, named on the card at the top.
  const priceMonth = latestMonth();
  const pulseLabel = priceMonth ? t("mkt_pulse_label").replace("{month}", monthLabel(priceMonth, lang, "long", true)) : t("mkt_pulse_latest");
  // Prices arrive through a resource, so this screen has a real loading path,
  // a real failure path, and a real offline path.
  const prices = useResource(fetchPrices, []);
  const ALL_ITEMS = prices.data ?? [];
  // Crops, vegetables or fruits: the same three families as the marketplace
  // and Home, so a buyer or farmer sorts prices the way they sort harvests.
  const FAMS = ["All", ...CROP_FAMILIES];
  const [fam, setFam] = useState("All");
  const [search, setSearch] = useState("");
  /* The green key at the end of the bar puts this keyboard away. */
  const searchRef = useRef<HTMLInputElement>(null);
  // Where "search" takes the eye: the count above the list.
  const resultsRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<PriceItem | null>(null);
  // The green search key, and the keyboard's own Search key. With nothing
  // typed, it opens the keyboard in the field. With a search typed, the list
  // has already filtered, so it puts the keyboard away and brings the
  // results up to the top of the screen, where they can be seen. It used to
  // only close the keyboard, which from the outside looked like nothing.
  const runSearch = () => {
    haptic.select();
    const field = searchRef.current;
    if (!field) return;
    if (!search.trim()) { field.focus(); return; }
    field.blur();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultsRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  };

  // Keeps the sheet filled while it slides away after `open` is cleared.
  const shown = useRetained(open);

  const filtered = ALL_ITEMS.filter(c => {
    const matchFam = fam === "All" || (FAMILY_GROUPS[fam] ?? []).includes(c.group);
    // A search for "rice" or "sibuyas" finds the crop as well as its varieties.
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q) || tn(c.group).toLowerCase().includes(q);
    return matchFam && matchSearch;
  });

  const up = ALL_ITEMS.filter(c => c.change > 0).length;
  const down = ALL_ITEMS.filter(c => c.change < 0).length;
  const flat = ALL_ITEMS.length - up - down;
  const movers = [...ALL_ITEMS].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 6);
  // Whether the market is good news for the person reading it: rising
  // prices are a good time to sell, falling ones a good time to buy. How the
  // farmer arrives says which, so the same numbers read right for both.
  const goodDay = userRole === "buyer" ? down > up : up > down;
  const [headA, headB = ""] = t("mkt_pulse_head").split("{up}");

  return (
    <div className="screen">
      <Hdr title={t("market_title")} onBack={onBack} />
      <div className="scroll screen-enter">

        {/* 1 ── The market, and the month its prices are for ── */}
        <section className={`pr-pulse ${prices.status === "ready" ? "has-mascot" : ""}`} aria-label={pulseLabel}>
          <div className="pr-pulse-lbl">{pulseLabel} · Nueva Ecija</div>
          {prices.status === "ready" ? (
            <>
              {/* The count that answers the question, in the colour of its
                  bar below, so the headline and the proof read as one. */}
              <div className="pr-pulse-head">
                {headA}<span className="pr-num">{up}</span>{headB.replace("{n}", String(ALL_ITEMS.length))}
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
          {/* A farmer with the day's basket, standing behind the card's
              bottom edge. A good day for you: he lifts it up with a little
              bounce. Otherwise he simply rises into view. Then he blinks and
              chats, on a loop: the lids and two mouth shapes are layers
              drawn on the same canvas as the picture, shown in turn.
              Decoration with a meaning, so hidden from screen readers: the
              headline says it. */}
          {prices.status === "ready" && (
            <div className={`pr-mascot basket ${goodDay ? "good" : ""}`} aria-hidden="true">
              <div className="pb-fig">
                <img src={mascotBasket} alt="" width={420} height={474} decoding="async" />
                <img className="pb-blink" src={basketBlink} alt="" width={420} height={474} decoding="async" />
                <img className="pb-mouth half" src={basketMouthHalf} alt="" width={420} height={474} decoding="async" />
                <img className="pb-mouth shut" src={basketMouthShut} alt="" width={420} height={474} decoding="async" />
              </div>
            </div>
          )}
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
            <Search size={21} strokeWidth={2.4} aria-hidden="true" />
            <input ref={searchRef} placeholder={t("market_search_ph")} value={search} onChange={e => setSearch(e.target.value)} enterKeyHint="search"
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); runSearch(); } }} />
            {search && (
              <button className="pr-clear" onClick={() => setSearch("")} aria-label={t("state_clear_search")}>
                <X size={16} strokeWidth={2.6} />
              </button>
            )}
            {/* The same green key as Home's bar. The list has already filtered
                as you typed, so pressing it puts the keyboard away and hands the
                screen back to the results. */}
            <button
              className="search-go"
              aria-label={t("search")}
              onMouseDown={e => e.preventDefault()}
              onClick={runSearch}
            >
              <Search size={20} strokeWidth={2.8} />
            </button>
          </div>

          {/* The same switch as the marketplace's: one pill sliding in a
              well, four choices instead of eleven chips. */}
          <div className="fseg pr-fseg" role="tablist" aria-label={t("mp_family")}>
            <span className="fseg-pill" aria-hidden="true" style={{ transform: `translateX(${FAMS.indexOf(fam) * 100}%)` }} />
            {FAMS.map(f => (
              <button key={f} role="tab" aria-selected={fam === f} className={`fseg-tab ${fam === f ? "on" : ""}`}
                onClick={() => { haptic.select(); setFam(f); }}>
                {/* Always in English, like the marketplace's switch and
                    Home's family cards. */}
                {f}
              </button>
            ))}
          </div>

          <div className="mkt-list-hdr" ref={resultsRef}>
            {t("mkt_prices_count").replace("{n}", String(filtered.length)).replace("{g}", String(new Set(filtered.map(c => c.group)).size))}
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

          {/* Organised the way the prices are: family, then crop, then its
              varieties. Each crop is one card with its photo and price range
              on top, so "what is rice at?" is answered by one card, not by
              three rows with the same picture. Keyed on the family, not the
              search: switching families replaces the list with a fade; typing
              narrows it and must not flash on every keystroke. */}
          {prices.status === "ready" && filtered.length > 0 && (
            <div className="pr-fams content-in" key={fam}>
              {CROP_FAMILIES.map(family => {
                const groups = (FAMILY_GROUPS[family] ?? [])
                  .map(g => ({ name: g, items: filtered.filter(c => c.group === g) }))
                  .filter(g => g.items.length > 0);
                if (groups.length === 0) return null;
                return (
                  <section className={`pr-fam ${family.toLowerCase()}`} key={family}>
                    <h3 className="pr-fam-t">
                      <span className="pr-fam-dot" aria-hidden="true" />
                      {/* The same word as its tab above. */}
                      {family}
                      <span className="pr-fam-n">{groups.length}</span>
                    </h3>
                    {groups.map(g => {
                      const kgs = g.items.map(c => c.pricePerKg);
                      const lo = Math.min(...kgs), hi = Math.max(...kgs);
                      const photo = cropGroupPhoto(g.name);
                      return (
                        <div className="pr-grp" key={g.name}>
                          <div className="pr-grp-head">
                            <span className="pr-grp-photo">
                              {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropIcon crop={g.name} size={22} />}
                            </span>
                            <span className="pr-grp-body">
                              <span className="pr-grp-name">{tn(g.name)}</span>
                              <span className="pr-grp-sub">
                                {g.items.length === 1 ? t("mkt_variety_one") : t("mkt_varieties").replace("{n}", String(g.items.length))}
                                {" · "}
                                {lo === hi ? peso(lo, 0) : `${peso(lo, 0)}–${peso(hi, 0).replace("₱", "")}`}{t("per_kg_short")}
                              </span>
                            </span>
                          </div>
                          <div className="pr-grp-rows">
                            {g.items.map(c => (
                              <button className="pr-vrow" key={c.id} onClick={() => setOpen(c)}>
                                <span className="pr-vrow-name">{c.name}</span>
                                <span className="pr-vrow-price">{peso(c.pricePerKg)}<small>{t("per_kg_short")}</small></span>
                                <Change value={c.change} />
                                <ChevronRight size={18} className="pr-row-chev" aria-hidden="true" />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </section>
                );
              })}
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
              <div className="pr-sheet-sub">{t("mkt_change_month")}</div>
              <PriceStory item={shown} />
            </div>
          </>
        )}
      </Sheet>
    </div>
  );
}
