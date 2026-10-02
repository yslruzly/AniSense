import { useRef, useState } from "react";
import { EmptyState, ErrorState, SkeletonList } from "../components/states";
import { useResource } from "../hooks/useResource";
import { fetchPrices, PriceItem } from "../services/prices";
import { Search, ChevronRight, X, Star } from "lucide-react";
import { haptic } from "../lib/platform";
import { useLang } from "../i18n";
import { UserRole } from "../types";
import { CROP_FAMILIES, FAMILY_GROUPS } from "../data/crops";
import { hasRecords, latestMonth, monthLabel } from "../data/priceRecords";
import { Hdr } from "../components/layout/Hdr";
import { CropIcon } from "../components/icons";
import { cropGroupPhoto } from "../data/cropPhotos";
import { PriceSheet, Change, Thumb, peso } from "../components/PriceSheet";
import mascotBasket from "../assets/mascot-basket.webp";
import basketBlink from "../assets/mascot-basket-blink.webp";
import basketMouthHalf from "../assets/mascot-basket-mouth-half.webp";
import basketMouthShut from "../assets/mascot-basket-mouth-shut.webp";

// ─── Prices ───────────────────────────────────────────────────────────────────
// Reads top to bottom as three questions:
//   1. How's the market?         → one line and a bar: how many went up
//   2. What moved the most?      → a swipeable row of photo cards
//   3. What's my crop at?        → search, filter, the full list
// Every crop opens a sheet with its price story: this year's records from
// January, and the next 3 months where the forecast has them
// (components/PriceSheet.tsx, shared with Home).
//
// The list opens with AniSense's focus crops, the ones the study covers and
// keeps real records for (rice, onion, garlic, calamansi), pinned above the
// families. They stay in their families below as well, so the full list is
// still complete and nothing has moved from where it was.
//
// Prices are monthly records, so every move here is "from the month before",
// and the card at the top names the month the prices are for.

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


  const filtered = ALL_ITEMS.filter(c => {
    const matchFam = fam === "All" || (FAMILY_GROUPS[fam] ?? []).includes(c.group);
    // A search for "rice" or "sibuyas" finds the crop as well as its varieties.
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q) || tn(c.group).toLowerCase().includes(q);
    return matchFam && matchSearch;
  });

  // The focus crops: the varieties with price records, grouped by crop in
  // the same order as the families below. They follow the search and the
  // family switch like everything else in the list.
  const focusGroups = CROP_FAMILIES.flatMap(f => FAMILY_GROUPS[f] ?? [])
    .map(g => ({ name: g, items: filtered.filter(c => c.group === g && hasRecords(c.id)) }))
    .filter(g => g.items.length > 0);

  // One crop: its photo, how many varieties and the range they sell in, then
  // the varieties as rows.
  const groupCard = (g: { name: string; items: PriceItem[] }) => {
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
  };

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
              {/* AniSense's focus crops first: the ones with real records. */}
              {focusGroups.length > 0 && (
                <section className="pr-fam focus" aria-labelledby="pr-focus-t">
                  <h3 className="pr-fam-t" id="pr-focus-t">
                    <Star size={14} strokeWidth={0} fill="currentColor" className="pr-fam-star" aria-hidden="true" />
                    {t("mkt_focus")}
                    <span className="pr-fam-n">{focusGroups.length}</span>
                  </h3>
                  <p className="pr-fam-s">{t("mkt_focus_sub")}</p>
                  {focusGroups.map(groupCard)}
                </section>
              )}
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
                    {groups.map(groupCard)}
                  </section>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ── Crop detail: the same sheet Home opens for a farmer's own crop ── */}
      <PriceSheet item={open} onClose={() => setOpen(null)} />
    </div>
  );
}
