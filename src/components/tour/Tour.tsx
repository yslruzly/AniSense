import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { AniSenseLogo } from "../AniSenseLogo";
import mascotBody from "../../assets/mascot-wave-body.webp";
import mascotHand from "../../assets/mascot-wave-hand.webp";
import mascotEyes from "../../assets/mascot-wave-eyes.webp";
import mascotMouth from "../../assets/mascot-wave-mouth.webp";
import mascotThumbs from "../../assets/mascot-thumbs.webp";
import mascotThumbsEyes from "../../assets/mascot-thumbs-eyes.webp";
import { useLang } from "../../i18n";
import { haptic } from "../../lib/platform";
import { useHardwareBack } from "../../hooks/useHardwareBack";
import { usePresence } from "../../hooks/usePresence";

// ─── Guided tour ──────────────────────────────────────────────────────────────
// The first minute of a farmer's first launch. The screen dims, one real
// thing on Home is lit, and a card under it says what that thing is for.
//
// It points at the app itself rather than at drawings of it: every step
// resolves a live element by `data-tour`, scrolls it to the middle of the
// screen and measures where it landed. So the tour cannot drift out of date
// as the page changes, and a farmer is looking at the button they will press
// a moment later, in the place they will press it.
//
// The hole is a plain div with an enormous shadow spread — no SVG mask, no
// clip-path — which works in every WebView an old phone might carry. It also
// means moving between steps is a transition on top/left/width/height: the
// light glides to the next card, so the eye follows instead of re-finding it.

type Step = {
  id: string;
  /** Live selectors to light up. The hole is the union of their rectangles.
   *  Absent → a plain card in the middle, for the opening and the closing. */
  targets?: string[];
};

// Two scripts, one engine. Each stays on one screen, Home: a tour that
// changes tabs underneath the person taking it is a tour they cannot retrace
// afterwards.
//
// The farmer's is about selling and the season; the buyer's about finding,
// judging a price, and buying again.
const FARMER_STEPS: Step[] = [
  { id: "intro" },
  { id: "harvest", targets: ['[data-tour="harvest"]'] },
  { id: "prices", targets: ['[data-tour="prices"]'] },
  // The marketplace's best, which a farmer's Home now shows under their own
  // prices: the same section the buyer's tour points at.
  { id: "featured", targets: ['[data-tour="b-featured"]'] },
  // The heading and the card under it: one light over the pair, because the
  // heading alone explains nothing and the card alone looks unannounced.
  { id: "forecast", targets: ['[data-tour="forecast"]', ".adv-card"] },
  { id: "tracker", targets: ['[data-tour="tracker"]'] },
  { id: "alerts", targets: ['[data-tour="alerts"]'] },
  { id: "profit", targets: ['[data-tour="profit"]'] },
  { id: "tools", targets: ['[data-tour="tools"]'] },
  { id: "nav", targets: ['[data-tour="nav"]'] },
  { id: "done" },
];

const BUYER_STEPS: Step[] = [
  { id: "b_intro" },
  { id: "b_search", targets: ['[data-tour="b-search"]'] },
  { id: "b_crops", targets: ['[data-tour="b-crops"]'] },
  { id: "b_featured", targets: ['[data-tour="b-featured"]'] },
  { id: "b_moves", targets: ['[data-tour="b-moves"]'] },
  { id: "b_farmers", targets: ['[data-tour="b-farmers"]'] },
  { id: "b_purchases", targets: ['[data-tour="b-purchases"]'] },
  // Back up to the header for the bell. The light travels up the page the
  // same way it came down, so the farmer never loses track of where it is.
  { id: "b_bell", targets: ['[data-tour="bell"]'] },
  { id: "b_nav", targets: ['[data-tour="nav"]'] },
  { id: "b_done" },
];

type Box = { top: number; left: number; width: number; height: number };

const PAD = 8;          // breathing room around the lit element
const GAP = 14;         // between the hole and the card
const EDGE = 12;        // the card never touches the screen edge
const near = (a: number, b: number) => Math.abs(a - b) < 0.5;
// The mascot on the opening card: how much of it stands above the card's top
// edge. The rest - where the drawing is cut off at the waist - is tucked
// behind the card, so he reads as leaning over it rather than floating.
const MASCOT_ROOM = 134;

/** The union of the targets' rectangles, in the shell's own coordinates. */
function measure(targets: string[] | undefined, host: DOMRect): Box | null {
  if (!targets?.length) return null;
  let top = Infinity, left = Infinity, right = -Infinity, bottom = -Infinity;
  for (const sel of targets) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    top = Math.min(top, r.top); left = Math.min(left, r.left);
    right = Math.max(right, r.right); bottom = Math.max(bottom, r.bottom);
  }
  if (top === Infinity) return null;
  return {
    top: top - host.top - PAD,
    left: left - host.left - PAD,
    width: right - left + PAD * 2,
    height: bottom - top + PAD * 2,
  };
}

