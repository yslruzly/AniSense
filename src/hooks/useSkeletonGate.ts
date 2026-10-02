import { useEffect, useRef, useState } from "react";

// ─── useSkeletonGate ──────────────────────────────────────────────────────────
// Turns a plain "is it loading?" into what a screen should draw while it
// waits, by the same two timing rules as useResource:
//
//   · Nothing for the first 200ms. A load that finishes inside a blink should
//     not flash a skeleton on and off.
//   · Once a skeleton is on screen, it stays at least 400ms, so one that lands
//     at 210ms does not flicker.
//
//   "quiet"     loading, but too early to show anything: draw no list at all,
//               and never the "nothing here yet" message, which would be false
//   "skeleton"  the wait is long enough to be worth showing
//   "ready"     the data is in: draw it, or the empty state if there is none

export type LoadPhase = "ready" | "quiet" | "skeleton";

const SKELETON_DELAY = 200;
const SKELETON_MIN = 400;

export function useSkeletonGate(loading: boolean): LoadPhase {
  const [phase, setPhase] = useState<LoadPhase>(loading ? "quiet" : "ready");
  // When the skeleton went on screen; 0 while it is not showing.
  const shownAt = useRef(0);

  useEffect(() => {
    if (loading) {
      setPhase(p => (p === "skeleton" ? p : "quiet"));
      const id = window.setTimeout(() => {
        if (!shownAt.current) shownAt.current = Date.now();
        setPhase("skeleton");
      }, SKELETON_DELAY);
      return () => window.clearTimeout(id);
    }
    const done = () => { shownAt.current = 0; setPhase("ready"); };
    const left = shownAt.current ? SKELETON_MIN - (Date.now() - shownAt.current) : 0;
    if (left <= 0) { done(); return; }
    const id = window.setTimeout(done, left);
    return () => window.clearTimeout(id);
  }, [loading]);

  return phase;
}
