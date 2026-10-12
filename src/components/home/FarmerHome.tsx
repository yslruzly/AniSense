import { useId } from "react";
import { ChevronRight, Plus, ArrowUp, ArrowDown, Package, ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import { useLang } from "../../i18n";
import { CROPS, CROP_GROUP_BY_ID, hasPrice } from "../../data/crops";
import { growArtFor } from "../../data/growArt";
import { CropIcon } from "../icons";
import { useMarket } from "../../store/market";
import { Skeleton, SkeletonMediaRows } from "../states";
import { peso, toCents } from "../../lib/money";
import { SAMPLE_HARVEST } from "../../data/demo/marketplace";
import { cropPhoto } from "../../data/cropPhotos";
import { historyOf } from "../../data/priceRecords";
import { CropPrice } from "../../types";
import leafMask from "../../assets/anisense-leaf-mask.png";

// ─── Your harvest ─────────────────────────────────────────────────────────────
// The farmer's own half of the marketplace, on Home. Everything else on this
// page is reading: prices, forecasts, advice. This is the one block about
// their business — what they have on sale, what it is worth, and the button
// to put up more. A listing here opens in the marketplace, where it can be
// changed or removed: the farmer's own list is where they look for it.
//
// Before their first post, sample listings stand in, tagged Sample with a
// line saying what they are, so a new farmer sees what this card will hold.
// They are only read: nothing to open, no chevron. The first real listing
// replaces them all.

/** Today's price for the crop a listing names, so a price can be compared. */
function marketPrice(crop: string, variety: string) {
  const named = CROPS.find(c => c.name.toLowerCase() === (variety || "").toLowerCase() || c.name.toLowerCase() === crop.toLowerCase())
    ?? CROPS.find(c => CROP_GROUP_BY_ID[c.id] === crop);
  // A crop with no market price (₱0) has nothing to be above or below.
  return named && hasPrice(named) ? named.pricePerKg : null;
}

export function YourHarvest({ onPost, onOpenMarket, onOpen }: {
  onPost: () => void;
  onOpenMarket: () => void;
  /** One of their listings, opened in the marketplace (Edit, Remove). */
  onOpen: (id: string) => void;
}) {
  const { t, tn } = useLang();
  const { listings, isMine, loadPhase } = useMarket();
  const mine = listings.filter(isMine);
  // Samples only once the Market has answered. With nothing loaded at all
  // (offline, nothing saved) nobody knows yet whether they have listings,
  // and samples would stand in for real ones: then it says nothing is on sale.
  const samples = mine.length === 0 && listings.length > 0;
  const shown = samples ? SAMPLE_HARVEST : mine;
  // What the harvest on sale is worth at the price they set: kilos × price.
  // Their asking price, not a forecast, and not a promise that it sells —
  // which is what the line above the figure says.
  const value = shown.reduce((sum, l) => sum + l.kg * l.pricePerKg, 0);
  const kilos = shown.reduce((sum, l) => sum + l.kg, 0);
  const total = peso(value);

  return (
    <section className="fh" aria-labelledby="fh-t" data-tour="harvest">
      {/* The AniSense leaf, large and faint, off the card's top corner. */}
      <img className="fh-mark" src={leafMask} alt="" aria-hidden="true" />
      <div className="fh-head">
        <h2 className="fh-title" id="fh-t">
          {t("fh_title")}
          {samples && <span className="ph-sample">{t("mp_sample")}</span>}
        </h2>
        {mine.length > 0 && (
          <button className="hm-link" onClick={onOpenMarket}>
            {t("trade_marketplace")} <ChevronRight size={16} strokeWidth={2.6} />
          </button>
        )}
      </div>

      {loadPhase !== "ready" ? (
        // Still loading: the figure, its lines and two listing rows in
        // outline. Never "nothing listed", which may not be true.
        loadPhase === "skeleton" ? (
          <>
            <div className="fh-figure">
              <Skeleton className="on-ink" w={190} h={14} />
              <Skeleton className="on-ink" w={160} h={38} style={{ marginTop: 8 }} />
              <Skeleton className="on-ink" w="58%" h={14} style={{ marginTop: 10 }} />
            </div>
            <div className="fh-panel fh-skel-panel">
              <SkeletonMediaRows rows={2} tile={52} label={t("state_loading_listings")} />
            </div>
          </>
        ) : null
      ) : shown.length === 0 ? (
        // Nothing listed: say so plainly and give the one action that fixes
        // it, rather than a figure of zero.
        <div className="fh-empty">
          <span className="fh-empty-ico"><Package size={26} strokeWidth={2} /></span>
          <div>
            <div className="fh-empty-t">{t("fh_empty_t")}</div>
            <p className="fh-empty-s">{t("fh_empty_s")}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="fh-figure">
            <span className="fh-label">{t("fh_worth")}</span>
            <div className="fh-total"><span className="fh-cur">{total.slice(0, 1)}</span>{total.slice(1)}</div>
            <p className="fh-summary">
              {t("fh_summary")
                .replace("{n}", shown.length === 1 ? t("fh_listing_one") : t("fh_listings_n").replace("{n}", String(shown.length)))
                .replace("{kg}", kilos.toLocaleString())}
            </p>
            {samples && <p className="fh-sample-note">{t("fh_samples_note")}</p>}
          </div>

          <ul className="fh-panel fh-list">
            {shown.map(l => {
              // Their own photo of the harvest first; without one, the crop's
              // drawing, the same as on the sign-up tiles.
              const art = l.photo ? undefined : growArtFor(l.crop);
              const market = marketPrice(l.crop, l.variety);
              const diff = market ? toCents(l.pricePerKg - market) : 0;
              // For a seller, above the market price means more money per
              // kilo — the opposite of what it means to a buyer, so the
              // green sits on the other side here.
              const dir = diff > 0 ? "up" : diff < 0 ? "down" : "same";
              const row = (
                <>
                  <span className={`fh-photo${art ? " is-art" : ""}`}>
                    {l.photo || art
                      ? <img src={l.photo || art} alt="" loading="lazy" decoding="async" draggable={false} />
                      : <CropIcon crop={l.crop} size={22} />}
                  </span>
                  {/* Name and price on the first line; the kilos, then how
                      the price stands against the market, under them, each
                      with the row's full width to wrap into (in Filipino
                      the comparison runs to some thirty letters). */}
                  <span className="fh-name">{l.variety && l.variety !== l.crop ? l.variety : tn(l.crop)}</span>
                  <span className="fh-price">{peso(l.pricePerKg)}<small>{t("per_kg_short")}</small></span>
                  <span className="fh-meta">{l.kg.toLocaleString()} {t("fh_left")}</span>
                  {/* Only against a market price: a crop at ₱0 has none. */}
                  {market !== null && (
                    <span className={`fh-vs ${dir}`}>
                      {dir === "up" && <ArrowUp size={14} strokeWidth={3} aria-hidden="true" />}
                      {dir === "down" && <ArrowDown size={14} strokeWidth={3} aria-hidden="true" />}
                      <span>
                        {dir === "same"
                          ? t("fh_at")
                          : `${peso(Math.abs(diff))} ${dir === "up" ? t("fh_above") : t("fh_below")}`}
                      </span>
                    </span>
                  )}
                </>
              );
              return (
                <li key={l.id}>
                  {l.sample ? (
                    // A sample is only read: there is no listing to open.
                    <div className="fh-row is-sample">{row}</div>
                  ) : (
                    <button type="button" className="fh-row" onClick={() => onOpen(l.id)}>
                      {row}
                      <ChevronRight size={18} strokeWidth={2.4} className="fh-chev" aria-hidden="true" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      {/* The page's one action, the same words and size as Sell in the
          marketplace; on the green it wears palay, the app's accent on
          dark, where its own green would disappear. */}
      <button className="fh-post" onClick={onPost}>
        <Plus size={20} strokeWidth={2.8} /> {t("fh_post")}
      </button>
    </section>
  );
}

// ─── Your crops' prices ───────────────────────────────────────────────────────
// The crops the farmer grows, as price tiles side by side, the way a phone's
// stocks widget shows a few at once: the crop, its price large, how it moved
// from the month before, and under it the past twelve months as a line, so
// "is this a good price?" has its answer on the same tile. Two to a row; an
// odd one out takes the whole row. Tapping a tile opens its price sheet (this
// year's prices and the forecast), the same one the Prices page opens.
//
// A crop with no price records shows ₱0 and says it has no history yet, in
// the space its line would take, so the tiles in a row stay one height.

const dirOf = (n: number) => (n > 0 ? "up" : n < 0 ? "down" : "flat");

/** The past months as a line over a fading wash, in the tile's direction
 *  colour, with a dot on the newest month: the price the tile shows. */
function Trend({ values, dir }: { values: number[]; dir: string }) {
  const id = "cp-g" + useId().replace(/:/g, "");
  const max = Math.max(...values), min = Math.min(...values), span = max - min || 1;
  // Drawn in a 100 × 40 box stretched to the tile's width; the line keeps
  // its thickness however it is stretched (non-scaling stroke).
  const x = (i: number) => (i / (values.length - 1)) * 100;
  const y = (v: number) => 34 - ((v - min) / span) * 28;
  const line = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(2)} ${y(v).toFixed(2)}`).join(" ");
  const last = values[values.length - 1];
  return (
    <span className={`cp-chart ${dir}`} aria-hidden="true">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity=".22" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${line} L100 40 L0 40 Z`} fill={`url(#${id})`} />
        <path d={line} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* The dot is HTML, not SVG: in a stretched drawing a circle would be an oval. */}
      <span className="cp-dot" style={{ top: `${(y(last) / 40) * 100}%` }} />
    </span>
  );
}

export function YourCropPrices({ crops, onOpen, onAll }: {
  /** Each crop the farmer grows, by its lead variety. */
  crops: CropPrice[];
  onOpen: (crop: CropPrice) => void;
  /** The Prices page. */
  onAll: () => void;
}) {
  const { t, tn } = useLang();
  const priced = CROPS.filter(hasPrice);
  const up = priced.filter(c => c.change > 0).length;
  return (
    <section className="hm-sec cp" aria-labelledby="cp-t" data-tour="prices">
      <div className="hm-sec-row">
        <h2 className="hm-sec-title" id="cp-t">{t("home_your_crops")}</h2>
        <button className="hm-link" onClick={onAll}>
          {t("mkt_all")} <ChevronRight size={16} strokeWidth={2.6} />
        </button>
      </div>
      <p className="hm-sec-sub">{t("mkt_pulse_head").replace("{up}", String(up)).replace("{n}", String(priced.length))}</p>
      <div className="cp-grid stagger-list">
        {crops.map(c => {
          const group = CROP_GROUP_BY_ID[c.id] || "";
          const photo = cropPhoto(c.id);
          const price = peso(c.pricePerKg);
          const months = historyOf(c.id).slice(-12).map(p => p.price);
          const dir = dirOf(c.change);
          const Arrow = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : ArrowRight;
          return (
            <button key={c.id} type="button" className="cp-tile" onClick={() => onOpen(c)}>
              <span className="cp-top">
                <span className="cp-ph">
                  {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropIcon crop={group || c.name} size={20} />}
                </span>
                {/* Arrow, sign and colour: the direction never rests on colour alone. */}
                {hasPrice(c) && (
                  <span className={`pr-chg ${dir}`}>
                    <Arrow size={14} strokeWidth={2.6} aria-hidden="true" />
                    {c.change > 0 ? "+" : c.change < 0 ? "−" : ""}{Math.abs(c.change)}%
                  </span>
                )}
              </span>
              <span className="cp-name">{tn(group || c.name)}</span>
              <span className="cp-var">{c.name}</span>
              <span className="cp-price">
                <span className="cp-cur">{price.slice(0, 1)}</span>{price.slice(1)}<small>{t("per_kg_short")}</small>
              </span>
              {hasPrice(c) && months.length >= 2 ? (
                <>
                  <span className="cp-cap">{t("mkt_history_only").replace("{n}", String(months.length))}</span>
                  <Trend values={months} dir={dir} />
                </>
              ) : (
                <span className="cp-none">{t("mkt_no_history")}</span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
