// ─── Sheets ───────────────────────────────────────────────────────────────────
// The motion and layout behind components/ui/Sheet.tsx. Injected next to both
// stylesheets: sheets appear during signup (the location picker) as well as
// inside the app, and these rules used to live in appCss alone, so a sheet
// opened on a signup screen came up with no scrim and no slide at all.
export const sheetCss = `
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


  @media (prefers-reduced-motion: reduce) {
    /* The sheet still announces itself, it just stops travelling: a panel
       that pops into existence with no transition at all is not calmer, it
       is harder to follow. Fade only, and no scale on the centred variant. */
    .shm-bottom > .shm-panel,
    .shm-center > .shm-panel {
      transform: none; opacity: 0;
      transition: opacity 140ms ease;
    }
  }

  /* ── Privacy policy ─────────────────────────────────────────────────────
     Used on the Privacy screen and in the sheet at sign-up, so it lives in
     the stylesheet both load. Built from the same parts as the How to use
     page: a tinted card that says what this is, then white rows that open. */
  .pp { display: flex; flex-direction: column; gap: 18px; color: var(--text-soft); font-size: var(--fs-body); line-height: 1.55; }

  /* What this is and since when: a shield on the app's green, like the icon
     tiles elsewhere, on a card washed with the same green. */
  .pp-hero {
    display: flex; align-items: center; gap: 14px; padding: 18px; border-radius: var(--radius);
    background: linear-gradient(160deg, #E2F0E6 0%, #F3F9F5 58%, #FFFFFF 100%);
    box-shadow: inset 0 0 0 1px rgba(11,107,65,.14), 0 10px 24px -20px rgba(15,53,36,.5);
  }
  .pp-hero-ico {
    flex-shrink: 0; width: 52px; height: 52px; border-radius: 16px; color: #fff;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(180deg, #16895B 0%, var(--tanim) 55%, #07522F 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(0,0,0,.18), 0 6px 12px -8px rgba(11,107,65,.6);
  }
  .pp-hero-t { margin: 0; font-family: var(--font-display); font-size: var(--fs-title); font-weight: 700; letter-spacing: -.015em; line-height: 1.2; color: var(--text); }
  .pp-hero-s { margin: 4px 0 0; font-size: var(--fs-label); font-weight: 600; color: var(--text-muted); }

  .pp-label { margin: 0 2px 10px; font-family: var(--font-display); font-size: var(--fs-lead); font-weight: 700; letter-spacing: -.012em; color: var(--text); }

  /* The five promises: one card, a green tick on each, a hairline between. */
  .pp-promises {
    list-style: none; margin: 0; padding: 4px 16px; border-radius: var(--radius);
    background: var(--card); box-shadow: inset 0 0 0 1px var(--line);
  }
  .pp-promises li { display: flex; align-items: flex-start; gap: 12px; padding: 13px 0; line-height: 1.45; color: var(--text); }
  .pp-promises li + li { box-shadow: 0 -1px 0 var(--line); }
  .pp-tick {
    flex-shrink: 0; width: 24px; height: 24px; margin-top: 1px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; background: var(--tanim-sk); color: var(--tanim);
  }

  /* Every other section is a row that opens. The whole row is the button,
     64px tall; it lights up under the thumb, and its chevron turns a quarter
     as the text unfolds under it. */
  .pp-items { display: flex; flex-direction: column; gap: 10px; }
  .pp-item { background: var(--card); border-radius: var(--radius); box-shadow: inset 0 0 0 1px var(--line); overflow: hidden; }
  .pp-head {
    width: 100%; min-height: 64px; padding: 11px 14px; border: none; background: none; cursor: pointer;
    display: flex; align-items: center; gap: 12px; text-align: left; font: inherit; color: inherit;
    transition: background-color var(--dur-fast) ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .pp-head:active { background: var(--paper-alt); transition-duration: var(--dur-press); }
  .pp-ico {
    flex-shrink: 0; width: 42px; height: 42px; border-radius: 13px;
    display: flex; align-items: center; justify-content: center; background: var(--tanim-sk); color: var(--tanim);
    transition: background-color 200ms ease, color 200ms ease;
  }
  .pp-item.on .pp-ico { background: var(--tanim); color: #fff; }
  .pp-head-t { flex: 1; min-width: 0; font-family: var(--font-display); font-size: var(--fs-body); font-weight: 600; line-height: 1.3; color: var(--text); }
  .pp-chev { flex-shrink: 0; color: var(--text-faint); transition: transform 200ms var(--ease-io); }
  .pp-item.on .pp-chev { transform: rotate(90deg); }
  .pp .autoh { overflow: hidden; transition: height 240ms var(--ease-out); }
  .pp .autoh-in { display: flow-root; }

  .pp-body { padding: 2px 16px 18px; }
  .pp-body > :first-child { margin-top: 0; }
  .pp-p { margin: 12px 0 0; }
  /* A line that introduces the list under it reads as that list's heading. */
  .pp-sub { margin: 16px 0 0; font-weight: 700; color: var(--text); }
  .pp-ul { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
  .pp-ul li { position: relative; padding-left: 20px; }
  .pp-ul li::before { content: ""; position: absolute; left: 4px; top: .62em; width: 7px; height: 7px; border-radius: 50%; background: var(--tanim); }
  .pp a { color: var(--tanim); font-weight: 600; overflow-wrap: anywhere; }

  /* Writing to us, as a full-width tonal button: green on pale green, so it
     is clearly pressable without competing with a screen's main action. */
  .pp-mail {
    display: flex; align-items: center; justify-content: center; gap: 9px; min-height: 56px; padding: 0 16px;
    border-radius: 16px; text-decoration: none; text-align: center;
    background: #E4F1E8; box-shadow: inset 0 0 0 1px rgba(11,107,65,.18);
    font-family: var(--font-display); font-size: var(--fs-body); font-weight: 600; color: var(--tanim);
    transition: transform 160ms var(--ease-out), background-color 140ms ease;
    -webkit-tap-highlight-color: transparent;
  }
  .pp a.pp-mail { color: var(--tanim); }
  .pp-mail:active { transform: scale(.98); background: #D6E9DC; transition-duration: 90ms; }

  /* The same policy at sign-up, in a tall sheet on the page's grey so its
     white cards stand off it: a title bar that stays put, the policy
     scrolling under it, and one button at the foot to go back. */
  .pp-sheet {
    width: 100%; height: 90%; background: var(--paper); border-radius: 24px 24px 0 0;
    display: flex; flex-direction: column; overflow: hidden;
  }
  .pp-sheet-head {
    flex: none; display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 16px 14px 14px 22px; background: var(--card); box-shadow: 0 1px 0 var(--line);
  }
  .pp-sheet-title { margin: 0; font-family: var(--font-display); font-size: var(--fs-title); font-weight: 700; letter-spacing: -.015em; color: var(--text); }
  .pp-sheet-close {
    width: 48px; height: 48px; flex-shrink: 0; border: none; border-radius: 50%; cursor: pointer;
    display: flex; align-items: center; justify-content: center; background: var(--paper-alt); color: var(--text-soft);
    transition: transform 160ms var(--ease-out); -webkit-tap-highlight-color: transparent;
  }
  .pp-sheet-close:active { transform: scale(.94); transition-duration: 90ms; }
  .pp-sheet-body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 18px 16px 24px; }
  .pp-sheet-foot { flex: none; padding: 12px 22px calc(18px + var(--safe-bottom)); background: var(--card); box-shadow: 0 -1px 0 var(--line); }
  .pp-done {
    width: 100%; min-height: 56px; border: none; border-radius: 999px; cursor: pointer;
    font-family: var(--font-display); font-size: var(--fs-lead); font-weight: 600; color: #fff;
    background-image: linear-gradient(180deg, #14875A 0%, var(--tanim) 54%, #075232 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.26), inset 0 -1px 0 rgba(0,0,0,.24), 0 1px 2px rgba(6,38,23,.3);
    transition: transform 190ms var(--ease-out); -webkit-tap-highlight-color: transparent;
  }
  .pp-done:active { transform: scale(.975); transition-duration: 90ms; }

  @media (prefers-reduced-motion: reduce) {
    .pp .autoh, .pp-chev { transition: none; }
    .pp-mail:active, .pp-done:active, .pp-sheet-close:active { transform: none; }
  }
`;
