import { ChevronRight, Plus, ArrowUp, ArrowDown, Package } from "lucide-react";
import { useLang } from "../../i18n";
import { CROPS, CROP_GROUP_BY_ID } from "../../data/crops";
import { growArtFor } from "../../data/growArt";
import { CropIcon } from "../icons";
import { useMarket } from "../../store/market";
import { Skeleton, SkeletonMediaRows } from "../states";
import { peso, toCents } from "../../lib/money";
import leafMask from "../../assets/anisense-leaf-mask.png";

// ─── Your harvest ─────────────────────────────────────────────────────────────
// The farmer's own half of the marketplace, on Home. Everything else on this
// page is reading: prices, forecasts, advice. This is the one block about
// their business — what they have on sale, what it is worth, and the button
// to put up more. A listing here opens in the marketplace, where it can be
// changed or removed: the farmer's own list is where they look for it.

/** Today's price for the crop a listing names, so a price can be compared. */
function marketPrice(crop: string, variety: string) {
  const named = CROPS.find(c => c.name.toLowerCase() === (variety || "").toLowerCase() || c.name.toLowerCase() === crop.toLowerCase());
  if (named) return named.pricePerKg;
  return CROPS.find(c => CROP_GROUP_BY_ID[c.id] === crop)?.pricePerKg ?? null;
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
  // What the harvest on sale is worth at the price they set: kilos × price.
  // Their asking price, not a forecast, and not a promise that it sells —
  // which is what the line above the figure says.
  const value = mine.reduce((sum, l) => sum + l.kg * l.pricePerKg, 0);
  const kilos = mine.reduce((sum, l) => sum + l.kg, 0);
  const total = peso(value);

  return (
    <section className="fh" aria-labelledby="fh-t" data-tour="harvest">
      {/* The AniSense leaf, large and faint, off the card's top corner. */}
      <img className="fh-mark" src={leafMask} alt="" aria-hidden="true" />
      <div className="fh-head">
        <h2 className="fh-title" id="fh-t">{t("fh_title")}</h2>
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
      ) : mine.length === 0 ? (
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
                .replace("{n}", mine.length === 1 ? t("fh_listing_one") : t("fh_listings_n").replace("{n}", String(mine.length)))
                .replace("{kg}", kilos.toLocaleString())}
            </p>
          </div>

          <ul className="fh-panel fh-list">
            {mine.map(l => {
              // Their own photo of the harvest first; without one, the crop's
              // drawing, the same as on the sign-up tiles.
              const art = l.photo ? undefined : growArtFor(l.crop);
              const market = marketPrice(l.crop, l.variety);
              const diff = market ? toCents(l.pricePerKg - market) : 0;
              // For a seller, above the market price means more money per
              // kilo — the opposite of what it means to a buyer, so the
              // green sits on the other side here.
              const dir = diff > 0 ? "up" : diff < 0 ? "down" : "same";
              return (
                <li key={l.id}>
                  <button type="button" className="fh-row" onClick={() => onOpen(l.id)}>
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
                    <ChevronRight size={18} strokeWidth={2.4} className="fh-chev" aria-hidden="true" />
                    <span className="fh-meta">{l.kg.toLocaleString()} {t("fh_left")}</span>
                    <span className={`fh-vs ${dir}`}>
                      {dir === "up" && <ArrowUp size={14} strokeWidth={3} aria-hidden="true" />}
                      {dir === "down" && <ArrowDown size={14} strokeWidth={3} aria-hidden="true" />}
                      <span>
                        {dir === "same"
                          ? t("fh_at")
                          : `${peso(Math.abs(diff))} ${dir === "up" ? t("fh_above") : t("fh_below")}`}
                      </span>
                    </span>
                  </button>
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
