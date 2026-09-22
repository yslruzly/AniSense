import { ChevronRight, MapPin, Star, Award, ShoppingBag, ArrowLeft, ArrowRight, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import { useLang } from "../../i18n";
import { CROPS, CROP_FILTER_MAP } from "../../data/crops";
import { SELLER_DETAILS } from "../../data/marketplace";
import { BUYER_TRANSACTIONS } from "../../data/expenses";
import { cropPhoto, cropPhotoFor } from "../../data/cropPhotos";
import { CropIcon } from "../icons";
import { TradeIntent } from "../../types";

// ─── Buyer Home sections ──────────────────────────────────────────────────────
// The pieces of the buyer's Home that the farmer never sees. Each one opens
// the marketplace already showing what was tapped (a crop, a farmer, the
// search box) rather than dropping the buyer at the top of it to start over.

type Shop = (intent: TradeIntent) => void;

// ── Shop by crop ─────────────────────────────────────────────────────────────
// Eight crops, eight tiles, a 4 × 2 grid: every category on one screen with no
// swiping, and a picture to recognise before a word to read.
const SHOP_CATS = Object.keys(CROP_FILTER_MAP);
const catPhoto = (cat: string) => (cat === "Rice" ? cropPhoto("rice-special") : cropPhotoFor(cat));

export function ShopByCrop({ onShop }: { onShop: Shop }) {
  const { t, tn } = useLang();
  return (
    <section className="hm-sec" aria-labelledby="shop-t">
      <h2 className="hm-sec-title" id="shop-t">{t("home_shop_by_crop")}</h2>
      <div className="shop-grid stagger-list">
        {SHOP_CATS.map(cat => {
          const photo = catPhoto(cat);
          return (
            <button key={cat} className="shop-cat" onClick={() => onShop({ category: cat })}>
              <span className="shop-cat-img">
                {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropIcon crop={cat} size={26} />}
              </span>
              <span className="shop-cat-lbl">{tn(cat)}</span>
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
    <section className="mv" aria-labelledby="mv-t">
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
                {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropIcon crop={c.name} size={18} />}
              </span>
              <span className="mv-txt">
                <span className="mv-name">{name}</span>
                <span className="mv-price">₱{c.pricePerKg}<small>{t("per_kg_short")}</small></span>
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
              aria-label={`${name}, ₱${c.pricePerKg} ${t("per_kg_short")}, ${pct}% ${dir === "down" ? t("bm_cheaper_aria") : t("bm_pricier_aria")}`}
            >
              {dir === "up" ? <>{id}{bar}</> : <>{bar}{id}</>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ── Featured farmers ─────────────────────────────────────────────────────────
// The trust half of a marketplace: who is growing this food. Only real fields
// are shown (rating, sales, years, town); no "verified" badge the data cannot
// back up. The spotlight rotates weekly through the four best-rated growers,
// which is what makes "Farmer of the week" true rather than decorative.

const AVA_TONES = ["#0B6B41", "#9A5B13", "#B4462B", "#2F6FA8", "#6B4FA0"];
const tone = (s: string) => AVA_TONES[[...s].reduce((n, ch) => n + ch.charCodeAt(0), 0) % AVA_TONES.length];
const townOf = (loc: string) => loc.split(",")[0].trim();

const RANKED = Object.entries(SELLER_DETAILS)
  .map(([key, s]) => ({ key, ...s }))
  .sort((a, b) => b.rating - a.rating || b.totalSales - a.totalSales);

export function FeaturedFarmers({ onShop, buyerLocation }: { onShop: Shop; buyerLocation: string }) {
  const { t, tn } = useLang();
  const week = Math.floor(Date.now() / (7 * 864e5));
  const spot = RANKED[week % Math.min(4, RANKED.length)];
  if (!spot) return null;

  // Then three more: anyone growing in the buyer's own town first (tagged, so
  // the reason for the order is visible), then by rating.
  const isNear = (loc: string) => !!buyerLocation && buyerLocation.includes(townOf(loc));
  const rest = RANKED
    .filter(s => s.key !== spot.key)
    .sort((a, b) => Number(isNear(b.location)) - Number(isNear(a.location)))
    .slice(0, 3);

  const cover = cropPhotoFor(spot.crops[0] || "", spot.crops[0]);
  const open = (s: { key: string; name: string }) => onShop({ seller: s.key, search: s.name });

  return (
    <section className="hm-sec" aria-labelledby="ff-t">
      <h2 className="hm-sec-title" id="ff-t">{t("ff_title")}</h2>
      <p className="hm-sec-sub">{t("ff_sub")}</p>

      <div className="ff">
        <button className="ff-spot" onClick={() => open(spot)}>
          <span className="ff-cover">
            {cover && <img src={cover} alt="" loading="lazy" decoding="async" />}
            <span className="ff-badge"><Award size={15} strokeWidth={2.6} /> {t("ff_week")}</span>
          </span>
          <span className="ff-spot-body">
            {/* The avatar straddles the photo's edge: the person stands in
                front of what they grow. */}
            <span className="ff-ava lg" style={{ background: tone(spot.name) }} aria-hidden="true">{spot.initials}</span>
            <span className="ff-name">{spot.name}</span>
            <span className="ff-meta">
              <span className="ff-star"><Star size={15} fill="currentColor" strokeWidth={0} /> {spot.rating}</span>
              <span>· {spot.totalSales} {t("ff_sales")}</span>
              <span>· {spot.yearsfarming} {t("ff_years")}</span>
            </span>
            <span className="ff-loc"><MapPin size={14} strokeWidth={2.4} /> {spot.location}</span>
            <span className="ff-bio">{spot.bio}</span>
            <span className="ff-crops">
              {spot.crops.map(c => <span key={c} className="ff-chip">{tn(c)}</span>)}
            </span>
            <span className="ff-cta">{t("ff_cta")} <ChevronRight size={18} strokeWidth={2.6} /></span>
          </span>
        </button>

        <div className="ff-list stagger-list">
          {rest.map(s => (
            <button key={s.key} className="ff-row" onClick={() => open(s)}>
              <span className="ff-ava" style={{ background: tone(s.name) }} aria-hidden="true">{s.initials}</span>
              <span className="ff-row-body">
                <span className="ff-row-name">
                  {s.name}
                  {isNear(s.location) && <span className="ff-near">{t("ff_near")}</span>}
                </span>
                <span className="ff-row-meta">
                  <span className="ff-star"><Star size={13} fill="currentColor" strokeWidth={0} /> {s.rating}</span>
                  {" · "}{tn(s.crops[0] || "")}{" · "}{townOf(s.location)}
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
// "Buy again" and "Spent on purchases" were two cards about the same thing.
// One card now: the three numbers up top, the reorder rows under them.

export function YourPurchases({ onShop, onHistory }: { onShop: Shop; onHistory: () => void }) {
  const { t, tn } = useLang();
  if (BUYER_TRANSACTIONS.length === 0) return null;
  const recent = [...BUYER_TRANSACTIONS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 2);
  const spent = BUYER_TRANSACTIONS.reduce((sum, tx) => sum + tx.amount, 0);
  const farmers = new Set(BUYER_TRANSACTIONS.map(tx => tx.seller)).size;

  return (
    <section className="hm-card tint-blue" aria-labelledby="yp-t">
      <div className="hm-card-head">
        <span className="hm-ico"><ShoppingBag size={20} strokeWidth={2.2} /></span>
        {/* No subtitle: the three numbers below say what this card is. */}
        <div>
          <h2 className="hm-title" id="yp-t">{t("yp_title")}</h2>
        </div>
        <button className="hm-link" onClick={onHistory}>
          {t("yp_history")} <ChevronRight size={16} strokeWidth={2.6} />
        </button>
      </div>

      <div className="yp-stats">
        <span><b>₱{spent.toLocaleString()}</b><small>{t("yp_spent")}</small></span>
        <span><b>{BUYER_TRANSACTIONS.length}</b><small>{t("home_purchases_n")}</small></span>
        <span><b>{farmers}</b><small>{t("yp_farmers")}</small></span>
      </div>

      <div className="stagger-list">
        {recent.map(tx => {
          const photo = cropPhotoFor(tx.crop, tx.variety);
          return (
            <button key={tx.id} className="hm-crop" onClick={() => onShop({ search: tx.variety || tx.crop })}>
              <span className="hm-crop-photo">
                {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropIcon crop={tx.crop} size={22} />}
              </span>
              <span className="hm-crop-body">
                <span className="hm-crop-name">{tx.variety || tn(tx.crop)}</span>
                <span className="hm-crop-var">{tx.kg} kg · ₱{tx.amount.toLocaleString()} · {tx.seller}</span>
              </span>
              <span className="hm-again">{t("home_buy_again")} <ChevronRight size={15} strokeWidth={2.6} /></span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
