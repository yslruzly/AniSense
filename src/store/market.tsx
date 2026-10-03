import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { BuyerTransaction, CartItem, Expense, IncomingOrder, Listing, SellerDetail, UserRole } from "../types";
import { LISTINGS, SELLER_DETAILS } from "../data/demo/marketplace";
import { EXPENSES, BUYER_TRANSACTIONS } from "../data/demo/expenses";
import { sampleIncomingOrders } from "../data/demo/orders";
import { CROPS, CROP_GROUP_BY_ID, applyPrices } from "../data/crops";
import { isSupabaseConfigured } from "../lib/supabase";
import { LoadPhase, useSkeletonGate } from "../hooks/useSkeletonGate";
import { setCacheScope } from "../lib/cache";
import { Planting, localISO, loadPlantings, savePlantings as keepPlantings } from "../lib/plantings";
import { Sale, loadSales, saveSales as keepSales } from "../lib/sales";
import { PriceAlert, loadAlerts, saveAlerts as keepAlerts } from "../lib/priceAlerts";
import { HarvestPlans, loadHarvestPlans, saveHarvestPlans as keepPlans } from "../lib/harvestPlans";
import type { AchievementId } from "../lib/achievements";
import { fetchMarket, createListing, updateListing, removeListing, ListingInput } from "../services/listings";
import { fetchMyPurchases, fetchMySales, placeOrder as sendOrder } from "../services/transactions";
import { fetchExpenses, addExpense, updateExpense, deleteExpense as dropExpense, ExpenseForm } from "../services/expenses";
import { syncNow } from "../services/sync";
import { fetchFarmRecords, saveSales as storeSales, savePlantings as storePlantings, saveAlerts as storeAlerts, savePlans as storePlans } from "../services/farmRecords";
import { fetchLatestPrices, fetchPriceHistory, fetchForecasts, fetchMyAwards } from "../services/catalog";
import { applyHistory } from "../data/priceRecords";
import { applyForecasts } from "../data/forecast";

// ─── The market store ─────────────────────────────────────────────────────────
// One place for what the marketplace and the money screens show: listings and
// who sells them, a buyer's purchases, a farmer's expenses and marketplace
// sales. Screens read it with useMarket() and change it through its actions;
// none of them knows whether it is talking to the database.
//
// It also holds a farmer's own records (sales typed in by hand, plantings,
// price alerts, expected harvests), the newest prices with their history and
// forecasts, and the badges on record.
//
// Two modes, picked by whether a real account is signed in:
//   live  Supabase. Reads are cached for offline; expenses and farm records
//         also queue writes offline; listings and checkout need a connection
//         and say so. Prices, their history and the forecasts come from
//         the database, laid over the copy the app shipped with.
//   demo  No .env yet, or the demo sign-in: the built-in sample data, changed
//         in memory, and farm records kept on this phone, exactly as the app
//         behaved before the database.

export type { ListingInput } from "../services/listings";
export type { ExpenseForm } from "../services/expenses";

