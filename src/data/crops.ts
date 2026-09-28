import { CropPrice, CropGroup, PricePoint } from "../types";

// ─── Data ─────────────────────────────────────────────────────────────────────
// Rice varieties (Philippine)
export const RICE_VARIETIES: CropPrice[] = [
  { id: "rice-special", name: "Special Rice", pricePerKg: 65, change: 2.5, volume: 14.2, color: "#2f9e63" },
  { id: "rice-well-milled", name: "Well Milled", pricePerKg: 52, change: 1.8, volume: 18.6, color: "#2f9e63" },
  { id: "rice-regular-milled", name: "Regular Milled", pricePerKg: 42, change: 0.2, volume: 22.4, color: "#2f9e63" },
];
export const CROP_GROUPS: CropGroup[] = [
  {
    group: "Onions",
    varieties: [
      { id: "onion-red", name: "Red Onion", pricePerKg: 45, change: -0.8, volume: 80, color: "#d4553f" },
      { id: "onion-white", name: "Yellow/White Onion", pricePerKg: 38, change: 1.2, volume: 50, color: "#2f9e63" },
      { id: "onion-yellow", name: "Shallots Onion", pricePerKg: 35, change: 0.5, volume: 28, color: "#2f9e63" },
      { id: "onion-spring", name: "Spring Onion", pricePerKg: 20, change: -1.0, volume: 15, color: "#d4553f" },
    ],
  },
  {
    group: "Calamansi",
    varieties: [
      { id: "cala-regular", name: "Regular Calamansi", pricePerKg: 160, change: 1.8, volume: 1.2, color: "#2f9e63" },
    ],
  },
  {
    group: "Mango",
    varieties: [
      { id: "mango-carab", name: "Carabao Mango", pricePerKg: 80, change: 3.5, volume: 4.5, color: "#2f9e63" },
      { id: "mango-indian", name: "Indian Mango", pricePerKg: 40, change: 1.0, volume: 3.0, color: "#2f9e63" },
      { id: "mango-horse", name: "Horse Mango", pricePerKg: 25, change: -0.5, volume: 1.5, color: "#d4553f" },
      { id: "mango-pahutan", name: "Pahutan", pricePerKg: 35, change: 2.0, volume: 1.0, color: "#2f9e63" },
    ],
  },
  {
    group: "Garlic",
    varieties: [
      { id: "garlic-native", name: "Native Garlic", pricePerKg: 150, change: 1.2, volume: 2.0, color: "#2f9e63" },
    ],
  },
  {
    group: "Tomatoes",
    varieties: [
      { id: "tom-cherry", name: "Diamante Max F1 Tomato", pricePerKg: 25, change: 3.2, volume: 0.8, color: "#2f9e63" },
      { id: "tom-roma", name: "Platinum F1 Tomato", pricePerKg: 15, change: 2.0, volume: 1.2, color: "#2f9e63" },
      { id: "tom-beef", name: "Assila F1 Tomato", pricePerKg: 20, change: -0.5, volume: 0.6, color: "#d4553f" },],
  },
  {
    group: "Corn",
    varieties: [
      { id: "corn-yellow", name: "Yellow Corn", pricePerKg: 70, change: 1.5, volume: 5.0, color: "#d19b27" },
      { id: "corn-white", name: "White Corn", pricePerKg: 65, change: 1.0, volume: 2.5, color: "#2f9e63" },
      { id: "corn-sweet", name: "Sweet Corn", pricePerKg: 30, change: 2.5, volume: 1.5, color: "#2f9e63" },],
  },
  {
    group: "Ampalaya",
    varieties: [
      { id: "ampalaya-native", name: "Native Ampalaya", pricePerKg: 60, change: 2.2, volume: 3.2, color: "#2f9e63" },
      { id: "ampalaya-galaxy", name: "Galaxy Ampalaya", pricePerKg: 55, change: -0.8, volume: 2.1, color: "#d4553f" },
    ],
  },
  {
    group: "Watermelon",
    varieties: [
      { id: "melon-sweet", name: "Sweet Watermelon", pricePerKg: 28, change: 1.4, volume: 12.0, color: "#2f9e63" },
      { id: "melon-seedless", name: "Seedless Watermelon", pricePerKg: 35, change: 0.6, volume: 6.5, color: "#2f9e63" },
    ],
  },
  {
    group: "Squash",
    varieties: [
      { id: "squash-kalabasa", name: "Kalabasa", pricePerKg: 12, change: -1.3, volume: 180, color: "#d4553f" },
    ],
  },
];
// Flat list for analytics, the home screen, and anywhere else that wants every
// crop at once. Rice leads because it is the crop this app exists for; leaving
// it out is what had Home counting 17 while Market counted 20.
export const CROPS: CropPrice[] = [...RICE_VARIETIES, ...CROP_GROUPS.flatMap(g => g.varieties)];
export const PRICE_HISTORY: PricePoint[] = [
  { day: "Mon", rice: 27, corn: 30, vegetables: 28 },
  { day: "Tue", rice: 26, corn: 31, vegetables: 29 },
  { day: "Wed", rice: 25, corn: 32, vegetables: 30 },
  { day: "Thu", rice: 24, corn: 33, vegetables: 32 },
  { day: "Fri", rice: 23, corn: 33, vegetables: 31 },
  { day: "Sat", rice: 22, corn: 34, vegetables: 33 },
  { day: "Sun", rice: 21, corn: 34, vegetables: 34 },
];
export const CROP_ICONS_LEGACY: Record<string, string> = {
  "Rice (All Varieties)": "Rice", "Special Rice": "Rice", "Well Milled": "Rice", "Regular Milled": "Rice",
  Corn: "Corn", Onions: "Onions", Tomatoes: "Tomatoes",
  Calamansi: "Calamansi", Mango: "Mango", Garlic: "Garlic", Squash: "Squash",
  Ampalaya: "Ampalaya", Watermelon: "Watermelon",
};
export const RICE_VARIETY_LIST = ["Special Rice", "Well Milled", "Regular Milled"];
// Map: category → varieties shown in sub-tab row
export const CROP_FILTER_MAP: Record<string, string[]> = {
  "Rice": RICE_VARIETY_LIST,
  "Onions": ["Red Onion", "Yellow/White Onion", "Shallots(Sibuyas Tagalog)", "Spring Onion", "Onions"],
  "Calamansi": ["Regular Calamansi", "Calamansi"],
  "Corn": ["Yellow Corn", "White Corn", "Sweet Corn", "Corn"],
  "Mango": ["Carabao Mango", "Indian Mango", "Horse Mango", "Pahutan", "Mango"],
  "Garlic": ["Native Garlic", "Garlic"],
  "Tomatoes": ["Diamante Max F1 Tomato", "Platinum F1 Tomato", "Assila F1 Tomato", "Tomatoes"],
  "Squash": ["Kalabasa"],
  "Ampalaya": ["Native Ampalaya", "Galaxy Ampalaya", "Ampalaya"],
  "Watermelon": ["Sweet Watermelon", "Seedless Watermelon", "Watermelon"],
};
export const CROP_CATEGORIES = ["All Crops", ...Object.keys(CROP_FILTER_MAP)];

