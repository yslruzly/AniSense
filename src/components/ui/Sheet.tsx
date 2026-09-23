import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePresence } from "../../hooks/usePresence";
import { useHardwareBack } from "../../hooks/useHardwareBack";

// ─── Sheet ────────────────────────────────────────────────────────────────────
// One dialog primitive for every overlay in the app: the alerts sheet, the
// cart, the seller card, the post-a-listing form, the delete confirmation and
// the order-placed toastless confirmation were five hand-rolled overlays that
// each appeared and vanished on a single frame.
//
// What it adds over `{open && <div>}`:
//   · a real exit, via usePresence
//   · Escape and Android back close it, topmost first, before either reaches
//     the screen underneath (back used to walk you home from inside the cart)
//   · focus moves into the panel on open and returns to the trigger on close
//   · role/aria-modal, so a screen reader treats it as a dialog and not as
//     more page content
//
// Visual styling stays where it already lives: pass the sheet's own class and
// this only contributes motion, layout and behaviour.

type Variant = "bottom" | "center";

export function Sheet({
  open, onClose, children, className = "", label,
  variant = "bottom", dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** The sheet's own look — .cart-sheet, .alerts-sheet, and so on. */
  className?: string;
  label: string;
  variant?: Variant;
  /** A confirmation that must be answered can opt out of tap-outside. */
  dismissible?: boolean;
}) {
  // Exit is deliberately shorter than entry. Opening is the system presenting
  // something and can afford to be unhurried; closing is a decision the user
  // has already made, and every millisecond after it is dead time.
  const exitMs = variant === "center" ? 180 : 240;
  const { mounted, visible } = usePresence(open, exitMs);
  const [host, setHost] = useState<Element | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  // Android back closes the topmost sheet. Registered only while open, so the
  // handler stack stays honest about what is actually on screen.
  useHardwareBack(() => { if (!open) return false; onClose(); return true; }, open);

  // Held in a ref, and deliberately NOT a dependency below. Callers pass an
  // inline arrow (onClose={() => setOpen(false)}), which is a new function on
  // every render, so listing it re-ran this effect on every keystroke: focus
  // jumped from the field back to the panel and typing a word took one tap
  // per letter.
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      // Returning focus to the trigger is what stops the next Tab starting
      // over at the top of the page after a sheet closes.
      restoreRef.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  // Sheets render into the shell, not where they were written: one declared
  // inside a scrolling card would otherwise be clipped by it and slide up
  // *behind* the floating tab bar.
  //
  // Looked up after mounting, never during render. The shell can be built in
  // the same commit as the sheet — finishing signup creates the app screen
  // and opens the welcome ID together — and a lookup during that render finds
  // no shell yet, so the sheet would vanish until some later render happened
  // to run. A layout effect runs before paint, so nothing flickers.
  useLayoutEffect(() => {
    if (!mounted) return;
    setHost(document.querySelector(".shell") ?? document.querySelector(".auth-shell") ?? document.body);
  }, [mounted]);

  if (!mounted || !host) return null;

  return createPortal(
    <div
      className={`shm-scrim shm-${variant}`}
      data-open={visible}
      onClick={dismissible ? onClose : undefined}
    >
      <div
        ref={panelRef}
        className={`shm-panel ${className}`}
        data-open={visible}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    host,
  );
}
