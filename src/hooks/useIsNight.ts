import { useEffect, useState } from "react";

// Day runs 6:00 AM to 4:59 PM; from 5:00 PM it's night. Shared by the Weather
// hero and the Home hero so both photos turn over at the same moment.
// Re-checked every minute, so a screen left open at 4:59 still turns over on
// time instead of waiting for the next visit.
export const DAY_START = 6;
export const NIGHT_START = 17;

export function useIsNight() {
  const check = () => { const h = new Date().getHours(); return h >= NIGHT_START || h < DAY_START; };
  const [night, setNight] = useState(check);
  useEffect(() => {
    const id = window.setInterval(() => setNight(check()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return night;
}
