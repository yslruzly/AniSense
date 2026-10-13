import { HandCoins, Hourglass, Eye, Star, Bot, Info } from "lucide-react";
import { useLang } from "../../i18n";
import { growArtFor } from "../../data/growArt";
import { monthLabel } from "../../data/priceRecords";
import { CropIcon } from "../icons";
import { peso } from "../../lib/money";
import { adviceFor, ACTION_ORDER, Action, Advice } from "../../lib/advice";

// ─── Sell now or wait? ────────────────────────────────────────────────────────
// The AI's advice and the price forecast behind it, as one card per crop, read
// top to bottom the way the decision is made:
//
//   1. what to do, large, in its own colour and with its own picture
//      (gold for "Sell now", green for "Hold", blue for "Watch"), so the
//      answer never rests on colour alone;
//   2. why, in one sentence with the numbers in it: the price expected, in
//      which month, and how far from today's;
//   3. the four months, now and the three ahead, as a strip of prices with
//      how each differs from now. The month to sell in is filled in the
//      verdict's colour and starred: now when the price is set to fall, the
//      highest month ahead when it is set to rise, none when unsure. A
//      forecast that tested badly is hatched, the way a map marks ground
//      that has not been surveyed;
//   4. the honest part: where the last month's price will likely land.
//
// No chart. Four numbers in a row are read at once by anyone; a line has to
// be decoded. Crops with no price records have no forecast and are left out.

const ICON: Record<Action, typeof Eye> = { SELL: HandCoins, HOLD: Hourglass, WATCH: Eye };

export function SellOrWait({ farmerCrops }: { farmerCrops: string[] }) {
  const { t, tn, lang } = useLang();
  // "AniSense AI Recommendations" / "Mga Rekomendasyon ng AniSense AI": the
  // name in gold wherever the language puts it.
  const [badgeBefore, badgeAfter] = t("home_ai_recos").split("{brand}");
  const recs = farmerCrops
    .map(adviceFor)
    .filter((a): a is Advice => a !== null)
    .sort((a, b) => ACTION_ORDER[a.action] - ACTION_ORDER[b.action]);
  // None of their crops has price records yet: no advice to give.
  if (recs.length === 0) return null;

  const verdict: Record<Action, string> = { SELL: t("ana_act_sell"), HOLD: t("ana_act_hold"), WATCH: t("ana_act_watch") };
  const signed = (d: number) => `${d > 0.005 ? "+" : d < -0.005 ? "−" : "±"}${peso(Math.abs(d))}`;

  return (
    <section className="hm-sec sw" aria-labelledby="sw-t" data-tour="forecast">
      {/* The robot marks this as the AI's advice, as it always has. */}
      <span className="sw-eyebrow">
        <span className="sw-bot"><Bot size={17} strokeWidth={2.4} aria-hidden="true" /></span>
        <span>{badgeBefore}<b className="sw-brand">AniSense AI</b>{badgeAfter}</span>
      </span>
      <h2 className="hm-sec-title" id="sw-t">{t("ana_suggestion")}</h2>
      <p className="hm-sec-sub">{t("ana_suggestion_sub")}</p>

      <div className="sw-list stagger-list">
        {recs.map(({ group, run, action, last }) => {
          const now = run.current.price;
          const cells = [{ month: run.current.month, price: now }, ...run.next.map(p => ({ month: p.month, price: p.price }))];
          // The month to sell in.
          const ahead = cells.slice(1);
          const best = action === "SELL" ? 0
            : action === "HOLD" ? 1 + ahead.reduce((m, c, i) => (c.price > ahead[m].price ? i : m), 0)
            : -1;
          // The sentence's month: the best one when holding, the last otherwise.
          const target = action === "HOLD" ? cells[best] : last;
          const line = !run.reliable ? t("ana_unsure_reason")
            : (action === "SELL" ? t("sw_sell_line") : action === "HOLD" ? t("sw_hold_line") : t("sw_flat_line"))
              .replace("{price}", peso(target.price))
              .replace("{month}", monthLabel(target.month, lang, "long"))
              .replace("{diff}", peso(Math.abs(target.price - now)));
          const Icon = ICON[action];
          const art = growArtFor(group);
          const id = `sw-${group.replace(/\s+/g, "-").toLowerCase()}`;
          return (
            <article key={group} className="sw-card" data-act={action.toLowerCase()} aria-labelledby={id}>
              <div className="sw-id">
                <span className="sw-art">{art ? <img src={art} alt="" decoding="async" draggable={false} /> : <CropIcon crop={group} size={24} />}</span>
                <span className="sw-crop">
                  <span className="sw-name" id={id}>{tn(group)}</span>
                  <span className="sw-var">{run.name}</span>
                </span>
              </div>

              <div className="sw-verdict">
                <span className="sw-v-ico"><Icon size={20} strokeWidth={2.4} aria-hidden="true" /></span>
                <span className="sw-v-txt">{verdict[action]}</span>
              </div>
              <p className="sw-line">{line}</p>

              <ol className={`sw-months${run.reliable ? "" : " unsure"}`}>
                {cells.map((c, i) => {
                  const month = monthLabel(c.month, lang);
                  const said = i === 0 ? t("sw_now") : signed(c.price - now);
                  return (
                    <li key={c.month} className={i === best ? "is-best" : undefined}
                      aria-label={`${monthLabel(c.month, lang, "long")}: ${peso(c.price)}, ${said}${i === best ? `, ${t("sw_best")}` : ""}`}>
                      <span className="sw-m" aria-hidden="true">{i === best && <Star size={11} strokeWidth={0} fill="currentColor" />}{month}</span>
                      <span className="sw-p" aria-hidden="true">{peso(c.price)}</span>
                      <span className="sw-d" aria-hidden="true">{said}</span>
                    </li>
                  );
                })}
              </ol>

              <p className="sw-range">
                <Info size={15} strokeWidth={2.4} aria-hidden="true" />
                <span>
                  {t("sw_range")
                    .replace("{month}", monthLabel(last.month, lang, "long"))
                    .replace("{low}", peso(last.lower))
                    .replace("{high}", peso(last.upper))}
                </span>
              </p>
            </article>
          );
        })}
      </div>

      <p className="sw-foot">{t("ana_forecast_note")}</p>
    </section>
  );
}
