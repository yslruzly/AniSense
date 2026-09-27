import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { BuyerTransaction, CartItem, Expense, Listing, SellerDetail, UserRole } from "../types";
import { LISTINGS, SELLER_DETAILS } from "../data/marketplace";
import { EXPENSES, BUYER_TRANSACTIONS } from "../data/expenses";
import { CROPS, CROP_GROUP_BY_ID } from "../data/crops";
import { isSupabaseConfigured } from "./supabase";
import { setCacheScope } from "./cache";
import { localISO } from "./plantings";
import { Sale } from "./sales";
import { fetchMarket, createListing, updateListing, removeListing, ListingInput } from "../services/listings";
import { fetchMyPurchases, fetchMySales, placeOrder as sendOrder } from "../services/transactions";
import { fetchExpenses, addExpense, updateExpense, deleteExpense as dropExpense, ExpenseForm } from "../services/expenses";
import { syncNow } from "../services/sync";

// ─── The market store ─────────────────────────────────────────────────────────
// One place for what the marketplace and the money screens show: listings and
// who sells them, a buyer's purchases, a farmer's expenses and marketplace
// sales. Screens read it with useMarket() and change it through its actions;
// none of them knows whether it is talking to the database.
//
// Two modes, picked by whether a real account is signed in:
//   live  Supabase. Reads are cached for offline; expenses also queue writes
//         offline; listings and checkout need a connection and say so.
//   demo  No .env yet, or the demo sign-in: the built-in sample data, changed
//         in memory, exactly as the app behaved before the database.

export type { ListingInput } from "../services/listings";
export type { ExpenseForm } from "../services/expenses";

export interface Market {
  /** True when this is a real account on the database. */
  live: boolean;
  /** The first load of a real account is still on its way. */
  loading: boolean;
  /** Showing the copy saved on the phone because the server couldn't be reached. */
  fromCache: boolean;
  listings: Listing[];
  /** Keyed by sellerKeyOf(listing): the account id live, the initials in the demo. */
  sellers: Record<string, SellerDetail>;
  purchases: BuyerTransaction[];
  expenses: Expense[];
  /** What this farmer sold through the marketplace (live only). */
  marketSales: Sale[];
  isMine: (l: Listing) => boolean;
  sellerKeyOf: (l: Listing) => string;
  saveListing: (id: string | null, form: ListingInput) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  placeOrder: (lines: CartItem[]) => Promise<void>;
  saveExpense: (id: string | null, form: ExpenseForm) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  /** Fetch the marketplace again (on opening it, and after a change). */
  refresh: () => Promise<void>;
}

export const sellerKeyOf = (l: Listing) => l.sellerId ?? l.sellerInitials;
export const sellerKeyOfDetail = (s: SellerDetail) => s.id ?? s.initials;

/** "Special Rice" → "Rice": the crop group a listing's crop belongs to. */
export const groupOf = (crop: string) =>
  CROP_GROUP_BY_ID[CROPS.find(c => c.name === crop)?.id ?? ""] || crop;

const toExpense = (id: string, f: ExpenseForm): Expense =>
  ({ id, description: f.description, category: f.category, amount: f.amount, date: f.date, icon: f.category, crop: f.crop });

