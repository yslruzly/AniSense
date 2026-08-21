import { CROPS } from "./crops";
import { WEATHER_FORECAST } from "./weather";

// ─── Alerts ───────────────────────────────────────────────────────────────────
// What the bell in the header is counting. Derived from the data already on
// screen rather than a separate feed, so the badge can never claim something
// the app cannot then show.

export type AlertKind = "price-up" | "price-down" | "weather";

export interface Alert {
  id: string;
  kind: AlertKind;
  /** Crop name for price alerts; undefined for weather. */
  crop?: string;
  /** Percent move, already rounded, for price alerts. */
  change?: number;
  /** Weather day label, for weather alerts. */
  day?: string;
}

const WET = ["Rainy", "Stormy", "LightRain"];

export function buildAlerts(): Alert[] {
  const out: Alert[] = [];

  // Weather first: it is the one with a deadline attached.
  const wet = WEATHER_FORECAST.find(d => WET.includes(d.icon));
  if (wet) out.push({ id: "wx-" + wet.day, kind: "weather", day: wet.day });

  // Then the sharpest move in each direction, and only if it is worth a look.
  const sorted = [...CROPS].sort((a, b) => b.change - a.change);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];
  if (top && top.change > 0) {
    out.push({ id: "up-" + top.id, kind: "price-up", crop: top.name, change: top.change });
  }
  if (bottom && bottom.change < 0 && bottom.id !== top?.id) {
    out.push({ id: "down-" + bottom.id, kind: "price-down", crop: bottom.name, change: bottom.change });
  }
  return out;
}
