import { Listing, SellerDetail } from "../../types";

// ─── Sample farmers and their harvests ────────────────────────────────────────
// Five farmers, three harvests each. They fill the whole demo (an app built
// without .env), and in a real account they stand in, marked as samples,
// while no farmer has posted yet (SAMPLE_MARKET, below): Home's Featured
// farmers and products, the Market, the walkthrough all have something to
// show. The first real listing replaces them all.
//
// Ranked by rating, then sales: Juan, Maria, Jose, Pedro, Manuel. The
// phone numbers are made up (+63 900 000 000x); a real account never offers
// to call a sample farmer.

export const LISTINGS: Listing[] = [
  // Juan Dela Cruz · Cabanatuan City · rice
  { id: "1", crop: "Special Rice", variety: "Special Rice", desc: "Premium quality rice, freshly harvested", pricePerKg: 65, kg: 230, date: "2025-10-02", seller: "Juan Dela Cruz", sellerInitials: "JD", rating: 4.9, location: "Cabanatuan City" },
  { id: "7", crop: "Special Rice", variety: "Special Rice", desc: "Premium special rice, freshly harvested and clean", pricePerKg: 65, kg: 180, date: "2025-10-03", seller: "Juan Dela Cruz", sellerInitials: "JD", rating: 4.9, location: "Cabanatuan City" },
  { id: "11", crop: "Regular Milled", variety: "Regular Milled", desc: "Regular milled rice paddy, freshly harvested in bulk", pricePerKg: 42, kg: 420, date: "2025-10-04", seller: "Juan Dela Cruz", sellerInitials: "JD", rating: 4.9, location: "Cabanatuan City" },
  // Maria Dela Cruz · Guimba · onions, calamansi, upland rice
  { id: "3", crop: "Onions", variety: "Red", desc: "Locally grown red onions, dry and ready for market", pricePerKg: 45, kg: 120, date: "2025-09-30", seller: "Maria Dela Cruz", sellerInitials: "MD", rating: 4.8, location: "Guimba" },
  { id: "13", crop: "Calamansi", variety: "Regular Calamansi", desc: "Freshly picked calamansi, juicy and firm", pricePerKg: 160, kg: 45, date: "2025-10-03", seller: "Maria Dela Cruz", sellerInitials: "MD", rating: 4.8, location: "Guimba" },
  { id: "10", crop: "Special Rice", variety: "Special Rice", desc: "Top-grade special rice from organic upland farms", pricePerKg: 65, kg: 60, date: "2025-09-30", seller: "Maria Dela Cruz", sellerInitials: "MD", rating: 4.8, location: "Guimba" },
  // Jose Reyes · Science City of Muñoz · vegetables and corn
  { id: "5", crop: "Squash", variety: "", desc: "Large heads, freshly harvested", pricePerKg: 12, kg: 100, date: "2025-09-28", seller: "Jose Reyes", sellerInitials: "JR", rating: 4.8, location: "Science City of Muñoz" },
  { id: "14", crop: "Ampalaya", variety: "Native Ampalaya", desc: "Native ampalaya, firm and dark green", pricePerKg: 60, kg: 85, date: "2025-10-04", seller: "Jose Reyes", sellerInitials: "JR", rating: 4.8, location: "Science City of Muñoz" },
  { id: "2", crop: "Corn", variety: "Yellow Corn", desc: "Fresh yellow corn", pricePerKg: 70, kg: 154, date: "2025-10-01", seller: "Jose Reyes", sellerInitials: "JR", rating: 4.8, location: "Science City of Muñoz" },
  // Pedro Cruz · Palayan City · tomatoes and fruit
  { id: "4", crop: "Tomatoes", variety: "", desc: "Fresh tomatoes, bulk quantity available for buyers", pricePerKg: 38, kg: 350, date: "2025-09-29", seller: "Pedro Cruz", sellerInitials: "PC", rating: 4.7, location: "Palayan City" },
  { id: "12", crop: "Mango", variety: "Carabao Mango", desc: "Sweet carabao mangoes, tree-ripened", pricePerKg: 80, kg: 140, date: "2025-10-04", seller: "Pedro Cruz", sellerInitials: "PC", rating: 4.7, location: "Palayan City" },
  { id: "15", crop: "Watermelon", variety: "Sweet Watermelon", desc: "Sweet watermelon, picked this week", pricePerKg: 28, kg: 400, date: "2025-10-03", seller: "Pedro Cruz", sellerInitials: "PC", rating: 4.7, location: "Palayan City" },
  // Manuel Garcia · Talavera · milled rice
  { id: "6", crop: "Well Milled", variety: "Well Milled", desc: "Well-milled rice, clean and ready for market", pricePerKg: 52, kg: 500, date: "2025-10-03", seller: "Manuel Garcia", sellerInitials: "MG", rating: 4.6, location: "Talavera" },
  { id: "9", crop: "Well Milled", variety: "Well Milled", desc: "Well-milled white rice, fluffy and clean", pricePerKg: 52, kg: 90, date: "2025-10-01", seller: "Manuel Garcia", sellerInitials: "MG", rating: 4.6, location: "Talavera" },
  { id: "8", crop: "Regular Milled", variety: "Regular Milled", desc: "Regular milled rice, good quality and affordable", pricePerKg: 42, kg: 300, date: "2025-10-02", seller: "Manuel Garcia", sellerInitials: "MG", rating: 4.6, location: "Talavera" },
];

