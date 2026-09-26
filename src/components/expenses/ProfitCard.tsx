import { useState } from "react";
import { Minus, Plus, X, Scale, TrendingUp, TrendingDown, Pencil } from "lucide-react";
import { useLang } from "../../i18n";
import { CROPS, CROP_GROUP_BY_ID } from "../../data/crops";
import { cropGroupPhoto } from "../../data/cropPhotos";
import { CropIcon } from "../icons";
import { Sheet } from "../ui/Sheet";
import { haptic } from "../../lib/platform";
import { Expense } from "../../types";
import { Sale } from "../../lib/sales";
import { HarvestPlans } from "../../lib/harvestPlans";

// ─── Profit, per crop ─────────────────────────────────────────────────────────
// Two answers to "am I making money?", side by side and never blended:
//
//   Estimated  what the harvest the farmer expects is worth at today's price,
//              less what the crop has cost so far. A forecast: it moves with
//              the market and with every expense added.
//   Final      what the crop actually sold for, less what it cost. Only once
//              there is a sale; before that it says so instead of showing ₱0.
//
// The estimate is drawn with a dashed edge and an "≈", the final one solid:
// the difference between a guess and a result is visible before it is read.

/** Today's price for a crop group, the same lookup Home uses. */
export const priceOfCrop = (crop: string) =>
  CROPS.find(c => CROP_GROUP_BY_ID[c.id] === crop)?.pricePerKg ??
  CROPS.find(c => c.name === crop)?.pricePerKg ?? 0;

export const spentOn = (txns: Expense[], crop: string) =>
  txns.filter(e => e.crop === crop).reduce((s, e) => s + e.amount, 0);

/** Estimated profit for one crop, or null when no expected harvest is set. */
export function estimateFor(crop: string, plans: HarvestPlans, spent: number): number | null {
  const kg = plans[crop];
  return kg ? kg * priceOfCrop(crop) - spent : null;
}

const peso = (n: number) => `${n < 0 ? "−" : ""}₱${Math.abs(Math.round(n)).toLocaleString("en-PH")}`;

