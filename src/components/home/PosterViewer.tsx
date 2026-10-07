import { useEffect, useRef, type PointerEvent as PE } from "react";
import { X } from "lucide-react";
import { Sheet } from "../ui/Sheet";
import { useRetained } from "../../hooks/usePresence";
import { useLang } from "../../i18n";
import type { Poster } from "./PosterCarousel";

// ─── A poster, seen whole ─────────────────────────────────────────────────────
// What a tap on the Home banner opens: the poster on a dark screen, uncropped
// and as wide as the phone, with the small print readable up close.
//
//   · pinch, or tap twice, to zoom in (to the spot tapped); tap twice again
//     to come back out
//   · zoomed in, one finger moves it around, never past its own edges
//   · not zoomed, pull it down to put it away, or tap beside it; the X, the
//     phone's back button and Escape close it too
//
// Gestures write the transform straight onto the image on every move,
// without a React render per frame; a let-go settles with a short ease.

const MAX = 4;
const DOUBLE = 2.5;

export function PosterViewer({ poster: asked, onClose }: { poster: Poster | null; onClose: () => void }) {
  const { t } = useLang();
  // Kept through the closing fade, so the picture doesn't vanish first.
  const poster = useRetained(asked);
  const stage = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);
  // The image's state: zoom s, and its offset (x, y) from the centre.
  const view = useRef({ s: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ s: number; x: number; y: number; d: number; mx: number; my: number; px: number; py: number; t: number } | null>(null);
  const lastTap = useRef({ t: 0, x: 0, y: 0 });
  const open = !!asked;

  // Each opening starts whole and centred.
  useEffect(() => { if (open) { view.current = { s: 1, x: 0, y: 0 }; paint(false); } }, [open, poster?.src]); // eslint-disable-line react-hooks/exhaustive-deps

  const paint = (ease: boolean, pull = 0) => {
    const el = img.current; if (!el) return;
    const { s, x, y } = view.current;
    el.style.transition = ease ? "transform 220ms var(--ease-out)" : "none";
    el.style.transform = `translate(${x}px, ${y + pull}px) scale(${s})`;
    // While it is being pulled down, the poster thins out with the distance.
    el.style.opacity = pull > 0 ? String(Math.max(.4, 1 - pull / 400)) : "";
    if (hint.current) hint.current.style.opacity = s > 1.01 || pull > 0 ? "0" : "";
  };

  // Where the centre of the image sits in the stage, and how far it may move
  // at zoom s without showing past its own edges.
  const geometry = () => {
    const st = stage.current!.getBoundingClientRect(), el = img.current!;
    return { cx: st.left + st.width / 2, cy: st.top + st.height / 2, w: el.offsetWidth, h: el.offsetHeight, sw: st.width, sh: st.height };
  };
  const clamp = () => {
    const v = view.current, g = geometry();
    const mx = Math.max(0, (g.w * v.s - g.sw) / 2), my = Math.max(0, (g.h * v.s - g.sh) / 2);
    v.x = Math.min(mx, Math.max(-mx, v.x)); v.y = Math.min(my, Math.max(-my, v.y));
    if (v.s <= 1.01) { v.s = 1; v.x = 0; v.y = 0; }
  };
  // Zoom to k, keeping the point under (px, py) where it is.
  const zoomAt = (k: number, px: number, py: number, from = view.current) => {
    const g = geometry();
    const qx = (px - g.cx - from.x) / from.s, qy = (py - g.cy - from.y) / from.s;
    view.current = { s: k, x: px - g.cx - k * qx, y: py - g.cy - k * qy };
  };

  const down = (e: PE) => {
    // Every move of this finger comes here, even off the poster. (A pointer
    // the browser has already let go of can't be captured: no matter.)
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const ps = [...pointers.current.values()], v = view.current;
    if (ps.length === 2) {
      const [a, b] = ps;
      gesture.current = { s: v.s, x: v.x, y: v.y, d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, px: 0, py: 0, t: e.timeStamp };
    } else if (ps.length === 1) {
      gesture.current = { s: v.s, x: v.x, y: v.y, d: 0, mx: 0, my: 0, px: e.clientX, py: e.clientY, t: e.timeStamp };
    }
  };

  const move = (e: PE) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const ps = [...pointers.current.values()], g0 = gesture.current;
    if (ps.length >= 2 && g0.d) {
      const [a, b] = ps;
      const k = Math.min(MAX, Math.max(1, g0.s * Math.hypot(a.x - b.x, a.y - b.y) / g0.d));
      zoomAt(k, g0.mx, g0.my, { s: g0.s, x: g0.x, y: g0.y });
      // and follow the fingers as they move together
      view.current.x += (a.x + b.x) / 2 - g0.mx; view.current.y += (a.y + b.y) / 2 - g0.my;
      paint(false);
    } else if (ps.length === 1 && !g0.d) {
      const dx = e.clientX - g0.px, dy = e.clientY - g0.py;
      if (g0.s > 1) { view.current.x = g0.x + dx; view.current.y = g0.y + dy; paint(false); }
      else paint(false, Math.max(0, dy));
    }
  };

  const up = (e: PE) => {
    const g0 = gesture.current, start = pointers.current.size;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) {
      // One finger left of a pinch: carry on from here as a drag.
      const [p] = [...pointers.current.values()], v = view.current;
      gesture.current = { s: v.s, x: v.x, y: v.y, d: 0, mx: 0, my: 0, px: p.x, py: p.y, t: e.timeStamp };
      return;
    }
    gesture.current = null;
    if (!g0) return;
    const dx = e.clientX - g0.px, dy = e.clientY - g0.py, dt = e.timeStamp - g0.t;
    const tap = start === 1 && !g0.d && Math.hypot(dx, dy) < 10 && dt < 300;

    // Pulled down far enough, or flicked down: put away.
    if (start === 1 && !g0.d && g0.s <= 1 && (dy > 110 || (dy > 40 && dy / Math.max(dt, 1) > .6))) { onClose(); return; }

    if (tap) {
      const prev = lastTap.current;
      const twice = e.timeStamp - prev.t < 320 && Math.hypot(e.clientX - prev.x, e.clientY - prev.y) < 30;
      lastTap.current = { t: twice ? 0 : e.timeStamp, x: e.clientX, y: e.clientY };
      if (twice) {
        if (view.current.s > 1) view.current = { s: 1, x: 0, y: 0 };
        else zoomAt(DOUBLE, e.clientX, e.clientY);
        clamp(); paint(true);
        return;
      }
      // A single tap beside the poster, not zoomed in, puts it away; held a
      // moment first, so it isn't the first half of a double tap.
      const r = img.current!.getBoundingClientRect();
      const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (outside && view.current.s <= 1) {
        const at = e.timeStamp;
        window.setTimeout(() => { if (lastTap.current.t === at) onClose(); }, 330);
      }
    }
    clamp(); paint(true);
  };

  return (
    <Sheet open={open} onClose={onClose} variant="center" className="pv" label={poster?.alt ?? ""}>
      <button type="button" className="pv-x" onClick={onClose} aria-label={t("close")}>
        <X size={24} strokeWidth={2.4} />
      </button>
      <div className="pv-stage" ref={stage}
        onPointerDown={down} onPointerMove={move} onPointerUp={up}
        onPointerCancel={e => { pointers.current.delete(e.pointerId); gesture.current = null; clamp(); paint(true); }}>
        {poster && <img ref={img} className="pv-img" src={poster.src} alt={poster.alt} width={poster.width} height={poster.height} draggable={false} />}
      </div>
      <p className="pv-hint" ref={hint}>{t("pv_hint")}</p>
    </Sheet>
  );
}