export function Tour({ open, onFinish, role }: { open: boolean; onFinish: () => void; role: "farmer" | "buyer" | null }) {
  const { t } = useLang();
  const STEPS = role === "buyer" ? BUYER_STEPS : FARMER_STEPS;
  const [i, setI] = useState(0);
  // Mounted for the length of its exit, so the tour fades out instead of
  // being deleted from under the last thing the farmer read.
  const { mounted, visible } = usePresence(open, 160);
  const host = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [cardH, setCardH] = useState(200);
  const [shellH, setShellH] = useState(844);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  const opening = i === 0;
  // The mascot bookends the tour: hello on the first card, a thumbs-up on
  // the last. The cards in between belong to the screen they point at.
  const withMascot = opening || last;
  // Bumped to wave again: a new key remounts the hand, which restarts it.
  const [waves, setWaves] = useState(0);

  // Every run starts at the beginning, including a replay from the guide.
  useEffect(() => { if (open) setI(0); }, [open]);

  // Where the light goes, and when. Scroll events are what drive it: while
  // the page glides to the next card the container reports every frame of it,
  // so the hole arrives with the card rather than after it. The timers cover
  // what scrolling does not — a photo that loads late and pushes the page
  // down, a card that grows when its content arrives.
  const place = React.useCallback(() => {
    const h = host.current?.getBoundingClientRect();
    if (!h) return;
    setShellH(prev => (near(prev, h.height) ? prev : h.height));
    const next = measure(step.targets, h);
    // A step whose element has gone missing keeps the last light rather than
    // dropping the farmer into a dark screen; the fallback below handles the
    // case where it never turns up at all.
    if (!next) return;
    setBox(prev => (
      prev && near(prev.top, next.top) && near(prev.left, next.left)
        && near(prev.width, next.width) && near(prev.height, next.height) ? prev : next
    ));
  }, [step.targets]);

  useEffect(() => {
    if (!open) return;
    const sel = step.targets?.[0];
    if (!sel) { setBox(null); return; }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = document.querySelector(sel);
    // Middle of the screen for most cards. A tall one — the price chart, the
    // profit card — goes to the top instead, or it fills the middle and the
    // caption has nowhere to sit but on top of the thing it describes.
    const tall = el ? el.getBoundingClientRect().height > (host.current?.offsetHeight ?? 844) * 0.42 : false;
    el?.scrollIntoView({ block: tall ? "start" : "center", behavior: reduce ? "auto" : "smooth" });

    const scroller = el?.closest(".scroll");
    scroller?.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    const ro = el ? new ResizeObserver(place) : null;
    if (el) ro?.observe(el);
    // Through the scroll and a little past it, then one last look: if the
    // step's element is nowhere, the card drops to the middle of a plain
    // dimmed screen instead of lighting the wrong thing.
    const ids = [0, 60, 140, 260, 400, 560, 760, 1000].map(ms => window.setTimeout(place, ms));
    ids.push(window.setTimeout(() => { if (!document.querySelector(sel)) setBox(null); }, 1100));

    return () => {
      ids.forEach(clearTimeout);
      scroller?.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
      ro?.disconnect();
    };
  }, [open, i, step.targets, place]);

  // The card is measured, not guessed: the copy is two lines in English and
  // often three in Filipino, and the difference decides which side it sits on.
  useLayoutEffect(() => {
    if (open && card.current) setCardH(card.current.offsetHeight);
  }, [open, i, box]);

  // Leaving hands the page back the way it was found. The tour scrolls Home
  // to its foot; without this, a farmer's first act in the app would be to
  // scroll back up from a page they never scrolled down.
  const end = () => {
    haptic.select();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector(".scroll")?.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    onFinish();
  };
  const go = (n: number) => {
    haptic.select();
    if (n < 0) { onFinish(); return; }
    if (n >= STEPS.length) { onFinish(); return; }
    setI(n);
  };

  // Back steps back rather than leaving: the phone's own gesture should undo
  // the last thing that happened, which here is a step, not the whole tour.
  useHardwareBack(() => { if (i > 0) { setI(i - 1); } else { onFinish(); } return true; }, open);

  if (!mounted) return null;

  // Under the hole if it fits, over it if not, and pinned to the bottom when
  // the lit thing is too tall for either — the card is never off-screen.
  let cardTop: number;
  if (!box) {
    // The opening card makes room above itself for the mascot, and the two
    // are centred together.
    const room = withMascot ? MASCOT_ROOM : 0;
    cardTop = Math.max(EDGE + room, (shellH - cardH + room) / 2);
  } else if (box.top + box.height + GAP + cardH + EDGE <= shellH) {
    cardTop = box.top + box.height + GAP;
  } else if (box.top - GAP - cardH >= EDGE) {
    cardTop = box.top - GAP - cardH;
  } else {
    cardTop = shellH - cardH - EDGE;
  }
  // Whatever the arithmetic said, the card stays on the screen. A target that
  // has not finished scrolling into view would otherwise take the card with
  // it, and a farmer would be looking at a dimmed page with no way forward.
  cardTop = Math.max(EDGE + (withMascot && !box ? MASCOT_ROOM : 0), Math.min(cardTop, shellH - cardH - EDGE));

  return (
    <div className="tour" ref={host} data-open={visible || undefined} role="dialog" aria-modal="true" aria-label={t("tour_title")}>
      {/* The dimmer. With a hole it is that element's shadow, so the two can
          never come apart; without one it is a plain sheet of the same ink.
          It travels on a transform rather than on `top`/`left`: the light
          crossing the screen is the one moment of this interface that has to
          stay at sixty frames on a five-year-old phone. */}
      {box ? (
        <div
          className="tour-hole"
          style={{ transform: `translate3d(${box.left}px, ${box.top}px, 0)`, width: box.width, height: box.height }}
        />
      ) : (
        <div className="tour-scrim" />
      )}

      {/* Two elements, two jobs: the outer one carries the step's position,
          the inner one its entrance. Neither has to undo the other. */}
      <div className="tour-pos" style={{ transform: `translateY(${cardTop}px)` }}>
      {/* The first thing a new farmer or buyer sees: someone saying hello.
          Layers of one drawing: the body holds still, closed eyelids and a
          closed smile blink on over the face, and the hand rotates from the
          wrist. Only here, once: a greeting that repeats on every card stops
          being one. A tap waves (and says hi) again, for whoever tries. */}
      {opening && (
        <div className="tour-mascot" aria-hidden="true" onClick={() => setWaves(w => w + 1)}>
          <img className="tm-body" src={mascotBody} alt="" width={420} height={435} decoding="async" />
          <img className="tm-eyes" src={mascotEyes} alt="" width={420} height={435} decoding="async" />
          <img key={`m${waves}`} className="tm-mouth" src={mascotMouth} alt="" width={420} height={435} decoding="async" />
          <img key={`h${waves}`} className="tm-hand" src={mascotHand} alt="" width={420} height={435} decoding="async" />
        </div>
      )}
      {/* The last card: done, and well done. Still blinking, so he is the
          same someone who said hello, not a sticker. */}
      {last && (
        <div className="tour-mascot thumbs" aria-hidden="true">
          <img className="tm-body" src={mascotThumbs} alt="" width={420} height={443} decoding="async" />
          <img className="tm-eyes" src={mascotThumbsEyes} alt="" width={420} height={443} decoding="async" />
        </div>
      )}
      <div className="tour-card" ref={card}>
        {/* The brand on the opening and closing cards, the two that speak for
            the app itself. Hidden from screen readers: the title under it
            already says "AniSense". */}
        {!box && <span className="tour-mark" aria-hidden="true"><AniSenseLogo size={60} /></span>}
        <h2 className="tour-t">{t(`tour_${step.id}_t`)}</h2>
        {/* The opening says how long this is, counted, so the number can
            never disagree with the dots underneath it. */}
        <p className="tour-b">{t(`tour_${step.id}_b`).replace("{n}", String(STEPS.length))}</p>

        <div className="tour-foot">
          {/* Where you are, twice: dots to glance at, a count to read. */}
          <span className="tour-dots" aria-hidden="true">
            {STEPS.map((s, n) => <span key={s.id} className={`tour-dot ${n === i ? "on" : ""} ${n < i ? "done" : ""}`} />)}
          </span>
          <span className="tour-count">{t("tour_step").replace("{n}", String(i + 1)).replace("{total}", String(STEPS.length))}</span>
        </div>

        <div className="tour-btns">
          {last ? (
            <button className="tour-next wide" onClick={end}>
              <Check size={19} strokeWidth={2.8} /> {t("tour_done")}
            </button>
          ) : (
            <>
              <button className="tour-skip" onClick={end}>{t("tour_skip")}</button>
              {i > 0 && (
                <button className="tour-back" onClick={() => go(i - 1)} aria-label={t("back")}>
                  <ChevronLeft size={20} strokeWidth={2.6} />
                </button>
              )}
              <button className="tour-next" onClick={() => go(i + 1)}>
                {i === 0 ? t("tour_start") : t("tour_next")}
                <ChevronRight size={19} strokeWidth={2.8} />
              </button>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
