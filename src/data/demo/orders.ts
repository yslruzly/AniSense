// ─── Orders a farmer has received ─────────────────────────────────────────────
// When a buyer checks out, the farmer who grew it has to hear about it and be
// able to reach the buyer: the app takes no payment and arranges no delivery,
// so the sale only happens once the two have spoken. An incoming order
// carries who ordered, their number, and what they want; the farmer calls,
// agrees on pickup and payment, and confirms.
//
// MOCKUP: there is no backend for this yet, so these are sample orders, shown
// only in the demo (no real account). The names and numbers are invented.
// With the database they will come from order_items and the buyer's profile,
// which a farmer may already read for buyers who have ordered from them
// (schema.sql, "profiles: read"), and Confirm will move the line from
// 'placed' to 'confirmed'. The shape is IncomingOrder in src/types.

import { IncomingOrder } from "../../types";


const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

/** The demo farmer's incoming orders: two buyers waiting for a call. */
export function sampleIncomingOrders(): IncomingOrder[] {
  return [
    {
      id: "ord-demo-1", buyer: "Maria Dela Cruz", phone: "+63 917 020 2001", location: "Quezon City, Metro Manila",
      crop: "Special Rice", kg: 50, pricePerKg: 57.2, amount: 2860, placedAt: minutesAgo(12), status: "placed",
    },
    {
      id: "ord-demo-2", buyer: "Ramon Villanueva", phone: "+63 918 020 2002", location: "San Fernando, Pampanga",
      crop: "Red Onion", kg: 20, pricePerKg: 92.5, amount: 1850, placedAt: minutesAgo(135), status: "placed",
    },
  ];
}
