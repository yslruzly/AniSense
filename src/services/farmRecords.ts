// ─── Farm records service ─────────────────────────────────────────────────────
// A farmer's own lists that used to live only on the phone: sales typed in by
// hand, plantings, price alerts and expected harvests. On the database they
// are four tables (sales, plantings, price_alerts, harvest_plans).
//
// Each list is short, so the app keeps it whole and sends the whole list when
// it changes; one database call replaces the farmer's rows (replace_my_*() in
// supabase/schema.sql). Offline, the latest list waits in the outbox and goes
// up when the signal returns, landing exactly as the farmer left it.

import { supabase } from "../lib/supabase";
import { cachedFetch, cacheGet, cacheSet, isNetworkError, FetchResult } from "../lib/cache";
import { enqueue, OutboxHandler } from "../lib/outbox";
import { groupNameOf } from "../data/crops";
import type { Sale } from "../lib/sales";
import type { Planting } from "../lib/plantings";
import type { PriceAlert } from "../lib/priceAlerts";
import type { HarvestPlans } from "../lib/harvestPlans";

export interface FarmRecords {
  sales: Sale[];
  plantings: Planting[];
  alerts: PriceAlert[];
  plans: HarvestPlans;
}

const CACHE_KEY = "farm_records";
const EMPTY: FarmRecords = { sales: [], plantings: [], alerts: [], plans: {} };

/** All four lists for the signed-in farmer. Offline: the last copy fetched. */
export async function fetchFarmRecords(): Promise<FetchResult<FarmRecords>> {
  return cachedFetch(CACHE_KEY, async () => {
    const [sales, plantings, alerts, plans] = await Promise.all([
      supabase.from("sales").select("id, crop_group_id, quantity_kg, price_per_kg, amount, sold_on, buyer_name").order("sold_on", { ascending: false }),
      supabase.from("plantings").select("id, crop_group_id, planted_on, days_to_harvest").order("planted_on"),
      supabase.from("price_alerts").select("id, crop_id, target_price, price_when_set, set_at, crop:crops(name)").order("set_at"),
      supabase.from("harvest_plans").select("crop_group_id, expected_kg"),
    ]);
    for (const r of [sales, plantings, alerts, plans]) if (r.error) throw r.error;
    type SaleRow = { id: string; crop_group_id: string; quantity_kg: number; price_per_kg: number; amount: number; sold_on: string; buyer_name: string | null };
    type PlantingRow = { id: string; crop_group_id: string; planted_on: string; days_to_harvest: number };
    type AlertRow = { id: string; crop_id: string; target_price: number; price_when_set: number; set_at: string; crop: { name: string } | null };
    type PlanRow = { crop_group_id: string; expected_kg: number };
    return {
      sales: (sales.data as unknown as SaleRow[]).map(r => ({
        id: r.id, crop: groupNameOf(r.crop_group_id), kg: Number(r.quantity_kg), pricePerKg: Number(r.price_per_kg),
        amount: Number(r.amount), date: r.sold_on, ...(r.buyer_name ? { buyer: r.buyer_name } : {}),
      })),
      plantings: (plantings.data as unknown as PlantingRow[]).map(r => ({
        id: r.id, crop: groupNameOf(r.crop_group_id), planted: r.planted_on, days: r.days_to_harvest,
      })),
      alerts: (alerts.data as unknown as AlertRow[]).map(r => ({
        id: r.id, cropId: r.crop_id, cropName: r.crop?.name ?? r.crop_id,
        target: Number(r.target_price), setAtPrice: Number(r.price_when_set), setAt: r.set_at,
      })),
      plans: Object.fromEntries((plans.data as unknown as PlanRow[]).map(r => [groupNameOf(r.crop_group_id), Number(r.expected_kg)])),
    };
  });
}

// ─── Saving: the app's shapes, as the database functions take them ──────────
type Kind = "sales" | "plantings" | "alerts" | "plans";
const RPC: Record<Kind, string> = {
  sales: "replace_my_sales",
  plantings: "replace_my_plantings",
  alerts: "replace_my_price_alerts",
  plans: "replace_my_harvest_plans",
};
const ARG: Record<Kind, string> = { sales: "items", plantings: "items", alerts: "items", plans: "plans" };

const payloadOf = {
  sales: (list: Sale[]) => list.map(s => ({ crop: s.crop, kg: s.kg, price_per_kg: s.pricePerKg, sold_on: s.date, buyer: s.buyer ?? "" })),
  plantings: (list: Planting[]) => list.map(p => ({ crop: p.crop, planted_on: p.planted, days: p.days })),
  alerts: (list: PriceAlert[]) => list.map(a => ({ crop_id: a.cropId, target: a.target, price_when_set: a.setAtPrice, set_at: a.setAt })),
  plans: (plans: HarvestPlans) => plans,
};

async function send(kind: Kind, payload: unknown) {
  const { error } = await supabase.rpc(RPC[kind], { [ARG[kind]]: payload });
  if (error) throw error;
}

/** Keep the phone's copy current too, so reopening offline shows the edit. */
async function remember<K extends keyof FarmRecords>(key: K, value: FarmRecords[K]) {
  const cached = await cacheGet<FarmRecords>(CACHE_KEY);
  await cacheSet(CACHE_KEY, { ...(cached?.data ?? EMPTY), [key]: value });
}

async function save<K extends keyof FarmRecords>(kind: K, value: FarmRecords[K], payload: unknown) {
  await remember(kind, value);
  try {
    await send(kind, payload);
  } catch (err) {
    if (!isNetworkError(err)) throw err;
    await enqueue(`replace_${kind}`, { payload: payload as Record<string, unknown> });
  }
}

export const saveSales = (list: Sale[]) => save("sales", list, payloadOf.sales(list));
export const savePlantings = (list: Planting[]) => save("plantings", list, payloadOf.plantings(list));
export const saveAlerts = (list: PriceAlert[]) => save("alerts", list, payloadOf.alerts(list));
export const savePlans = (plans: HarvestPlans) => save("plans", plans, payloadOf.plans(plans));

// ─── Outbox handlers (registered by src/services/sync.ts) ─────────────────
export const farmRecordSyncHandlers: Record<string, OutboxHandler> = {
  replace_sales: async p => { await send("sales", p.payload); },
  replace_plantings: async p => { await send("plantings", p.payload); },
  replace_alerts: async p => { await send("alerts", p.payload); },
  replace_plans: async p => { await send("plans", p.payload); },
};
