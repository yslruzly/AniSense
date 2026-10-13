import { useState } from "react";
import { Sprout, Leaf, Flower2, Wheat, Cherry, Minus, Plus, X, Scissors } from "lucide-react";
import { useLang } from "../../i18n";
import { cropGroupPhoto } from "../../data/cropPhotos";
import { growArtFor } from "../../data/growArt";
import leafMask from "../../assets/anisense-leaf-mask.png";
import { CROP_CYCLES, cycleFor, stageOf } from "../../data/cropCycles";
import { CropIcon } from "../icons";
import { Sheet } from "../ui/Sheet";
import { PickerField } from "../ui/PickerField";
import { haptic } from "../../lib/platform";
import { Planting, dayOf, daysLeft, progressOf, newPlantingId, localISO } from "../../lib/plantings";

// ─── Crop tracker ─────────────────────────────────────────────────────────────
// "Rice: day 62 of 110 — about 7 weeks to harvest." The day number moves every
// night on its own, so there is something new here on a morning when every
// price sits still.
//
// Nothing to maintain: a crop, a date and a day count are all it stores, and
// every line on screen is worked out from those.
//
// Each planting is a card about its season: the crop's drawing, when it went
// in; the day it is on, in large figures, since that is what changed
// overnight; then the season as a path of its five stages, the ones a farmer
// names out loud (seedling, growing, flowering, filling, harvest), each a
// picture, the stages behind it filled, the one it is in solid, the line
// drawn up to today; and at the foot, the weeks left and the date it should
// be ready. The card is AniSense green, as Your harvest is, the AniSense leaf
// large and faint across its corner; the season is drawn in palay gold on
// it. A crop due for cutting glows gold, the colour of a harvest.

type Stage = "seedling" | "growing" | "flowering" | "filling" | "ready";

/** Where each stage begins, as a share of the season (data/cropCycles). */
const PATH: { stage: Stage; at: number }[] = [
  { stage: "seedling", at: 0 }, { stage: "growing", at: 0.2 }, { stage: "flowering", at: 0.45 },
  { stage: "filling", at: 0.7 }, { stage: "ready", at: 1 },
];

/** The picture for a stage. Filling is grain for rice and corn, fruit for
 *  the others (onion, garlic, squash, tomato). */
const stageIcon = (stage: Stage, crop: string) =>
  stage === "seedling" ? Sprout : stage === "growing" ? Leaf : stage === "flowering" ? Flower2
    : stage === "filling" ? (crop === "Rice" || crop === "Corn" ? Wheat : Cherry) : Scissors;

