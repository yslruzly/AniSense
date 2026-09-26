import { Preferences } from "@capacitor/preferences";

// ─── Expected harvests ────────────────────────────────────────────────────────
// How many kilos a farmer expects to bring in, per crop. The one number the
// estimated profit cannot guess: today's price is known and the expenses are
// recorded, but only the farmer knows what their field will give.
//
// Kept in native storage, one figure per crop, so it is set once a season
// rather than every time the page opens.

const KEY = "harvest-plans";

/** Crop group ("Rice", "Corn") → expected kilos. */
export type HarvestPlans = Record<string, number>;

export async function loadHarvestPlans(): Promise<HarvestPlans> {
  try {
    const { value } = await Preferences.get({ key: KEY });
    return value ? (JSON.parse(value) as HarvestPlans) : {};
  } catch {
    return {};
  }
}

export async function saveHarvestPlans(plans: HarvestPlans): Promise<void> {
  try {
    await Preferences.set({ key: KEY, value: JSON.stringify(plans) });
  } catch {
    // Storage unavailable: the estimate still works for this session.
  }
}
