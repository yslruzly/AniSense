// ─── Types ────────────────────────────────────────────────────────────────────
export type Screen = "home" | "market" | "expenses" | "analytics" | "trade" | "weather" | "profile" | "guide" | "privacy";
export type AuthScreen = "lang" | "splash" | "role" | "signin" | "signup";
export type UserRole = "farmer" | "buyer" | null;
/** Collected at signup. A buyer answers location only, so the other two are
 *  optional rather than a second near-identical type. */
/** What the marketplace should open showing when another screen sends the
 *  buyer there: a crop, a farmer, a search, or just the search box ready. */
export type TradeIntent = {
  category?: string; family?: string; search?: string; seller?: string; focusSearch?: boolean; post?: boolean;
  /** A listing's id: the marketplace opens on it, its details already up. */
  listing?: string;
};
export type FarmDetails = { years?: string; location: string; phone?: string };
export interface CropPrice {
  id: string; name: string; pricePerKg: number; change: number;
  volume: number; color: string;
}
export interface Expense { id: string; category: string; description: string; amount: number; date: string; icon: string; crop: string; }
export interface BuyerTransaction { id: string; crop: string; variety: string; kg: number; amount: number; date: string; seller: string; sellerInitials: string; location: string; }
export interface Listing {
  id: string; crop: string; variety: string; desc: string;
  /** The seller's account id; only on listings from the database. */
  sellerId?: string;
  pricePerKg: number; kg: number; date: string;
  seller: string; sellerInitials: string; rating: number; location: string;
  /** The seller's own photo of this harvest: its Storage URL, or a data URL
   *  on a demo listing. */
  photo?: string;
}
export interface CartItem {
  listingId: string; crop: string; variety: string; pricePerKg: number;
  qty: number; seller: string; sellerInitials: string; location: string; maxKg: number;
  photo?: string;
}
export interface SellerDetail {
  /** The seller's account id; only for sellers from the database. */
  id?: string;
  name: string; initials: string; phone: string; location: string;
  yearsfarming: number; rating: number; totalSales: number; crops: string[]; bio: string;
}
export interface CropGroup { group: string; varieties: CropPrice[]; }
export type FarmerProfile = { name: string; phone: string; email: string; location: string; experience: string; crops: string[]; };

/** Sunny · PartlyCloudy · Cloudy · LightRain · Rainy · Stormy */
export type WxIcon = "Sunny" | "PartlyCloudy" | "Cloudy" | "LightRain" | "Rainy" | "Stormy";

/** An order a buyer has placed with a farmer, as the farmer's alert shows it:
 *  who ordered, how to reach them, and what they want. Sample orders fill it
 *  for now (data/demo/orders.ts); with the database, order_items and the
 *  buyer's profile will. */
export interface IncomingOrder {
  id: string;
  /** The buyer: who to ask for when calling. */
  buyer: string;
  /** As shown to the farmer: "+63 917 020 2001". */
  phone: string;
  /** Where the buyer is: "Quezon City, Metro Manila". */
  location: string;
  /** The variety ordered: "Special Rice". */
  crop: string;
  kg: number;
  pricePerKg: number;
  /** kg × pricePerKg, as agreed at checkout. */
  amount: number;
  /** When the buyer placed it, ISO date-time. */
  placedAt: string;
  /** 'placed' until the farmer confirms it. */
  status: "placed" | "confirmed";
}
