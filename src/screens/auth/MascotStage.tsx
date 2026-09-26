import { useEffect, useRef, useState } from "react";

// ─── Mascot stage ─────────────────────────────────────────────────────────────
// The figure and speech bubble in the ink header of the language and role
// steps. The bubble is positioned against the figure, not the header, so it
// always sits beside his head whatever the phone's width or the figure's size.
//
// Decorative: the screen's title already says everything the bubble does, so
// the whole stage is hidden from screen readers.

export type Figure = {
  id: string;
  src: string;
  /** A figure that can wave: the same drawing as two layers, the body and the
   *  hand, on one canvas. The hand turns from the wrist. */
  wave?: { body: string; hand: string };
  /** A figure that talks and blinks: closed eyelids and a closed smile drawn
   *  to sit exactly over the face, switched on and off. */
  face?: { eyes: string; mouth: string };
};
export type Line = { key: string; title: string; sub?: string; emoji?: string };

export function MascotStage({ figures, active, say }: { figures: Figure[]; active: string; say: Line }) {
  // The first line waits for the figure to rise into place. After that, a new
  // line answers the tap at once; a delay there would read as lag.
  const [arrived, setArrived] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setArrived(true), 700);
    return () => clearTimeout(id);
  }, []);

  // Every new line is a new greeting, so he waves again with it: on the
  // language step when the language changes, on the role step when the
  // farmer comes back on stage. A new key remounts the hand, which restarts
  // the wave; the first one waits for him to finish rising into place.
  const [waves, setWaves] = useState(0);
  const lastKey = useRef(say.key);
  useEffect(() => {
    if (lastKey.current === say.key) return;
    lastKey.current = say.key;
    setWaves(w => w + 1);
  }, [say.key]);

  const cut = say.title.lastIndexOf(" ") + 1;
  const head = say.title.slice(0, cut);
  const last = say.title.slice(cut);

  return (
    <div className="a-rolestage" aria-hidden="true">
      <div className="a-cast" data-fig={active}>
        {/* Keyed so each new line pops in once, instead of the text silently
            swapping inside a bubble that never moved. */}
        <span className={`a-say ${arrived ? "" : "is-first"}`} key={say.key}>
          <span className="a-say-t">
            {/* The emoji is glued to the last word, so it can't wrap onto a
                line of its own. */}
            {head}
            <span className="a-say-nb">
              {last}
              {say.emoji && <span className={`a-say-emoji ${say.emoji === "👋" ? "wave" : ""}`}>{say.emoji}</span>}
            </span>
          </span>
          {say.sub && <span className="a-say-s">{say.sub}</span>}
        </span>
        {figures.map(f => f.face ? (
          <span key={f.id} className={`a-fig a-fig-layers fig-${f.id} ${f.id === active ? "on" : ""}`}>
            <img src={f.src} alt="" />
            <img className="a-fig-eyes" src={f.face.eyes} alt="" />
            {/* Remounted with every new line, so he says each one. */}
            <img key={`m${waves}`} className={`a-fig-mouth ${waves === 0 ? "is-first" : ""}`} src={f.face.mouth} alt="" />
          </span>
        ) : f.wave ? (
          <span key={f.id} className={`a-fig a-fig-layers fig-${f.id} ${f.id === active ? "on" : ""}`}>
            <img src={f.wave.body} alt="" />
            <img key={waves} className={`a-fig-hand ${waves === 0 ? "is-first" : ""}`} src={f.wave.hand} alt="" />
          </span>
        ) : (
          <img key={f.id} className={`a-fig fig-${f.id} ${f.id === active ? "on" : ""}`} src={f.src} alt="" />
        ))}
      </div>
    </div>
  );
}
