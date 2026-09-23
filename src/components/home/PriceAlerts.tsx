import { useState } from "react";
import { Bell, BellPlus, Check, Minus, Plus, X } from "lucide-react";
import { useLang } from "../../i18n";
import { CROPS, CROP_GROUP_BY_ID } from "../../data/crops";
import { cropPhoto } from "../../data/cropPhotos";
import { CropIcon } from "../icons";
import { Sheet } from "../ui/Sheet";
import { PickerField } from "../ui/PickerField";
import { haptic } from "../../lib/platform";
import { PriceAlert, alertHit, isRising, newAlertId } from "../../lib/priceAlerts";

// ─── Price alerts ─────────────────────────────────────────────────────────────
// The forecast says a price is climbing; this is what a farmer does about it.
// Set a target on a crop, and the app says so when the price gets there.
//
// Deliberately small: a crop, a number, and a line of plain words saying what
// will happen. No repeat rules, no schedules — those are questions a farmer
// standing in a field does not want to answer.

const priceOf = (id: string) => CROPS.find(c => c.id === id)?.pricePerKg ?? 0;

export function PriceAlerts({ alerts, onChange, farmerCrops }: {
  alerts: PriceAlert[];
  onChange: (next: PriceAlert[]) => void;
  farmerCrops: string[];
}) {
  const { t, tn } = useLang();
  const [adding, setAdding] = useState(false);
  // The farmer's own crops first: the ones they are most likely to watch.
  const ordered = [...CROPS].sort((a, b) => {
    const am = farmerCrops.includes(CROP_GROUP_BY_ID[a.id] || "") ? 0 : 1;
    const bm = farmerCrops.includes(CROP_GROUP_BY_ID[b.id] || "") ? 0 : 1;
    return am - bm;
  });
  const [cropId, setCropId] = useState(ordered[0]?.id ?? "");
  const current = priceOf(cropId);
  // Opens at a target just above today's price, rounded to a peso: the
  // common case is "tell me when it goes up a bit", already filled in.
  const [target, setTarget] = useState(() => Math.ceil(current * 1.05));

  const pickCrop = (id: string) => {
    setCropId(id);
    setTarget(Math.ceil(priceOf(id) * 1.05));
  };

  const open = () => {
    const first = ordered[0]?.id ?? "";
    setCropId(first);
    setTarget(Math.ceil(priceOf(first) * 1.05));
    setAdding(true);
  };

  const save = () => {
    const crop = CROPS.find(c => c.id === cropId);
    if (!crop || !target) return;
    haptic.select();
    onChange([
      { id: newAlertId(), cropId: crop.id, cropName: crop.name, target, setAtPrice: crop.pricePerKg, setAt: new Date().toISOString() },
      ...alerts,
    ]);
    setAdding(false);
  };

  const remove = (id: string) => { haptic.select(); onChange(alerts.filter(a => a.id !== id)); };

  const nudge = (by: number) => setTarget(v => Math.max(1, v + by));

  return (
    <section className="hm-sec" aria-labelledby="pa-t">
      <div className="hm-sec-row">
        <h2 className="hm-sec-title" id="pa-t">{t("pa_title")}</h2>
      </div>
      <p className="hm-sec-sub">{t("pa_sub")}</p>

      <div className="pa">
        {alerts.length === 0 ? (
          <p className="pa-empty">{t("pa_empty")}</p>
        ) : (
          <ul className="pa-list">
            {alerts.map(a => {
              const price = priceOf(a.cropId);
              const hit = alertHit(a, price);
              const gap = Math.abs(a.target - price);
              const photo = cropPhoto(a.cropId);
              return (
                <li key={a.id} className={`pa-row ${hit ? "hit" : ""}`}>
                  <span className="pa-photo">
                    {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropIcon crop={a.cropName} size={20} />}
                  </span>
                  <span className="pa-body">
                    <span className="pa-name">{tn(a.cropName)}</span>
                    <span className="pa-meta">
                      {hit
                        ? t("pa_reached").replace("{price}", `₱${a.target}`)
                        : t(isRising(a) ? "pa_waiting_up" : "pa_waiting_down")
                            .replace("{target}", `₱${a.target}`)
                            .replace("{gap}", `₱${gap}`)}
                    </span>
                  </span>
                  {hit
                    ? <span className="pa-hit"><Check size={15} strokeWidth={3} /> ₱{price}</span>
                    : <span className="pa-now">₱{price}<small>{t("per_kg_short")}</small></span>}
                  <button className="pa-x" onClick={() => remove(a.id)} aria-label={`${t("pa_remove")} ${tn(a.cropName)}`}>
                    <X size={18} strokeWidth={2.6} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <button className="pa-add" onClick={open}>
          <BellPlus size={19} strokeWidth={2.4} /> {t("pa_add")}
        </button>
      </div>

      <Sheet open={adding} onClose={() => setAdding(false)} className="pa-sheet" label={t("pa_add")}>
        <div className="pa-sheet-head">
          <span className="pa-sheet-ico"><Bell size={20} strokeWidth={2.4} /></span>
          <h3 className="pa-sheet-t">{t("pa_add")}</h3>
          <button className="pa-x" onClick={() => setAdding(false)} aria-label={t("close")}>
            <X size={20} strokeWidth={2.6} />
          </button>
        </div>

        <div className="pa-field">
          <label className="pa-lbl">{t("pa_crop")}</label>
          <PickerField
            title={t("pa_crop")}
            placeholder={t("pa_crop")}
            value={cropId}
            options={ordered.map(c => ({ value: c.id, label: `${c.name} · ₱${c.pricePerKg}` }))}
            onChange={pickCrop}
          />
        </div>

        <div className="pa-field">
          <label className="pa-lbl" htmlFor="pa-target">{t("pa_target")}</label>
          {/* A stepper either side of the number: a farmer setting ₱170 from
              ₱160 taps twice at ₱5 a tap, and never opens a keyboard. */}
          <div className="pa-step">
            <button onClick={() => nudge(-5)} aria-label={t("pa_less")}><Minus size={22} strokeWidth={2.8} /></button>
            <span className="pa-step-val">
              ₱<input
                id="pa-target"
                type="number"
                inputMode="numeric"
                value={target}
                onChange={e => setTarget(Math.max(0, Number(e.target.value)))}
              />
            </span>
            <button onClick={() => nudge(5)} aria-label={t("pa_more")}><Plus size={22} strokeWidth={2.8} /></button>
          </div>
          <p className="pa-help">{t("pa_today").replace("{price}", `₱${current}`)}</p>
        </div>

        {/* What will happen, in words, before they commit to it. */}
        <p className="pa-promise">
          {t(target >= current ? "pa_promise_up" : "pa_promise_down")
            .replace("{crop}", tn(CROPS.find(c => c.id === cropId)?.name || ""))
            .replace("{target}", `₱${target}`)}
        </p>

        <button className="mp-sell-btn pa-save" onClick={save} disabled={!target}>
          <Bell size={19} strokeWidth={2.6} /> {t("pa_save")}
        </button>
      </Sheet>
    </section>
  );
}
