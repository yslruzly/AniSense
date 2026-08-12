import { useState, useEffect } from "react";

// ─── Offline Hook ─────────────────────────────────────────────────────────────
export function useOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    return localStorage.getItem("lastUpdated") || new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
  });

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => {
      setIsOffline(false);
      const now = new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
      setLastUpdated(now);
      localStorage.setItem("lastUpdated", now);
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    // Simulate data refresh every 5 mins when online
    const interval = setInterval(() => {
      if (navigator.onLine) {
        const now = new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
        setLastUpdated(now);
        localStorage.setItem("lastUpdated", now);
      }
    }, 300000);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
      clearInterval(interval);
    };
  }, []);

  return { isOffline, lastUpdated };
}
