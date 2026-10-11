import { useRef } from "react";
import { ChevronRight, MapPin, RotateCcw, ArrowLeft, ArrowRight, TrendingUp, TrendingDown, ArrowLeftRight, ShoppingCart } from "lucide-react";
import { useLang, translations } from "../../i18n";
import { CROPS, CROP_GROUP_BY_ID, familyCropNames } from "../../data/crops";
import familyCrops from "../../assets/families/family-crops.webp";
import familyFruits from "../../assets/families/family-fruits.webp";
import familyVegetables from "../../assets/families/family-vegetables.webp";
import { useMarket } from "../../store/market";
import { SkeletonShelf, SkeletonFarmerCards, EmptyState } from "../states";
import { featuredLineup } from "../../lib/featured";
import { FeaturedFarmerBig } from "./FeaturedFarmerBig";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { cropPhoto, cropPhotoFor, cropGroupPhoto } from "../../data/cropPhotos";
import { CropEmoji } from "../icons/CropEmoji";
import { Listing, TradeIntent } from "../../types";
import { peso } from "../../lib/money";
import { costOf, totalSpent } from "../../lib/purchases";
import { rankOf } from "../../lib/rating";
import leafMask from "../../assets/anisense-leaf-mask.png";

// ─── Buyer Home sections ──────────────────────────────────────────────────────
// The pieces of the buyer's Home that the farmer never sees. Each one opens
// the marketplace already showing what was tapped (a crop, a farmer, the
// search box) rather than dropping the buyer at the top of it to start over.

type Shop = (intent: TradeIntent) => void;

// ── Shop by crop ─────────────────────────────────────────────────────────────
// Three doors, not ten: Crops, Fruits, Vegetables. Ten small tiles asked a
// buyer to know already which crop they wanted; three big pictures let them
// start from the kind of thing they came for, and the marketplace opens on
// that family with every crop in it.
//
// Each card is a photograph of the family at its best, the name, and how many
// harvests are listed under it right now, so a tap is never a surprise.
const FAMILIES: { id: string; photo: string; tone: string }[] = [
  { id: "Crops", photo: familyCrops, tone: "gold" },
  { id: "Fruits", photo: familyFruits, tone: "coral" },
  { id: "Vegetables", photo: familyVegetables, tone: "green" },
];

const listedIn = (listings: Listing[], family: string) => {
  const names = familyCropNames(family);
  return listings.filter(l => names.includes(l.crop) || names.includes(l.variety)).length;
};

