// ─── Auth CSS ─────────────────────────────────────────────────────────────────
// Redesigned for a 50–70 year-old audience on Android.
//   · body floor 18px, labels 17px sentence case (no 12px uppercase micro-labels)
//   · every tappable thing ≥ 52dp; primary actions 60dp (Material floor is 48dp)
//   · secondary text #454F49 ≈ 7.4:1 on paper, no gray-on-gray
//   · motion: transform/opacity only, <300ms, custom ease-out, reduced-motion honoured
import wallpaper from "../assets/anisense-wallpaper.webp";

export const authCss = `
  /* A verification code: six digits read off another screen and typed back,
     so they are spaced like the email prints them. */
  .a-inp.a-code { font-size: 26px; letter-spacing: .45em; text-align: center; font-variant-numeric: tabular-nums; }



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
      /* The insets live on .a-inkhead, .a-welcome and .a-dock rather than
         here, so the ink header and the terraces photo reach the top edge
         instead of stopping below the status bar. */
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
  .a-btn:active, .a-iconbtn:active,
  .a-crop:active, .a-reveal:active { transition-duration: 100ms; }
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

  .a-inkhead { background: var(--ink); padding: calc(14px + var(--safe-top)) 22px 30px; border-radius: 0 0 26px 26px; }
  .a-badge {
    display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px;
    border-radius: var(--r-pill); background: rgba(255,255,255,.15);
    box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.3);
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-label); color: #fff; margin-top: 16px;
  }
  /* No hairline above the button. The soft lift alone is enough to separate the
     dock from content scrolling under it. */
  /* No fill and no shadow of its own: the buttons sit on the same ground as
     everything above them. The lift used to draw a line across the screen and
     make the last two buttons look like a separate panel. */
  .a-dock { padding: 16px 22px calc(26px + var(--safe-bottom)); background: transparent; }
  .a-brandrow { display: flex; align-items: center; gap: 10px; }
  /* The mark sits like an app icon on the ink: a tight contact shadow and a
     softer one under it, so it reads as a raised tile, not a white cut-out. */
  .a-brandmark {
    width: 34px; height: 34px; border-radius: 10px; background: #fff;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    box-shadow: 0 1px 2px rgba(0,0,0,.3), 0 6px 14px -6px rgba(0,0,0,.5);
  }
  .a-brandname { font-family: var(--font-display); font-weight: 700; font-size: var(--fs-lead); color: #fff; letter-spacing: -.01em; }
  /* Back + primary in one row. Back matches the button height so the pair
     lines up, and never grows; Continue takes the rest. */
  /* Two buttons, side by side: a white square for back and the green one for
     forward. Two shapes, two colours, and the difference is the point: at a
     glance it's obvious which one goes on. */
  .a-dockrow, .a-dockpair { display: flex; align-items: center; gap: 12px; }
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
    .a-btn, .a-iconbtn, .a-crop, .a-reveal { transition: background-color 140ms ease; }
    .a-btn:active, .a-iconbtn:active, .a-crop:active, .a-reveal:active { transform: none; }
    .a-seg .a-seg-thumb { transition: none; }
    .a-screen .a-err, .a-screen .a-hint-in { animation: a-fade-in 160ms ease; }
    .a-screen .a-alert { animation: a-fade-in 160ms ease; }
    .a-screen .a-inp.bad, .a-screen .a-prefix-row { animation: none; }
    .a-rolehead .a-rolestage, .a-rolehead .a-say { animation: a-fade-in 260ms ease both; }
    .a-screen .a-rolehead .a-cast .a-fig.a-fig { transform: none; filter: none; }
    .a-screen .a-say .a-say-emoji { animation: none; }
    @keyframes a-fade-in { from { opacity: 0; } to { opacity: 1; } }
  }

  /* ── Setup choices: language and role ──────────────────────────────────── */
  /* An inset grouped list, the way iOS Settings asks one question: a single
     white card, a row per answer, and a radio at the end of each row. The
     language and role steps share it, so the two read as one flow. The list
     sits right under the header, in the thumb zone above Continue. */
  .a-choice-list { flex: 0 1 auto; padding-top: 22px; padding-bottom: 10px; }
  .a-choice-group {
    background: var(--card); border-radius: var(--r-lg); overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(22,33,27,.05),
      0 1px 2px rgba(22,33,27,.06),
      0 14px 30px -18px rgba(22,33,27,.32);
  }
  /* A row answers the press the way an iOS list row does, by lighting up
     rather than shrinking: the whole row is the target, and a row that
     scales inside its card looks loose. On at once, fading out on release. */
  .a-choice-row {
    position: relative; width: 100%; min-height: 80px; padding: 14px 18px 14px 16px;
    display: flex; align-items: center; gap: 16px; text-align: left; color: var(--ink);
    background: transparent; border: none; cursor: pointer;
    transition: background-color 260ms ease;
    touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  }
  .a-choice-row:active { background: #EDEFF0; transition-duration: 0ms; }
  .a-choice-copy { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  .a-choice-t {
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-lead);
    line-height: 1.2; letter-spacing: -.012em;
  }
  .a-choice-d { font-family: var(--font-body); font-size: var(--fs-label); line-height: 1.35; color: var(--text-faint); }

  /* The flag is framed like a small printed card: a hairline so a white
     stripe never bleeds into the white row, a faint sheen from above, and a
     soft shadow under it. */
  .a-lang-flag {
    position: relative; flex: 0 0 48px; width: 48px; height: 32px; border-radius: 8px; overflow: hidden;
    box-shadow: 0 1px 2px rgba(22,33,27,.16), 0 4px 10px -6px rgba(22,33,27,.4);
  }
  .a-lang-flag .flag { display: block; width: 100%; height: 100%; }
  .a-lang-flag::after {
    content: ""; position: absolute; inset: 0; border-radius: inherit;
    background: linear-gradient(180deg, rgba(255,255,255,.2) 0%, rgba(255,255,255,0) 48%, rgba(0,0,0,.06) 100%);
    box-shadow: inset 0 0 0 1px rgba(22,33,27,.12);
  }

  /* A role's icon on a coloured tile, like the icons down the side of iOS
     Settings: a white glyph on a gradient, lit along the top edge and resting
     on a soft shadow. Green for the farmer, the app's own colour; warm amber
     for the buyer, the colour of the market. The tile is artwork: the name
     beside it is what's read aloud. */
  .a-choice-tile {
    flex: 0 0 52px; width: 52px; height: 52px; border-radius: 15px;
    display: flex; align-items: center; justify-content: center;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.32),
      inset 0 -1px 0 rgba(0,0,0,.12),
      0 1px 2px rgba(22,33,27,.18),
      0 4px 10px -6px rgba(22,33,27,.45);
  }
  .a-choice-tile.farmer { background: linear-gradient(180deg, #1A9761 0%, var(--tanim) 100%); }
  .a-choice-tile.buyer  { background: linear-gradient(180deg, #F8B941 0%, #DE8612 100%); }

  /* The radio: an empty ring, or a green disc with a white check. The disc
     pops in slightly past full size and settles, and the check grows in with
     it: the one place a little overshoot belongs, since it answers the tap.
     Leaving is quicker and plain: the old choice gets out of the way. */
  .a-choice-radio {
    flex: 0 0 30px; width: 30px; height: 30px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: inset 0 0 0 2px var(--line-strong);
    transition: background-color 160ms ease, box-shadow 160ms ease;
  }
  .a-choice-row.on .a-choice-radio {
    background: var(--tanim);
    box-shadow: inset 0 0 0 2px var(--tanim), 0 2px 6px -1px rgba(11,107,65,.45);
    animation: a-radio-pop 260ms var(--ease-out);
  }
  @keyframes a-radio-pop {
    0%   { transform: scale(.7); }
    60%  { transform: scale(1.06); }
    100% { transform: scale(1); }
  }
  .a-choice-radio svg { opacity: 0; transform: scale(.6); transition: opacity 100ms ease, transform 140ms var(--ease-out); }
  .a-choice-row.on .a-choice-radio svg {
    opacity: 1; transform: none;
    transition: opacity 140ms var(--ease-out), transform 180ms var(--ease-out);
  }
  /* Under the card, lined up with the row's padding, like an iOS section
     footer. */
  .a-choice-foot { padding: 12px 16px 0; font-size: var(--fs-label); line-height: 1.45; color: var(--text-faint); }

  /* A line whose words change (the heading when the app switches language,
     Continue when a role is picked) swaps with a short blur: the eye reads
     one wording turning into the other instead of two overlapping. It
     doubles as the heading's entrance. */
  .a-swap { animation: a-swap 280ms var(--ease-out) both; }
  span.a-swap { display: inline-block; }
  @keyframes a-swap {
    from { opacity: 0; filter: blur(6px); transform: translateY(4px); }
    to   { opacity: 1; filter: none; transform: none; }
  }

  /* One prominent button as a capsule and Back as a round button beside it,
     the shapes iOS uses for a setup step's actions. */
  .a-setup .a-btn { border-radius: var(--r-pill); }
  .a-setup .a-dockrow .a-iconbtn, .a-setup .a-dockpair .a-iconbtn { border-radius: 50%; }

  @media (prefers-reduced-motion: reduce) {
    .a-swap { animation: a-swap-fade 200ms ease both; }
    @keyframes a-swap-fade { from { opacity: 0; } to { opacity: 1; } }
    .a-choice-radio svg, .a-choice-row.on .a-choice-radio svg { transform: none; }
    .a-choice-row.on .a-choice-radio { animation: none; }
  }

  .a-help { font-size: var(--fs-label); color: var(--dilim); margin-top: 8px; line-height: 1.45; }

  /* ── Welcome: the AniSense poster ──────────────────────────────────────── */
  /* The poster, full-bleed. Everything on it stays as drawn except the foot,
     where a soft green scrim rises just enough to hold the buttons and the
     line under them; it starts below Juan's face so he stays bright. Pushed a
     little right of centre on a narrow phone, so his basket isn't the part
     that gets cropped. A faint light haze along the very top keeps the
     status bar's dark icons readable over the leaves in the corner. */
  /* The picture lives on the screen, which never scrolls, so it stays put. */
  .a-welcome-shell { background: #CFE3C0; position: relative; isolation: isolate; }
  .a-welcome-shell::before {
    content: ""; position: absolute; inset: 0; z-index: -1;
    background-image:
      linear-gradient(180deg, rgba(255,255,255,.5) 0, rgba(255,255,255,0) calc(56px + var(--safe-top))),
      linear-gradient(180deg, rgba(8,28,16,0) 52%, rgba(8,28,16,.5) 66%, rgba(6,24,13,.9) 100%),
      url(${wallpaper});
    background-size: cover, cover, cover; background-position: center, center, 64% center;
  }
  .a-welcome {
    flex: 1; min-height: 0; display: flex; flex-direction: column;
    padding: calc(20px + var(--safe-top)) 22px calc(22px + var(--safe-bottom));
    overflow-y: auto; overscroll-behavior: contain;
  }
  .a-welcome::-webkit-scrollbar { width: 0; }
  /* What the app does and its slogan, above the buttons. The scrim rises
     a little higher for it than it would for the buttons alone, and a soft
     shadow keeps the white type clear of the busy picture behind it. */
  .a-tagline {
    margin-top: auto; margin-bottom: 20px; font-family: var(--font-display); font-weight: 500;
    font-size: var(--fs-lead); line-height: 1.45; color: #fff; white-space: pre-line;
    text-shadow: 0 1px 12px rgba(0,0,0,.5), 0 1px 2px rgba(0,0,0,.35);
  }
  .a-tagline em { font-style: normal; font-weight: 700; color: var(--palay); }
  .a-welcome-cta { display: flex; flex-direction: column; gap: 12px; }
  /* The two ways in, as capsules, the same shape as Continue on the next
     step, and built the way an iPhone button is: out of light, not lines.
       · a crisp bright rim along the top edge, where light catches it
       · a soft gloss filling the upper half, so the surface has a curve
       · a slight shade along the bottom, where the capsule turns away
       · three shadows under it: a tight one where it touches the page, a
         close one, and a wide soft one, so it floats a little above the
         picture instead of being printed on it
     The shadows are dark, never gold: a coloured halo reads as glow, not
     depth. Pressed, all of it collapses: the gloss dims, the shade moves
     inside and the shadows pull in tight, so it reads as pushed down into
     the page rather than merely smaller. Both states list the same layers
     in the same order, so the press animates instead of snapping. */
  .a-welcome-cta .a-btn { border-radius: var(--r-pill); }
  .a-welcome-cta .a-btn-gold {
    background-image: linear-gradient(180deg, #FFD066 0%, #F7BB33 52%, #ECA81E 100%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.7),
      inset 0 12px 16px -12px rgba(255,255,255,.5),
      inset 0 -3px 4px -2px rgba(150,95,0,.3),
      inset 0 0 0 1px rgba(120,78,0,.2),
      0 1px 1px rgba(0,0,0,.3),
      0 4px 10px -2px rgba(0,0,0,.32),
      0 16px 30px -10px rgba(0,0,0,.55);
  }
  .a-welcome-cta .a-btn-gold:active {
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.4),
      inset 0 12px 16px -12px rgba(255,255,255,.2),
      inset 0 3px 7px -1px rgba(150,95,0,.32),
      inset 0 0 0 1px rgba(120,78,0,.26),
      0 1px 1px rgba(0,0,0,.3),
      0 2px 4px -1px rgba(0,0,0,.26),
      0 6px 12px -8px rgba(0,0,0,.4);
    filter: brightness(.97);
  }
  /* I already have an account is glass: the poster shows through, blurred
     and a little richer. Its rim is bright on top and fainter along the
     bottom, where the same light passes through the glass and out the
     other side. Pressed, the glass lights up under the finger, the way
     Apple's glass buttons answer a touch. */
  .a-welcome-cta .a-btn-ghost-ink {
    color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,.3);
    background-color: rgba(255,255,255,.14);
    background-image: linear-gradient(180deg, rgba(255,255,255,.2) 0%, rgba(255,255,255,.04) 55%, rgba(255,255,255,.09) 100%);
    backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.55),
      inset 0 -1px 0 rgba(255,255,255,.16),
      inset 0 12px 16px -12px rgba(255,255,255,.35),
      inset 0 0 0 1px rgba(255,255,255,.22),
      0 1px 1px rgba(0,0,0,.28),
      0 4px 10px -2px rgba(0,0,0,.3),
      0 16px 30px -10px rgba(0,0,0,.5);
  }
  .a-welcome-cta .a-btn-ghost-ink:active {
    background-color: rgba(255,255,255,.24);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.4),
      inset 0 -1px 0 rgba(255,255,255,.1),
      inset 0 12px 16px -12px rgba(255,255,255,.18),
      inset 0 0 0 1px rgba(255,255,255,.32),
      0 1px 1px rgba(0,0,0,.28),
      0 2px 4px -1px rgba(0,0,0,.24),
      0 6px 12px -8px rgba(0,0,0,.36);
  }
  /* For people who have asked the phone for less see-through glass: the
     same button, solid. */
  @media (prefers-reduced-transparency: reduce) {
    .a-welcome-cta .a-btn-ghost-ink {
      backdrop-filter: none; -webkit-backdrop-filter: none;
      background-color: #1E3A2A; background-image: none;
    }
  }
  .a-legal { text-align: center; font-size: var(--fs-label); color: rgba(255,255,255,.78); margin-top: 14px; text-shadow: 0 1px 6px rgba(0,0,0,.35); }
  /* For screen readers only: the poster's words are in the picture. */
  .a-sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
  }

  /* ── Role header: brand, question, mascot stage ───────────────────────── */
  /* Grows into whatever height the cards leave; the stage absorbs it. No
     bottom padding: the mascot stands on the header's edge, cut at the waist
     like someone behind a market stall. */
  .a-rolehead {
    flex: 1 1 auto; min-height: 0; position: relative; overflow: hidden;
    display: flex; flex-direction: column; padding: calc(18px + var(--safe-top)) 22px 0;
  }
  /* A field at first light rather than a flat panel. Three soft lights over
     the ink, all dim enough that white type stays crisp on them:
       · a faint warm dawn in the top corner, the sun coming up over the field
       · a cool green haze along the left, so the space between the title and
         Juan reads as air, not as an empty box
       · the brightest, green, low behind Juan, so he stands in the light
     A fine grain over it all keeps the long dark gradients from banding into
     visible steps on phone screens. A faint line of light along the curved
     edge and a soft shadow under it make the header a surface resting over
     the page. Shared by the language, role and account steps, so the
     whole setup stays one piece. */
  .a-inkhead.a-rolehead, .a-inkhead.a-formhead {
    background:
      url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 .07 0 0 0 0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)'/%3E%3C/svg%3E"),
      radial-gradient(55% 34% at 92% 0%, rgba(242,179,44,.16), rgba(242,179,44,0) 72%),
      radial-gradient(70% 45% at 0% 62%, rgba(46,128,98,.2), rgba(46,128,98,0) 72%),
      radial-gradient(85% 55% at 86% 100%, rgba(88,172,106,.3), rgba(88,172,106,0) 70%),
      linear-gradient(180deg, #1C2D24 0%, #15201A 55%, #101814 100%);
    background-size: 180px 180px, auto, auto, auto, auto;
    border-radius: 0 0 30px 30px;
    box-shadow: inset 0 -1px 0 rgba(255,255,255,.08), 0 18px 34px -24px rgba(16,26,21,.55);
  }
  .a-rolehead-copy { margin-top: 22px; }
  .a-rolehead-copy .a-sub { margin-top: 6px; }
  /* On the language step the line under the title is the same question in
     the other language, so it is set as a second title rather than as small
     print: the same face, lighter and dimmer. A Tagalog reader finds
     "Piliin ang wika" as quickly as an English reader finds the title. */
  .a-lang .a-rolehead-copy .a-sub {
    margin-top: 4px; font-family: var(--font-display); font-weight: 500;
    font-size: var(--fs-title); line-height: 1.2; letter-spacing: -.015em;
    color: rgba(255,255,255,.58);
  }

  .a-rolestage {
    flex: 1 1 auto; min-height: 170px; position: relative; margin-top: 8px;
    animation: a-stage-in 520ms var(--ease-out) 140ms both;
  }
  /* A soft pool of light behind the figure grounds him on the ink, so he reads
     as placed rather than pasted. */
  /* Centred on the figure's chest (he stands flush right, about 160px wide),
     so the light sits behind him like a spotlight on a stage rather than
     off to one side of him. */
  .a-rolestage::before {
    content: ""; position: absolute; right: -112px; bottom: -80px; width: 340px; height: 340px;
    border-radius: 50%;
    background: radial-gradient(closest-side, rgba(140,208,132,.3), rgba(140,208,132,.1) 55%, rgba(140,208,132,0));
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

  /* Juan in two layers, so his hand can wave. The wrapper is sized like the
     single image it replaces (the drawing's own proportions), and the two
     layers fill it exactly, one over the other. */
  .a-fig-layers { position: relative; aspect-ratio: 400 / 633; }
  .a-fig-layers > img { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  /* The pivot is his wrist crease, measured on the drawing. Each swing eases
     in and out like a pendulum: it is movement back and forth, not an
     entrance. Only while he is the one on stage. */
  .a-fig-hand { transform-origin: 30.5% 74.41%; }
  .a-fig.on .a-fig-hand { animation: a-wave 1.6s var(--ease-io) 140ms both; }
  /* The first wave waits for the stage to rise into place. */
  .a-fig.on .a-fig-hand.is-first { animation-delay: 680ms; }
  @keyframes a-wave {
    0%   { transform: rotate(0deg); }
    17%  { transform: rotate(-14deg); }
    34%  { transform: rotate(9deg); }
    51%  { transform: rotate(-14deg); }
    68%  { transform: rotate(9deg); }
    84%  { transform: rotate(-4deg); }
    100% { transform: rotate(0deg); }
  }
  /* The buyer: his own proportions, and a face that talks and blinks. */
  .a-fig-layers.fig-buyer { aspect-ratio: 456 / 520; }
  /* Overlays switch on and off with no fade: a blink or a word that
     dissolves reads as a ghost, not as a face moving. */
  .a-fig-eyes, .a-fig-mouth { opacity: 0; }
  .a-fig.on .a-fig-eyes { animation: a-blink 3.6s step-end 900ms infinite; }
  @keyframes a-blink {
    0%   { opacity: 1; }
    4%   { opacity: 0; }
    100% { opacity: 0; }
  }
  /* His line, said in the rhythm of a short sentence as the bubble pops
     in; then the smile stays open. forwards, not both: before he speaks he
     wears the open smile he was drawn with. */
  .a-fig.on .a-fig-mouth { animation: a-talk 1.3s step-end 240ms forwards; }
  .a-fig.on .a-fig-mouth.is-first { animation-delay: 740ms; }
  @keyframes a-talk {
    0%   { opacity: 1; }
    12%  { opacity: 0; }
    25%  { opacity: 1; }
    38%  { opacity: 0; }
    52%  { opacity: 1; }
    64%  { opacity: 0; }
    78%  { opacity: 1; }
    88%  { opacity: 0; }
    100% { opacity: 0; }
  }
  /* Juan says each line once: open, half, shut in 130 ms beats, in an
     uneven order so it reads as words, not a metronome, for about a second
     and a half. Then he stops on the open smile he was drawn with, until
     the next line. The two layers share one clock, so they never drift.
     Only while he is on stage. */
  .a-fig-talk { opacity: 0; }
  .a-fig.on .a-fig-talk.half { animation: a-chat-half 1.56s step-end 200ms; }
  .a-fig.on .a-fig-talk.shut { animation: a-chat-shut 1.56s step-end 200ms; }
  /* The first line waits for him to rise into place. */
  .a-fig.on .a-fig-talk.is-first { animation-delay: 700ms; }
  @keyframes a-chat-half {
    0% { opacity: 1; } 8.33% { opacity: 0; } 16.67% { opacity: 1; } 25% { opacity: 0; } 33.33% { opacity: 1; }
    41.67% { opacity: 0; } 58.33% { opacity: 1; } 66.67% { opacity: 0; } 75% { opacity: 1; } 83.33% { opacity: 0; }
  }
  @keyframes a-chat-shut {
    0% { opacity: 0; } 8.33% { opacity: 1; } 16.67% { opacity: 0; } 41.67% { opacity: 1; } 50% { opacity: 0; }
    66.67% { opacity: 1; } 75% { opacity: 0; } 83.33% { opacity: 1; } 91.67% { opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .a-fig.on .a-fig-hand, .a-fig.on .a-fig-hand.is-first,
    .a-fig.on .a-fig-eyes, .a-fig.on .a-fig-mouth, .a-fig.on .a-fig-mouth.is-first,
    .a-fig.on .a-fig-talk { animation: none; }
  }
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

  /* ── Form header ───────────────────────────────────────────────────────── */
  /* Same lockup and the same first light as the setup steps before it (the
     background is shared with .a-rolehead above), shorter, because a form
     needs the room. The account type rides the brand row as a small glass
     pill. */
  .a-formhead { position: relative; overflow: hidden; padding: calc(18px + var(--safe-top)) 22px 26px; }
  .a-formhead > * { position: relative; }
  .a-formhead .a-title { margin-top: 22px; }
  .a-formhead .a-sub { margin-top: 6px; }
  .a-brandrow .a-badge {
    margin: 0 0 0 auto; padding: 6px 13px 6px 11px; gap: 6px;
    background: rgba(255,255,255,.12);
    backdrop-filter: blur(12px) saturate(160%); -webkit-backdrop-filter: blur(12px) saturate(160%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.28),
      inset 0 0 0 1px rgba(255,255,255,.16),
      0 4px 10px -6px rgba(0,0,0,.5);
  }

  /* ── Step transitions ──────────────────────────────────────────────────── */
  /* Moving through sign-up is navigation, so it moves like iOS navigation:
     the next step comes in from the right, going back comes in from the
     left, and the page answers at once (strong ease-out). Only the entrance
     animates; the old step is simply gone, so a quick tap never waits on an
     exit. Switching between Sign in and Create account is not a move to
     another place, so that one settles in where it is with a small blur.
     End states are "none", never blur(0): a filter left on the page would
     become the frame for anything fixed inside it. */
  .a-step[data-anim="fwd"]  { animation: a-step-fwd 300ms var(--ease-out) both; }
  .a-step[data-anim="back"] { animation: a-step-back 300ms var(--ease-out) both; }
  .a-step[data-anim="swap"] { animation: a-step-swap 240ms var(--ease-out) both; }
  @keyframes a-step-fwd  { from { opacity: 0; transform: translateX(32px); } to { opacity: 1; transform: none; } }
  @keyframes a-step-back { from { opacity: 0; transform: translateX(-32px); } to { opacity: 1; transform: none; } }
  @keyframes a-step-swap { from { opacity: 0; transform: translateY(6px); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }

  /* ── Contact method switch ─────────────────────────────────────────────── */
  /* Segmented, not a link: both options are visible, the current one is
     obvious, and each half is a 48px target. Drawn like iOS's own segmented
     control: a grey well, a white thumb with the soft double shadow iOS
     gives it, and the chosen label in ink. The thumb glides on the iOS
     sheet curve so the eye follows it to the field below, and holding the
     chosen segment presses the thumb in a little, as iOS does. */
  .a-seg {
    position: relative; display: grid; grid-template-columns: 1fr 1fr; padding: 3px; margin-bottom: 18px;
    border-radius: 15px; background: rgba(118,118,128,.13);
  }
  .a-seg-thumb {
    position: absolute; top: 3px; bottom: 3px; left: 3px; width: calc(50% - 3px);
    border-radius: 12px; background: var(--card);
    box-shadow: 0 3px 8px rgba(0,0,0,.12), 0 3px 1px rgba(0,0,0,.04), 0 0 0 .5px rgba(0,0,0,.04);
    transform: translateX(calc(var(--seg-i, 0) * 100%)) scale(var(--seg-s, 1));
    transition: transform 260ms var(--ease-drawer);
  }
  .a-seg[data-mode="gmail"] { --seg-i: 1; }
  .a-seg:has(button.on:active) { --seg-s: .96; }
  .a-seg button {
    position: relative; min-height: 48px; border: none; background: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-label); color: var(--text-muted);
    transition: color 200ms ease; -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .a-seg button.on { color: var(--ink); }
  /* Three options (Luzon, Visayas, Mindanao): the same well and gliding
     thumb, a third of the width, moved by index. */
  .a-seg.three { grid-template-columns: repeat(3, 1fr); }
  .a-seg.three .a-seg-thumb { width: calc((100% - 6px) / 3); }
  .a-seg.three[data-i="1"] { --seg-i: 1; }
  .a-seg.three[data-i="2"] { --seg-i: 2; }

  /* ── Inline feedback ───────────────────────────────────────────────────── */
  /* Errors sit under their field and slide in a few pixels from it, so they
     read as belonging to that field rather than arriving from nowhere. */
  .a-err {
    display: flex; gap: 8px; align-items: flex-start; margin-top: 8px; padding-left: 4px;
    font-size: var(--fs-label); line-height: 1.4; color: var(--error); font-weight: 600;
    animation: a-err-in 180ms var(--ease-out);
  }
  .a-err svg { flex: 0 0 18px; margin-top: 1px; }
  @keyframes a-err-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
  /* A rule that turns into a tick the moment it's met, with the same small
     pop as the setup radios: the form answers progress as it happens. */
  .a-hint { display: flex; align-items: center; gap: 8px; transition: color 160ms ease; }
  .a-hint-ico {
    width: 18px; height: 18px; flex: 0 0 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    box-shadow: inset 0 0 0 1.5px var(--line-strong); color: transparent;
    transition: background-color 160ms ease, box-shadow 160ms ease, color 160ms ease;
  }
  .a-hint.ok { color: var(--tanim); font-weight: 600; }
  .a-hint.ok .a-hint-ico {
    background: var(--tanim); box-shadow: inset 0 0 0 1.5px var(--tanim); color: #fff;
    animation: a-radio-pop 260ms var(--ease-out);
  }
  .a-hint-in { animation: a-err-in 180ms var(--ease-out); }
  .a-field .a-help { padding-left: 4px; }

  /* Spins fast on purpose: a quicker spinner makes the same wait feel shorter. */
  .a-spin {
    width: 18px; height: 18px; border-radius: 50%; flex: 0 0 18px;
    border: 2.5px solid rgba(255,255,255,.35); border-top-color: #fff;
    animation: a-spin 700ms linear infinite;
  }
  @keyframes a-spin { to { transform: rotate(360deg); } }

  /* ── Fields ────────────────────────────────────────────────────────────── */
  /* iOS fields: white, softly rounded, held on the grey page by a hairline
     and a whisper of a shadow instead of a drawn border. Focus answers with
     a green ring and a soft halo of the same green around it, the way iOS
     and macOS show which field is taking the typing; an error uses the same
     ring in red. Every state lists the same three layers, so moving between
     them animates rather than snaps. */
  .a-field { margin-top: 20px; }
  .a-lbl {
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-body);
    color: var(--text-soft); display: block; margin-bottom: 8px; padding-left: 4px;
  }
  /* Quieter than the label it rides, louder than nothing: enough to be read
     before the field is tapped, not enough to compete with the question. */
  .a-lbl small {
    font-family: var(--font-body); font-weight: 600; font-size: var(--fs-label);
    color: var(--text-faint);
  }
  .a-inp, .a-prefix-row {
    border-radius: 16px; background: var(--card);
    box-shadow:
      0 0 0 1px rgba(22,33,27,.14),
      0 1px 2px rgba(22,33,27,.06),
      0 0 0 0 rgba(11,107,65,0);
    transition: box-shadow 180ms var(--ease-out);
  }
  .a-inp {
    width: 100%; min-height: 60px; border: none; padding: 0 18px;
    font-size: var(--fs-lead); color: var(--ink); font-family: var(--font-body);
    caret-color: var(--tanim);
  }
  .a-inp::placeholder { color: #8F958E; }
  .a-inp:focus, .a-prefix-row:focus-within {
    outline: none;
    box-shadow:
      0 0 0 2px var(--tanim),
      0 1px 2px rgba(22,33,27,.06),
      0 0 0 6px rgba(11,107,65,.14);
  }
  .a-inp.bad, .a-prefix-row:has(.a-inp.bad) {
    box-shadow:
      0 0 0 2px var(--error),
      0 1px 2px rgba(22,33,27,.06),
      0 0 0 6px rgba(165,35,27,.12);
  }
  .a-inp.num { font-variant-numeric: tabular-nums; letter-spacing: .02em; }
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
  /* The picker fields read as the same family as the inputs: same shape, same
     hairline, and the same green ring while the finger is on them. */
  .a-setup .pick-field {
    min-height: 60px; border-radius: 16px; background-color: var(--card); background-image: none;
    box-shadow:
      0 0 0 1px rgba(22,33,27,.14),
      0 1px 2px rgba(22,33,27,.06),
      0 0 0 0 rgba(11,107,65,0);
    transition: transform 160ms var(--ease-out), box-shadow 180ms var(--ease-out), background-color 140ms ease;
  }
  .a-setup .pick-field:active {
    background-image: none; background-color: #F8F9F9; transform: scale(.99);
    box-shadow:
      0 0 0 2px var(--tanim),
      0 1px 2px rgba(22,33,27,.06),
      0 0 0 6px rgba(11,107,65,.14);
  }
  .a-setup .pick-field:disabled {
    background-color: rgba(118,118,128,.08); background-image: none;
    box-shadow: 0 0 0 1px rgba(22,33,27,.06), 0 0 0 0 transparent, 0 0 0 0 transparent;
  }
  /* Province is fixed, so it is shown rather than asked: a quiet grey row, the
     way iOS shows a setting that can't be changed here. */
  .a-locked {
    display: flex; align-items: center; gap: 12px;
    min-height: 60px; padding: 0 18px; border-radius: 16px;
    background: rgba(118,118,128,.1); font-size: var(--fs-lead); color: var(--ink);
  }
  .a-locked-note { margin-left: auto; font-size: var(--fs-label); color: var(--text-faint); }
  /* +63 and the number are one field, as in the iOS phone field: the prefix
     sits inside it behind a short divider, and the ring goes round both. */
  .a-prefix-row { display: flex; align-items: stretch; }
  .a-prefix {
    position: relative; display: flex; align-items: center; flex-shrink: 0; padding: 0 14px 0 18px;
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-lead); color: var(--text-soft);
  }
  .a-prefix::after {
    content: ""; position: absolute; right: 0; top: 16px; bottom: 16px; width: 1px; background: var(--line);
  }
  .a-prefix-row .a-inp,
  .a-prefix-row .a-inp:focus,
  .a-prefix-row .a-inp.bad { background: transparent; box-shadow: none; border-radius: 0 16px 16px 0; padding-left: 14px; }
  .a-pwrow { position: relative; display: flex; align-items: center; }
  .a-pwrow .a-inp { padding-right: 106px; }
  /* Show / Hide as a word in a soft green capsule inside the field: a word
     an older reader can't mistake, in the shape iOS uses for small inline
     actions. The word swaps with a short blur. */
  .a-reveal {
    position: absolute; right: 7px; height: 48px; min-width: 88px; padding: 0 14px;
    border: none; border-radius: var(--r-pill); background: rgba(11,107,65,.08); color: var(--tanim);
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-label); cursor: pointer;
    transition: transform 160ms var(--ease-out), background-color 140ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .a-reveal:active { transform: scale(.95); background: rgba(11,107,65,.15); }
  .a-alert {
    display: flex; gap: 12px; align-items: flex-start; background: var(--error-sk);
    box-shadow: 0 0 0 1px rgba(165,35,27,.14); border-radius: 16px;
    padding: 14px 16px; margin-top: 20px; font-size: var(--fs-label); line-height: 1.45; color: var(--error);
  }
  .a-alert svg { flex: 0 0 22px; margin-top: 1px; }
  /* Errors arrive rather than appear: a short drop from above, so the eye
     catches the change without being startled by it. */
  .a-alert { animation: a-alert-in 220ms var(--ease-out); }
  @keyframes a-alert-in { from { opacity: 0; transform: translateY(-6px) scale(.98); } to { opacity: 1; transform: none; } }
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
  /* Links keep their underline, a cue this audience relies on, but a light
     one: thin, set off from the letters and half the strength of the text. */
  .a-link {
    display: inline-flex; align-items: center; min-height: 52px; color: var(--tanim);
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-body);
    text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 5px;
    text-decoration-color: color-mix(in srgb, currentColor 45%, transparent);
    cursor: pointer; background: none; border: none; padding: 0 4px;
    transition: opacity 140ms ease; -webkit-tap-highlight-color: transparent;
  }
  .a-link:active { opacity: .55; transition-duration: 0ms; }
  .a-switch { text-align: center; font-size: var(--fs-body); color: var(--dilim); margin-top: 6px; }
  .a-switch .a-link { min-height: auto; }
  /* In the ink header: left-aligned under the subtitle, link in the palay
     accent so it reads as tappable on dark. The link keeps a 44px hit area
     without adding visible height. */
  .a-switch.on-ink { text-align: left; color: rgba(255,255,255,.72); margin-top: 14px; font-size: var(--fs-label); }
  .a-switch.on-ink .a-link { color: var(--palay); font-size: var(--fs-label); min-height: 44px; margin: -12px 0; padding: 0 4px; }

  /* ── Crop picker ───────────────────────────────────────────────────────── */
  /* White tiles on the grey page, like the setup card: a hairline and a soft
     shadow at rest. Picked, a green ring closes round the tile and its
     corner circle fills with a check, with the same pop as the setup radios.
     The empty circle is there from the start, so the tiles say "pick any"
     before they're touched. */
  .a-cropgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }
  .a-crop {
    position: relative; background: var(--card); border: none; cursor: pointer; text-align: left;
    border-radius: 20px; padding: 16px 14px; display: flex; flex-direction: column; gap: 10px; min-height: 124px;
    box-shadow:
      0 0 0 1px rgba(22,33,27,.07),
      0 1px 2px rgba(22,33,27,.06),
      0 10px 22px -16px rgba(22,33,27,.32);
    transition: transform 180ms var(--ease-out), box-shadow 200ms var(--ease-out), background-color 200ms ease;
    touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  }
  .a-crop:active { transform: scale(.97); }
  .a-crop.on {
    background: #F3FAF6;
    box-shadow:
      0 0 0 2px var(--tanim),
      0 1px 2px rgba(11,107,65,.12),
      0 12px 24px -14px rgba(11,107,65,.45);
  }
  /* Emoji are artwork, not text, and deliberately off the type ramp. */
  .a-crop-emoji { font-size: 34px; line-height: 1; display: block; }
  .a-crop-n { font-family: var(--font-display); font-weight: 600; font-size: var(--fs-lead); line-height: 1.1; display: block; }
  .a-crop-e { font-size: var(--fs-label); color: var(--text-faint); margin-top: 3px; display: block; }
  .a-crop-tick {
    position: absolute; top: 12px; right: 12px; width: 26px; height: 26px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: inset 0 0 0 2px var(--line-strong);
    transition: background-color 160ms ease, box-shadow 160ms ease;
  }
  .a-crop.on .a-crop-tick {
    background: var(--tanim);
    box-shadow: inset 0 0 0 2px var(--tanim), 0 2px 6px -1px rgba(11,107,65,.45);
    animation: a-radio-pop 260ms var(--ease-out);
  }
  .a-crop-tick svg { opacity: 0; transform: scale(.6); transition: opacity 100ms ease, transform 140ms var(--ease-out); }
  .a-crop.on .a-crop-tick svg { opacity: 1; transform: none; transition: opacity 140ms var(--ease-out), transform 180ms var(--ease-out); }
  .a-count {
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-label);
    color: var(--text-muted); font-variant-numeric: tabular-nums; margin-bottom: 12px; padding-left: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    .a-step[data-anim] { animation: a-step-fade 200ms ease both; }
    @keyframes a-step-fade { from { opacity: 0; } to { opacity: 1; } }
    .a-hint.ok .a-hint-ico, .a-crop.on .a-crop-tick { animation: none; }
    .a-crop-tick svg, .a-crop.on .a-crop-tick svg { transform: none; }
    .a-setup .pick-field:active { transform: none; }
    .a-seg:has(button.on:active) { --seg-s: 1; }
  }

  /* ── Create account: one question per page ─────────────────────────────── */
  /* The header keeps the brand row and gains the progress: "Step 2 of 6" in
     words, and a row of gold segments that fill as each question is
     answered. The header stays mounted between questions, so the next
     segment visibly fills from its left end (and empties back towards it on
     Back) instead of the bar being redrawn. Gold is the accent the ink
     allows; on paper it would fail contrast, so it lives up here. */
  .a-askhead { padding-bottom: 22px; }
  .a-progress { margin-top: 18px; display: flex; flex-direction: column; gap: 10px; }
  .a-progress-t { font-family: var(--font-display); font-weight: 600; font-size: var(--fs-label); color: rgba(255,255,255,.74); }
  .a-progress-bar { display: flex; gap: 6px; }
  .a-progress-seg { flex: 1; height: 6px; border-radius: 3px; background: rgba(255,255,255,.16); overflow: hidden; }
  .a-progress-seg > span {
    display: block; height: 100%; border-radius: inherit; background: var(--palay);
    transform: scaleX(0); transform-origin: left center;
    transition: transform 360ms var(--ease-out);
  }
  .a-progress-seg > span.on { transform: none; }

  /* No dead space. The answer area is only as tall as the answer, so it
     sits right above Continue in the thumb zone, and the header takes every
     spare pixel: whoever is asking stands in it, as on the role step, and
     grows with the room.
     On a short phone, or once the keyboard is up, the header shrinks to the
     brand row and the progress, and the figure sinks out of the way instead
     of being squeezed: the question and the answer are what matter then. */
  .a-askscreen .a-scroll { flex: 0 1 auto; }
  /* min-content, because a header that clips its overflow may otherwise be
     squeezed below its own brand row and progress; this way it shrinks only
     as far as the figure's room, and the brand and the bar are never cut. */
  .a-askhead { flex: 1 1 auto; min-height: min-content; display: flex; flex-direction: column; padding-bottom: 0; }
  .a-askstage { flex: 1 1 auto; min-height: 20px; margin-top: 6px; container-type: size; }
  .a-askstage .a-cast { height: min(100%, 340px); transition: opacity 200ms ease, transform 260ms var(--ease-out); }
  .a-askstage .a-cast[data-fig="buyer"] { height: min(100%, 290px); }
  @container (max-height: 120px) {
    .a-askstage .a-cast { opacity: 0; transform: translateY(28px); }
  }

  /* The question, in a white bubble just under the header, the same 22px
     below it as the cards on the language and role steps, its point aimed up
     at the one asking. It sits clear of the header rather than over it, so
     it never covers the figure's waving hand. Outside the scrolling area, so
     it stays in view while the answer is typed. It grows out of its point as
     each question arrives. */
  .a-ask {
    position: relative; z-index: 2; flex: none;
    margin: 22px 22px 0; padding: 16px 18px 17px;
    background: var(--card); border-radius: 22px;
    box-shadow:
      0 0 0 1px rgba(22,33,27,.05),
      0 2px 4px rgba(22,33,27,.06),
      0 18px 34px -20px rgba(22,33,27,.5);
    transform-origin: calc(100% - 80px) 0;
    animation: a-ask-pop 300ms var(--ease-out) 60ms both;
  }
  .a-ask::before {
    content: ""; position: absolute; top: -7px; right: 72px; width: 16px; height: 16px;
    background: var(--card); border-radius: 3px 0 0 0; transform: rotate(45deg);
  }
  @keyframes a-ask-pop { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: none; } }
  .a-ask-q {
    font-family: var(--font-display); font-weight: 700; font-size: var(--fs-title);
    line-height: 1.22; letter-spacing: -.015em; color: var(--ink); text-wrap: pretty;
  }
  .a-ask-why { margin-top: 6px; font-size: var(--fs-label); line-height: 1.45; color: var(--text-faint); text-wrap: pretty; }

  /* The answer goes right under the question. */
  .a-ask-body { padding-top: 18px; }
  .a-ask-body > .a-field:first-child, .a-ask-body > .a-cropgrid { margin-top: 0; }
  .a-ask-body .a-switch { margin-top: 14px; }
  /* A one-line answer is typed large, like a reply, not like a form field. */
  .a-inp-lg {
    min-height: 64px; font-family: var(--font-display); font-weight: 500;
    font-size: var(--fs-title); letter-spacing: -.01em;
  }
  /* A number with its unit after it, "12 | years": the prefix field turned
     round, the divider on the unit's left. */
  .a-suffix { padding: 0 18px 0 14px; color: var(--text-faint); font-weight: 500; }
  .a-suffix::after { left: 0; right: auto; }
  .a-unit-row .a-inp, .a-unit-row .a-inp:focus, .a-unit-row .a-inp.bad { border-radius: 16px 0 0 16px; padding-left: 18px; }

  @media (prefers-reduced-motion: reduce) {
    .a-ask { animation: a-step-fade 200ms ease both; }
    .a-askstage .a-cast { transition: opacity 200ms ease; transform: none; }
  }
`;
