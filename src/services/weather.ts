// ─── Weather Service ──────────────────────────────────────────────────────────
// The forecast, from Open-Meteo (open-meteo.com): free, no key, and it covers
// the Philippines at a few kilometres. Two calls, both plain GETs:
//
//   1. where: the farmer's town, by name, through Open-Meteo's geocoding
//      ("Talavera" in the Province of Nueva Ecija → 15.59, 120.92). Looked up
//      once per town and kept on the phone for good; a town doesn't move.
//   2. what: now, the next two days by the hour, and six days by the day, in
//      Philippine time.
//
// Only the town's name and its coordinates leave the phone; never who is
// asking. A buyer sees the weather where the farmers are, Nueva Ecija, since
// what they plan is the trip there to collect.
//
// The answer is kept like every other list (lib/cache): with no signal the
// last one is shown at once, marked with when it was fetched. The screens
// work out "the next eight hours" and "the next five days" from the clock
// when they draw, so a saved forecast still starts at the right hour.

import { WxIcon } from "../types";
import { cachedFetch, FetchResult } from "../lib/cache";
import { kvGet, kvSet } from "../lib/localdb";

export interface WeatherNow {
  icon: WxIcon;
  /** °C, rounded. */
  temp: number;
  feels: number;
  /** % */
  humidity: number;
  /** km/h */
  wind: number;
}
export interface WeatherHour {
  /** Local time, "2026-10-12T14:00". */
  time: string;
  icon: WxIcon;
  temp: number;
  /** % chance of rain in that hour. */
  rain: number;
}
export interface WeatherDay {
  /** Local date, "2026-10-12". */
  date: string;
  icon: WxIcon;
  high: number;
  low: number;
  /** Highest % chance of rain that day. */
  rain: number;
  uv: number;
}
export interface Weather {
  /** Where it is for, as the screen names it: "Talavera", "Nueva Ecija". */
  place: string;
  now: WeatherNow;
  hours: WeatherHour[];
  days: WeatherDay[];
}

/** WMO weather codes, as Open-Meteo reports them, to the app's six skies.
 *  Fog reads as cloud; drizzle and slight showers as light rain; snow and
 *  hail (which Nueva Ecija won't see) as rain, the nearest thing it is. */
export function wxIconOf(code: number): WxIcon {
  if (code <= 1) return "Sunny";
  if (code === 2) return "PartlyCloudy";
  if (code === 3 || code === 45 || code === 48) return "Cloudy";
  if ((code >= 51 && code <= 57) || code === 61 || code === 80) return "LightRain";
  if (code >= 95) return "Stormy";
  return "Rainy";
}

/** A day that counts as wet: more likely rain than not. The forecast's own
 *  picture for a day is its worst hour, so a sunny day with one passing
 *  shower shows rain; the chance is what a plan should go by. */
export const isWetDay = (d: WeatherDay) => d.rain >= 50;

// ── Where ────────────────────────────────────────────────────────────────────

/** The middle of Nueva Ecija (Cabanatuan City): for buyers, and for any town
 *  the lookup can't find. */
const NUEVA_ECIJA = { name: "Nueva Ecija", lat: 15.4865, lon: 120.9667 };

interface Spot { name: string; lat: number; lon: number }
interface GeoResult { name: string; latitude: number; longitude: number; admin1?: string; admin2?: string; admin3?: string }

/** Open-Meteo names a province "Province of Nueva Ecija". */
const bare = (s = "") => s.toLowerCase().replace(/^province of /, "").trim();

async function getJSON<T>(url: string, ms = 10_000): Promise<T> {
  // A forecast that hasn't come in ten seconds isn't coming on this signal:
  // give up, and the saved one is shown instead.
  const stop = new AbortController();
  const timer = window.setTimeout(() => stop.abort(), ms);
  try {
    const res = await fetch(url, { signal: stop.signal });
    if (!res.ok) throw new Error(`Weather service answered ${res.status}`);
    return await res.json() as T;
  } finally {
    window.clearTimeout(timer);
  }
}

async function search(name: string): Promise<GeoResult[]> {
  const q = new URLSearchParams({ name, count: "10", language: "en", format: "json", countryCode: "PH" });
  const r = await getJSON<{ results?: GeoResult[] }>(`https://geocoding-api.open-meteo.com/v1/search?${q}`);
  return r.results ?? [];
}

/** "Bagong Sikat, Talavera, Nueva Ecija" → Talavera's coordinates. The town
 *  is the second-last part, the province the last; a town of the same name
 *  in another province ("San Jose", in Mindoro) is passed over. "Science
 *  City of Muñoz" is known to the lookup as "Muñoz", so the plain name is
 *  tried next. */