// ─── Seller Details ───────────────────────────────────────────────────────────
export const SELLER_DETAILS: Record<string, SellerDetail> = {
  "JD": { name: "Juan Dela Cruz", initials: "JD", phone: "+63 900 000 0001", location: "Cabanatuan City, Nueva Ecija", yearsfarming: 18, rating: 4.9, totalSales: 412, crops: ["Special Rice", "Regular Milled"], bio: "Third-generation rice farmer from Cabanatuan City. Known for premium-grade palay and reliable bulk deliveries." },
  "MD": { name: "Maria Dela Cruz", initials: "MD", phone: "+63 900 000 0002", location: "Guimba, Nueva Ecija", yearsfarming: 22, rating: 4.8, totalSales: 365, crops: ["Red Onion", "Regular Calamansi", "Special Rice"], bio: "Onion and calamansi grower from Guimba. Her dry, well-cured onions keep for months." },
  "JR": { name: "Jose Reyes", initials: "JR", phone: "+63 900 000 0003", location: "Science City of Muñoz, Nueva Ecija", yearsfarming: 12, rating: 4.8, totalSales: 238, crops: ["Squash", "Native Ampalaya", "Yellow Corn"], bio: "Mixed-crop farmer near the PhilRice campus. Practices integrated pest management for clean, quality produce." },
  "PC": { name: "Pedro Cruz", initials: "PC", phone: "+63 900 000 0004", location: "Palayan City, Nueva Ecija", yearsfarming: 9, rating: 4.7, totalSales: 190, crops: ["Tomatoes", "Carabao Mango", "Sweet Watermelon"], bio: "Young farmer growing high-yield tomatoes with drip irrigation, and mangoes and watermelon in season." },
  "MG": { name: "Manuel Garcia", initials: "MG", phone: "+63 900 000 0005", location: "Talavera, Nueva Ecija", yearsfarming: 7, rating: 4.6, totalSales: 156, crops: ["Well Milled", "Regular Milled"], bio: "Rice farmer in Talavera with a small family mill. Clean, properly milled rice in every sack." },
};

// ─── In a real account, while nobody has posted yet ───────────────────────────
// The same farmers and harvests, each marked as a sample: the Market says so,
// checkout refuses them, and their phone numbers are never offered to call.
export const SAMPLE_MARKET: { listings: Listing[]; sellers: Record<string, SellerDetail> } = {
  listings: LISTINGS.map(l => ({ ...l, sample: true })),
  sellers: Object.fromEntries(Object.entries(SELLER_DETAILS).map(([k, s]) => [k, { ...s, sample: true }])),
};