/** The coarse groupings a seller sorts their market by. No livestock: the
 *  app holds none, and a filter that empties the page is not a filter. */
export const CROP_FAMILIES = ["Crops", "Vegetables", "Fruits"] as const;

export const FAMILY_GROUPS: Record<string, string[]> = {
  Crops: ["Rice", "Corn"],
  Vegetables: ["Onions", "Garlic", "Tomatoes", "Squash", "Ampalaya"],
  Fruits: ["Calamansi", "Mango", "Watermelon"],
};

/** Every crop name inside a family, varieties included. */
export function familyCropNames(family: string): string[] {
  return (FAMILY_GROUPS[family] || []).flatMap(g =>
    g === "Rice" ? [...ALL_RICE_NAMES] : [g, ...(CROP_FILTER_MAP[g] || [])]);
}

// All rice-related crop names (for matching)
export const ALL_RICE_NAMES = new Set(["Rice", "Rice (All Varieties)", ...RICE_VARIETY_LIST]);

/** Which group a variety belongs to, for rows that show both. */
export const CROP_GROUP_BY_ID: Record<string, string> = {
  ...Object.fromEntries(RICE_VARIETIES.map(v => [v.id, "Rice"])),
  ...Object.fromEntries(CROP_GROUPS.flatMap(g => g.varieties.map(v => [v.id, g.group]))),
};

export const MAIN_CROPS = [
  "Rice", "Corn", "Onions", "Tomatoes", "Calamansi", "Mango", "Garlic", "Squash",
  "Ampalaya", "Watermelon",
];

export const FARMER_CROPS = ["Rice", "Corn", "Tomatoes", "Onions", "Garlic", "Calamansi", "Mango", "Squash", "Ampalaya", "Watermelon"];

// ─── The database's names for the catalog ────────────────────────────────────
// The database (supabase/seed.sql, built from this file) keys crop groups by
// a slug ('rice') and varieties by the ids above ('rice-special'). These turn
// the app's names into those keys and back.

/** 'Rice' → 'rice': the crop_groups id. */
export const groupIdOf = (name: string) => name.toLowerCase();

/** 'rice' → 'Rice'. */
export const groupNameOf = (id: string) => MAIN_CROPS.find(n => n.toLowerCase() === id) ?? id;

/** A listing's crop → its variety id. New listings name a variety ("Special
 *  Rice"); an older one may name only the type ("Onions"), which becomes that
 *  type's first variety. */
export function cropIdOf(name: string): string | undefined {
  const v = CROPS.find(c => c.name === name);
  if (v) return v.id;
  if (name === "Rice") return RICE_VARIETIES[0]?.id;
  return CROP_GROUPS.find(g => g.group === name)?.varieties[0]?.id;
}

/** Writes the database's newest prices into the catalog every screen reads,
 *  so Home, Prices, Analytics and the forecasts all show the same numbers. */
export function applyPrices(rows: { crop_id: string; price_per_kg: number | string; change_pct: number | string }[]) {
  for (const r of rows) {
    const c = CROPS.find(x => x.id === r.crop_id);
    if (!c) continue;
    c.pricePerKg = Number(r.price_per_kg);
    c.change = Number(r.change_pct);
  }
}
