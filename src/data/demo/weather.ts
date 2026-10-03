// ─── Weather (sample data) ────────────────────────────────────────────────────
// Nueva Ecija, where the farms are. Sample figures until a forecast service
// is connected; every screen reads them from here.

import { WxIcon } from "../../types";

export const WEATHER_NOW = {
  icon: "PartlyCloudy" as WxIcon,
  temp: 28,
  feels: 32,
  high: 30,
  low: 24,
  humidity: 72,
  /** km/h */
  wind: 14,
  /** % chance of rain today */
  rain: 35,
  uv: 8,
};

/** The next eight hours from now, in order. `rain` is the % chance. */
export const WEATHER_HOURLY: { icon: WxIcon; temp: number; rain: number }[] = [
  { icon: "PartlyCloudy", temp: 28, rain: 10 },
  { icon: "PartlyCloudy", temp: 29, rain: 10 },
  { icon: "Sunny",        temp: 30, rain: 5 },
  { icon: "Cloudy",       temp: 29, rain: 20 },
  { icon: "LightRain",    temp: 27, rain: 55 },
  { icon: "LightRain",    temp: 26, rain: 60 },
  { icon: "Cloudy",       temp: 26, rain: 30 },
  { icon: "PartlyCloudy", temp: 25, rain: 15 },
];

export const WEATHER_FORECAST: { day: string; icon: WxIcon; high: number; low: number; rain: number }[] = [
  { day: "Mon", icon: "PartlyCloudy", high: 30, low: 24, rain: 20 },
  { day: "Tue", icon: "Sunny",        high: 31, low: 25, rain: 5 },
  { day: "Wed", icon: "Rainy",        high: 27, low: 22, rain: 80 },
  { day: "Thu", icon: "Stormy",       high: 25, low: 21, rain: 90 },
  { day: "Fri", icon: "LightRain",    high: 28, low: 23, rain: 50 },
];
