// ─── Types ────────────────────────────────────────────────────────────────────
export type Screen = "home" | "market" | "expenses" | "analytics" | "trade" | "weather" | "profile";
export type AuthScreen = "splash" | "role" | "signin" | "signup";
export type UserRole = "farmer" | "buyer" | null;
export type FarmDetails = { years: string; location: string; phone: string };
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
}
export interface CartItem {
  listingId: string; crop: string; variety: string; pricePerKg: number;
  qty: number; seller: string; sellerInitials: string; location: string; maxKg: number;
}
export interface SellerDetail {
  name: string; initials: string; phone: string; location: string;
  yearsfarming: number; rating: number; totalSales: number; crops: string[]; bio: string;
}
export interface CropGroup { group: string; varieties: CropPrice[]; }
export interface LSTMPoint { day: string; actual: number | null; predicted: number; lower: number; upper: number; }
export type FarmerProfile = { name: string; phone: string; email: string; location: string; experience: string; crops: string[]; };
