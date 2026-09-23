import { Preferences } from "@capacitor/preferences";

// ─── Plantings ────────────────────────────────────────────────────────────────
// What a farmer has in the ground: a crop, the day it was planted, and how
// many days that crop usually takes. Everything the tracker shows — the day
// number, the bar, the weeks left — is worked out from those three, so there
// is nothing to keep up to date. The day count changes on its own overnight,
// which is the point: a reason to open the app on a day when prices sit still.
//
// Kept in native storage, so a season survives the app being closed.

const KEY = "plantings";

export interface Planting {
  id: string;
  /** Crop group ("Rice", "Corn"), matching CROP_CYCLES. */
  crop: string;
  /** Date planted, as YYYY-MM-DD in the farmer's own day. */
  planted: string;
  /** Days to harvest for this planting: the table's figure, or theirs. */
  days: number;
}

/** Whole days since planting, counting the planting day as day 1. */
export function dayOf(p: Planting, now = new Date()): number {
  const start = new Date(p.planted + "T00:00:00");
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
  return Math.max(1, diff + 1);
}

/** 0 → just planted, 1 → due. Past 1 it keeps counting; the UI caps the bar. */
export const progressOf = (p: Planting, now = new Date()) => dayOf(p, now) / p.days;

/** Days left until the usual harvest day; 0 once it is due. */
export const daysLeft = (p: Planting, now = new Date()) => Math.max(0, p.days - dayOf(p, now));

export async function loadPlantings(): Promise<Planting[]> {
  try {
    const { value } = await Preferences.get({ key: KEY });
    return value ? (JSON.parse(value) as Planting[]) : [];
  } catch {
    return [];
  }
}

export async function savePlantings(list: Planting[]): Promise<void> {
  try {
    await Preferences.set({ key: KEY, value: JSON.stringify(list) });
  } catch {
    // Storage unavailable: the season still tracks for this session.
  }
}

export const newPlantingId = () => `pl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/** Today as YYYY-MM-DD in local time — not toISOString(), which is UTC and
 *  hands back yesterday before 8 AM in the Philippines. */
export function localISO(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
