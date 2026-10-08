import type { CSSProperties } from "react";
import { Star } from "lucide-react";
import { useLang } from "../../i18n";
import { useMarket } from "../../store/market";
import { useViewer } from "../../store/viewer";
import { featuredLineup, townOf } from "../../lib/featured";
import { avatarTint, avatarTone } from "../../lib/avatar";
import { ratingText } from "../../lib/rating";
import { AniSenseLogo } from "../brand/AniSenseLogo";
import leafMask from "../../assets/anisense-leaf-mask.png";

// ── Featured farmers, in the Market ──────────────────────────────────────────
// The same five as Home's (src/lib/featured.ts): the Farmer of the Week, then
// four more, anyone in the viewer's own town first. Each card has a cover
// band in its farmer's own colour, pale; the first card's is gold, with a
// gold glow, but no "Farmer of the Week" label. They sit on a small AniSense
// poster: the green ground of the profile a tap opens, the leaf mark faint,
// and the brand small on the top edge. Here they are a short
// row of cards above the harvests, so meeting the growers never pushes the
// produce out of sight. A tap opens the farmer's profile, with everything they
// have on sale. The Market shows it only while browsing everything: a search
// or a filter means the buyer already knows what they want.

export function FeaturedFarmersRow({ onOpen }: { onOpen: (sellerKey: string) => void }) {
  const { t } = useLang();
  const { sellers, loadPhase, showingSamples } = useMarket();
  const { location } = useViewer();
  // Nothing while the Market loads: the list under it shows the wait.
  if (loadPhase !== "ready") return null;
  const { spot, rest } = featuredLineup(sellers, location);
  if (!spot) return null;
  const lineup = [spot, ...rest];

  return (
    <section className="mpf" aria-labelledby="mpf-t">
      <img className="mpf-mark" src={leafMask} alt="" aria-hidden="true" />
      <div className="mpf-brand" aria-hidden="true">
        <span className="mpf-brand-mark"><AniSenseLogo size={18} /></span>
        <span className="mpf-brand-name">AniSense</span>
      </div>
      <h2 className="hm-sec-title" id="mpf-t">{t("ff_title")}</h2>
      <p className="hm-sec-sub">{t(showingSamples ? "ff_sub_sample" : "ff_sub")}</p>
      <div className="mpf-row">
        {lineup.map((s, i) => {
          const week = i === 0;
          const town = townOf(s.location);
          return (
            <button key={s.key} type="button" className={`mpf-card${week ? " is-week" : ""}`} onClick={() => onOpen(s.key)}
              style={{ "--tint": avatarTint(s.name) } as CSSProperties}
              aria-label={[s.name, `${ratingText(s, t("rating_new"))} ★`, town, s.near ? t("ff_near") : ""].filter(Boolean).join(", ")}>
              <span className="ff-ava" style={{ background: avatarTone(s.name) }} aria-hidden="true">{s.initials}</span>
              <span className="mpf-name" aria-hidden="true">{s.name}</span>
              <span className="mpf-meta" aria-hidden="true">
                <Star size={13} fill="currentColor" strokeWidth={0} /> {ratingText(s, t("rating_new"))}{town && <> · {town}</>}
              </span>
              {s.near && <span className="ff-near" aria-hidden="true">{t("ff_near")}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
