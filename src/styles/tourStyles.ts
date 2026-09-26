// ─── Tour + Guide ─────────────────────────────────────────────────────────────
// Two rooms of one feature: the walkthrough that runs once over the real
// screen, and the page in More tools that a farmer can come back to.
export const tourCss = `
  /* ── The walkthrough ─────────────────────────────────────────────────────
     Sits inside the shell, over everything including the tab bar, and takes
     every touch: while it is up, the only things that can be pressed are its
     own three buttons. That is the point of a guided tour — nobody gets lost
     halfway through it. */
  /* Opacity only, and the exit is quicker than the entrance: arriving is the
     app explaining itself, leaving is the app getting out of the way. */
  .tour {
    position: absolute; inset: 0; z-index: 95;
    opacity: 0; transition: opacity 140ms ease;
  }
  .tour[data-open] { opacity: 1; transition: opacity 200ms var(--ease-out); }

  .tour-scrim { position: absolute; inset: 0; background: rgba(9,17,13,.78); }

  /* The lit element. Its own shadow is the dimmer for the whole screen, so
     the light and the dark can never come apart by a frame.
     Between steps it travels on a transform, which the compositor can do
     without touching layout; ease-io because this is movement across the
     screen, not an entrance — it should leave and arrive gently and cover
     the ground in between. */
  .tour-hole {
    position: absolute; top: 0; left: 0; border-radius: 20px; will-change: transform;
    box-shadow: 0 0 0 9999px rgba(9,17,13,.78), inset 0 0 0 2px rgba(255,255,255,.92);
    transition: transform 260ms var(--ease-io), width 260ms var(--ease-io), height 260ms var(--ease-io);
  }

  .tour-pos {
    position: absolute; top: 0; left: 12px; right: 12px;
    transition: transform 260ms var(--ease-io);
  }
  /* The card rises the last few pixels into place as it fades in. Nothing in
     the world appears from nothing — so it never starts from scale(0), or
     from a standstill. */
  .tour-card {
    background: var(--card); border-radius: 22px; padding: 18px 18px 16px;
    box-shadow: 0 18px 40px -12px rgba(9,17,13,.45);
    opacity: 0; transform: translateY(10px);
    transition: opacity 140ms ease, transform 140ms ease;
  }
  .tour[data-open] .tour-card {
    opacity: 1; transform: none;
    transition: opacity 220ms var(--ease-out), transform 220ms var(--ease-out);
  }
  /* Above the mascot, so his cut-off waist is hidden by the card. */
  .tour-card { position: relative; z-index: 1; }

  /* ── The mascot on the opening card ──────────────────────────────────────
     He rises from behind the card a beat after it lands, then waves. The
     rise is a transition (ease-out: an entrance); the wave is a keyframe,
     because it is a fixed gesture played once, and each swing eases in and
     out like a pendulum, since it is movement back and forth on screen. */
  .tour-mascot {
    position: absolute; right: 18px; bottom: calc(100% - 38px);
    width: 168px; aspect-ratio: 420 / 435;
    opacity: 0; transform: translateY(28px);
    transition: opacity 140ms ease, transform 140ms ease;
    -webkit-tap-highlight-color: transparent;
  }
  .tour[data-open] .tour-mascot {
    opacity: 1; transform: none;
    transition: opacity 260ms var(--ease-out) 120ms, transform 420ms var(--ease-out) 120ms;
  }
  .tm-body, .tm-eyes, .tm-mouth, .tm-hand { position: absolute; inset: 0; width: 100%; height: 100%; }
  /* The last card arrives while the tour is already open, so there is no
     data-open flip for a transition to ride: he rises on mount instead.
     Played once per arrival, never interrupted - the one place here a
     keyframe is the right tool. */
  .tour-mascot.thumbs { aspect-ratio: 420 / 443; }
  .tour[data-open] .tour-mascot.thumbs { animation: tm-rise 420ms var(--ease-out) 80ms both; }
  @keyframes tm-rise {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: none; }
  }
  /* Eyelids and the closed smile are overlays that switch on and off. No
     fade between: a blink that dissolves reads as a ghost, not an eyelid. */
  .tm-eyes, .tm-mouth { opacity: 0; }
  /* A blink as he comes up over the card, then one every few seconds for as
     long as he is there, which is what makes a drawing look awake. */
  .tour[data-open] .tm-eyes { animation: tm-blink 3.8s step-end 430ms infinite; }
  @keyframes tm-blink {
    0%   { opacity: 1; }
    4%   { opacity: 0; }
    100% { opacity: 0; }
  }
  /* "Hi! Hello!" while the hand waves: the smile closes and opens in the
     rhythm of two short words, then stays open. */
  /* forwards, not both: before the first word he wears the open smile he was drawn with. */
  .tour[data-open] .tm-mouth { animation: tm-talk 1.1s step-end 620ms forwards; }
  @keyframes tm-talk {
    0%   { opacity: 1; }
    14%  { opacity: 0; }
    30%  { opacity: 1; }
    44%  { opacity: 0; }
    58%  { opacity: 1; }
    70%  { opacity: 0; }
    100% { opacity: 0; }
  }
  /* The pivot is the wrist crease, measured on the drawing. */
  .tm-hand { transform-origin: 21.13% 53.48%; }
  .tour[data-open] .tm-hand { animation: tm-wave 1.7s var(--ease-io) 560ms both; }
  @keyframes tm-wave {
    0%   { transform: rotate(0deg); }
    16%  { transform: rotate(-16deg); }
    32%  { transform: rotate(10deg); }
    48%  { transform: rotate(-16deg); }
    64%  { transform: rotate(10deg); }
    82%  { transform: rotate(-5deg); }
    100% { transform: rotate(0deg); }
  }
  /* The logo on its own, no tile: it is full-colour artwork, and a pale green
     square behind green leaves only muddies both. */
  .tour-mark { display: block; width: 60px; height: 60px; margin: -4px 0 8px -4px; }
  .tour-t {
    margin: 0; font-family: var(--font-display); font-size: 21px; font-weight: 700;
    letter-spacing: -.015em; line-height: 1.25; color: var(--text);
  }
  .tour-b { margin: 7px 0 0; font-size: 15.5px; line-height: 1.5; color: var(--text-muted); }

  .tour-foot { display: flex; align-items: center; gap: 10px; margin-top: 14px; }
  .tour-dots { display: flex; align-items: center; gap: 5px; }
  .tour-dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--line);
    transition: width var(--dur-fast) ease, background-color var(--dur-fast) ease;
  }
  .tour-dot.done { background: var(--tanim-sk); }
  .tour-dot.on { width: 18px; border-radius: 3px; background: var(--tanim); }
  .tour-count { margin-left: auto; font-size: 13px; font-weight: 600; color: var(--text-faint); }

  .tour-btns { display: flex; align-items: center; gap: 8px; margin-top: 14px; }
  .tour-skip, .tour-back, .tour-next {
    min-height: 46px; border: none; border-radius: 14px; cursor: pointer;
    font-family: inherit; font-size: 16px; font-weight: 700;
    display: inline-flex; align-items: center; justify-content: center; gap: 4px;
    transition: transform 190ms var(--ease-out), background-color var(--dur-fast) ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  /* Skip is a real option, plainly offered — a tour nobody can leave is a
     cage — but it is the quietest thing on the card. */
  .tour-skip { padding: 0 14px; background: none; color: var(--text-faint); font-weight: 600; }
  .tour-back { width: 46px; padding: 0; margin-left: auto; background: var(--paper-alt); color: var(--text-muted); }
  .tour-next {
    padding: 0 18px; color: #fff;
    background-image: linear-gradient(180deg, #14875A 0%, var(--tanim) 54%, #075232 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.26), inset 0 -1px 0 rgba(0,0,0,.24), 0 1px 2px rgba(6,38,23,.3);
  }
  .tour-btns > .tour-next:nth-child(2) { margin-left: auto; }
  .tour-next.wide { flex: 1; }
  /* Every pressable thing here answers the thumb within a tenth of a second.
     A tour is the first impression of the app; a button that does not move
     under a finger is the first thing that feels broken. */
  .tour-skip:active { transform: scale(.97); background: var(--paper-alt); transition-duration: var(--dur-press); }
  .tour-back:active, .tour-next:active { transform: scale(.96); transition-duration: var(--dur-press); }
  /* Reduced motion keeps the fades — they carry meaning — and drops the
     travel: the light and the card cut to their next position. */
  @media (prefers-reduced-motion: reduce) {
    .tour-hole, .tour-pos { transition: none; }
    /* He still appears, and still says hello with his hand up; he just
       does not rise or wave. */
    .tour-mascot, .tour[data-open] .tour-mascot { transform: none; transition: opacity 200ms ease; }
    .tour[data-open] .tour-mascot.thumbs { animation: none; opacity: 1; }
    .tour[data-open] .tm-hand, .tour[data-open] .tm-eyes, .tour[data-open] .tm-mouth { animation: none; }
    .tour-card, .tour[data-open] .tour-card { transform: none; transition: opacity 200ms ease; }
    .tour-skip:active, .tour-back:active, .tour-next:active { transform: none; }
  }

  /* The guide's tile in More tools. Full width under the two square ones:
     the tile a farmer looks for is the one they need when they are already
     lost, so it does not fight the weather for half a row. */
  .hm-tool.wide {
    grid-column: 1 / -1;
    display: grid; grid-template-columns: auto 1fr; column-gap: 12px; align-items: center;
  }
  .hm-tool.wide .hm-tool-ico { grid-row: 1 / span 2; margin-bottom: 0; }
  .hm-tool.wide .hm-tool-t { align-self: end; }
  .hm-tool.wide .hm-tool-s { align-self: start; }
  .hm-tool-ico.gd { background: linear-gradient(180deg, #16895B 0%, var(--tanim) 55%, #07522F 100%); color: #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.18), 0 6px 12px -8px rgba(11,107,65,.6); }
  .hm-tool.wide {
    background-image: linear-gradient(180deg, #E4F1E8 0%, #FFFFFF 64%);
    box-shadow: inset 0 0 0 1px rgba(11,107,65,.16);
  }

  /* A settings row that actually goes somewhere. The chevron on this row used
     to point at nothing; now the row is a button and presses like one. */
  .setting-row.as-btn {
    width: 100%; border: none; background: none; font: inherit; color: inherit;
    text-align: left; cursor: pointer;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .setting-row.as-btn:active { background: var(--paper-alt); }

  /* ── The guide page ──────────────────────────────────────────────────────
     Same walkthrough, at the farmer's own pace and in their own order. */
  /* The replay card. Light, like the guide's tile on Home, so the one green
     thing on it is the button; the tour's mascot stands at the right. */
  .gd-intro {
    position: relative; overflow: hidden; border-radius: var(--radius);
    padding: 18px 18px 16px;
    display: grid; grid-template-columns: 1fr 118px; grid-template-areas: "copy art" "btn btn"; column-gap: 6px;
    background: linear-gradient(160deg, #E2F0E6 0%, #F3F9F5 58%, #FFFFFF 100%);
    box-shadow: inset 0 0 0 1px rgba(11,107,65,.14), 0 10px 24px -20px rgba(15,53,36,.5);
  }
  .gd-intro-copy { grid-area: copy; align-self: center; padding: 2px 0 6px; }
  .gd-intro-t {
    margin: 0; font-family: var(--font-display); font-size: 20px; font-weight: 700;
    letter-spacing: -.015em; line-height: 1.2; color: var(--text);
  }
  .gd-intro-s { margin: 6px 0 0; font-size: 14.5px; line-height: 1.5; color: var(--text-muted); }
  /* Anchored to the card's right edge; the negative bottom margin lets the
     button's row start over his waist, so the cut-off drawing never shows. */
  .gd-mascot {
    grid-area: art; position: relative; z-index: 0; align-self: end; justify-self: end;
    width: 132px; aspect-ratio: 420 / 435; margin: -4px -20px -38px 0;
  }
  .gd-mascot .tm-hand { animation: tm-wave 1.7s var(--ease-io) 450ms both; }
  .gd-mascot .tm-eyes { animation: tm-blink 3.8s step-end 2.3s infinite; }

  /* The same button as Continue: a gradient with a top and a bottom, a
     highlight where light catches the top edge, a darker line for its
     thickness. On top of that, a soft cast shadow below it - dark and pulled
     in, so it reads as the button standing off the card, not as a glow. */
  .gd-replay {
    grid-area: btn; position: relative; z-index: 1; margin-top: 12px;
    min-height: 56px; width: 100%; border: none; border-radius: 16px; cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center; gap: 9px;
    font-family: var(--font-display); font-size: 16.5px; font-weight: 700; letter-spacing: -.01em; color: #fff;
    background-image: linear-gradient(180deg, #14875A 0%, var(--tanim) 54%, #075232 100%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.26),
      inset 0 -1px 0 rgba(0,0,0,.24),
      inset 0 0 0 1px rgba(4,40,24,.22),
      0 1px 2px rgba(6,38,23,.30),
      0 12px 22px -12px rgba(6,38,23,.62);
    transition: transform 190ms var(--ease-out), box-shadow 190ms var(--ease-out);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  /* Pressed in, not just smaller: the highlight dims and the cast shadow
     draws up under the button. */
  .gd-replay:active {
    transform: scale(.975); transition-duration: 90ms;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.12),
      inset 0 -1px 0 rgba(0,0,0,.28),
      inset 0 0 0 1px rgba(4,40,24,.26),
      0 1px 1px rgba(6,38,23,.34),
      0 4px 10px -8px rgba(6,38,23,.5);
  }

  .gd-list { display: flex; flex-direction: column; gap: 10px; }

  /* One topic. Closed it is a row you can read in a glance; open it is the
     steps in order, numbered, one line each. Only one is open at a time —
     the page is a list of questions, not a wall of answers. */
  .gd-item { background: var(--card); border-radius: var(--radius); box-shadow: inset 0 0 0 1px var(--line); overflow: hidden; }
  .gd-head {
    width: 100%; min-height: 64px; padding: 12px 14px; border: none; background: none; cursor: pointer;
    display: flex; align-items: center; gap: 12px; text-align: left; font: inherit;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .gd-head { transition: background-color var(--dur-fast) ease; }
  .gd-head:active { background: var(--paper-alt); transition-duration: var(--dur-press); }
  .gd-ico {
    flex-shrink: 0; width: 42px; height: 42px; border-radius: 13px;
    display: inline-flex; align-items: center; justify-content: center;
    background: linear-gradient(180deg, #16895B 0%, var(--tanim) 55%, #07522F 100%); color: #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.18), 0 6px 12px -8px rgba(11,107,65,.6);
  }
  .gd-head-body { flex: 1; min-width: 0; }
  .gd-head-t { display: block; font-size: 16px; font-weight: 700; color: var(--text); line-height: 1.3; }
  .gd-head-s { display: block; margin-top: 2px; font-size: 13.5px; color: var(--text-faint); }
  /* A quarter turn is movement on screen, so it eases in and out, and it is
     short: this one is pressed over and over while a farmer reads down. */
  .gd-chev { flex-shrink: 0; color: var(--text-faint); transition: transform 200ms var(--ease-io); }
  .gd-item.on .gd-chev { transform: rotate(90deg); }

  .gd-steps { padding: 2px 16px 16px 16px; display: flex; flex-direction: column; gap: 12px; }
  .gd-step { display: flex; gap: 12px; align-items: flex-start; }
  .gd-n {
    flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%; margin-top: 1px;
    display: inline-flex; align-items: center; justify-content: center;
    background: var(--tanim); color: #fff; font-size: 13px; font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
  .gd-step-b { font-size: 15px; line-height: 1.5; color: var(--text-muted); }
  .gd-step-b strong { color: var(--text); font-weight: 700; }
  /* The one line that matters most in a step: where to tap. */
  .gd-where {
    display: inline-flex; align-items: center; gap: 5px; margin-top: 8px;
    padding: 5px 10px; border-radius: 9px; background: var(--paper-alt);
    font-size: 13px; font-weight: 600; color: var(--text-muted);
  }
  .gd-note {
    display: flex; gap: 10px; padding: 12px 14px; border-radius: 14px;
    background: var(--gold-sk); box-shadow: inset 0 0 0 1px var(--gold-line);
    font-size: 14.5px; line-height: 1.5; color: var(--text-muted);
  }
  .gd-note svg { flex-shrink: 0; color: var(--gold-text); margin-top: 2px; }
  @media (prefers-reduced-motion: reduce) {
    .gd-chev { transition: none; }
    .gd-replay:active { transform: none; }
    .gd-mascot .tm-hand, .gd-mascot .tm-eyes { animation: none; }
  }
`;
