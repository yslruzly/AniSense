import { ArrowRight, MapPin, Star } from "lucide-react";
import { translations } from "../../i18n";
import { avatarTone } from "../../lib/avatar";
import { townOf, FeaturedFarmer } from "../../lib/featured";
import { ratingText, unrated } from "../../lib/rating";
import leafMask from "../../assets/anisense-leaf-mask.png";

// ─── A featured farmer, as a small card ───────────────────────────────────────
// One card for both rows of Featured farmers, Home's and the Market's, so the
// two never drift apart. A small copy of the farmer's profile: the AniSense
// green ground (.spf-hero) and faint leaf, the ringed avatar, the name and
// town in white, an arrow on the photo, and the three numbers (rating, years,
// sales) on a white card riding over the photo's edge. The whole card is one
// button, and opens the farmer.
//
// The Farmer of the Week, first in the Market's row, is marked by its border alone:
// a palay-gold ring with light running round it and a glow (`week`). `say` is
// the screen's words, in the app's language. (Home draws its farmers big:
// home/FeaturedFarmerBig.tsx.)

export function FeaturedFarmerCard({ farmer: s, onOpen, say, week = false }: {
  farmer: FeaturedFarmer;
  onOpen: () => void;
  say: (key: keyof typeof translations) => string;
  week?: boolean;
}) {
  const town = townOf(s.location);
  return (
    <button type="button" className={`ffc${week ? " is-week" : ""}`} onClick={onOpen}
      aria-label={[s.name, `${ratingText(s, say("rating_new"))} ★`, town, s.near ? say("ff_near") : ""].filter(Boolean).join(", ")}>
      <span className="spf-hero ffc-hero" aria-hidden="true">
        <img className="spf-mark" src={leafMask} alt="" />
        {s.near && <span className="ffc-near">{say("ff_near")}</span>}
        <span className="ffc-go"><ArrowRight size={16} strokeWidth={2.6} /></span>
        <span className="ffc-id">
          <span className="spf-ava ffc-ava" style={{ background: avatarTone(s.name) }}>{s.initials}</span>
          <span className="ffc-name">{s.name}</span>
          {town && <span className="ffc-loc"><MapPin size={12} strokeWidth={2.4} /> {town}</span>}
        </span>
      </span>
      <span className="ffc-stats" aria-hidden="true">
        <span className="ffc-stat">
          <span className="ffc-stat-v">{unrated(s) ? say("rating_new") : <><Star size={13} strokeWidth={0} fill="#C98A1B" /> {s.rating.toFixed(1)}</>}</span>
          <span className="ffc-stat-l">{say("seller_rating")}</span>
        </span>
        <span className="ffc-stat">
          <span className="ffc-stat-v">{s.yearsfarming}<small> {say("seller_years_suffix")}</small></span>
          <span className="ffc-stat-l">{say("seller_experience")}</span>
        </span>
        <span className="ffc-stat">
          <span className="ffc-stat-v">{s.totalSales}+</span>
          <span className="ffc-stat-l">{say("seller_sales")}</span>
        </span>
      </span>
    </button>
  );
}
