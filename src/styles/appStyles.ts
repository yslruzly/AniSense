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
      /* No safe-area padding here, on purpose. Padding the shell would band
         the screen in the shell's own colour; instead every element that
         reaches an edge takes the inset itself, so the header's white runs
         under the status bar and the page runs under the gesture pill. */
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
    /* No line, no colour of its own: the bar, the status strip above it and
       the page below are one surface, so nothing cuts across the top of the
       screen. The header still owns the status-bar inset, so the row inside
       centres on its own 66px underneath it.
       (The shorthand goes first: written after padding-top it reset the
       inset to zero and let the row drift up under the status bar.) */
    height: calc(66px + var(--safe-top));
    padding: 0 18px; padding-top: var(--safe-top);
    background: transparent; flex-shrink: 0;
    display: flex; align-items: center; justify-content: space-between;
  }
  .hdr-brand { display: flex; align-items: center; gap: 11px; }
  /* Centred brand: the mark and name sit in the middle of the bar whatever
     is beside them, so the bell moving in or out never shifts the logo.
     Absolute, because centring it in the flex row would only centre it in
     the space the bell leaves over. */
  .hdr.center { justify-content: flex-end; }
  .hdr.center .hdr-brand {
    position: absolute; left: 50%; transform: translateX(-50%);
    pointer-events: none;
  }
  .hdr.center .hdr-title { font-size: 19px; letter-spacing: -.01em; }
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
  /* Where the bell sits against the right edge. 0 keeps its 40px tap box
     inside the gutter; a bigger number moves it further left, a negative
     one pushes it toward the edge. */
  .hdr-right > .notif:last-child { margin-right: 0; }
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
  /* ── Alerts ──────────────────────────────────────────────────────────────
     A deep green head with light pooling in its corner, the bell in a glass
     tile, and a count of today's alerts. Underneath, each alert is a card
     with a filled tile in the colour of what it means (green good news, gold
     a warning, red a loss, blue the weather), a small label naming the kind,
     and any number pulled out into a chip of the same colour. */
  .alerts-sheet {
    width: 100%; max-height: 84%; background: var(--paper);
    border-radius: 26px 26px 0 0; padding-bottom: calc(22px + var(--safe-bottom));
    overflow-y: auto; scrollbar-width: none;
  }
  .alerts-sheet::-webkit-scrollbar { display: none; }
  .alerts-head {
    position: sticky; top: 0; z-index: 2;
    border-radius: 26px 26px 0 0; padding: 20px 18px 18px;
    display: flex; align-items: center; gap: 13px;
    background:
      radial-gradient(120% 140% at 100% 0%, rgba(126,196,120,.32), transparent 58%),
      linear-gradient(160deg, #13744A 0%, var(--tanim-deep) 100%);
    box-shadow: 0 10px 22px -18px rgba(4,20,12,.9);
  }
  .alerts-head-ico {
    width: 46px; height: 46px; flex-shrink: 0; border-radius: 14px; color: #fff;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(180deg, rgba(255,255,255,.24), rgba(255,255,255,.1));
    box-shadow: inset 0 1px 0 rgba(255,255,255,.3), inset 0 0 0 1px rgba(255,255,255,.22);
  }
  .alerts-head-txt { flex: 1; min-width: 0; }
  .alerts-head-t {
    display: flex; align-items: center; gap: 8px;
    font-family: var(--font-display); font-size: 21px; font-weight: 700; letter-spacing: -.015em; color: #fff;
  }
  .alerts-count {
    padding: 3px 9px; border-radius: 99px; font-family: var(--font-body); font-size: 12px; font-weight: 800;
    background: #F2B32C; color: #3A2A05; letter-spacing: .01em; font-variant-numeric: tabular-nums;
  }
  .alerts-head-s { font-size: 13.5px; color: rgba(255,255,255,.8); margin-top: 3px; line-height: 1.35; }
  .alerts-close {
    background: rgba(255,255,255,.16); border: none; border-radius: 50%;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,.22);
    width: 40px; height: 40px; flex-shrink: 0; cursor: pointer; align-self: flex-start;
    display: flex; align-items: center; justify-content: center;
    transition: transform 190ms var(--ease-out), background-color 160ms ease;
  }
  .alerts-close:active { transition-duration: 100ms; transform: scale(0.94); background: rgba(255,255,255,.3); }
  .alerts-body { padding: 16px 14px 0; display: flex; flex-direction: column; gap: 10px; }
  .alert-row {
    display: flex; align-items: center; gap: 12px; padding: 12px 12px 12px 12px;
    background: var(--card); border-radius: 18px;
    box-shadow: inset 0 0 0 1px var(--line), 0 10px 18px -16px rgba(22,33,27,.45);
  }
  .alert-ico {
    width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0; color: #fff;
    display: flex; align-items: center; justify-content: center;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.18);
  }
  .alert-row.green .alert-ico { background: linear-gradient(180deg, #16895B 0%, var(--tanim) 55%, #07522F 100%); }
  .alert-row.gold  .alert-ico { background: linear-gradient(180deg, #D39B2E 0%, #B07A16 55%, #8A5D0C 100%); }
  .alert-row.red   .alert-ico { background: linear-gradient(180deg, #D0564A 0%, #B3342A 55%, #86190F 100%); }
  .alert-row.blue  .alert-ico { background: linear-gradient(180deg, #4A8FCC 0%, #2F6FA8 55%, #235887 100%); }
  .alert-txt { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .alert-kind { font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
  .alert-row.green .alert-kind { color: var(--tanim); }
  .alert-row.gold  .alert-kind { color: var(--gold-text); }
  .alert-row.red   .alert-kind { color: var(--error); }
  .alert-row.blue  .alert-kind { color: #2F6FA8; }
  .alert-t { font-family: var(--font-display); font-size: 15.5px; font-weight: 700; letter-spacing: -.005em; color: var(--text); line-height: 1.25; }
  .alert-b { font-size: 13.5px; color: var(--text-muted); line-height: 1.4; }
  .alert-chip {
    flex-shrink: 0; align-self: center; padding: 5px 10px; border-radius: 99px;
    font-family: var(--font-display); font-size: 14px; font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap;
  }
  .alert-row.green .alert-chip { background: var(--tanim-sk); color: var(--tanim-deep); }
  .alert-row.gold  .alert-chip { background: var(--gold-sk); color: var(--gold-text); }
  .alert-row.red   .alert-chip { background: var(--error-sk); color: var(--error); }
  .alert-row.blue  .alert-chip { background: #DCEAF8; color: #2F6FA8; }
  .alerts-empty { padding: 30px 12px 12px; text-align: center; display: flex; flex-direction: column; align-items: center; }
  .alerts-empty-ico {
    width: 60px; height: 60px; border-radius: 50%; margin-bottom: 12px;
    display: flex; align-items: center; justify-content: center;
    background: var(--tanim-sk); color: var(--tanim);
  }
  .alerts-empty-t { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--text); }
  .alerts-empty-s { font-size: 14px; color: var(--text-muted); margin-top: 6px; line-height: 1.5; max-width: 280px; }

  /* ── Scroll ── */
  .scroll {
    flex: 1; overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 14px;
    /* The bar floats over this, so the last card needs room to clear it
       rather than coming to rest underneath. */
    padding-bottom: calc(var(--bnav-h) + 26px + var(--safe-bottom));
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

  /* ── Bottom nav ──────────────────────────────────────────────────────────
     A floating layer, not a strip. Content scrolls underneath a translucent
     bar instead of stopping dead at an opaque edge, which is what makes the
     screen read as one surface with chrome above it. */
  .bnav {
    position: absolute; z-index: 40;
    left: 14px; right: 14px; bottom: calc(12px + var(--safe-bottom));
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

  /* ── Analytics ───────────────────────────────────────────────────────────── */
  /* The forecast: the page's hero, on the same ink as Prices' "Today's market"
     card, so the two dark cards read as the app's two data centrepieces. */
  .fc {
    position: relative; overflow: hidden; isolation: isolate; flex-shrink: 0;
    display: flex; flex-direction: column; gap: 14px;
    padding: 18px 18px 16px; border-radius: 26px; color: #fff;
    background:
      radial-gradient(120% 90% at 100% 0%, rgba(78,155,219,.2), transparent 58%),
      linear-gradient(150deg, #1D2E25 0%, var(--ink) 60%, #0D1511 100%);
    box-shadow: 0 18px 34px -22px rgba(22,33,27,.8), inset 0 0 0 1px rgba(255,255,255,.05);
  }
  .fc-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .fc-t { margin: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -.01em; }
  .fc-s { font-size: 13px; font-weight: 600; color: rgba(255,255,255,.6); }

  /* The crop switch on ink: the same pill, a darker well. */
  .fseg.on-ink {
    background: rgba(0,0,0,.28);
    box-shadow: inset 0 1px 2px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.06);
  }
  .fseg.on-ink .fseg-tab { color: rgba(255,255,255,.68); }
  .fseg.on-ink .fseg-tab.on { color: #fff; }

  .fc-read { display: flex; align-items: flex-end; gap: 12px; animation: fc-in 260ms var(--ease-out) both; }
  .fc-col { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .fc-k { font-size: 12.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: rgba(255,255,255,.6); }
  .fc-v { font-family: var(--font-display); font-size: 30px; font-weight: 700; line-height: 1.05; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
  .fc-to { color: rgba(255,255,255,.45); margin-bottom: 6px; flex-shrink: 0; }
  @keyframes fc-in { from { opacity: 0; transform: translateY(4px); } }

  .fc-verdict { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 10px; margin-top: -4px; }
  .fc-chip {
    display: inline-flex; align-items: center; gap: 4px; padding: 5px 11px 5px 8px; border-radius: 99px;
    font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums;
    background: rgba(255,255,255,.1); color: rgba(255,255,255,.88);
  }
  .fc-chip.up { background: rgba(126,196,120,.16); color: #9BD796; box-shadow: inset 0 0 0 1px rgba(126,196,120,.28); }
  .fc-chip.down { background: rgba(240,138,126,.16); color: #F4B2AB; box-shadow: inset 0 0 0 1px rgba(240,138,126,.28); }
  .fc-say { font-size: 14px; font-weight: 600; color: rgba(255,255,255,.78); }

  /* The chart. Recessive grid and axis; the line and band do the talking. */
  .fc-chart { position: relative; margin: 0 -4px; }
  .fc-svg { display: block; width: 100%; height: auto; touch-action: pan-y; user-select: none; -webkit-user-select: none; cursor: crosshair; overflow: visible; }
  .fc-grid { stroke: rgba(255,255,255,.07); stroke-width: 1; }
  .fc-axis { font-size: 10.5px; fill: rgba(255,255,255,.5); font-variant-numeric: tabular-nums; }
  .fc-axis.now { fill: rgba(255,255,255,.85); font-weight: 700; }
  .fc-now { stroke: rgba(255,255,255,.22); stroke-width: 1; stroke-dasharray: 3 3; }
  .fc-band { opacity: .2; }
  .fc-past { fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 0; }
  .fc-future { fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 5 5; }
  /* A 2px ring in the card's colour lifts each dot off the line under it. */
  .fc-dot { stroke: #16211B; stroke-width: 2; }
  .fc-endlbl { font-size: 12px; font-weight: 700; fill: #fff; font-variant-numeric: tabular-nums; }
  .fc-scrub line { stroke: rgba(255,255,255,.4); stroke-width: 1; }

  /* The story told once: what happened draws in from the left, then the
     forecast and its range fade up after it. On a crop switch the same, in
     less time; coming back to the page, it is simply there. */
  .shell:not([data-revisit]) .fc-plot.first .fc-past { animation: fc-draw 620ms var(--ease-out) 120ms both; }
  .shell:not([data-revisit]) .fc-plot.first :is(.fc-band, .fc-future, .fc-end) { animation: fc-fade 320ms var(--ease-out) 620ms both; }
  .fc-plot.swap .fc-past { animation: fc-draw 380ms var(--ease-out) both; }
  .fc-plot.swap :is(.fc-band, .fc-future, .fc-end) { animation: fc-fade 240ms var(--ease-out) 300ms both; }
  @keyframes fc-draw { from { stroke-dashoffset: 1; } }
  @keyframes fc-fade { from { opacity: 0; } }

  /* The tooltip rides above the finger, never under it. */
  .fc-tip {
    position: absolute; top: -8px; z-index: 2; transform: translate(-50%, -100%);
    display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 7px 11px; border-radius: 12px;
    background: #fff; color: var(--text); white-space: nowrap; pointer-events: none;
    box-shadow: 0 10px 22px -10px rgba(0,0,0,.55);
    animation: fc-tip-in 120ms var(--ease-out);
  }
  .fc-tip-k { font-size: 12px; font-weight: 700; color: var(--text-faint); }
  .fc-tip-v { font-family: var(--font-display); font-size: 17px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .fc-tip-r { font-size: 11.5px; color: var(--text-muted); font-variant-numeric: tabular-nums; }
  @keyframes fc-tip-in { from { opacity: 0; transform: translate(-50%, calc(-100% + 4px)); } }

  .fc-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 12.5px; font-weight: 600; color: rgba(255,255,255,.72); }
  .fc-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .fc-legend i { display: inline-block; width: 18px; height: 3px; border-radius: 2px; }
  .fc-legend i.dashed { height: 0; border-top: 3px dashed currentColor; background: none; }
  .fc-legend i.band { height: 10px; border-radius: 3px; opacity: .3; }
  .fc-hint { margin: -6px 0 0; font-size: 12.5px; color: rgba(255,255,255,.5); }
  .fc-hint + .fc-hint { margin-top: -10px; }
  .fc-none { margin: 0; font-size: 15px; line-height: 1.5; color: rgba(255,255,255,.8); }

  /* White cards under the hero. */
  .an-stack { display: flex; flex-direction: column; gap: 14px; }
  .an-card {
    padding: 16px; border-radius: 22px; background: var(--card);
    box-shadow: inset 0 0 0 1px var(--line), 0 12px 24px -20px rgba(22,33,27,.45);
  }
  .an-card-t { margin: 0; font-family: var(--font-display); font-size: 18px; font-weight: 700; letter-spacing: -.01em; color: var(--text); }
  .an-card-s { margin: 3px 0 12px; font-size: 14px; line-height: 1.4; color: var(--text-muted); }

  /* Price change today: name, a diverging bar from the middle, the value. */
  .mc-list { display: flex; flex-direction: column; }
  .mc-row { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.4fr) 54px; align-items: center; gap: 10px; min-height: 40px; }
  .mc-row + .mc-row { border-top: 1px solid var(--line); }
  .mc-name { display: flex; align-items: center; gap: 6px; min-width: 0; }
  .mc-n { font-size: 15px; font-weight: 600; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .mc-row.mine .mc-n { font-weight: 800; }
  .mc-yours {
    flex-shrink: 0; padding: 2px 7px; border-radius: 99px; font-size: 11px; font-weight: 800;
    background: var(--tanim-sk); color: var(--tanim);
  }
  .mc-track { position: relative; height: 12px; }
  .mc-zero { position: absolute; left: 50%; top: -6px; bottom: -6px; width: 1px; background: var(--line-strong); }
  .mc-bar { position: absolute; top: 0; bottom: 0; }
  .mc-bar.up { background: var(--tanim); border-radius: 0 4px 4px 0; transform-origin: left center; }
  .mc-bar.down { background: var(--error); border-radius: 4px 0 0 4px; transform-origin: right center; }
  /* Values wear the text colour; the bar beside them carries the colour. */
  .mc-val { text-align: right; font-size: 14.5px; font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; }
  /* Each bar grows out of the zero line, the way a change grows from nothing.
     Explanatory, seen once per visit; stagger keeps it a read, not a wait. */
  .shell:not([data-revisit]) .mc-bar { animation: mc-grow 480ms var(--ease-out) both; }
  @keyframes mc-grow { from { transform: scaleX(0); } }

  .an-note { margin: 0 4px; font-size: 13px; line-height: 1.5; color: var(--text-faint); }

  @media (prefers-reduced-motion: reduce) {
    .shell:not([data-revisit]) .fc-plot.first .fc-past, .fc-plot.swap .fc-past { animation: none; }
    .shell:not([data-revisit]) .fc-plot.first :is(.fc-band, .fc-future, .fc-end),
    .fc-plot.swap :is(.fc-band, .fc-future, .fc-end) { animation: fc-fade 200ms ease both; }
    .fc-read, .fc-tip { animation: none; }
    .shell:not([data-revisit]) .mc-bar { animation: none; }
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
  /* Inline, not flex: when a long barangay does wrap, the lines stay centred
     and even, and the pin sits with the first word instead of floating beside
     a two-line block. */
  .wid-loc {
    margin-top: 6px; padding: 0 14px; text-align: center; text-wrap: balance;
    font-size: 13.5px; line-height: 1.35; color: var(--text-faint);
  }
  .wid-loc svg { display: inline-block; vertical-align: -2px; margin-right: 4px; color: var(--tanim); }

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

  /* View mode (opened from Profile): no lanyard drop or delayed buttons, the
     panel's own scale-in is enough; the light still passes once, quickly. */
  .wid.is-view .wid-title, .wid.is-view .wid-sub, .wid.is-view .wid-actions { animation: none; }
  .wid.is-view .wid-card { animation: none; }
  .wid.is-view .wid-shine { animation-delay: 250ms; animation-duration: 800ms; }

  /* Download button states. */
  .wid-btn-lbl { display: inline-flex; align-items: center; gap: 8px; animation: wid-lbl-in 200ms var(--ease-out); }
  @keyframes wid-lbl-in { from { opacity: 0; transform: scale(.95); filter: blur(2px); } to { opacity: 1; transform: none; filter: none; } }
  .wid-btn.is-done { box-shadow: inset 0 0 0 1.5px rgba(126,196,120,.7); color: #BFE6C4; }
  .wid-btn.is-failed { box-shadow: inset 0 0 0 1.5px rgba(233,120,110,.7); color: #F6C3BD; }
  /* Fast on purpose: a quicker spinner makes the same wait feel shorter. */
  .wid-spin {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2.5px solid rgba(255,255,255,.3); border-top-color: #fff;
    animation: wid-spin 650ms linear infinite;
  }
  @keyframes wid-spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .wid-btn-lbl { animation: none; } }

  /* "Show Member ID" on the profile card: glass on the dark, full width at
     the card's foot, 48px so it's an easy reach. */
  .prof-id-btn {
    margin-top: 16px; width: 100%; min-height: 48px; border: none; border-radius: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: rgba(255,255,255,.12); color: #fff; box-shadow: inset 0 0 0 1px rgba(255,255,255,.26);
    font-family: var(--font-display); font-size: 15.5px; font-weight: 700;
    transition: transform 160ms var(--ease-out), background-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .prof-id-btn:active { transform: scale(.97); background: rgba(255,255,255,.2); transition-duration: 90ms; }
  @media (prefers-reduced-motion: reduce) { .prof-id-btn:active { transform: none; } }

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

  /* ── Prices screen ───────────────────────────────────────────────────────── */
  .pr-sec {
    margin: 0 0 10px; font-family: var(--font-display); font-size: 18px; font-weight: 700;
    color: var(--text); letter-spacing: -.01em;
  }
  .pr-all { display: flex; flex-direction: column; gap: 12px; }
  .pr-all .pr-sec { margin-bottom: 0; }

  /* 1 · Today's market: the page's answer in one line, then the proof in a bar. */
  .pr-pulse {
    position: relative; overflow: hidden; isolation: isolate;
    padding: 18px 18px 16px; border-radius: var(--radius-lg); color: #fff;
    background:
      radial-gradient(120% 100% at 100% 0%, rgba(126,196,120,.25), transparent 58%),
      linear-gradient(150deg, #1D2E25 0%, var(--ink) 60%, #0D1511 100%);
    box-shadow: 0 16px 30px -20px rgba(22,33,27,.7);
  }
  .pr-pulse-lbl { font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.66); }
  .pr-pulse-head {
    margin-top: 6px; font-family: var(--font-display); font-size: 23px; font-weight: 700; line-height: 1.2;
    letter-spacing: -.015em; text-wrap: balance;
  }
  .pr-pulse-head.muted { color: rgba(255,255,255,.7); font-size: 18px; }
  .pr-breadth { display: flex; gap: 3px; height: 10px; margin-top: 14px; }
  .pr-breadth .seg {
    flex-basis: 0; border-radius: 99px; transform-origin: left center;
    animation: bar-grow 600ms var(--ease-out) both;
  }
  .pr-breadth .seg.up { background: #7EC478; }
  .pr-breadth .seg.flat { background: rgba(255,255,255,.35); animation-delay: 60ms; }
  .pr-breadth .seg.down { background: #F08A7E; animation-delay: 120ms; }
  .pr-breadth-key { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 8px; font-size: 14px; color: rgba(255,255,255,.85); font-variant-numeric: tabular-nums; }
  .pr-breadth-key span { display: inline-flex; align-items: center; gap: 6px; }
  .pr-breadth-key i { width: 9px; height: 9px; border-radius: 3px; display: inline-block; }
  .pr-breadth-key i.up { background: #7EC478; } .pr-breadth-key i.flat { background: rgba(255,255,255,.35); } .pr-breadth-key i.down { background: #F08A7E; }
  .pr-fresh {
    display: inline-flex; align-items: center; gap: 8px; margin-top: 14px; padding: 5px 10px 5px 8px;
    border-radius: 99px; background: rgba(255,255,255,.1); font-size: 13px; color: rgba(255,255,255,.85);
  }
  .pr-fresh-dot { width: 8px; height: 8px; border-radius: 50%; background: #7EC478; box-shadow: 0 0 0 3px rgba(126,196,120,.25); }
  .pr-fresh.off .pr-fresh-dot { background: #F08A7E; box-shadow: 0 0 0 3px rgba(240,138,126,.25); animation: pulse 1.6s ease-in-out infinite; }
  .pr-num { color: #9BD796; font-variant-numeric: tabular-nums; }

  /* The farmer stands in the lower right, cut off at the apron by the
     card's own bottom edge, so he reads as standing behind it with his
     basket held up over it. The numbers keep a column clear of him and sit
     above him in the stack. */
  .pr-pulse.has-mascot { min-height: 196px; }
  .pr-pulse.has-mascot > :not(.pr-mascot) { position: relative; z-index: 1; }
  .pr-pulse.has-mascot .pr-pulse-head,
  .pr-pulse.has-mascot .pr-breadth,
  .pr-pulse.has-mascot .pr-breadth-key { margin-right: 112px; }
  /* The freshness pill keeps out of his way too: in Filipino on a narrow
     phone it is long enough to reach him, so it may wrap to two lines, and
     a squarer corner keeps a two-line pill from looking like a lozenge. */
  .pr-pulse.has-mascot .pr-fresh { max-width: calc(100% - 112px); border-radius: 12px; line-height: 1.3; }
  .pr-pulse.has-mascot .pr-fresh-dot { flex-shrink: 0; }
  .pr-mascot {
    position: absolute; right: -16px; bottom: -10px; z-index: 0; width: 146px;
    aspect-ratio: 420 / 474; pointer-events: none;
  }
  .pb-fig {
    position: relative; width: 100%; height: 100%;
    /* Lifts him off the dark card without a hard edge. */
    filter: drop-shadow(0 8px 14px rgba(0,0,0,.35));
    /* Breathing: three pixels, slow, so he is alive at the edge of the eye
       and never competes with the numbers being read. */
    animation: pr-bob 3.8s ease-in-out 1.4s infinite alternate;
  }
  @keyframes pr-bob { to { transform: translateY(-3px); } }
  .pb-fig img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
  /* Face layers: shown in turn, never faded. A blink or a mouth shape that
     dissolves reads as a ghost; one that snaps reads as a face moving. */
  .pb-blink, .pb-mouth { opacity: 0; }
  /* A blink every 4.6 s, shut for about 140 ms, the length of a real one. */
  .pb-blink { animation: pb-blink 4.6s step-end 1.2s infinite; }
  @keyframes pb-blink { 0% { opacity: 0; } 94% { opacity: 1; } 97% { opacity: 0; } }
  /* Talking: open, half, shut, half, open… in quick 130 ms beats, the
     pace of lively chatter, for about a second and a half, then a short
     smiling pause with his mouth open, and again. Two layers share one
     clock, so their beats never drift apart. */
  .pb-mouth.half { animation: pb-talk-half 2.2s step-end .9s infinite; }
  .pb-mouth.shut { animation: pb-talk-shut 2.2s step-end .9s infinite; }
  @keyframes pb-talk-half {
    0% { opacity: 0; } 6% { opacity: 1; } 12% { opacity: 0; } 18% { opacity: 1; } 24% { opacity: 0; }
    30% { opacity: 1; } 36% { opacity: 0; } 48% { opacity: 1; } 54% { opacity: 0; } 60% { opacity: 1; } 66% { opacity: 0; }
  }
  @keyframes pb-talk-shut {
    0% { opacity: 0; } 12% { opacity: 1; } 18% { opacity: 0; } 36% { opacity: 1; } 42% { opacity: 0; } 54% { opacity: 1; } 60% { opacity: 0; }
  }
  /* Once per visit to the app, not on every tab switch: Prices is opened
     again and again, and a greeting on the twentieth visit is a delay.
     After the first, he is simply there. */
  .shell:not([data-revisit]) .pr-mascot.basket { animation: pr-rise 560ms var(--ease-out) 300ms both; }
  @keyframes pr-rise {
    from { opacity: 0; transform: translateY(44px); }
    to   { opacity: 1; transform: none; }
  }
  .shell:not([data-revisit]) .pr-mascot.basket.good { animation: pr-hop 900ms var(--ease-out) 300ms both; }
  @keyframes pr-hop {
    0%   { opacity: 0; transform: translateY(46px); }
    45%  { opacity: 1; transform: translateY(-8px); }
    62%  { transform: translateY(0); }
    78%  { transform: translateY(-3px); }
    100% { transform: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    .shell:not([data-revisit]) .pr-mascot.basket,
    .pb-fig, .pb-blink, .pb-mouth { animation: none; }
  }

  /* Change chip: arrow, sign and colour, so direction never rests on colour. */
  .pr-chg {
    display: inline-flex; align-items: center; gap: 2px; padding: 2px 8px 2px 6px; border-radius: 99px;
    font-size: 13.5px; font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap;
    background: var(--paper); color: var(--text-muted);
  }
  .pr-chg.up { background: var(--tanim-sk); color: var(--tanim); }
  .pr-chg.down { background: var(--error-sk); color: var(--error); }
  .pr-chg.big { font-size: 15px; padding: 4px 10px 4px 8px; }

  /* 2 · Biggest moves: photo-first cards in a row you swipe, snapping per card. */
  .pr-movers {
    display: flex; gap: 10px; overflow-x: auto; scroll-snap-type: x mandatory;
    margin: 0 -16px; padding: 2px 16px 8px; scroll-padding-left: 16px; scrollbar-width: none;
  }
  .pr-movers::-webkit-scrollbar { display: none; }
  .pr-mover {
    flex: 0 0 138px; scroll-snap-align: start; padding: 0; border: none; cursor: pointer; text-align: left;
    background: var(--card); border-radius: 18px; overflow: hidden; font: inherit; color: inherit;
    box-shadow: inset 0 0 0 1px var(--line), 0 6px 16px -12px rgba(22,33,27,.35);
    transition: transform 180ms var(--ease-out);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .pr-mover:active { transform: scale(.97); transition-duration: 90ms; }
  .pr-mover-photo { display: flex; align-items: center; justify-content: center; height: 88px; background: var(--tanim-sk); }
  .pr-mover-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .pr-mover-body { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; padding: 10px 12px 12px; }
  /* Two lines, and always two lines' worth of room, so "Diamante Max F1"
     isn't cut to "Diamante Ma…" and the prices still line up across cards. */
  .pr-mover-name {
    font-family: var(--font-display); font-size: 15px; font-weight: 700; line-height: 1.2; color: var(--text);
    min-height: 2.4em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .pr-mover-price { font-family: var(--font-display); font-size: 17px; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums; }
  .pr-mover-price small, .pr-big small { font-size: .7em; font-weight: 600; color: var(--text-faint); margin-left: 1px; }

  /* 3 · All prices, organised: a family label, then one card per crop with
     its photo, how many varieties and the range they sell in, then the
     varieties themselves as compact rows. The family carries the same colour
     as its card on Home: gold crops, green vegetables, coral fruits. */
  .pr-fseg { flex: none; margin-top: 2px; }
  .pr-fams { display: flex; flex-direction: column; gap: 18px; }
  .pr-fam { display: flex; flex-direction: column; gap: 10px; }
  .pr-fam-t {
    display: flex; align-items: center; gap: 8px; margin: 0 2px;
    font-family: var(--font-body); font-size: 12.5px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
    color: var(--text-muted);
  }
  .pr-fam-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--tanim); }
  .pr-fam.crops .pr-fam-dot { background: #B07A16; }
  .pr-fam.fruits .pr-fam-dot { background: #D0532F; }
  .pr-fam-n {
    margin-left: 2px; min-width: 20px; height: 20px; padding: 0 6px; border-radius: 99px;
    display: inline-flex; align-items: center; justify-content: center;
    background: var(--paper-alt); color: var(--text-muted); font-size: 11.5px; letter-spacing: 0;
  }
  .pr-grp {
    background: var(--card); border-radius: 18px; overflow: hidden;
    box-shadow: inset 0 0 0 1px var(--line), 0 10px 20px -18px rgba(22,33,27,.45);
  }
  .pr-grp-head {
    display: flex; align-items: center; gap: 12px; padding: 12px 14px;
    background: linear-gradient(180deg, #F5F8F5, #FFFFFF);
    border-bottom: 1px solid var(--line);
  }
  .pr-grp-photo {
    width: 46px; height: 46px; flex: 0 0 46px; border-radius: 13px; overflow: hidden;
    display: flex; align-items: center; justify-content: center; background: var(--tanim-sk); color: var(--tanim);
    box-shadow: 0 6px 12px -8px rgba(22,33,27,.5);
  }
  .pr-grp-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .pr-grp-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .pr-grp-name { font-family: var(--font-display); font-size: 17px; font-weight: 700; letter-spacing: -.01em; color: var(--text); }
  .pr-grp-sub { font-size: 13px; color: var(--text-faint); font-variant-numeric: tabular-nums; }
  .pr-grp-rows { display: flex; flex-direction: column; padding: 2px 0; }
  .pr-vrow {
    position: relative; width: 100%; min-height: 54px; display: flex; align-items: center; gap: 10px;
    padding: 8px 10px 8px 14px; border: none; background: none; font: inherit; color: inherit; text-align: left; cursor: pointer;
    transition: background-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .pr-vrow + .pr-vrow::before { content: ""; position: absolute; top: 0; left: 14px; right: 14px; height: 1px; background: var(--line); }
  .pr-vrow:active { background: var(--paper); transition-duration: var(--dur-press); }
  .pr-vrow-name {
    flex: 1; min-width: 0; font-family: var(--font-display); font-size: 15px; font-weight: 600; color: var(--text);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .pr-vrow-price {
    flex-shrink: 0; font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--text);
    font-variant-numeric: tabular-nums; white-space: nowrap;
  }
  .pr-vrow-price small { font-size: 12px; font-weight: 600; color: var(--text-faint); margin-left: 1px; }
  .pr-vrow .pr-chg { flex-shrink: 0; min-width: 64px; justify-content: center; }

  .pr-clear {
    width: 32px; height: 32px; margin: -6px -6px -6px auto; border: none; border-radius: 50%; cursor: pointer;
    background: var(--paper-alt); color: var(--text-soft); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .search-box input { flex: 1; min-width: 0; }
  .pr-row-chev { color: var(--line-strong); flex-shrink: 0; margin-left: -4px; }

  /* ── Crop sheet ── */
  .pr-sheet {
    width: 100%; max-height: 90%; background: var(--card); border-radius: 24px 24px 0 0; overflow-y: auto;
    padding-bottom: calc(22px + var(--safe-bottom));
  }
  .pr-sheet-hero { position: relative; height: 150px; overflow: hidden; border-radius: 24px 24px 0 0; }
  .pr-sheet-photo { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: var(--tanim-sk); }
  .pr-sheet-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .pr-sheet-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,14,12,.05) 30%, rgba(10,14,12,.72) 100%); }
  .pr-sheet-id { position: absolute; left: 18px; right: 70px; bottom: 14px; color: #fff; }
  .pr-sheet-group { font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; opacity: .85; }
  .pr-sheet-name { font-family: var(--font-display); font-size: 23px; font-weight: 700; line-height: 1.15; letter-spacing: -.015em; text-shadow: 0 1px 6px rgba(0,0,0,.35); }
  .pr-sheet-x {
    position: absolute; top: 12px; right: 12px; width: 40px; height: 40px; border: none; border-radius: 50%; cursor: pointer;
    background: rgba(10,14,12,.45); color: #fff; display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    transition: transform 160ms var(--ease-out), background-color 160ms ease;
  }
  .pr-sheet-x:active { transform: scale(.92); background: rgba(10,14,12,.6); transition-duration: 90ms; }
  .pr-sheet-body { padding: 16px 18px 0; }
  .pr-sheet-price { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .pr-big { font-family: var(--font-display); font-size: 34px; font-weight: 800; color: var(--text); letter-spacing: -.02em; font-variant-numeric: tabular-nums; line-height: 1; }
  .pr-sheet-sub { margin-top: 6px; font-size: 13.5px; color: var(--text-faint); }

  .pr-story { margin-top: 18px; padding: 14px 14px 12px; border-radius: 18px; background: var(--paper); }
  .pr-story-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
  .pr-story-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text); }
  .pr-legend { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--text-faint); }
  .pr-key { display: inline-block; width: 16px; height: 0; border-top: 3px solid var(--text-soft); border-radius: 2px; margin-left: 6px; }
  .pr-key.dashed { border-top-style: dashed; border-top-width: 2.5px; }
  .pr-chart { display: block; width: 100%; height: auto; overflow: visible; color: var(--tanim); }
  .pr-chart.down { color: var(--error); }
  .pr-chart.flat { color: var(--text-soft); }
  .pr-today { stroke: var(--line-strong); stroke-width: 1.5; stroke-dasharray: 3 4; }
  /* The history draws itself in once as the sheet lands: explanatory motion,
     it traces the week in the order it happened. pathLength=1 makes the
     dash math independent of the line's real length. */
  .pr-line {
    fill: none; stroke: currentColor; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round;
    stroke-dasharray: 1; stroke-dashoffset: 1; animation: pr-draw 700ms var(--ease-out) 180ms forwards;
  }
  @keyframes pr-draw { to { stroke-dashoffset: 0; } }
  .pr-next, .pr-dot, .pr-area { opacity: 0; animation: pr-show 260ms ease 760ms forwards; }
  .pr-next { fill: none; stroke: currentColor; stroke-width: 2.5; stroke-dasharray: 5 6; stroke-linecap: round; }
  .pr-dot { fill: currentColor; stroke: var(--paper); stroke-width: 3; }
  @keyframes pr-show { to { opacity: 1; } }
  .pr-axis { position: relative; height: 18px; margin-top: 4px; font-size: 12.5px; color: var(--text-faint); text-transform: capitalize; }
  .pr-axis span { position: absolute; top: 0; white-space: nowrap; }
  .pr-axis .now { font-weight: 700; color: var(--text-muted); }
  .pr-facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; }
  .pr-facts div { display: flex; flex-direction: column; gap: 2px; padding: 10px; border-radius: 12px; background: var(--card); box-shadow: inset 0 0 0 1px var(--line); }
  .pr-facts span { font-size: 12px; color: var(--text-faint); }
  .pr-facts strong { font-family: var(--font-display); font-size: 15.5px; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums; }
  .pr-facts strong.up { color: var(--tanim); } .pr-facts strong.down { color: var(--error); }
  .pr-note { margin-top: 10px; font-size: 12.5px; color: var(--text-faint); }
  .pr-story-none { margin-top: 16px; padding: 14px; border-radius: 14px; background: var(--paper); font-size: 14.5px; color: var(--text-muted); }

  @media (prefers-reduced-motion: reduce) {
    .pr-breadth .seg { animation: none; }
    .pr-line { animation: none; stroke-dashoffset: 0; }
    .pr-next, .pr-dot, .pr-area { animation: pr-show 200ms ease forwards; }
    .pr-mover:active, .pr-sheet-x:active { transform: none; }
  }

  /* ── Card headings with a colour chip ────────────────────────────────────
     Profile is a settings page: the cards stay white and the colour rides on
     the chips, the way a phone's own Settings names its groups. Only the
     stats card takes a wash, because it's the one that's about the person
     rather than about a setting. */
  .card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 13px; }

  /* ── Achievements (farmer Profile) ──────────────────────────────────────── */
  /* A medal per achievement, two to a row. Earned: a raised medal in its own
     colour, the same material as the app's filled icon tiles. Not yet: the
     same medal in grey with a small lock, and the words say how to earn it. */
  .ach .card-head { margin-bottom: 14px; }
  .ach-count {
    margin-left: auto; flex-shrink: 0; padding: 4px 10px; border-radius: 99px;
    font-size: 12.5px; font-weight: 800; background: var(--gold-sk); color: var(--gold-text);
  }
  .ach-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .ach-badge {
    display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 10px 13px;
    border-radius: 18px; text-align: center; background: var(--paper);
    box-shadow: inset 0 0 0 1px var(--line);
  }
  /* Earned: a plate of brushed metal. Fine horizontal grain, broad bands of
     light and shade across it the way a polished surface catches a room, a
     bright top edge where the light lands and a darker lower one, and a thin
     steel rim. Locked badges stay flat paper, so the metal itself says
     "earned". */
  .ach-badge.on {
    background:
      repeating-linear-gradient(0deg, rgba(255,255,255,.07) 0 1px, rgba(0,0,0,.022) 1px 2px),
      linear-gradient(155deg, #F7F8F9 0%, #DDE0E4 30%, #F1F2F4 48%, #CFD3D8 72%, #E6E8EB 100%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.95),
      inset 0 -1px 0 rgba(60,66,74,.14),
      inset 0 0 0 1px rgba(120,127,136,.32),
      0 10px 20px -14px rgba(40,46,54,.5);
  }
  .ach-badge.on .ach-note { color: var(--text-muted); }
  .ach-medal {
    position: relative; width: 56px; height: 56px; border-radius: 50%; margin-bottom: 2px;
    display: flex; align-items: center; justify-content: center; color: #fff;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.3), inset 0 -2px 0 rgba(0,0,0,.18),
      0 0 0 3px #fff, 0 0 0 4px var(--line), 0 8px 16px -8px rgba(0,0,0,.4);
  }
  .ach-medal.blue   { background: linear-gradient(180deg, #5A9CD6 0%, #2F6FA8 55%, #235887 100%); }
  .ach-medal.green  { background: linear-gradient(180deg, #16895B 0%, var(--tanim) 55%, #07522F 100%); }
  .ach-medal.orange { background: linear-gradient(180deg, #F0A05A 0%, #D9722E 55%, #A2481A 100%); }
  .ach-medal.gold   { background: linear-gradient(180deg, #E3B04A 0%, #C08A22 55%, #8A5D0C 100%); }
  .ach-medal.violet { background: linear-gradient(180deg, #8E78DB 0%, #5C45A8 55%, #47348A 100%); }
  /* The top award gets the richest gold and a warm glow. */
  .ach-medal.trophy {
    background: radial-gradient(120% 90% at 30% 20%, #FFE08A 0%, #F2B32C 45%, #B07A16 100%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.45), inset 0 -2px 0 rgba(0,0,0,.18),
      0 0 0 3px #fff, 0 0 0 4px #E7C26A, 0 8px 18px -8px rgba(176,122,22,.7);
  }
  /* Not yet earned: the same medal, drained. */
  .ach-badge.off .ach-medal {
    background: var(--paper-alt); color: var(--text-faint);
    box-shadow: inset 0 0 0 1px var(--line), 0 0 0 3px var(--paper), 0 0 0 4px var(--line);
  }
  .ach-lock {
    position: absolute; right: -4px; bottom: -4px; width: 22px; height: 22px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: #fff; color: var(--text-muted); box-shadow: 0 0 0 1px var(--line), 0 2px 6px -2px rgba(0,0,0,.25);
  }
  /* ── Achievement unlocked ──────────────────────────────────────────────
     The welcome ID's dimmed stage: the kicker, Juan rising from behind the
     plate with his thumbs up, the badge landing on brushed metal, then the
     buttons. Rare by nature, so it earns its ceremony. */
  .shm-scrim:has(> .au-panel) { background: rgba(8,12,10,.84); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
  .au-panel { width: 100%; max-width: 330px; background: transparent; }
  .au { display: flex; flex-direction: column; align-items: center; text-align: center; color: #fff; }
  .au-kicker {
    font-size: 13px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: var(--palay);
    animation: wid-rise 360ms var(--ease-out) both;
  }
  .au-stage { position: relative; width: 268px; margin-top: 6px; padding-top: 118px; }
  /* Juan stands behind the plate, cut off at the waist by its top edge. */
  .au-mascot {
    position: absolute; top: 0; left: 50%; z-index: 0; width: 150px; margin-left: -75px; aspect-ratio: 420 / 443;
    animation: au-rise 520ms var(--ease-out) 380ms both;
  }
  .au-mascot img { position: absolute; inset: 0; width: 100%; height: 100%; }
  .au-m-eyes { opacity: 0; animation: tm-blink 3.8s step-end 1.1s infinite; }
  @keyframes au-rise { from { opacity: 0; transform: translateY(46px); } }
  .au-plate {
    position: relative; z-index: 1; overflow: hidden;
    display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 22px 18px 20px; border-radius: 22px;
    background:
      repeating-linear-gradient(0deg, rgba(255,255,255,.07) 0 1px, rgba(0,0,0,.022) 1px 2px),
      linear-gradient(155deg, #F7F8F9 0%, #DDE0E4 30%, #F1F2F4 48%, #CFD3D8 72%, #E6E8EB 100%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.95), inset 0 -1px 0 rgba(60,66,74,.14),
      inset 0 0 0 1px rgba(120,127,136,.32), 0 30px 54px -22px rgba(0,0,0,.8);
    /* Lands from a little above with one soft overshoot, like the ID card. */
    animation: au-land 640ms cubic-bezier(.22,1,.36,1) 120ms both;
  }
  @keyframes au-land {
    0% { opacity: 0; transform: translateY(-26px) scale(.96); }
    60% { opacity: 1; transform: translateY(3px) scale(1.005); }
    100% { transform: none; }
  }
  /* The medal stamps onto the plate once it has landed. */
  .au-medal { width: 84px; height: 84px; margin-bottom: 6px; animation: au-stamp 460ms cubic-bezier(.22,1,.36,1) 560ms both; }
  @keyframes au-stamp {
    0% { opacity: 0; transform: scale(1.35) rotate(-10deg); }
    65% { opacity: 1; transform: scale(.96) rotate(1deg); }
    100% { transform: none; }
  }
  .au-name {
    margin: 0; font-family: var(--font-display); font-size: 21px; font-weight: 700; line-height: 1.2;
    letter-spacing: -.01em; color: var(--text); text-wrap: balance;
  }
  .au-note { margin: 0; font-size: 14.5px; line-height: 1.4; color: var(--text-muted); text-wrap: balance; }
  /* One pass of light across the metal once it has settled. */
  .au-shine {
    position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(105deg, transparent 38%, rgba(255,255,255,.75) 50%, transparent 62%);
    transform: translateX(-130%);
    animation: wid-shine 1000ms ease-in-out 1050ms 1 forwards;
  }
  .au-actions { width: 268px; margin-top: 20px; display: flex; flex-direction: column; gap: 10px; animation: wid-rise 360ms var(--ease-out) 820ms both; }
  @media (prefers-reduced-motion: reduce) {
    .au-kicker, .au-mascot, .au-plate, .au-medal, .au-actions { animation: au-fade 220ms ease both; }
    @keyframes au-fade { from { opacity: 0; } }
    .au-shine { display: none; }
    .au-m-eyes { animation: none; }
  }

  .ach-name { font-family: var(--font-display); font-size: 14.5px; font-weight: 700; line-height: 1.25; color: var(--text); text-wrap: balance; }
  .ach-badge.off .ach-name { color: var(--text-muted); }
  .ach-note { font-size: 12.5px; line-height: 1.35; color: var(--text-faint); text-wrap: balance; }
  .card-ico {
    width: 38px; height: 38px; flex: 0 0 38px; border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
  }
  /* Filled tiles, white icon: the accent at full strength in one small,
     solid shape, so the card's colour reads at a glance and the icon reads
     as a symbol on it rather than as a line drawing floating in a tint. */
  .card-ico.tint-green { background: linear-gradient(180deg, #16895B 0%, var(--tanim) 55%, #07522F 100%); color: #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.18), 0 6px 12px -8px rgba(11,107,65,.6); }
  .card-ico.tint-gold { background: linear-gradient(180deg, #D39B2E 0%, #B07A16 55%, #8A5D0C 100%); color: #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.18), 0 6px 12px -8px rgba(138,93,12,.55); }
  .card-ico.tint-blue { background: linear-gradient(180deg, #4A8FCC 0%, #2F6FA8 55%, #235887 100%); color: #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.18), 0 6px 12px -8px rgba(47,111,168,.55); }
  .card-ico.tint-violet { background: linear-gradient(180deg, #7B64CF 0%, #5C45A8 55%, #47348A 100%); color: #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.18), 0 6px 12px -8px rgba(92,69,168,.55); }
  .card-ico.tint-slate { background: linear-gradient(180deg, #737980 0%, #575C62 55%, #45494E 100%); color: #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.18), 0 6px 12px -8px rgba(40,44,48,.45); }
  .card.tint-gold {
    background-image: linear-gradient(180deg, #FCF3DF 0%, #FFFFFF 58%);
    box-shadow: inset 0 0 0 1px rgba(138,93,12,.18);
  }
  .card.tint-gold .mini-stat-val { color: var(--gold-text); }

  /* ── Marketplace ─────────────────────────────────────────────────────────── */
  .mp-sell-btn {
    width: 100%; min-height: 54px; border: none; border-radius: 16px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: var(--tanim); color: #fff; font-family: var(--font-display); font-size: 16px; font-weight: 700;
    box-shadow: 0 10px 20px -12px rgba(11,107,65,.8);
    transition: transform 180ms var(--ease-out);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .mp-sell-btn:active { transform: scale(.97); transition-duration: 90ms; }

  /* The crop tiles. Three columns, "All crops" two wide, so eleven choices
     close in four even rows. Each is a white tile held off the page by a
     hairline and a soft shadow rather than a drawn border, with the crop in
     a soft circle of its own colour (wheat for rice, red for tomatoes), so
     they read like a set of app icons and tell apart at a glance. Names at
     16px, the app's floor. */
  .mp-filters { display: flex; flex-direction: column; gap: 12px; }
  .mp-cats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .mp-cat {
    position: relative; min-width: 0; min-height: 80px; padding: 10px 3px 9px; border-radius: 20px; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
    border: none; background: var(--card); color: var(--text);
    box-shadow: 0 0 0 1px rgba(22,33,27,.06), 0 1px 2px rgba(22,33,27,.06), 0 8px 18px -14px rgba(22,33,27,.35);
    font-family: var(--font-display); font-size: var(--fs-label); font-weight: 600; line-height: 1.15;
    letter-spacing: -.01em; text-align: center;
    transition: transform 160ms var(--ease-out), background-color 180ms ease, color 180ms ease, box-shadow 200ms var(--ease-out);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .mp-cat-ico {
    width: 40px; height: 40px; flex-shrink: 0; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; color: var(--tanim);
    background: radial-gradient(circle at 35% 28%, #FFFFFF 0%, var(--tint, #EEF0F1) 72%);
    box-shadow: inset 0 0 0 1px rgba(22,33,27,.05);
    transition: opacity 180ms ease, filter 180ms ease;
  }
  .mp-cat[data-crop="all"]        { --tint: #D6ECDD; }
  .mp-cat[data-crop="rice"]       { --tint: #F4E4B8; }
  .mp-cat[data-crop="onions"]     { --tint: #F2DAE6; }
  .mp-cat[data-crop="calamansi"]  { --tint: #E3F0C2; }
  .mp-cat[data-crop="corn"]       { --tint: #F9EAAE; }
  .mp-cat[data-crop="mango"]      { --tint: #FBD9B6; }
  .mp-cat[data-crop="garlic"]     { --tint: #E9E2F4; }
  .mp-cat[data-crop="tomatoes"]   { --tint: #F9D2CD; }
  .mp-cat[data-crop="squash"]     { --tint: #FAD8BD; }
  .mp-cat[data-crop="ampalaya"]   { --tint: #D4EBCD; }
  .mp-cat[data-crop="watermelon"] { --tint: #F9D5DB; }
  .mp-cat-lbl { max-width: 100%; overflow-wrap: break-word; }
  /* Nothing for sale in it right now: the tile goes quiet (still tappable;
     the list then says so). */
  .mp-cat.none:not(.on) { color: var(--text-faint); }
  .mp-cat.none:not(.on) .mp-cat-ico { opacity: .5; filter: saturate(.35); }
  .mp-cat:active { transform: scale(.97); transition-duration: 90ms; }
  /* Chosen: a green ring closes round the tile and it takes a green wash,
     the same as a chosen crop in sign-up, and its circle pops once, slightly
     past full size, as the answer to the tap. */
  .mp-cat.on {
    background: #F2F9F5; color: var(--tanim);
    box-shadow: 0 0 0 2px var(--tanim), 0 1px 2px rgba(11,107,65,.12), 0 10px 20px -14px rgba(11,107,65,.5);
  }
  .mp-cat.on .mp-cat-ico {
    box-shadow: inset 0 0 0 1px rgba(11,107,65,.12), 0 0 0 3px #fff;
    animation: mp-cat-pop 280ms var(--ease-out);
  }
  @keyframes mp-cat-pop { 0% { transform: scale(.88); } 60% { transform: scale(1.06); } 100% { transform: scale(1); } }
  /* "All crops", two columns wide: its circle beside the words. */
  .mp-cat.all {
    grid-column: span 2; flex-direction: row; justify-content: flex-start; gap: 12px;
    padding: 12px 14px; text-align: left;
  }
  .mp-cat.all .mp-cat-ico { width: 44px; height: 44px; }
  .mp-cat.all .mp-cat-lbl { font-size: var(--fs-body); }

  /* Varieties arrive under the crops in two even columns: long names like
     "Shallots (Sibuyas Tagalog)" get room to wrap instead of being cut.
     White pills in the tiles' family; the chosen one takes the same ring. */
  .mp-vars { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; animation: mp-vars-in 220ms var(--ease-out); }
  @keyframes mp-vars-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
  .mp-var {
    min-width: 0; min-height: 48px; padding: 8px 12px; border-radius: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.2;
    border: none; background: var(--card); color: var(--text-soft);
    box-shadow: 0 0 0 1px rgba(22,33,27,.08), 0 1px 2px rgba(22,33,27,.05);
    font-family: var(--font-display); font-size: var(--fs-label); font-weight: 600; overflow-wrap: break-word;
    transition: transform 160ms var(--ease-out), background-color 180ms ease, color 180ms ease, box-shadow 200ms var(--ease-out);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .mp-var:active { transform: scale(.96); transition-duration: 90ms; }
  .mp-var.on { background: #F2F9F5; color: var(--tanim); box-shadow: 0 0 0 2px var(--tanim), 0 1px 2px rgba(11,107,65,.1); }

  /* Facts on the left, sort on the right, on one line: the count and the
     going rate are read together, and wrapping split them apart. */
  .mp-list-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  /* ── Family switch ──────────────────────────────────────────────────────
     Four segments in one track, with a pill that slides to the one you
     picked. The whole control is always visible, so the choices are a fact
     about the page rather than something hidden behind a menu — and the
     current one is readable without opening anything.
     One pill that travels, not a highlight that blinks between labels: the
     eye follows the move and keeps its place. A transition rather than an
     animation, so a second tap mid-slide retargets from where it is. */
  /* Its own line, full width. Sharing the row with the sort menu squeezed
     "Vegetables" into "Veg…", and a label a reader has to decode is not a
     label. */
  /* The switch takes the first line; the sort button keeps the right-hand
     end of the second, where it has always been. */
  .mp-list-head:has(.fseg) { flex-wrap: wrap; row-gap: 10px; justify-content: flex-end; }
  .mp-list-head .fseg { flex: 0 0 100%; order: -1; }
  /* The same object as the Expenses switch: a well pressed into the page,
     and the app's raised green sliding inside it, so every "pick one of
     these" in the app is one thing. */
  .fseg {
    position: relative; flex: 1; min-width: 0; display: grid; grid-auto-flow: column; grid-auto-columns: 1fr;
    padding: 5px; border-radius: 17px; isolation: isolate;
    background: linear-gradient(180deg, #E3E7E4 0%, #ECEFEC 100%);
    box-shadow:
      inset 0 1px 2px rgba(22,33,27,.12),
      inset 0 0 0 1px rgba(22,33,27,.05),
      0 1px 0 rgba(255,255,255,.9);
  }
  .fseg-pill {
    position: absolute; z-index: -1; top: 5px; bottom: 5px; left: 5px; width: calc((100% - 10px) / 4);
    border-radius: 13px;
    background-image: linear-gradient(180deg, #14875A 0%, var(--tanim) 54%, #075232 100%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.26),
      inset 0 -1px 0 rgba(0,0,0,.24),
      inset 0 0 0 1px rgba(4,40,24,.22),
      0 1px 2px rgba(6,38,23,.3),
      0 6px 12px -6px rgba(6,38,23,.5);
    /* Movement across the control, not an arrival: eases in and out. */
    transition: transform 280ms var(--ease-io);
    will-change: transform;
  }
  .fseg-tab {
    /* 44px, the smallest target a thumb hits reliably; the segments touch
       each other, so the height is all the room a miss can use. */
    min-height: 46px; padding: 0 3px; border: none; background: none; cursor: pointer; border-radius: 13px;
    font-family: var(--font-display); font-size: 13.5px; font-weight: 700; letter-spacing: -.01em; color: var(--text-muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: color 160ms ease, transform 190ms var(--ease-out);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .fseg-tab.on { color: #fff; text-shadow: 0 1px 1px rgba(0,0,0,.18); }
  /* Four words in a 360-wide phone: a step smaller, so "Vegetables" and
     "Palay/Mais" stay whole rather than trailing off into dots. */
  @media (max-width: 380px) { .fseg-tab { font-size: 12.5px; letter-spacing: -.015em; } }
  /* Press feedback on the label itself: the pill is already travelling, and
     two things moving at once reads as a wobble. */
  .fseg-tab:active { transform: scale(.94); transition-duration: var(--dur-press); }

  @media (prefers-reduced-motion: reduce) {
    /* The pill still marks the choice, it just stops travelling to it. */
    .fseg-pill { transition: none; }
    .fseg-tab:active { transform: none; }
  }

  /* The seller's rating: gold, and boxed, so it reads as a score rather than
     as another grey line of text. */
  .mp-rate {
    display: inline-flex; align-items: center; gap: 3px; flex-shrink: 0;
    padding: 1px 7px; border-radius: 99px; background: var(--gold-sk); color: var(--gold-text);
    font-size: 12.5px; font-weight: 700; font-variant-numeric: tabular-nums;
  }
  .mp-avail.green { background: var(--tanim-sk); color: var(--tanim); box-shadow: inset 0 0 0 1px rgba(11,107,65,.14); }

  /* Goods in a two-column grid, photo first: six listings on a screen
     where there used to be one and a half. */
  .mp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .mp-card {
    position: relative; min-width: 0; border-radius: 18px; overflow: hidden; background: var(--card);
    box-shadow: inset 0 0 0 1px var(--line), 0 6px 16px -12px rgba(22,33,27,.3);
  }
  .mp-card-main {
    display: flex; flex-direction: column; width: 100%; height: 100%; padding: 0; border: none; cursor: pointer;
    background: none; font: inherit; color: inherit; text-align: left;
    transition: transform 180ms var(--ease-out);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .mp-card:has(.mp-card-main:active) { transform: scale(.98); transition: transform 90ms var(--ease-out); }
  .mp-card { transition: transform 180ms var(--ease-out); }
  .mp-card-photo {
    position: relative; display: flex; align-items: center; justify-content: center;
    aspect-ratio: 4 / 3; background: var(--tanim-sk); overflow: hidden;
  }
  .mp-card-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .mp-mine {
    position: absolute; left: 8px; bottom: 8px; padding: 3px 8px; border-radius: 99px;
    background: rgba(10,14,12,.62); color: #fff; font-size: 11.5px; font-weight: 700;
    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  }
  .mp-card-body { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px 12px; min-width: 0; }
  .mp-card-name {
    font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text); line-height: 1.2;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .mp-card-price { margin-top: 2px; font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums; }
  .mp-card-price small { font-size: .68em; font-weight: 600; color: var(--text-faint); margin-left: 1px; }
  .mp-card-meta, .mp-card-seller {
    font-size: 13px; color: var(--text-faint); line-height: 1.35;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .mp-card-seller { display: flex; align-items: center; gap: 3px; color: var(--text-muted); }
  .mp-card-seller svg, .mp-star { color: var(--gold-text); flex-shrink: 0; }
  .mp-dot { color: var(--line-strong); margin: 0 2px; }
  .mp-ellipsis { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* Quick add, floating on the photo's corner: a white disc that turns
     green with a tick once the listing is in the cart. */
  .mp-quick {
    position: absolute; top: 8px; right: 8px; width: 40px; height: 40px; border: none; border-radius: 50%; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,.94); color: var(--tanim);
    box-shadow: 0 4px 12px -4px rgba(0,0,0,.35);
    transition: transform 160ms var(--ease-out), background-color 200ms ease, color 200ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .mp-quick:active { transform: scale(.88); transition-duration: 80ms; }
  .mp-quick.on { background: var(--tanim); color: #fff; }
  .mp-quick-ico { display: flex; animation: qty-ico-in 200ms var(--ease-out); }

  .mp-mine { display: inline-flex; align-items: center; gap: 4px; }

  /* Listing photo step: one big target to add; a preview with Change and
     Remove once there's a photo. */
  .mp-photo-drop {
    width: 100%; min-height: 150px; border-radius: 14px; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
    border: 2px dashed var(--line-strong); background: var(--paper); color: var(--tanim);
    font-family: var(--font-display); font-size: 16px; font-weight: 700;
    transition: transform 160ms var(--ease-out), background-color 160ms ease, border-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .mp-photo-drop:active { transform: scale(.98); background: var(--tanim-sk); border-color: var(--tanim); transition-duration: 90ms; }
  .mp-photo-drop:disabled { color: var(--text-muted); cursor: default; }
  .mp-photo-ico { width: 56px; height: 56px; border-radius: 50%; background: var(--tanim-sk); display: flex; align-items: center; justify-content: center; }
  .mp-spin { border-color: rgba(11,107,65,.25); border-top-color: var(--tanim); }
  .mp-photo-preview {
    width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 14px; display: block;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,.06); animation: wid-photo-in 320ms var(--ease-out);
  }
  .mp-photo-row { display: flex; gap: 10px; margin-top: 10px; }
  .mp-photo-row .btn-details { min-height: 46px; }
  .mp-photo-err { display: flex; align-items: center; gap: 6px; margin-top: 10px; font-size: 14.5px; font-weight: 600; color: var(--error); }
  .mp-photo-tag {
    position: absolute; left: 18px; top: 14px; display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 99px; background: rgba(10,14,12,.55); color: #fff; font-size: 12.5px; font-weight: 700;
    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  }
  @media (prefers-reduced-motion: reduce) { .mp-photo-drop:active { transform: none; } .mp-photo-preview { animation: none; } }

  /* ── Listing sheet (shares the crop sheet's hero, price and close) ── */
  /* A taller hero than the Prices sheet: here the photo is the seller's own
     picture of the harvest, which is what a buyer is really looking at. */
  .mp-sheet .pr-sheet-hero { height: 240px; }
  .mp-sheet .pr-sheet-shade { background: linear-gradient(180deg, rgba(10,14,12,.45) 0%, rgba(10,14,12,.06) 42%, rgba(10,14,12,.72) 100%); }
  .mp-sheet .pr-sheet-name { font-size: 25px; }
  .pr-sheet-sub { display: flex; align-items: center; gap: 5px; }
  .mp-avail {
    display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px;
    background: var(--paper); color: var(--text-muted); font-size: 14px; font-weight: 600;
  }
  .mp-desc { margin-top: 14px; font-size: 15.5px; line-height: 1.5; color: var(--text-soft); }
  .mp-seller {
    width: 100%; margin-top: 14px; display: flex; align-items: center; gap: 12px; padding: 12px;
    border: none; border-radius: 16px; cursor: pointer; background: var(--paper); font: inherit; color: inherit; text-align: left;
    transition: background-color 160ms ease, transform 160ms var(--ease-out);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .mp-seller:active { background: var(--paper-alt); transform: scale(.99); transition-duration: 90ms; }
  .mp-seller-who { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .mp-seller-name { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text); }
  .mp-seller-meta { display: flex; align-items: center; gap: 4px; font-size: 14px; color: var(--text-muted); min-width: 0; }
  .mp-qty { display: flex; align-items: center; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
  .mp-qty-lbl { flex-basis: 100%; font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text); }
  .mp-qty-total { margin-left: auto; font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums; }
  .mp-actions { margin-top: 16px; }
  .mp-danger { color: var(--error); box-shadow: inset 0 0 0 1.5px var(--error-line); }
  .mp-danger:active { background: var(--error-sk); }
  .btn-details { gap: 8px; }

  @media (prefers-reduced-motion: reduce) {
    .mp-vars, .mp-quick-ico, .mp-cat.on .mp-cat-ico { animation: none; }
    .mp-card:has(.mp-card-main:active), .mp-quick:active, .mp-cat:active, .mp-var:active, .mp-sell-btn:active, .mp-seller:active { transform: none; }
  }

  /* ── Home ────────────────────────────────────────────────────────────────── */
  .hm-hero-foot { margin-top: auto; padding-top: 18px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
  /* The weather, as a glass chip that opens the Weather page. */
  .hm-wx {
    display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 10px 0 12px;
    border: none; border-radius: 99px; cursor: pointer; color: #fff; font: inherit;
    background: rgba(255,255,255,.16); box-shadow: inset 0 0 0 1px rgba(255,255,255,.28);
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    transition: transform 160ms var(--ease-out), background-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .hm-wx:active { transform: scale(.96); background: rgba(255,255,255,.26); transition-duration: 90ms; }
  .hm-wx-temp { font-family: var(--font-display); font-size: 18px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .hm-wx-cond { font-size: 14.5px; opacity: .92; }
  .hm-offline { display: inline-flex; align-items: center; gap: 7px; padding: 5px 11px; border-radius: 99px; background: rgba(0,0,0,.35); font-size: 13px; font-weight: 600; }
  .hm-offline-dot { width: 8px; height: 8px; border-radius: 50%; background: #F08A7E; animation: pulse 1.6s ease-in-out infinite; }

  /* Cards on Home share one frame, so the page reads as a set. */
  /* One accent per card, as a wash that fades out by the second line: a
     tinted top edge says what the card is about without turning the page
     into a colour chart, and the text still sits on near-white. */
  .hm-card {
    position: relative; display: block; width: 100%; padding: 16px; border: none; border-radius: var(--radius);
    text-align: left; background: var(--card); box-shadow: inset 0 0 0 1px var(--line);
    font: inherit; color: inherit;
  }
  .hm-card.tint-green {
    background-image: linear-gradient(180deg, #E8F3EC 0%, #FFFFFF 62%);
    box-shadow: inset 0 0 0 1px rgba(11,107,65,.16);
  }
  .hm-card.tint-gold {
    background-image: linear-gradient(180deg, #FCF3DF 0%, #FFFFFF 62%);
    box-shadow: inset 0 0 0 1px rgba(138,93,12,.18);
  }
  .hm-card.tint-blue {
    background-image: linear-gradient(180deg, #E9F1FA 0%, #FFFFFF 62%);
    box-shadow: inset 0 0 0 1px rgba(47,111,168,.16);
  }
  /* The chip that carries the accent at full strength: small, so the colour
     reads as a label rather than as decoration. */
  .hm-ico {
    width: 40px; height: 40px; flex: 0 0 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
  }
  .tint-green .hm-ico { background: linear-gradient(180deg, #16895B 0%, var(--tanim) 55%, #07522F 100%); color: #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.18), 0 6px 12px -8px rgba(11,107,65,.6); }
  .tint-gold .hm-ico { background: linear-gradient(180deg, #D39B2E 0%, #B07A16 55%, #8A5D0C 100%); color: #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.18), 0 6px 12px -8px rgba(138,93,12,.55); }
  .tint-blue .hm-ico { background: linear-gradient(180deg, #4A8FCC 0%, #2F6FA8 55%, #235887 100%); color: #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.18), 0 6px 12px -8px rgba(47,111,168,.55); }
  .tint-violet .hm-ico, .tint-violet .hm-tool-ico { background: linear-gradient(180deg, #7B64CF 0%, #5C45A8 55%, #47348A 100%); color: #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.18), 0 6px 12px -8px rgba(92,69,168,.55); }
  .hm-card-head { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 6px; }
  .hm-card-head > div { flex: 1; min-width: 0; }
  .hm-title { margin: 0; font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text); letter-spacing: -.01em; display: block; }
  .hm-out { margin-bottom: 10px; }
  .hm-sub { margin-top: 2px; font-size: 14px; color: var(--text-faint); }
  .hm-link {
    flex-shrink: 0; display: inline-flex; align-items: center; gap: 2px; min-height: 36px; padding: 0 4px 0 10px;
    border: none; border-radius: 99px; background: var(--paper); color: var(--tanim); cursor: pointer;
    font-family: var(--font-display); font-size: 14px; font-weight: 700;
    transition: transform 160ms var(--ease-out), background-color 160ms ease;
  }
  .hm-link:active { transform: scale(.96); background: var(--tanim-sk); transition-duration: 90ms; }

  /* Your crops: rows like the Prices list, so the two pages agree. */
  .hm-crop {
    position: relative; width: calc(100% + 16px); margin: 0 -8px; display: flex; align-items: center; gap: 12px;
    padding: 10px 8px; border: none; border-radius: 14px; background: none; font: inherit; color: inherit; text-align: left; cursor: pointer;
    transition: background-color 180ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .hm-crop:active { background: var(--paper); transition-duration: 0ms; }
  .hm-crop + .hm-crop::before { content: ""; position: absolute; top: 0; left: 70px; right: 8px; height: 1px; background: var(--line); }
  .hm-crop:active::before, .hm-crop:active + .hm-crop::before { opacity: 0; }
  .hm-crop-photo {
    width: 50px; height: 50px; flex: 0 0 50px; border-radius: 13px; overflow: hidden;
    background: var(--tanim-sk); display: flex; align-items: center; justify-content: center;
  }
  .hm-crop-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .hm-crop-body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .hm-crop-name { font-family: var(--font-display); font-size: 16.5px; font-weight: 700; color: var(--text); line-height: 1.25; }
  .hm-crop-var { font-size: 14px; color: var(--text-faint); }
  .hm-crop-end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
  .hm-crop-price { font-family: var(--font-display); font-size: 17px; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums; white-space: nowrap; }
  .hm-crop-price small { font-size: .7em; font-weight: 600; color: var(--text-faint); margin-left: 1px; }

  .hm-empty { padding: 10px 2px 4px; font-size: 14.5px; line-height: 1.45; color: var(--text-faint); }
  /* "Buy again" as a quiet chip at the end of the row: the row is the
     button, so this only names what tapping it does. */
  .hm-again {
    flex-shrink: 0; display: inline-flex; align-items: center; gap: 2px; padding: 5px 8px 5px 11px;
    border-radius: 99px; background: #DCEAF8; color: #2F6FA8;
    font-family: var(--font-display); font-size: 13.5px; font-weight: 700;
  }
  /* One line, cut with an ellipsis: a seller's full name wrapping turned a
     three-line row into four. */
  .hm-crop-var { display: flex; align-items: center; gap: 4px; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hm-crop-var svg { flex-shrink: 0; }
  .hm-crop-end { flex-shrink: 0; }

  /* ── Buyer Home ────────────────────────────────────────────────────────
     Section titles sit on the page, not inside another boxed card with an
     icon badge: boxes are kept for things you act on, so the page reads as
     sections of a store rather than a stack of identical tiles. */
  .hm-sec { display: flex; flex-direction: column; }
  .hm-sec-title {
    margin: 8px 2px 0; font-family: var(--font-display); font-size: 20px; font-weight: 700;
    letter-spacing: -.015em; line-height: 1.2; color: var(--text);
  }
  .hm-sec-sub { margin: 3px 2px 0; font-size: 14.5px; color: var(--text-faint); }

  /* The search bar opens the page, directly under the brand. A pill with
     the magnifier at one end and a green key at the other: the same shape
     people press in every other app they own.

     One rule, three pages. Prices and the Marketplace use this same bar with
     a real input where Home has its label, so search never changes shape as
     you move around the app. */
  .hm-search, .search-box {
    position: relative; min-height: 56px; padding: 6px 6px 6px 16px;
    display: flex; align-items: center; gap: 10px; border: none; border-radius: 16px; cursor: pointer;
    /* No outline: a pale green field, the colour of the leaves in the mark,
       so it reads as a soft surface rather than a boxed-in input. */
    background: #EDF5EE; color: var(--text-muted); text-align: left;
    font-family: var(--font-body); font-size: 16px; font-weight: 500;
    box-shadow: 0 6px 16px -14px rgba(22,33,27,.35);
    transition: transform 190ms var(--ease-out), background-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .hm-search > svg, .search-box > svg { color: var(--tanim); flex-shrink: 0; }
  .hm-search > span:first-of-type { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* The two bars that hold a real input: a caret rather than a finger, and
     the same deepened green while you type that Home shows while you press. */
  .search-box { cursor: text; }
  .search-box input {
    flex: 1; min-width: 0; border: none; outline: none; background: transparent;
    font: inherit; color: var(--text);
  }
  .search-box input::placeholder { color: var(--text-muted); font-weight: 500; }
  .search-box:focus-within { background: #E3EFE5; }
  /* The clear button sits inside the bar now, so it drops the negative
     margins that hung it off the old bordered field's edge. */
  .search-box .pr-clear { margin: 0; }

  .hm-search-go, .search-go {
    flex-shrink: 0; width: 44px; height: 44px; border-radius: 12px; border: none; padding: 0; cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center; color: #fff;
    background-image: linear-gradient(180deg, #14875A 0%, var(--tanim) 54%, #075232 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.26), inset 0 -1px 0 rgba(0,0,0,.24), 0 1px 2px rgba(6,38,23,.3);
    transition: transform 190ms var(--ease-out);
  }
  .hm-search:active { transform: scale(.985); background: #E3EFE5; transition-duration: var(--dur-press); }
  .hm-search:active .hm-search-go, .search-go:active { transform: scale(.94); transition-duration: var(--dur-press); }
  @media (prefers-reduced-motion: reduce) {
    .hm-search:active, .hm-search:active .hm-search-go, .search-go:active { transform: none; }
  }

  /* ── Featured products ──────────────────────────────────────────────────
     Two to a row, photo on top: a product card, not a list row, so the page
     has something to look at between its lists. */
  /* One line, pushed along by the thumb. The row bleeds to both screen
     edges; the card past the edge shows about a third of itself, which is
     what says "there is more this way" without an arrow or a hint. Narrow
     enough that the cut always lands mid-card, never mid-word.
     The app keeps sideways scrolling out of the marketplace, where an older
     buyer hunts for a particular crop; here it is a showcase they can
     ignore, and every card is also reachable from See all. */
  .fp-row {
    display: flex; gap: 12px; margin: 14px -16px 0; padding: 4px 16px 8px;
    overflow-x: auto; overscroll-behavior-x: contain;
    scroll-snap-type: x proximity; scroll-padding-left: 16px; -webkit-overflow-scrolling: touch;
  }
  .fp-row::-webkit-scrollbar { height: 0; }
  .fp-card {
    flex: 0 0 152px; scroll-snap-align: start;
    display: flex; flex-direction: column; min-width: 0; padding: 0; overflow: hidden;
    border: none; border-radius: 16px; background: var(--card); text-align: left; font: inherit; color: inherit; cursor: pointer;
    box-shadow: inset 0 0 0 1px var(--line), 0 8px 18px -14px rgba(22,33,27,.35);
    transition: transform 190ms var(--ease-out);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .fp-card:active { transform: scale(.97); transition-duration: var(--dur-press); }
  .fp-photo {
    height: 114px; display: flex; align-items: center; justify-content: center;
    background: var(--tanim-sk); color: var(--tanim);
  }
  .fp-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .fp-body { display: flex; flex-direction: column; padding: 10px 12px 12px; min-width: 0; }
  /* Two lines held open whether the name needs them or not, so every price
     in the row sits on the same line and the cards read as a set. */
  .fp-name {
    min-height: 2.5em; font-size: 14.5px; font-weight: 600; line-height: 1.25; color: var(--text-muted);
    display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;
  }
  .fp-price {
    margin-top: 2px; font-family: var(--font-display); font-size: 19px; font-weight: 800; letter-spacing: -.015em;
    color: var(--text); font-variant-numeric: tabular-nums;
  }
  .fp-price small { margin-left: 1px; font-size: 13px; font-weight: 600; color: var(--text-faint); letter-spacing: 0; }
  /* The town is context, so it is the quietest line: no pill, no colour. */
  .fp-loc {
    display: flex; align-items: center; gap: 4px; margin-top: 5px;
    font-size: 13px; font-weight: 600; color: var(--text-faint);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .fp-loc svg { flex-shrink: 0; color: var(--tanim); }

  @media (prefers-reduced-motion: reduce) {
    .fp-card:active { transform: none; }
  }

  /* Shop by crop: 4 × 2, pictures first. */

  /* ── Shop by crop: three family cards ─────────────────────────────────
     Tall photographs, the name set on a shade at the foot, the count in a
     pill of the family's own colour, and a small glass arrow in the corner
     that says "this opens something". The whole card presses as one. */
  .fam-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
  .fam-card {
    position: relative; overflow: hidden; aspect-ratio: 3 / 4; padding: 0; border: none; cursor: pointer;
    border-radius: 20px; background: #1E2A22; color: #fff; text-align: left; font: inherit;
    box-shadow: 0 16px 26px -18px rgba(12,20,15,.75), 0 2px 5px -2px rgba(12,20,15,.25);
    transition: transform 190ms var(--ease-out), box-shadow 190ms var(--ease-out);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .fam-card img {
    position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block;
    transition: transform 500ms var(--ease-out);
  }
  /* Shade toward the foot for the words, and a hairline ring so the photo
     edge reads as a finished edge on the pale page. */
  .fam-card::after {
    content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
    background: linear-gradient(180deg, rgba(8,14,10,0) 38%, rgba(8,14,10,.28) 60%, rgba(8,14,10,.82) 100%);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,.14);
  }
  .fam-go {
    position: absolute; top: 9px; right: 9px; z-index: 1; width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; color: #fff;
    background: rgba(12,20,15,.38); box-shadow: inset 0 0 0 1px rgba(255,255,255,.35);
    transition: transform 190ms var(--ease-out);
  }
  .fam-foot {
    position: absolute; left: 0; right: 0; bottom: 0; z-index: 1; padding: 0 10px 11px;
    display: flex; flex-direction: column; align-items: flex-start; gap: 5px;
  }
  .fam-name {
    font-family: var(--font-display); font-size: 16px; font-weight: 700; letter-spacing: -.01em; line-height: 1.1;
    text-shadow: 0 1px 3px rgba(0,0,0,.45);
  }
  .fam-count {
    padding: 3px 8px; border-radius: 99px; font-size: 11.5px; font-weight: 800; letter-spacing: .01em;
    color: #fff; font-variant-numeric: tabular-nums; box-shadow: inset 0 1px 0 rgba(255,255,255,.25);
  }
  .fam-card.gold  .fam-count { background: #B07A16; }
  .fam-card.coral .fam-count { background: #D0532F; }
  .fam-card.green .fam-count { background: var(--tanim); }
  /* Pressed: the card sinks, its shadow draws in, the arrow steps forward. */
  .fam-card:active {
    transform: scale(.97); transition-duration: var(--dur-press);
    box-shadow: 0 8px 14px -12px rgba(12,20,15,.7), 0 1px 3px -1px rgba(12,20,15,.25);
  }
  .fam-card:active .fam-go { transform: translateX(2px); transition-duration: var(--dur-press); }
  @media (hover: hover) and (pointer: fine) {
    .fam-card:hover img { transform: scale(1.04); }
  }
  @media (prefers-reduced-motion: reduce) {
    .fam-card:active, .fam-card:active .fam-go, .fam-card:hover img { transform: none; }
  }
  /* Narrow phones: the longest name, "Vegetables", keeps to one line. */
  @media (max-width: 370px) { .fam-name { font-size: 14.5px; } .fam-foot { padding: 0 8px 10px; } }

  /* Featured farmers: one spotlight, three rows, one card. */
  .ff {
    margin-top: 14px; border-radius: var(--radius); overflow: hidden; background: var(--card);
    box-shadow: inset 0 0 0 1px var(--line), 0 14px 30px -20px rgba(22,33,27,.4);
  }
  .ff-spot, .ff-row {
    display: flex; width: 100%; padding: 0; border: none; background: none; cursor: pointer;
    text-align: left; font: inherit; color: inherit;
    transition: background-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  /* The spotlight is read, not pressed: no pointer, no tint. Its one action
     is the button at its foot. */
  .ff-spot { flex-direction: column; cursor: default; }
  .ff-row:active { background: var(--paper); transition-duration: var(--dur-press); }
  /* The spotlight borrows the profile sheet's pieces (.spf-*): only the
     corners and spacing differ, because here it sits inside a card. */
  .ff .ff-hero { border-radius: 0; height: 230px; }
  .ff-hero .spf-id { right: 20px; }
  .ff .spf-stats { margin: -30px 14px 0; }
  .ff-badge {
    position: absolute; z-index: 2; left: 12px; top: 12px; display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 12px 6px 9px; border-radius: 99px; background: #F2B32C; color: var(--ink);
    font-family: var(--font-display); font-size: 13.5px; font-weight: 800; box-shadow: 0 4px 12px rgba(0,0,0,.22);
  }
  .ff-spot-body { position: relative; display: flex; flex-direction: column; gap: 12px; padding: 16px 16px 16px; }
  /* The list's avatars: the profile's colours and ring, at list size. */
  .ff-ava {
    width: 46px; height: 46px; flex: 0 0 46px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
    color: #fff; font-family: var(--font-display); font-size: 15px; font-weight: 800; letter-spacing: .02em;
    box-shadow: 0 0 0 2.5px #fff, 0 0 0 3.5px var(--line), 0 8px 14px -8px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.3);
  }
  .ff-star { display: inline-flex; align-items: center; gap: 3px; color: #A0661A; font-weight: 800; }
  /* A spotlight is a teaser: three lines of the bio, the rest in the profile. */
  .ff-bio { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }
  /* The spotlight's action. Full width, so it reads as what the card does
     rather than a tag inside it, and built like every raised green button:
     gradient, top highlight, bottom edge, contact shadow, soft cast shadow.
     The arrow sits in its own pale disc at the far end - where the eye
     finishes reading the label - and moves forward a step when pressed. */
  .ff-cta {
    align-self: stretch; display: flex; align-items: center; justify-content: space-between; gap: 10px;
    margin-top: 14px; min-height: 54px; padding: 0 7px 0 20px; border-radius: 16px; color: #fff;
    font-family: var(--font-display); font-size: 16px; font-weight: 700; letter-spacing: -.005em;
    background-image: linear-gradient(180deg, #14875A 0%, var(--tanim) 54%, #075232 100%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.26),
      inset 0 -1px 0 rgba(0,0,0,.24),
      inset 0 0 0 1px rgba(4,40,24,.22),
      0 1px 2px rgba(6,38,23,.30),
      0 12px 20px -14px rgba(6,38,23,.6);
    transition: transform 190ms var(--ease-out), box-shadow 190ms var(--ease-out);
  }
  .ff-cta-go {
    flex-shrink: 0; width: 40px; height: 40px; border-radius: 12px;
    display: inline-flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,.16); box-shadow: inset 0 0 0 1px rgba(255,255,255,.22);
    transition: transform 190ms var(--ease-out);
  }
  .ff-cta {
    border: none; cursor: pointer; width: 100%; text-align: left;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .ff-cta:active {
    transform: scale(.975); transition-duration: var(--dur-press);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.12),
      inset 0 -1px 0 rgba(0,0,0,.28),
      inset 0 0 0 1px rgba(4,40,24,.26),
      0 1px 1px rgba(6,38,23,.34),
      0 4px 10px -8px rgba(6,38,23,.5);
  }
  .ff-cta:active .ff-cta-go { transform: translateX(3px); transition-duration: var(--dur-press); }
  .ff-list { border-top: 1px solid var(--line); }
  .ff-row { align-items: center; gap: 12px; min-height: 68px; padding: 12px 16px; }
  .ff-row + .ff-row { border-top: 1px solid var(--line); }
  .ff-row-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  .ff-row-name { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text); }
  .ff-near { padding: 2px 9px; border-radius: 99px; background: #DCEAF8; color: #2F6FA8; font-size: 13px; font-weight: 800; }
  .ff-row-meta { font-size: 14px; color: var(--text-muted); }
  .ff-chev { color: var(--line-strong); flex-shrink: 0; }

  /* The banner that opens the buyer's Home. Not a button: it is the page's
     own masthead, and a tap that navigated from here would surprise. */
  .hm-banner {
    margin: 0; aspect-ratio: 1000 / 500; overflow: hidden; border-radius: var(--radius);
    background: #EAF3E6; box-shadow: 0 10px 24px -18px rgba(22,33,27,.4);
  }
  .hm-banner img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* The brand poster. aspect-ratio reserves its exact shape up front, so
     the page does not jump when the image arrives. */
  /* A picture: no pointer, no press, nothing that promises a tap. */
  .hm-poster {
    display: block; width: 100%; margin: 0; aspect-ratio: 1000 / 562; overflow: hidden;
    border-radius: var(--radius); background: #EAF3E6;
    box-shadow: 0 14px 30px -20px rgba(22,33,27,.4);
  }
  .hm-poster img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* ── Profit snapshot ────────────────────────────────────────────────────
     Two tiles and a net. Money in is green, money out is gold — the same
     two meanings those colours carry everywhere else in the app — and the
     net says which way it went in words as well as in colour. */
  .ps-range {
    flex-shrink: 0; display: flex; gap: 2px; padding: 3px; border-radius: 99px; background: var(--paper-alt);
  }
  .ps-range button {
    min-height: 34px; padding: 0 14px; border: none; border-radius: 99px; background: none; cursor: pointer;
    font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text-muted);
    transition: background-color 160ms ease, color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .ps-range button.on { background: var(--card); color: var(--text); box-shadow: 0 1px 3px rgba(22,33,27,.14); }

  .ps {
    margin-top: 12px; padding: 14px; border-radius: var(--radius); background: var(--card);
    box-shadow: inset 0 0 0 1px var(--line), 0 14px 30px -22px rgba(22,33,27,.35);
  }
  .ps-2up { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .ps-tile {
    position: relative; display: flex; flex-direction: column; gap: 2px; min-width: 0; padding: 12px 14px;
    border: none; border-radius: 16px; text-align: left; font: inherit; color: inherit;
  }
  .ps-tile.earned { background: #E8F3EC; box-shadow: inset 0 0 0 1px rgba(11,107,65,.16); }
  .ps-tile.spent { background: #FCF3DF; box-shadow: inset 0 0 0 1px rgba(138,93,12,.18); cursor: pointer; }
  .ps-tile.spent:active { background: #F7E9C9; }
  .ps-ico { color: var(--tanim-deep); }
  .ps-tile.spent .ps-ico { color: #8A5A0B; }
  .ps-lbl { font-size: 14px; font-weight: 600; color: var(--text-muted); }
  .ps-val {
    font-family: var(--font-display); font-size: 21px; font-weight: 800; letter-spacing: -.015em; color: var(--text);
    font-variant-numeric: tabular-nums; overflow-wrap: anywhere;
  }
  .ps-tile-chev { position: absolute; right: 8px; top: 12px; color: rgba(138,93,12,.5); }

  /* The net, and the word that says which way it went. */
  .ps-net { display: flex; align-items: baseline; gap: 8px; margin-top: 12px; padding: 0 2px; }
  .ps-net-val {
    font-family: var(--font-display); font-size: 30px; font-weight: 800; letter-spacing: -.025em; line-height: 1.1;
  }
  .ps-net.up .ps-net-val { color: var(--tanim-deep); }
  .ps-net.down .ps-net-val { color: var(--error); }
  .ps-net-lbl { font-size: 15px; font-weight: 600; color: var(--text-muted); }
  .ps-hint { margin: 6px 2px 0; font-size: 14px; line-height: 1.45; color: var(--text-muted); }
  .ps-add { margin-top: 14px; }

  /* Kilos and price side by side: they are one thought, and together they
     make the total underneath. */
  .ps-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .ps-pair .pa-step button { width: 44px; flex: 0 0 44px; height: 50px; border-radius: 14px; }
  .ps-pair .pa-step-val { height: 50px; font-size: 20px; }
  .ps-pair .pa-step-val input { width: 4ch; }
  .ps-total { display: flex; align-items: baseline; gap: 6px; }
  .ps-total b { font-family: var(--font-display); font-size: 19px; font-weight: 800; }

  /* ── Crop tracker ───────────────────────────────────────────────────────
     A row per planting: what it is and which day it is on, a bar for the
     season, and the weeks left underneath. The bar is the only thing on the
     farmer's Home that moves without the market moving. */
  .ct {
    margin-top: 12px; padding: 6px 14px 14px; border-radius: var(--radius); background: var(--card);
    box-shadow: inset 0 0 0 1px var(--line), 0 14px 30px -22px rgba(22,33,27,.35);
  }
  .ct-empty { margin: 12px 2px; font-size: 14.5px; color: var(--text-muted); }
  .ct-list { list-style: none; margin: 0; padding: 0; }
  .ct-row { padding: 12px 0; }
  .ct-row + .ct-row { border-top: 1px solid var(--line); }
  .ct-head { display: flex; align-items: center; gap: 11px; }
  .ct-photo {
    width: 42px; height: 42px; flex: 0 0 42px; border-radius: 12px; overflow: hidden;
    display: flex; align-items: center; justify-content: center; background: var(--tanim-sk); color: var(--tanim);
  }
  .ct-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ct-id { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .ct-name { font-family: var(--font-display); font-size: 15.5px; font-weight: 700; color: var(--text); }
  /* The day number is the headline: it is what changed overnight. */
  .ct-day { font-family: var(--font-display); font-size: 14.5px; font-weight: 600; color: var(--tanim-deep); font-variant-numeric: tabular-nums; }
  .ct-stage {
    flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 99px;
    background: var(--paper-alt); color: var(--text-muted); font-size: 13px; font-weight: 700;
  }
  .ct-stage.ready { background: var(--tanim-sk); color: var(--tanim-deep); }
  .ct-x {
    flex-shrink: 0; width: 34px; height: 34px; border: none; border-radius: 50%; background: none; cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center; color: var(--text-faint);
    transition: transform 190ms var(--ease-out), background-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .ct-x:active { transform: scale(.9); background: var(--paper); transition-duration: var(--dur-press); }

  .ct-track {
    height: 10px; margin: 10px 0 7px; border-radius: 99px; overflow: hidden;
    background: var(--paper-alt); box-shadow: inset 0 0 0 1px rgba(22,33,27,.06);
  }
  /* Grows from the left on the first visit of a session; on later visits it
     is simply at today's mark. */
  .ct-fill {
    display: block; height: 100%; border-radius: 99px;
    background: linear-gradient(90deg, #7EC478, var(--tanim));
    transform-origin: left center; animation: bar-grow 620ms var(--ease-out) both;
  }
  .ct-row.ready .ct-fill { background: linear-gradient(90deg, var(--tanim), var(--palay)); }
  .ct-foot { font-size: 14px; color: var(--text-muted); }
  .ct-row.ready .ct-foot { color: var(--tanim-deep); font-weight: 700; }

  .ct-add {
    width: 100%; margin-top: 12px; min-height: 48px; display: flex; align-items: center; justify-content: center; gap: 8px;
    border: none; border-radius: 14px; cursor: pointer;
    background: var(--tanim-sk); color: var(--tanim-deep);
    font-family: var(--font-display); font-size: 15.5px; font-weight: 700;
    transition: transform 190ms var(--ease-out), background-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .ct-add:active { transform: scale(.97); background: #CFE6D8; transition-duration: var(--dur-press); }

  /* The phone's own date field, dressed like the app's other inputs. */
  .ct-date {
    width: 100%; min-height: 54px; padding: 0 14px; border: none; border-radius: 16px;
    background: var(--paper); box-shadow: inset 0 0 0 1.5px var(--line);
    font-family: var(--font-display); font-size: 16.5px; font-weight: 600; color: var(--text);
  }
  .ct-date:focus { outline: none; box-shadow: inset 0 0 0 2px var(--tanim); }

  @media (prefers-reduced-motion: reduce) {
    .ct-fill { animation: none; }
    .ct-x:active, .ct-add:active { transform: none; }
  }
  .shell[data-revisit] .scroll .ct-fill { animation: none; }

  /* ── Price alerts ───────────────────────────────────────────────────────
     A short list of targets and one button. A reached target turns the row
     green and swaps the waiting line for the price it hit, so the state is
     readable without opening anything. */
  .pa {
    margin-top: 12px; padding: 6px 14px 14px; border-radius: var(--radius); background: var(--card);
    box-shadow: inset 0 0 0 1px var(--line), 0 14px 30px -22px rgba(22,33,27,.35);
  }
  .pa-empty { margin: 12px 2px; font-size: 14.5px; color: var(--text-muted); }
  .pa-list { list-style: none; margin: 0; padding: 0; }
  .pa-row { display: flex; align-items: center; gap: 11px; padding: 10px 0; }
  .pa-row + .pa-row { border-top: 1px solid var(--line); }
  .pa-photo {
    width: 42px; height: 42px; flex: 0 0 42px; border-radius: 12px; overflow: hidden;
    display: flex; align-items: center; justify-content: center; background: var(--tanim-sk); color: var(--tanim);
  }
  .pa-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .pa-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .pa-name { font-family: var(--font-display); font-size: 15.5px; font-weight: 700; color: var(--text); }
  .pa-meta { font-size: 14px; color: var(--text-muted); font-variant-numeric: tabular-nums; }
  .pa-row.hit .pa-meta { color: var(--tanim-deep); font-weight: 600; }
  .pa-now { flex-shrink: 0; font-family: var(--font-display); font-size: 15.5px; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums; }
  .pa-now small { font-size: 12.5px; font-weight: 600; color: var(--text-muted); }
  .pa-hit {
    flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 99px;
    background: var(--tanim-sk); color: var(--tanim-deep);
    font-family: var(--font-display); font-size: 14px; font-weight: 800; font-variant-numeric: tabular-nums;
  }
  .pa-x {
    flex-shrink: 0; width: 38px; height: 38px; border: none; border-radius: 50%; background: none; cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center; color: var(--text-faint);
    transition: transform 190ms var(--ease-out), background-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .pa-x:active { transform: scale(.9); background: var(--paper); transition-duration: var(--dur-press); }
  .pa-add {
    width: 100%; margin-top: 12px; min-height: 48px; display: flex; align-items: center; justify-content: center; gap: 8px;
    border: none; border-radius: 14px; cursor: pointer;
    background: var(--tanim-sk); color: var(--tanim-deep);
    font-family: var(--font-display); font-size: 15.5px; font-weight: 700;
    transition: transform 190ms var(--ease-out), background-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .pa-add:active { transform: scale(.97); background: #CFE6D8; transition-duration: var(--dur-press); }

  /* The sheet: one crop, one number, one sentence saying what happens. */
  .pa-sheet {
    width: 100%; background: var(--card); border-radius: 24px 24px 0 0;
    padding: 14px 18px calc(20px + var(--safe-bottom));
  }
  .pa-sheet-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .pa-sheet-ico {
    width: 38px; height: 38px; flex: 0 0 38px; border-radius: 12px; background: var(--tanim-sk); color: var(--tanim-deep);
    display: inline-flex; align-items: center; justify-content: center;
  }
  .pa-sheet-t { flex: 1; margin: 0; font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text); }
  .pa-field { margin-bottom: 14px; }
  /* .a-lbl lives in the auth stylesheet, which Home never loads: these
     labels carry their own. */
  .pa-lbl {
    display: block; margin-bottom: 8px;
    font-family: var(--font-display); font-size: 15.5px; font-weight: 600; color: var(--text);
  }
  .pa-help { margin: 8px 0 0; font-size: 14px; color: var(--text-muted); }
  /* Minus, number, plus: ₱160 to ₱170 is two taps and no keyboard. */
  .pa-step { display: flex; align-items: center; gap: 10px; }
  .pa-step button {
    width: 54px; height: 54px; flex: 0 0 54px; border: none; border-radius: 16px; cursor: pointer;
    background: var(--paper); color: var(--tanim-deep); box-shadow: inset 0 0 0 1.5px var(--line);
    display: inline-flex; align-items: center; justify-content: center;
    transition: transform 190ms var(--ease-out), background-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .pa-step button:active { transform: scale(.94); background: var(--tanim-sk); transition-duration: var(--dur-press); }
  .pa-step-val {
    flex: 1; min-width: 0; height: 54px; display: flex; align-items: center; justify-content: center; gap: 2px;
    border-radius: 16px; background: var(--paper); box-shadow: inset 0 0 0 1.5px var(--line);
    font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums;
  }
  .pa-step-val input {
    width: 5ch; border: none; background: none; outline: none; padding: 0;
    font: inherit; color: inherit; text-align: center;
  }
  /* Spinners would put two more tiny targets beside the big ones. */
  .pa-step-val input::-webkit-outer-spin-button,
  .pa-step-val input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .pa-promise {
    margin: 0 0 14px; padding: 12px 14px; border-radius: 14px; background: var(--tanim-sk);
    font-size: 15px; line-height: 1.45; color: var(--tanim-deep);
  }
  .pa-save { margin-top: 0; }

  @media (prefers-reduced-motion: reduce) {
    .pa-x:active, .pa-add:active, .pa-step button:active { transform: none; }
  }

  /* Your harvest: the farmer's listings on Home. Green, because on this
     page green is what grows; the money figure here is the harvest's worth,
     not a cost. */
  .fh {
    margin-top: 14px; padding: 18px 16px 16px; border-radius: var(--radius);
    background-image: linear-gradient(180deg, #E8F3EC 0%, #FFFFFF 46%);
    box-shadow: inset 0 0 0 1px rgba(11,107,65,.16), 0 14px 30px -22px rgba(22,33,27,.35);
  }
  .fh-total {
    font-family: var(--font-display); font-size: 34px; font-weight: 800; line-height: 1.05;
    letter-spacing: -.025em; color: var(--text);
  }
  .fh-summary { margin: 5px 0 0; font-size: 15px; color: var(--text-muted); }

  .fh-list { list-style: none; margin: 14px 0 0; padding: 0; }
  .fh-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
  .fh-row + .fh-row { border-top: 1px solid var(--line); }
  .fh-photo {
    width: 46px; height: 46px; flex: 0 0 46px; border-radius: 13px; overflow: hidden;
    display: flex; align-items: center; justify-content: center; background: var(--tanim-sk); color: var(--tanim);
  }
  .fh-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .fh-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .fh-name { font-family: var(--font-display); font-size: 15.5px; font-weight: 700; line-height: 1.25; color: var(--text); }
  .fh-meta { font-size: 14px; color: var(--text-muted); font-variant-numeric: tabular-nums; }
  .fh-end { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }
  .fh-price { font-family: var(--font-display); font-size: 16.5px; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums; }
  .fh-price small { font-size: 13px; font-weight: 600; color: var(--text-muted); }
  /* Above the market price means more per kilo for the one selling, so the
     green sits on that side here — the mirror of the buyer's chart. */
  .fh-vs {
    display: inline-flex; align-items: center; gap: 3px; padding: 3px 9px; border-radius: 99px;
    font-size: 13px; font-weight: 700; white-space: nowrap;
  }
  .fh-vs.up { background: var(--tanim-sk); color: var(--tanim-deep); }
  .fh-vs.down { background: #FBEBD0; color: #8A5A0B; }
  .fh-vs.same { background: var(--paper-alt); color: var(--text-muted); }

  .fh-empty { display: flex; align-items: flex-start; gap: 12px; padding-bottom: 4px; }
  .fh-empty-ico {
    width: 52px; height: 52px; flex: 0 0 52px; border-radius: 16px; background: #fff; color: var(--tanim);
    display: inline-flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px var(--line);
  }
  .fh-empty-t { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--text); }
  .fh-empty-s { margin: 3px 0 0; font-size: 14.5px; line-height: 1.45; color: var(--text-muted); }

  /* The one action on the whole page. It wears .mp-sell-btn, the app's
     sell button, so the gradient, the lit top edge, the contact shadow and
     the 90ms press all come from the button system; only its place on the
     card is set here. */
  .fh-post { margin-top: 16px; }
  @media (prefers-reduced-motion: reduce) { .mp-sell-btn:active { transform: none; } }

  /* Your purchases: gold, because on this page gold means money. */
  .hm-sec-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .hm-sec-row .hm-sec-title { margin-top: 8px; }
  .yp {
    margin-top: 14px; padding: 18px 16px 10px; border-radius: var(--radius);
    background-image: linear-gradient(180deg, #FCF3DF 0%, #FFFFFF 46%);
    box-shadow: inset 0 0 0 1px rgba(138,93,12,.18), 0 14px 30px -22px rgba(22,33,27,.35);
  }
  /* Proportional figures on the big number: tabular digits look loose at
     this size. */
  .yp-total {
    font-family: var(--font-display); font-size: 34px; font-weight: 800; line-height: 1.05;
    letter-spacing: -.025em; color: var(--text);
  }
  .yp-summary { margin: 5px 0 0; font-size: 15px; color: var(--text-muted); }
  .yp-h {
    margin: 18px 0 8px; font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text);
  }

  /* Where it went: name, bar, amount on one grid, so every bar starts on the
     same line and every amount lines up on the right. */
  .yp-bars { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
  .yp-bar-row { display: grid; grid-template-columns: 78px minmax(0, 1fr) 64px; align-items: center; column-gap: 10px; }
  .yp-bar-name { font-size: 14.5px; font-weight: 600; color: var(--text); overflow-wrap: anywhere; }
  .yp-bar-track { height: 10px; }
  /* Square at the start line, 4px round at the end, grows from the start. */
  .yp-bar {
    display: block; height: 100%; border-radius: 0 4px 4px 0; background: #B87A0B;
    transform-origin: left center; animation: bar-grow 520ms var(--ease-out) both;
  }
  .yp-bar-row:nth-child(2) .yp-bar { animation-delay: 50ms; }
  .yp-bar-row:nth-child(3) .yp-bar { animation-delay: 100ms; }
  .yp-bar-row:nth-child(4) .yp-bar { animation-delay: 150ms; }
  .yp-bar-amt { font-size: 14.5px; font-weight: 700; color: var(--text); text-align: right; font-variant-numeric: tabular-nums; }

  /* Buy again: the last two orders as two small cards. The button lives
     inside each card, along its bottom edge. As a row, a narrow phone
     wrapped it loose into the corner, away from the order it would buy;
     inside the card it can only belong to that order, at any width. */
  .yp-h-again { padding-top: 16px; border-top: 1px solid var(--line); }
  .yp-again { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; padding-bottom: 6px; }
  .yp-item {
    display: flex; flex-direction: column; min-width: 0; padding: 0; overflow: hidden;
    border: none; border-radius: 16px; background: var(--card);
    text-align: left; font: inherit; color: inherit; cursor: pointer;
    box-shadow: inset 0 0 0 1px var(--line), 0 8px 18px -12px rgba(22,33,27,.35);
    transition: transform 190ms var(--ease-out);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  /* A card-sized surface: a small scale reads as a press, not a collapse. */
  .yp-item:active { transform: scale(.97); transition-duration: var(--dur-press); }
  .yp-photo {
    position: relative; height: 86px; display: flex; align-items: center; justify-content: center;
    background: var(--tanim-sk); color: var(--tanim);
  }
  .yp-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  /* The date rides the photo like a stamp on a receipt: one line saved. */
  .yp-date {
    position: absolute; left: 8px; top: 8px; padding: 3px 9px; border-radius: 99px;
    background: rgba(255,255,255,.94); color: var(--text); font-size: 13px; font-weight: 700;
    box-shadow: 0 2px 6px rgba(0,0,0,.16);
  }
  .yp-item-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; padding: 10px 12px 12px; }
  .yp-item-name { font-family: var(--font-display); font-size: 16px; font-weight: 700; line-height: 1.25; color: var(--text); }
  .yp-item-meta { font-size: 14px; line-height: 1.35; color: var(--text-muted); overflow-wrap: anywhere; }
  .yp-item-meta b { font-weight: 700; color: var(--text); }
  /* Pinned to the bottom edge, so the two buttons line up even when one
     name wraps and the other does not. */
  .yp-again-btn {
    margin: auto 10px 10px; display: flex; align-items: center; justify-content: center; gap: 6px; min-height: 44px;
    border-radius: 12px; background: var(--tanim-sk); color: var(--tanim-deep);
    font-family: var(--font-display); font-size: 14.5px; font-weight: 700;
    transition: background-color 160ms ease;
  }
  .yp-item:active .yp-again-btn { background: #CFE6D8; transition-duration: var(--dur-press); }

  @media (prefers-reduced-motion: reduce) {
    .yp-bar { animation: none; }
    .yp-item:active { transform: none; }
  }
  .shell[data-revisit] .scroll .yp-bar { animation: none; }

  @media (prefers-reduced-motion: reduce) {
    .hm-search:active, .ff-cta:active, .ff-cta:active .ff-cta-go { transform: none; }
  }

  /* ── Buyer price moves ─────────────────────────────────────────────────
     A light card and one chart. The ink board it replaces sat under another
     dark card and repeated the crop-photo grid above it; this is calm to
     look at and different in kind from everything around it.
     Colours: a validated diverging pair, green #1F7A55 for cheaper and amber
     #DC8F14 for pricier, around a neutral grey centre line. Numbers stay in
     ink; only the bars and swatches carry colour. */
  .mv {
    padding: 16px 16px 10px; border-radius: var(--radius); background: var(--card);
    box-shadow: inset 0 0 0 1px var(--line), 0 14px 30px -22px rgba(22,33,27,.35);
  }
  .mv-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .mv-title { margin: 0; font-family: var(--font-display); font-size: 18px; font-weight: 700; letter-spacing: -.01em; color: var(--text); }
  /* The headline in words: what a buyer would say about today. */
  .mv-verdict {
    display: flex; align-items: center; gap: 9px; margin: 12px 0 0;
    font-family: var(--font-display); font-size: 18px; font-weight: 700; line-height: 1.3; letter-spacing: -.01em; color: var(--text);
  }
  .mv-verdict-ico {
    width: 30px; height: 30px; flex: 0 0 30px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .mv-verdict.up .mv-verdict-ico { background: #FBEBD0; color: #9A5B0B; }
  .mv-verdict.down .mv-verdict-ico { background: #DDEFE4; color: #1F7A55; }
  .mv-verdict.mixed .mv-verdict-ico { background: var(--paper); color: var(--text-muted); }
  .mv-count { margin: 3px 0 0 39px; font-size: 14px; color: var(--text-faint); }

  .mv-axis {
    display: flex; justify-content: space-between; margin-top: 16px; padding-bottom: 8px;
    font-size: 13.5px; font-weight: 700; color: var(--text-muted);
  }
  .mv-axis span { display: inline-flex; align-items: center; gap: 5px; }
  .mv-axis svg { color: var(--text-faint); }
  .mv-axis i { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
  .mv-axis i.down, .mv-row.down .mv-bar { background: #1F7A55; }
  .mv-axis i.up, .mv-row.up .mv-bar { background: #DC8F14; }

  /* One solid hairline down the middle of every row: "same as yesterday". */
  .mv-list { position: relative; margin: 0 -8px; }
  .mv-list::before {
    content: ""; position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; margin-left: -.5px;
    background: var(--line-strong); pointer-events: none;
  }
  .mv-row {
    width: 100%; min-height: 56px; padding: 0 8px; border: none; border-radius: 12px; background: none;
    display: grid; grid-template-columns: 1fr 1fr; align-items: center;
    text-align: left; font: inherit; color: inherit; cursor: pointer;
    transition: background-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .mv-row:active { background: var(--paper); transition-duration: var(--dur-press); }

  /* Name side: hugs the line, photo nearest it, text reading outward. */
  .mv-id { display: flex; align-items: center; gap: 9px; min-width: 0; padding: 7px 0; }
  .mv-row.up .mv-id { flex-direction: row-reverse; padding-right: 10px; text-align: right; }
  .mv-row.down .mv-id { padding-left: 10px; }
  .mv-photo {
    width: 34px; height: 34px; flex: 0 0 34px; border-radius: 10px; overflow: hidden;
    display: flex; align-items: center; justify-content: center; background: var(--tanim-sk); color: var(--tanim);
  }
  .mv-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .mv-txt { display: flex; flex-direction: column; min-width: 0; }
  .mv-name { font-family: var(--font-display); font-size: 15px; font-weight: 600; line-height: 1.2; color: var(--text); overflow-wrap: anywhere; }
  .mv-price { margin-top: 1px; font-size: 14px; font-weight: 600; color: var(--text-muted); font-variant-numeric: tabular-nums; }
  .mv-price small { font-size: 13px; font-weight: 500; }

  /* Bar side: the bar leaves the line and the value rides its end. Length
     is the move as a share of the day's biggest, out of the half's width
     less room for the label. */
  .mv-barcell { display: flex; align-items: center; gap: 7px; min-width: 0; }
  .mv-row.down .mv-barcell { flex-direction: row-reverse; }
  .mv-bar {
    flex: 0 0 auto; height: 14px; width: calc((100% - 58px) * var(--p));
    animation: mv-grow 480ms var(--ease-out) both;
  }
  /* Square where it leaves the line, 4px round where it ends. */
  .mv-row.up .mv-bar { border-radius: 0 4px 4px 0; transform-origin: left center; }
  .mv-row.down .mv-bar { border-radius: 4px 0 0 4px; transform-origin: right center; }
  @keyframes mv-grow { from { transform: scaleX(0); } }
  .mv-chg {
    flex-shrink: 0; font-family: var(--font-display); font-size: 15px; font-weight: 700;
    color: var(--text); font-variant-numeric: tabular-nums; white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    .mv-bar { animation: none; }
  }
  .shell[data-revisit] .scroll .mv-bar { animation: none; }

  /* Spent this month: one figure, the line behind it, the month before. */
  .hm-spend {
    display: flex; align-items: center; gap: 12px; cursor: pointer;
    background-image: linear-gradient(180deg, #FCF3DF 0%, #FFFFFF 70%);
    transition: transform 180ms var(--ease-out), background-color 180ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .hm-spend:active { transform: scale(.985); background: var(--paper); transition-duration: 90ms; }
  .hm-spend-copy { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .hm-spend-val { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--gold-text); letter-spacing: -.02em; font-variant-numeric: tabular-nums; margin-top: 2px; }
  /* Spending more is not "good news", so this stays a neutral fact in the
     card's own colour rather than borrowing the price greens and reds. */
  .hm-spend-vs {
    align-self: flex-start; margin-top: 4px; padding: 2px 9px; border-radius: 99px;
    background: rgba(138,93,12,.1); color: var(--gold-text); font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums;
  }
  .hm-spend-chart { flex-shrink: 0; display: flex; align-items: center; }

  /* Advisory rows: tinted icon, then the message; the tint carries the tone. */
  .hm-adv {
    display: flex; gap: 12px; padding: 12px; margin-top: 10px; border-radius: 14px;
    background: var(--card); box-shadow: inset 0 0 0 1px var(--line);
  }
  .hm-adv-ico { width: 38px; height: 38px; flex: 0 0 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; }
  .hm-adv.good .hm-adv-ico { background: var(--tanim-sk); color: var(--tanim); }
  .hm-adv.warn .hm-adv-ico { background: var(--gold-sk); color: var(--gold-text); }
  .hm-adv-t { display: block; font-family: var(--font-display); font-size: 15.5px; font-weight: 700; color: var(--text); line-height: 1.3; }
  .hm-adv-s { display: block; margin-top: 2px; font-size: 14px; line-height: 1.45; color: var(--text-muted); }

  /* More tools: exactly two tiles, side by side. */
  /* One tool, one full-width card: a lone tile beside an empty half looks
     like something failed to load. */
  .hm-tools.one { grid-template-columns: 1fr; }
  .hm-tools { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .hm-tool {
    display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 14px; text-align: left;
    border: none; border-radius: var(--radius); background: var(--card); box-shadow: inset 0 0 0 1px var(--line);
    font: inherit; color: inherit; cursor: pointer;
    transition: transform 180ms var(--ease-out), background-color 180ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .hm-tool:active { transform: scale(.97); background: var(--paper); transition-duration: 90ms; }
  .hm-tool-ico { width: 46px; height: 46px; border-radius: 13px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
  .hm-tool-ico.wx { background: linear-gradient(180deg, #4A8FCC 0%, #2F6FA8 55%, #235887 100%); color: #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.18), 0 6px 12px -8px rgba(47,111,168,.55); }
  .hm-tool-ico.an { background: linear-gradient(180deg, #7B64CF 0%, #5C45A8 55%, #47348A 100%); color: #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.18), 0 6px 12px -8px rgba(92,69,168,.55); }
  .hm-tool.tint-blue {
    background-image: linear-gradient(180deg, #E9F1FA 0%, #FFFFFF 64%);
    box-shadow: inset 0 0 0 1px rgba(47,111,168,.16);
  }
  .hm-tool.tint-violet {
    background-image: linear-gradient(180deg, #F0EBFB 0%, #FFFFFF 64%);
    box-shadow: inset 0 0 0 1px rgba(92,69,168,.16);
  }
  .hm-tool-t { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text); }
  .hm-tool-s { font-size: 13.5px; color: var(--text-faint); }

  /* Buyer: the marketplace, with the buyer mascot standing at the edge. */
  .hm-shop {
    position: relative; overflow: hidden; display: flex; align-items: stretch; width: 100%; min-height: 150px;
    padding: 0; border: none; border-radius: var(--radius-lg); cursor: pointer; text-align: left; font: inherit; color: #fff;
    background: radial-gradient(120% 100% at 100% 0%, rgba(126,196,120,.3), transparent 60%), linear-gradient(150deg, #1D2E25, var(--ink));
    transition: transform 180ms var(--ease-out);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .hm-shop:active { transform: scale(.98); transition-duration: 90ms; }
  .hm-shop-copy { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 18px 0 18px 18px; max-width: 64%; }
  .hm-shop-t { font-family: var(--font-display); font-size: 19px; font-weight: 700; line-height: 1.2; }
  .hm-shop-s { font-size: 14px; color: rgba(255,255,255,.8); line-height: 1.4; }
  .hm-shop-btn {
    align-self: flex-start; margin-top: 8px; display: inline-flex; align-items: center; gap: 2px;
    padding: 8px 8px 8px 14px; border-radius: 99px; background: var(--palay); color: var(--ink);
    font-family: var(--font-display); font-size: 14px; font-weight: 700;
  }
  .hm-shop-img { position: absolute; right: -10px; bottom: -6px; height: 140px; width: auto; pointer-events: none; }

  @media (prefers-reduced-motion: reduce) {
    .hm-wx:active, .hm-link:active, .hm-spend:active, .hm-tool:active, .hm-shop:active { transform: none; }
  }

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
  /* Part of the page, not a white tray stuck to the bottom of it. */
  .screen-dock {
    flex-shrink: 0; display: flex; flex-direction: column; gap: 8px;
    background: transparent;
    padding: 10px 14px calc(var(--bnav-h) + 22px + var(--safe-bottom));
  }
  .scroll.has-dock { padding-bottom: 10px; }

  .add-btn  { width:100%; padding:15px; background:var(--green); color:#fff; border:none; border-radius:var(--radius); font-family:inherit; font-size: var(--fs-label); font-weight:700; cursor:pointer; }

  /* ── Analytics ── */
  .bar-row { display:flex; align-items:center; gap:9px; margin-bottom:11px; }
  .bar-lbl { font-size: var(--fs-label); font-weight:600; color:var(--text); width:64px; flex-shrink:0; }
  .bar-track { flex:1; height:10px; background:var(--bg-alt); border-radius:99px; overflow:hidden; }
  .bar-fill  { height:100%; border-radius:99px; }
  .bar-val   { font-size: var(--fs-label); color:var(--text-muted); width:44px; text-align:right; flex-shrink:0; }



  /* ── Marketplace ── */
  /* The greeting sits on its own green panel now, so the page opens with the
     brand's colour instead of a bare line of text above a search box. */
  .mp-title-row {
    display: flex; align-items: flex-start; justify-content: space-between; position: relative;
    padding: 16px 16px 18px; border-radius: var(--radius-lg); overflow: hidden;
    background-image: linear-gradient(180deg, #E8F3EC 0%, #FFFFFF 78%);
    box-shadow: inset 0 0 0 1px rgba(11,107,65,.16);
  }
  .mp-peek  { position:absolute; right:-16px; bottom:-8px; height:132px; width:auto; pointer-events:none; user-select:none; }
  /* The selling farmer is a whole figure, not a peek: he stands on the panel's
     bottom edge, and the copy keeps clear of him. */
  .mp-peek-sell { right: -14px; bottom: -14px; height: 168px; }
  .mp-title-row:has(.mp-peek-sell) .mp-sub { max-width: 150px; }
  /* The buyer's market poster, framed like the panels around it: same
     large radius, and the hairline drawn over the image (not under it,
     where the picture would hide it). aspect-ratio holds its shape before
     the image arrives, so the search box below never jumps. */
  .mp-poster {
    position: relative; margin: 0; aspect-ratio: 1000 / 562; overflow: hidden;
    border-radius: var(--radius-lg); background: #EAF3E6;
    box-shadow: 0 14px 30px -20px rgba(22,33,27,.4);
  }
  .mp-poster img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .mp-poster::after {
    content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
    box-shadow: inset 0 0 0 1px rgba(11,107,65,.16);
  }
  .mp-title { font-family: var(--font-display); font-size: var(--fs-title); font-weight:700; color:var(--text); }
  .mp-sub   { font-size: var(--fs-label); color:var(--text-muted); margin-top:3px; max-width:170px; line-height:1.45; }
  .post-btn { background:var(--text); color:#fff; border:none; border-radius:11px; padding:11px 15px; font-family:inherit; font-size: var(--fs-label); font-weight:700; cursor:pointer; flex-shrink:0; }

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
  /* Each seller in their own colour (src/lib/avatar.ts), the same as on
     Home and in their profile; green until one is given. */
  .seller-ava   { width:44px; height:44px; border-radius:50%; background:var(--tanim); display:flex; align-items:center; justify-content:center; font-size: var(--fs-label); font-weight:800; color:#fff; flex-shrink:0; box-shadow: inset 0 1px 0 rgba(255,255,255,.3); }
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
    padding-bottom: var(--safe-bottom);
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
  /* Why an order, a post or a removal didn't go through: said in place,
     right above the button that will try again. */
  .form-err {
    display: flex; align-items: flex-start; gap: 8px; margin: 0 0 12px; padding: 10px 12px;
    border-radius: 12px; background: var(--error-sk); color: var(--error);
    font-size: 14.5px; font-weight: 600; line-height: 1.4;
  }
  .form-err svg { flex-shrink: 0; margin-top: 1px; }
  .cart-checkout-btn[aria-busy="true"], .btn-primary[aria-busy="true"] { opacity: .75; cursor: progress; }
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

  /* ── Profit, on the Expenses page ───────────────────────────────────────
     Estimated beside final. The estimate has a dashed edge and an "≈": a
     guess should look like one before it is read. Green for a profit, the
     error red for a loss - and a sign on the number, never colour alone. */
  .pf-sub { margin: -4px 0 14px; font-size: 14px; line-height: 1.5; color: var(--text-muted); }
  .pf-sum { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .pf-tile {
    display: flex; flex-direction: column; gap: 3px; padding: 12px 12px 11px; border-radius: 14px; min-width: 0;
    background: var(--paper);
  }
  .pf-tile.est { box-shadow: inset 0 0 0 1.5px transparent; outline: 1.5px dashed rgba(11,107,65,.45); outline-offset: -1.5px; background: #F3F8F4; }
  .pf-tile.fin { background: linear-gradient(180deg, #EAF4EC, #E1EFE5); box-shadow: inset 0 0 0 1px rgba(11,107,65,.16); }
  .pf-tile-l { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--text-faint); }
  .pf-tile-v {
    font-family: var(--font-display); font-size: 22px; font-weight: 800; letter-spacing: -.02em;
    color: var(--text); font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .pf-tile.pos .pf-tile-v { color: var(--tanim-deep); }
  .pf-tile.neg .pf-tile-v { color: var(--error); }
  .pf-tile-s { font-size: 12.5px; line-height: 1.35; color: var(--text-muted); }

  .pf-list { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; }
  .pf-row { padding: 12px 0; }
  .pf-row + .pf-row { border-top: 1px solid var(--line); }
  .pf-row-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .pf-photo {
    width: 34px; height: 34px; flex: 0 0 34px; border-radius: 10px; overflow: hidden;
    display: inline-flex; align-items: center; justify-content: center; background: var(--tanim-sk);
  }
  .pf-photo img { width: 100%; height: 100%; object-fit: cover; }
  .pf-crop { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text); }
  .pf-spent { margin-left: auto; font-size: 13.5px; color: var(--text-muted); font-variant-numeric: tabular-nums; }
  .pf-spent strong { color: var(--text); font-weight: 700; }
  .pf-lines { display: flex; flex-direction: column; gap: 6px; }
  .pf-line {
    width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px;
    min-height: 52px; padding: 8px 12px; border-radius: 12px; border: none; background: var(--paper);
    font: inherit; color: inherit; text-align: left;
  }
  button.pf-line { cursor: pointer; transition: transform 190ms var(--ease-out), background-color 160ms ease; -webkit-tap-highlight-color: transparent; }
  button.pf-line:active { transform: scale(.98); background: var(--tanim-sk); transition-duration: var(--dur-press); }
  .pf-line.est { outline: 1.5px dashed rgba(11,107,65,.35); outline-offset: -1.5px; }
  .pf-line-l { display: flex; flex-direction: column; min-width: 0; font-size: 14px; font-weight: 700; color: var(--text); }
  .pf-line-l small { font-size: 12.5px; font-weight: 500; color: var(--text-faint); font-variant-numeric: tabular-nums; }
  .pf-line-v {
    display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0;
    font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums;
  }
  .pf-line.pos .pf-line-v { color: var(--tanim-deep); }
  .pf-line.neg .pf-line-v { color: var(--error); }
  .pf-edit { color: var(--text-faint); }
  .pf-set {
    display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 99px;
    background: var(--tanim); color: #fff; font-family: var(--font-body); font-size: 13.5px; font-weight: 700;
  }
  .pf-foot { margin: 10px 0 0; font-size: 13px; line-height: 1.45; color: var(--text-faint); }
  .pf-kg-in { width: 7ch !important; }
  .pf-kg-unit { font-size: 15px; font-weight: 700; color: var(--text-faint); }
  /* In the add-expense form: the cost against the harvest it is for. */
  .pf-preview {
    margin: 0; padding: 10px 12px; border-radius: 12px; background: var(--paper);
    font-size: 14px; line-height: 1.45; font-weight: 600; color: var(--text-muted);
  }
  .pf-preview.pos { background: var(--tanim-sk); color: var(--tanim-deep); }
  .pf-preview.neg { background: var(--error-sk); color: var(--error); }
  @media (prefers-reduced-motion: reduce) { button.pf-line:active { transform: none; } }

  /* ── Order receipt ──────────────────────────────────────────────────────
     Paper, not a card: warm off-white, a torn zigzag foot, a dashed
     perforation between the parts, numbers set in tabular figures so the
     amounts line up the way a till prints them. */
  .rc-panel {
    width: 100%; max-width: 340px; max-height: calc(100% - 32px); overflow-y: auto;
    background: none; box-shadow: none; padding: 6px 2px 4px;
    display: flex; flex-direction: column; align-items: stretch; gap: 14px;
    scrollbar-width: none;
  }
  .rc-panel::-webkit-scrollbar { display: none; }
  .rc-lift { filter: drop-shadow(0 22px 26px rgba(4,14,9,.45)) drop-shadow(0 2px 3px rgba(4,14,9,.25)); }
  .rc-paper {
    --zz: 11px;
    position: relative; padding: 22px 22px calc(18px + var(--zz)); border-radius: 20px 20px 0 0;
    color: var(--text); text-align: left;
    background:
      radial-gradient(120% 60% at 50% 0%, rgba(11,107,65,.06), transparent 70%),
      #FFFDF6;
    /* The torn foot: a row of triangles cut out of the bottom edge. */
    -webkit-mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / calc(var(--zz) * 2) 100%;
            mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / calc(var(--zz) * 2) 100%;
    /* It prints: fed out downward from the top edge, the way a till pushes
       a receipt out. Explanatory motion, so it may take its time. */
    animation: rc-print 760ms cubic-bezier(.22,1,.36,1) 80ms both;
  }
  @keyframes rc-print {
    from { clip-path: inset(0 0 100% 0); transform: translateY(-14px); }
    to   { clip-path: inset(0 0 0 0);    transform: none; }
  }

  .rc-head { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .rc-brand {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-display); font-size: 21px; font-weight: 700; letter-spacing: -.015em; color: var(--tanim-deep);
  }
  .rc-kicker { font-size: 11.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--text-faint); }

  .rc-title {
    margin: 18px 0 0; text-align: center; font-family: var(--font-display); font-size: 22px; font-weight: 700;
    letter-spacing: -.015em; color: var(--text);
  }

  .rc-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 12px; margin: 16px 0 0; }
  .rc-meta > div { min-width: 0; }
  .rc-meta dt { font-size: 10.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--text-faint); }
  .rc-meta dd { margin: 2px 0 0; font-size: 14px; font-weight: 600; color: var(--text); overflow-wrap: anywhere; }

  /* The perforation: a dashed rule the width of the paper. */
  .rc-perf {
    height: 0; margin: 16px -22px; border-top: 2px dashed #DDD6C4;
  }

  .rc-group + .rc-group { margin-top: 14px; }
  .rc-seller { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .rc-ava {
    width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: var(--tanim-sk); color: var(--tanim-deep); font-size: 11.5px; font-weight: 800;
  }
  .rc-seller-txt { display: flex; flex-direction: column; min-width: 0; }
  .rc-seller-n { font-size: 14.5px; font-weight: 700; color: var(--text); }
  .rc-seller-l { font-size: 12.5px; color: var(--text-faint); }
  .rc-line { display: flex; align-items: baseline; gap: 12px; padding: 4px 0 4px 40px; }
  .rc-item { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .rc-item-n { font-size: 14.5px; font-weight: 600; color: var(--text); }
  .rc-item-q { font-size: 12.5px; color: var(--text-faint); font-variant-numeric: tabular-nums; }
  .rc-amt { font-size: 14.5px; font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; white-space: nowrap; }

  .rc-total { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
  .rc-total-l {
    display: flex; flex-direction: column; font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text);
  }
  .rc-total-l small { font-family: var(--font-body); font-size: 12.5px; font-weight: 500; color: var(--text-faint); margin-top: 2px; }
  .rc-total-v {
    font-family: var(--font-display); font-size: 28px; font-weight: 800; letter-spacing: -.02em;
    color: var(--tanim-deep); font-variant-numeric: tabular-nums;
  }
  .rc-note {
    margin: 14px 0 0; padding: 10px 12px; border-radius: 12px;
    background: var(--gold-sk); box-shadow: inset 0 0 0 1px var(--gold-line);
    font-size: 13px; line-height: 1.5; color: var(--text-muted);
  }
  .rc-thanks { margin: 14px 0 0; text-align: center; font-size: 13.5px; font-weight: 600; color: var(--tanim); }

  /* Under the paper: keep a copy, then put it away. They arrive together
     after the receipt has printed. */
  .rc-actions { display: flex; flex-direction: column; gap: 10px; animation: wid-rise 360ms var(--ease-out) 820ms both; }
  /* Save: the quieter of the two, in the receipt's own paper colour with
     green words, so it reads as belonging to the paper above it. Solid, not
     glass: the scrim under a centred sheet is mid-grey, and white-on-glass
     there washes out. */
  .rc-save {
    min-height: 54px; border: none; border-radius: 16px; cursor: pointer; color: var(--tanim-deep);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 16px; font-weight: 700;
    background-image: linear-gradient(180deg, #FFFFFF 0%, #FFFDF6 55%, #F3EFE2 100%);
    box-shadow: inset 0 1px 0 #fff, inset 0 -1px 0 rgba(0,0,0,.08), inset 0 0 0 1px rgba(15,53,36,.12),
      0 1px 2px rgba(4,14,9,.2), 0 12px 22px -12px rgba(0,0,0,.5);
    transition: transform 190ms var(--ease-out), box-shadow 190ms var(--ease-out);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .rc-save:active { transform: scale(.975); transition-duration: 90ms; }
  .rc-save-lbl { display: inline-flex; align-items: center; gap: 8px; animation: wid-lbl-in 200ms var(--ease-out); }
  .rc-save .wid-spin { border-color: rgba(15,53,36,.2); border-top-color: var(--tanim); }
  .rc-save.is-done { color: var(--tanim); }
  .rc-save.is-failed { color: var(--error); }
  /* Done: the same raised green as Continue. */
  .rc-done {
    min-height: 54px; border: none; border-radius: 16px; cursor: pointer; color: #fff;
    font-family: var(--font-display); font-size: 16.5px; font-weight: 700;
    background-image: linear-gradient(180deg, #14875A 0%, var(--tanim) 54%, #075232 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.26), inset 0 -1px 0 rgba(0,0,0,.24),
      inset 0 0 0 1px rgba(4,40,24,.22), 0 1px 2px rgba(6,38,23,.30), 0 12px 22px -12px rgba(0,0,0,.6);
    transition: transform 190ms var(--ease-out);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .rc-done:active { transform: scale(.975); transition-duration: 90ms; }
  @media (prefers-reduced-motion: reduce) {
    .rc-paper { animation: a-fade-in 240ms ease both; }
    .rc-actions { animation: a-fade-in 240ms ease both; }
    .rc-save-lbl { animation: none; }
    .rc-done:active, .rc-save:active { transform: none; }
  }

  /* ── Seller Details Modal ── */
  .seller-modal-sheet {
    background:var(--paper); border-radius:30px 30px 0 0;
    width:100%; max-height:90%; display:flex; flex-direction:column;
    overflow:hidden; padding-bottom: var(--safe-bottom);
  }
  .seller-modal-body { flex:1; overflow-y:auto; padding:18px; display:flex; flex-direction:column; gap:15px; }
  .star-fill { color:var(--gold-text); }
  /* A seller's own listings, inside their profile. Same row shape as the
     rest of the app's lists, sized for a sheet: photo, what it is and how
     much is left, then the price. */
  .sml { background: #fff; border-radius: 14px; padding: 12px 12px 6px; border: 1px solid var(--paper-alt); }
  .sml-none { margin: 4px 0 8px; font-size: 14.5px; color: var(--text-muted); }
  .sml-list { display: flex; flex-direction: column; }
  .sml-row {
    width: 100%; display: flex; align-items: center; gap: 11px; min-height: 60px; padding: 8px 6px; margin: 0 -6px;
    border: none; border-radius: 12px; background: none; text-align: left; font: inherit; color: inherit; cursor: pointer;
    transition: background-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .sml-row + .sml-row { border-top: 1px solid var(--line); }
  .sml-row:active { background: var(--paper); transition-duration: var(--dur-press); }
  .sml-photo {
    width: 44px; height: 44px; flex: 0 0 44px; border-radius: 12px; overflow: hidden;
    display: flex; align-items: center; justify-content: center; background: var(--tanim-sk); color: var(--tanim);
  }
  .sml-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .sml-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .sml-name { font-family: var(--font-display); font-size: 15.5px; font-weight: 700; line-height: 1.25; color: var(--text); }
  .sml-meta { font-size: 14px; color: var(--text-muted); }
  .sml-price {
    flex-shrink: 0; font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--text);
    font-variant-numeric: tabular-nums; white-space: nowrap;
  }
  .sml-price small { font-size: 13px; font-weight: 600; color: var(--text-muted); }
  .sml-chev { color: var(--line-strong); flex-shrink: 0; margin-left: -4px; }

  .seller-modal-footer { padding:18px; background:#fff; border-top:1px solid var(--line); flex-shrink:0; }

  /* ── Farmer profile (premium) ────────────────────────────────────────────
     The farmer's harvest, blurred into light behind a deep green shade; the
     avatar in a white ring; three numbers on a card riding over the photo's
     edge; then grouped cards. One call to action, raised green, at the foot. */
  .seller-modal-sheet { border-radius: 28px 28px 0 0; }
  /* The AniSense ground: brand green deepening toward the foot, light from
     the top corner, a warm palay glow low on the left, and a fine diagonal
     weave like the security print on the member ID. */
  .spf-hero {
    position: relative; flex-shrink: 0; height: 200px; overflow: hidden; border-radius: 28px 28px 0 0;
    background:
      repeating-linear-gradient(135deg, rgba(255,255,255,.035) 0 1px, transparent 1px 11px),
      radial-gradient(90% 120% at 100% 0%, rgba(126,196,120,.38), transparent 60%),
      radial-gradient(70% 90% at 0% 100%, rgba(242,179,44,.14), transparent 62%),
      linear-gradient(155deg, #17804F 0%, #0E5A37 48%, #0A3924 100%);
  }
  /* The leaf mark, large and faint, leaning off the right edge. */
  .spf-mark {
    position: absolute; right: -38px; top: -22px; width: 220px; height: auto;
    opacity: .14; transform: rotate(-14deg); pointer-events: none; user-select: none;
  }
  .spf-hero::after {
    content: ""; position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(180deg, rgba(5,22,14,0) 35%, rgba(5,22,14,.5) 100%);
  }

  .spf-x {
    position: absolute; top: 14px; right: 14px; z-index: 2; width: 40px; height: 40px; border-radius: 50%; border: none;
    display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer;
    background: rgba(255,255,255,.16); box-shadow: inset 0 0 0 1px rgba(255,255,255,.26);
    transition: transform 190ms var(--ease-out), background-color 160ms ease;
    -webkit-tap-highlight-color: transparent;
  }
  .spf-x:active { transform: scale(.92); background: rgba(255,255,255,.28); transition-duration: var(--dur-press); }
  .spf-id { position: absolute; left: 20px; right: 64px; bottom: 44px; z-index: 1; display: flex; flex-direction: column; align-items: flex-start; }
  .spf-ava {
    width: 66px; height: 66px; border-radius: 50%; margin-bottom: 10px;
    display: flex; align-items: center; justify-content: center; color: #fff;
    font-family: var(--font-display); font-size: 23px; font-weight: 800; letter-spacing: .02em;
    box-shadow: 0 0 0 3px rgba(255,255,255,.92), 0 12px 22px -8px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.3);
  }
  .spf-name {
    font-family: var(--font-display); font-size: 23px; font-weight: 700; letter-spacing: -.015em; line-height: 1.15;
    color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,.35);
  }
  .spf-loc { display: inline-flex; align-items: center; gap: 5px; margin-top: 4px; font-size: 14px; color: rgba(255,255,255,.86); }

  .spf-stats {
    position: relative; z-index: 2; flex-shrink: 0; margin: -30px 16px 0;
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); padding: 13px 4px;
    background: var(--card); border-radius: 18px;
    box-shadow: 0 16px 28px -18px rgba(12,20,15,.55), 0 2px 4px -2px rgba(12,20,15,.12), inset 0 0 0 1px var(--line);
  }
  .spf-stat { position: relative; display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 0; }
  .spf-stat + .spf-stat::before { content: ""; position: absolute; left: 0; top: 6px; bottom: 6px; width: 1px; background: var(--line); }
  .spf-stat-v {
    display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;
    font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums;
  }
  .spf-stat-v small { font-size: 12.5px; font-weight: 700; color: var(--text-muted); }
  .spf-stat-l { font-size: 12.5px; font-weight: 600; color: var(--text-faint); }

  .spf-body { padding: 16px; gap: 12px; }
  .spf-card {
    background: var(--card); border-radius: 18px; padding: 14px 14px 12px;
    box-shadow: inset 0 0 0 1px var(--line), 0 10px 20px -18px rgba(22,33,27,.45);
  }
  .spf-h {
    display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
    font-family: var(--font-display); font-size: 15.5px; font-weight: 700; letter-spacing: -.005em; color: var(--text);
  }
  .spf-count {
    min-width: 22px; height: 22px; padding: 0 7px; border-radius: 99px;
    display: inline-flex; align-items: center; justify-content: center;
    background: var(--tanim); color: #fff; font-size: 12.5px; font-weight: 800;
  }
  .spf-card .sml-photo { width: 52px; height: 52px; flex-basis: 52px; border-radius: 14px; }
  .spf-card .sml-price {
    padding: 5px 10px; border-radius: 99px; background: var(--tanim-sk); color: var(--tanim-deep); font-size: 15px;
  }
  .spf-card .sml-price small { color: var(--tanim); }
  .spf-crops { display: flex; flex-wrap: wrap; gap: 8px; }
  .spf-crop {
    display: inline-flex; align-items: center; padding: 7px 12px; border-radius: 99px;
    background: var(--paper); box-shadow: inset 0 0 0 1px var(--line);
    font-size: 14px; font-weight: 700; color: var(--text);
  }
  .spf-bio {
    margin: 0; padding: 2px 0 2px 12px; border-left: 3px solid var(--tanim-sk);
    font-size: 15px; line-height: 1.6; color: var(--text-soft);
  }
  .spf-facts { padding-bottom: 4px; }
  .spf-fact {
    display: flex; align-items: center; gap: 12px; min-height: 58px; padding: 8px 0;
    color: inherit; text-decoration: none; -webkit-tap-highlight-color: transparent;
  }
  .spf-fact + .spf-fact { border-top: 1px solid var(--line); }
  a.spf-fact { border-radius: 12px; transition: background-color 160ms ease; }
  a.spf-fact:active { background: var(--paper); transition-duration: var(--dur-press); }
  .spf-fact-ico {
    width: 40px; height: 40px; flex-shrink: 0; border-radius: 12px; color: #fff;
    display: flex; align-items: center; justify-content: center;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.16);
  }
  .spf-fact-ico.green { background: linear-gradient(180deg, #16895B 0%, var(--tanim) 55%, #07522F 100%); }
  .spf-fact-ico.blue  { background: linear-gradient(180deg, #4A8FCC 0%, #2F6FA8 55%, #235887 100%); }
  .spf-fact-ico.gold  { background: linear-gradient(180deg, #D39B2E 0%, #B07A16 55%, #8A5D0C 100%); }
  .spf-fact-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .spf-fact-l { font-size: 12.5px; font-weight: 600; color: var(--text-faint); }
  .spf-fact-v { font-size: 15.5px; font-weight: 700; color: var(--text); }
  .spf-foot { padding: 12px 16px; background: rgba(255,255,255,.96); box-shadow: 0 -10px 24px -20px rgba(12,20,15,.5); border-top: 1px solid var(--line); }
  .spf-foot .call-seller-btn { min-height: 56px; padding: 0 18px; text-decoration: none; font-family: var(--font-display); font-size: 16.5px; font-weight: 700; }
  @media (prefers-reduced-motion: reduce) { .spf-x:active { transform: none; } }
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
    border-radius: 24px 24px 0 0; padding: 28px 28px calc(28px + var(--safe-bottom));
  }
  .confirm-sheet.sm { border-radius: 16px 16px 0 0; padding: 24px 24px calc(24px + var(--safe-bottom)); }
  .post-sheet {
    width: 100%; max-height: 93%; background: var(--paper);
    border-radius: 24px 24px 0 0; padding-bottom: calc(24px + var(--safe-bottom));
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
    border-radius: 24px 24px 0 0; padding: 10px 16px calc(22px + var(--safe-bottom));
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
  /* The hero: the field photographed by day and by night, crossfading at
     6 PM. Ink underneath, so a slow image load shows dark rather than a
     flash of colour. Numbers on the left, the sky on the right, the four
     readings on frosted glass along the foot. */
  .wx-hero {
    position: relative; isolation: isolate; overflow: hidden; flex-shrink: 0;
    display: flex; flex-direction: column; gap: 10px;
    padding: 16px 18px 14px; border-radius: 26px; color: #fff; background: var(--ink);
    box-shadow: 0 22px 40px -26px rgba(8,20,28,.85), inset 0 0 0 1px rgba(255,255,255,.06);
  }
  .wx-bg {
    position: absolute; inset: 0; z-index: -2; background-size: cover; background-position: center 60%;
    transition: opacity 700ms ease;
  }
  /* A light wash top to bottom: enough to hold white type over a bright sky,
     not so much that the day stops looking like day. */
  .wx-bg-day {
    background-image: linear-gradient(180deg, rgba(12,18,14,.14) 0%, rgba(12,18,14,.26) 45%, rgba(12,18,14,.6) 100%), url(${wxDay});
  }
  .wx-bg-night {
    background-image: linear-gradient(180deg, rgba(6,9,20,.05) 0%, rgba(6,9,20,.25) 55%, rgba(6,9,20,.6) 100%), url(${wxNight});
    opacity: 0;
  }
  .wx-hero[data-time="night"] .wx-bg-night { opacity: 1; }
  .wx-hero[data-time="night"] .wx-bg-day { opacity: 0; }
  /* A second wash from the left, under the numbers only. */
  .wx-hero::before {
    content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
    background: linear-gradient(100deg, rgba(6,14,10,.4) 0%, rgba(6,14,10,.1) 55%, rgba(6,14,10,0) 80%);
  }
  .wx-place {
    display: flex; align-items: center; gap: 5px;
    font-size: 13.5px; font-weight: 600; color: rgba(255,255,255,.86); font-variant-numeric: tabular-nums;
    text-shadow: 0 1px 8px rgba(0,0,0,.35);
  }
  .wx-main { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
  .wx-read { min-width: 0; text-shadow: 0 1px 14px rgba(0,0,0,.35); }
  .wx-temp {
    font-family: var(--font-display); font-size: 72px; font-weight: 700; line-height: .95;
    letter-spacing: -.05em; font-variant-numeric: tabular-nums;
  }
  .wx-deg { position: relative; top: -.02em; margin-left: 2px; font-size: .56em; font-weight: 600; vertical-align: top; opacity: .9; }
  .wx-cond { margin-top: 4px; font-family: var(--font-display); font-size: 18px; font-weight: 600; letter-spacing: -.01em; }
  .wx-range {
    display: flex; gap: 10px; margin-top: 4px;
    font-size: 14px; font-weight: 600; color: rgba(255,255,255,.82); font-variant-numeric: tabular-nums;
  }
  .wx-range > span { display: inline-flex; align-items: center; gap: 2px; }

  /* The sky, in layers. */
  .wx-art { position: relative; flex: 0 0 112px; width: 112px; height: 100px; }
  .wx-sun, .wx-moon { position: absolute; right: 2px; top: 0; }
  .wx-sun { filter: drop-shadow(0 0 18px rgba(255,196,64,.6)); }
  .wx-moon { top: 6px; right: 8px; filter: drop-shadow(0 0 16px rgba(243,230,181,.5)); }
  .wx-art:not(.has-cloud) .wx-sun, .wx-art:not(.has-cloud) .wx-moon { right: 24px; top: 18px; }
  .wx-cloud { position: absolute; left: 0; bottom: 2px; filter: drop-shadow(0 8px 12px rgba(0,0,0,.28)); }
  .wx-cloud.back { left: 44px; bottom: 36px; }
  .wx-art:not(.has-sky) .wx-cloud:not(.back) { left: 12px; }
  .wx-bolt { position: absolute; left: 34px; bottom: -12px; filter: drop-shadow(0 0 10px rgba(255,209,74,.75)); }
  .wx-rain { position: absolute; left: 16px; bottom: -16px; width: 62px; height: 24px; }
  .wx-rain i { position: absolute; top: 0; width: 2px; height: 9px; border-radius: 2px; background: rgba(196,228,255,.92); }
  .wx-rain i:nth-child(1) { left: 6px; }
  .wx-rain i:nth-child(2) { left: 22px; animation-delay: .35s; }
  .wx-rain i:nth-child(3) { left: 38px; animation-delay: .7s; }
  .wx-rain i:nth-child(4) { left: 54px; animation-delay: .2s; }
  /* Ambient, slow and small, so the picture reads as weather and not as a
     logo: the sun turns once a minute, the cloud drifts 7px and back, rain
     falls. Nothing here asks to be watched. */
  .wx-sun { animation: wx-spin 60s linear infinite; }
  @keyframes wx-spin { to { transform: rotate(360deg); } }
  .wx-moon { animation: wx-float 6s ease-in-out infinite alternate; }
  @keyframes wx-float { to { transform: translateY(-3px); } }
  .wx-cloud { animation: wx-drift 7s ease-in-out infinite alternate; }
  .wx-cloud.back { animation-duration: 9s; animation-direction: alternate-reverse; }
  @keyframes wx-drift { to { transform: translateX(-7px); } }
  .wx-rain i { animation: wx-drop 1.1s linear infinite; }
  @keyframes wx-drop { from { opacity: 0; transform: translateY(-6px); } 25% { opacity: 1; } to { opacity: 0; transform: translateY(15px); } }
  .wx-bolt { animation: wx-flicker 5s step-end infinite; }
  @keyframes wx-flicker { 0% { opacity: 1; } 90% { opacity: .35; } 92% { opacity: 1; } 95% { opacity: .45; } 97% { opacity: 1; } }
  /* The entrance, once per visit: the temperature settles out of a soft blur
     (the one number that matters, arriving rather than cutting in), the sky
     rises a few pixels behind it. The page's own slide is already moving, so
     these stay short and small. */
  .shell:not([data-revisit]) .wx-temp { animation: wx-settle 420ms var(--ease-out) 90ms both; }
  @keyframes wx-settle { from { opacity: 0; filter: blur(6px); transform: translateY(6px); } }
  .shell:not([data-revisit]) .wx-art { animation: wx-rise 520ms var(--ease-out) 150ms both; }
  @keyframes wx-rise { from { opacity: 0; transform: translateY(10px) scale(.95); } }

  /* The four readings: one row, a hairline above, no box. */
  .wx-stats { display: grid; grid-template-columns: repeat(4, 1fr); padding-top: 12px; border-top: 1px solid rgba(255,255,255,.2); }
  .wx-stat { min-width: 0; display: flex; flex-direction: column; gap: 2px; padding: 0 2px; text-shadow: 0 1px 8px rgba(0,0,0,.35); }
  .wx-stat-v { font-family: var(--font-display); font-size: 16px; font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .wx-stat-v small { font-size: 11px; font-weight: 600; opacity: .8; }
  /* Wraps rather than truncates: "Tsansa ng Ulan" is longer than a quarter
     of a phone, and a label cut to "Tsansa n…" answers nothing. */
  .wx-stat-l { font-size: 11.5px; line-height: 1.2; color: rgba(255,255,255,.74); text-wrap: balance; }

  /* Under the hero: white cards, the same shape as the rest of the app. */
  .wx-stack { display: flex; flex-direction: column; gap: 14px; }
  .wx-card {
    padding: 16px; border-radius: 22px; background: var(--card);
    box-shadow: inset 0 0 0 1px var(--line), 0 12px 24px -20px rgba(22,33,27,.45);
  }
  .wx-card-t { margin: 0 0 12px; font-family: var(--font-display); font-size: 17px; font-weight: 700; letter-spacing: -.01em; color: var(--text); }

  /* Hour by hour: a row to swipe; "Now" in green, nothing boxed. */
  .wx-hours {
    display: flex; margin: 0 -16px; padding: 0 8px; overflow-x: auto;
    scroll-snap-type: x proximity; scrollbar-width: none; -webkit-overflow-scrolling: touch;
  }
  .wx-hours::-webkit-scrollbar { display: none; }
  .wx-hr { flex: 0 0 58px; scroll-snap-align: start; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 2px 0; }
  .wx-hr-t { font-size: 12.5px; font-weight: 600; color: var(--text-faint); white-space: nowrap; }
  .wx-hr.now .wx-hr-t { color: var(--tanim); font-weight: 800; }
  .wx-hr-temp { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; }

  /* The week: day, sky, a word for it, high then low. */
  .wx-days { display: flex; flex-direction: column; }
  .wx-day { display: grid; grid-template-columns: 44px 26px 1fr auto; align-items: center; gap: 10px; min-height: 48px; }
  .wx-day + .wx-day { border-top: 1px solid var(--line); }
  .wx-day-n { font-family: var(--font-display); font-size: 15.5px; font-weight: 700; color: var(--text); }
  .wx-day-c { min-width: 0; font-size: 14px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .wx-day-t { font-size: 15px; color: var(--text-faint); font-variant-numeric: tabular-nums; white-space: nowrap; }
  .wx-day-t b { font-weight: 800; color: var(--text); margin-right: 4px; }

  /* What it means: one decision, big, on the brand green (the farmer's
     field window) or sky blue (the buyer's pick-up day). */
  .wx-best {
    position: relative; overflow: hidden; display: flex; align-items: flex-start; gap: 14px;
    padding: 16px; border-radius: 22px; color: #fff;
    background:
      repeating-linear-gradient(135deg, rgba(255,255,255,.035) 0 1px, transparent 1px 11px),
      radial-gradient(90% 120% at 100% 0%, rgba(126,196,120,.38), transparent 60%),
      linear-gradient(155deg, #17804F 0%, #0E5A37 55%, #0A3924 100%);
    box-shadow: 0 16px 30px -22px rgba(7,52,32,.9), inset 0 1px 0 rgba(255,255,255,.12);
  }
  .wx-best.buyer {
    background:
      repeating-linear-gradient(135deg, rgba(255,255,255,.035) 0 1px, transparent 1px 11px),
      radial-gradient(90% 120% at 100% 0%, rgba(160,210,255,.34), transparent 60%),
      linear-gradient(155deg, #3F83C4 0%, #2A6199 55%, #1C4570 100%);
    box-shadow: 0 16px 30px -22px rgba(28,69,112,.9), inset 0 1px 0 rgba(255,255,255,.12);
  }
  .wx-best-ico {
    flex: 0 0 44px; width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,.16); box-shadow: inset 0 0 0 1px rgba(255,255,255,.22);
  }
  .wx-best-k { font-size: 12px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.75); }
  .wx-best-v { margin-top: 2px; font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -.02em; }
  .wx-best-s { margin-top: 4px; font-size: 14px; line-height: 1.45; color: rgba(255,255,255,.88); }

  /* Farming advisory: a filled tile in the colour of what it means. */
  .wx-adv { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
  .wx-adv + .wx-adv { border-top: 1px solid var(--line); }
  .wx-adv-t { flex: 1; font-size: 15px; font-weight: 500; line-height: 1.45; color: var(--text); }

  @media (prefers-reduced-motion: reduce) {
    .wx-sun, .wx-moon, .wx-cloud, .wx-rain i, .wx-bolt { animation: none; }
    .shell:not([data-revisit]) .wx-temp, .shell:not([data-revisit]) .wx-art { animation: wx-fade 200ms ease both; }
    @keyframes wx-fade { from { opacity: 0; } }
  }

  /* More tools: the Weather tile, on the same photograph. Nearly clear at
     the top so the sky reads as sky, and darkened toward the foot, where the
     white words sit. The filled blue icon tile holds on its own. */
  .hm-tool.wx-photo {
    position: relative; overflow: hidden; color: #fff;
    background-color: #1B3A4B; background-size: cover; background-position: 30% 64%;
    background-image:
      linear-gradient(180deg, rgba(10,24,34,.04) 0%, rgba(10,24,34,.24) 42%, rgba(10,24,34,.76) 100%),
      url(${wxDay});
    box-shadow: inset 0 0 0 1px rgba(255,255,255,.1), 0 10px 20px -14px rgba(10,24,34,.7);
  }
  .hm-tool.wx-photo[data-time="night"] {
    background-image:
      linear-gradient(180deg, rgba(6,9,20,.02) 0%, rgba(6,9,20,.22) 45%, rgba(6,9,20,.7) 100%),
      url(${wxNight});
  }
  .hm-tool.wx-photo .hm-tool-t { color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,.45); }
  .hm-tool.wx-photo .hm-tool-s { color: rgba(255,255,255,.9); text-shadow: 0 1px 2px rgba(0,0,0,.4); }
  /* The shared press state paints the tile paper-white, which would wipe
     the photo; here the picture stays and only the shade deepens. */
  .hm-tool.wx-photo:active {
    background-image:
      linear-gradient(180deg, rgba(10,24,34,.18) 0%, rgba(10,24,34,.36) 42%, rgba(10,24,34,.82) 100%),
      url(${wxDay});
  }
  .hm-tool.wx-photo[data-time="night"]:active {
    background-image:
      linear-gradient(180deg, rgba(6,9,20,.16) 0%, rgba(6,9,20,.34) 45%, rgba(6,9,20,.78) 100%),
      url(${wxNight});
  }

  /* ── LSTM Forecast ── */

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
  /* Post a harvest, step 1: the crop as a picture, the way buyers will see
     it, grouped under the same three families the marketplace filters by. */
  .crop-pick-fam + .crop-pick-fam { margin-top: 14px; }
  .crop-pick-fam-t {
    margin: 0 2px 8px; font-size: 12px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
    color: var(--text-faint);
  }
  .crop-pick { padding: 10px 6px 11px; gap: 7px; }
  .crop-pick:active { transform: scale(.96); transition-duration: var(--dur-press); }
  .crop-pick-photo {
    position: relative; width: 56px; height: 56px; border-radius: 14px; overflow: visible;
    display: inline-flex; align-items: center; justify-content: center; background: var(--tanim-sk);
  }
  .crop-pick-photo img { width: 100%; height: 100%; object-fit: cover; border-radius: 14px; display: block; }
  /* The chosen one carries a tick, so it is never told by colour alone. */
  .crop-pick-tick {
    position: absolute; right: -6px; top: -6px; width: 22px; height: 22px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: var(--tanim); color: #fff; box-shadow: 0 0 0 2.5px var(--tanim-sk);
  }
  /* The app's type, a size that holds "Watermelon" on one line in a third
     of the sheet, and no breaking inside a word. */
  .crop-pick-lbl { font-family: var(--font-display); font-size: 14.5px; overflow-wrap: normal; word-break: keep-all; }
  @media (prefers-reduced-motion: reduce) { .crop-pick:active { transform: none; } }
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
  /* ── Delete account ─────────────────────────────────────────────────────
     The door is a quiet line of text, a full 52px tall but with no fill, so
     it reads as the lesser of the two under it and above it. */
  .del-link {
    width: 100%; min-height: 52px; border: none; background: none; cursor: pointer;
    font-family: inherit; font-size: var(--fs-label); font-weight: 600; color: var(--text-muted);
    text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 5px;
    text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);
    transition: opacity 140ms ease; -webkit-tap-highlight-color: transparent;
  }
  .del-link:active { opacity: .55; transition-duration: 0ms; }
  .del-sheet { max-height: 92%; overflow-y: auto; }
  .del-ico {
    width: 56px; height: 56px; border-radius: 18px; margin: 0 auto 14px;
    display: flex; align-items: center; justify-content: center;
    background: var(--error-sk); color: var(--error);
  }
  .del-title { margin: 0; text-align: center; font-family: var(--font-display); font-size: var(--fs-title); font-weight: 700; letter-spacing: -.015em; color: var(--text); }
  .del-body { margin: 8px 0 0; text-align: center; font-size: var(--fs-body); line-height: 1.5; color: var(--text-muted); }
  /* What goes, one line each, marked with the same red cross. */
  .del-list { list-style: none; margin: 18px 0 0; padding: 14px 16px; border-radius: 16px; background: var(--error-sk); display: flex; flex-direction: column; gap: 10px; }
  .del-list li { display: flex; align-items: flex-start; gap: 10px; font-size: var(--fs-body); line-height: 1.35; font-weight: 600; color: var(--text); }
  .del-list svg { flex-shrink: 0; margin-top: 3px; color: var(--error); }
  .del-kept { margin: 12px 4px 0; font-size: var(--fs-label); line-height: 1.5; color: var(--text-muted); }
  /* The tick that arms the button: the whole row is the target, 52px tall. */
  .del-check {
    display: flex; align-items: center; gap: 12px; min-height: 52px; margin-top: 14px; padding: 0 4px; cursor: pointer;
    font-size: var(--fs-body); font-weight: 600; color: var(--text); -webkit-tap-highlight-color: transparent;
  }
  .del-check input { width: 24px; height: 24px; flex-shrink: 0; accent-color: var(--error); }
  .del-actions { display: flex; gap: 12px; margin-top: 16px; }
  .del-actions > * { flex: 1; }
  .del-actions .btn-danger:disabled { background: var(--paper-alt); color: var(--text-faint); cursor: default; box-shadow: none; background-image: none; }

  .version-txt { text-align: center; font-size: var(--fs-label); color: var(--text-faint); padding: 8px 0 12px; }

  /* ── Home / Summary Screen (Senior-friendly) ── */
  /* A card now, not a full-bleed band: it scrolls with the content and sits on
     the same 16px gutter as the stat cards under it. The bukid is scrimmed hard
     enough that white text holds over the pale flooded terraces. */
  .home-header {
    position: relative; isolation: isolate; overflow: hidden;
    border-radius: var(--radius-lg); padding: 22px 20px 18px; color: #fff;
    box-shadow: 0 16px 34px -16px rgba(22,33,27,.45);
    min-height: 196px; display: flex; flex-direction: column;
  }
  /* The same farm as the Weather hero, by day or by night, washed from the
     left so the greeting holds over the sky. */
  .home-header::before {
    content: ""; position: absolute; inset: 0; z-index: -1;
    background-image:
      linear-gradient(100deg, rgba(16,21,18,.78) 0%, rgba(16,21,18,.52) 45%, rgba(16,21,18,.18) 100%),
      url(${wxDay});
    background-size: cover, cover;
    background-position: center, center 70%;
  }
  .home-header[data-time="night"]::before {
    background-image:
      linear-gradient(100deg, rgba(6,9,20,.7) 0%, rgba(6,9,20,.4) 50%, rgba(6,9,20,.1) 100%),
      url(${wxNight});
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
  /* Only things that can actually be pressed. Cards, info rows, listing
     containers and alert rows used to scale on touch too, which promised a
     tap that did nothing, and, because :active applies to every ancestor,
     pressing Add to Cart shrank the whole listing around it as well. */
  .pcard, .module-btn,
  .add-btn, .post-btn,
  .ntab, .signout-btn,
  .cat-tab, .var-tab, .crop-pick,
  .hdr-back, .alerts-close, .prof-edit-btn,
  .qty-pick-btn,
  .btn-call, .btn-details, .add-cart-btn, .buy-now-btn, .cart-checkout-btn, .call-seller-btn {
    transition: transform 190ms var(--ease-out), background-color var(--dur-fast) ease;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .pcard:active, .module-btn:active,
  .add-btn:active, .post-btn:active,
  .ntab:active, .signout-btn:active,
  .cat-tab:active, .var-tab:active, .crop-pick:active,
  .hdr-back:active, .alerts-close:active,
  .prof-edit-btn:active, .qty-pick-btn:active,
  .btn-call:active, .btn-details:active,
  .add-cart-btn:active, .buy-now-btn:active, .cart-checkout-btn:active, .call-seller-btn:active {
    transition-duration: var(--dur-press);
  }
  /* Scale is proportional, so the same ratio reads as more movement the wider
     the element gets. Big surfaces take less; a 40px disc takes the most. */
  .pcard:active, .module-btn:active,
  .cat-tab:active, .crop-pick:active { transform: scale(0.975); }
  .var-tab:active,
  .add-btn:active, .post-btn:active, .signout-btn:active,
  .btn-call:active, .btn-details:active, .add-cart-btn:active, .buy-now-btn:active,
  .cart-checkout-btn:active, .call-seller-btn:active { transform: scale(0.97); }
  .hdr-back:active, .alerts-close:active,
  .prof-edit-btn:active, .qty-pick-btn:active { transform: scale(0.92); }

  .hdr-back:active { background: var(--tanim); }
  .hdr-back:active svg { color: #fff; }
  .qty-pick-btn:active { background: var(--line); }

  /* Selected states cross-fade rather than cut. These are the controls that
     re-render a list under them, so the colour change is the only signal the
     tap registered before the content swaps. */
  .cat-tab, .var-tab {
    transition: transform 190ms var(--ease-out),
                background-color var(--dur-fast) ease,
                border-color var(--dur-fast) ease,
                color var(--dur-fast) ease,
                box-shadow var(--dur-fast) ease;
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
  /* The track is a well pressed into the page: a darker top edge inside it,
     a highlight on its lower lip. The thumb is the app's raised green, the
     same material as Continue, so the choice sits up out of the well. */
  .seg {
    position: relative; display: flex; isolation: isolate; padding: 5px;
    border-radius: 17px;
    background: linear-gradient(180deg, #E3E7E4 0%, #ECEFEC 100%);
    box-shadow:
      inset 0 1px 2px rgba(22,33,27,.12),
      inset 0 0 0 1px rgba(22,33,27,.05),
      0 1px 0 rgba(255,255,255,.9);
  }
  .seg-thumb {
    position: absolute; z-index: -1; top: 5px; bottom: 5px; left: 5px;
    border-radius: 13px;
    background-image: linear-gradient(180deg, #14875A 0%, var(--tanim) 54%, #075232 100%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.26),
      inset 0 -1px 0 rgba(0,0,0,.24),
      inset 0 0 0 1px rgba(4,40,24,.22),
      0 1px 2px rgba(6,38,23,.3),
      0 6px 12px -6px rgba(6,38,23,.5);
    /* Movement across the control, not an arrival: eases in and out. */
    transition: transform 280ms var(--ease-io), width 280ms var(--ease-io);
    will-change: transform;
  }
  .seg-btn {
    flex: 1; min-width: 0; min-height: 46px; padding: 0 6px; border: none; background: none; border-radius: 13px;
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    font-family: var(--font-display); font-size: 15px; font-weight: 700; letter-spacing: -.005em;
    color: var(--text-muted); cursor: pointer;
    transition: color 220ms ease, transform 190ms var(--ease-out);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .seg-ico { display: inline-flex; opacity: .75; transition: opacity 220ms ease; }
  .seg-lbl { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .seg-btn[aria-selected="true"] { color: #fff; text-shadow: 0 1px 1px rgba(0,0,0,.18); }
  .seg-btn[aria-selected="true"] .seg-ico { opacity: 1; }
  /* The label presses, not the thumb: the thumb is already travelling, and
     two things moving at once reads as a wobble. */
  .seg-btn:active { transition-duration: var(--dur-press); transform: scale(0.96); }
  @media (prefers-reduced-motion: reduce) {
    .seg-thumb { transition: none; }
    .seg-btn:active { transform: none; }
  }
  /* 360-wide phones: a little tighter, so every word fits whole beside its
     icon; the very narrowest drop the icons before any word is cut. */
  @media (max-width: 380px) {
    .seg-btn { font-size: 14px; gap: 5px; padding: 0 3px; }
    .seg-ico svg { width: 15px; height: 15px; }
  }
  @media (max-width: 339px) { .seg-ico { display: none; } }

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

  /* ── Page push / pop ─────────────────────────────────────────────────────
     Weather and Analytics are pages opened from Home, not tabs: they slide
     in from the right, header and all, and going back slides Home in from
     the left: out the way they came. 28px and 260ms: enough to say "deeper"
     and "back", short enough not to hold up the tap. The content's own fade
     is switched off for these so the two don't stack. */
  .shell[data-nav="push"] > .screen { animation: scr-push 260ms var(--ease-out) both; }
  .shell[data-nav="pop"]  > .screen { animation: scr-pop 260ms var(--ease-out) both; }
  .shell[data-nav="push"] .screen-enter, .shell[data-nav="pop"] .screen-enter { animation: none; }
  @keyframes scr-push { from { opacity: 0; transform: translateX(28px); } }
  @keyframes scr-pop  { from { opacity: 0; transform: translateX(-28px); } }

  /* ── Revisits ────────────────────────────────────────────────────────────
     Cascades and growing bars play the first time a screen is seen in a
     session. Coming back to it, the content is simply there: the screen's
     short fade is the only motion. */
  .shell[data-revisit] .scroll .stagger-list > *,
  .shell[data-revisit] .scroll .bar-fill,
  .shell[data-revisit] .scroll .mo-fill,
  .shell[data-revisit] .scroll .pr-breadth .seg { animation: none; }

  /* ── Alerts bell ─────────────────────────────────────────────────────────
     One ring, once per session, a beat after the screen lands, pivoting from
     the top of the bell the way a real one swings. The badge pops in with it. */
  .notif-ico.ring > svg { transform-origin: 50% 2px; animation: bell-ring 900ms var(--ease-out) 450ms both; }
  .notif-ico.ring .nbadge { animation: badge-pop 320ms var(--ease-out) 450ms both; }
  @keyframes bell-ring {
    0%, 100% { transform: rotate(0); }
    12% { transform: rotate(16deg); } 26% { transform: rotate(-13deg); }
    40% { transform: rotate(9deg); } 54% { transform: rotate(-6deg); }
    68% { transform: rotate(3deg); } 82% { transform: rotate(-1deg); }
  }
  @keyframes badge-pop { from { opacity: 0; transform: scale(.5); } 60% { opacity: 1; transform: scale(1.15); } to { transform: scale(1); } }

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
    .shell[data-nav="push"] > .screen, .shell[data-nav="pop"] > .screen { animation: scr-in 160ms ease both; }
    .notif-ico.ring > svg, .notif-ico.ring .nbadge { animation: none; }
    .stagger-list > * { animation: row-in-reduced 200ms ease both; }
    @keyframes row-in-reduced { from { opacity: 0; } }
    .bar-fill { animation: none; }
    .shm-bottom > .shm-panel[data-open="true"],
    .shm-center > .shm-panel[data-open="true"] { transform: none; opacity: 1; }
    .shm-center > .shm-panel:not([data-open="true"]) { transform: none; }
    .offline-banner[data-entering="true"] { transform: none; }
    .content-in { animation: none; }
    .cart-badge, .nbadge.bump { animation: none; }
  }

`;
