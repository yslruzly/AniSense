import { Preferences } from "@capacitor/preferences";
import { Listing, SellerDetail } from "../types";
import { Sale } from "./sales";
import { farmerOfTheWeek } from "./featured";

// ─── Achievements ─────────────────────────────────────────────────────────────
// What a farmer has earned, worked out from what the app already knows, so a
// badge always means the thing happened. One rule for the Profile card that
// lists them and for the moment one is unlocked, so the two never disagree.

export type AchievementId = "newbie" | "harvest" | "sale" | "week" | "month" | "year";

/** In the order a farmer earns them; `tone` names the medal's colour. */
export const ACHIEVEMENTS: { id: AchievementId; tone: string }[] = [
  { id: "newbie", tone: "blue" },
  { id: "harvest", tone: "green" },
  { id: "sale", tone: "orange" },
  { id: "week", tone: "gold" },
  { id: "month", tone: "violet" },
  { id: "year", tone: "trophy" },
];

export function earnedAchievements(a: {
  listings: Listing[];
  isMine: (l: Listing) => boolean;
  sellers: Record<string, SellerDetail>;
  sellerKeyOf: (l: Listing) => string;
  sales: Sale[];
  /** Badges on record in the database: its own awards, and any the admin
   *  granted, such as Farmer of the Month. */
  awarded?: AchievementId[];
}): Set<AchievementId> {
  const mine = a.listings.filter(a.isMine);
  const spot = farmerOfTheWeek(a.sellers);
  // Newbie comes with joining. Farmer of the Month and of the Year are
  // granted by the admin (user_achievements) and arrive through `awarded`.
  const out = new Set<AchievementId>(["newbie"]);
  if (mine.length > 0) out.add("harvest");
  if (a.sales.length > 0) out.add("sale");
  if (spot && mine.some(l => a.sellerKeyOf(l) === spot.key)) out.add("week");
  for (const id of a.awarded ?? []) out.add(id);
  return out;
}

// Which ones this account has already been shown, so each is celebrated
// once. Null means the account has never been checked on this phone.
const KEY = (owner: string) => `ach_seen:${owner}`;

export async function loadSeenAchievements(owner: string): Promise<AchievementId[] | null> {
  try {
    const { value } = await Preferences.get({ key: KEY(owner) });
    return value ? (JSON.parse(value) as AchievementId[]) : null;
  } catch {
    return null;
  }
}

export async function saveSeenAchievements(owner: string, ids: AchievementId[]): Promise<void> {
  try {
    await Preferences.set({ key: KEY(owner), value: JSON.stringify([...new Set(ids)]) });
  } catch {
    // Storage unavailable: the worst case is seeing a celebration twice.
  }
}
