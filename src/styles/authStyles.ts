// ─── Auth CSS ─────────────────────────────────────────────────────────────────
// Redesigned for a 50–70 year-old audience on Android.
//   · body floor 18px, labels 17px sentence case (no 12px uppercase micro-labels)
//   · every tappable thing ≥ 52dp; primary actions 60dp (Material floor is 48dp)
//   · secondary text #454F49 ≈ 7.4:1 on paper, no gray-on-gray
//   · motion: transform/opacity only, <300ms, custom ease-out, reduced-motion honoured
import riceField from "../assets/rice-field.webp";

export const authCss = `



  .auth-outer {
    min-height: 100dvh; background: #fff;
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  @media (max-width: 430px) {
    .auth-outer { padding: 0; background: var(--paper); align-items: flex-start; }
  }
  /* The shell is a definite height, never a minimum. With min-height the shell
     had no height to size its children against, so a tall step (the signup
     form) stretched the whole frame instead of scrolling inside it. */
  .auth-shell {
    width: 390px; height: 844px; max-height: calc(100dvh - 48px); background: var(--paper);
    border-radius: 34px; box-shadow: 0 30px 60px rgba(0,0,0,.5), 0 0 0 9px #050706, 0 0 0 10px #313A35;
    overflow: hidden; display: flex; flex-direction: column; position: relative;
    font-size: var(--fs-body); color: var(--ink);
  }
  @media (max-width: 430px) {
    .auth-shell {
      width: 100vw; height: 100dvh; max-height: none; border-radius: 0; box-shadow: none;
      /* Without these the dock button sits under the gesture pill, and the
         status bar clips the back arrow. dvh alone does not account for either. */
      padding-top: var(--safe-top);
      padding-bottom: var(--safe-bottom);
    }
  }

  /* ── Shared primitives ─────────────────────────────────────────────────── */
  /* min-height: 0 on both, or a tall child sets the floor and the column grows
     past the shell rather than handing the overflow to .a-scroll. */
  .a-screen { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; background: var(--paper); }
  .a-scroll { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 0 22px; }
  .a-scroll::-webkit-scrollbar { width: 0; }
  .a-title { font-family: var(--font-display); font-weight: 700; font-size: var(--fs-display); line-height: 1.15; letter-spacing: -.02em; }
  .a-title.on-ink { color: #fff; }
  .a-sub { font-size: var(--fs-body); line-height: 1.5; color: var(--dilim); margin-top: 10px; }
  .a-sub.on-ink { color: rgba(255,255,255,.78); }

  .a-btn {
    width: 100%; min-height: 60px; border: none; border-radius: var(--r-md);
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-lead); letter-spacing: -.01em;
    display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer;
    transition: transform 180ms var(--ease-out), background-color 140ms ease, opacity 140ms ease;
    touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  }
  .a-btn:active { transform: scale(.975); }
  /* Press snaps, release relaxes. Symmetric timing makes a button feel rubbery,
     and the app sheet already does it this way. */
  .a-btn:active, .a-iconbtn:active, .a-pick:active,
  .a-role:active, .a-crop:active, .a-reveal:active { transition-duration: 100ms; }
  .a-btn-gold  { background: var(--palay); color: #1B1403; }
  .a-btn-green { background: var(--tanim); color: #fff; }
  .a-btn-ghost-ink { background: transparent; color: #fff; box-shadow: inset 0 0 0 2px rgba(255,255,255,.34); }
  .a-btn:disabled { background: #E3DED2; color: #8B9089; cursor: default; }
  .a-btn:disabled:active { transform: none; }
  /* Busy is not unavailable: the button keeps its colour while it works, so
     the tap reads as accepted rather than refused. */
  .a-btn.a-btn-green[aria-busy="true"]:disabled { background: var(--tanim); color: #fff; opacity: .88; }

  .a-iconbtn {
    width: 52px; height: 52px; border-radius: var(--r-md); border: none;
    background: rgba(255,255,255,.14); box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.26);
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    transition: transform 180ms var(--ease-out), background-color 140ms ease;
  }
  .a-iconbtn:active { transform: scale(.94); }
  /* The ink variant disappears on paper, so screens outside the ink head get this. */
  .a-iconbtn.on-paper { background: var(--card); box-shadow: inset 0 0 0 2px var(--line); }

  .a-inkhead { background: var(--ink); padding: 14px 22px 30px; border-radius: 0 0 26px 26px; }
  .a-badge {
    display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px;
    border-radius: var(--r-pill); background: rgba(255,255,255,.15);
    box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.3);
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-label); color: #fff; margin-top: 16px;
  }
  /* No hairline above the button. The soft lift alone is enough to separate the
     dock from content scrolling under it. */
  .a-dock {
    padding: 16px 22px 26px; background: var(--paper);
    box-shadow: 0 -18px 24px -18px rgba(22,33,27,.14);
  }
  .a-brandrow { display: flex; align-items: center; gap: 10px; }
  .a-brandmark {
    width: 34px; height: 34px; border-radius: 10px; background: #fff;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .a-brandname { font-family: var(--font-display); font-weight: 700; font-size: var(--fs-lead); color: #fff; letter-spacing: -.01em; }
  /* Back + primary in one row. Back matches the button height so the pair
     lines up, and never grows; Continue takes the rest. */
  .a-dockrow, .a-dockpair { display: flex; gap: 12px; }
  .a-dockrow .a-iconbtn, .a-dockpair .a-iconbtn { width: 60px; height: 60px; flex: 0 0 60px; }

  /* ── Entry choreography (stagger 40–280ms, ease-out) ───────────────────── */
  /* 320ms per item, 60ms apart: the last row settles at 600ms rather than 740ms.
     Stagger is decoration and must never make the screen feel slow to arrive. */
  .a-stagger > * { opacity: 0; transform: translateY(10px); animation: a-rise 320ms var(--ease-out) forwards; }
  .a-stagger > *:nth-child(1) { animation-delay: 40ms; }
  .a-stagger > *:nth-child(2) { animation-delay: 100ms; }
  .a-stagger > *:nth-child(3) { animation-delay: 160ms; }
  .a-stagger > *:nth-child(4) { animation-delay: 220ms; }
  .a-stagger > *:nth-child(5) { animation-delay: 280ms; }
  @keyframes a-rise { to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) {
    .a-stagger > * { animation: a-fade 260ms ease forwards; transform: none; }
    @keyframes a-fade { to { opacity: 1; } }
    .a-btn, .a-iconbtn, .a-pick, .a-role, .a-crop, .a-reveal { transition: background-color 140ms ease; }
    .a-btn:active, .a-iconbtn:active, .a-pick:active, .a-role:active, .a-crop:active, .a-reveal:active { transform: none; }
    .a-screen .a-role.on .a-role-ico > * { transform: none; }
    .a-seg .a-seg-thumb { transition: none; }
    .a-screen .a-err, .a-screen .a-hint-in { animation: a-fade-in 160ms ease; }
    .a-screen .a-alert { animation: a-fade-in 160ms ease; }
    .a-screen .a-inp.bad, .a-screen .a-prefix-row { animation: none; }
    .a-rolehead .a-rolestage, .a-rolehead .a-say { animation: a-fade-in 260ms ease both; }
    .a-screen .a-rolehead .a-cast .a-fig.a-fig { transform: none; filter: none; }
    .a-screen .a-say .a-say-emoji { animation: none; }
    /* Reduced motion is gentler, not nothing: the price still crossfades so the
       swap stays legible, it just no longer travels or blurs. */
    .a-board-slide { animation: a-fade-in 260ms ease; }
    @keyframes a-fade-in { from { opacity: 0; } to { opacity: 1; } }
    .a-board-dots span { transition: background-color 140ms ease; }
    .a-board-dots span.on { transform: none; }
  }

  /* ── Language gate ─────────────────────────────────────────────────────── */
  .a-pick {
    width: 100%; text-align: left; background: var(--card); border: none; cursor: pointer;
    box-shadow: inset 0 0 0 2px var(--line); border-radius: var(--r-lg);
    padding: 18px; display: flex; align-items: center; gap: 16px;
    transition: transform 180ms var(--ease-out), box-shadow 160ms ease, background-color 160ms ease;
    touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  }
  .a-pick:active { transform: scale(.985); }
  .a-pick.on { background: var(--tanim-sk); box-shadow: inset 0 0 0 3px var(--tanim); }
  .a-pick-copy { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .a-pick-t {
    display: flex; align-items: baseline; gap: 8px;
    font-family: var(--font-display); font-weight: 700; font-size: var(--fs-title); line-height: 1.2; letter-spacing: -.01em;
  }
  /* The two-letter code beside the name: another way in for someone who
     recognises "EN" faster than the word English. */
  .a-pick-t small {
    font-size: 12px; font-weight: 700; letter-spacing: .1em; color: var(--dilim);
    padding: 2px 7px; border-radius: 99px; background: var(--paper-alt);
  }
  .a-pick.on .a-pick-t small { background: rgba(11,107,65,.12); color: var(--tanim); }
  .a-pick-d { font-size: 15px; color: var(--dilim); margin-top: 3px; line-height: 1.35; }
  /* The flag sits in a small frame with a hairline, so a white stripe never
     bleeds into the white card behind it. */
  .a-pick-flag {
    flex-shrink: 0; width: 56px; height: 40px; border-radius: 8px; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 1px 2px rgba(22,33,27,.18), inset 0 0 0 1px rgba(22,33,27,.14);
  }
  .a-pick-flag .flag { display: block; width: 100%; height: 100%; }

  .a-tick {
    width: 34px; height: 34px; border-radius: 50%; margin-left: auto; flex: 0 0 34px;
    box-shadow: inset 0 0 0 2.5px #C7C1B2; display: flex; align-items: center; justify-content: center;
    transition: box-shadow 160ms ease, background-color 160ms ease;
  }
  .a-pick.on .a-tick, .a-role.on .a-tick { background: var(--tanim); box-shadow: inset 0 0 0 2.5px var(--tanim); }
  .a-tick > * { opacity: 0; transform: scale(.6); transition: opacity 140ms var(--ease-out), transform 180ms var(--ease-out); }
  .a-pick.on .a-tick > *, .a-role.on .a-tick > * { opacity: 1; transform: scale(1); }

  .a-help { font-size: var(--fs-label); color: var(--dilim); margin-top: 8px; line-height: 1.45; }

  /* ── Welcome: the price board ──────────────────────────────────────────── */
  /* The welcome screen sits on a Cordillera rice terrace. The scrim stays hard
     under the brand row and under the buttons, and opens through the middle so
     the glass board has something worth blurring behind it. */
  /* The photo lives on the screen, which never scrolls, so it stays put while
     the content scrolls over it on a short handset. */
  .a-welcome-shell { background: var(--ink); position: relative; isolation: isolate; }
  .a-welcome {
    flex: 1; min-height: 0; display: flex; flex-direction: column;
    padding: 20px 22px 26px;
    overflow-y: auto; overscroll-behavior: contain;
  }
  .a-welcome::-webkit-scrollbar { width: 0; }
  .a-welcome-shell::before {
    content: ""; position: absolute; inset: 0; z-index: -1;
    background-image:
      linear-gradient(180deg,
        rgba(16,21,18,.93) 0%,
        rgba(16,21,18,.72) 9%,
        rgba(16,21,18,.44) 22%,
        rgba(16,21,18,.42) 48%,
        rgba(16,21,18,.72) 62%,
        rgba(16,21,18,.93) 74%,
        rgba(16,21,18,.97) 100%),
      url(${riceField});
    background-size: cover, cover; background-position: center, center;
  }
  /* Glass. The tint is thin and does the legibility work; the blur does the
     depth. A sheen across the top-left and a hairline edge keep it reading as a
     pane of glass rather than a flat translucent box, and the shadow is wide
     and soft so the panel floats instead of being stamped on. */
  .a-board {
    margin-top: 26px; border-radius: var(--r-lg); padding: 22px 22px 20px;
    background:
      linear-gradient(148deg, rgba(255,255,255,.13), rgba(255,255,255,.03) 44%, rgba(255,255,255,0) 72%),
      rgba(16,21,18,.34);
    backdrop-filter: blur(26px) saturate(150%);
    -webkit-backdrop-filter: blur(26px) saturate(150%);
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,.13),
      inset 0 1px 0 rgba(255,255,255,.24),
      inset 0 -1px 0 rgba(0,0,0,.22),
      0 22px 44px -22px rgba(0,0,0,.78);
  }
  /* Without backdrop-filter the tint alone cannot hold text over a photograph,
     so fall back to the opaque plate. */
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .a-board { background: var(--ink-2); }
  }
  .a-board-lbl {
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-label); color: var(--palay);
    /* One line, always: the board must not change height as it rotates. */
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .a-board-price {
    font-family: var(--font-display); font-weight: 700; color: #fff; letter-spacing: -.045em;
    line-height: .92; font-size: var(--fs-num-xl); font-variant-numeric: tabular-nums;
    margin-top: 12px; display: flex; align-items: baseline;
  }
  .a-board-price .a-peso { font-size: var(--fs-num); font-weight: 600; margin-right: 4px; letter-spacing: 0; }
  .a-board-unit { font-size: var(--fs-lead); color: rgba(255,255,255,.66); margin-top: 6px; }
  .a-board-delta {
    display: inline-flex; align-items: center; gap: 8px; margin-top: 16px;
    padding: 9px 15px; border-radius: var(--r-pill);
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-label); font-variant-numeric: tabular-nums;
  }
  .a-board-delta.up   { background: rgba(11,107,65,.3);  box-shadow: inset 0 0 0 1.5px rgba(126,214,168,.4); color: #9EE3BE; }
  .a-board-delta.down { background: rgba(165,35,27,.24); box-shadow: inset 0 0 0 1.5px rgba(233,157,150,.4); color: #F0AFA9; }
  .a-board-foot {
    display: flex; align-items: center; gap: 8px; margin-top: 18px; padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,.16); font-size: var(--fs-label); color: rgba(255,255,255,.72);
  }
  /* The board cycles through the crop groups; each slide fades up on arrival. */
  /* Under 300ms, like every other UI beat here. The blur is the trick for a
     swap in place: it blends the outgoing and incoming figures into one motion
     instead of two numbers trading places. */
  .a-board-slide { animation: a-swap 260ms var(--ease-out); }
  @keyframes a-swap {
    from { opacity: 0; transform: translateY(7px); filter: blur(3px); }
    to   { opacity: 1; transform: none;            filter: blur(0); }
  }
  .a-board-dots { display: flex; justify-content: center; gap: 6px; margin-top: 16px; }
  .a-board-dots span {
    width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,.26);
    transition: background-color 260ms ease, transform 260ms var(--ease-out);
  }
  .a-board-dots span.on { background: var(--palay); transform: scale(1.34); }
  .a-tagline {
    margin-top: auto; margin-bottom: 22px; font-family: var(--font-display); font-weight: 500;
    font-size: var(--fs-lead); line-height: 1.45; color: rgba(255,255,255,.9); white-space: pre-line;
  }
  .a-tagline em { font-style: normal; color: var(--palay); }
  .a-legal { text-align: center; font-size: var(--fs-label); color: rgba(255,255,255,.5); margin-top: 14px; }

  /* ── Role picker ───────────────────────────────────────────────────────── */
  .a-role {
    width: 100%; text-align: left; background: var(--card); border: none; cursor: pointer;
    box-shadow: inset 0 0 0 2px var(--line); border-radius: var(--r-lg); padding: 20px;
    display: flex; align-items: center; gap: 16px;
    transition: transform 180ms var(--ease-out), box-shadow 160ms ease, background-color 160ms ease;
    touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  }
  .a-role:active { transform: scale(.985); }
  .a-role.on { background: var(--tanim-sk); box-shadow: inset 0 0 0 3px var(--tanim); }
  .a-role-ico {
    width: 64px; height: 64px; flex: 0 0 64px; border-radius: 18px; background: #F1EEE5;
    display: flex; align-items: center; justify-content: center; transition: background-color 160ms ease;
  }
  .a-role.on .a-role-ico { background: #fff; }
  /* The icon answers the tap with a small settle, so the card, the tile and the
     tick all agree the choice landed. Transform only, under 200ms. */
  .a-role-ico > * { transition: transform 180ms var(--ease-out); }
  .a-role.on .a-role-ico > * { transform: scale(1.08); }
  /* ── Role header: brand, question, mascot stage ───────────────────────── */
  /* Grows into whatever height the cards leave; the stage absorbs it. No
     bottom padding: the mascot stands on the header's edge, cut at the waist
     like someone behind a market stall. */
  .a-rolehead {
    flex: 1 1 auto; min-height: 0; position: relative; overflow: hidden;
    display: flex; flex-direction: column; padding: 18px 22px 0;
  }
  .a-rolehead-copy { margin-top: 22px; }
  .a-rolehead-copy .a-sub { margin-top: 6px; }

  .a-rolestage {
    flex: 1 1 auto; min-height: 170px; position: relative; margin-top: 8px;
    animation: a-stage-in 520ms var(--ease-out) 140ms both;
  }
  /* A soft pool of light behind the figure grounds him on the ink, so he reads
     as placed rather than pasted. */
  .a-rolestage::before {
    content: ""; position: absolute; right: -30px; bottom: -90px; width: 300px; height: 300px;
    border-radius: 50%; background: radial-gradient(closest-side, rgba(126,196,120,.22), rgba(126,196,120,0));
  }
  /* The cast hugs the figure: it's as wide as whichever figure is on stage,
     and flush to the screen's right edge. The bubble is placed against the
     cast, so it always lands right beside his head. */
  .a-cast { position: absolute; right: -22px; bottom: 0; height: min(100%, 250px); }
  .a-cast[data-fig="buyer"] { height: min(100%, 216px); }
  .a-fig {
    display: block; height: 100%; width: auto;
    pointer-events: none; user-select: none;
    transition: opacity 200ms var(--ease-out), transform 240ms var(--ease-out), filter 200ms ease;
  }
  /* Juan is drawn peeking round a wall: his straight right side sits on the
     screen edge. The buyer leans a little past it too, elbow off-screen, which
     frees the room on his left for his bubble. */
  .a-fig.fig-buyer { margin-right: -14px; }
  /* Only the figure on stage takes up room. The other waits behind it, faded,
     sunk and a touch blurred, so the swap reads as one figure changing. */
  .a-fig:not(.on) {
    position: absolute; right: 0; bottom: 0; margin-right: 0;
    opacity: 0; transform: translateY(14px) scale(.97); filter: blur(2px);
  }
  .a-fig.fig-buyer:not(.on) { right: -14px; }

  /* ── Speech bubble ─────────────────────────────────────────────────────── */
  /* Top-aligned with the figure's head and hung just off his left side, so it
     grows downward toward his face rather than up into the title. */
  .a-say {
    position: absolute; right: calc(100% + 12px); top: 10px; z-index: 1;
    width: max-content; max-width: 196px;
    display: flex; flex-direction: column; gap: 4px;
    background: #fff; color: var(--ink); border-radius: 20px; padding: 14px 16px 15px;
    box-shadow: 0 10px 24px -10px rgba(0,0,0,.55), 0 1px 0 rgba(255,255,255,.9) inset;
    transform-origin: 100% 80%; animation: a-bubble-in 240ms var(--ease-out) both;
  }
  /* The buyer is wider, so his bubble keeps a smaller gap and a narrower
     measure, but never overlaps him. */
  .a-cast[data-fig="buyer"] .a-say { right: calc(100% + 6px); max-width: 176px; }
  /* The tail points down-right, at his face. */
  .a-say::after {
    content: ""; position: absolute; right: -6px; bottom: 18px; width: 14px; height: 14px;
    background: #fff; border-radius: 2px; transform: rotate(45deg);
  }
  .a-say.is-first { animation-delay: 560ms; }
  .a-say-t {
    font-family: var(--font-display); font-weight: 700; font-size: 19px; line-height: 1.2; letter-spacing: -.015em;
  }
  /* pretty wrapping keeps a lone word like "mo." from ending up on its own line. */
  .a-say-s { font-size: 14.5px; line-height: 1.4; color: #4F5A53; font-weight: 500; text-wrap: pretty; }
  .a-say-nb { white-space: nowrap; }
  .a-say-emoji { display: inline-block; margin-left: 6px; }
  /* The wave plays once, after the bubble lands: a greeting, not a loop. */
  .a-say-emoji.wave { transform-origin: 70% 80%; animation: a-wave 900ms ease-in-out 1; animation-delay: 260ms; }
  .a-say.is-first .a-say-emoji.wave { animation-delay: 820ms; }
  @keyframes a-wave {
    0%, 100% { transform: rotate(0); }
    20% { transform: rotate(16deg); } 40% { transform: rotate(-8deg); }
    60% { transform: rotate(14deg); } 80% { transform: rotate(-4deg); }
  }

  /* Rare, first-run screen: a little delight is allowed here. */
  @keyframes a-stage-in { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
  @keyframes a-bubble-in { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: none; } }

  /* Cards sit right under the header, in the thumb zone above Continue. */
  .a-rolelist {
    flex: 0 1 auto; padding-top: 18px; padding-bottom: 18px;
    display: flex; flex-direction: column; gap: 12px;
  }
  .a-rolelist .a-role { box-shadow: inset 0 0 0 2px var(--line), 0 6px 18px -12px rgba(22,33,27,.3); }
  .a-rolelist .a-pick { box-shadow: inset 0 0 0 2px var(--line), 0 6px 18px -12px rgba(22,33,27,.3); }
  .a-rolelist .a-pick.on { box-shadow: inset 0 0 0 3px var(--tanim), 0 8px 22px -12px rgba(11,107,65,.4); }
  .a-rolelist .a-role.on { box-shadow: inset 0 0 0 3px var(--tanim), 0 8px 22px -12px rgba(11,107,65,.4); }
  .a-role-t { font-family: var(--font-display); font-weight: 600; font-size: var(--fs-title); line-height: 1.15; display: block; }
  .a-role-d { font-size: var(--fs-label); line-height: 1.45; color: var(--dilim); margin-top: 5px; display: block; }

  /* ── Form header ───────────────────────────────────────────────────────── */
  /* Same lockup as the setup steps, plus the account type as a pill on the
     brand row. The glow echoes the mascot stage so the flow feels like one
     place, at a fraction of the height a form can afford to give up. */
  .a-formhead { position: relative; overflow: hidden; padding: 18px 22px 26px; }
  .a-formhead::before {
    content: ""; position: absolute; right: -80px; top: -90px; width: 260px; height: 260px; border-radius: 50%;
    background: radial-gradient(closest-side, rgba(126,196,120,.2), rgba(126,196,120,0)); pointer-events: none;
  }
  .a-formhead > * { position: relative; }
  .a-formhead .a-title { margin-top: 22px; }
  .a-formhead .a-sub { margin-top: 6px; }
  .a-brandrow .a-badge { margin: 0 0 0 auto; padding: 6px 12px; gap: 6px; }

  /* ── Contact method switch ─────────────────────────────────────────────── */
  /* Segmented, not a link: both options are visible, the current one is
     obvious, and each half is a 48px target. The thumb slides rather than
     jumping so the eye follows the change to the field below. */
  .a-seg {
    position: relative; display: grid; grid-template-columns: 1fr 1fr; padding: 4px; margin-bottom: 16px;
    border-radius: var(--r-md); background: var(--paper-alt);
  }
  .a-seg-thumb {
    position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px);
    border-radius: 12px; background: var(--card); box-shadow: 0 1px 2px rgba(22,33,27,.12), 0 2px 8px -2px rgba(22,33,27,.12);
    transition: transform 220ms var(--ease-out);
  }
  .a-seg[data-mode="gmail"] .a-seg-thumb { transform: translateX(100%); }
  .a-seg button {
    position: relative; min-height: 48px; border: none; background: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-label); color: var(--dilim);
    transition: color 160ms ease; -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .a-seg button.on { color: var(--tanim); }

  /* ── Inline feedback ───────────────────────────────────────────────────── */
  /* Errors sit under their field and slide in a few pixels from it, so they
     read as belonging to that field rather than arriving from nowhere. */
  .a-err {
    display: flex; gap: 8px; align-items: flex-start; margin-top: 8px;
    font-size: var(--fs-label); line-height: 1.4; color: var(--error); font-weight: 600;
    animation: a-err-in 180ms var(--ease-out);
  }
  .a-err svg { flex: 0 0 18px; margin-top: 1px; }
  @keyframes a-err-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
  /* A rule that turns into a tick the moment it's met. */
  .a-hint { display: flex; align-items: center; gap: 8px; transition: color 160ms ease; }
  .a-hint-ico {
    width: 18px; height: 18px; flex: 0 0 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    box-shadow: inset 0 0 0 1.5px #C7C1B2; color: transparent;
    transition: background-color 160ms ease, box-shadow 160ms ease, color 160ms ease;
  }
  .a-hint.ok { color: var(--tanim); font-weight: 600; }
  .a-hint.ok .a-hint-ico { background: var(--tanim); box-shadow: inset 0 0 0 1.5px var(--tanim); color: #fff; }
  .a-hint-in { animation: a-err-in 180ms var(--ease-out); }

  /* Spins fast on purpose: a quicker spinner makes the same wait feel shorter. */
  .a-spin {
    width: 18px; height: 18px; border-radius: 50%; flex: 0 0 18px;
    border: 2.5px solid rgba(255,255,255,.35); border-top-color: #fff;
    animation: a-spin 700ms linear infinite;
  }
  @keyframes a-spin { to { transform: rotate(360deg); } }

  /* ── Fields ────────────────────────────────────────────────────────────── */
  .a-field { margin-top: 22px; }
  .a-lbl {
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-body);
    color: var(--ink); display: block; margin-bottom: 9px;
  }
  .a-inp {
    width: 100%; min-height: 62px; border-radius: var(--r-md); background: var(--card);
    border: none; box-shadow: inset 0 0 0 2px var(--line); padding: 0 18px;
    font-size: var(--fs-lead); color: var(--ink); font-family: var(--font-body);
    transition: box-shadow 140ms ease;
  }
  .a-inp::placeholder { color: #8F958E; }
  .a-inp:focus { outline: none; box-shadow: inset 0 0 0 3px var(--tanim); }
  .a-inp.num { font-variant-numeric: tabular-nums; letter-spacing: .02em; }
  .a-inp.bad { box-shadow: inset 0 0 0 3px var(--error); }
  /* A native select, deliberately. The OS picker is a full-screen list with
     system-sized rows and its own scrolling, which beats anything custom for a
     849-item barangay list on a 50-70 year-old's phone. */
  .a-select {
    appearance: none; -webkit-appearance: none;
    padding-right: 52px; cursor: pointer;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2316211B' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 18px center;
  }
  .a-select:disabled { background-color: var(--paper-alt); color: #8F958E; cursor: default; opacity: 1; }
  /* Province is fixed, so it is shown rather than asked. */
  .a-locked {
    display: flex; align-items: center; gap: 12px;
    min-height: 62px; padding: 0 18px; border-radius: var(--r-md);
    background: var(--tanim-sk); box-shadow: inset 0 0 0 2px var(--tanim-sk);
    font-size: var(--fs-lead); color: var(--ink);
  }
  .a-locked-note { margin-left: auto; font-size: var(--fs-label); color: var(--dilim); }
  .a-prefix-row { display: flex; }
  .a-prefix {
    display: flex; align-items: center; gap: 7px; flex-shrink: 0; padding: 0 16px;
    background: var(--tanim-sk); border-radius: var(--r-md) 0 0 var(--r-md);
    box-shadow: inset 0 0 0 2px var(--tanim);
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-body); color: var(--tanim);
  }
  .a-prefix-row .a-inp { border-radius: 0 var(--r-md) var(--r-md) 0; }
  .a-pwrow { position: relative; display: flex; align-items: center; }
  .a-pwrow .a-inp { padding-right: 106px; }
  .a-reveal {
    position: absolute; right: 8px; height: 48px; min-width: 88px; padding: 0 14px;
    border: none; border-radius: 10px; background: #F1EEE5; color: var(--tanim);
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-label); cursor: pointer;
    transition: transform 180ms var(--ease-out), background-color 140ms ease;
  }
  .a-reveal:active { transform: scale(.95); }
  .a-alert {
    display: flex; gap: 12px; align-items: flex-start; background: var(--error-bg);
    box-shadow: inset 0 0 0 1.5px #E9BDB8; border-radius: var(--r-md);
    padding: 15px 16px; margin-top: 20px; font-size: var(--fs-label); line-height: 1.45; color: var(--error);
  }
  .a-alert svg { flex: 0 0 22px; margin-top: 1px; }
  /* Errors arrive rather than appear: a short drop from above, so the eye
     catches the change without being startled by it. */
  .a-alert { animation: a-alert-in 200ms var(--ease-out); }
  @keyframes a-alert-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
  /* The field that's wrong shakes once when it turns red, the way iOS
     shakes a wrong password: "no" in a gesture, not only in colour. Small
     and quick, with the swing dying out, so it reads as a shake and not a
     wobble. */
  .a-inp.bad, .a-prefix-row:has(.a-inp.bad) { animation: a-shake 360ms var(--ease-out); }
  .a-prefix-row .a-inp.bad { animation: none; }
  @keyframes a-shake {
    0%, 100% { transform: translateX(0); }
    18% { transform: translateX(-7px); } 36% { transform: translateX(6px); }
    54% { transform: translateX(-4px); } 72% { transform: translateX(2px); }
  }
  .a-link {
    display: inline-flex; align-items: center; min-height: 52px; color: var(--tanim);
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-body);
    text-decoration: underline; text-underline-offset: 4px; cursor: pointer;
    background: none; border: none; padding: 0;
  }
  .a-switch { text-align: center; font-size: var(--fs-body); color: var(--dilim); margin-top: 6px; }
  .a-switch .a-link { min-height: auto; }
  /* In the ink header: left-aligned under the subtitle, link in the palay
     accent so it reads as tappable on dark. The link keeps a 44px hit area
     without adding visible height. */
  .a-switch.on-ink { text-align: left; color: rgba(255,255,255,.78); margin-top: 14px; font-size: var(--fs-label); }
  .a-switch.on-ink .a-link { color: var(--palay); font-size: var(--fs-label); min-height: 44px; margin: -12px 0; padding: 0 4px; }

  /* ── Crop picker ───────────────────────────────────────────────────────── */
  .a-cropgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 18px; }
  .a-crop {
    position: relative; background: var(--card); border: none; cursor: pointer; text-align: left;
    box-shadow: inset 0 0 0 2px var(--line); border-radius: var(--r-md);
    padding: 16px 14px; display: flex; flex-direction: column; gap: 9px; min-height: 124px;
    transition: transform 180ms var(--ease-out), box-shadow 160ms ease, background-color 160ms ease;
    touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  }
  .a-crop:active { transform: scale(.97); }
  .a-crop.on { background: var(--tanim-sk); box-shadow: inset 0 0 0 3px var(--tanim); }
  /* Emoji are artwork, not text, and deliberately off the type ramp. */
  .a-crop-emoji { font-size: 34px; line-height: 1; display: block; }
  .a-crop-n { font-family: var(--font-display); font-weight: 600; font-size: var(--fs-lead); line-height: 1.1; display: block; }
  .a-crop-e { font-size: var(--fs-label); color: var(--dilim); margin-top: 3px; display: block; }
  .a-crop-tick {
    position: absolute; top: 12px; right: 12px; width: 26px; height: 26px; border-radius: 50%;
    background: var(--tanim); display: flex; align-items: center; justify-content: center;
    opacity: 0; transform: scale(.7);
    transition: opacity 140ms var(--ease-out), transform 200ms var(--ease-out);
  }
  .a-crop.on .a-crop-tick { opacity: 1; transform: scale(1); }
  .a-count {
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-label);
    color: var(--dilim); font-variant-numeric: tabular-nums; margin-bottom: 12px;
  }
`;
