import { useEffect, useState, type RefObject } from "react";
import { ArrowUp } from "lucide-react";
import { useLang } from "../../i18n";
import { haptic } from "../../lib/platform";

// ─── Back to top ──────────────────────────────────────────────────────────────
// A round button with an arrow up, centred above the tab bar. It shows once
// the page has been scrolled down about a screen, when the way back up has
// become a long thumb-swipe, and a tap glides the page back to the top. Near
// the top it isn't there at all, so it never sits over the first things on
// a screen.

export function BackToTop({ scroller }: { scroller: RefObject<HTMLElement | null> }) {
  const { t } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    // Checked once a frame at most, however fast the scroll events come.
    let frame = 0;
    const check = () => { frame = 0; setShow(el.scrollTop > el.clientHeight); };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(check); };
    el.addEventListener("scroll", onScroll, { passive: true });
    check();
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, [scroller]);

  const up = () => {
    const el = scroller.current;
    if (!el) return;
    haptic.select();
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
    // The button goes as the page reaches the top; the focus goes with the
    // page, to its top, rather than staying on a button that has gone.
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };

  return (
    <button type="button" className="to-top" data-show={show} onClick={up}
      aria-label={t("to_top")} aria-hidden={!show} tabIndex={show ? 0 : -1}>
      <ArrowUp size={24} strokeWidth={2.6} aria-hidden="true" />
    </button>
  );
}
