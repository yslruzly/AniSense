import { Preferences } from "@capacitor/preferences";

// ─── Price alerts ─────────────────────────────────────────────────────────────
// "Tell me when Calamansi hits ₱170." A target a farmer sets on a crop, kept
// in native storage so it survives the app being closed.
//
// What "tell me" means today: the app says so when it is opened — the header
// bell counts it and the card on Home turns green. It cannot wake the phone
// while the app is shut; that needs @capacitor/local-notifications (to post
// the notification) and a price check that runs in the background. The
// wording in the UI promises only what this can do.

const KEY = "price_alerts";

export interface PriceAlert {
  id: string;
  /** The priced crop this watches, by CROPS id. */
  cropId: string;
  /** Its name at the time, so an alert still reads right if data shifts. */
  cropName: string;
  /** The price being waited for. */
  target: number;
  /** The price when the alert was set: which way the target lies. */
  setAtPrice: number;
  setAt: string;
}

/** Up if the target is above the price when it was set, down if below. */
export const isRising = (a: PriceAlert) => a.target >= a.setAtPrice;

/** Has today's price met the target? */
export const alertHit = (a: PriceAlert, price: number) =>
  isRising(a) ? price >= a.target : price <= a.target;

export async function loadAlerts(): Promise<PriceAlert[]> {
  try {
    const { value } = await Preferences.get({ key: KEY });
    return value ? (JSON.parse(value) as PriceAlert[]) : [];
  } catch {
    return []; // unreadable or corrupted: start clean rather than crash
  }
}

export async function saveAlerts(alerts: PriceAlert[]): Promise<void> {
  try {
    await Preferences.set({ key: KEY, value: JSON.stringify(alerts) });
  } catch {
    // Storage unavailable (private mode, full disk): the alerts still work
    // for this session, they just will not be there next launch.
  }
}

export const newAlertId = () => `pa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