// Always in English, whichever language the app is set to, like the crop
// names this section used to show: the words printed on market signs.
export function ShopByCrop({ onShop }: { onShop: Shop }) {
  const { listings } = useMarket();
  return (
    <section className="hm-sec" aria-labelledby="shop-t" data-tour="b-crops">
      <h2 className="hm-sec-title" id="shop-t">{translations.home_shop_by_crop.en}</h2>
      <div className="fam-grid stagger-list">
        {FAMILIES.map(f => {
          const n = listedIn(listings, f.id);
          return (
            <button key={f.id} className={`fam-card ${f.tone}`} onClick={() => onShop({ family: f.id })}
              aria-label={`${f.id}, ${n} ${n === 1 ? "listing" : "listings"}`}>
              <img src={f.photo} alt="" width={360} height={480} loading="lazy" decoding="async" />
              <span className="fam-go" aria-hidden="true"><ArrowRight size={16} strokeWidth={2.8} /></span>
              <span className="fam-foot" aria-hidden="true">
                <span className="fam-name">{f.id}</span>
                <span className="fam-count">{n} {n === 1 ? "listing" : "listings"}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ── Biggest moves today ──────────────────────────────────────────────────────
// A diverging bar chart: one centre line for "same as yesterday", cheaper
// crops bar off to the left in green, pricier ones to the right in amber.
// Bar length is the size of the move, so the eye reads the day's shape
// before any number. The headline says it in words first, for anyone who
// would rather not read a chart at all.
//
// Colours are a validated diverging pair (dataviz validator: protan
// ΔE 15.3, passes). The amber is light on white, so no value rides on
// colour alone: every bar has its signed percentage in ink beside it, and
// direction is also position (left or right of the line) and an arrow.

export function PriceMoves({ onOpen }: { onOpen: () => void }) {
  const { t, tn } = useLang();
  const upN = CROPS.filter(c => c.change > 0).length;
  const downN = CROPS.filter(c => c.change < 0).length;
  const rising = CROPS.filter(c => c.change > 0).sort((a, b) => b.change - a.change).slice(0, 3);
  const falling = CROPS.filter(c => c.change < 0).sort((a, b) => a.change - b.change).slice(0, 3);
  // Top to bottom from the biggest rise to the biggest drop: the bars step
  // across the centre line, so the chart's outline is the story.
  const rows = [...rising, ...falling.slice().reverse()];
  const max = Math.max(...rows.map(c => Math.abs(c.change)), 1);

  const verdict = upN > downN * 1.5 ? "up" : downN > upN * 1.5 ? "down" : "mixed";
  const VerdictIcon = verdict === "up" ? TrendingUp : verdict === "down" ? TrendingDown : ArrowLeftRight;

  return (
    <section className="mv" aria-labelledby="mv-t" data-tour="b-moves">
      {/* The AniSense leaf, large and faint, off the card's top corner. */}
      <img className="mv-mark" src={leafMask} alt="" aria-hidden="true" />
      <div className="mv-head">
        <h2 className="mv-title" id="mv-t">{t("mkt_movers")}</h2>
        <button className="hm-link" onClick={onOpen}>
          {t("mkt_all")} <ChevronRight size={16} strokeWidth={2.6} />
        </button>
      </div>
      <p className={`mv-verdict ${verdict}`}>
        <span className="mv-verdict-ico"><VerdictIcon size={16} strokeWidth={2.6} /></span>
        {t(`mv_verdict_${verdict}`)}
      </p>
      <p className="mv-count">
        {t("mv_count").replace("{up}", String(upN)).replace("{down}", String(downN))}
      </p>

      {/* The chart on its own white panel: its colours were chosen for a
          white ground. The legend is its two directions, each at its own edge. */}
      <div className="mv-panel">
      <div className="mv-axis" aria-hidden="true">
        <span><ArrowLeft size={14} strokeWidth={2.8} /><i className="down" />{t("mv_axis_cheaper")}</span>
        <span>{t("mv_axis_pricier")}<i className="up" /><ArrowRight size={14} strokeWidth={2.8} /></span>
      </div>

      <div className="mv-list">
        {rows.map((c, i) => {
          const dir = c.change < 0 ? "down" : "up";
          const photo = cropPhoto(c.id);
          const name = tn(c.name);
          const pct = Math.abs(c.change);
          // Each crop is named on the empty side of the centre line, so its
          // bar gets the whole of the other half and nothing crosses the line.
          const id = (
            <span className="mv-id">
              <span className="mv-photo">
                {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropEmoji crop={c.name} size={22} />}
              </span>
              <span className="mv-txt">
                <span className="mv-name">{name}</span>
                <span className="mv-price">{peso(c.pricePerKg)}<small>{t("per_kg_short")}</small></span>
              </span>
            </span>
          );
          const bar = (
            <span className="mv-barcell">
              <span className="mv-bar" style={{ ["--p" as string]: pct / max, animationDelay: `${i * 40}ms` }} />
              <span className="mv-chg">{dir === "down" ? "−" : "+"}{pct}%</span>
            </span>
          );
          return (
            <button
              key={c.id}
              className={`mv-row ${dir}`}
              onClick={onOpen}
              aria-label={`${name}, ${peso(c.pricePerKg)} ${t("per_kg_short")}, ${pct}% ${dir === "down" ? t("bm_cheaper_aria") : t("bm_pricier_aria")}`}
            >
              {dir === "up" ? <>{id}{bar}</> : <>{bar}{id}</>}
            </button>
          );
        })}
      </div>
      </div>
    </section>
  );
}

// ── Featured products ────────────────────────────────────────────────────────
// Four listings as products, not rows: a photo big enough to judge, the price,
// and where it is coming from. Ranked by the seller's rating, so "featured"
// means something that can be checked rather than a word.

export function FeaturedProducts({ onShop }: { onShop: Shop }) {
  const { t, tn } = useLang();
  const { listings, loadPhase, showingSamples } = useMarket();
  // Best-rated first, but one per crop: ranking alone filled the shelf with
  // four sacks of rice, because the top-rated sellers here all grow rice.
  // A featured shelf that shows the same thing four times is a shelf of one.
  const seen = new Set<string>();
  // Special Rice → Rice, Red → Onions: the crop a listing is filed under.
  const groupOf = (l: { crop: string }) => CROP_GROUP_BY_ID[CROPS.find(c => c.name === l.crop)?.id ?? ""] || l.crop;
  // A row holds more than a grid of four did, and the ones past the edge are
  // the reason to push it along.
  const picks = [...listings]
    .sort((a, b) => rankOf(b) - rankOf(a) || new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter(l => {
      const group = groupOf(l);
      if (seen.has(group)) return false;
      seen.add(group);
      return true;
    })
    .slice(0, 8);
  // Still loading: the shelf's own shape under its title, so the page does
  // not jump when the harvests land.
  if (loadPhase !== "ready") {
    return loadPhase === "skeleton" ? (
      <section className="hm-sec" aria-labelledby="fp-t" data-tour="b-featured">
        <div className="hm-sec-row"><h2 className="hm-sec-title" id="fp-t">{t("fp_title")}</h2></div>
        <p className="hm-sec-sub">{t("fp_sub")}</p>
        <SkeletonShelf count={3} label={t("state_loading_listings")} />
      </section>
    ) : null;
  }
  // A new marketplace has nothing to feature yet: no shelf rather than an
  // empty one.
  if (picks.length === 0) return null;

  return (
    <section className="hm-sec" aria-labelledby="fp-t" data-tour="b-featured">
      <div className="hm-sec-row">
        <h2 className="hm-sec-title" id="fp-t">{t("fp_title")}</h2>
        <button className="hm-link" onClick={() => onShop({})}>
          {t("fp_see_all")} <ChevronRight size={16} strokeWidth={2.6} />
        </button>
      </div>
      {/* Says so while the sample harvests stand in for a Market nobody has posted to yet. */}
      <p className="hm-sec-sub">{t(showingSamples ? "fp_sub_sample" : "fp_sub")}</p>

      <div className="fp-row">
        {picks.map(l => {
          const photo = l.photo || cropPhotoFor(l.crop, l.variety);
          // "Red" under Onions reads as "Red Onions"; "Yellow Corn" already
          // says it, so it is said once.
          const name = !l.variety || l.variety === l.crop
            ? tn(l.crop)
            : l.variety.toLowerCase().includes(l.crop.toLowerCase())
              ? l.variety
              : l.variety + " " + tn(l.crop);
          return (
            // The card is that one harvest: tapping it opens the marketplace
            // on it, its details already up, with the same crop's other
            // listings behind for comparison. (A text search for the variety
            // found nothing: the search reads the crop, not the variety.)
            <button key={l.id} className="fp-card" onClick={() => onShop({ listing: l.id, category: groupOf(l) })}>
              <span className="fp-photo">
                {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropEmoji crop={l.crop} size={32} />}
              </span>
              <span className="fp-body">
                <span className="fp-name">{name}</span>
                {/* Price is the loudest thing on the card, then the name,
                    then where it is from. One thing bold, not three. */}
                <span className="fp-price">{peso(l.pricePerKg)}<small>{t("per_kg_short")}</small></span>
                <span className="fp-loc"><MapPin size={12} strokeWidth={2.4} aria-hidden="true" />{l.location}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

const en = (key: keyof typeof translations) => translations[key].en;

// ── Featured farmers ─────────────────────────────────────────────────────────
// The trust half of a marketplace: who is growing this food. Only real fields
// are shown (rating, sales, years, town); no "verified" badge the data cannot
// back up. The Farmer of the Week, first in the row, rotates weekly through
// the four best-rated growers, which is what makes "of the week" true rather
// than decorative.

export function FeaturedFarmers({ onShop, buyerLocation }: { onShop: Shop; buyerLocation: string }) {
  // Always in English, like the profile sheet it opens: a farmer's public
  // card reads the same to every buyer, crop names included.
  // Everyone with something on sale, best-rated first. Keyed the way the
  // marketplace finds a seller again: account id, or initials in the demo.
  // The Farmer of the Week is the same pick that awards the Profile achievement.
  const { sellers, loadPhase, showingSamples } = useMarket();
  // The Farmer of the Week, then four more, the buyer's neighbours first.
  const { spot, rest } = featuredLineup(sellers, buyerLocation);
  // The row slides on its own (hooks/useAutoScroll.ts); called before any
  // early return, as hooks must be.
  const autoRow = useRef<HTMLDivElement>(null);
  useAutoScroll(autoRow, { enabled: loadPhase === "ready" && !!spot });
  // Still loading: the outlines of the big cards under the title.
  if (loadPhase !== "ready") {
    return loadPhase === "skeleton" ? (
      <section className="hm-sec" aria-labelledby="ff-t" data-tour="b-farmers">
        <h2 className="hm-sec-title" id="ff-t">{en("ff_title")}</h2>
        <p className="hm-sec-sub">{en("ff_sub")}</p>
        <SkeletonFarmerCards label={en("state_loading_farmers")} />
      </section>
    ) : null;
  }
  if (!spot) return null;

  const open = (s: { key: string; name: string }) => onShop({ seller: s.key, search: s.name });
  const lineup = [spot, ...rest];

  return (
    <section className="hm-sec" aria-labelledby="ff-t" data-tour="b-farmers">
      <h2 className="hm-sec-title" id="ff-t">{en("ff_title")}</h2>
      <p className="hm-sec-sub">{en(showingSamples ? "ff_sub_sample" : "ff_sub")}</p>

      {/* All five as big profile cards in one row: the Farmer of the Week
          first, with the gold plate, then the other four, the same card
          without it. The next card shows past the edge. The row slides
          right to left on its own, slowly and without end (the five are
          drawn twice, and it steps back a set at the seam), and stops for a
          finger: it can be swiped either way, and carries on a moment
          after. Each card opens that farmer. */}
      <div className="ffb-row" ref={autoRow}>
        {[0, 1].flatMap(pass => lineup.map((s, i) => (
          <FeaturedFarmerBig key={`${pass}-${s.key}`} farmer={s} week={i === 0} copy={pass === 1} onOpen={() => open(s)} />
        )))}
      </div>
    </section>
  );
}

// ── Your purchases ───────────────────────────────────────────────────────────
// One number, where it went, and what to buy again. Laid out like the other
// new sections: the title sits on the page, the card holds the content.
//
// "Where it went" is part-to-whole across crops, so one bar per crop in one
// colour, each labelled with its name and peso amount. Separate colours per
// crop were tried and failed the colour-blind check (rice green vs tomato
// red: ΔE 2.2), and a legend would make an older reader match swatches.
// One gold, labels beside every bar: nothing to decode. Gold #B87A0B is
// 3.6:1 on white, over the 3:1 a graphic needs.
//
// A new buyer, with nothing bought yet, still finds it: the same gold card,
// saying what will be here and with the way to the Market. Not while their
// purchases are still loading, though, or a buyer who has some would be told
// they have none. It is the last section, so nothing below moves when it
// comes. No History link then: it would open an empty page.

export function YourPurchases({ onShop, onHistory }: { onShop: Shop; onHistory: () => void }) {
  const { t, tn, lang } = useLang();
  const { purchases, loadPhase } = useMarket();
  if (purchases.length === 0) {
    if (loadPhase !== "ready") return null;
    return (
      <section className="hm-sec" aria-labelledby="yp-t" data-tour="b-purchases">
        <div className="hm-sec-row">
          <h2 className="hm-sec-title" id="yp-t">{t("yp_title")}</h2>
        </div>
        <div className="yp yp-empty">
          <EmptyState
            icon={<ShoppingCart size={26} aria-hidden="true" />}
            title={t("state_no_purchases_title")}
            body={t("yp_empty_body")}
            action={t("cart_browse")}
            onAction={() => onShop({})}
          />
        </div>
      </section>
    );
  }
  const locale = lang === "tl" ? "fil-PH" : "en-PH";

  // What each cost, as paid when the buyer has written it down (lib/purchases.ts).
  const spent = totalSpent(purchases);
  const orders = purchases.length;
  const farmers = new Set(purchases.map(tx => tx.seller)).size;

  // Spend per crop, biggest first. Past four, the tail folds into "Other"
  // rather than becoming a fifth, sixth, seventh bar.
  const byCrop = new Map<string, number>();
  purchases.forEach(tx => byCrop.set(tx.crop, (byCrop.get(tx.crop) || 0) + costOf(tx)));
  let parts = [...byCrop.entries()].map(([crop, amount]) => ({ crop, amount })).sort((a, b) => b.amount - a.amount);
  if (parts.length > 4) {
    const other = parts.slice(3).reduce((sum, p) => sum + p.amount, 0);
    parts = [...parts.slice(0, 3), { crop: "__other", amount: other }];
  }
  const top = parts[0]?.amount || 1;

  const recent = [...purchases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 2);
  const summary = t("yp_summary")
    .replace("{orders}", `${orders} ${orders === 1 ? t("yp_order_one") : t("yp_orders_n")}`)
    .replace("{farmers}", `${farmers} ${farmers === 1 ? t("yp_farmer_one") : t("yp_farmers")}`);

  return (
    <section className="hm-sec" aria-labelledby="yp-t" data-tour="b-purchases">
      <div className="hm-sec-row">
        <h2 className="hm-sec-title" id="yp-t">{t("yp_title")}</h2>
        <button className="hm-link" onClick={onHistory}>
          {t("yp_history")} <ChevronRight size={16} strokeWidth={2.6} />
        </button>
      </div>

      <div className="yp">
        {/* The one number, big, with the sentence that makes it mean
            something right under it. */}
        <div className="yp-total">{peso(spent)}</div>
        <p className="yp-summary">{summary}</p>

        <h3 className="yp-h">{t("yp_where")}</h3>
        <ul className="yp-bars">
          {parts.map(p => (
            <li key={p.crop} className="yp-bar-row">
              <span className="yp-bar-name">{p.crop === "__other" ? t("yp_other") : tn(p.crop)}</span>
              <span className="yp-bar-track" aria-hidden="true">
                <span className="yp-bar" style={{ width: `${Math.max(4, (p.amount / top) * 100)}%` }} />
              </span>
              <span className="yp-bar-amt">{peso(p.amount)}</span>
            </li>
          ))}
        </ul>

        <h3 className="yp-h yp-h-again">{t("home_buy_again")}</h3>
        <div className="yp-again stagger-list">
          {recent.map(tx => {
            const photo = cropPhotoFor(tx.crop, tx.variety);
            const when = new Date(tx.date).toLocaleDateString(locale, { month: "short", day: "numeric" });
            return (
              // Each past order is its own small card, and the card is the
              // button: a big target for an older thumb. "Buy again" sits
              // inside it, along the bottom, so it can only ever belong to
              // this order.
              <button key={tx.id} className="yp-item" onClick={() => onShop({ search: tx.variety || tx.crop })}>
                <span className="yp-photo">
                  {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropEmoji crop={tx.crop} size={30} />}
                  <span className="yp-date">{when}</span>
                </span>
                <span className="yp-item-body">
                  <span className="yp-item-name">{tx.variety || tn(tx.crop)}</span>
                  <span className="yp-item-meta">{tx.seller}</span>
                  <span className="yp-item-meta">{tx.kg} kg · <b>{peso(costOf(tx))}</b></span>
                </span>
                <span className="yp-again-btn"><RotateCcw size={16} strokeWidth={2.6} /> {t("home_buy_again")}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
