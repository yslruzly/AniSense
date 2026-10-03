import bundled from "./generated/forecasts.json";
import { CROP_GROUPS, RICE_VARIETIES } from "./crops";
import { MonthPrice, historyOf } from "./priceRecords";

// ─── Forecasts ────────────────────────────────────────────────────────────────
// The next three months of each variety in the study, from the two models the
// study names: ARIMA and LSTM. Both are trained on the price records by
// ml/train_forecasts.py, which writes generated/forecasts.json; the app only reads
// the result, so forecasts show with no signal. Signed in to a real account,
// the database's forecasts replace the bundled ones (applyForecasts).
//
// Each model also carries how it did when tested on the last 12 months
// (`mape`: its average miss, as a percentage of the real price). Where that
// miss is large, the screens say the forecast is uncertain and give no
// sell-or-wait advice from it.

export type ModelName = "arima" | "lstm";
export interface ForecastPoint { month: string; price: number; lower: number; upper: number }
interface ModelRun { mape: number; forecast: ForecastPoint[] }

/** Above this average miss on the test months, a forecast is shown as
 *  uncertain and is not turned into advice. */
export const RELIABLE_MAPE = 20;

const runs: Record<string, Partial<Record<ModelName, ModelRun>>> = {};
for (const [id, c] of Object.entries(bundled.crops as Record<string, Record<ModelName, ModelRun>>)) {
  runs[id] = {
    arima: { mape: c.arima.mape, forecast: c.arima.forecast },
    lstm: { mape: c.lstm.mape, forecast: c.lstm.forecast },
  };
}

/** Replaces the bundled forecasts with the database's, per variety and model. */
export function applyForecasts(rows: { crop_id: string; model: string; target_month: string; price_per_kg: number | string; low_per_kg: number | string; high_per_kg: number | string; mape: number | string }[]) {
  const fresh: Record<string, Partial<Record<ModelName, ModelRun>>> = {};
  for (const r of rows) {
    if (r.model !== "arima" && r.model !== "lstm") continue;
    const run = ((fresh[r.crop_id] ??= {})[r.model] ??= { mape: Number(r.mape), forecast: [] });
    run.forecast.push({ month: r.target_month.slice(0, 7), price: Number(r.price_per_kg), lower: Number(r.low_per_kg), upper: Number(r.high_per_kg) });
  }
  for (const [id, models] of Object.entries(fresh)) {
    for (const [model, run] of Object.entries(models) as [ModelName, ModelRun][]) {
      run.forecast.sort((a, b) => a.month.localeCompare(b.month));
      (runs[id] ??= {})[model] = run;
    }
  }
}

export interface ForecastRun {
  /** The variety forecast: "rice-special". */
  id: string;
  /** Its name: "Special Rice". */
  name: string;
  model: ModelName;
  /** The newest record: the month the forecast starts from. */
  current: MonthPrice;
  /** Up to the last 12 recorded months, oldest first, ending with `current`. */
  past: MonthPrice[];
  /** The months after `current`, nearest first. Never empty. */
  next: ForecastPoint[];
  /** The model's average miss on the test months, in percent. */
  mape: number;
  /** Whether that miss is small enough to act on. */
  reliable: boolean;
}

/** A variety's forecast from one model, or null when there is none: no
 *  records, or records that have already caught up with every forecast month
 *  (new prices came in and the models have not been run again yet). */
export function forecastOf(cropId: string, model: ModelName): ForecastRun | null {
  const run = runs[cropId]?.[model];
  const history = historyOf(cropId);
  const current = history[history.length - 1];
  if (!run || !current) return null;
  const next = run.forecast.filter(p => p.month > current.month);
  if (next.length === 0) return null;
  const name = [...RICE_VARIETIES, ...CROP_GROUPS.flatMap(g => g.varieties)].find(v => v.id === cropId)?.name ?? cropId;
  return { id: cropId, name, model, current, past: history.slice(-12), next, mape: run.mape, reliable: run.mape <= RELIABLE_MAPE };
}

/** A crop's forecast: that of its first variety that has one. A farmer picks
 *  crops ("Rice"), the records are per variety ("Special Rice"), so Rice is
 *  read from Special Rice, Onions from Red Onion, and so on. */
export function forecastForGroup(group: string, model: ModelName): ForecastRun | null {
  const varieties = group === "Rice" ? RICE_VARIETIES : CROP_GROUPS.find(g => g.group === group)?.varieties ?? [];
  for (const v of varieties) {
    const run = forecastOf(v.id, model);
    if (run) return run;
  }
  return null;
}