export interface Market {
  /** True when this is a real account on the database. */
  live: boolean;
  /** The first load of a real account is still on its way. */
  loading: boolean;
  /** What a list should draw during that load: nothing yet ("quiet"), its
   *  skeleton, or the data ("ready"). Always "ready" in the demo, where
   *  nothing is fetched. One value for every screen, so their skeletons come
   *  and go together. */
  loadPhase: LoadPhase;
  /** Showing the copy saved on the phone because the server couldn't be reached. */
  fromCache: boolean;
  listings: Listing[];
  /** Keyed by sellerKeyOf(listing): the account id live, the initials in the demo. */
  sellers: Record<string, SellerDetail>;
  purchases: BuyerTransaction[];
  expenses: Expense[];
  /** What this farmer sold through the marketplace (live only). */
  marketSales: Sale[];
  /** Orders buyers have placed with this farmer, newest first. A mockup for
   *  now: sample orders in the demo, none on a real account (data/demo/orders.ts). */
  incomingOrders: IncomingOrder[];
  /** The farmer has spoken to the buyer and takes the order. */
  confirmOrder: (id: string) => void;
  /** A farmer's own records, and how to change them (saved for them). */
  sales: Sale[];
  setSales: (next: Sale[]) => void;
  plantings: Planting[];
  setPlantings: (next: Planting[]) => void;
  priceAlerts: PriceAlert[];
  setPriceAlerts: (next: PriceAlert[]) => void;
  harvestPlans: HarvestPlans;
  setHarvestPlans: (next: HarvestPlans) => void;
  /** Badges on record in the database (live only): self-awarded and admin-granted. */
  awards: AchievementId[];
  /** Bumped when prices, price history or forecasts arrive from the database, so screens redraw. */
  pricesVersion: number;
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
  const [incomingOrders, setIncomingOrders] = useState<IncomingOrder[]>([]);
  const [sales, setSalesState] = useState<Sale[]>([]);
  const [plantings, setPlantingsState] = useState<Planting[]>([]);
  const [priceAlerts, setAlertsState] = useState<PriceAlert[]>([]);
  const [harvestPlans, setPlansState] = useState<HarvestPlans>({});
  const [awards, setAwards] = useState<AchievementId[]>([]);
  const [pricesVersion, setPricesVersion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  const loadPhase = useSkeletonGate(loading);

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
    // The newest prices, from the database's catalog, into every screen.
    jobs.push(fetchLatestPrices().then(r => {
      if (g === gen.current && r.data.length) { applyPrices(r.data); setPricesVersion(v => v + 1); }
      return r.fromCache;
    }));
    // The price records and the forecasts, over the copy the app shipped
    // with: a month added to the database shows without a new APK.
    jobs.push(fetchPriceHistory().then(r => {
      if (g === gen.current && r.data.length) { applyHistory(r.data); setPricesVersion(v => v + 1); }
      return r.fromCache;
    }));
    jobs.push(fetchForecasts().then(r => {
      if (g === gen.current && r.data.length) { applyForecasts(r.data); setPricesVersion(v => v + 1); }
      return r.fromCache;
    }));
    if (role === "buyer") {
      jobs.push(fetchMyPurchases().then(r => { if (g === gen.current) setPurchases(r.data); return r.fromCache; }));
    } else {
      // Send anything recorded offline first, once, so both fresh lists
      // include it (a second sync started alongside would return at once).
      const synced = syncNow().catch(() => 0);
      jobs.push(synced.then(() => fetchExpenses())
        .then(r => { if (g === gen.current) setExpenses(r.data); return r.fromCache; }));
      jobs.push(fetchMySales().then(r => { if (g === gen.current) setMarketSales(r.data); return r.fromCache; }));
      jobs.push(synced.then(() => fetchFarmRecords()).then(r => {
        if (g !== gen.current) return r.fromCache;
        setSalesState(r.data.sales);
        setPlantingsState(r.data.plantings);
        setAlertsState(r.data.alerts);
        setPlansState(r.data.plans);
        return r.fromCache;
      }));
      jobs.push(fetchMyAwards().then(r => { if (g === gen.current) setAwards(r.data); return r.fromCache; }));
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
      setAwards([]);
      setLoading(false);
      setFromCache(false);
      // The demo's own records, kept on this phone.
      const g = gen.current;
      void Promise.all([loadSales(), loadPlantings(), loadAlerts(), loadHarvestPlans()]).then(([sl, pl, al, hp]) => {
        if (g !== gen.current) return;
        setSalesState(sl); setPlantingsState(pl); setAlertsState(al); setPlansState(hp);
      });
      return;
    }
    setCacheScope(accountId);
    setListings([]);
    setSellers({});
    setPurchases([]);
    setExpenses([]);
    setMarketSales([]);
    setSalesState([]);
    setPlantingsState([]);
    setAlertsState([]);
    setPlansState({});
    setAwards([]);
    setLoading(true);
    void loadAll();
    // When the signal returns: expenses written offline go up (loadAll sends
    // them before it fetches), and the lists catch up with what changed.
    const back = () => { void loadAll(); };
    window.addEventListener("online", back);
    return () => window.removeEventListener("online", back);
  }, [live, accountId, loadAll]);

  // Orders waiting for a farmer. Until the database serves them, the demo
  // farmer gets two sample orders and a real account gets none: an invented
  // buyer must never appear on a real farmer's phone.
  useEffect(() => {
    setIncomingOrders(!live && role === "farmer" ? sampleIncomingOrders() : []);
  }, [live, role, accountId]);

  const confirmOrder = useCallback((id: string) => {
    setIncomingOrders(os => os.map(o => (o.id === id ? { ...o, status: "confirmed" } : o)));
  }, []);

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

  // A farmer's own records: shown at once, then saved where they belong, the
  // database for a real account (queued if offline), this phone in the demo.
  const quiet = (p: Promise<unknown>) => { void p.catch(() => { /* kept on screen; saved again with the next change */ }); };
  const setSales = (next: Sale[]) => { setSalesState(next); quiet(live ? storeSales(next) : keepSales(next)); };
  const setPlantings = (next: Planting[]) => { setPlantingsState(next); quiet(live ? storePlantings(next) : keepPlantings(next)); };
  const setPriceAlerts = (next: PriceAlert[]) => { setAlertsState(next); quiet(live ? storeAlerts(next) : keepAlerts(next)); };
  const setHarvestPlans = (next: HarvestPlans) => { setPlansState(next); quiet(live ? storePlans(next) : keepPlans(next)); };

  return {
    live, loading, loadPhase, fromCache,
    listings, sellers, purchases, expenses, marketSales,
    incomingOrders, confirmOrder,
    sales, setSales, plantings, setPlantings, priceAlerts, setPriceAlerts, harvestPlans, setHarvestPlans,
    awards, pricesVersion,
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
