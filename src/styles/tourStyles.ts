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
  .tour-mark {
    display: inline-flex; align-items: center; justify-content: center;
    width: 46px; height: 46px; border-radius: 14px; margin-bottom: 10px;
    background: var(--tanim-sk); color: var(--tanim);
  }
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
  .hm-tool-ico.gd { background: var(--tanim-sk); color: var(--tanim); box-shadow: inset 0 0 0 1px rgba(11,107,65,.16); }
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
  .gd-intro {
    background: var(--tanim-deep); color: #fff; border-radius: var(--radius);
    padding: 18px; display: flex; flex-direction: column; gap: 4px;
  }
  .gd-intro-t { font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -.01em; }
  .gd-intro-s { font-size: 14.5px; line-height: 1.5; color: rgba(255,255,255,.82); }
  .gd-replay {
    margin-top: 12px; min-height: 48px; width: 100%; border: none; border-radius: 14px; cursor: pointer;
    background: #fff; color: var(--tanim-deep); font-family: inherit; font-size: 16px; font-weight: 700;
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    transition: transform 190ms var(--ease-out);
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .gd-replay:active { transform: scale(.98); transition-duration: var(--dur-press); }

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
    background: var(--tanim-sk); color: var(--tanim);
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
  }
`;
