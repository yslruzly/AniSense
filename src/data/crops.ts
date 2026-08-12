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
      { id: "tom-roma", name: "Platunum F1 Tomato", pricePerKg: 15, change: 2.0, volume: 1.2, color: "#2f9e63" },
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
    group: "Squash",
    varieties: [
      { id: "squash-kalabasa", name: "Kalabasa", pricePerKg: 12, change: -1.3, volume: 180, color: "#d4553f" },
    ],
  },
];
// Flat list for backward compat (analytics, home screen, etc.)
export const CROPS: CropPrice[] = CROP_GROUPS.flatMap(g => g.varieties);
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
  "Tomatoes": ["Diamante Max F1 Tomato", "Platunum F1 Tomato", "Assila F1 Tomato", "Tomatoes"],
  "Squash": ["Kalabasa"],
};
export const CROP_CATEGORIES = ["All Crops", ...Object.keys(CROP_FILTER_MAP)];
// All rice-related crop names (for matching)
export const ALL_RICE_NAMES = new Set(["Rice", "Rice (All Varieties)", ...RICE_VARIETY_LIST]);

export const MAIN_CROPS = [
  "Rice", "Corn", "Onions", "Tomatoes", "Calamansi", "Mango", "Garlic", "Squash",
];

export const FARMER_CROPS = ["Rice", "Corn", "Tomatoes", "Onions", "Garlic", "Calamansi", "Mango", "Squash"];
