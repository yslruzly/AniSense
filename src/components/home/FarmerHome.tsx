import { ChevronRight, Plus, ArrowUp, ArrowDown, Package } from "lucide-react";
import { useLang } from "../../i18n";
import { CROPS, CROP_GROUP_BY_ID } from "../../data/crops";
import { cropPhotoFor } from "../../data/cropPhotos";
import { CropIcon } from "../icons";
import { useMarket } from "../../lib/market";
import { Skeleton, SkeletonMediaRows } from "../states";

// ─── Your harvest ─────────────────────────────────────────────────────────────
// The farmer's own half of the marketplace, on Home. Everything else on this
// page is reading: prices, forecasts, advice. This is the one block about
// their business — what they have on sale, what it is worth, and the button
// to put up more.

/** Today's price for the crop a listing names, so a price can be compared. */
function marketPrice(crop: string, variety: string) {
  const named = CROPS.find(c => c.name.toLowerCase() === (variety || "").toLowerCase() || c.name.toLowerCase() === crop.toLowerCase());
  if (named) return named.pricePerKg;
  return CROPS.find(c => CROP_GROUP_BY_ID[c.id] === crop)?.pricePerKg ?? null;
}

export function YourHarvest({ onPost, onOpenMarket }: {
  onPost: () => void;
  onOpenMarket: () => void;
}) {
  const { t, tn } = useLang();
  const { listings, isMine, loadPhase } = useMarket();
  const mine = listings.filter(isMine);
  // What the harvest on sale is worth at the price they set: kilos × price.
  // Their asking price, not a forecast, and not a promise that it sells.
  const value = mine.reduce((sum, l) => sum + l.kg * l.pricePerKg, 0);
  const kilos = mine.reduce((sum, l) => sum + l.kg, 0);

  return (
    <section className="hm-sec" aria-labelledby="fh-t" data-tour="harvest">
      <div className="hm-sec-row">
        <h2 className="hm-sec-title" id="fh-t">{t("fh_title")}</h2>
        {mine.length > 0 && (
          <button className="hm-link" onClick={onOpenMarket}>
            {t("trade_marketplace")} <ChevronRight size={16} strokeWidth={2.6} />
          </button>
        )}
      </div>

      <div className="fh">
        {loadPhase !== "ready" ? (
          // Still loading: the total, its line and two harvest rows in
          // outline. Never "nothing listed", which may not be true.
          loadPhase === "skeleton" ? (
            <>
              <Skeleton w={150} h={34} />
              <Skeleton w="72%" h={15} style={{ marginTop: 9 }} />
              <div style={{ marginTop: 14 }}>
                <SkeletonMediaRows rows={2} tile={46} label={t("state_loading_listings")} />
              </div>
            </>
          ) : null
        ) : mine.length === 0 ? (
          // Nothing listed: say so plainly and give the one action that fixes
          // it, rather than an empty card with a number of zero in it.
          <div className="fh-empty">
            <span className="fh-empty-ico"><Package size={26} strokeWidth={2} /></span>
            <div>
              <div className="fh-empty-t">{t("fh_empty_t")}</div>
              <p className="fh-empty-s">{t("fh_empty_s")}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="fh-total">₱{value.toLocaleString()}</div>
            <p className="fh-summary">
              {t("fh_summary")
                .replace("{n}", mine.length === 1 ? t("fh_listing_one") : t("fh_listings_n").replace("{n}", String(mine.length)))
                .replace("{kg}", kilos.toLocaleString())}
            </p>

            <ul className="fh-list">
              {mine.map(l => {
                const photo = l.photo || cropPhotoFor(l.crop, l.variety);
                const market = marketPrice(l.crop, l.variety);
                const diff = market ? l.pricePerKg - market : 0;
                // For a seller, above the market price means more money per
                // kilo — the opposite of what it means to a buyer, so the
                // green sits on the other side here.
                const dir = diff > 0 ? "up" : diff < 0 ? "down" : "same";
                return (
                  <li key={l.id} className="fh-row">
                    <span className="fh-photo">
                      {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropIcon crop={l.crop} size={20} />}
                    </span>
                    <span className="fh-body">
                      <span className="fh-name">{l.variety && l.variety !== l.crop ? l.variety : tn(l.crop)}</span>
                      <span className="fh-meta">{l.kg.toLocaleString()} {t("fh_left")}</span>
                    </span>
                    <span className="fh-end">
                      <span className="fh-price">₱{l.pricePerKg}<small>{t("per_kg_short")}</small></span>
                      <span className={`fh-vs ${dir}`}>
                        {dir === "up" && <ArrowUp size={13} strokeWidth={3} />}
                        {dir === "down" && <ArrowDown size={13} strokeWidth={3} />}
                        {dir === "same"
                          ? t("fh_at")
                          : `₱${Math.abs(diff)} ${dir === "up" ? t("fh_above") : t("fh_below")}`}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* The same button as Sell in the marketplace: same action, so the
            same object, dressed by the app's button system rather than by a
            flat fill of its own. */}
        <button className="mp-sell-btn fh-post" onClick={onPost}>
          <Plus size={20} strokeWidth={2.8} /> {t("fh_post")}
        </button>
      </div>
    </section>
  );
}
