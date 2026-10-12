import { useEffect, useSyncExternalStore } from "react";
import { useViewer } from "./viewer";
import { fetchWeather, Weather } from "../services/weather";

// ─── The weather, shared ──────────────────────────────────────────────────────
// One forecast for the whole app: Home's weather button, the bell's rain
// alert and the Weather page all read this, so it is fetched once, not three
// times. Fetched when the first of them appears, again when it is half an
// hour old and one of them is shown, and again when the signal returns.
//
// Whose weather it is: the farmer's own town, or for a buyer, Nueva Ecija.
// Another account, or the farmer moving town, starts it afresh.

export type WeatherStatus = "loading" | "ready" | "failed";

interface State {
  key: string;
  data: Weather | null;
  /** The phone's saved copy, shown because there's no signal. */
  fromCache: boolean;
  /** When it was fetched, ISO. */
  updatedAt: string | null;
  status: WeatherStatus;
}

const STALE_MS = 30 * 60_000;
let state: State = { key: "", data: null, fromCache: false, updatedAt: null, status: "loading" };
let inFlight: { key: string; job: Promise<void> } | null = null;
const listeners = new Set<() => void>();
const set = (next: Partial<State>) => { state = { ...state, ...next }; listeners.forEach(l => l()); };
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

function load(key: string, place: string, forBuyer: boolean, force = false): Promise<void> {
  if (inFlight?.key === key) return inFlight.job;
  const fresh = state.key === key && state.status === "ready" && !state.fromCache
    && !!state.updatedAt && Date.now() - Date.parse(state.updatedAt) < STALE_MS;
  if (fresh && !force) return Promise.resolve();
  if (state.key !== key) set({ key, data: null, fromCache: false, updatedAt: null, status: "loading" });
  else if (!state.data) set({ status: "loading" });
  const job = fetchWeather(place, forBuyer)
    .then(r => { if (state.key === key) set({ data: r.data, fromCache: r.fromCache, updatedAt: r.updatedAt, status: "ready" }); })
    // Nothing new: what is on screen stays; with nothing on screen, say so.
    .catch(() => { if (state.key === key) set({ status: state.data ? "ready" : "failed" }); })
    .finally(() => { if (inFlight?.job === job) inFlight = null; });
  inFlight = { key, job };
  return job;
}

export function useWeather() {
  const { role, location } = useViewer();
  const forBuyer = role === "buyer";
  const place = forBuyer ? "" : location ?? "";
  const key = `${role}|${place}`;
  const snap = useSyncExternalStore(subscribe, () => state);

  useEffect(() => { void load(key, place, forBuyer); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const back = () => { void load(key, place, forBuyer, true); };
    window.addEventListener("online", back);
    return () => window.removeEventListener("online", back);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const mine = snap.key === key ? snap : { ...snap, data: null, fromCache: false, updatedAt: null, status: "loading" as const };
  return { ...mine, retry: () => { void load(key, place, forBuyer, true); } };
}
