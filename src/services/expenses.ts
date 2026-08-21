// ─── Expenses Service (offline-first) ─────────────────────────────────────────
// The expense tracker works FULLY offline: a farmer in a field with no signal
// can add/edit/delete expenses; changes apply to the local cache instantly and
// are queued in the outbox, then synced to Supabase when connectivity returns.
//
// Replaces `useState([...EXPENSES])` in ExpensesScreen; see SETUP_DATABASE.md
// Step 7. RLS guarantees each farmer only ever sees their own rows.

import { supabase } from "../lib/supabase";
import { Expense } from "../types";
import { cachedFetch, cacheGet, cacheSet, isNetworkError, FetchResult } from "../lib/cache";
import { enqueue, OutboxHandler } from "../lib/outbox";

const CACHE_KEY = "expenses";

interface ExpenseRow {
  id: string;
  category: string;
  description: string;
  crop: string;
  amount: number;
  spent_on: string;
}

interface ExpenseForm {
  description: string; category: string; amount: number; date: string; crop: string;
}

function toExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    category: row.category,
    description: row.description,
    amount: Number(row.amount),
    date: row.spent_on,
    icon: row.category, // ExpenseIcon component keys off the category name
    crop: row.crop,
  };
}

/** Apply a change to the locally cached list (keeps the UI instant + offline-correct). */
async function mutateCache(fn: (list: Expense[]) => Expense[]): Promise<void> {
  const cached = await cacheGet<Expense[]>(CACHE_KEY);
  await cacheSet(CACHE_KEY, fn(cached?.data ?? []));
}

// ─── Server calls (private) ───────────────────────────────────────────────────

async function serverFetch(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("id, category, description, crop, amount, spent_on")
    .order("spent_on", { ascending: false });
  if (error) throw error;
  return (data as ExpenseRow[]).map(toExpense);
}

async function serverAdd(form: ExpenseForm): Promise<Expense> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not signed in");
  const { data, error } = await supabase.from("expenses").insert({
    farmer_id: userData.user.id,
    description: form.description,
    category: form.category,
    amount: form.amount,
    spent_on: form.date,
    crop: form.crop,
  }).select().single();
  if (error) throw error;
  return toExpense(data as ExpenseRow);
}

async function serverUpdate(id: string, form: ExpenseForm): Promise<void> {
  const { error } = await supabase.from("expenses").update({
    description: form.description,
    category: form.category,
    amount: form.amount,
    spent_on: form.date,
    crop: form.crop,
  }).eq("id", id);
  if (error) throw error;
}

async function serverDelete(id: string): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}

// ─── Public API (what ExpensesScreen calls) ───────────────────────────────────

/** Network-first, cache-fallback. `fromCache: true` → show the offline banner. */
export async function fetchExpenses(): Promise<FetchResult<Expense[]>> {
  return cachedFetch(CACHE_KEY, serverFetch);
}

/**
 * Add an expense. Online: saved to Supabase + cache. Offline (or flaky signal):
 * saved to cache with a temporary "local-" id and queued for sync. Either way
 * the returned Expense can go straight into the screen's state.
 */
export async function addExpense(form: ExpenseForm): Promise<Expense> {
  try {
    const exp = await serverAdd(form);
    await mutateCache(list => [exp, ...list]);
    return exp;
  } catch (err) {
    if (!isNetworkError(err)) throw err; // real rejection (validation/RLS): surface it
    const exp: Expense = {
      id: `local-${Date.now()}`,
      description: form.description,
      category: form.category,
      amount: form.amount,
      date: form.date,
      icon: form.category,
      crop: form.crop,
    };
    await mutateCache(list => [exp, ...list]);
    await enqueue("add_expense", { localId: exp.id, form: { ...form } });
    return exp;
  }
}

export async function updateExpense(id: string, form: ExpenseForm): Promise<void> {
  const apply = (list: Expense[]) =>
    list.map(e => e.id === id
      ? { ...e, description: form.description, category: form.category, amount: form.amount, date: form.date, icon: form.category, crop: form.crop }
      : e);

  // Rows created offline haven't reached the server yet, so queue the edit; the
  // outbox will remap the local id to the real one after the insert syncs.
  if (id.startsWith("local-")) {
    await mutateCache(apply);
    await enqueue("update_expense", { id, form: { ...form } });
    return;
  }
  try {
    await serverUpdate(id, form);
    await mutateCache(apply);
  } catch (err) {
    if (!isNetworkError(err)) throw err;
    await mutateCache(apply);
    await enqueue("update_expense", { id, form: { ...form } });
  }
}

export async function deleteExpense(id: string): Promise<void> {
  const apply = (list: Expense[]) => list.filter(e => e.id !== id);

  if (id.startsWith("local-")) {
    await mutateCache(apply);
    await enqueue("delete_expense", { id });
    return;
  }
  try {
    await serverDelete(id);
    await mutateCache(apply);
  } catch (err) {
    if (!isNetworkError(err)) throw err;
    await mutateCache(apply);
    await enqueue("delete_expense", { id });
  }
}

// ─── Outbox handlers (registered by src/services/sync.ts) ─────────────────────

export const expenseSyncHandlers: Record<string, OutboxHandler> = {
  add_expense: async (payload) => {
    const { localId, form } = payload as { localId: string; form: ExpenseForm };
    const exp = await serverAdd(form);
    // Swap the temp row for the real one in the cache
    await mutateCache(list => list.map(e => (e.id === localId ? exp : e)));
    return { localId, realId: exp.id }; // lets queued edits/deletes remap
  },
  update_expense: async (payload) => {
    const { id, form } = payload as { id: string; form: ExpenseForm };
    await serverUpdate(id, form);
  },
  delete_expense: async (payload) => {
    const { id } = payload as { id: string };
    await serverDelete(id);
  },
};
