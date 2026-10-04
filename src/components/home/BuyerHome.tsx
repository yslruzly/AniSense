import { ChevronRight, MapPin, Star, Award, RotateCcw, ArrowLeft, ArrowRight, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import { useLang, translations } from "../../i18n";
import { CROPS, CROP_GROUP_BY_ID, familyCropNames } from "../../data/crops";
import familyCrops from "../../assets/families/family-crops.webp";
import familyFruits from "../../assets/families/family-fruits.webp";
import familyVegetables from "../../assets/families/family-vegetables.webp";
import { useMarket } from "../../store/market";
import { SkeletonShelf, SkeletonMediaRows } from "../states";
import { rankSellers, farmerOfTheWeek } from "../../lib/featured";
import { cropPhoto, cropPhotoFor, cropGroupPhoto } from "../../data/cropPhotos";
import { CropEmoji } from "../icons/CropEmoji";
import { Listing, TradeIntent } from "../../types";
import { avatarTone } from "../../lib/avatar";
import leafMask from "../../assets/anisense-leaf-mask.png";
import { peso } from "../../lib/money";

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

      {/* The legend is the chart's two directions, each at its own edge. */}
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
    </section>
  );
}

// ── Featured products ────────────────────────────────────────────────────────
// Four listings as products, not rows: a photo big enough to judge, the price,
// and where it is coming from. Ranked by the seller's rating, so "featured"
// means something that can be checked rather than a word.

