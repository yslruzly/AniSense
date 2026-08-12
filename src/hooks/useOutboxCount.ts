// ─── useOutboxCount ───────────────────────────────────────────────────────────
// How many offline changes are waiting to sync. Use it to show a small badge,
// e.g. in ExpensesScreen:
//
//   const pending = useOutboxCount();
//   {pending > 0 && <span>⏳ {pending} waiting to sync</span>}
//
// The count updates live: it drops to 0 as the sync coordinator drains the queue.

import { useEffect, useState } from "react";
import { onOutboxChange } from "../lib/outbox";

export function useOutboxCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => onOutboxChange(setCount), []);
  return count;
}
