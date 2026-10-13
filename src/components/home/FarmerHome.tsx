import { useState } from "react";
import { ChevronRight, Plus, ArrowUp, ArrowDown, Package, ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import { useLang } from "../../i18n";
import { CROPS, CROP_GROUP_BY_ID, hasPrice } from "../../data/crops";
import { growArtFor } from "../../data/growArt";
import { CropIcon } from "../icons";
import { useMarket } from "../../store/market";
import { Skeleton, SkeletonMediaRows } from "../states";
import { peso, toCents } from "../../lib/money";
import { SAMPLE_HARVEST } from "../../data/demo/marketplace";
import { historyOf, latestOf, monthLabel, MonthPrice } from "../../data/priceRecords";
import { CropPrice, Listing } from "../../types";
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

/** The farmer's own listings, or before their first post the sample ones:
 *  only once the Market has answered. With nothing loaded at all (offline,
 *  nothing saved) nobody knows yet whether they have listings, and samples
 *  would stand in for real ones. Home's Your harvest and the Market's Your
 *  listings both read it, so the two always show the same. */
/** How a listing's price stands against today's market price for its crop:
 *  above, below or at it, and by how much. Null for a crop with no market
 *  price (₱0), which has nothing to be above or below. For a seller, above
 *  means more money per kilo. */
export function vsMarket(l: { crop: string; variety: string; pricePerKg: number }) {
  const market = marketPrice(l.crop, l.variety);
  if (market === null) return null;
  const diff = toCents(l.pricePerKg - market);
  const dir: "up" | "down" | "same" = diff > 0 ? "up" : diff < 0 ? "down" : "same";
  return { diff, dir };
}

export function useOwnHarvest() {
  const { listings, isMine, loadPhase } = useMarket();
  const mine = listings.filter(isMine);
  const samples = mine.length === 0 && listings.length > 0;
  return { mine, samples, shown: samples ? SAMPLE_HARVEST : mine, loadPhase };
}

/** Their listings as rows: the picture, what it is and its price, the kilos
 *  left, and how the price stands against the market's. A row opens the
 *  listing (Edit, Remove); a sample is only read. */
function HarvestRows({ listings, onOpen }: { listings: Listing[]; onOpen: (id: string) => void }) {
  const { t, tn } = useLang();
  return (
    <ul className="fh-panel fh-list">
      {listings.map(l => {
        // Their own photo of the harvest first; without one, the crop's
        // drawing, the same as on the sign-up tiles.
        const art = l.photo ? undefined : growArtFor(l.crop);
        // For a seller, above the market price means more money per
        // kilo — the opposite of what it means to a buyer, so the
        // green sits on the other side here.
        const vs = vsMarket(l);
        const dir = vs?.dir ?? "same", diff = vs?.diff ?? 0;
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
            {vs && (
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
  );
}

export function YourHarvest({ onPost, onOpenMarket, onOpen }: {
  onPost: () => void;
  onOpenMarket: () => void;
  /** One of their listings, opened in the marketplace (Edit, Remove). */
  onOpen: (id: string) => void;
}) {
  const { t } = useLang();
  const { mine, samples, shown, loadPhase } = useOwnHarvest();
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

          <HarvestRows listings={shown} onOpen={onOpen} />
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
// One crop at a time, in a spotlight. The farmer's crops are chips across the
// top (they wrap, never a row to swipe); the chosen one fills the panel under
// them: its drawing large, its price in big figures, how it moved from the
// month before, and the year's highest and lowest month in words, so "is
// this a good price?" is answered without reading a chart. The button at the
// foot opens its price sheet (this year's prices and the forecast), the same
// one the Prices page opens.
//
// The drawings are the sign-up's (What do you grow): one style for every
// crop, and sharp at this size, where the photographs are not.
//
// A crop with no price records shows ₱0 and says it has no history yet.

const dirOf = (n: number) => (n > 0 ? "up" : n < 0 ? "down" : "flat");

export function YourCropPrices({ crops, onOpen, onAll }: {
  /** Each crop the farmer grows, by its lead variety. */
  crops: CropPrice[];
  onOpen: (crop: CropPrice) => void;
  /** The Prices page. */
  onAll: () => void;
}) {
  const { t, tn, lang } = useLang();
  const priced = CROPS.filter(hasPrice);
  const up = priced.filter(c => c.change > 0).length;
  // Opens on the first crop that has a price, so the first look says
  // something; any chip changes it.
  const [pick, setPick] = useState<string | null>(null);
  const c = crops.find(x => x.id === pick) ?? crops.find(hasPrice) ?? crops[0];
  if (!c) return null;

  const group = CROP_GROUP_BY_ID[c.id] || c.name;
  const art = growArtFor(group);
  const price = peso(c.pricePerKg);
  const dir = dirOf(c.change);
  const Arrow = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : ArrowRight;
  const months = historyOf(c.id).slice(-12);
  const high = months.reduce<MonthPrice | null>((m, p) => (!m || p.price > m.price ? p : m), null);
  const low = months.reduce<MonthPrice | null>((m, p) => (!m || p.price < m.price ? p : m), null);
  const before = latestOf(c.id)?.previous;
  const known = hasPrice(c) && months.length >= 2 && high && low;

  return (
    <section className="hm-sec cs" aria-labelledby="cs-t" data-tour="prices">
      <div className="hm-sec-row">
        <h2 className="hm-sec-title" id="cs-t">{t("home_your_crops")}</h2>
        <button className="hm-link" onClick={onAll}>
          {t("mkt_all")} <ChevronRight size={16} strokeWidth={2.6} />
        </button>
      </div>
      <p className="hm-sec-sub">{t("mkt_pulse_head").replace("{up}", String(up)).replace("{n}", String(priced.length))}</p>

      {/* One crop needs no choosing. */}
      {crops.length > 1 && (
        <div className="cs-chips" role="group" aria-label={t("cs_choose")}>
          {crops.map(x => {
            const g = CROP_GROUP_BY_ID[x.id] || x.name;
            const pic = growArtFor(g);
            return (
              <button key={x.id} type="button" className="cs-chip" aria-pressed={x.id === c.id} onClick={() => setPick(x.id)}>
                <span className="cs-chip-art">{pic ? <img src={pic} alt="" decoding="async" draggable={false} /> : <CropIcon crop={g} size={16} />}</span>
                {tn(g)}
              </button>
            );
          })}
        </div>
      )}

      {/* Keyed on the crop: a new one settles in rather than the numbers
          changing under the eye. */}
      <div className="cs-panel" key={c.id}>
        <div className="cs-main">
          <span className="cs-art">{art ? <img src={art} alt="" decoding="async" draggable={false} /> : <CropIcon crop={group} size={40} />}</span>
          <div className="cs-what">
            <h3 className="cs-name">{tn(group)}</h3>
            <span className="cs-var">{c.name}</span>
            <span className="cs-price"><span className="cs-cur">{price.slice(0, 1)}</span>{price.slice(1)}<small>{t("per_kg_short")}</small></span>
            {/* Arrow, sign and colour: the direction never rests on colour alone. */}
            {hasPrice(c) && (
              <span className="cs-move">
                <span className={`pr-chg ${dir}`}>
                  <Arrow size={14} strokeWidth={2.6} aria-hidden="true" />
                  {c.change > 0 ? "+" : c.change < 0 ? "−" : ""}{Math.abs(c.change)}%
                </span>
                {before && <span className="cs-from">{t("cs_from").replace("{month}", monthLabel(before.month, lang, "long"))}</span>}
              </span>
            )}
          </div>
        </div>
        {known ? (
          <>
            <dl className="cs-facts">
              <div className="cs-fact">
                <dt>{t("cs_high").replace("{n}", String(months.length))}</dt>
                <dd><b>{peso(high.price)}</b><span>{monthLabel(high.month, lang, "short", true)}</span></dd>
              </div>
              <div className="cs-fact">
                <dt>{t("cs_low").replace("{n}", String(months.length))}</dt>
                <dd><b>{peso(low.price)}</b><span>{monthLabel(low.month, lang, "short", true)}</span></dd>
              </div>
            </dl>
            <button type="button" className="cs-open" onClick={() => onOpen(c)}>
              {t("cs_see")} <ChevronRight size={18} strokeWidth={2.6} aria-hidden="true" />
            </button>
          </>
        ) : (
          <p className="cs-none">{t("mkt_no_history")}</p>
        )}
      </div>
    </section>
  );
}
