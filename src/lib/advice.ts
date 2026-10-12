import { CROPS } from "../data/crops";
import { forecastForGroup, ForecastRun, ForecastPoint } from "../data/forecast";

// ─── Sell now, hold, or watch ─────────────────────────────────────────────────
// One decision per crop, from the ARIMA forecast trained on the price records.
// Only crops with price records get one. Where that forecast tested badly
// (onion, calamansi), the advice is "Watch": nobody should hold a harvest on a
// number that has been half wrong.
//
// Home's "Sell now or wait?" and the Analytics page both read it from here, so
// the two never disagree.

export type Action = "SELL" | "HOLD" | "WATCH";

export interface Advice {
  /** The crop as the farmer grows it: "Rice". */
  group: string;
  run: ForecastRun;
  action: Action;
  /** The furthest month forecast. */
  last: ForecastPoint;
}

/** Sell first: it's the one that costs money if it waits. */
export const ACTION_ORDER: Record<Action, number> = { SELL: 0, HOLD: 1, WATCH: 2 };

export function adviceFor(group: string): Advice | null {
  const run = forecastForGroup(group, "arima");
  if (!run) return null;
  const last = run.next[run.next.length - 1];
  const pct = (last.price / run.current.price - 1) * 100;
  // Both in percent: the forecast's move over the months ahead, plus half
  // of the move the price has just made.
  const score = pct + (CROPS.find(c => c.id === run.id)?.change ?? 0) * 0.5;
  const action: Action = !run.reliable ? "WATCH" : score > 1.5 ? "HOLD" : score < -1.5 ? "SELL" : "WATCH";
  return { group, run, action, last };
}
