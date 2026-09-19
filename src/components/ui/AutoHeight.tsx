import React, { useLayoutEffect, useRef, useState } from "react";

// ─── AutoHeight ───────────────────────────────────────────────────────────────
// A box whose height follows its content with a transition, so swapping what's
// inside (a card for a one-line strip, a strip for nothing) resizes smoothly
// instead of making everything below it jump.
//
// It measures the content with a ResizeObserver and writes that as an explicit
// height; CSS animates between the two numbers. The first measurement lands
// without animating, because "auto" isn't interpolable.
export function AutoHeight({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const inner = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    setH(el.offsetHeight);
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={`autoh ${className}`} style={{ height: h }}>
      <div ref={inner} className="autoh-in">{children}</div>
    </div>
  );
}
