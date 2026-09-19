import { useEffect, useState } from "react";

// ─── Mascot stage ─────────────────────────────────────────────────────────────
// The figure and speech bubble in the ink header of the language and role
// steps. The bubble is positioned against the figure, not the header, so it
// always sits beside his head whatever the phone's width or the figure's size.
//
// Decorative: the screen's title already says everything the bubble does, so
// the whole stage is hidden from screen readers.

export type Figure = { id: string; src: string };
export type Line = { key: string; title: string; sub?: string; emoji?: string };

export function MascotStage({ figures, active, say }: { figures: Figure[]; active: string; say: Line }) {
  // The first line waits for the figure to rise into place. After that, a new
  // line answers the tap at once; a delay there would read as lag.
  const [arrived, setArrived] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setArrived(true), 700);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="a-rolestage" aria-hidden="true">
      <div className="a-cast" data-fig={active}>
        {/* Keyed so each new line pops in once, instead of the text silently
            swapping inside a bubble that never moved. */}
        <span className={`a-say ${arrived ? "" : "is-first"}`} key={say.key}>
          <span className="a-say-t">
            {say.title}
            {say.emoji && <span className={`a-say-emoji ${say.emoji === "👋" ? "wave" : ""}`}>{say.emoji}</span>}
          </span>
          {say.sub && <span className="a-say-s">{say.sub}</span>}
        </span>
        {figures.map(f => (
          <img key={f.id} className={`a-fig fig-${f.id} ${f.id === active ? "on" : ""}`} src={f.src} alt="" />
        ))}
      </div>
    </div>
  );
}
