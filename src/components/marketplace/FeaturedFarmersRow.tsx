import { useRef } from "react";
import { useLang } from "../../i18n";
import { useMarket } from "../../store/market";
import { useViewer } from "../../store/viewer";
import { featuredLineup } from "../../lib/featured";
import { FeaturedFarmerCard } from "./FeaturedFarmerCard";
import { useAutoScroll } from "../../hooks/useAutoScroll";

// ── Featured farmers, in the Market ──────────────────────────────────────────
// The same five as Home's (src/lib/featured.ts): the Farmer of the Week, then
// four more, anyone in the viewer's own town first. Drawn as Home draws them,
// with the same card (FeaturedFarmerCard), but all five in the one row: the
// Farmer of the Week leads it, set apart only by a palay-gold ring that glows,
// with no label. The row runs to the screen's edges, so a card cut at the
// edge says "more". Like Home's, it slides right to left on its own, slowly
// and without end (the five are drawn twice, and it steps back a set at the
// seam), and stops for a finger: it can be swiped either way, and carries on
// a moment after. A tap opens the farmer's profile, with everything they
// have on sale. The Market shows it only while browsing everything: a search
// or a filter means the buyer already knows what they want.

export function FeaturedFarmersRow({ onOpen }: { onOpen: (sellerKey: string) => void }) {
  const { t } = useLang();
  const { sellers, loadPhase, showingSamples } = useMarket();
  const { location } = useViewer();
  const { spot, rest } = featuredLineup(sellers, location);
  // The row slides on its own (hooks/useAutoScroll.ts); called before any
  // early return, as hooks must be.
  const autoRow = useRef<HTMLDivElement>(null);
  useAutoScroll(autoRow, { enabled: loadPhase === "ready" && !!spot });
  // Nothing while the Market loads: the list under it shows the wait.
  if (loadPhase !== "ready" || !spot) return null;
  const lineup = [spot, ...rest];

  return (
    <section className="mpf" aria-labelledby="mpf-t">
      <h2 className="hm-sec-title" id="mpf-t">{t("ff_title")}</h2>
      <p className="hm-sec-sub">{t(showingSamples ? "ff_sub_sample" : "ff_sub")}</p>
      <div className="ffc-row has-glow is-auto" ref={autoRow}>
        {[0, 1].flatMap(pass => lineup.map((s, i) => (
          <FeaturedFarmerCard key={`${pass}-${s.key}`} farmer={s} week={i === 0} say={t} copy={pass === 1} onOpen={() => onOpen(s.key)} />
        )))}
      </div>
    </section>
  );
}