export function CropTracker({ plantings, onChange }: {
  plantings: Planting[];
  onChange: (next: Planting[]) => void;
}) {
  const { t, tn, lang } = useLang();
  const [adding, setAdding] = useState(false);
  const locale = lang === "tl" ? "fil-PH" : "en-PH";
  const thisYear = new Date().getFullYear();
  // "Aug 12", with the year only when it isn't this one.
  const dateOf = (d: Date) => d.toLocaleDateString(locale, d.getFullYear() === thisYear
    ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "numeric" });
  const plus = (iso: string, days: number) => { const d = new Date(iso + "T00:00:00"); d.setDate(d.getDate() + days); return d; };
  const [crop, setCrop] = useState(CROP_CYCLES[0].crop);
  const [planted, setPlanted] = useState(localISO());
  const [days, setDays] = useState(CROP_CYCLES[0].days);

  const pickCrop = (c: string) => { setCrop(c); setDays(cycleFor(c)); };

  const open = () => {
    setCrop(CROP_CYCLES[0].crop);
    setDays(CROP_CYCLES[0].days);
    setPlanted(localISO());
    setAdding(true);
  };

  const save = () => {
    if (!crop || !planted || days < 1) return;
    haptic.select();
    onChange([{ id: newPlantingId(), crop, planted, days }, ...plantings]);
    setAdding(false);
  };

  const remove = (id: string) => { haptic.select(); onChange(plantings.filter(p => p.id !== id)); };

  // "about 7 weeks", or days once it is close enough to count them, because
  // "about 1 week" is no use to someone deciding whether to hire cutters.
  const left = (p: Planting) => {
    const d = daysLeft(p);
    if (d === 0) return t("ct_ready");
    if (d <= 14) return t("ct_days_left").replace("{n}", String(d));
    return t("ct_weeks_left").replace("{n}", String(Math.round(d / 7)));
  };
  // At the start of a line: "About 7 weeks to harvest".
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <section className="hm-sec" aria-labelledby="ct-t" data-tour="tracker">
      <div className="hm-sec-row">
        <h2 className="hm-sec-title" id="ct-t">{t("ct_title")}</h2>
      </div>
      <p className="hm-sec-sub">{t("ct_sub")}</p>

      {plantings.length === 0 ? (
        // Nothing yet: a sprout, and what tracking one would tell them.
        <div className="ct-empty">
          <span className="ct-empty-ico"><Sprout size={26} strokeWidth={2.2} aria-hidden="true" /></span>
          <div>
            <div className="ct-empty-t">{t("ct_empty")}</div>
            <p className="ct-empty-s">{t("ct_example").replace("{date}", dateOf(plus(localISO(), CROP_CYCLES[0].days - 1)))}</p>
          </div>
        </div>
      ) : (
        <ul className="ct-list stagger-list">
          {plantings.map(p => {
            const day = dayOf(p);
            const progress = Math.min(1, progressOf(p));
            const stage = stageOf(progressOf(p));
            const ready = stage === "ready";
            const now = PATH.findIndex(s => s.stage === stage);
            const art = growArtFor(p.crop);
            const photo = art ? undefined : cropGroupPhoto(p.crop);
            const StageIcon = stageIcon(stage, p.crop);
            // Today's mark on the line, unless it sits on a stage already.
            const between = !ready && PATH.every(s => Math.abs(s.at - progress) > 0.04);
            return (
              <li key={p.id} className={`ct-card${ready ? " ready" : ""}`}>
                {/* The AniSense leaf, large and faint, off the card's corner. */}
                <img className="ct-mark" src={leafMask} alt="" aria-hidden="true" />
                <div className="ct-head">
                  <span className="ct-art">
                    {art || photo ? <img src={art || photo} alt="" loading="lazy" decoding="async" draggable={false} /> : <CropIcon crop={p.crop} size={22} />}
                  </span>
                  <span className="ct-id">
                    <span className="ct-name">{tn(p.crop)}</span>
                    <span className="ct-planted">{t("ct_planted_on").replace("{date}", dateOf(new Date(p.planted + "T00:00:00")))}</span>
                  </span>
                  <button className="ct-x" onClick={() => remove(p.id)} aria-label={`${t("ct_remove")} ${tn(p.crop)}`}>
                    <X size={18} strokeWidth={2.6} />
                  </button>
                </div>

                {/* The day it is on: the reason to look this morning. */}
                <div className="ct-hero">
                  <span className="ct-day">
                    <span className="ct-day-n">{t("ct_day_n").replace("{day}", String(day))}</span>
                    <span className="ct-of">{t("ct_of_days").replace("{days}", String(p.days))}</span>
                  </span>
                  <span className="ct-stage"><StageIcon size={15} strokeWidth={2.6} aria-hidden="true" /> {t(`ct_stage_${stage}`)}</span>
                </div>

                {/* The season as its five stages: behind, now, ahead. */}
                <div
                  className="ct-path"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={p.days}
                  aria-valuenow={Math.min(day, p.days)}
                  aria-label={`${tn(p.crop)}: ${t(`ct_stage_${stage}`)}, ${left(p)}`}
                >
                  <span className="ct-rail" aria-hidden="true"><span className="ct-rail-fill" style={{ transform: `scaleX(${progress})` }} /></span>
                  {PATH.map((s, i) => {
                    const Icon = stageIcon(s.stage, p.crop);
                    return (
                      <span key={s.stage} aria-hidden="true"
                        className={`ct-node ${i < now ? "done" : i === now ? "now" : "next"}`}
                        style={{ ["--at" as string]: s.at }}>
                        <Icon size={i === now ? 16 : 14} strokeWidth={2.6} />
                      </span>
                    );
                  })}
                  {between && <span className="ct-today" aria-hidden="true" style={{ ["--at" as string]: progress }} />}
                </div>

                <p className="ct-left">
                  {ready && <Scissors size={16} strokeWidth={2.6} aria-hidden="true" />}
                  <b>{cap(left(p))}</b>
                  <span> · {t("ct_harvest_on").replace("{date}", dateOf(plus(p.planted, p.days - 1)))}</span>
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {/* Another planting: the same add tile as the price alerts. */}
      <button className="ct-add" onClick={open}>
        <span className="ct-add-ico"><Plus size={18} strokeWidth={3} aria-hidden="true" /></span> {t("ct_add")}
      </button>

      <Sheet open={adding} onClose={() => setAdding(false)} className="pa-sheet" label={t("ct_add")}>
        <div className="pa-sheet-head">
          <span className="pa-sheet-ico"><Sprout size={20} strokeWidth={2.4} /></span>
          <h3 className="pa-sheet-t">{t("ct_add")}</h3>
          <button className="pa-x" onClick={() => setAdding(false)} aria-label={t("close")}>
            <X size={20} strokeWidth={2.6} />
          </button>
        </div>

        <div className="pa-field">
          <label className="pa-lbl">{t("ct_crop")}</label>
          <PickerField
            title={t("pick_crop_title")}
            placeholder={t("ct_crop")}
            value={crop}
            options={CROP_CYCLES.map(c => ({
              value: c.crop,
              label: tn(c.crop),
              sub: `${c.days} ${t("ct_days")}`,
              photo: cropGroupPhoto(c.crop),
            }))}
            onChange={pickCrop}
          />
        </div>

        <div className="pa-field">
          <label className="pa-lbl" htmlFor="ct-date">{t("ct_planted")}</label>
          {/* The phone's own date wheel: familiar, and it cannot produce a
              date that does not exist. Capped at today — you cannot have
              planted tomorrow. */}
          <input
            id="ct-date"
            className="ct-date"
            type="date"
            value={planted}
            max={localISO()}
            onChange={e => setPlanted(e.target.value)}
          />
        </div>

        <div className="pa-field">
          <label className="pa-lbl" htmlFor="ct-days">{t("ct_days_lbl")}</label>
          <div className="pa-step">
            <button onClick={() => setDays(d => Math.max(20, d - 5))} aria-label={t("ct_days_less")}>
              <Minus size={22} strokeWidth={2.8} />
            </button>
            <span className="pa-step-val">
              <input
                id="ct-days"
                type="number"
                inputMode="numeric"
                value={days}
                onChange={e => setDays(Math.max(1, Number(e.target.value)))}
              />
            </span>
            <button onClick={() => setDays(d => d + 5)} aria-label={t("ct_days_more")}>
              <Plus size={22} strokeWidth={2.8} />
            </button>
          </div>
          <p className="pa-help">{t("ct_days_help")}</p>
        </div>

        <button className="mp-sell-btn pa-save" onClick={save}>
          <Sprout size={19} strokeWidth={2.6} /> {t("ct_save")}
        </button>
      </Sheet>
    </section>
  );
}
