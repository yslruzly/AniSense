import { Award, Star } from "lucide-react";
import { useLang } from "../../i18n";
import { useMarket } from "../../store/market";
import { useViewer } from "../../store/viewer";
import { featuredLineup, townOf } from "../../lib/featured";
import { avatarTone } from "../../lib/avatar";

// ── Featured farmers, in the Market ──────────────────────────────────────────
// The same four as Home's (src/lib/featured.ts): the Farmer of the Week, then
// three more, anyone in the viewer's own town first. Here they are a short
// row of cards above the harvests, so meeting the growers never pushes the
// produce out of sight. A tap opens the farmer's profile, with everything they
// have on sale. The Market shows it only while browsing everything: a search
// or a filter means the buyer already knows what they want.

export function FeaturedFarmersRow({ onOpen }: { onOpen: (sellerKey: string) => void }) {
  const { t } = useLang();
  const { sellers, loadPhase } = useMarket();
  const { location } = useViewer();
  // Nothing while the Market loads: the list under it shows the wait.
  if (loadPhase !== "ready") return null;
  const { spot, rest } = featuredLineup(sellers, location);
  if (!spot) return null;
  const lineup = [spot, ...rest];

  return (
    <section className="mpf" aria-labelledby="mpf-t">
      <h2 className="hm-sec-title" id="mpf-t">{t("ff_title")}</h2>
      <p className="hm-sec-sub">{t("ff_sub")}</p>
      <div className="mpf-row">
        {lineup.map((s, i) => {
          const week = i === 0;
          const town = townOf(s.location);
          return (
            <button key={s.key} type="button" className={`mpf-card${week ? " is-week" : ""}`} onClick={() => onOpen(s.key)}
              aria-label={[s.name, week ? t("mpf_week") : "", `${s.rating.toFixed(1)} ★`, town, s.near ? t("ff_near") : ""].filter(Boolean).join(", ")}>
              {week && <span className="mpf-week" aria-hidden="true"><Award size={14} strokeWidth={2.6} /> {t("mpf_week")}</span>}
              <span className="ff-ava" style={{ background: avatarTone(s.name) }} aria-hidden="true">{s.initials}</span>
              <span className="mpf-name" aria-hidden="true">{s.name}</span>
              <span className="mpf-meta" aria-hidden="true">
                <Star size={13} fill="currentColor" strokeWidth={0} /> {s.rating.toFixed(1)}{town && <> · {town}</>}
              </span>
              {s.near && <span className="ff-near" aria-hidden="true">{t("ff_near")}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
