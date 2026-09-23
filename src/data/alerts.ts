import { CROPS } from "./crops";
import { WEATHER_FORECAST } from "./weather";
import { LISTINGS } from "./marketplace";
import { UserRole } from "../types";
import { PriceAlert, alertHit } from "../lib/priceAlerts";
import { Planting, daysLeft } from "../lib/plantings";

// ─── Alerts ───────────────────────────────────────────────────────────────────
// What the bell in the header is counting. Derived from the data already on
// screen rather than a separate feed, so the badge can never claim something
// the app cannot then show.
//
// Farmers and buyers get different sets because the same fact means opposite
// things to them. A price drop is bad news for the one selling and a bargain
// for the one buying; rain is a harvest deadline for one and nothing for the
// other. One list for both was always wrong for somebody.

export type AlertKind = "price-up" | "price-down" | "weather" | "new-listing" | "price-target" | "harvest-due";

export interface Alert {
  id: string;
  kind: AlertKind;
  /** Crop name for price alerts and new listings. */
  crop?: string;
  /** Percent move, already rounded, for price alerts. */
  change?: number;
  /** Weather day label, for weather alerts. */
  day?: string;
  /** For new listings: who posted it and at what price. */
  seller?: string;
  pricePerKg?: number;
  /** For a price target that has been met: the price asked for. */
  target?: number;
  /** For a planting that has come due: the crop's day count. */
  dayCount?: number;
}

const WET = ["Rainy", "Stormy", "LightRain"];

/** The sharpest move in each direction, and only if it is worth a look. */
function priceMoves(): Alert[] {
  const out: Alert[] = [];
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

function farmerAlerts(): Alert[] {
  const out: Alert[] = [];
  // Weather first: it is the one with a deadline attached.
  const wet = WEATHER_FORECAST.find(d => WET.includes(d.icon));
  if (wet) out.push({ id: "wx-" + wet.day, kind: "weather", day: wet.day });
  return [...out, ...priceMoves()];
}

function buyerAlerts(location: string): Alert[] {
  const out: Alert[] = [];
  // A fresh harvest in their own town first: it is the only alert that is
  // about them rather than the market, and the one most likely to be gone
  // tomorrow. Matched on the municipality they picked at signup; no match
  // means no alert, rather than a "near you" that isn't.
  const near = LISTINGS
    .filter(l => l.location && location.includes(l.location))
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (near) {
    out.push({
      id: "new-" + near.id, kind: "new-listing",
      crop: near.variety || near.crop, seller: near.seller, pricePerKg: near.pricePerKg,
    });
  }
  // Then prices, cheaper first: a drop is the thing a buyer can act on today.
  const moves = priceMoves();
  return [...out, ...moves.filter(m => m.kind === "price-down"), ...moves.filter(m => m.kind === "price-up")];
}

/** Targets the farmer set that today's price has met. These come first:
 *  the farmer asked to be told, so it outranks anything the app noticed on
 *  its own. */
function targetAlerts(alerts: PriceAlert[]): Alert[] {
  return alerts
    .filter(a => {
      const price = CROPS.find(c => c.id === a.cropId)?.pricePerKg;
      return price !== undefined && alertHit(a, price);
    })
    .map(a => ({ id: "tgt-" + a.id, kind: "price-target" as const, crop: a.cropName, target: a.target }));
}

/** Plantings that have reached their harvest day. A season ending outranks
 *  a price move: the crop is standing in the field either way. */
function harvestAlerts(plantings: Planting[]): Alert[] {
  return plantings
    .filter(p => daysLeft(p) === 0)
    .map(p => ({ id: "hrv-" + p.id, kind: "harvest-due" as const, crop: p.crop, dayCount: p.days }));
}

export function buildAlerts(
  role: UserRole = "farmer",
  location = "",
  priceAlerts: PriceAlert[] = [],
  plantings: Planting[] = [],
): Alert[] {
  if (role === "buyer") return buyerAlerts(location);
  return [...harvestAlerts(plantings), ...targetAlerts(priceAlerts), ...farmerAlerts()];
}
