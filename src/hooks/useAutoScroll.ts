import { useEffect, useRef, type RefObject } from "react";

// ─── A row that slides on its own ─────────────────────────────────────────────
// For a sideways row whose cards are drawn twice, one set after the other: it
// moves its own scroll position right to left at an even pace (constant
// motion, so no easing), and on reaching the second set it steps back by
// exactly one set, which looks the same, so it runs on without end. Because
// it moves the row's own scroll, a finger can still swipe it either way.
//
// It never fights the user, and costs nothing when it can't be seen:
//   · a touch, a press, the wheel or keyboard focus stops it; it starts
//     again a moment after the hand has gone (resumeMs)
//   · off screen (IntersectionObserver) or with the app in the background it
//     sleeps: no frames at all until it can be seen again, and the row is
//     marked data-asleep, so CSS can rest anything else moving in it
//   · with reduced motion it doesn't move by itself at all
//
// `pxPerSecond` is slow on purpose: a card passes in about nine seconds, time
// enough to read a name. It works in whole frames of real time, so it keeps
// the same speed on a 60 Hz and a 120 Hz screen.

export function useAutoScroll(row: RefObject<HTMLElement | null>, { enabled = true, pxPerSecond = 28, resumeMs = 2500 } = {}) {
  const held = useRef(false);

  useEffect(() => {
    const el = row.current;
    if (!el || !enabled) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    // The width of one set: where the second set's first card starts.
    const setWidth = () => {
      const kids = Array.from(el.children) as HTMLElement[];
      const half = kids.length / 2;
      return half >= 1 && Number.isInteger(half) ? kids[half].offsetLeft - kids[0].offsetLeft : 0;
    };
    // One set has to be wider than the row, or there is nothing to slide.
    if (setWidth() <= el.clientWidth) return;

    let pos = el.scrollLeft, last = 0, frame = 0, onScreen = true, resumeAt = 0;
    const wrap = () => {
      const w = setWidth();
      if (w <= 0) return;
      if (pos >= w) pos -= w;
      else if (pos < 0) pos += w;
    };

    const tick = (now: number) => {
      frame = 0;
      if (!onScreen || document.hidden) return;
      frame = requestAnimationFrame(tick);
      const dt = last ? Math.min(now - last, 64) : 0;
      last = now;
      if (held.current || now < resumeAt) { pos = el.scrollLeft; return; }
      pos += (pxPerSecond * dt) / 1000;
      wrap();
      el.scrollLeft = pos;
    };
    // Wakes it, from wherever the row now is.
    const run = () => { if (frame || !onScreen || document.hidden) return; last = 0; pos = el.scrollLeft; frame = requestAnimationFrame(tick); };
    run();

    // Hands on: stop. Hands off: carry on from wherever the finger left it.
    const hold = () => { held.current = true; };
    // (A finger lifted anywhere else on the page is none of its business.)
    const letGo = () => { if (!held.current) return; held.current = false; resumeAt = performance.now() + resumeMs; pos = el.scrollLeft; };
    // A swipe that passes either end steps a set back or forward too.
    const onScroll = () => {
      if (!held.current) return;
      const w = setWidth();
      if (w > 0 && el.scrollLeft >= w + 1) el.scrollLeft -= w;
      else if (w > 0 && el.scrollLeft <= 0) el.scrollLeft += w;
    };
    const onFocusIn = () => { held.current = true; };
    const onFocusOut = (e: FocusEvent) => { if (!el.contains(e.relatedTarget as Node | null)) letGo(); };
    const onWheel = () => { resumeAt = performance.now() + resumeMs; };

    el.addEventListener("pointerdown", hold);
    el.addEventListener("touchstart", hold, { passive: true });
    window.addEventListener("pointerup", letGo);
    window.addEventListener("pointercancel", letGo);
    el.addEventListener("touchend", letGo);
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    const seen = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; el.toggleAttribute("data-asleep", !onScreen); run(); }, { threshold: 0.1 });
    seen.observe(el);
    document.addEventListener("visibilitychange", run);

    return () => {
      cancelAnimationFrame(frame);
      seen.disconnect();
      el.removeAttribute("data-asleep");
      document.removeEventListener("visibilitychange", run);
      el.removeEventListener("pointerdown", hold);
      el.removeEventListener("touchstart", hold);
      window.removeEventListener("pointerup", letGo);
      window.removeEventListener("pointercancel", letGo);
      el.removeEventListener("touchend", letGo);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
    };
  }, [row, enabled, pxPerSecond, resumeMs]);
}
