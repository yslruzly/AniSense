import { useState } from "react";
import { Bell, BellRing, Check, Minus, Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { useLang } from "../../i18n";
import { CROPS, CROP_GROUP_BY_ID, hasPrice } from "../../data/crops";
import { cropPhoto } from "../../data/cropPhotos";
import { growArtFor } from "../../data/growArt";
import { CropIcon } from "../icons";
import { Sheet } from "../ui/Sheet";
import { PickerField } from "../ui/PickerField";
import { haptic } from "../../lib/platform";
import { PriceAlert, alertHit, isRising, newAlertId } from "../../lib/priceAlerts";
import { peso } from "../../lib/money";

// ─── Price alerts ─────────────────────────────────────────────────────────────
// The forecast says a price is climbing; this is what a farmer does about it.
// Set a target on a crop, and the app says so when the price gets there.
//
// Deliberately small: a crop, a number, and a line of plain words saying what
// will happen. No repeat rules, no schedules — those are questions a farmer
// standing in a field does not want to answer.
//
// On Home, each alert is a card: the crop's drawing inside a ring that fills
// as the price travels from where it was when the alert was set to the
// target, so "how close is it?" is seen before it is read. Green for a price
// waited on to rise, blue for one waited on to fall. Then the same in words:
// the target, today's price, and how far there is to go. A reached alert is
// a full ring with a check, on a green card.

const priceOf = (id: string) => CROPS.find(c => c.id === id)?.pricePerKg ?? 0;

/** How far the price has come, from where it was when the alert was set to
 *  the target: 0 to 1. A price that has gone the other way is 0. */
const progressOf = (a: PriceAlert, price: number) => {
  if (alertHit(a, price)) return 1;
  const span = a.target - a.setAtPrice;
  if (!span || price <= 0) return 0;
  return Math.min(1, Math.max(0, (price - a.setAtPrice) / span));
};

// A ring of radius 28 in a 64 box: its length, for the dash that draws it.
const RING = 2 * Math.PI * 28;

export function PriceAlerts({ alerts, onChange, farmerCrops }: {
  alerts: PriceAlert[];
  onChange: (next: PriceAlert[]) => void;
  farmerCrops: string[];
}) {
  const { t, tn } = useLang();
  const [adding, setAdding] = useState(false);
  // The farmer's own crops first: the ones they are most likely to watch.
  const ordered = CROPS.filter(hasPrice).sort((a, b) => {
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
    <section className="hm-sec" aria-labelledby="pa-t" data-tour="alerts">
      <div className="hm-sec-row">
        <h2 className="hm-sec-title" id="pa-t">{t("pa_title")}</h2>
      </div>
      <p className="hm-sec-sub">{t("pa_sub")}</p>

      {alerts.length === 0 ? (
        // None yet: what an alert is, with an example from their own crop.
        <div className="pa-empty">
          <span className="pa-empty-ico"><BellRing size={26} strokeWidth={2.2} aria-hidden="true" /></span>
          <div>
            <div className="pa-empty-t">{t("pa_empty")}</div>
            {ordered[0] && (
              <p className="pa-empty-s">
                {t("pa_example").replace("{crop}", ordered[0].name).replace("{price}", peso(Math.ceil(ordered[0].pricePerKg * 1.05)))}
              </p>
            )}
          </div>
        </div>
      ) : (
        <ul className="pa-list stagger-list">
          {alerts.map(a => {
            const price = priceOf(a.cropId);
            const hit = alertHit(a, price);
            const up = isRising(a);
            const gap = Math.abs(a.target - price);
            const art = growArtFor(a.cropName);
            const photo = art ? undefined : cropPhoto(a.cropId);
            const Arrow = up ? ArrowUp : ArrowDown;
            return (
              <li key={a.id} className={`pa-card${up ? "" : " down"}${hit ? " hit" : ""}`}>
                {/* The ring says how close; the words below say the same. */}
                <span className="pa-dial" aria-hidden="true">
                  <svg className="pa-ring" viewBox="0 0 64 64">
                    <circle className="pa-ring-track" cx="32" cy="32" r="28" />
                    <circle className="pa-ring-fill" cx="32" cy="32" r="28" transform="rotate(-90 32 32)"
                      style={{ strokeDasharray: RING, strokeDashoffset: RING * (1 - progressOf(a, price)) }} />
                  </svg>
                  <span className="pa-art">
                    {art || photo ? <img src={art || photo} alt="" loading="lazy" decoding="async" draggable={false} /> : <CropIcon crop={a.cropName} size={20} />}
                  </span>
                  {hit && <span className="pa-check"><Check size={13} strokeWidth={3.4} /></span>}
                </span>
                <span className="pa-body">
                  <span className="pa-name">{tn(a.cropName)}</span>
                  {hit ? (
                    <>
                      <span className="pa-target"><Check size={15} strokeWidth={3} aria-hidden="true" /> {t("pa_reached").replace("{price}", peso(a.target))}</span>
                      <span className="pa-now">{t("pa_now_is").replace("{price}", peso(price))}</span>
                    </>
                  ) : (
                    <>
                      <span className="pa-target"><Arrow size={15} strokeWidth={2.8} aria-hidden="true" /> {t("pa_alert_at").replace("{target}", peso(a.target))}</span>
                      <span className="pa-now">
                        {t(up ? "pa_gap_up" : "pa_gap_down").replace("{price}", peso(price)).replace("{gap}", peso(gap))}
                      </span>
                    </>
                  )}
                </span>
                <button className="pa-x" onClick={() => remove(a.id)} aria-label={`${t("pa_remove")} ${tn(a.cropName)}`}>
                  <X size={18} strokeWidth={2.6} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* The way to another: a tile at the foot of the list, the plus in
          its own green disc. */}
      <button className="pa-add" onClick={open}>
        <span className="pa-add-ico"><Plus size={18} strokeWidth={3} aria-hidden="true" /></span> {t("pa_add")}
      </button>

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
            title={t("pick_crop_title")}
            placeholder={t("pa_crop")}
            value={cropId}
            options={ordered.map(c => ({
              value: c.id,
              label: c.name,
              sub: t("pa_today").replace("{price}", peso(c.pricePerKg)),
              photo: cropPhoto(c.id),
            }))}
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
          <p className="pa-help">{t("pa_today").replace("{price}", peso(current))}</p>
        </div>

        {/* What will happen, in words, before they commit to it. */}
        <p className="pa-promise">
          {t(target >= current ? "pa_promise_up" : "pa_promise_down")
            .replace("{crop}", tn(CROPS.find(c => c.id === cropId)?.name || ""))
            .replace("{target}", peso(target))}
        </p>

        <button className="mp-sell-btn pa-save" onClick={save} disabled={!target}>
          <Bell size={19} strokeWidth={2.6} /> {t("pa_save")}
        </button>
      </Sheet>
    </section>
  );
}
