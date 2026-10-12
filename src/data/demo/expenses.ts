import { Expense, BuyerTransaction } from "../../types";

export const EXPENSES: Expense[] = [
  { id: "1", category: "Seeds", description: "Rice Seeds", amount: 1500, date: "2025-02-20", icon: "Seeds", crop: "Rice" },
  { id: "2", category: "Fertilizer", description: "50kg bag", amount: 2200, date: "2025-02-18", icon: "Fertilizer", crop: "Rice" },
  { id: "3", category: "Labor", description: "Harvesting crew(labor)", amount: 5000, date: "2025-02-15", icon: "Labor", crop: "Rice" },
  { id: "4", category: "Equipment", description: "Tractor rent", amount: 3500, date: "2025-01-12", icon: "Equipment", crop: "Rice" },
  { id: "5", category: "Irrigation", description: "Water generator", amount: 800, date: "2025-01-10", icon: "Irrigation", crop: "Rice" },
];

export const BUYER_TRANSACTIONS: BuyerTransaction[] = [
  { id: "bt1", crop: "Rice", variety: "Well Milled", kg: 50, amount: 3250, date: "2025-10-02", seller: "Manuel Garcia", sellerInitials: "MG", location: "Talavera", status: "confirmed", agreed: 3250 },
  { id: "bt2", crop: "Rice", variety: "Special Rice", kg: 25, amount: 1800, date: "2025-10-03", seller: "Maria Dela Cruz", sellerInitials: "MD", location: "Guimba", status: "placed" },
  { id: "bt3", crop: "Onions", variety: "Red Onion", kg: 20, amount: 900, date: "2025-09-30", seller: "Maria Dela Cruz", sellerInitials: "MD", location: "Guimba", status: "completed", agreed: 860, paid: 860 },
  { id: "bt4", crop: "Corn", variety: "Yellow Corn", kg: 30, amount: 2100, date: "2025-09-28", seller: "Jose Reyes", sellerInitials: "JR", location: "Science City of Muñoz", status: "completed", agreed: 2100, paid: 2100, rating: 5 },
  { id: "bt5", crop: "Tomatoes", variety: "Diamante Max F1 Tomato", kg: 15, amount: 570, date: "2025-09-25", seller: "Pedro Cruz", sellerInitials: "PC", location: "Palayan City", status: "completed", agreed: 570, paid: 570 },
];

export const PIE_DATA = [
  { label: "Seeds & Seedlings", pct: 16, color: "#2f9e63" },
  { label: "Fertilizers", pct: 27, color: "#cf8f1f" },
  { label: "Pesticides", pct: 10, color: "#5c86b8" },
  { label: "Labor", pct: 38, color: "#d4553f" },
  { label: "Others", pct: 9, color: "#9268d4" },
];

export const MONTHLY_TRENDS = [
  { month: "Dec", amount: 24000 },
  { month: "Sep", amount: 29500 },
  { month: "Oct", amount: 31000 },
];

// ─── In a real account, while the farmer has recorded no expenses yet ─────────
// Nine entries over this month and the two before it, dated from today, so
// every part of the Expenses page has something to show: this month's total
// against last month's, the pie, the crops, the months. Each is marked as a
// sample: the page says so, and none can be opened. The farmer's first real
// expense replaces them all. The crops are placeholders: the page files the
// "Rice" ones under the farmer's first crop and the "Corn" ones under their
// second, so the samples are about what they actually grow.
const dated = (monthsBack: number, day: number) => {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  // This month's entries are never dated after today.
  d.setDate(monthsBack === 0 ? Math.min(day, now.getDate()) : day);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const SAMPLE_EXPENSES: Expense[] = [
  { id: "sample-exp-1", category: "Seeds", description: "Certified seeds, 2 sacks", amount: 2400, date: dated(0, 3), icon: "Seeds", crop: "Rice" },
  { id: "sample-exp-2", category: "Fertilizer", description: "Urea, 4 bags", amount: 6200, date: dated(0, 6), icon: "Fertilizer", crop: "Rice" },
  { id: "sample-exp-3", category: "Labor", description: "Planting crew, 2 days", amount: 3000, date: dated(0, 9), icon: "Labor", crop: "Rice" },
  { id: "sample-exp-4", category: "Equipment", description: "Tractor rental", amount: 3500, date: dated(1, 12), icon: "Equipment", crop: "Rice" },
  { id: "sample-exp-5", category: "Irrigation", description: "Water pump fuel", amount: 900, date: dated(1, 18), icon: "Irrigation", crop: "Rice" },
  { id: "sample-exp-6", category: "Fertilizer", description: "Complete fertilizer, 2 bags", amount: 3100, date: dated(1, 22), icon: "Fertilizer", crop: "Corn" },
  { id: "sample-exp-7", category: "Labor", description: "Harvest crew, 3 days", amount: 5400, date: dated(2, 8), icon: "Labor", crop: "Corn" },
  { id: "sample-exp-8", category: "Other", description: "Sacks and twine", amount: 650, date: dated(2, 20), icon: "Other", crop: "Corn" },
  { id: "sample-exp-9", category: "Seeds", description: "Seedlings", amount: 1200, date: dated(2, 25), icon: "Seeds", crop: "Corn" },
].map(e => ({ ...e, sample: true }));

// ─── In a real account, while the buyer has no orders yet ─────────────────────
// The same five purchases, each marked as a sample, so the Orders page and
// Home's "What you bought" show what they will look like. The buyer's first
// real order replaces them all. Nothing can be done to a sample: no payment
// to record, no farmer to rate.
export const SAMPLE_PURCHASES: BuyerTransaction[] = BUYER_TRANSACTIONS.map(t => ({ ...t, sample: true }));
