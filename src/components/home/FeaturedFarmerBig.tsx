import { ArrowRight, MapPin, Star } from "lucide-react";
import { translations } from "../../i18n";
import { avatarTone } from "../../lib/avatar";
import { FeaturedFarmer, townOf } from "../../lib/featured";
import { ratingText, unrated } from "../../lib/rating";
import { FarmerOfTheWeekBadge } from "../marketplace/FarmerOfTheWeekBadge";
import leafMask from "../../assets/anisense-leaf-mask.png";

// ─── A featured farmer, as a big card (Home) ──────────────────────────────────
// Drawn like the farmer's own profile sheet, so tapping through lands on
// something that already looks familiar: the AniSense green ground and its
// faint leaf, the ringed avatar, the name and town in white, and the three
// numbers (rating, years, sales) on a card riding over the photo's edge. The
// Farmer of the Week wears the gold plate on the photo (`week`); the others
// are the same card without it, and say "Near you" there when they are.
//
// The card holds the profile's own pieces, which a button can't contain, so
// one button is laid over the whole of it. Pressed, the card dims a shade and
// the arrow on the photo steps forward. In English, like the profile it opens.
// `copy`: the second drawing in a row that loops, seen and tappable but
// neither read out nor reached with Tab.

const en = (k: keyof typeof translations) => translations[k].en;

export function FeaturedFarmerBig({ farmer: s, onOpen, week = false, copy = false }: {
  farmer: FeaturedFarmer;
  onOpen: () => void;
  week?: boolean;
  copy?: boolean;
}) {
  const town = townOf(s.location);
  const label = week
    ? `${s.name}, ${en("ff_week")}. ${en("ff_cta")}`
    : [s.name, `${ratingText(s, en("rating_new"))} ★`, town, s.near ? en("ff_near") : ""].filter(Boolean).join(", ") + `. ${en("ff_cta")}`;
  return (
    <article className={`ffb${week ? " is-week" : ""}`} aria-hidden={copy || undefined}>
      <button type="button" className="ffb-hit" onClick={onOpen} aria-label={label} tabIndex={copy ? -1 : undefined} />
      <div className="spf-hero ffb-hero" aria-hidden="true">
        <img className="spf-mark" src={leafMask} alt="" />
        {week && <FarmerOfTheWeekBadge />}
        {!week && s.near && <span className="ffb-near">{en("ff_near")}</span>}
        <span className="ffb-go"><ArrowRight size={20} strokeWidth={2.6} /></span>
        <div className="spf-id">
          <span className="spf-ava" style={{ background: avatarTone(s.name) }}>{s.initials}</span>
          <div className="spf-name">{s.name}</div>
          <div className="spf-loc"><MapPin size={14} strokeWidth={2.4} /> {s.location}</div>
        </div>
      </div>
      <div className="spf-stats" aria-hidden="true">
        <div className="spf-stat">
          <span className="spf-stat-v">{unrated(s) ? en("rating_new") : <><Star size={16} strokeWidth={0} fill="#C98A1B" /> {s.rating.toFixed(1)}</>}</span>
          <span className="spf-stat-l">{s.ratingCount ? `${s.ratingCount} ${en(s.ratingCount === 1 ? "rating_one" : "rating_n")}` : en("seller_rating")}</span>
        </div>
        <div className="spf-stat">
          <span className="spf-stat-v">{s.yearsfarming}<small> {en("seller_years_suffix")}</small></span>
          <span className="spf-stat-l">{en("seller_experience")}</span>
        </div>
        <div className="spf-stat">
          <span className="spf-stat-v">{s.totalSales}+</span>
          <span className="spf-stat-l">{en("seller_sales")}</span>
        </div>
      </div>
    </article>
  );
}
