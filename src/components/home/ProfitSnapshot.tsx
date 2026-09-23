import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, ChevronRight, HandCoins, Minus, Plus, X } from "lucide-react";
import { useLang } from "../../i18n";
import { CROPS, CROP_GROUP_BY_ID } from "../../data/crops";
import { EXPENSES } from "../../data/expenses";
import { CROP_CYCLES } from "../../data/cropCycles";
import { cropGroupPhoto } from "../../data/cropPhotos";
import { Sheet } from "../ui/Sheet";
import { PickerField } from "../ui/PickerField";
import { haptic } from "../../lib/platform";
import { Sale, newSaleId, soldSince } from "../../lib/sales";
import { Planting, localISO } from "../../lib/plantings";

// ─── Profit snapshot ──────────────────────────────────────────────────────────
// Earned, spent, and what is left — the number a farmer actually wants. Two
// tiles side by side and the net underneath, because the net only means
// something next to the two figures it came from.
//
// Month or season: a season runs from the earliest planting still being
// tracked, so the two features answer each other. With nothing tracked, the
// season option is not offered rather than invented.

/** Today's price for a crop group, to prefill the sale form. */
const priceOfGroup = (crop: string) =>
  CROPS.find(c => CROP_GROUP_BY_ID[c.id] === crop)?.pricePerKg ??
  CROPS.find(c => c.name === crop)?.pricePerKg ?? 0;

