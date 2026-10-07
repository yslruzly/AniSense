import { useEffect, useRef, useState } from "react";
import { useLang } from "../../i18n";

// ─── The buyer's banner, under the search bar ─────────────────────────────────
// AniSense's posters, one at a time, turning over on their own every few
// seconds with a cross-fade. Small dots on the poster say how many there are
// and which one is showing; tapping a dot, or a swipe across the poster,
// turns to another. It holds still while a finger rests on it, and while the
// app is in the background, so nobody returns to find it moved on.
//
// Posters of another shape are cropped to the frame (2:1), placed by
// `position` so their words stay in.

export type Poster = { src: string; alt: string; width: number; height: number; position?: string };

/** Long enough to read a poster's line or two, at the pace of the app's audience. */
const EVERY = 6000;

export function PosterCarousel({ posters }: { posters: Poster[] }) {
  const { t } = useLang();
  const n = posters.length;
  const [at, setAt] = useState(0);
  const [held, setHeld] = useState(false);
  const [away, setAway] = useState(() => typeof document !== "undefined" && document.visibilityState === "hidden");
  const startX = useRef<number | null>(null);
  const go = (i: number) => setAt(((i % n) + n) % n);

  useEffect(() => {
    const on = () => setAway(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  // The next one after a full turn on screen. Any change of poster (by the
  // clock, a dot or a swipe) starts the count again.
  useEffect(() => {
    if (n < 2 || held || away) return;
    const id = window.setTimeout(() => setAt(a => (a + 1) % n), EVERY);
    return () => window.clearTimeout(id);
  }, [at, held, away, n]);

  return (
    <section className="hm-banner" aria-roledescription="carousel" aria-label={t("home_posters")}
      onPointerDown={e => { startX.current = e.clientX; setHeld(true); }}
      onPointerUp={e => {
        const dx = startX.current === null ? 0 : e.clientX - startX.current;
        startX.current = null; setHeld(false);
        if (Math.abs(dx) > 40) go(at + (dx < 0 ? 1 : -1));
      }}
      onPointerCancel={() => { startX.current = null; setHeld(false); }}
      onPointerLeave={() => { startX.current = null; setHeld(false); }}>
      {posters.map((p, i) => (
        <img key={p.src} src={p.src} alt={p.alt} width={p.width} height={p.height} decoding="async" draggable={false}
          className={`hm-banner-slide${i === at ? " on" : ""}`} aria-hidden={i !== at}
          style={p.position ? { objectPosition: p.position } : undefined} />
      ))}
      {n > 1 && (
        <div className="hm-banner-dots">
          {posters.map((p, i) => (
            <button key={p.src} type="button" className={`hm-banner-dot${i === at ? " on" : ""}`}
              aria-label={t("home_poster_n").replace("{n}", String(i + 1)).replace("{total}", String(n))}
              aria-current={i === at ? "true" : undefined} onClick={() => go(i)} />
          ))}
        </div>
      )}
    </section>
  );
}
