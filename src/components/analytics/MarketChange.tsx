import { translations } from "../../i18n";
import { CROP_GROUPS, RICE_VARIETIES } from "../../data/crops";

// ─── Price change today ───────────────────────────────────────────────────────
// Every crop on one diverging scale: up to the right, down to the left, from a
// zero line in the middle, biggest rise first. The job is polarity, so two
// hues and a neutral zero; the sign on every value and the side of the line
// carry it as well, so it never rests on red against green alone (the pair is
// in the colour-blind "legal with a second cue" band of the dataviz checker).
//
// The farmer's own crops are tagged, so "how are mine doing" is answered in
// the same glance as "how is the market doing".

const en = (key: keyof typeof translations) => translations[key].en;

export function MarketChange({ farmerCrops = [] }: { farmerCrops?: string[] }) {
  // This chart is always in English, whatever language the app is set to, crop
  // names included: the market's words, the same on every phone.
  const t = en;
  const tn = (crop: string) => crop;
  const groups = [{ group: "Rice", varieties: RICE_VARIETIES }, ...CROP_GROUPS];
  // A crop's move is the average of its varieties', so Rice is one row, not
  // three.
  const rows = groups
    .map(g => ({
      name: g.group,
      change: Math.round((g.varieties.reduce((sum, v) => sum + v.change, 0) / g.varieties.length) * 10) / 10,
    }))
    .sort((a, b) => b.change - a.change);
  const max = Math.max(0.1, ...rows.map(r => Math.abs(r.change)));

  return (
    <section className="an-card" aria-labelledby="mc-t">
      <h2 className="an-card-t" id="mc-t">{t("ana_change_t")}</h2>
      <p className="an-card-s">{t("ana_change_s")}</p>
      <div className="mc-list">
        {rows.map((r, i) => {
          const up = r.change > 0, down = r.change < 0;
          const mine = farmerCrops.includes(r.name);
          const w = (Math.abs(r.change) / max) * 50;
          return (
            <div className={`mc-row ${mine ? "mine" : ""}`} key={r.name}>
              <span className="mc-name">
                <span className="mc-n">{tn(r.name)}</span>
                {mine && <span className="mc-yours">{t("ana_yours")}</span>}
              </span>
              <span className="mc-track" aria-hidden="true">
                <span className="mc-zero" />
                {(up || down) && (
                  <span className={`mc-bar ${up ? "up" : "down"}`}
                    style={{ width: `${w}%`, [up ? "left" : "right"]: "50%", animationDelay: `${120 + i * 35}ms` }} />
                )}
              </span>
              <span className={`mc-val ${up ? "up" : down ? "down" : ""}`}>
                {up ? "+" : down ? "−" : ""}{Math.abs(r.change).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
