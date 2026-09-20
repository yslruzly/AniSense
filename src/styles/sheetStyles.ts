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
`;
