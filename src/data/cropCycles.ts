// ─── Crop cycles ──────────────────────────────────────────────────────────────
// Days from planting to harvest, for the crops a Nueva Ecija farmer plants in
// a season. These are typical figures for the province, not a promise: the
// tracker says "about", and the farmer can change the number when they add a
// planting, because their own variety and field know better than a table.
//
// Tree crops (calamansi, mango) are not here on purpose. They are perennial —
// counted from flowering, not from planting — so a day-62-of-110 bar would be
// nonsense for them.

export interface CropCycle {
  /** Crop group, as used by CROP_FILTER_MAP. */
  crop: string;
  /** Typical days from planting to first harvest. */
  days: number;
}

export const CROP_CYCLES: CropCycle[] = [
  { crop: "Rice", days: 110 },
  { crop: "Corn", days: 105 },
  { crop: "Onions", days: 100 },
  { crop: "Garlic", days: 120 },
  { crop: "Squash", days: 90 },
  { crop: "Tomatoes", days: 75 },
];

export const cycleFor = (crop: string) => CROP_CYCLES.find(c => c.crop === crop)?.days ?? 100;

/**
 * Where a planting is in its season, as a share of the way through. The names
 * are the ones a farmer would use out loud, and they fit any of the crops
 * above: every one of them is sown, grows, flowers, fills and is cut.
 */
export function stageOf(progress: number): "seedling" | "growing" | "flowering" | "filling" | "ready" {
  if (progress >= 1) return "ready";
  if (progress >= 0.7) return "filling";
  if (progress >= 0.45) return "flowering";
  if (progress >= 0.2) return "growing";
  return "seedling";
}
