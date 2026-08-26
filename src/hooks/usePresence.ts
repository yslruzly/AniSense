import { useEffect, useRef, useState } from "react";

// ─── usePresence ──────────────────────────────────────────────────────────────
// React unmounts on the same tick the flag flips, so anything rendered behind
// `{open && ...}` can animate in but never out — it is simply gone. Every sheet
// in this app had that shape, which is why they all hard-cut on close while the
// open was (in theory) animated.
//
// This keeps the node mounted for the length of its exit, and hands back two
// separate booleans:
//
//   mounted  should the node be in the tree at all
//   visible  should it be in its open state (drives [data-open])
//
// The gap between the two is the whole trick. On open we mount first with
// visible=false so the browser has a start value to transition FROM, then flip
// on the next frame. Two frames, not one: a single rAF still lands inside the
// same style recalculation in Chrome and the transition is skipped.
//
// On close we flip visible immediately and unmount after the exit has run.
export function usePresence(open: boolean, exitMs = 240) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setVisible(true));
      });
      return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner); };
    }

    setVisible(false);
    // Interruptible by construction: reopening before this fires cancels the
    // timeout, so a fast close-then-open retargets from wherever the sheet
    // currently sits instead of snapping to the bottom and replaying.
    const t = window.setTimeout(() => setMounted(false), exitMs);
    return () => window.clearTimeout(t);
  }, [open, exitMs]);

  return { mounted, visible };
}

// ─── useRetained ──────────────────────────────────────────────────────────────
// The companion to the above for sheets whose open-ness IS their data — a
// seller card driven by `sellerDetail`, a confirmation driven by the id being
// deleted. Clearing that state to close the sheet also empties it, so the
// panel would animate out blank. This hands back the last non-empty value, so
// the content stays put for the length of the exit.
export function useRetained<T>(value: T | null | undefined): T | null {
  const ref = useRef<T | null>(null);
  if (value != null) ref.current = value;
  return ref.current;
}