export function ProfitCard({ transactions, sales, plans, onPlans, farmerCrops }: {
  transactions: Expense[];
  sales: Sale[];
  plans: HarvestPlans;
  onPlans: (next: HarvestPlans) => void;
  farmerCrops: string[];
}) {
  const { t, tn } = useLang();

  // Every crop the farmer grows, plus any they have spent on or sold.
  const crops = Array.from(new Set([
    ...farmerCrops, ...transactions.map(e => e.crop), ...sales.map(s => s.crop),
  ])).filter(Boolean);

  const rows = crops.map(crop => {
    const spent = spentOn(transactions, crop);
    const sold = sales.filter(s => s.crop === crop).reduce((s, x) => s + x.amount, 0);
    const price = priceOfCrop(crop);
    const kg = plans[crop] ?? 0;
    return { crop, spent, sold, price, kg, est: estimateFor(crop, plans, spent), final: sold > 0 ? sold - spent : null };
  });

  const totalSpent = transactions.reduce((s, e) => s + e.amount, 0);
  const totalSold = sales.reduce((s, x) => s + x.amount, 0);
  const planned = rows.filter(r => r.kg > 0);
  // Everything expected to come in, less everything spent: a crop without an
  // expected harvest still cost what it cost.
  const estTotal = planned.length ? planned.reduce((s, r) => s + r.kg * r.price, 0) - totalSpent : null;
  const finalTotal = totalSold > 0 ? totalSold - totalSpent : null;

  // ── Expected-harvest sheet ──
  const [editing, setEditing] = useState<string | null>(null);
  const [kgDraft, setKgDraft] = useState(0);
  const open = (crop: string) => {
    haptic.select();
    setKgDraft(plans[crop] || 500);
    setEditing(crop);
  };
  const save = () => {
    if (!editing) return;
    haptic.select();
    const next = { ...plans };
    if (kgDraft > 0) next[editing] = kgDraft; else delete next[editing];
    onPlans(next);
    setEditing(null);
  };
  const step = kgDraft >= 1000 ? 100 : 50;

  const tone = (n: number | null) => (n === null ? "" : n < 0 ? "neg" : "pos");

  return (
    <section className="card pf" aria-labelledby="pf-t">
      <div className="card-head">
        <span className="card-ico tint-green"><TrendingUp size={20} strokeWidth={2.2} /></span>
        <div className="card-title" style={{ margin: 0 }} id="pf-t">{t("pf_title")}</div>
      </div>
      <p className="pf-sub">{t("pf_sub")}</p>

      {/* The two answers. */}
      <div className="pf-sum">
        <div className={`pf-tile est ${tone(estTotal)}`}>
          <span className="pf-tile-l">{t("pf_est")}</span>
          <span className="pf-tile-v">{estTotal === null ? "—" : `≈ ${peso(estTotal)}`}</span>
          <span className="pf-tile-s">{estTotal === null ? t("pf_none_set") : t("pf_est_sub")}</span>
        </div>
        <div className={`pf-tile fin ${tone(finalTotal)}`}>
          <span className="pf-tile-l">{t("pf_final")}</span>
          <span className="pf-tile-v">{finalTotal === null ? "—" : peso(finalTotal)}</span>
          <span className="pf-tile-s">{finalTotal === null ? t("pf_no_sales") : t("pf_final_sub")}</span>
        </div>
      </div>

      {/* Crop by crop, so a good crop does not hide a losing one. */}
      <ul className="pf-list">
        {rows.map(r => {
          const photo = cropGroupPhoto(r.crop);
          return (
            <li key={r.crop} className="pf-row">
              <div className="pf-row-head">
                <span className="pf-photo">
                  {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropIcon crop={r.crop} size={20} />}
                </span>
                <span className="pf-crop">{tn(r.crop)}</span>
                <span className="pf-spent">{t("pf_spent")} <strong>{peso(r.spent)}</strong></span>
              </div>

              <div className="pf-lines">
                {/* Estimated */}
                <button type="button" className={`pf-line est ${tone(r.est)}`} onClick={() => open(r.crop)}>
                  <span className="pf-line-l">
                    {t("pf_est")}
                    <small>
                      {r.kg > 0
                        ? t("pf_worth").replace("{kg}", r.kg.toLocaleString("en-PH")).replace("{price}", String(r.price))
                        : t("pf_set_harvest")}
                    </small>
                  </span>
                  <span className="pf-line-v">
                    {r.est === null ? <span className="pf-set"><Scale size={15} strokeWidth={2.4} /> {t("pf_set")}</span> : <>≈ {peso(r.est)}</>}
                    {r.est !== null && <Pencil size={13} strokeWidth={2.4} className="pf-edit" aria-hidden="true" />}
                  </span>
                </button>
                {/* Final */}
                <div className={`pf-line fin ${tone(r.final)}`}>
                  <span className="pf-line-l">
                    {t("pf_final")}
                    <small>{r.sold > 0 ? `${t("pf_sold")} ${peso(r.sold)}` : t("pf_not_sold")}</small>
                  </span>
                  <span className="pf-line-v">
                    {r.final === null ? "—" : (
                      <>{r.final < 0 ? <TrendingDown size={15} strokeWidth={2.6} /> : <TrendingUp size={15} strokeWidth={2.6} />} {peso(r.final)}</>
                    )}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="pf-foot">{t("pf_record_hint")}</p>

      {/* Expected harvest, one crop at a time. */}
      <Sheet open={!!editing} onClose={() => setEditing(null)} className="pa-sheet" label={t("pf_sheet_title")}>
        {editing && <>
          <div className="pa-sheet-head">
            <h3 className="pa-sheet-t">{t("pf_sheet_title")} · {tn(editing)}</h3>
            <button className="pa-x" onClick={() => setEditing(null)} aria-label={t("close")}><X size={20} strokeWidth={2.4} /></button>
          </div>
          <div className="pa-field">
            <label className="pa-lbl" htmlFor="pf-kg">{t("pf_sheet_q").replace("{crop}", tn(editing))}</label>
            {/* The same stepper as a price alert: a rough number is enough,
                and it is set with taps, not typed. */}
            <div className="pa-step">
              <button onClick={() => setKgDraft(v => Math.max(0, v - step))} aria-label={t("pf_less")}><Minus size={22} strokeWidth={2.8} /></button>
              <span className="pa-step-val">
                <input id="pf-kg" type="text" inputMode="numeric" className="pf-kg-in"
                  value={kgDraft ? kgDraft.toLocaleString("en-PH") : ""} placeholder="0"
                  onChange={e => setKgDraft(Math.min(1_000_000, Number(e.target.value.replace(/\D/g, "")) || 0))} />
                <small className="pf-kg-unit">kg</small>
              </span>
              <button onClick={() => setKgDraft(v => v + step)} aria-label={t("pf_more")}><Plus size={22} strokeWidth={2.8} /></button>
            </div>
          </div>
          {/* What that harvest is worth today, before they commit to it. */}
          <p className="pa-promise">
            {t("pf_sheet_worth")
              .replace("{amount}", peso(kgDraft * priceOfCrop(editing)))
              .replace("{price}", `₱${priceOfCrop(editing)}`)}
          </p>
          <button className="mp-sell-btn pa-save" onClick={save}>
            <Scale size={19} strokeWidth={2.6} /> {t("pf_save")}
          </button>
        </>}
      </Sheet>
    </section>
  );
}
