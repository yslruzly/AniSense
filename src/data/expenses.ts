import { Expense, BuyerTransaction } from "../types";

export const EXPENSES: Expense[] = [
  { id: "1", category: "Seeds", description: "Rice Seeds", amount: 1500, date: "2025-02-20", icon: "Seeds", crop: "Rice" },
  { id: "2", category: "Fertilizer", description: "50kg bag", amount: 2200, date: "2025-02-18", icon: "Fertilizer", crop: "Rice" },
  { id: "3", category: "Labor", description: "Harvesting crew(labor)", amount: 5000, date: "2025-02-15", icon: "Labor", crop: "Rice" },
  { id: "4", category: "Equipment", description: "Tractor rent", amount: 3500, date: "2025-01-12", icon: "Equipment", crop: "Rice" },
  { id: "5", category: "Irrigation", description: "Water generator", amount: 800, date: "2025-01-10", icon: "Irrigation", crop: "Rice" },
];

export const BUYER_TRANSACTIONS: BuyerTransaction[] = [
  { id: "bt1", crop: "Rice", variety: "Well Milled", kg: 50, amount: 3250, date: "2025-10-02", seller: "Doroteo Jose", sellerInitials: "DJ", location: "Cabanatuan City" },
  { id: "bt2", crop: "Rice", variety: "Special Rice", kg: 25, amount: 1800, date: "2025-10-03", seller: "Mariano Garapon", sellerInitials: "MG", location: "Bongabon" },
  { id: "bt3", crop: "Onions", variety: "Red Onion", kg: 20, amount: 900, date: "2025-09-30", seller: "Betty Go", sellerInitials: "BG", location: "Guimba" },
  { id: "bt4", crop: "Corn", variety: "Yellow Corn", kg: 30, amount: 2100, date: "2025-09-28", seller: "Jose Reyes", sellerInitials: "JR", location: "Talavera" },
  { id: "bt5", crop: "Tomatoes", variety: "Diamante Max F1 Tomato", kg: 15, amount: 570, date: "2025-09-25", seller: "Bong Marcos", sellerInitials: "BM", location: "Palayan City" },
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