export function FeaturedProducts({ onShop }: { onShop: Shop }) {
  const { t, tn } = useLang();
  const { listings, loadPhase } = useMarket();
  // Best-rated first, but one per crop: ranking alone filled the shelf with
  // four sacks of rice, because the top-rated sellers here all grow rice.
  // A featured shelf that shows the same thing four times is a shelf of one.
  const seen = new Set<string>();
  // Special Rice → Rice, Red → Onions: the crop a listing is filed under.
  const groupOf = (l: { crop: string }) => CROP_GROUP_BY_ID[CROPS.find(c => c.name === l.crop)?.id ?? ""] || l.crop;
  // A row holds more than a grid of four did, and the ones past the edge are
  // the reason to push it along.
  const picks = [...listings]
    .sort((a, b) => b.rating - a.rating || new Date(b.date).getTime() - new Date(a.date).getTime())
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
      <p className="hm-sec-sub">{t("fp_sub")}</p>

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
// back up. The spotlight rotates weekly through the four best-rated growers,
// which is what makes "Farmer of the week" true rather than decorative.

// The same colour a farmer has in their profile sheet.
const tone = avatarTone;
const townOf = (loc: string) => loc.split(",")[0].trim();

export function FeaturedFarmers({ onShop, buyerLocation }: { onShop: Shop; buyerLocation: string }) {
  // Always in English, like the profile sheet it opens: a farmer's public
  // card reads the same to every buyer, crop names included.
  // Everyone with something on sale, best-rated first. Keyed the way the
  // marketplace finds a seller again: account id, or initials in the demo.
  // The spotlight is the same pick that awards the Profile achievement.
  const { sellers, loadPhase } = useMarket();
  const ranked = rankSellers(sellers);
  const spot = farmerOfTheWeek(sellers);
  // Still loading: three farmers' rows under the title.
  if (loadPhase !== "ready") {
    return loadPhase === "skeleton" ? (
      <section className="hm-sec" aria-labelledby="ff-t" data-tour="b-farmers">
        <h2 className="hm-sec-title" id="ff-t">{en("ff_title")}</h2>
        <p className="hm-sec-sub">{en("ff_sub")}</p>
        <div className="card" style={{ marginTop: 14 }}>
          <SkeletonMediaRows rows={3} tile={46} round end={false} label={en("state_loading_farmers")} />
        </div>
      </section>
    ) : null;
  }
  if (!spot) return null;

  // Then three more: anyone growing in the buyer's own town first (tagged, so
  // the reason for the order is visible), then by rating.
  const isNear = (loc: string) => !!buyerLocation && buyerLocation.includes(townOf(loc));
  const rest = ranked
    .filter(s => s.key !== spot.key)
    .sort((a, b) => Number(isNear(b.location)) - Number(isNear(a.location)))
    .slice(0, 3);

  const open = (s: { key: string; name: string }) => onShop({ seller: s.key, search: s.name });

  return (
    <section className="hm-sec" aria-labelledby="ff-t" data-tour="b-farmers">
      <h2 className="hm-sec-title" id="ff-t">{en("ff_title")}</h2>
      <p className="hm-sec-sub">{en("ff_sub")}</p>

      <div className="ff">
        {/* The spotlight is a profile to read, not a button: only "See their
            harvest" acts, so a thumb resting on the bio or scrolling past the
            photo doesn't jump the buyer into the marketplace. */}
        {/* Drawn like the farmer's own profile sheet, so tapping through
            from here lands on something that already looks familiar: their
            harvest blurred into light, the ringed avatar, the three numbers
            on a card over the photo's edge. */}
        <article className="ff-spot">
          <div className="spf-hero ff-hero">
            <img className="spf-mark" src={leafMask} alt="" aria-hidden="true" />
            <span className="ff-badge"><Award size={15} strokeWidth={2.6} /> {en("ff_week")}</span>
            <div className="spf-id">
              <span className="spf-ava" style={{ background: tone(spot.name) }} aria-hidden="true">{spot.initials}</span>
              <div className="spf-name">{spot.name}</div>
              <div className="spf-loc"><MapPin size={14} strokeWidth={2.4} /> {spot.location}</div>
            </div>
          </div>
          <div className="spf-stats">
            <div className="spf-stat">
              <span className="spf-stat-v"><Star size={16} strokeWidth={0} fill="#C98A1B" /> {spot.rating.toFixed(1)}</span>
              <span className="spf-stat-l">{en("seller_rating")}</span>
            </div>
            <div className="spf-stat">
              <span className="spf-stat-v">{spot.yearsfarming}<small> {en("seller_years_suffix")}</small></span>
              <span className="spf-stat-l">{en("seller_experience")}</span>
            </div>
            <div className="spf-stat">
              <span className="spf-stat-v">{spot.totalSales}+</span>
              <span className="spf-stat-l">{en("seller_sales")}</span>
            </div>
          </div>
          <span className="ff-spot-body">
            <span className="spf-bio ff-bio">{spot.bio}</span>
            <span className="spf-crops">
              {spot.crops.map(c => <span key={c} className="spf-crop">{c}</span>)}
            </span>
            {/* The card's one action, as wide as the card, with a "go" disc
                at the end that nudges forward under the thumb. */}
            <button type="button" className="ff-cta" onClick={() => open(spot)}>
              <span>{en("ff_cta")}</span>
              <span className="ff-cta-go" aria-hidden="true"><ArrowRight size={18} strokeWidth={2.6} /></span>
            </button>
          </span>
        </article>

        <div className="ff-list stagger-list">
          {rest.map(s => (
            <button key={s.key} className="ff-row" onClick={() => open(s)}>
              <span className="ff-ava" style={{ background: tone(s.name) }} aria-hidden="true">{s.initials}</span>
              <span className="ff-row-body">
                <span className="ff-row-name">
                  {s.name}
                  {isNear(s.location) && <span className="ff-near">{en("ff_near")}</span>}
                </span>
                <span className="ff-row-meta">
                  <span className="ff-star"><Star size={13} fill="currentColor" strokeWidth={0} /> {s.rating}</span>
                  {" · "}{townOf(s.location)}
                </span>
              </span>
              <ChevronRight size={20} strokeWidth={2.4} className="ff-chev" aria-hidden="true" />
            </button>
          ))}
        </div>
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

export function YourPurchases({ onShop, onHistory }: { onShop: Shop; onHistory: () => void }) {
  const { t, tn, lang } = useLang();
  const { purchases } = useMarket();
  if (purchases.length === 0) return null;
  const locale = lang === "tl" ? "fil-PH" : "en-PH";

  const spent = purchases.reduce((sum, tx) => sum + tx.amount, 0);
  const orders = purchases.length;
  const farmers = new Set(purchases.map(tx => tx.seller)).size;

  // Spend per crop, biggest first. Past four, the tail folds into "Other"
  // rather than becoming a fifth, sixth, seventh bar.
  const byCrop = new Map<string, number>();
  purchases.forEach(tx => byCrop.set(tx.crop, (byCrop.get(tx.crop) || 0) + tx.amount));
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
        <div className="yp-total">₱{spent.toLocaleString()}</div>
        <p className="yp-summary">{summary}</p>

        <h3 className="yp-h">{t("yp_where")}</h3>
        <ul className="yp-bars">
          {parts.map(p => (
            <li key={p.crop} className="yp-bar-row">
              <span className="yp-bar-name">{p.crop === "__other" ? t("yp_other") : tn(p.crop)}</span>
              <span className="yp-bar-track" aria-hidden="true">
                <span className="yp-bar" style={{ width: `${Math.max(4, (p.amount / top) * 100)}%` }} />
              </span>
              <span className="yp-bar-amt">₱{p.amount.toLocaleString()}</span>
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
                  <span className="yp-item-meta">{tx.kg} kg · <b>₱{tx.amount.toLocaleString()}</b></span>
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