export function ProfitSnapshot({ sales, onChange, plantings, onOpenExpenses }: {
  sales: Sale[];
  onChange: (next: Sale[]) => void;
  plantings: Planting[];
  onOpenExpenses: () => void;
}) {
  const { t, tn } = useLang();
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  // The season starts with the oldest planting still in the ground.
  const seasonStart = plantings.length
    ? plantings.map(p => p.planted).sort()[0]
    : null;
  const [range, setRange] = useState<"month" | "season">("month");
  const from = range === "season" && seasonStart ? seasonStart : monthStart;

  const earned = soldSince(sales, from);
  const spent = EXPENSES.filter(e => e.date >= from).reduce((sum, e) => sum + e.amount, 0);
  const net = earned - spent;

  const [adding, setAdding] = useState(false);
  const [crop, setCrop] = useState(CROP_CYCLES[0].crop);
  const [kg, setKg] = useState(100);
  const [price, setPrice] = useState(() => priceOfGroup(CROP_CYCLES[0].crop));
  const [date, setDate] = useState(localISO());

  const openForm = () => {
    setCrop(CROP_CYCLES[0].crop);
    setKg(100);
    setPrice(priceOfGroup(CROP_CYCLES[0].crop));
    setDate(localISO());
    setAdding(true);
  };
  const pickCrop = (c: string) => { setCrop(c); setPrice(priceOfGroup(c)); };

  const save = () => {
    if (!kg || !price) return;
    haptic.select();
    onChange([{ id: newSaleId(), crop, kg, pricePerKg: price, amount: kg * price, date }, ...sales]);
    setAdding(false);
  };

  return (
    <section className="hm-sec" aria-labelledby="ps-t" data-tour="profit">
      <div className="hm-sec-row">
        <h2 className="hm-sec-title" id="ps-t">{t("ps_title")}</h2>
        {/* Only offered when a season has a start date to mean. */}
        {seasonStart && (
          <div className="ps-range" role="group" aria-label={t("ps_title")}>
            {(["month", "season"] as const).map(r => (
              <button
                key={r}
                className={range === r ? "on" : ""}
                onClick={() => { haptic.select(); setRange(r); }}
                aria-pressed={range === r}
              >
                {t(`ps_${r}`)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ps">
        <div className="ps-2up">
          <div className="ps-tile earned">
            <span className="ps-ico"><ArrowUpCircle size={18} strokeWidth={2.4} /></span>
            <span className="ps-lbl">{t("ps_earned")}</span>
            <span className="ps-val">₱{earned.toLocaleString()}</span>
          </div>
          {/* Spending opens the expenses page: the figure is the door to it. */}
          <button className="ps-tile spent" onClick={onOpenExpenses}>
            <span className="ps-ico"><ArrowDownCircle size={18} strokeWidth={2.4} /></span>
            <span className="ps-lbl">{t("ps_spent")}</span>
            <span className="ps-val">₱{spent.toLocaleString()}</span>
            <ChevronRight size={16} strokeWidth={2.6} className="ps-tile-chev" aria-hidden="true" />
          </button>
        </div>

        {/* The net gets its own line, and its sign is said in words as well
            as in colour: "left over" or "short". */}
        <div className={`ps-net ${net >= 0 ? "up" : "down"}`}>
          <span className="ps-net-val">{net < 0 ? "−" : ""}₱{Math.abs(net).toLocaleString()}</span>
          <span className="ps-net-lbl">{t(net >= 0 ? "ps_net_up" : "ps_net_down")}</span>
        </div>

        {earned === 0 && (
          <p className="ps-hint">{t("ps_hint")}</p>
        )}

        <button className="ct-add ps-add" onClick={openForm}>
          <HandCoins size={19} strokeWidth={2.4} /> {t("ps_record")}
        </button>
      </div>

      <Sheet open={adding} onClose={() => setAdding(false)} className="pa-sheet" label={t("ps_record")}>
        <div className="pa-sheet-head">
          <span className="pa-sheet-ico"><HandCoins size={20} strokeWidth={2.4} /></span>
          <h3 className="pa-sheet-t">{t("ps_record")}</h3>
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
              sub: t("pa_today").replace("{price}", `₱${priceOfGroup(c.crop)}`),
              photo: cropGroupPhoto(c.crop),
            }))}
            onChange={pickCrop}
          />
        </div>

        <div className="ps-pair">
          <div className="pa-field">
            <label className="pa-lbl" htmlFor="ps-kg">{t("ps_kg")}</label>
            <div className="pa-step">
              <button onClick={() => setKg(v => Math.max(1, v - 10))} aria-label={t("ps_kg_less")}>
                <Minus size={22} strokeWidth={2.8} />
              </button>
              <span className="pa-step-val">
                <input id="ps-kg" type="number" inputMode="numeric" value={kg}
                  onChange={e => setKg(Math.max(0, Number(e.target.value)))} />
              </span>
              <button onClick={() => setKg(v => v + 10)} aria-label={t("ps_kg_more")}>
                <Plus size={22} strokeWidth={2.8} />
              </button>
            </div>
          </div>

          <div className="pa-field">
            <label className="pa-lbl" htmlFor="ps-price">{t("ps_price")}</label>
            <div className="pa-step">
              <button onClick={() => setPrice(v => Math.max(1, v - 1))} aria-label={t("ps_price_less")}>
                <Minus size={22} strokeWidth={2.8} />
              </button>
              <span className="pa-step-val">
                ₱<input id="ps-price" type="number" inputMode="numeric" value={price}
                  onChange={e => setPrice(Math.max(0, Number(e.target.value)))} />
              </span>
              <button onClick={() => setPrice(v => v + 1)} aria-label={t("ps_price_more")}>
                <Plus size={22} strokeWidth={2.8} />
              </button>
            </div>
          </div>
        </div>

        <div className="pa-field">
          <label className="pa-lbl" htmlFor="ps-date">{t("ps_date")}</label>
          <input id="ps-date" className="ct-date" type="date" value={date} max={localISO()}
            onChange={e => setDate(e.target.value)} />
        </div>

        {/* The total, worked out as they type: the figure that lands in the
            snapshot, shown before they commit to it. */}
        <p className="pa-promise ps-total">
          {t("ps_total")}<b>₱{(kg * price).toLocaleString()}</b>
        </p>

        <button className="mp-sell-btn pa-save" onClick={save}>
          <HandCoins size={19} strokeWidth={2.6} /> {t("ps_save")}
        </button>
      </Sheet>
    </section>
  );
}
