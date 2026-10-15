import { forwardRef } from "react";
import { Search, X, ChevronRight, SearchX } from "lucide-react";
import { useLang, bothNames } from "../../i18n";
import { useMarket } from "../../store/market";
import { CROPS, CROP_GROUP_BY_ID, hasPrice } from "../../data/crops";
import { growArtFor } from "../../data/growArt";
import { PriceItem } from "../../services/prices";
import { Change, Thumb, peso } from "../prices/PriceSheet";
import { CropIcon } from "../icons";
import { harvestName } from "./BuyerHome";

// ─── Search on Home ───────────────────────────────────────────────────────────
// The bar at the top of Home searches right here, on Home: as the words go
// in, the rest of the page steps aside for what matches - harvests for sale,
// cheapest first, and prices - and clearing the bar brings the page back. A
// price opens in its sheet on Home; a harvest opens in the Market, where it
// can be bought, as every harvest card on Home does.
//
// Every word typed has to match somewhere (crop, variety, its name in English
// or Tagalog whatever the app is set to, the farmer, the town), so "rice
// talavera" narrows rather than widens, and "sibuyas" finds onions in both.

const LIMIT = 5;
/** The everyday words for a crop that are not its name in the app: rice is
 *  "Palay" in Tagalog there, but people ask for "bigas" (and the bar's own
 *  hint suggests it). */
const ALSO: Record<string, string> = { Rice: "bigas palay kanin" };

/** Lower-case words of a search, so "Rice  Talavera" is ["rice", "talavera"]. */
const wordsOf = (q: string) => q.toLowerCase().split(/\s+/).filter(Boolean);
const hitsAll = (words: string[], fields: (string | undefined)[]) => {
  const hay = fields.filter(Boolean).join(" ").toLowerCase();
  return words.every(w => hay.includes(w));
};

/** The bar: the same one the Prices page and the Market use, with a real field. */
export const HomeSearchBar = forwardRef<HTMLInputElement, {
  value: string; onChange: (v: string) => void; onGo: () => void; tour?: string;
}>(function HomeSearchBar({ value, onChange, onGo, tour }, ref) {
  const { t } = useLang();
  return (
    <div className="search-box hm-search-box" role="search" data-tour={tour}>
      <Search size={21} strokeWidth={2.4} aria-hidden="true" />
      <input ref={ref} type="search" placeholder={t("home_search_ph")} aria-label={t("home_search_ph")} value={value}
        onChange={e => onChange(e.target.value)} enterKeyHint="search" autoComplete="off"
        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onGo(); } }} />
      {value && (
        <button type="button" className="pr-clear" onClick={() => onChange("")} aria-label={t("state_clear_search")}>
          <X size={16} strokeWidth={2.6} />
        </button>
      )}
      {/* The green key: with nothing typed it opens the keyboard in the bar;
          with a search typed, the results are already showing, so it puts the
          keyboard away and hands the screen to them. */}
      <button type="button" className="search-go" aria-label={t("search")} onMouseDown={e => e.preventDefault()} onClick={onGo}>
        <Search size={20} strokeWidth={2.8} />
      </button>
    </div>
  );
});

export function HomeSearchResults({ query, onOpenListing, onSeeAll, onOpenPrice, onClear }: {
  query: string;
  onOpenListing: (id: string) => void;
  onSeeAll: (query: string) => void;
  onOpenPrice: (item: PriceItem) => void;
  onClear: () => void;
}) {
  const { t, tn } = useLang();
  const { listings } = useMarket();
  const words = wordsOf(query);
  const q = query.trim();

  const groupOf = (name: string) => CROP_GROUP_BY_ID[CROPS.find(c => c.name === name)?.id ?? ""] || "";
  const harvests = listings
    .filter(l => {
      const g = groupOf(l.variety || l.crop) || groupOf(l.crop);
      return hitsAll(words, [bothNames(l.crop), l.variety && bothNames(l.variety), g && bothNames(g), ALSO[g], l.seller, l.location]);
    })
    .sort((a, b) => a.pricePerKg - b.pricePerKg);
  const prices: PriceItem[] = CROPS
    .filter(hasPrice)
    .map(c => ({ id: c.id, name: c.name, pricePerKg: c.pricePerKg, change: c.change, group: CROP_GROUP_BY_ID[c.id] || "" }))
    .filter(c => hitsAll(words, [bothNames(c.name), bothNames(c.group), ALSO[c.group]]));

  if (harvests.length === 0 && prices.length === 0) {
    return (
      <section className="hs-empty" aria-live="polite">
        <span className="hs-empty-ico" aria-hidden="true"><SearchX size={26} strokeWidth={2.2} /></span>
        <p className="hs-empty-t">{t("hs_none").replace("{q}", q)}</p>
        <p className="hs-empty-s">{t("hs_none_sub")}</p>
        <button type="button" className="hs-empty-btn" onClick={onClear}>{t("state_clear_search")}</button>
      </section>
    );
  }

  return (
    <div className="hs" aria-live="polite">
      {harvests.length > 0 && (
        <section className="hs-group" aria-labelledby="hs-harvests">
          <h2 className="hs-t" id="hs-harvests">{t("hs_harvests")} <span className="hs-n">{harvests.length}</span></h2>
          <ul className="hs-list">
            {harvests.slice(0, LIMIT).map(l => {
              const art = l.photo || growArtFor(l.variety || l.crop) || growArtFor(l.crop);
              return (
                <li key={l.id}>
                  <button type="button" className="hs-row" onClick={() => onOpenListing(l.id)}>
                    <span className={`hs-art${l.photo ? " is-photo" : ""}`} aria-hidden="true">
                      {art ? <img src={art} alt="" loading="lazy" decoding="async" /> : <CropIcon crop={l.crop} size={24} />}
                    </span>
                    <span className="hs-txt">
                      <span className="hs-name">
                        {harvestName(l, tn)}
                        {l.sample && <span className="hs-sample">{t("mp_sample")}</span>}
                      </span>
                      <span className="hs-meta"><b>{peso(l.pricePerKg, 0)}{t("per_kg_short")}</b> · {l.kg.toLocaleString()} kg</span>
                      <span className="hs-sub">{l.seller} · {l.location}</span>
                    </span>
                    <ChevronRight className="hs-chev" size={20} strokeWidth={2.4} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
          {/* All of them, and the filters, are in the Market. */}
          {harvests.length > LIMIT && (
            <button type="button" className="hs-more" onClick={() => onSeeAll(q)}>
              {t("hs_see_all").replace("{n}", String(harvests.length))}
              <ChevronRight size={18} strokeWidth={2.6} aria-hidden="true" />
            </button>
          )}
        </section>
      )}

      {prices.length > 0 && (
        <section className="hs-group" aria-labelledby="hs-prices">
          <h2 className="hs-t" id="hs-prices">{t("hs_prices")} <span className="hs-n">{prices.length}</span></h2>
          <ul className="hs-list">
            {prices.slice(0, LIMIT).map(c => (
              <li key={c.id}>
                <button type="button" className="hs-row" onClick={() => onOpenPrice(c)}>
                  <Thumb item={c} className="hs-art is-price" />
                  <span className="hs-txt">
                    <span className="hs-name">{tn(c.name)}</span>
                    <span className="hs-sub">{tn(c.group)}</span>
                  </span>
                  <span className="hs-price">
                    <b>{peso(c.pricePerKg, 0)}<small>{t("per_kg_short")}</small></b>
                    <Change value={c.change} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
