import riceFieldWide from "../assets/rice-field-wide.webp";
import expensesBg from "../assets/expenses-terraces.webp";
import wxDay from "../assets/wx-day.webp";
import wxNight from "../assets/wx-night.webp";

export const appCss = `
  /* Tokens (colour, type ramp, radii, motion) live in styles/tokens.ts,
     injected once at the root of App.tsx. */






  /* ── Shell ── */
  .shell {
    --bnav-h: 64px;
    width: 390px; height: 844px;
    background: var(--bg); display: flex; flex-direction: column;
    overflow: hidden; border-radius: 44px;
    box-shadow: 0 36px 70px rgba(20,15,5,0.45), 0 0 0 10px var(--ink);
    margin: auto; position: relative;
  }
  .outer {
    min-height: 100dvh; background: var(--paper-alt);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }

  /* ── Responsive: full screen on mobile / Android ── */
  @media (max-width: 430px) {
    .outer { padding: 0; background: var(--bg); align-items: flex-start; }
    .shell {
      width: 100vw;
      height: 100dvh;
      border-radius: 0;
      box-shadow: none;
      padding-top: var(--safe-top);
      padding-bottom: var(--safe-bottom);
    }
  }

  /* ── Offline Banner ── */
  .offline-banner {
    background: var(--ink); color: var(--paper);
    padding: 9px 18px; font-size: var(--fs-label); font-weight: 600;
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0; gap: 8px;
  }
  .offline-left  { display: flex; align-items: center; gap: 7px; }
  .offline-dot   { width: 8px; height: 8px; border-radius: 50%; background: var(--error); flex-shrink: 0; }
  @media (prefers-reduced-motion: no-preference) { .offline-dot { animation: pulse 1.5s infinite; } }
  .online-dot    { background: var(--tanim); animation: none; }
  .offline-time  { font-size: var(--fs-label); color: var(--text-faint); }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  /* ── Screen ── */
  .screen { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
  /* Scroll edge effect, not a hard divider: content dissolves into the paper in
     the gap under the floating bar instead of being sliced off mid-line. Sits
     under the bar (z-index 39 < 40) and never eats a tap. A gradient overlay
     rather than a mask on .scroll — masking the scroller costs a compositing
     layer on every frame, which is not a bill to hand a budget handset. */
  .screen::after {
    content: ""; position: absolute; left: 0; right: 0; bottom: 0;
    height: 30px; z-index: 39; pointer-events: none;
    background: linear-gradient(to top, var(--paper) 30%, transparent);
  }

  /* ── Header ── */
  .hdr {
    height: 66px; background: var(--white); flex-shrink: 0;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 18px; border-bottom: 1px solid var(--border);
  }
  .hdr-brand { display: flex; align-items: center; gap: 11px; }
  .hdr-icon { font-size: 23px; display: flex; }
  .hdr-title { font-family: var(--font-display); font-size: var(--fs-body); font-weight: 700; color: var(--text); line-height: 1.15; }
  .hdr-sub   { font-size: var(--fs-label); color: var(--text-muted); margin-top: 1px; }
  .hdr-right { display: flex; align-items: center; gap: 12px; }
  /* A real button, not a div: it is a tap target, so it gets a 40px box, a
     label for screen readers, and press feedback like everything else. */
  .notif {
    position: relative; width: 40px; height: 40px; border-radius: 50%;
    border: none; background: none; cursor: pointer; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: transform 190ms var(--ease-out), background-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .notif:active { transition-duration: 100ms; transform: scale(0.94); background: var(--paper-alt); }
  /* The badge was 16px type in a 15px pill hung off a 19px bell, which is what
     made it read as a blob. 12px in a 17px disc, tucked onto the bell rather
     than floating clear of it, and ringed in the header's own white so it
     reads as a badge instead of a collision. */
  /* Hung off the glyph, not the button box, so it clips the bell's top-right
     corner the way a badge should instead of sitting on top of it. */
  .notif-ico { position: relative; display: flex; }
  /* Two icon buttons side by side: each is a 40px hit area round a 21px glyph,
     so the header gap plus both paddings left ~31px of air between the cart
     and the bell, against ~21px between the bell and the avatar. Overlapping
     the hit areas evens the rhythm without shrinking either target. */
  .hdr-right .notif + .notif { margin-left: -8px; }
  .nbadge {
    position: absolute; top: -7px; right: -8px;
    min-width: 16px; height: 16px; padding: 0 4px;
    display: flex; align-items: center; justify-content: center;
    background: var(--red); color: #fff;
    font-size: 11px; font-weight: 800; line-height: 1;
    border-radius: 99px; box-shadow: 0 0 0 2px var(--white);
    font-variant-numeric: tabular-nums;
  }
  .hdr-back {
    background: var(--tanim-sk); border: 1px solid var(--tanim-sk); border-radius: 8px;
    width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; margin-right: 8px; flex-shrink: 0;
  }
  .hdr-back svg { transition: color var(--dur-fast) ease; }

  /* The small pill in a header — Edit / Save on the profile. Was two inline
     styles with no press state; now one control with two skins. */
  .chip-btn {
    background: var(--tanim-sk); border: 1px solid var(--tanim-sk); border-radius: 8px;
    padding: 5px 12px; font-family: inherit; font-size: var(--fs-label);
    font-weight: 700; color: var(--tanim); cursor: pointer;
    transition: transform 190ms var(--ease-out), background-color var(--dur-fast) ease,
                color var(--dur-fast) ease, border-color var(--dur-fast) ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .chip-btn.on { background: var(--tanim); border-color: var(--tanim); color: #fff; }
  .chip-btn:active { transition-duration: var(--dur-press); transform: scale(0.94); }

  /* Crop toggles in the profile editor. Selection cross-fades; before this
     the whole pill swapped colour on a single frame, which on a grid of a
     dozen of them makes it genuinely unclear which one you just hit. */
  .crop-toggle {
    display: flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 99px;
    border: 1px solid var(--line); background: var(--card); color: var(--text-muted);
    font-family: inherit; font-size: var(--fs-label); font-weight: 600; cursor: pointer;
    transition: transform 190ms var(--ease-out), background-color var(--dur-fast) ease,
                color var(--dur-fast) ease, border-color var(--dur-fast) ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .crop-toggle.on { background: var(--tanim-sk); border-color: var(--tanim); color: var(--tanim); }
  .crop-toggle:active { transition-duration: var(--dur-press); transform: scale(0.95); }

  /* ── Alerts sheet ────────────────────────────────────────────────────────
     What the bell opens. Same bottom-sheet shape as the other sheets so it is
     dismissed the way the rest of the app already taught. */
  /* The scrim, the tap-to-dismiss and the stacking context all come from
     .shm-scrim now (components/ui/Sheet.tsx). Each sheet only describes what
     it looks like. */
  .alerts-sheet {
    width: 100%; max-height: 82%; background: var(--paper);
    border-radius: 24px 24px 0 0; padding-bottom: 22px;
  }
  .alerts-head {
    background: var(--tanim); border-radius: 24px 24px 0 0; padding: 20px 20px 18px;
    display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
  }
  .alerts-head-t { font-family: var(--font-display); font-size: var(--fs-lead); font-weight: 800; color: #fff; }
  .alerts-head-s { font-size: var(--fs-label); color: rgba(255,255,255,.82); margin-top: 3px; line-height: 1.35; }
  .alerts-close {
    background: rgba(255,255,255,.2); border: none; border-radius: 50%;
    width: 40px; height: 40px; flex-shrink: 0; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: transform 190ms var(--ease-out), background-color 160ms ease;
  }
  .alerts-close:active { transition-duration: 100ms; transform: scale(0.94); background: rgba(255,255,255,.32); }
  .alerts-body { padding: 14px 16px 0; display: flex; flex-direction: column; gap: 10px; }
  .alert-row {
    display: flex; align-items: center; gap: 13px; padding: 14px;
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius); box-shadow: var(--shadow-sm);
  }
  .alert-ico {
    width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .alert-txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .alert-t { font-size: var(--fs-label); font-weight: 700; color: var(--text); }
  .alert-b { font-size: var(--fs-label); color: var(--text-muted); line-height: 1.4; }
  .alerts-empty { padding: 26px 6px 10px; text-align: center; }
  .alerts-empty-t { font-size: var(--fs-body); font-weight: 700; color: var(--text); }
  .alerts-empty-s { font-size: var(--fs-label); color: var(--text-muted); margin-top: 6px; line-height: 1.5; }
  .ava {
    font-family: inherit; padding: 0;
    width: 34px; height: 34px; border-radius: 50%;
    background: var(--tanim);
    color:#fff; font-size: var(--fs-label); font-weight:700;
    display:flex; align-items:center; justify-content:center;
    border: 2px solid var(--tanim-sk); cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  /* Gated: on a touchscreen :hover latches on tap and the state sticks. */
  @media (hover: hover) and (pointer: fine) {
    .ava:hover { box-shadow: 0 0 0 3px var(--line); }
  }

  /* ── Scroll ── */
  .scroll {
    flex: 1; overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 14px;
    /* The bar floats over this, so the last card needs room to clear it
       rather than coming to rest underneath. */
    padding-bottom: calc(var(--bnav-h) + 26px);
  }
  .scroll > * { flex-shrink: 0; }
  .scroll::-webkit-scrollbar { display: none; }

  /* ── Card ── */
  /* ── Surfaces ────────────────────────────────────────────────────────────
     Three levels, not one card repeated. Every box looking identical is what
     makes a screen read as a wall of panels with no rank to it.

       .panel  recessed, tinted, no shadow  → groups of related rows
       .card   white, hairline, soft shadow → content that stands on its own
       hero    photo or ink, one per screen → the anchor you land on           */
  .card { background: var(--white); border-radius: var(--radius); padding: 16px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
  .card-title { font-size: var(--fs-label); font-weight: 700; color: var(--text); margin-bottom: 13px; }
  .panel {
    background: var(--paper-alt); border-radius: var(--radius);
    padding: 14px; border: 1px solid transparent;
  }
  .panel-title { font-size: var(--fs-label); font-weight: 700; color: var(--text-soft); margin-bottom: 11px; }

  /* ── Stat tile ───────────────────────────────────────────────────────────
     A figure with the shape it came from. The mark is decorative; the number
     beside it is what carries the meaning. */
  .stat {
    display: flex; flex-direction: column; gap: 7px;
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 15px 14px; box-shadow: var(--shadow-sm);
  }
  /* Scoped to .stat on purpose. These four declarations used to be written
     unscoped, and a second, later ".stat-val / .stat-lbl" block further down
     the sheet overrode every one of them — so the tile documented above has
     never actually rendered: the figure was body-coloured at --fs-lead rather
     than green at --fs-title, and the tabular-nums that keeps a changing
     figure from wobbling was dropped with it. Scoping is the fix; the other
     block stays as the base for the plain .card stat, which is what it was
     always describing. */
  .stat .stat-lbl { font-size: var(--fs-label); font-weight: 600; color: var(--text-muted); line-height: 1.3; margin-top: 0; }
  .stat .stat-val { font-family: var(--font-display); font-size: var(--fs-title); font-weight: 800; color: var(--tanim); line-height: 1; font-variant-numeric: tabular-nums; }
  .stat .stat-val.sm { font-size: var(--fs-lead); }
  .stat-foot { font-size: var(--fs-label); color: var(--text-muted); line-height: 1.3; }
  .stat-mark { display: flex; align-items: center; min-height: 26px; }

  /* Four figures on one recessed strip, instead of four competing white boxes. */
  .stat-strip { display: flex; background: var(--paper-alt); border-radius: var(--radius); overflow: hidden; }
  .stat-strip > * { flex: 1; min-width: 0; padding: 14px 10px; display: flex; flex-direction: column; gap: 4px; align-items: center; text-align: center; }
  .stat-strip > * + * { border-left: 1px solid var(--line); }
  .stat-strip .stat-val { font-size: var(--fs-lead); }
  .stat-strip .stat-lbl { font-size: var(--fs-label); }

  /* ── Micro viz ───────────────────────────────────────────────────────────── */
  .mv-dots { display: grid; justify-content: start; }
  .mv-dot { border-radius: 50%; background: var(--line); }
  .mv-dot.on { background: var(--tanim); }
  .mv-spark { display: block; overflow: visible; }
  .mv-bar { display: block; width: 100%; background: var(--line); border-radius: 99px; overflow: hidden; }
  .mv-bar-fill { display: block; height: 100%; border-radius: 99px; }

  /* ── Affordance ──────────────────────────────────────────────────────────
     A row that navigates says so: a chevron on the right, and a surface that
     actually changes under the thumb. Press feedback alone is invisible until
     you have already committed to the tap. */
  .row-link {
    display: flex; align-items: center; gap: 13px; width: 100%;
    padding: 14px; background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius); text-align: left; font-family: inherit;
    cursor: pointer; min-height: 52px;
  }
  .row-link:active { background: var(--paper-alt); }
  .row-link .row-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .row-link .row-chev { flex-shrink: 0; color: var(--text-faint); display: flex; }
  .row-link:active .row-chev { color: var(--tanim); }

  /* Selection reads as weight, not only colour: 1px hairline becomes a 2px ring. */
  .selectable { border: 1px solid var(--border); transition: border-color 160ms ease, background-color 160ms ease; }
  .selectable.on { border: 2px solid var(--tanim); background: var(--tanim-sk); padding: calc(var(--pad, 14px) - 1px); }


  /* ── Grid 2 ── */
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }

  /* ── Stat card ──
     The plain figure inside a .card or a .stat-strip. Tabular figures here
     too: these numbers change under the user (a filter, a refresh), and
     proportional digits make the whole row shuffle sideways when they do. */
  .stat-ico { font-size: 21px; margin-bottom: 6px; }
  .stat-val { font-size: var(--fs-lead); font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums; }
  .stat-lbl { font-size: var(--fs-label); color: var(--text-muted); margin-top: 2px; }

  /* ── Hero ── */
  .hero {
    background: var(--tanim);
    border-radius: var(--radius); padding: 20px; position: relative; overflow: hidden;
    display: flex; align-items: center; justify-content: space-between; color: #fff;
  }
  .hero-greet { font-family: var(--font-display); font-size: var(--fs-body); font-weight: 700; margin-bottom: 4px; }
  .hero-loc   { font-size: var(--fs-label); opacity: .85; }
  .hero-emoji { font-size: 40px; }

  .sec-title { font-family: var(--font-display); font-size: var(--fs-lead); font-weight: 700; color: var(--text); }
  .sec-sub   { font-size: var(--fs-label); color: var(--text-muted); margin-top: 2px; }

  /* ── Badge ── */

  /* ── Price list ── */
  .price-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border); }
  .price-row:last-child { border-bottom:none; }
  .pname-row { display:flex; align-items:center; gap:8px; margin-bottom:3px; }
  .pname  { font-size: var(--fs-label); font-weight:600; color:var(--text); }
  .pvol   { font-size: var(--fs-label); color:var(--text-muted); }
  .pright { display:flex; align-items:center; gap:7px; }
  .pprice { font-size: var(--fs-body); font-weight:800; color:var(--text); }
  .punit  { font-size: var(--fs-label); color:var(--text-muted); }

  /* ── Market: Top Movers ── */
  .movers-row { display:flex; gap:10px; }
  .movers-col { flex:1; background:var(--white); border-radius:14px; padding:13px; border:1px solid var(--paper-alt); }
  .movers-col-title { font-size: var(--fs-label); font-weight:700; margin-bottom:9px; display:flex; align-items:center; gap:5px; }
  .mover-item { display:flex; justify-content:space-between; align-items:center; padding:5px 0; }
  .mover-item-name { font-size: var(--fs-label); font-weight:600; color:var(--text); }
  .mover-item-chg { font-size: var(--fs-label); font-weight:700; flex-shrink:0; margin-left:8px; }

  /* ── Market: ticker rows ── */
  .mkt-list-hdr { font-size: var(--fs-label); font-weight:700; color:var(--text-muted); margin-top:2px; }
  .mp-list-hdr-row { display:flex; align-items:center; justify-content:space-between; }
  /* A card per crop, sitting on the green ground. Photograph, name, and the
     crop group in green on the left; price and its move stacked right; a
     chevron because the row opens the crop. */
  .mkt-row {
    display:flex; align-items:center; gap:12px; padding:12px 12px;
    border-radius:16px; background:var(--white); border:1px solid var(--line);
    box-shadow: var(--shadow-sm);
  }
  .mkt-row-body { flex:1; min-width:0; }
  .mkt-row-chev { color:var(--line-strong); flex-shrink:0; margin-left:2px; }
  .mkt-row:active .mkt-row-chev { color:var(--tanim); }
  .mkt-row-ico  { width:42px; height:42px; border-radius:12px; background:var(--green-bg); display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden; }
  /* The photo fills the tile. A faint inset edge stops a pale crop (milled
     rice, garlic) from bleeding into the white row behind it. */
  .mkt-row-ico img { width:100%; height:100%; object-fit:cover; display:block; box-shadow: inset 0 0 0 1px rgba(22,33,27,.10); }
  .mkt-row-name { font-size: var(--fs-label); font-weight:700; color:var(--text); }
  .mkt-row-unit { font-size: var(--fs-label); color:var(--tanim); font-weight:600; margin-top:1px; }
  .mkt-row-right { margin-left:auto; text-align:right; flex-shrink:0; }
  .mkt-row-price { font-family: var(--font-display); font-size: var(--fs-body); font-weight:800; color:var(--text); font-variant-numeric: tabular-nums; }
  .mkt-row-chg { font-size: var(--fs-label); font-weight:700; display:flex; align-items:center; gap:3px; justify-content:flex-end; margin-top:2px; font-variant-numeric: tabular-nums; }
  .mkt-row-chg.up   { color: var(--tanim); }
  .mkt-row-chg.down { color: var(--error); }

  /* ── Chart ── */
  .chart-svg { width:100%; height:auto; }
  .legend { display:flex; gap:16px; justify-content:center; margin-top:9px; }
  .leg-item { display:flex; align-items:center; gap:5px; font-size: var(--fs-label); color:var(--text-muted); font-weight:600; }
  .leg-dot  { width:9px; height:9px; border-radius:50%; }

  /* ── Bottom nav ──────────────────────────────────────────────────────────
     A floating layer, not a strip. Content scrolls underneath a translucent
     bar instead of stopping dead at an opaque edge, which is what makes the
     screen read as one surface with chrome above it. */
  .bnav {
    position: absolute; z-index: 40;
    left: 14px; right: 14px; bottom: 12px;
    height: var(--bnav-h); padding: 6px;
    /* A capsule, like the iOS tab bar: the ends are fully round, so it reads
       as one object floating over the page rather than a docked strip. */
    border-radius: 999px;
    /* Glass. The tint is thin enough that content reads through it; the blur
       and the saturate are what turn that into a material rather than a
       washed-out panel. A sheen across the top-left catches the light. */
    background:
      linear-gradient(155deg, rgba(255,255,255,.46), rgba(255,255,255,.14) 52%, rgba(255,255,255,0) 82%),
      rgba(255,255,255,.58);
    backdrop-filter: blur(28px) saturate(190%);
    -webkit-backdrop-filter: blur(28px) saturate(190%);
    /* Bright top edge is light catching the material, the hairline is its
       rim, and the wide soft shadow is what lifts it off the page. */
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.95),
      inset 0 0 0 1px rgba(22,33,27,.07),
      0 14px 36px -12px rgba(22,33,27,.32),
      0 3px 10px -4px rgba(22,33,27,.14);
  }
  .bnav-track { position: relative; display: flex; height: 100%; }

  /* The one moving part. Transform only, so it stays on the compositor, and
     no overshoot: a tab switch has no momentum behind it, so a critically
     damped settle (the curve below) is what Apple uses for the same move. */
  .bnav-pill {
    position: absolute; top: 0; bottom: 0; left: 0; width: calc(100% / var(--n));
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(11,107,65,.16), rgba(11,107,65,.11));
    box-shadow: inset 0 1px 0 rgba(255,255,255,.7), inset 0 0 0 1px rgba(11,107,65,.10);
    transition: transform 340ms cubic-bezier(.32,.72,0,1), opacity 160ms ease;
    pointer-events: none;
  }

  .ntab {
    position: relative; flex: 1; min-width: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
    background: none; border: none; cursor: pointer; padding: 0; border-radius: 999px;
    color: #6B736E;
    transition: color 200ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .ntab.on { color: var(--green); }
  /* Feedback on the press itself, not on release. Scaling the content rather
     than the button keeps the pill beneath perfectly still. */
  .ntab-ico, .ntab-lbl { transition: transform 160ms var(--ease-out); }
  .ntab:active .ntab-ico, .ntab:active .ntab-lbl { transform: scale(.92); transition-duration: 90ms; }
  .ntab-ico { display: flex; }
  /* Apple-sized tab labels: small, but set heavier with a hair of positive
     tracking, which is what keeps small type legible over glass. One size
     for every tab so "Merkado" and "Home" sit on the same baseline. */
  .ntab-lbl {
    font-family: var(--font-display); font-size: 12px; line-height: 1; font-weight: 600;
    letter-spacing: .01em; white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
  }
  .ntab.on .ntab-lbl { font-weight: 700; }

  @media (prefers-reduced-motion: reduce) {
    .bnav-pill { transition: opacity 160ms ease; }
    .ntab:active .ntab-ico, .ntab:active .ntab-lbl { transform: none; }
  }

  /* Translucency is a preference, not a requirement. Both of these fall back
     to a solid bar rather than a washed-out one. */
  @media (prefers-reduced-transparency: reduce) {
    .bnav {
      background: var(--card);
      backdrop-filter: none; -webkit-backdrop-filter: none;
    }
  }
  @media (prefers-contrast: more) {
    .bnav {
      background: var(--card);
      backdrop-filter: none; -webkit-backdrop-filter: none;
      box-shadow: inset 0 0 0 2px var(--text), 0 8px 24px -10px rgba(22,33,27,.3);
    }
  }
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .bnav { background: var(--card); }
  }

  /* ── Expenses ── */
  /* Flooded rice terraces (a crop of the splash photo): the money screen sits
     on the farm it's spent on, for farmer and buyer alike. No colour cast:
     the photograph carries the card and is simply darkened enough to hold
     white text. The base is ink rather than green so a failed
     image load falls back to the same dark, not to a different card. */
  .exp-hero {
    position: relative; isolation: isolate; overflow: hidden;
    background: var(--ink); border-radius: var(--radius);
    padding: 26px 18px; color: #fff; text-align: center;
  }
  .exp-hero::before {
    content: ""; position: absolute; inset: 0; z-index: -1;
    background-image:
      linear-gradient(100deg, rgba(16,21,18,.70) 0%, rgba(16,21,18,.56) 45%, rgba(16,21,18,.40) 100%),
      url(${expensesBg});
    background-size: cover, cover;
    background-position: center, center;
  }
  .exp-total-lbl { font-size: var(--fs-label); opacity:.94; margin-bottom:6px; font-weight:500; text-shadow: 0 1px 3px rgba(11,15,12,.6); }
  .exp-total { font-family: var(--font-display); font-size: var(--fs-display); font-weight:700; text-shadow: 0 1px 4px rgba(11,15,12,.55); }

  .frow { display:flex; gap:8px; overflow-x:auto; padding-bottom:2px; flex-shrink:0; }
  .frow::-webkit-scrollbar { display:none; }
  .fchip { flex-shrink:0; background:var(--white); border:1.5px solid var(--border); border-radius:99px; padding:7px 14px; font-size: var(--fs-label); font-weight:600; color:var(--text-muted); cursor:pointer; font-family:inherit; }
  .fchip.on { background:var(--green); border-color:var(--green); color:#fff; }

  .exp-row { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--border); }
  .exp-row:last-child { border-bottom:none; }
  .exp-ico { width:40px; height:40px; border-radius:12px; background:var(--green-bg); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  /* ── Purchase history ──────────────────────────────────────────────────── */
  .ph-card { padding-bottom: 6px; }
  .ph-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 4px; }
  .ph-count { font-size: 14px; color: var(--text-faint); font-variant-numeric: tabular-nums; }
  /* Month labels: small caps-ish, tracked out, so they read as signposts and
     never compete with the rows. */
  .ph-month {
    margin: 16px 0 2px; font-family: var(--font-display); font-size: 12.5px; font-weight: 700;
    letter-spacing: .06em; text-transform: uppercase; color: var(--text-faint);
  }
  .ph-group:first-child .ph-month { margin-top: 10px; }
  .ph-row {
    position: relative; display: grid; grid-template-columns: 54px minmax(0, 1fr) auto;
    align-items: start; column-gap: 12px; padding: 12px 0;
  }
  /* Inset divider, starting where the text does, as iOS lists draw it: the
     photos stay one clean column and the lines separate text from text. */
  .ph-row + .ph-row::before {
    content: ""; position: absolute; top: 0; left: 66px; right: 0; height: 1px; background: var(--line);
  }
  .ph-body { min-width: 0; padding-top: 1px; }
  .ph-title {
    font-family: var(--font-display); font-size: 16px; font-weight: 700; line-height: 1.25; color: var(--text);
    letter-spacing: -.01em;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .ph-sub { margin-top: 3px; font-size: 14px; line-height: 1.35; color: var(--text-muted); font-variant-numeric: tabular-nums; }
  /* One line, always: a long name or town is cut with an ellipsis rather
     than breaking the row into a ragged third and fourth line. */
  .ph-seller {
    display: flex; align-items: center; gap: 6px; margin-top: 4px;
    font-size: 14px; line-height: 1.35; color: var(--text-faint); min-width: 0;
  }
  .ph-seller svg { flex-shrink: 0; }
  .ph-seller span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ph-end { text-align: right; padding-top: 1px; }
  .ph-amt {
    font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--text);
    font-variant-numeric: tabular-nums; white-space: nowrap; line-height: 1.25;
  }
  .ph-date { margin-top: 3px; font-size: 13.5px; color: var(--text-faint); white-space: nowrap; }

  /* ── Tappable history rows (farmer expenses) ─────────────────────────────
     Same anatomy as the purchase history, plus a chevron that says "opens".
     The row extends 10px past the text on each side so the press plate has
     room to breathe, and the plate is the feedback: a list row is too wide
     for a visible scale, but a surface appearing under the thumb is not. */
  .ph-row.is-tap {
    width: calc(100% + 20px); margin: 0 -10px; padding: 12px 10px; border: none; border-radius: 14px;
    background: transparent; font: inherit; color: inherit; text-align: left; cursor: pointer;
    grid-template-columns: 44px minmax(0, 1fr) auto 18px; align-items: center;
    transition: background-color 180ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .ph-row.is-tap:active { background: var(--paper); transition-duration: 0ms; }
  .ph-row.is-tap + .ph-row.is-tap::before { left: 66px; right: 10px; }
  /* The divider on either side of a pressed row steps back, so the plate
     reads as one clean shape instead of a box with lines through it. */
  .ph-row.is-tap:active::before, .ph-row.is-tap:active + .ph-row.is-tap::before { opacity: 0; }
  .ph-row.is-tap .ph-body, .ph-row.is-tap .ph-end { display: block; }
  .ph-row.is-tap .ph-title, .ph-row.is-tap .ph-sub, .ph-row.is-tap .ph-amt, .ph-row.is-tap .ph-date { display: block; }
  .ph-row.is-tap .ph-title { display: -webkit-box; }
  .ph-chev { color: var(--line-strong); justify-self: end; }
  /* Neutral tile: the category is told by the glyph, not by another green. */
  .exp-tile {
    width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
    background: var(--paper); box-shadow: inset 0 0 0 1px var(--line);
  }
  .exp-del-link {
    align-self: center; display: inline-flex; align-items: center; gap: 8px;
    min-height: 44px; padding: 0 14px; margin-bottom: 6px; border: none; border-radius: 12px; cursor: pointer;
    background: transparent; color: var(--error); font-family: var(--font-display); font-weight: 600; font-size: 15px;
    transition: background-color 160ms ease, transform 160ms var(--ease-out);
    -webkit-tap-highlight-color: transparent;
  }
  .exp-del-link:active { background: var(--error-sk); transform: scale(.97); transition-duration: 90ms; }
  @media (prefers-reduced-motion: reduce) {
    .exp-del-link:active { transform: none; }
  }

  /* Rows without a tile (the month view): text starts at the row's edge, so
     long names get the full width and the divider starts there too. */
  .ph-row.is-tap.no-tile { grid-template-columns: minmax(0, 1fr) auto 18px; }
  .ph-row.is-tap.no-tile + .ph-row.is-tap.no-tile::before { left: 10px; }

  /* ── Expenses by month ───────────────────────────────────────────────────── */
  .mo-list { display: flex; flex-direction: column; gap: 10px; }
  .mo-item {
    background: var(--card); border-radius: var(--radius);
    box-shadow: inset 0 0 0 1px var(--line); overflow: hidden;
  }
  .mo-head {
    width: 100%; display: block; padding: 14px 16px 14px; border: none; background: none;
    font: inherit; color: inherit; text-align: left; cursor: pointer;
    transition: background-color 180ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .mo-head:active { background: var(--paper); transition-duration: 0ms; }
  .mo-head:disabled { cursor: default; }
  .mo-head:disabled:active { background: none; }
  .mo-top { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
  .mo-name { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--text); letter-spacing: -.01em; }
  .mo-total {
    font-family: var(--font-display); font-size: 17px; font-weight: 800; color: var(--text);
    font-variant-numeric: tabular-nums; white-space: nowrap;
  }
  .mo-sub {
    display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 2px;
    font-size: 14px; color: var(--text-faint);
  }
  /* Turns to point down when open, on the same curve as the panel, so the
     arrow and the list read as one movement. */
  .mo-chev { color: var(--line-strong); transition: transform 240ms var(--ease-out); }
  .mo-item.open .mo-chev { transform: rotate(90deg); color: var(--text-faint); }
  .mo-bar { display: block; height: 6px; margin-top: 10px; border-radius: 99px; background: var(--paper-alt); overflow: hidden; }
  /* Drawn with scaleX rather than width, so it animates on the compositor. */
  .mo-fill {
    display: block; height: 100%; width: 100%; border-radius: 99px; background: var(--tanim);
    transform-origin: left center; animation: mo-grow 600ms var(--ease-out) both;
  }
  @keyframes mo-grow { from { transform: scaleX(0); } }

  /* The panel opens by animating its grid row from 0fr to 1fr: a real height
     animation with no measuring, and interruptible mid-way. */
  .mo-acc {
    display: grid; grid-template-rows: 0fr;
    transition: grid-template-rows 260ms var(--ease-out);
  }
  .mo-item.open .mo-acc { grid-template-rows: 1fr; }
  .mo-acc-in {
    min-height: 0; overflow: hidden; padding: 0 16px;
    opacity: 0; transition: opacity 180ms ease;
  }
  .mo-item.open .mo-acc-in { opacity: 1; transition: opacity 220ms ease 60ms; }
  .mo-acc-in::before { content: ""; display: block; height: 1px; background: var(--line); }
  .mo-acc-in > :last-child { margin-bottom: 6px; }

  @media (prefers-reduced-motion: reduce) {
    .mo-acc { transition: none; }
    .mo-fill { animation: none; }
  }

  /* ── Date field ──────────────────────────────────────────────────────────── */
  /* Three quick picks, equal width, 48px tall: the common answers are one tap
     and big enough to hit without looking twice. */
  .df-chips { display: grid; grid-template-columns: 1fr 1fr 1.25fr; gap: 8px; }
  .df-chip {
    min-height: 48px; padding: 0 10px; border-radius: 12px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap;
    border: 2px solid var(--line); background: var(--paper); color: var(--text-muted);
    font-family: var(--font-display); font-size: 15px; font-weight: 600;
    transition: transform 160ms var(--ease-out), background-color 160ms ease, border-color 160ms ease, color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .df-chip:active { transform: scale(.96); transition-duration: 90ms; }
  .df-chip.on { border-color: var(--tanim); background: var(--tanim-sk); color: var(--tanim); }
  .df-full { margin-top: 8px; font-size: 14.5px; color: var(--text-muted); }

  /* The calendar folds open under the picks, animating its grid row so the
     fields below glide down instead of jumping. */
  .df-acc { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 260ms var(--ease-out); }
  .df-acc.open { grid-template-rows: 1fr; }
  .df-acc-in { min-height: 0; overflow: hidden; opacity: 0; transition: opacity 160ms ease; }
  .df-acc.open .df-acc-in { opacity: 1; transition: opacity 220ms ease 60ms; }
  .df-cal {
    margin-top: 10px; padding: 10px 8px 12px; border-radius: 16px;
    background: var(--card); box-shadow: inset 0 0 0 1.5px var(--line);
  }
  /* Left and right arrows, as a calendar page turns, not up and down. */
  .df-head { display: flex; align-items: center; justify-content: space-between; padding: 0 2px 6px; }
  .df-title { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--text); text-transform: capitalize; }
  .df-nav {
    width: 44px; height: 44px; border-radius: 50%; border: none; cursor: pointer;
    background: var(--paper); color: var(--text-soft); display: flex; align-items: center; justify-content: center;
    transition: transform 160ms var(--ease-out), background-color 160ms ease, opacity 160ms ease;
  }
  .df-nav:active { transform: scale(.9); background: var(--paper-alt); transition-duration: 90ms; }
  .df-nav:disabled { opacity: .35; cursor: default; }
  .df-nav:disabled:active { transform: none; background: var(--paper); }
  .df-week, .df-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
  .df-week span {
    text-align: center; font-size: 12.5px; font-weight: 600; color: var(--text-faint);
    padding: 4px 0 6px; text-transform: capitalize;
  }
  .df-day {
    height: 44px; border: none; border-radius: 12px; cursor: pointer; background: none;
    font-family: var(--font-display); font-size: 16px; font-weight: 500; color: var(--text);
    font-variant-numeric: tabular-nums;
    transition: transform 140ms var(--ease-out), background-color 140ms ease, color 140ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .df-day:active { transform: scale(.9); background: var(--paper-alt); transition-duration: 80ms; }
  /* Today is ringed, the chosen day is filled: two different questions,
     answered by two different marks. */
  .df-day.today { box-shadow: inset 0 0 0 1.5px var(--tanim); color: var(--tanim); font-weight: 700; }
  .df-day.on { background: var(--tanim); color: #fff; font-weight: 700; box-shadow: none; }
  .df-day:disabled { color: var(--line-strong); cursor: default; }
  .df-day:disabled:active { transform: none; background: none; }
  /* The new month slides in a few px from the side of the arrow tapped. */
  .df-grid.from-next { animation: df-in-next 200ms var(--ease-out); }
  .df-grid.from-prev { animation: df-in-prev 200ms var(--ease-out); }
  @keyframes df-in-next { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: none; } }
  @keyframes df-in-prev { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) {
    .df-acc { transition: none; }
    .df-grid.from-next, .df-grid.from-prev { animation: none; }
    .df-chip:active, .df-nav:active, .df-day:active { transform: none; }
  }

  /* ── Sell now or wait? (advisor card) ────────────────────────────────────── */
  .adv-head { margin-bottom: 4px; }
  .adv-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text); letter-spacing: -.01em; }
  .adv-sub { margin-top: 3px; font-size: 14.5px; line-height: 1.4; color: var(--text-muted); }
  .adv-row { display: flex; gap: 12px; padding: 14px 0; }
  .adv-row + .adv-row { border-top: 1px solid var(--line); }
  .adv-ico {
    width: 44px; height: 44px; flex: 0 0 44px; border-radius: 12px;
    background: var(--paper); box-shadow: inset 0 0 0 1px var(--line);
    display: flex; align-items: center; justify-content: center;
  }
  .adv-body { flex: 1; min-width: 0; }
  .adv-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .adv-name { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--text); }
  /* The decision, in words and colour. Title case, not SHOUTING: the colour
     already carries the urgency. */
  .adv-pill {
    flex-shrink: 0; padding: 5px 12px; border-radius: 99px;
    font-family: var(--font-display); font-size: 14px; font-weight: 700; white-space: nowrap;
  }
  .adv-pill.sell  { background: var(--error); color: #fff; }
  .adv-pill.hold  { background: var(--tanim); color: #fff; }
  .adv-pill.watch { background: var(--gold-sk); color: var(--gold-text); box-shadow: inset 0 0 0 1px var(--gold-line); }

  .adv-prices { display: flex; align-items: flex-end; flex-wrap: wrap; gap: 6px 10px; margin-top: 8px; }
  .adv-p { display: flex; flex-direction: column; }
  .adv-p-lbl { font-size: 12.5px; color: var(--text-faint); line-height: 1.2; }
  .adv-p-val {
    font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--text);
    font-variant-numeric: tabular-nums; line-height: 1.3;
  }
  .adv-arrow { color: var(--text-faint); margin-bottom: 3px; }
  .adv-arrow.up { color: var(--tanim); }
  .adv-arrow.down { color: var(--error); }
  .adv-delta {
    margin-bottom: 1px; padding: 2px 8px; border-radius: 99px;
    font-size: 13.5px; font-weight: 700; font-variant-numeric: tabular-nums;
    background: var(--paper); color: var(--text-muted);
  }
  .adv-delta.up { background: var(--tanim-sk); color: var(--tanim); }
  .adv-delta.down { background: var(--error-sk); color: var(--error); }
  .adv-why { margin-top: 8px; font-size: 15px; line-height: 1.45; color: var(--text-soft); }
  .adv-foot {
    margin-top: 4px; padding-top: 12px; border-top: 1px solid var(--line);
    font-size: 13px; line-height: 1.45; color: var(--text-faint);
  }

  /* ── Prices in the next 3 days ───────────────────────────────────────────── */
  .pp-row { padding: 14px 0 10px; }
  .pp-row + .pp-row { border-top: 1px solid var(--line); }
  .pp-top { display: flex; align-items: center; gap: 12px; }
  .pp-id { flex: 1; min-width: 0; }
  .pp-now { margin-top: 2px; font-size: 14px; color: var(--text-faint); font-variant-numeric: tabular-nums; }
  .pp-end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
  /* The day-3 price is the headline; ink, not coloured, so it reads as a
     number first. The chip under it carries the direction. */
  .pp-target {
    font-family: var(--font-display); font-size: 19px; font-weight: 800; color: var(--text);
    font-variant-numeric: tabular-nums; line-height: 1.1;
  }
  .pp-end .adv-delta { display: inline-flex; align-items: center; gap: 3px; margin: 0; white-space: nowrap; }
  .pp-chart { margin: 10px 0 0 56px; }
  .pp-svg { display: block; width: 100%; height: auto; overflow: visible; }
  .pp-base { stroke: var(--line-strong); stroke-width: 1.5; stroke-dasharray: 4 5; }
  .pp-line { fill: none; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
  .pp-area { stroke: none; opacity: .12; }
  .pp-dot { stroke: var(--card); stroke-width: 2; }
  .pp-svg.up   .pp-line { stroke: var(--tanim); }   .pp-svg.up   .pp-area, .pp-svg.up   .pp-dot { fill: var(--tanim); }
  .pp-svg.down .pp-line { stroke: var(--error); }   .pp-svg.down .pp-area, .pp-svg.down .pp-dot { fill: var(--error); }
  .pp-svg.flat .pp-line { stroke: var(--text-faint); } .pp-svg.flat .pp-area, .pp-svg.flat .pp-dot { fill: var(--text-faint); }
  /* Labels sit under their points: edges pinned, the middle two centred on
     the 1/3 and 2/3 marks (the chart pads 10 of 300 units each side). */
  .pp-days { position: relative; height: 18px; margin-top: 2px; font-size: 12.5px; color: var(--text-faint); text-transform: capitalize; }
  .pp-days span { position: absolute; top: 0; white-space: nowrap; }
  .pp-days span:nth-child(1) { left: 0; }
  .pp-days span:nth-child(2) { left: 34.4%; transform: translateX(-50%); }
  .pp-days span:nth-child(3) { left: 65.6%; transform: translateX(-50%); }
  .pp-days span:nth-child(4) { right: 0; font-weight: 700; color: var(--text-muted); }

  /* ── Welcome ID ────────────────────────────────────────────────────────────
     A portrait member card, like a real ID on a lanyard: issuer band on top
     with the punch slot, photo in the middle, name at the foot, ID number
     and barcode along the bottom edge. */
  .shm-scrim:has(> .wid-panel) { background: rgba(8,12,10,.84); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
  .wid-panel { width: 100%; max-width: 330px; background: transparent; }
  .wid { display: flex; flex-direction: column; align-items: center; text-align: center; color: #fff; }
  .wid-title {
    font-family: var(--font-display); font-size: 23px; font-weight: 700; line-height: 1.2; letter-spacing: -.015em;
    text-wrap: balance; animation: wid-rise 360ms var(--ease-out) both;
  }
  .wid-sub { margin: 6px 0 20px; font-size: 15px; color: rgba(255,255,255,.75); animation: wid-rise 360ms var(--ease-out) 60ms both; }

  .wid-card {
    position: relative; width: 268px; border-radius: 18px; overflow: hidden; text-align: center;
    /* Fine security rings behind the photo, the way printed IDs guard
       against copying. Kept to a whisper so the name stays the loudest
       thing on the card. */
    background:
      repeating-radial-gradient(circle at 50% 42%, rgba(11,107,65,.07) 0 1px, transparent 1.5px 8px),
      linear-gradient(180deg, #FFFFFF 0%, #F4F6F3 100%);
    box-shadow: 0 34px 60px -22px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.08);
    transform-origin: 50% -40px;
    /* It drops in on its lanyard and settles with a small swing. The only
       overshoot in the app: here the motion has a physical cause. */
    animation: wid-drop 900ms cubic-bezier(.22,1,.36,1) 140ms both;
  }
  @keyframes wid-drop {
    0%   { opacity: 0; transform: translateY(-70px) rotate(-7deg); }
    45%  { opacity: 1; transform: translateY(4px) rotate(2.4deg); }
    70%  { transform: translateY(-1px) rotate(-1deg); }
    100% { transform: none; }
  }
  /* The punch slot for the lanyard clip. */
  .wid-slot {
    position: absolute; top: 9px; left: 50%; z-index: 2; width: 46px; height: 9px; margin-left: -23px;
    border-radius: 99px; background: rgba(8,12,10,.8); box-shadow: inset 0 1px 2px rgba(0,0,0,.6), 0 1px 0 rgba(255,255,255,.12);
  }
  .wid-band {
    display: flex; align-items: center; gap: 8px; padding: 28px 14px 12px;
    background: radial-gradient(120% 140% at 100% 0%, rgba(126,196,120,.28), transparent 60%), linear-gradient(135deg, #1D2E25, var(--ink));
    color: #fff;
  }
  .wid-mark { width: 30px; height: 30px; border-radius: 8px; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .wid-brand { font-family: var(--font-display); font-size: 16px; font-weight: 700; letter-spacing: -.01em; }
  .wid-kind { margin-left: auto; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--palay); }

  .wid-body { display: flex; flex-direction: column; align-items: center; padding: 20px 18px 14px; }
  /* Portrait, like a real ID photo, with a white mat and a hairline frame. */
  .wid-photo {
    position: relative; width: 112px; height: 134px; padding: 0; border: none; border-radius: 14px; cursor: pointer;
    background: var(--tanim-sk); display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 0 4px #fff, 0 0 0 5px var(--line), 0 12px 22px -12px rgba(0,0,0,.45);
    transition: transform 160ms var(--ease-out);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .wid-photo:active { transform: scale(.97); transition-duration: 90ms; }
  .wid-photo-img {
    width: 100%; height: 100%; object-fit: cover; border-radius: 14px; display: block;
    animation: wid-photo-in 320ms var(--ease-out);
  }
  @keyframes wid-photo-in { from { opacity: 0; filter: blur(6px); transform: scale(1.04); } to { opacity: 1; filter: none; transform: none; } }
  .wid-initials { font-family: var(--font-display); font-size: 40px; font-weight: 800; color: var(--tanim); letter-spacing: -.02em; }
  .wid-cam {
    position: absolute; right: -8px; bottom: -8px; width: 32px; height: 32px; border-radius: 50%;
    background: var(--tanim); color: #fff; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 0 3px #fff, 0 4px 10px -4px rgba(0,0,0,.4);
  }
  .wid-name {
    margin-top: 18px; font-family: var(--font-display); font-size: 21px; font-weight: 800; line-height: 1.15;
    color: var(--ink); letter-spacing: -.015em; text-wrap: balance; overflow-wrap: anywhere;
  }
  .wid-role { margin-top: 5px; font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--tanim); }
  .wid-loc { display: flex; align-items: center; justify-content: center; gap: 4px; margin-top: 6px; font-size: 13.5px; color: var(--text-faint); }

  .wid-foot {
    display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; margin: 0 16px; padding: 12px 0 14px;
    border-top: 1.5px dashed var(--line-strong); text-align: left;
  }
  .wid-field { display: flex; flex-direction: column; gap: 1px; }
  .wid-field.end { text-align: right; }
  .wid-lbl { font-size: 10.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--text-faint); }
  .wid-val { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--ink); font-variant-numeric: tabular-nums; }
  .wid-barcode {
    grid-column: 1 / -1; height: 26px; border-radius: 2px; opacity: .85;
    background: repeating-linear-gradient(90deg,
      var(--ink) 0 2px, transparent 2px 4px, var(--ink) 4px 5px, transparent 5px 8px,
      var(--ink) 8px 11px, transparent 11px 12px, var(--ink) 12px 13px, transparent 13px 17px);
  }
  /* One pass of light across the laminate once the card has landed. */
  .wid-shine {
    position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(105deg, transparent 38%, rgba(255,255,255,.6) 50%, transparent 62%);
    transform: translateX(-130%);
    animation: wid-shine 1000ms ease-in-out 1000ms 1 forwards;
  }
  @keyframes wid-shine { to { transform: translateX(130%); } }

  .wid-actions { width: 268px; margin-top: 22px; display: flex; flex-direction: column; gap: 10px; animation: wid-rise 360ms var(--ease-out) 700ms both; }
  .wid-btn {
    min-height: 52px; border: none; border-radius: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    font-family: var(--font-display); font-size: 16px; font-weight: 700;
    transition: transform 160ms var(--ease-out), background-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .wid-btn:active { transform: scale(.97); transition-duration: 90ms; }
  .wid-btn.primary { background: var(--tanim); color: #fff; box-shadow: 0 10px 22px -10px rgba(11,107,65,.9); }
  .wid-btn.ghost { background: rgba(255,255,255,.1); color: #fff; box-shadow: inset 0 0 0 1.5px rgba(255,255,255,.28); }
  @keyframes wid-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

  /* Profile avatar, when the member has added a photo. */
  .prof-ava { overflow: hidden; }
  .prof-ava-img { width: 100%; height: 100%; object-fit: cover; display: block; }

  @media (prefers-reduced-motion: reduce) {
    .wid-card { animation: a-fade-in 260ms ease both; }
    .wid-title, .wid-sub, .wid-actions { animation: a-fade-in 260ms ease both; }
    .wid-shine { display: none; }
    .wid-photo:active, .wid-btn:active { transform: none; }
  }
  @keyframes a-fade-in { from { opacity: 0; } to { opacity: 1; } }

  /* Purchase history thumbnail: same rounded-square photo as the cart line,
     a touch smaller to suit a denser list. */
  .ptx-thumb {
    width: 54px; height: 54px; flex: 0 0 54px; border-radius: 14px; overflow: hidden;
    background: var(--tanim-sk); display: flex; align-items: center; justify-content: center;
    box-shadow: inset 0 0 0 1px rgba(22,33,27,.06);
  }
  .ptx-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .exp-desc { font-size: var(--fs-label); font-weight:600; color:var(--text); }
  .exp-meta { font-size: var(--fs-label); color:var(--text-muted); margin-top:2px; }
  .exp-amt  { font-size: var(--fs-label); font-weight:700; color:var(--text); margin-left:auto; }
  /* A screen's own action bar. The floating nav hovers over the bottom of the
     shell, so the dock carries that clearance itself; and when a dock is
     present the scroll above it must NOT also reserve the nav gap, or the two
     stack into a dead band. */
  .screen-dock {
    flex-shrink: 0; display: flex; flex-direction: column; gap: 8px;
    background: var(--card); border-top: 1px solid var(--paper-alt);
    padding: 10px 14px calc(var(--bnav-h) + 22px);
  }
  .scroll.has-dock { padding-bottom: 10px; }

  .add-btn  { width:100%; padding:15px; background:var(--green); color:#fff; border:none; border-radius:var(--radius); font-family:inherit; font-size: var(--fs-label); font-weight:700; cursor:pointer; }

  /* ── Analytics ── */
  .bar-row { display:flex; align-items:center; gap:9px; margin-bottom:11px; }
  .bar-lbl { font-size: var(--fs-label); font-weight:600; color:var(--text); width:64px; flex-shrink:0; }
  .bar-track { flex:1; height:10px; background:var(--bg-alt); border-radius:99px; overflow:hidden; }
  .bar-fill  { height:100%; border-radius:99px; }
  .bar-val   { font-size: var(--fs-label); color:var(--text-muted); width:44px; text-align:right; flex-shrink:0; }

  .perf-grid { display:grid; grid-template-columns:1fr 1fr; gap:9px; }
  .perf-card { border-radius:14px; padding:13px; text-align:center; }
  .perf-name  { font-size: var(--fs-label); font-weight:600; color:var(--text-muted); margin-bottom:4px; }
  .perf-price { font-size: var(--fs-body); font-weight:800; color:var(--text); }
  .perf-chg   { font-size: var(--fs-label); font-weight:700; margin-top:3px; }

  .sum-row { display:flex; justify-content:space-around; }
  .sum-val { font-size: var(--fs-lead); font-weight:800; color:var(--tanim); }
  .sum-lbl { font-size: var(--fs-label); color:var(--text-muted); margin-top:3px; text-align:center; }

  /* ── Marketplace ── */
  .mp-title-row { display:flex; align-items:flex-start; justify-content:space-between; position:relative; }
  .mp-peek  { position:absolute; right:-16px; bottom:-8px; height:132px; width:auto; pointer-events:none; user-select:none; }
  /* Plain greeting beside Juan, no bubble. */
  .mp-peek-bubble { position:absolute; right:76px; top:8px; color:var(--tanim);
    font-family: var(--font-display); font-size: var(--fs-lead); font-weight:800;
    white-space:nowrap; pointer-events:none; user-select:none; }
  .mp-title { font-family: var(--font-display); font-size: var(--fs-title); font-weight:700; color:var(--text); }
  .mp-sub   { font-size: var(--fs-label); color:var(--text-muted); margin-top:3px; max-width:170px; line-height:1.45; }
  .post-btn { background:var(--text); color:#fff; border:none; border-radius:11px; padding:11px 15px; font-family:inherit; font-size: var(--fs-label); font-weight:700; cursor:pointer; flex-shrink:0; }

  .search-box { display:flex; align-items:center; gap:9px; background:var(--white); border:1.5px solid var(--border); border-radius:13px; padding:12px 14px; }
  .search-box input { border:none; outline:none; font-family:inherit; font-size: var(--fs-label); color:var(--text); flex:1; background:transparent; }
  .search-box input::placeholder { color:var(--text-faint); }

  .mp-filter-row { display:flex; flex-direction:column; gap:7px; }
  .cat-tabs { display:grid; grid-template-columns:repeat(3,1fr); gap:9px; }
  .cat-tab {
    padding:14px 6px; border-radius:16px; border:2px solid var(--border);
    background:var(--white); font-family:inherit; font-size: var(--fs-label); font-weight:700;
    color:var(--text-muted); cursor:pointer; display:flex; flex-direction:column;
    align-items:center; gap:8px; text-align:center; line-height:1.25;
    box-shadow:var(--shadow-sm);
  }
  .cat-tab.active { background:var(--tanim-sk); border-color:var(--tanim); color:var(--tanim); box-shadow: inset 0 0 0 1px var(--tanim); }
  .cat-tab-ico { width:40px; height:40px; border-radius:12px; background:var(--paper-alt); display:flex; align-items:center; justify-content:center; }
  .cat-tab.active .cat-tab-ico { background:var(--tanim-sk); }

  .var-tabs { display:grid; grid-template-columns:repeat(2,1fr); gap:9px; }
  .var-tab {
    padding:13px 11px; border-radius:14px; border:2px solid var(--tanim-sk);
    background:var(--paper-alt); font-family:inherit; font-size: var(--fs-label); font-weight:700;
    color:var(--ink-2); cursor:pointer; text-align:center; line-height:1.35;
  }
  .var-tab.active { background:var(--green); border-color:var(--green); color:#fff; }

  .drop-wrap  { position:relative; display:flex; align-items:center; }
  .drop-sel   { appearance:none; -webkit-appearance:none; background:var(--white); border:1.5px solid var(--border); border-radius:10px; padding:8px 30px 8px 13px; font-family:inherit; font-size: var(--fs-label); font-weight:600; color:var(--text); cursor:pointer; }
  .drop-arr   { position:absolute; right:10px; font-size:11px; color:var(--text-muted); pointer-events:none; }

  .mp-stats { display:grid; grid-template-columns:1fr 1fr; gap:11px; }
  .mp-stat  { background:var(--white); border-radius:14px; padding:15px 16px; box-shadow:var(--shadow-sm); }
  .mp-stat-val { font-size: var(--fs-lead); font-weight:800; color:var(--text); }
  .mp-stat-lbl { font-size: var(--fs-label); color:var(--text-muted); margin-top:3px; }

  .listing { background:var(--white); border-radius:var(--radius); padding:19px; border:1px solid var(--border); }
  .listing-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:11px; }
  .listing-crop-row { display:flex; align-items:flex-start; gap:13px; }
  .listing-ico  { width:54px; height:54px; border-radius:15px; background:var(--green-bg); display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden; }
  .listing-ico img { width:100%; height:100%; object-fit:cover; display:block; box-shadow: inset 0 0 0 1px rgba(22,33,27,.10); }
  .listing-name { font-family: var(--font-display); font-size: var(--fs-lead); font-weight:700; color:var(--text); line-height:1.25; }
  .listing-var  { font-size: var(--fs-label); color:var(--text-muted); margin-top:3px; font-weight:500; }
  .listing-price{ font-size: var(--fs-lead); font-weight:800; color:var(--text); white-space:nowrap; }
  .listing-desc { font-size: var(--fs-label); color:var(--text-muted); line-height:1.65; margin-bottom:11px; }
  .listing-meta { display:flex; justify-content:space-between; font-size: var(--fs-label); color:var(--text-muted); font-weight:600; margin-bottom:13px; background:var(--paper); padding:10px 13px; border-radius:11px; }
  .seller-row   { display:flex; align-items:center; gap:11px; margin-bottom:15px; padding:11px 13px; background:var(--paper); border-radius:13px; }
  .seller-ava   { width:44px; height:44px; border-radius:50%; background:var(--tanim); display:flex; align-items:center; justify-content:center; font-size: var(--fs-label); font-weight:800; color:#fff; flex-shrink:0; }
  .seller-name  { font-size: var(--fs-label); font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .seller-stars { font-size: var(--fs-label); color:var(--gold-text); font-weight:700; display:flex; align-items:center; gap:3px; white-space:nowrap; }
  /* Name over town on the left, rating on the right: the town gets a full line
     of its own, so a long one ("Science City of Munoz") only clips at the very
     edge instead of fighting the name for the same line. */
  .seller-who   { flex:1 1 auto; min-width:0; }
  .seller-loc   { font-size: var(--fs-label); color:var(--text-muted); display:flex; align-items:center; gap:3px; min-width:0; margin-top:3px; }
  .seller-loc svg  { flex-shrink:0; }
  .seller-loc span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .seller-end   { display:flex; align-items:center; justify-content:flex-end; gap:6px; flex:0 0 auto; }
  .seller-end svg { flex-shrink:0; }
  .listing-btns { display:flex; gap:11px; }
  /* Listing actions, farmer side. Same size, shape and type as the buyer's
     Add to Cart / Buy Now, so the card's bottom edge looks the same for
     everyone; only the fill says which button leads. */
  .btn-call, .btn-details {
    flex: 1; min-width: 0; min-height: 50px; padding: 0 14px; border: none; border-radius: 14px;
    font-family: var(--font-display); font-size: var(--fs-label); font-weight: 700; letter-spacing: -.005em;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap;
  }
  .btn-call {
    background: var(--tanim); color: #fff;
    box-shadow: 0 8px 18px -10px rgba(11,107,65,.75), inset 0 1px 0 rgba(255,255,255,.14);
  }
  /* Secondary: a hairline, not a 2px frame, so it sits beside the primary
     instead of competing with it. */
  .btn-details { background: var(--card); color: var(--text); box-shadow: inset 0 0 0 1.5px var(--line-strong); }
  .btn-details:active { background: var(--paper); }
  .empty-msg    { text-align:center; color:var(--text-faint); padding:44px 16px; font-size: var(--fs-body); font-weight:600; line-height:1.6; }

  /* ── Cart ── */
  .cart-badge {
    position:absolute; top:-6px; right:-6px;
    background:var(--error); color:#fff; font-size: var(--fs-label); font-weight:800;
    border-radius:99px; padding:1px 5px; min-width:17px; text-align:center; line-height:1.6;
  }
  /* ── Cart sheet ──────────────────────────────────────────────────────────── */
  .cart-sheet {
    background: var(--paper); border-radius: 24px 24px 0 0;
    width: 100%; max-height: 88%; display: flex; flex-direction: column;
  }
  /* Matches the alerts sheet header, so the app's two sheets feel like one family. */
  .cart-sheet-hdr {
    background: var(--tanim); border-radius: 24px 24px 0 0; padding: 20px 20px 18px;
    display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-shrink: 0;
  }
  .cart-hdr-t { font-family: var(--font-display); font-size: var(--fs-lead); font-weight: 800; color: #fff; letter-spacing: -.01em; }
  .cart-hdr-s { font-size: var(--fs-label); color: rgba(255,255,255,.82); margin-top: 3px; font-variant-numeric: tabular-nums; }
  .cart-body { flex: 1; padding: 12px 14px 4px; }

  /* A line is a card, not a table row: photo, what and from whom, the line
     total where the eye lands last on the right, and the stepper beneath. */
  /* The slot animates its height between card, undo strip and nothing, so the
     rows below glide instead of jumping. Spacing is padding, not margin, so
     it's inside what gets measured. */
  .autoh { overflow: hidden; transition: height 240ms var(--ease-out); }
  .autoh-in { display: flow-root; }
  /* A few px of side room inside the clip, so the card's soft shadow isn't
     shaved off at the edges. */
  .cart-slot { margin: 0 -6px; }
  .cart-slot .autoh-in { padding: 0 6px 10px; }
  .cart-slot.is-empty .autoh-in { padding-bottom: 0; }
  /* Whichever face is showing fades and un-blurs in, so the swap reads as the
     same slot changing rather than one box cut out and another dropped in. */
  .cart-face { animation: cart-face-in 200ms var(--ease-out); }
  @keyframes cart-face-in { from { opacity: 0; transform: scale(.98); filter: blur(2px); } to { opacity: 1; transform: none; filter: none; } }
  .cart-item {
    display: flex; gap: 14px; padding: 14px;
    background: var(--card); border-radius: 18px;
    box-shadow: inset 0 0 0 1px var(--line), 0 4px 14px -10px rgba(22,33,27,.25);
  }
  .cart-thumb {
    width: 64px; height: 64px; flex: 0 0 64px; border-radius: 14px; overflow: hidden;
    background: var(--tanim-sk); display: flex; align-items: center; justify-content: center;
  }
  .cart-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .cart-item-body { flex: 1; min-width: 0; }
  .cart-item-top { display: flex; align-items: baseline; gap: 10px; }
  .cart-item-name {
    flex: 1; min-width: 0; font-family: var(--font-display); font-size: var(--fs-body); font-weight: 700;
    color: var(--text); line-height: 1.25; letter-spacing: -.01em;
  }
  /* Tabular figures, so stepping 9 to 10 kg doesn't nudge the column. */
  .cart-item-sum {
    font-family: var(--font-display); font-size: var(--fs-body); font-weight: 800; color: var(--text);
    font-variant-numeric: tabular-nums; white-space: nowrap;
  }
  .cart-item-meta {
    display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-top: 3px;
    font-size: 14px; color: var(--text-faint); line-height: 1.35;
  }
  .cart-item-meta svg { flex-shrink: 0; }
  .cart-item-rate { margin-top: 2px; font-size: 14px; font-weight: 700; color: var(--tanim); font-variant-numeric: tabular-nums; }
  .cart-item-rate span { font-weight: 600; color: var(--text-faint); }

  .cart-step-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
  /* One pill with 40px ends, up from two 30px squares. */
  .qty-step {
    display: inline-flex; align-items: center; padding: 3px; border-radius: 999px;
    background: var(--paper); box-shadow: inset 0 0 0 1px var(--line);
  }
  .qty-step button {
    width: 40px; height: 40px; border-radius: 50%; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    background: var(--card); color: var(--text-soft);
    box-shadow: 0 1px 2px rgba(22,33,27,.12), 0 0 0 1px rgba(22,33,27,.05);
    transition: transform 160ms var(--ease-out), background-color 160ms ease, color 160ms ease, opacity 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .qty-step button:active { transform: scale(.9); transition-duration: 90ms; }
  .qty-step button:disabled { opacity: .4; cursor: default; box-shadow: none; }
  .qty-step button:disabled:active { transform: none; }
  .qty-step button.is-bin { color: var(--error); background: var(--error-sk); box-shadow: none; }
  /* The minus and bin swap with a small blur-scale, so it reads as one control
     changing its job rather than two icons cutting over. */
  .qty-step-ico { display: flex; animation: qty-ico-in 180ms var(--ease-out); }
  @keyframes qty-ico-in { from { opacity: 0; transform: scale(.6); filter: blur(2px); } to { opacity: 1; transform: none; filter: none; } }
  .qty-step-val {
    min-width: 58px; text-align: center; font-family: var(--font-display); font-size: var(--fs-body); font-weight: 700;
    color: var(--text); font-variant-numeric: tabular-nums;
  }
  .qty-step-val small { font-size: 13px; font-weight: 600; color: var(--text-faint); margin-left: 3px; }
  .cart-step-note { font-size: 13px; color: var(--text-faint); line-height: 1.3; }

  /* The undo strip: sits exactly where the line was, quiet (dashed, no fill)
     so it reads as the ghost of the card, with Undo as the one live control.
     The hairline along the bottom drains over the undo window, so the user
     can see how long they have instead of being surprised when it goes. */
  .cart-tomb {
    position: relative; overflow: hidden;
    display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 8px 8px 8px 16px;
    border-radius: 18px; box-shadow: inset 0 0 0 1.5px var(--line-strong);
    background: rgba(255,255,255,.45);
  }
  .cart-tomb-ico { color: var(--text-faint); display: flex; flex-shrink: 0; }
  .cart-tomb-txt { flex: 1; min-width: 0; font-size: 15px; color: var(--text-faint); line-height: 1.3; }
  .cart-tomb-txt strong { color: var(--text-soft); font-weight: 700; }
  .cart-tomb button {
    min-height: 44px; padding: 0 18px; border: none; border-radius: 12px; cursor: pointer; flex-shrink: 0;
    background: var(--tanim-sk); color: var(--tanim);
    font-family: var(--font-display); font-weight: 700; font-size: 15px;
    transition: transform 160ms var(--ease-out), background-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .cart-tomb button:active { transform: scale(.95); transition-duration: 90ms; }
  .cart-tomb-timer {
    position: absolute; left: 0; right: 0; bottom: 0; height: 3px;
    background: var(--tanim); opacity: .35; transform-origin: left center;
    animation: cart-tomb-drain 5000ms linear forwards;
  }
  @keyframes cart-tomb-drain { from { transform: scaleX(1); } to { transform: scaleX(0); } }

  .cart-checkout-btn:disabled { background: #E3DED2; color: #8B9089; box-shadow: none; cursor: default; }
  .cart-checkout-btn:disabled:active { transform: none; }

  .cart-footer {
    padding: 16px 18px 18px; background: var(--card); flex-shrink: 0;
    box-shadow: 0 -10px 24px -18px rgba(22,33,27,.35);
  }
  .cart-total-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; }
  .cart-total-lbl { font-size: 15px; font-weight: 600; color: var(--text-muted); }
  .cart-total-sub { font-size: 14px; color: var(--text-faint); margin-top: 2px; font-variant-numeric: tabular-nums; }
  .cart-total-val {
    font-family: var(--font-display); font-size: var(--fs-title); font-weight: 800; color: var(--text);
    letter-spacing: -.02em; line-height: 1; font-variant-numeric: tabular-nums;
  }
  .cart-pay-note { margin: 10px 0 14px; font-size: 13.5px; line-height: 1.4; color: var(--text-faint); }
  .cart-checkout-btn {
    width: 100%; min-height: 56px; padding: 0 18px; background: var(--tanim); color: #fff; border: none;
    border-radius: 16px; font-family: var(--font-display); font-size: var(--fs-body); font-weight: 700;
    cursor: pointer; box-shadow: 0 8px 20px -10px rgba(11,107,65,.6);
  }

  .cart-empty { text-align: center; padding: 40px 20px 28px; }
  .cart-empty-ico { display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
  .cart-empty-txt { font-family: var(--font-display); font-size: var(--fs-body); font-weight: 700; color: var(--text-soft); }
  .cart-empty-sub { font-size: 15px; color: var(--text-faint); margin-top: 5px; line-height: 1.4; }
  .cart-empty-btn {
    margin-top: 18px; min-height: 48px; padding: 0 20px; border: none; border-radius: 999px; cursor: pointer;
    background: var(--tanim-sk); color: var(--tanim); font-family: var(--font-display); font-weight: 700; font-size: 15px;
    transition: transform 160ms var(--ease-out);
  }
  .cart-empty-btn:active { transform: scale(.96); transition-duration: 90ms; }

  @media (prefers-reduced-motion: reduce) {
    .autoh { transition: none; }
    .cart-face, .qty-step-ico { animation: none; }
    /* The drain still shows time left; it just steps down instead of sliding. */
    .cart-tomb-timer { animation-timing-function: steps(5, end); }
    .qty-step button:active, .cart-tomb button:active, .cart-empty-btn:active { transform: none; }
  }
  /* ── Buyer actions ── */
  /* Same size, same shape, different weight. Size stays equal so neither
     looks like an afterthought; weight (fill, shadow) says which one moves
     the purchase forward. */
  .add-cart-btn, .buy-now-btn {
    flex: 1; min-width: 0; min-height: 50px; padding: 0 14px; border: none; border-radius: 14px;
    font-family: var(--font-display); font-size: var(--fs-label); font-weight: 700; letter-spacing: -.005em;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap;
  }
  /* Secondary: tinted, no shadow. Still clearly a button, just a quieter one. */
  .add-cart-btn {
    background: var(--tanim-sk); color: var(--tanim);
    box-shadow: inset 0 0 0 1.5px rgba(11,107,65,.16);
  }
  /* Added: steps back again, to a white chip with a hairline, because the
     job is done and it's now only a shortcut to the cart. */
  .add-cart-btn.in-cart { background: var(--card); color: var(--tanim); box-shadow: inset 0 0 0 1.5px var(--line); }
  .act-lbl { display: inline-flex; align-items: center; gap: 8px; min-width: 0; animation: act-lbl-in 200ms var(--ease-out); }
  .act-chev { margin-left: -2px; opacity: .7; }
  @keyframes act-lbl-in { from { opacity: 0; transform: scale(.94); filter: blur(2px); } to { opacity: 1; transform: none; filter: none; } }
  /* Primary: solid, with a soft green lift so it reads as the one to press. */
  .buy-now-btn {
    background: var(--tanim); color: #fff;
    box-shadow: 0 8px 18px -10px rgba(11,107,65,.75), inset 0 1px 0 rgba(255,255,255,.14);
  }
  @media (prefers-reduced-motion: reduce) {
    .act-lbl { animation: none; }
  }
  .qty-picker-row { display:flex; align-items:center; gap:11px; background:var(--paper); border-radius:13px; padding:11px 15px; border:1.5px solid var(--line); }
  .qty-pick-btn { width:36px; height:36px; border-radius:10px; border:2px solid var(--line); background:#fff; font-size: var(--fs-lead); font-weight:800; color:var(--text-soft); display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
  @media (hover: hover) and (pointer: fine) {
    .qty-pick-btn:hover { background:var(--line); }
  }
  .qty-pick-val { flex:1; text-align:center; font-size: var(--fs-body); font-weight:800; color:var(--text); }
  .qty-pick-unit { font-size: var(--fs-label); color:var(--text-muted); font-weight:600; }
  .checkout-card {
    background:#fff; border-radius:26px; padding:38px 28px; text-align:center;
    width:100%; max-width:320px;
  }
  /* The one flourish in the app, and it is spent here: the emoji lands a beat
     after the card does, with a touch of overshoot. Bounce is wrong almost
     everywhere in this product — a farmer confirming an order sees this once,
     at the end of a long form, and it is the only moment that is a reward
     rather than a step. */
  .checkout-pop { animation: checkout-pop 460ms var(--ease-out) 90ms both; }
  @keyframes checkout-pop {
    from { opacity: 0; transform: scale(.4) rotate(-14deg); }
    62%  { opacity: 1; transform: scale(1.12) rotate(4deg); }
    to   { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  @media (prefers-reduced-motion: reduce) {
    .checkout-pop { animation: none; }
  }

  /* ── Seller Details Modal ── */
  .seller-modal-sheet {
    background:var(--paper); border-radius:30px 30px 0 0;
    width:100%; max-height:90%; display:flex; flex-direction:column;
    overflow:hidden;
  }
  .seller-modal-hero {
    background: var(--tanim);
    padding:26px 22px 22px; flex-shrink:0;
  }
  .seller-modal-ava {
    width:70px; height:70px; border-radius:50%;
    background:rgba(255,255,255,0.25); border:3px solid rgba(255,255,255,0.6);
    display:flex; align-items:center; justify-content:center;
    font-size: var(--fs-title); font-weight:900; color:#fff; margin-bottom:13px;
  }
  .seller-modal-name { font-family: var(--font-display); font-size: var(--fs-title); font-weight:700; color:#fff; margin-bottom:4px; }
  .seller-modal-sub  { font-size: var(--fs-label); color:rgba(255,255,255,0.85); }
  .seller-modal-stats {
    display:grid; grid-template-columns:repeat(3,1fr); gap:11px;
    padding:18px 18px; background:#fff; border-bottom:1px solid var(--paper-alt); flex-shrink:0;
  }
  .sms-item { text-align:center; }
  .sms-val  { font-size: var(--fs-lead); font-weight:900; color:var(--text); }
  .sms-lbl  { font-size: var(--fs-label); color:var(--text-muted); margin-top:3px; font-weight:600; }
  .seller-modal-body { flex:1; overflow-y:auto; padding:18px; display:flex; flex-direction:column; gap:15px; }
  .sdm-row { display:flex; align-items:center; gap:15px; padding:14px 15px; background:#fff; border-radius:15px; border:1px solid var(--paper-alt); }
  .sdm-ico { width:44px; height:44px; border-radius:13px; background:var(--tanim-sk); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .sdm-lbl { font-size: var(--fs-label); color:var(--text-muted); font-weight:600; margin-bottom:2px; }
  .sdm-val { font-size: var(--fs-label); font-weight:700; color:var(--text); }
  .sdm-bio { background:#fff; border-radius:15px; padding:15px; border:1px solid var(--paper-alt); font-size: var(--fs-label); color:var(--text-soft); line-height:1.75; }
  .sdm-crops { display:flex; gap:8px; flex-wrap:wrap; margin-top:9px; }
  .sdm-crop-tag { background:var(--tanim-sk); border:1px solid var(--line); color:var(--tanim); font-size: var(--fs-label); font-weight:700; border-radius:99px; padding:5px 12px; }
  .star-fill { color:var(--gold-text); }
  .seller-modal-footer { padding:18px; background:#fff; border-top:1px solid var(--line); flex-shrink:0; }
  .call-seller-btn {
    width:100%; padding:18px; background:var(--tanim); color:#fff; border:none;
    border-radius:16px; font-family:inherit; font-size: var(--fs-body); font-weight:800;
    cursor:pointer; display:flex; align-items:center; justify-content:center; gap:9px;
    box-shadow:var(--shadow-md);
  }

  /* ── Sheet chrome ────────────────────────────────────────────────────────
     Four sheets each hand-rolled their own close button and action pair in
     inline styles, which is why none of them had a press state: there was no
     class to hang one on. One set of names, shared. */
  .sheet-x {
    width: 44px; height: 44px; flex-shrink: 0; border: none; cursor: pointer;
    border-radius: 50%; background: rgba(255,255,255,.2); color: #fff;
    font-size: var(--fs-lead); font-family: inherit;
    display: flex; align-items: center; justify-content: center;
    transition: transform 190ms var(--ease-out), background-color var(--dur-fast) ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .sheet-x:active {
    transition-duration: var(--dur-press);
    transform: scale(0.9); background: rgba(255,255,255,.34);
  }

  .btn-primary, .btn-secondary, .btn-danger {
    padding: 18px; border-radius: 14px; font-family: inherit;
    font-size: var(--fs-body); font-weight: 800; cursor: pointer;
    transition: transform 190ms var(--ease-out), background-color var(--dur-fast) ease,
                box-shadow var(--dur-fast) ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .btn-primary   { background: var(--tanim); color: #fff; border: none; font-weight: 900; box-shadow: 0 4px 12px rgba(11,107,65,0.3); }
  .btn-secondary { background: var(--paper-alt); color: var(--text-soft); border: 2px solid var(--line); }
  .btn-danger    { background: var(--error); color: #fff; border: none; }
  .btn-primary:active, .btn-secondary:active, .btn-danger:active {
    transition-duration: var(--dur-press); transform: scale(0.97);
  }
  /* The shadow retracts with the press: a button that keeps floating while it
     is pushed down is the detail that makes elevation read as a sticker. */
  .btn-primary:active { box-shadow: 0 1px 4px rgba(11,107,65,0.28); }
  .btn-secondary:active { background: var(--line); }

  .confirm-sheet {
    width: 100%; background: var(--card);
    border-radius: 24px 24px 0 0; padding: 28px;
  }
  .confirm-sheet.sm { border-radius: 16px 16px 0 0; padding: 24px; }
  .post-sheet {
    width: 100%; max-height: 93%; background: var(--paper);
    border-radius: 24px 24px 0 0; padding-bottom: 24px;
  }
  .exp-sheet {
    width: 100%; max-height: 93%; background: var(--card);
    border-radius: 22px 22px 0 0; padding-bottom: 28px;
    box-shadow: 0 -8px 40px rgba(0,0,0,0.18);
  }
  /* Light, like the system calculator in light mode: white sheet, grey keys,
     green only on the operators and the answer. */
  .calc-sheet {
    width: 100%; background: var(--card);
    border-radius: 24px 24px 0 0; padding: 10px 16px 22px;
    box-shadow: 0 -8px 40px rgba(0,0,0,0.18);
  }
  .calc-grab { width: 40px; height: 5px; border-radius: 99px; background: var(--line); margin: 0 auto 8px; }
  .calc-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 2px 2px 4px; }
  .calc-title { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-size: var(--fs-body); font-weight: 700; color: var(--text); }
  .calc-title-ico { width: 34px; height: 34px; border-radius: 10px; background: var(--paper); box-shadow: inset 0 0 0 1px var(--line); display: flex; align-items: center; justify-content: center; color: var(--text-soft); }
  .calc-close {
    width: 40px; height: 40px; border-radius: 50%; border: none; cursor: pointer;
    background: var(--paper); color: var(--text-soft); display: flex; align-items: center; justify-content: center;
    transition: transform 160ms var(--ease-out), background-color 160ms ease;
  }
  .calc-close:active { transform: scale(.92); background: var(--paper-alt); transition-duration: 90ms; }

  /* The display is the hero: no box around it, just a big right-aligned
     number with the running sum above it in grey. */
  .calc-display { padding: 18px 6px 16px; text-align: right; min-height: 104px; display: flex; flex-direction: column; justify-content: flex-end; }
  .calc-expr { min-height: 22px; font-size: 16px; color: var(--text-faint); font-variant-numeric: tabular-nums; }
  .calc-num {
    font-family: var(--font-display); font-weight: 600; color: var(--text); line-height: 1.1;
    letter-spacing: -.03em; font-variant-numeric: tabular-nums;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .calc-num small { font-size: .55em; font-weight: 500; color: var(--text-faint); margin-right: 4px; letter-spacing: 0; }

  .calc-pad { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .calc-pad .span2 { grid-column: span 2; }

  .calc-use {
    width: 100%; min-height: 54px; margin-top: 14px; border: none; border-radius: 16px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: var(--tanim); color: #fff; font-family: var(--font-display); font-size: var(--fs-label); font-weight: 700;
    box-shadow: 0 8px 18px -10px rgba(11,107,65,.75);
    transition: transform 160ms var(--ease-out), background-color 160ms ease, opacity 160ms ease;
  }
  .calc-use:active { transform: scale(.97); transition-duration: 90ms; }
  .calc-use:disabled { background: var(--paper-alt); color: var(--text-faint); box-shadow: none; cursor: default; }
  .calc-use:disabled:active { transform: none; }

  /* The compact pair used inside the expense sheets. */
  .btn-primary.sm, .btn-secondary.sm, .btn-danger.sm {
    padding: 14px; border-radius: 12px; font-size: var(--fs-label); font-weight: 700;
  }
  .btn-primary.sm { font-weight: 800; }
  .row-center { display: flex; align-items: center; justify-content: center; gap: 6px; }

  /* ── Calculator keypad ───────────────────────────────────────────────────
     Every key here was a bare inline style with no press state at all. A
     keypad is the worst place to omit one: a key that does not answer reads
     as a missed tap, and the user presses again — which on a calculator is a
     wrong number rather than a wasted second. 0.94 and a hard 90ms, because
     the whole point is that it lands before the finger lifts. */
  .calc-key {
    height: 62px; border: none; border-radius: 18px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 24px; font-weight: 500; font-variant-numeric: tabular-nums;
    background: var(--paper); color: var(--text);
    transition: transform 170ms var(--ease-out), background-color 160ms ease, color 160ms ease, filter var(--dur-fast) ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  /* Three families, told apart by fill: numbers light grey, functions a step
     darker, operators green-tinted. Equals is the only solid key. */
  .calc-key.fn { background: var(--paper-alt); color: var(--text-soft); font-size: 19px; font-weight: 600; }
  .calc-key.op { background: var(--tanim-sk); color: var(--tanim); font-size: 26px; }
  /* The chosen operator inverts, so "which one did I press?" is answered
     without reading the line above. */
  .calc-key.op.on { background: var(--tanim); color: #fff; }
  .calc-key.eq { background: var(--tanim); color: #fff; font-size: 28px; box-shadow: 0 6px 14px -8px rgba(11,107,65,.7); }
  .calc-key:active {
    transition-duration: 90ms;
    transform: scale(0.94);
    filter: brightness(.92);
  }
  @media (prefers-reduced-motion: reduce) {
    .calc-key:active, .calc-use:active, .calc-close:active { transform: none; }
  }

  /* ── Weather ── */
  /* Photo hero that follows the clock: a sunny field by day, the same field
     under the moon from 5 PM. Ink underneath, so a slow image load shows
     dark rather than a flash of colour. */
  .wx-hero {
    position: relative; isolation: isolate; overflow: hidden;
    background: var(--ink); border-radius: var(--radius); padding: 28px 18px; color: #fff; text-align: center;
  }
  .wx-bg {
    position: absolute; inset: 0; z-index: -1; background-size: cover; background-position: center 60%;
    transition: opacity 700ms ease;
  }
  /* A light wash top to bottom: enough to hold white type over a bright sky,
     not so much that the day stops looking like day. */
  .wx-bg-day {
    background-image: linear-gradient(180deg, rgba(12,18,14,.18) 0%, rgba(12,18,14,.30) 45%, rgba(12,18,14,.58) 100%), url(${wxDay});
  }
  .wx-bg-night {
    background-image: linear-gradient(180deg, rgba(6,9,20,.05) 0%, rgba(6,9,20,.25) 55%, rgba(6,9,20,.55) 100%), url(${wxNight});
    opacity: 0;
  }
  .wx-hero[data-time="night"] .wx-bg-night { opacity: 1; }
  .wx-hero[data-time="night"] .wx-bg-day { opacity: 0; }
  .wx-hero .wx-ico, .wx-hero .wx-temp, .wx-hero .wx-cond, .wx-hero .wx-loc { text-shadow: 0 1px 4px rgba(0,0,0,.45); }
  .wx-hero .wx-ico svg { filter: drop-shadow(0 1px 3px rgba(0,0,0,.35)); }
  .wx-ico  { font-size:50px; margin-bottom:7px; }
  .wx-temp { font-family: var(--font-display); font-size: var(--fs-num); font-weight:700; }
  .wx-cond { font-size: var(--fs-body); opacity:.92; margin-top:4px; font-weight:500; }
  .wx-loc  { font-size: var(--fs-label); opacity:.75; margin-top:7px; }

  .fc-row  { display:flex; justify-content:space-between; }
  .fc-item { text-align:center; flex:1; }
  .fc-day  { font-size: var(--fs-label); font-weight:700; color:var(--text-muted); margin-bottom:6px; }
  .fc-ico  { font-size:21px; margin-bottom:4px; }
  .fc-hi   { font-size: var(--fs-label); font-weight:700; color:var(--text); }
  .fc-lo   { font-size: var(--fs-label); color:var(--text-muted); }

  .adv-item { display:flex; gap:9px; align-items:flex-start; padding:11px 13px; border-radius:12px; font-size: var(--fs-label); font-weight:500; line-height:1.55; margin-bottom:9px; }
  .adv-item:last-child { margin-bottom:0; }
  .adv-good { background:var(--green-bg); color:var(--tanim-deep); }
  .adv-warn { background:var(--gold-sk); color:var(--gold-text); }
  .adv-info { background:var(--paper-alt); color:var(--tanim-deep); }

  /* ── LSTM Forecast ── */
  .lstm-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:13px; }
  .lstm-badge { background:var(--ink); color:var(--palay); font-size: var(--fs-label); font-weight:700; padding:4px 9px; border-radius:99px; letter-spacing:0.5px; }
  .lstm-acc   { font-size: var(--fs-label); color:var(--text-muted); }
  .lstm-acc span { color:var(--tanim); font-weight:700; }

  .lstm-crop-tabs { display:flex; gap:7px; overflow-x:auto; margin-bottom:15px; padding-bottom:2px; flex-shrink:0; }
  .lstm-crop-tabs::-webkit-scrollbar { display:none; }
  .lstm-tab { flex-shrink:0; padding:6px 13px; border-radius:99px; border:1.5px solid var(--border); background:var(--bg); font-family:inherit; font-size: var(--fs-label); font-weight:600; color:var(--text-muted); cursor:pointer; }
  .lstm-tab.on { background:var(--ink); border-color:var(--ink); color:#fff; }

  .lstm-summary { display:grid; grid-template-columns:repeat(3,1fr); gap:9px; margin-bottom:15px; }
  .lstm-sum-item { background:var(--bg); border-radius:12px; padding:10px 9px; text-align:center; }
  .lstm-sum-val  { font-size: var(--fs-label); font-weight:800; color:var(--text); }
  .lstm-sum-lbl  { font-size: var(--fs-label); color:var(--text-muted); margin-top:3px; line-height:1.35; }

  .lstm-trend-up   { color:var(--tanim); }
  .lstm-trend-down { color:var(--error); }
  .lstm-trend-stable { color:var(--gold-text); }

  .lstm-forecast-row { display:flex; gap:6px; overflow-x:auto; padding-bottom:4px; margin-bottom:13px; flex-shrink:0; }
  .lstm-forecast-row::-webkit-scrollbar { display:none; }
  .lstm-day-card { flex-shrink:0; text-align:center; padding:9px 7px; border-radius:12px; min-width:46px; }
  .lstm-day-card.future { background:var(--paper-alt); border:1px solid var(--line); }
  .lstm-day-card.past   { background:var(--bg); border:1px solid var(--border); }
  .lstm-day-card.now    { background:var(--ink); border:1px solid var(--ink); }
  .lstm-day-lbl  { font-size: var(--fs-label); font-weight:700; color:var(--text-muted); margin-bottom:5px; }
  .lstm-day-card.now .lstm-day-lbl { color:var(--palay); }
  .lstm-day-price { font-size: var(--fs-label); font-weight:800; color:var(--text); }
  .lstm-day-card.now .lstm-day-price { color:#fff; }
  .lstm-day-card.future .lstm-day-price { color:var(--ink-2); }
  .lstm-day-dot  { font-size:8px; margin-top:3px; }

  .lstm-note { font-size: var(--fs-label); color:var(--text-faint); line-height:1.55; padding:9px 11px; background:var(--bg); border-radius:10px; border-left:3px solid var(--palay); }

  /* ── Profile ── */
  /* A card in the scroll, so it takes the same corner as everything around it
     rather than running square to the screen edge. */
  /* ── Profile member card ─────────────────────────────────────────────────
     Three layers under the content, back to front: a deep ink-to-forest
     gradient, rings of fine contour lines rising from the bottom-left corner
     like rice terraces seen from above, and a soft green light top-right.
     Every line is 5% white, so it's texture, never pattern-noise behind the
     name. */
  .prof-hero {
    position: relative; isolation: isolate; overflow: hidden;
    border-radius: var(--radius-lg);
    padding: 64px 20px 24px; display: flex; flex-direction: column; align-items: center;
    color: #fff; flex-shrink: 0; text-align: center;
    background:
      radial-gradient(120% 90% at 100% 0%, rgba(126,196,120,.22), transparent 55%),
      repeating-radial-gradient(circle at 0% 118%, rgba(255,255,255,.055) 0 1px, transparent 1.5px 17px),
      linear-gradient(155deg, #1D2E25 0%, var(--ink) 55%, #0D1511 100%);
    box-shadow: 0 16px 34px -18px rgba(22,33,27,.6), inset 0 1px 0 rgba(255,255,255,.08);
  }
  /* Brand on the card's top edge, like the issuer's mark on a member card. */
  .prof-brand {
    position: absolute; top: 16px; left: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .prof-brand-mark {
    width: 28px; height: 28px; border-radius: 8px; background: #fff;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 6px rgba(0,0,0,.25);
  }
  .prof-brand-name { font-family: var(--font-display); font-size: 15px; font-weight: 700; letter-spacing: -.01em; }
  .prof-role-pill {
    position: absolute; top: 16px; right: 16px;
    padding: 5px 12px; border-radius: 99px;
    background: rgba(242,179,44,.16); color: var(--palay); box-shadow: inset 0 0 0 1px rgba(242,179,44,.35);
    font-family: var(--font-display); font-size: 13px; font-weight: 700; letter-spacing: .02em;
  }
  /* The leaf, huge and faint, bleeding off the bottom-right corner. A white
     cut-out of the mark (the logo file itself has a white square behind it),
     so it tints the dark instead of adding colour. */
  .prof-watermark {
    position: absolute; right: -40px; bottom: -46px; z-index: -1; width: 190px; height: auto;
    opacity: .08; transform: rotate(-14deg); pointer-events: none; user-select: none;
  }
  .prof-ava-wrap { position: relative; margin-bottom: 13px; }
  /* A thin light ring and a soft drop lift the avatar off the texture. */
  .prof-ava {
    width: 84px; height: 84px; border-radius: 50%;
    background: var(--lime); border: none;
    display: flex; align-items: center; justify-content: center;
    font-size: var(--fs-display); font-weight: 800; color: var(--ink);
    box-shadow: 0 0 0 4px rgba(255,255,255,.10), 0 8px 18px -8px rgba(0,0,0,.6);
  }
  .prof-edit-btn {
    position: absolute; bottom: 0; right: 0; width: 27px; height: 27px;
    border-radius: 50%; background: #fff; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: var(--fs-label);
  }
  .prof-name  { font-family: var(--font-display); font-size: var(--fs-lead); font-weight: 700; margin-bottom: 3px; }
  .prof-loc {
    font-size: var(--fs-label); opacity: .72; line-height: 1.4;
    margin-bottom: 13px; max-width: 270px;
  }
  .prof-crops { display: flex; gap: 7px; flex-wrap: wrap; justify-content: center; }
  .crop-tag   { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); border-radius: 99px; padding: 4px 11px; font-size: var(--fs-label); font-weight: 600; color: #fff; }

  /* Scrollable sheets. A phone scrolls by dragging, so the bar is only clutter
     over the content, exactly as it is on .scroll and .a-scroll. */
  .modal-sheet { overflow-y: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  .modal-sheet::-webkit-scrollbar { display: none; }

  /* The crop picker in the post-a-listing sheet. minmax(0, 1fr) is the whole
     fix for the overflow: a plain 1fr will not shrink below its content, so
     "Kalamansi" pushed the tracks wider than the sheet and produced the
     horizontal scrollbar and the clipped last column. */
  .crop-pick-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; }
  .crop-pick {
    min-width: 0; border-radius: 12px; padding: 12px 6px; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    background: var(--paper); border: 2px solid var(--line);
    transition: background-color 160ms ease, border-color 160ms ease;
  }
  .crop-pick.on { background: var(--tanim-sk); border-color: var(--tanim); }
  .crop-pick-emoji { font-size: var(--fs-title); line-height: 1; }
  .crop-pick-lbl {
    font-size: var(--fs-label); font-weight: 700; color: var(--text-soft);
    text-align: center; line-height: 1.2; overflow-wrap: anywhere;
  }
  .crop-pick.on .crop-pick-lbl { color: var(--tanim); }

  /* Heading card for the AI block. A green plate so the two model cards under
     it read as one section rather than two cards that happen to be adjacent.
     Sits below the gap the scroll already provides, so it needs no margin. */
  .ai-reco-head {
    display: flex; align-items: center; gap: 11px;
    background: var(--tanim); color: #fff;
    border-radius: var(--radius); padding: 15px 18px;
    font-family: var(--font-display); font-weight: 700; font-size: var(--fs-lead);
    letter-spacing: -.01em;
  }

  /* ── Model badge ─────────────────────────────────────────────────────────
     The same pill on both forecast cards, so the two read as one family. It
     never wraps: at this card width the pill was breaking mid-label and the
     heading beside it was being clipped. The pill holds its size and the
     heading takes what is left and wraps. */
  .model-badge-row { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 4px; }
  .model-badge {
    display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0;
    background: var(--tanim-sk); color: var(--tanim);
    font-size: var(--fs-label); font-weight: 700;
    padding: 4px 11px; border-radius: 99px; white-space: nowrap;
  }
  .model-badge-title {
    font-size: var(--fs-label); font-weight: 700; color: var(--text);
    min-width: 0; line-height: 1.35; padding-top: 2px;
  }

  .info-row { display: flex; align-items: center; gap: 13px; padding: 13px 0; border-bottom: 1px solid var(--border); }
  .info-row:last-child { border-bottom: none; }
  .info-ico  { width: 38px; height: 38px; border-radius: 12px; background: var(--green-bg); display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
  .info-lbl  { font-size: var(--fs-label); color: var(--text-muted); margin-bottom: 2px; }
  .info-val  { font-size: var(--fs-label); font-weight: 600; color: var(--text); }

  .stat-row-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 9px; }
  .mini-stat     { background: var(--green-bg); border-radius: 12px; padding: 12px 9px; text-align: center; }
  .mini-stat-val { font-size: var(--fs-body); font-weight: 800; color: var(--green); }
  .mini-stat-lbl { font-size: var(--fs-label); color: var(--text-muted); margin-top: 3px; line-height: 1.35; }

  /* Pressed state is a real surface change, not just a scale. On a row this
     wide a 1% shrink is invisible; a tinted plate under the thumb is not. */
  .setting-row {
    display: flex; align-items: center; gap: 13px;
    padding: 14px 10px; margin: 0 -10px; border-radius: 12px;
    border-bottom: 1px solid var(--border); cursor: pointer; min-height: 52px;
  }
  .setting-row:active { background: var(--paper-alt); }
  .setting-row:active svg:last-child { color: var(--tanim); }
  .setting-row:last-child { border-bottom: none; }
  .setting-ico { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
  .setting-lbl { font-size: var(--fs-label); font-weight: 600; color: var(--text); flex: 1; }
  .setting-sub { font-size: var(--fs-label); color: var(--text-muted); margin-top: 2px; }
  .setting-arr { font-size: 15px; color: var(--line-strong); }

  .signout-btn { width: 100%; padding: 16px; background: var(--error-sk); color: var(--red); border: none; border-radius: var(--radius); font-family: inherit; font-size: var(--fs-label); font-weight: 700; cursor: pointer; }
  .version-txt { text-align: center; font-size: var(--fs-label); color: var(--text-faint); padding: 8px 0 12px; }

  /* ── Home / Summary Screen (Senior-friendly) ── */
  /* A card now, not a full-bleed band: it scrolls with the content and sits on
     the same 16px gutter as the stat cards under it. The bukid is scrimmed hard
     enough that white text holds over the pale flooded terraces. */
  .home-header {
    position: relative; isolation: isolate; overflow: hidden;
    border-radius: var(--radius-lg); padding: 24px 20px 22px; color: #fff;
    box-shadow: 0 16px 34px -16px rgba(22,33,27,.45);
    /* Tall enough for the bukid to be a photograph rather than a strip. The
       column lets the status pill fall to the bottom edge instead of crowding
       the date, so the height goes to the field and not to dead space. */
    min-height: 220px; display: flex; flex-direction: column;
  }
  .home-header .home-status { margin-top: auto; }
  .home-header::before {
    content: ""; position: absolute; inset: 0; z-index: -1;
    background-image:
      linear-gradient(100deg, rgba(16,21,18,.80) 0%, rgba(16,21,18,.60) 42%, rgba(16,21,18,.26) 100%),
      url(${riceFieldWide});
    background-size: cover, cover;
    background-position: center, center;
  }
  .home-top { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; }
  /* The scrim is light enough to show the field, so the type carries its own
     shadow rather than leaning entirely on the wash behind it. */
  .home-greeting {
    font-family: var(--font-display); font-size: var(--fs-title); font-weight: 700; line-height: 1.25;
    text-shadow: 0 1px 4px rgba(11,15,12,.55);
  }
  .home-date { font-size: var(--fs-body); opacity: .94; margin-top: 4px; text-shadow: 0 1px 3px rgba(11,15,12,.6); }
  .home-ava-btn  {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--lime); border: none;
    display: flex; align-items: center; justify-content: center;
    font-size: var(--fs-body); font-weight: 800; color: var(--ink); cursor: pointer; flex-shrink: 0;
  }
  .home-status { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:99px; padding:7px 13px; width:fit-content; }
  .home-status-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
  .home-status-txt { font-size: var(--fs-label); font-weight:600; opacity:.92; }

  /* Module grid */
  .module-grid { display:grid; grid-template-columns:1fr 1fr; gap:13px; }
  .module-btn {
    background: var(--white); border-radius: var(--radius); padding: 20px 15px;
    border: 1.5px solid var(--border); cursor: pointer;
    display: flex; flex-direction: column; align-items: flex-start; gap: 11px;
    box-shadow: var(--shadow-sm);
    transition: border-color 150ms ease, background-color 150ms ease, transform 190ms var(--ease-out);
    text-align: left;
  }
  .module-btn:active { border-color: var(--green); background: var(--green-bg); transform: scale(0.98); }
  /* A grid tile is its own affordance — a chevron in this width only squeezes
     the label into two lines. It gets a surface shift and a tinting icon
     instead, and the chevrons go on full-width rows where they fit. */
  .module-text { min-width: 0; }
  .module-btn:active .module-ico-wrap { background: var(--tanim-sk) !important; }
  .module-btn:active { transition-duration: 100ms; }
  .module-ico-wrap { width:50px; height:50px; border-radius:14px; display:flex; align-items:center; justify-content:center; }
  .module-lbl { font-size: var(--fs-body); font-weight: 800; color: var(--text); }
  .module-desc { font-size: var(--fs-label); color: var(--text-muted); margin-top: -3px; line-height: 1.45; }

  /* Quick price strip */
  /* ── Current prices: a swipeable strip ───────────────────────────────────
     Snap points so a swipe lands on a card rather than between two, and the
     scrollbar stays hidden because a phone scrolls by dragging. */
  .price-strip {
    display: flex; gap: 10px; overflow-x: auto; padding: 2px 0 4px;
    flex-shrink: 0; scroll-snap-type: x mandatory;
    scroll-padding-left: 0; -webkit-overflow-scrolling: touch;
  }
  .pcard {
    scroll-snap-align: start;
    flex: 0 0 148px; display: flex; flex-direction: column; gap: 2px;
    padding: 10px 10px 12px; background: var(--white);
    border: 1px solid var(--border); border-radius: var(--radius);
    box-shadow: var(--shadow-sm); cursor: pointer; text-align: left;
    font-family: inherit;
  }
  .pcard-photo {
    position: relative; width: 100%; height: 84px;
    border-radius: 12px; overflow: hidden; margin-bottom: 8px;
    background: var(--green-bg);
    display: flex; align-items: center; justify-content: center;
  }
  .pcard-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  /* The move sits on the photo, so the card leads with direction. */
  .pcard-chg {
    position: absolute; top: 6px; right: 6px;
    display: inline-flex; align-items: center; gap: 3px;
    padding: 3px 7px; border-radius: 99px;
    font-size: var(--fs-label); font-weight: 800; line-height: 1;
    font-variant-numeric: tabular-nums;
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  }
  .pcard-chg.up   { background: rgba(228,240,232,.92); color: var(--tanim); }
  .pcard-chg.down { background: rgba(250,226,223,.92); color: var(--error); }
  .pcard-name {
    font-size: var(--fs-label); font-weight: 700; color: var(--text); line-height: 1.25;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    min-height: calc(2 * 1.25em);
  }
  .pcard-group { font-size: var(--fs-label); color: var(--text-muted); line-height: 1.2; }
  .pcard-price {
    font-family: var(--font-display); font-size: var(--fs-lead); font-weight: 800;
    color: var(--text); margin-top: 4px; font-variant-numeric: tabular-nums;
  }
  .price-strip::-webkit-scrollbar { display:none; }

  /* Home section label */
  .home-sec { font-family: var(--font-display); font-size: var(--fs-body); font-weight:700; color:var(--text); margin-bottom:3px; }
  .home-sec-sub { font-size: var(--fs-label); color:var(--text-muted); margin-bottom:11px; }

  /* Advisory banner */
  .adv-banner { border-radius:14px; padding:15px; display:flex; gap:11px; align-items:flex-start; }
  .adv-banner-txt { font-size: var(--fs-label); font-weight:600; line-height:1.55; }
  .adv-banner-sub { font-size: var(--fs-label); opacity:.78; margin-top:3px; }


  /* ══════════════════════════════════════════════════════════════════════════
     EMPTY · ERROR · SKELETON
     ══════════════════════════════════════════════════════════════════════════ */

  /* ── Units ───────────────────────────────────────────────────────────────
     The unit rides with the number, never on a separate line. Set smaller and
     lighter so it reads as a suffix rather than competing with the figure;
     the number is what the eye is hunting for. Never below the 16px floor. */
  .unit-suffix {
    font-size: var(--fs-label);
    font-weight: 600;
    color: var(--text-muted);
    margin-left: 1px;
    letter-spacing: 0;
  }

  .sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
  }

  /* ── Empty & error blocks ────────────────────────────────────────────────
     Generous padding on purpose: an empty state that hugs the top of a card
     reads as a rendering bug. Centred, because there is nothing to scan. */
  .state-block {
    display: flex; flex-direction: column; align-items: center; text-align: center;
    padding: 34px 24px; gap: 4px;
  }
  .state-ico {
    width: 60px; height: 60px; border-radius: 20px; margin-bottom: 12px;
    background: var(--paper-alt); color: var(--text-muted);
    display: flex; align-items: center; justify-content: center;
  }
  .state-ico-error { background: var(--error-sk); color: var(--error); }
  .state-title {
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-body);
    color: var(--text);
  }
  .state-body {
    font-size: var(--fs-label); color: var(--text-muted);
    line-height: var(--lh-body); max-width: 30ch; margin-top: 2px;
  }
  /* 52px tall: an escape hatch nobody can hit is not an escape hatch. */
  .state-action {
    margin-top: 16px; min-height: 52px; padding: 0 22px;
    background: transparent; color: var(--tanim);
    border: none; box-shadow: inset 0 0 0 2px var(--tanim);
    border-radius: var(--radius); cursor: pointer;
    font-family: var(--font-display); font-weight: 600; font-size: var(--fs-label);
    transition: transform 190ms var(--ease-out), background-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .state-action:active { transition-duration: 100ms; transform: scale(0.97); }

  /* ── Skeletons ───────────────────────────────────────────────────────────
     The sweep is a pseudo-element moved with translateX. Animating
     background-position instead would repaint the whole block every frame;
     the classic reason skeleton screens stutter on cheap Android hardware.
     3px is deliberately slow and low-contrast: a skeleton should read as
     "coming", not compete with the content that replaces it. */
  .skel {
    display: block; position: relative; overflow: hidden;
    background: var(--paper-alt);
  }
  .skel::after {
    content: ""; position: absolute; inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(255,255,255,0.72) 50%,
      transparent 100%);
    /* linear, never an eased curve: this loops forever, and any ease makes the
       sweep stall at each end and hard-cut on the wrap. */
    animation: skel-sweep 1.4s linear infinite;
  }
  @keyframes skel-sweep { to { transform: translateX(100%); } }

  /* Reduced motion: an infinite sweep is exactly the kind of perpetual movement
     this setting exists to stop. The block still reads as a placeholder. */
  @media (prefers-reduced-motion: reduce) {
    .skel::after { animation: none; }
    .skel { background: var(--paper-alt); }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     MOTION
     Reviewed against the ten standards. Notes below record WHY a thing is the
     size it is, so the next person doesn't "improve" it back.

     Frequency governs everything here. A farmer opens this app before dawn and
     taps the bottom nav dozens of times a day. Motion that delights on the
     first run is friction on the two-hundredth. So: feedback everywhere,
     decoration almost nowhere.
     ══════════════════════════════════════════════════════════════════════════ */

  /* ── Press feedback ──────────────────────────────────────────────────────
     Justified as feedback, which is why it survives on 100+/day elements where
     decorative motion would not. 0.97 sits inside the 0.95–0.98 band; big
     surfaces take less because the same ratio reads as more movement on a
     wider element.

     Asymmetric on purpose: the press snaps at 100ms, the release eases back at
     190ms. Symmetric timing is what makes a button feel rubbery. */
  .card, .mkt-row, .exp-row, .price-row, .pcard, .module-btn,
  .setting-row, .info-row, .fchip, .lstm-tab, .add-btn, .post-btn,
  .ntab, .crop-tag, .signout-btn,
  /* Everything below had no press state at all. On a touchscreen there is no
     hover to tell you a thing is pressable, so a control that does not move
     under the thumb reads as decoration until it happens to work. */
  .row-link, .alert-row, .sdm-row, .listing,
  .cat-tab, .var-tab, .crop-pick,
  .hdr-back, .ava, .alerts-close, .prof-edit-btn,
  .qty-pick-btn,
  .btn-call, .btn-details, .add-cart-btn, .buy-now-btn, .cart-checkout-btn, .call-seller-btn {
    transition: transform 190ms var(--ease-out), background-color var(--dur-fast) ease;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .card:active, .mkt-row:active, .exp-row:active, .price-row:active,
  .pcard:active, .module-btn:active, .setting-row:active, .info-row:active,
  .fchip:active, .lstm-tab:active, .add-btn:active, .post-btn:active,
  .ntab:active, .crop-tag:active, .signout-btn:active,
  .row-link:active, .alert-row:active, .sdm-row:active, .listing:active,
  .cat-tab:active, .var-tab:active, .crop-pick:active,
  .hdr-back:active, .ava:active, .alerts-close:active,
  .prof-edit-btn:active, .qty-pick-btn:active,
  .btn-call:active, .btn-details:active,
  .add-cart-btn:active, .buy-now-btn:active, .cart-checkout-btn:active, .call-seller-btn:active {
    transition-duration: var(--dur-press);
  }
  /* Scale is proportional, so the same ratio reads as more movement the wider
     the element gets. Big surfaces take less; a 40px disc takes the most. */
  .mkt-row:active, .exp-row:active, .price-row:active,
  .setting-row:active, .info-row:active, .card:active,
  .row-link:active, .alert-row:active, .sdm-row:active,
  .listing:active { transform: scale(0.99); }
  .pcard:active, .module-btn:active,
  .cat-tab:active, .crop-pick:active { transform: scale(0.975); }
  .fchip:active, .lstm-tab:active, .crop-tag:active, .var-tab:active,
  .add-btn:active, .post-btn:active, .signout-btn:active,
  .btn-call:active, .btn-details:active, .add-cart-btn:active, .buy-now-btn:active,
  .cart-checkout-btn:active, .call-seller-btn:active { transform: scale(0.97); }
  .hdr-back:active, .ava:active, .alerts-close:active,
  .prof-edit-btn:active, .qty-pick-btn:active { transform: scale(0.92); }

  /* Surface shift as well as scale on the wide rows, for the same reason the
     settings rows already have one: a 1% shrink on a full-width row is
     invisible, but a plate appearing under the thumb is not. */
  .alert-row:active, .sdm-row:active { background: var(--paper-alt); }
  .hdr-back:active { background: var(--tanim); }
  .hdr-back:active svg { color: #fff; }
  .qty-pick-btn:active { background: var(--line); }

  /* Selected states cross-fade rather than cut. These are the controls that
     re-render a list under them, so the colour change is the only signal the
     tap registered before the content swaps. */
  .cat-tab, .var-tab, .fchip, .lstm-tab {
    transition: transform 190ms var(--ease-out),
                background-color var(--dur-fast) ease,
                border-color var(--dur-fast) ease,
                color var(--dur-fast) ease,
                box-shadow var(--dur-fast) ease;
  }

  /* The search field earns a visible focus ring: on a phone the keyboard
     covers half the screen, and the ring is what confirms which field it
     belongs to. Border-colour only — no layout-shifting border-width change. */
  .search-box {
    transition: border-color var(--dur-fast) ease, box-shadow var(--dur-fast) ease;
  }
  .search-box:focus-within {
    border-color: var(--tanim);
    box-shadow: 0 0 0 3px var(--tanim-sk);
  }

  /* ── Content arrival ─────────────────────────────────────────────────────
     A skeleton that is replaced on a single frame reads as a glitch, not as a
     load completing. Opacity only and short: this fires once per fetch, but
     it fires on top of whatever the list is already doing. */
  .content-in { animation: content-in 220ms var(--ease-out) both; }
  @keyframes content-in { from { opacity: 0; } }

  /* A run of rows inside .scroll, spaced the way .scroll spaces its own
     children, so wrapping a list in a container does not silently collapse
     the gaps between its rows. */
  .list-stack { display: flex; flex-direction: column; gap: 14px; }
  .list-stack > * { flex-shrink: 0; }

  /* ── Cart badge ──────────────────────────────────────────────────────────
     State indication, not decoration: adding to cart happens with the cart
     closed, so the count in the header is the only confirmation the tap did
     anything. Keyed on the count so it replays per change. */
  /* Keyed on the count in TradeScreen, so React remounts the node and the
     animation replays on every change rather than only on first paint. */
  .cart-badge, .nbadge.bump { transform-origin: center; animation: badge-bump 260ms var(--ease-out); }
  @keyframes badge-bump {
    0%   { transform: scale(.6); opacity: 0; }
    46%  { transform: scale(1.28); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }

  /* ── Segmented control ───────────────────────────────────────────────────
     Was three buttons each cross-fading their own background, which is what
     makes a segmented control read as three separate things that happen to be
     adjacent. One thumb that slides between them reads as a single control
     with a position — and the movement itself tells you which way you went.
     translate3d on a thumb, not background on three buttons: one composited
     layer moving instead of three repaints. */
  .seg {
    position: relative; display: flex; isolation: isolate;
    background: var(--paper-alt); border-radius: 12px; padding: 4px;
  }
  .seg-thumb {
    position: absolute; z-index: -1; top: 4px; bottom: 4px; left: 4px;
    border-radius: 9px; background: var(--tanim);
    box-shadow: 0 1px 3px rgba(22,33,27,.18);
    transition: transform 260ms var(--ease-io), width 260ms var(--ease-io);
    will-change: transform;
  }
  .seg-btn {
    flex: 1; min-width: 0; padding: 9px 4px; border: none; background: none;
    border-radius: 9px; font-family: inherit; font-size: var(--fs-label);
    font-weight: 700; color: var(--text-muted); cursor: pointer;
    transition: color 200ms ease, transform 190ms var(--ease-out);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .seg-btn[aria-selected="true"] { color: #fff; }
  .seg-btn:active { transition-duration: var(--dur-press); transform: scale(0.96); }
  @media (prefers-reduced-motion: reduce) {
    .seg-thumb { transition: none; }
  }

  /* ── Bottom nav ──────────────────────────────────────────────────────────
     Deliberately NOT animated beyond press feedback. Tab switching runs into
     the dozens per day, and an icon that springs on every tap is the kind of
     flourish that reads as cheap by week two. The active state is carried by
     colour and background: static, instant, unmissable. */

  /* ── Screen entry ────────────────────────────────────────────────────────
     Opacity only, 160ms. It had a translateY, which was wrong: at tab-switch
     frequency any positional movement becomes a tax on every navigation. The
     fade alone is enough to stop the swap feeling like a hard cut. */
  .screen-enter { animation: scr-in 160ms var(--ease-out) both; }
  @keyframes scr-in { from { opacity: 0; } }

  /* ── First-paint stagger ─────────────────────────────────────────────────
     Once per app open, so it earns its keep. 35ms between items, inside the
     30–80ms band. Never blocks interaction; a tile is tappable while it's
     still arriving. Capped at 8 so the last row is never more than ~260ms out. */
  .stagger-list > * { animation: row-in 300ms var(--ease-out) both; }
  .stagger-list > *:nth-child(1) { animation-delay: 20ms; }
  .stagger-list > *:nth-child(2) { animation-delay: 55ms; }
  .stagger-list > *:nth-child(3) { animation-delay: 90ms; }
  .stagger-list > *:nth-child(4) { animation-delay: 125ms; }
  .stagger-list > *:nth-child(5) { animation-delay: 160ms; }
  .stagger-list > *:nth-child(6) { animation-delay: 195ms; }
  .stagger-list > *:nth-child(7) { animation-delay: 230ms; }
  .stagger-list > *:nth-child(n+8) { animation-delay: 260ms; }
  @keyframes row-in { from { opacity: 0; transform: translateY(8px); } }

  /* ── Data ────────────────────────────────────────────────────────────────
     420ms breaks the sub-300ms rule knowingly. This is explanatory motion, not
     UI: the bar growing from its baseline is what tells you the axis starts at
     zero. Seen a few times a session, not a few times a minute. scaleX keeps it
     off the layout path; animating width here would repaint every frame. */
  .bar-fill {
    animation: bar-grow 420ms var(--ease-out) both;
    transform-origin: left center;
  }
  @keyframes bar-grow { from { transform: scaleX(0); } }
  .bar-track { overflow: hidden; }

  /* ── Sheets ──────────────────────────────────────────────────────────────
     Driven by components/ui/Sheet.tsx. These rules used to exist under the
     names .sheet / .sheet-scrim and were wired to nothing at all: every
     overlay in the app appeared and disappeared on a single frame, which is
     the one thing a modal must never do, because the user loses track of
     where the thing came from and what is now underneath it.

     Transitions, not keyframes, because a sheet is gesture-adjacent and gets
     opened and dismissed in quick succession. A transition caught mid-travel
     retargets from where the panel actually is; a keyframe restarts from zero
     and the sheet visibly jumps back to the bottom edge before closing. */
  .shm-scrim {
    position: absolute; inset: 0; z-index: 70;
    display: flex;
    background: rgba(16,21,18,.55);
    opacity: 0;
    /* The scrim fades faster than the panel travels, so the panel is what the
       eye follows in and the room is already lit when it lands. */
    transition: opacity var(--dur-base) var(--ease-out);
    -webkit-tap-highlight-color: transparent;
  }
  .shm-scrim[data-open="true"] { opacity: 1; }
  .shm-scrim:not([data-open="true"]) { transition-duration: var(--dur-fast); }

  .shm-bottom  { align-items: flex-end; }
  .shm-center  { align-items: center; justify-content: center; padding: 24px; }

  .shm-panel { outline: none; }
  .shm-panel:focus-visible { outline: none; }

  /* translateY(100%) rather than a pixel offset: the panel moves by exactly
     its own height whatever that height turns out to be, so a two-row alerts
     sheet and a full-height post form both start fully off the bottom edge. */
  .shm-bottom > .shm-panel {
    transform: translateY(100%);
    transition: transform var(--dur-sheet) var(--ease-drawer);
    will-change: transform;
  }
  .shm-bottom > .shm-panel[data-open="true"] { transform: translateY(0); }
  .shm-bottom > .shm-panel:not([data-open="true"]) { transition-duration: var(--dur-exit); }

  /* Centred dialogs are not anchored to an edge, so they scale from their own
     centre. Never from scale(0) — nothing in the world arrives from nothing;
     0.94 is small enough to read as an arrival and large enough to have been
     somewhere. */
  .shm-center > .shm-panel {
    opacity: 0; transform: scale(.94);
    transition: opacity var(--dur-fast) var(--ease-out),
                transform var(--dur-base) var(--ease-out);
    will-change: transform, opacity;
  }
  .shm-center > .shm-panel[data-open="true"] { opacity: 1; transform: scale(1); }
  .shm-center > .shm-panel:not([data-open="true"]) { transform: scale(.97); }

  /* ── Offline banner ──────────────────────────────────────────────────────
     Connectivity flaps in the field, so this is a transition: a banner caught
     halfway out reverses from where it is instead of snapping to the top and
     replaying. Collapses from zero height so content settles rather than jumps. */
  .offline-banner {
    transition: transform 240ms var(--ease-out), opacity 200ms var(--ease-out);
  }
  .offline-banner[data-entering="true"] { transform: translateY(-100%); opacity: 0; }

  /* ── Reduced motion ──────────────────────────────────────────────────────
     Gentler, not zero. Movement goes; fades stay, because the fade is what
     stops a screen swap reading as a hard cut. Press feedback stays too, because it
     is feedback, and removing it makes the app feel broken, not calmer. */
  @media (prefers-reduced-motion: reduce) {
    .stagger-list > * { animation: row-in-reduced 200ms ease both; }
    @keyframes row-in-reduced { from { opacity: 0; } }
    .bar-fill { animation: none; }
    /* The sheet still announces itself, it just stops travelling: a panel
       that pops into existence with no transition at all is not calmer, it
       is harder to follow. Fade only, and no scale on the centred variant. */
    .shm-bottom > .shm-panel,
    .shm-center > .shm-panel {
      transform: none; opacity: 0;
      transition: opacity 140ms ease;
    }
    .shm-bottom > .shm-panel[data-open="true"],
    .shm-center > .shm-panel[data-open="true"] { transform: none; opacity: 1; }
    .shm-center > .shm-panel:not([data-open="true"]) { transform: none; }
    .offline-banner[data-entering="true"] { transform: none; }
    .content-in { animation: none; }
    .cart-badge, .nbadge.bump { animation: none; }
  }

`;
