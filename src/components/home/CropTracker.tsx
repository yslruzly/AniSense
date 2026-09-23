import { useState } from "react";
import { Sprout, CalendarPlus, Minus, Plus, X, Scissors } from "lucide-react";
import { useLang } from "../../i18n";
import { cropGroupPhoto } from "../../data/cropPhotos";
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

export function CropTracker({ plantings, onChange }: {
  plantings: Planting[];
  onChange: (next: Planting[]) => void;
}) {
  const { t, tn } = useLang();
  const [adding, setAdding] = useState(false);
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

  return (
    <section className="hm-sec" aria-labelledby="ct-t">
      <div className="hm-sec-row">
        <h2 className="hm-sec-title" id="ct-t">{t("ct_title")}</h2>
      </div>
      <p className="hm-sec-sub">{t("ct_sub")}</p>

      <div className="ct">
        {plantings.length === 0 ? (
          <p className="ct-empty">{t("ct_empty")}</p>
        ) : (
          <ul className="ct-list">
            {plantings.map(p => {
              const day = dayOf(p);
              const progress = Math.min(1, progressOf(p));
              const stage = stageOf(progressOf(p));
              const ready = stage === "ready";
              const photo = cropGroupPhoto(p.crop);
              return (
                <li key={p.id} className={`ct-row ${ready ? "ready" : ""}`}>
                  <div className="ct-head">
                    <span className="ct-photo">
                      {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropIcon crop={p.crop} size={20} />}
                    </span>
                    <span className="ct-id">
                      <span className="ct-name">{tn(p.crop)}</span>
                      {/* The day number first: it is what changed since
                          yesterday, and the reason to look. */}
                      <span className="ct-day">
                        {t("ct_day").replace("{day}", String(day)).replace("{days}", String(p.days))}
                      </span>
                    </span>
                    <span className={`ct-stage ${stage}`}>
                      {ready && <Scissors size={13} strokeWidth={2.8} />}
                      {t(`ct_stage_${stage}`)}
                    </span>
                    <button className="ct-x" onClick={() => remove(p.id)} aria-label={`${t("ct_remove")} ${tn(p.crop)}`}>
                      <X size={17} strokeWidth={2.6} />
                    </button>
                  </div>
                  <div
                    className="ct-track"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={p.days}
                    aria-valuenow={Math.min(day, p.days)}
                    aria-label={`${tn(p.crop)}: ${left(p)}`}
                  >
                    <span className="ct-fill" style={{ width: `${progress * 100}%` }} />
                  </div>
                  <div className="ct-foot">{left(p)}</div>
                </li>
              );
            })}
          </ul>
        )}

        <button className="ct-add" onClick={open}>
          <CalendarPlus size={19} strokeWidth={2.4} /> {t("ct_add")}
        </button>
      </div>

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
