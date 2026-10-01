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
     Used on the Privacy screen and in the sheet on the welcome screen, so it
     lives in the stylesheet both load.

     A document: the date, a summary set apart, then numbered sections. The
     type does the work. Body at 17px on 1.6 leading for slow readers;
     headings in the display face, a clear step above the text; a hairline
     and generous room between sections so the eye always knows where one
     ends. No icons and nothing to tap open. */
  .pp { color: var(--text-soft); font-size: var(--fs-body); line-height: 1.6; }
  .pp-date { margin: 0; font-size: var(--fs-label); font-weight: 600; color: var(--text-faint); }

  /* The summary: the five points most people want, on a pale wash of the
     app's green with a rule down its edge, the way a document sets off its
     key points. */
  .pp-summary {
    margin-top: 14px; padding: 16px 18px 18px; border-radius: 14px;
    background: #F3F9F5; box-shadow: inset 3px 0 0 var(--tanim);
  }
  .pp-summary-t { margin: 0; font-family: var(--font-display); font-size: var(--fs-lead); font-weight: 700; letter-spacing: -.012em; line-height: 1.25; color: var(--text); }
  .pp-summary .pp-ul { margin-top: 10px; color: var(--text); }

  .pp-sec { margin-top: 26px; padding-top: 24px; box-shadow: 0 -1px 0 var(--line); }
  .pp-summary + .pp-sec { box-shadow: none; padding-top: 4px; }
  .pp-h { margin: 0 0 10px; font-family: var(--font-display); font-size: var(--fs-lead); font-weight: 700; letter-spacing: -.012em; line-height: 1.3; color: var(--text); }
  /* The number, in the app's green: the one touch of colour in the text. */
  .pp-num { color: var(--tanim); font-variant-numeric: tabular-nums; }
  .pp-p { margin: 12px 0 0; }
  .pp-h + .pp-p, .pp-h + .pp-sub, .pp-h + .pp-ul { margin-top: 0; }
  /* A line that introduces the list under it reads as that list's heading. */
  .pp-sub { margin: 18px 0 0; font-weight: 700; color: var(--text); }
  .pp-ul { margin: 8px 0 0; padding-left: 22px; display: flex; flex-direction: column; gap: 8px; }
  .pp-ul li::marker { color: var(--text-faint); }
  .pp a { color: var(--tanim); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1.5px; overflow-wrap: anywhere; }

  /* On the Privacy screen it is one white page, with a page's margins. */
  .pp-page { padding: 22px 20px 26px; }

  /* The same policy from the welcome screen, in a tall white sheet: a title
     bar that stays put with a 48px Close, the document scrolling under it,
     and one button at the foot to go back. */
  .pp-sheet {
    width: 100%; height: 90%; background: var(--card); border-radius: 24px 24px 0 0;
    display: flex; flex-direction: column; overflow: hidden;
  }
  .pp-sheet-head {
    flex: none; display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 16px 14px 14px 22px; box-shadow: 0 1px 0 var(--line);
  }
  .pp-sheet-title { margin: 0; font-family: var(--font-display); font-size: var(--fs-title); font-weight: 700; letter-spacing: -.015em; color: var(--text); }
  .pp-sheet-close {
    width: 48px; height: 48px; flex-shrink: 0; border: none; border-radius: 50%; cursor: pointer;
    display: flex; align-items: center; justify-content: center; background: var(--paper-alt); color: var(--text-soft);
    transition: transform 160ms var(--ease-out); -webkit-tap-highlight-color: transparent;
  }
  .pp-sheet-close:active { transform: scale(.94); transition-duration: 90ms; }
  .pp-sheet-body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 20px 22px 28px; }
  .pp-sheet-foot { flex: none; padding: 12px 22px calc(18px + var(--safe-bottom)); box-shadow: 0 -1px 0 var(--line); }
  .pp-done {
    width: 100%; min-height: 56px; border: none; border-radius: 999px; cursor: pointer;
    font-family: var(--font-display); font-size: var(--fs-lead); font-weight: 600; color: #fff;
    background-image: linear-gradient(180deg, #14875A 0%, var(--tanim) 54%, #075232 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.26), inset 0 -1px 0 rgba(0,0,0,.24), 0 1px 2px rgba(6,38,23,.3);
    transition: transform 190ms var(--ease-out); -webkit-tap-highlight-color: transparent;
  }
  .pp-done:active { transform: scale(.975); transition-duration: 90ms; }

  @media (prefers-reduced-motion: reduce) {
    .pp-done:active, .pp-sheet-close:active { transform: none; }
  }
`;
