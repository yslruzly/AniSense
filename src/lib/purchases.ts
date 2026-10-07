import { BuyerTransaction } from "../types";

// ─── What a purchase cost ─────────────────────────────────────────────────────
// The price at checkout is where the buyer and the farmer start talking, not
// always what changes hands. One rule for every figure of a buyer's spending
// (the Orders page, Home's Your purchases), so they never disagree:
//   1. what the buyer recorded paying, if they have
//   2. else what the farmer confirmed it sold for, once they have
//   3. else the order's price
// A cancelled line cost nothing.

export const costOf = (tx: BuyerTransaction): number =>
  tx.status === "cancelled" ? 0 : tx.paid ?? tx.agreed ?? tx.amount;

/** The sum of costOf over a list. */
export const totalSpent = (txs: BuyerTransaction[]): number =>
  Math.round(txs.reduce((sum, tx) => sum + costOf(tx), 0) * 100) / 100;
