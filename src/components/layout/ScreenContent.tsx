import { ReactNode, useLayoutEffect } from "react";
import { useLang } from "../../i18n";

export function ScreenLoading() {
  const { lang } = useLang();
  return (
    <div className="screen" role="status" aria-busy="true"
      style={{ flex: 1, display: "grid", placeItems: "center", color: "var(--ink)", padding: 24 }}>
      {lang === "tl" ? "Sandali lang…" : "Loading…"}
    </div>
  );
}

// Inside Suspense so restoration waits for the actual page to mount. A
// fragment preserves the shell's direct-child layout and screen transitions.
export function ScreenContent({ children, scrollTop }: { children: ReactNode; scrollTop: number }) {
  useLayoutEffect(() => {
    const el = document.querySelector<HTMLElement>(".shell > .screen .scroll");
    if (!el || !scrollTop) return;
    el.scrollTop = scrollTop;
    const id = requestAnimationFrame(() => {
      if (Math.abs(el.scrollTop - scrollTop) > 1) el.scrollTop = scrollTop;
    });
    return () => cancelAnimationFrame(id);
  }, [scrollTop]);
  return <>{children}</>;
}