async function locate(place: string): Promise<Spot> {
  const parts = place.split(",").map(s => s.trim()).filter(Boolean);
  const province = parts.length > 1 ? parts[parts.length - 1] : "";
  const town = parts.length > 1 ? parts[parts.length - 2] : parts[0] ?? "";
  if (!town) return NUEVA_ECIJA;
  const saved = await kvGet(`geo:${town}|${province}`).catch(() => null);
  if (saved) {
    try { return JSON.parse(saved) as Spot; } catch { /* look it up again */ }
  }
  const names = [town, town.replace(/^(science )?city of /i, "").replace(/ city$/i, "")].filter((n, i, a) => n && a.indexOf(n) === i);
  const inProvince = (r: GeoResult) => !province || [r.admin1, r.admin2, r.admin3].some(a => bare(a).includes(bare(province)));
  let found: GeoResult | undefined;
  let first: GeoResult | undefined;
  for (const n of names) {
    const results = await search(n);
    first ??= results[0];
    found = results.find(inProvince);
    if (found) break;
  }
  // Nothing in their province: the town of that name, if there is only the
  // one guess to make; otherwise the middle of Nueva Ecija.
  const hit = found ?? first;
  const spot = hit ? { name: town, lat: hit.latitude, lon: hit.longitude } : { ...NUEVA_ECIJA };
  if (hit) await kvSet(`geo:${town}|${province}`, JSON.stringify(spot)).catch(() => {});
  return spot;
}

// ── What ─────────────────────────────────────────────────────────────────────

interface ForecastResponse {
  current: { temperature_2m: number; apparent_temperature: number; relative_humidity_2m: number; wind_speed_10m: number; weather_code: number };
  hourly: { time: string[]; temperature_2m: number[]; weather_code: number[]; precipitation_probability: (number | null)[] };
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: (number | null)[]; uv_index_max: (number | null)[] };
}

async function forecast(spot: Spot): Promise<Weather> {
  const q = new URLSearchParams({
    latitude: spot.lat.toFixed(4),
    longitude: spot.lon.toFixed(4),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
    hourly: "temperature_2m,weather_code,precipitation_probability",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max",
    timezone: "Asia/Manila",
    forecast_days: "7",
    wind_speed_unit: "kmh",
  });
  const f = await getJSON<ForecastResponse>(`https://api.open-meteo.com/v1/forecast?${q}`);
  const c = f.current;
  return {
    place: spot.name,
    now: {
      icon: wxIconOf(c.weather_code),
      temp: Math.round(c.temperature_2m),
      feels: Math.round(c.apparent_temperature),
      humidity: Math.round(c.relative_humidity_2m),
      wind: Math.round(c.wind_speed_10m),
    },
    hours: f.hourly.time.map((time, i) => ({
      time,
      icon: wxIconOf(f.hourly.weather_code[i]),
      temp: Math.round(f.hourly.temperature_2m[i]),
      rain: Math.round(f.hourly.precipitation_probability[i] ?? 0),
    })),
    days: f.daily.time.map((date, i) => ({
      date,
      icon: wxIconOf(f.daily.weather_code[i]),
      high: Math.round(f.daily.temperature_2m_max[i]),
      low: Math.round(f.daily.temperature_2m_min[i]),
      rain: Math.round(f.daily.precipitation_probability_max[i] ?? 0),
      uv: Math.round(f.daily.uv_index_max[i] ?? 0),
    })),
  };
}

/** The weather for a farmer's place ("Talavera, Nueva Ecija"), or, for a
 *  buyer, for Nueva Ecija. Offline: the last one fetched (`fromCache`). */
export function fetchWeather(place: string, forBuyer: boolean): Promise<FetchResult<Weather>> {
  return cachedFetch("weather", async () => forecast(forBuyer || !place ? NUEVA_ECIJA : await locate(place)));
}

// ── Read at the time of drawing ──────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");
const localDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const localHour = (d: Date) => `${localDate(d)}T${pad(d.getHours())}:00`;

/** The next `n` hours, starting with this one. */
export const hoursFrom = (w: Weather, now: Date, n = 8) => {
  const at = w.hours.findIndex(h => h.time >= localHour(now));
  return at < 0 ? [] : w.hours.slice(at, at + n);
};

/** The next `n` days, starting with today. */
export const daysFrom = (w: Weather, now: Date, n = 5) => w.days.filter(d => d.date >= localDate(now)).slice(0, n);

/** The first of the next five days that is likely to be wet, if any. */
export const nextWetDay = (w: Weather, now: Date) => daysFrom(w, now, 5).find(isWetDay);

type WhenKey = "wx_when_today" | "wx_when_tomorrow" | "wx_when_day";
/** A day, said inside a sentence: "today", "tomorrow", "on Wednesday" ("sa
 *  Miyerkules"). For the rain warnings on Home, in the bell and on Weather. */
export function whenSaid(date: string, now: Date, say: (k: WhenKey) => string, locale: string): string {
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (date === localDate(now)) return say("wx_when_today");
  if (date === localDate(tomorrow)) return say("wx_when_tomorrow");
  const [y, m, d] = date.split("-").map(Number);
  return say("wx_when_day").replace("{day}", new Date(y, m - 1, d).toLocaleDateString(locale, { weekday: "long" }));
}