export function useMarketStore({ accountId, role, name, initials }: {
  accountId: string | null;
  role: UserRole;
  name: string;
  initials: string;
}): Market {
  const live = isSupabaseConfigured && !!accountId;

  const [listings, setListings] = useState<Listing[]>(() => [...LISTINGS]);
  const [sellers, setSellers] = useState<Record<string, SellerDetail>>(() => ({ ...SELLER_DETAILS }));
  const [purchases, setPurchases] = useState<BuyerTransaction[]>(() => [...BUYER_TRANSACTIONS]);
  const [expenses, setExpenses] = useState<Expense[]>(() => [...EXPENSES]);
  const [marketSales, setMarketSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  // Bumped whenever the account changes, so an answer that arrives after
  // someone else has signed in is thrown away instead of shown to them.
  const gen = useRef(0);

  const loadMarket = useCallback(async () => {
    const g = gen.current;
    const r = await fetchMarket();
    if (g !== gen.current) return false;
    setListings(r.data.listings);
    setSellers(r.data.sellers);
    return r.fromCache;
  }, []);

  const loadAll = useCallback(async () => {
    const g = gen.current;
    const jobs: Promise<boolean>[] = [loadMarket()];
    if (role === "buyer") {
      jobs.push(fetchMyPurchases().then(r => { if (g === gen.current) setPurchases(r.data); return r.fromCache; }));
    } else {
      // Send anything recorded offline first, so the fresh list includes it.
      jobs.push(syncNow().catch(() => 0).then(() => fetchExpenses())
        .then(r => { if (g === gen.current) setExpenses(r.data); return r.fromCache; }));
      jobs.push(fetchMySales(groupOf).then(r => { if (g === gen.current) setMarketSales(r.data); return r.fromCache; }));
    }
    const results = await Promise.allSettled(jobs);
    if (g !== gen.current) return;
    setFromCache(results.some(r => r.status === "fulfilled" && r.value));
    setLoading(false);
  }, [loadMarket, role]);

  // A real account opens: file the phone's saved copies under it, clear the
  // sample data, and load theirs. Signing out puts the samples back.
  useEffect(() => {
    gen.current++;
    if (!live) {
      setCacheScope(null);
      setListings([...LISTINGS]);
      setSellers({ ...SELLER_DETAILS });
      setPurchases([...BUYER_TRANSACTIONS]);
      setExpenses([...EXPENSES]);
      setMarketSales([]);
      setLoading(false);
      setFromCache(false);
      return;
    }
    setCacheScope(accountId);
    setListings([]);
    setSellers({});
    setPurchases([]);
    setExpenses([]);
    setMarketSales([]);
    setLoading(true);
    void loadAll();
    // When the signal returns: expenses written offline go up (loadAll sends
    // them before it fetches), and the lists catch up with what changed.
    const back = () => { void loadAll(); };
    window.addEventListener("online", back);
    return () => window.removeEventListener("online", back);
  }, [live, accountId, loadAll]);

  const refresh = useCallback(async () => {
    if (!live) return;
    try { setFromCache(await loadMarket()); } catch { /* the list on screen stands */ }
  }, [live, loadMarket]);

  const isMine = (l: Listing) => (live ? l.sellerId === accountId : l.sellerInitials === initials);

  const saveListing = async (id: string | null, form: ListingInput) => {
    if (live) {
      if (id) await updateListing(id, form); else await createListing(form);
      await refresh();
      return;
    }
    const fields = {
      crop: form.crop, variety: form.variety, desc: form.desc,
      pricePerKg: form.pricePerKg, kg: form.kg, location: form.location,
      photo: form.photo ?? undefined,
    };
    if (id) setListings(ls => ls.map(l => (l.id === id ? { ...l, ...fields } : l)));
    else setListings(ls => [{
      id: Date.now().toString(), ...fields, date: localISO(),
      seller: name, sellerInitials: initials, rating: 5.0,
    }, ...ls]);
  };

  const deleteListing = async (id: string) => {
    if (live) await removeListing(id);
    setListings(ls => ls.filter(l => l.id !== id));
  };

  const placeOrder = async (lines: CartItem[]) => {
    if (live) {
      await sendOrder(lines);
      // The order is in. Catching up the stock and the history is a courtesy
      // that may fail offline without taking the order with it.
      void refresh();
      void fetchMyPurchases().then(r => setPurchases(r.data)).catch(() => {});
      return;
    }
    // Demo: the same effects, in memory, so the sample market behaves.
    const today = localISO();
    setListings(ls => ls
      .map(l => { const c = lines.find(x => x.listingId === l.id); return c ? { ...l, kg: l.kg - c.qty } : l; })
      .filter(l => l.kg > 0));
    setPurchases(ps => [
      ...lines.map((c, i) => ({
        id: `local-${Date.now()}-${i}`, crop: groupOf(c.crop), variety: c.variety || c.crop, kg: c.qty,
        amount: c.qty * c.pricePerKg, date: today, seller: c.seller, sellerInitials: c.sellerInitials, location: c.location,
      })),
      ...ps,
    ]);
  };

  const saveExpense = async (id: string | null, form: ExpenseForm) => {
    if (live) {
      if (id) {
        await updateExpense(id, form);
        setExpenses(es => es.map(e => (e.id === id ? toExpense(id, form) : e)));
      } else {
        const e = await addExpense(form);
        setExpenses(es => [e, ...es]);
      }
      return;
    }
    if (id) setExpenses(es => es.map(e => (e.id === id ? toExpense(id, form) : e)));
    else setExpenses(es => [toExpense(Date.now().toString(), form), ...es]);
  };

  const deleteExpense = async (id: string) => {
    if (live) await dropExpense(id);
    setExpenses(es => es.filter(e => e.id !== id));
  };

  return {
    live, loading, fromCache,
    listings, sellers, purchases, expenses, marketSales,
    isMine, sellerKeyOf,
    saveListing, deleteListing, placeOrder, saveExpense, deleteExpense, refresh,
  };
}

export const MarketContext = createContext<Market | null>(null);

export function useMarket(): Market {
  const m = useContext(MarketContext);
  if (!m) throw new Error("useMarket() needs <MarketContext.Provider> (App.tsx)");
  return m;
}
