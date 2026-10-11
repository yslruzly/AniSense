import { ReactNode, useEffect, useRef, useState } from "react";
import { useLang } from "../../i18n";
import { PosterViewer } from "./PosterViewer";

// ─── The banner at the top of Home ────────────────────────────────────────────
// AniSense's posters, one at a time, turning over on their own every few
// seconds with a cross-fade. Small dots on the poster say how many there are
// and which one is showing; tapping a dot, or a swipe across the poster,
// turns to another. A tap on the poster itself shows it whole and large
// (PosterViewer). It holds still while a finger rests on it, while one is
// open large, and while the app is in the background, so nobody returns to
// find it moved on.
//
// The farmer's banner opens on a card of its own before the posters
// (`lead`): their good morning, the date and the weather. It turns with the
// posters, and what is in it (the weather button) works as usual; while it
// is not the one showing, it can't be tapped, reached with Tab or read out.
//
// Posters of another shape are cropped to the frame (2:1), placed by
// `position` so their words stay in.

export type Poster = { src: string; alt: string; width: number; height: number; position?: string };

/** Long enough to read a poster's line or two, at the pace of the app's audience. */
const EVERY = 6000;

export function PosterCarousel({ posters, lead }: {
  posters: Poster[];
  /** A card shown first, before the posters, with what its dot is called. */
  lead?: { node: ReactNode; label: string };
}) {
  const { t } = useLang();
  const first = lead ? 1 : 0;                 // where the posters start
  const n = posters.length + first;
  const [at, setAt] = useState(0);
  const [held, setHeld] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null);
  const [away, setAway] = useState(() => typeof document !== "undefined" && document.visibilityState === "hidden");
  const startX = useRef<number | null>(null);
  // A finger that travelled was a swipe, not a tap: the click that may
  // follow it opens nothing.
  const moved = useRef(false);
  const go = (i: number) => setAt(((i % n) + n) % n);
  const onLead = !!lead && at === 0;
  const poster = onLead ? null : posters[at - first];

  useEffect(() => {
    const on = () => setAway(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  // The next one after a full turn on screen. Any change of slide (by the
  // clock, a dot or a swipe) starts the count again.
  useEffect(() => {
    if (n < 2 || held || away || viewing !== null) return;
    const id = window.setTimeout(() => setAt(a => (a + 1) % n), EVERY);
    return () => window.clearTimeout(id);
  }, [at, held, away, viewing, n]);

  return (<>
    <section className={`hm-banner${lead ? " has-lead" : ""}`} aria-roledescription="carousel" aria-label={t("home_posters")}
      onPointerDown={e => { startX.current = e.clientX; moved.current = false; setHeld(true); }}
      onPointerUp={e => {
        const dx = startX.current === null ? 0 : e.clientX - startX.current;
        startX.current = null; setHeld(false);
        if (Math.abs(dx) > 10) moved.current = true;
        if (Math.abs(dx) > 40) go(at + (dx < 0 ? 1 : -1));
      }}
      onPointerCancel={() => { startX.current = null; setHeld(false); }}
      onPointerLeave={() => { startX.current = null; setHeld(false); }}>
      {/* The posters are one button: it says what is showing and that a
          tap shows it whole. The dots sit above it and keep their own taps.
          While the lead card shows, the button stands aside for it. */}
      <button type="button" className="hm-banner-hit" onClick={() => { if (!moved.current && poster) setViewing(at - first); }}
        aria-label={poster ? `${poster.alt} ${t("home_poster_view")}` : undefined} aria-hidden={onLead || undefined}
        tabIndex={onLead ? -1 : undefined}>
        {posters.map((p, i) => (
          <img key={p.src} src={p.src} alt={p.alt} width={p.width} height={p.height} decoding="async" draggable={false}
            className={`hm-banner-slide${i + first === at ? " on" : ""}`} aria-hidden={i + first !== at}
            style={p.position ? { objectPosition: p.position } : undefined} />
        ))}
      </button>
      {lead && (
        <div className={`hm-banner-lead${onLead ? " on" : ""}`} aria-hidden={!onLead || undefined}
          {...(onLead ? {} : { inert: "" })}>
          {lead.node}
        </div>
      )}
      {n > 1 && (
        <div className="hm-banner-dots">
          {Array.from({ length: n }, (_, i) => (
            <button key={i} type="button" className={`hm-banner-dot${i === at ? " on" : ""}`}
              aria-label={lead && i === 0 ? lead.label : t("home_poster_n").replace("{n}", String(i - first + 1)).replace("{total}", String(posters.length))}
              aria-current={i === at ? "true" : undefined} onClick={() => go(i)} />
          ))}
        </div>
      )}
    </section>
    {/* Outside the banner, so its gestures never reach the banner's own. */}
    <PosterViewer poster={viewing === null ? null : posters[viewing]} onClose={() => setViewing(null)} />
  </>);
}
