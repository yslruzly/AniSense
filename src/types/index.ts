// ─── Types ────────────────────────────────────────────────────────────────────
export type Screen = "home" | "market" | "expenses" | "analytics" | "trade" | "weather" | "profile";
export type AuthScreen = "lang" | "splash" | "role" | "signin" | "signup";
export type UserRole = "farmer" | "buyer" | null;
/** Collected at signup. A buyer answers location only, so the other two are
 *  optional rather than a second near-identical type. */
/** What the marketplace should open showing when another screen sends the
 *  buyer there: a crop, a farmer, a search, or just the search box ready. */
export type TradeIntent = { category?: string; search?: string; seller?: string; focusSearch?: boolean };
export type FarmDetails = { years?: string; location: string; phone?: string };
export interface CropPrice {
  id: string; name: string; pricePerKg: number; change: number;
  volume: number; color: string;
}
export interface PricePoint { day: string; rice: number; corn: number; vegetables: number; }
export interface Expense { id: string; category: string; description: string; amount: number; date: string; icon: string; crop: string; }
export interface BuyerTransaction { id: string; crop: string; variety: string; kg: number; amount: number; date: string; seller: string; sellerInitials: string; location: string; }
export interface Listing {
  id: string; crop: string; variety: string; desc: string;
  pricePerKg: number; kg: number; date: string;
  seller: string; sellerInitials: string; rating: number; location: string;
  /** The seller's own photo of this harvest (a data URL until uploads exist). */
  photo?: string;
}
export interface CartItem {
  listingId: string; crop: string; variety: string; pricePerKg: number;
  qty: number; seller: string; sellerInitials: string; location: string; maxKg: number;
  photo?: string;
}
export interface SellerDetail {
  name: string; initials: string; phone: string; location: string;
  yearsfarming: number; rating: number; totalSales: number; crops: string[]; bio: string;
}
export interface CropGroup { group: string; varieties: CropPrice[]; }
export interface LSTMPoint { day: string; actual: number | null; predicted: number; lower: number; upper: number; }
export type FarmerProfile = { name: string; phone: string; email: string; location: string; experience: string; crops: string[]; };
