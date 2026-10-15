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
  .pp a { color: var(--tanim); font-weight: 600; text-decoration: none; overflow-wrap: anywhere; }

  /* ── The two legal documents (LegalSheet) ──────────────────────────────
     The whole screen: AniSense green across the top with a word of welcome
     (and, at sign-up, the farmer or buyer waving), then the document on a
     white card rising over it - a switch between the two, the title, the
     date, the text, the only part that scrolls - and the buttons fixed at
     the foot under a soft fade, as a sign-up's "read and accept" does. */
  .lg-sheet {
    position: relative; isolation: isolate; width: 100%; height: 100%; overflow: hidden;
    display: flex; flex-direction: column; color: #fff;
    background:
      radial-gradient(90% 34% at 100% 0%, rgba(242,179,44,.22), transparent 62%),
      linear-gradient(170deg, #145E3F 0%, #0E4630 40%, #0A3525 100%);
  }
  .lg-mark {
    position: absolute; right: -36px; top: -24px; z-index: -1; width: 180px; height: auto;
    opacity: .08; transform: rotate(-14deg); pointer-events: none; user-select: none;
  }
  .lg-top { flex: none; display: flex; align-items: center; justify-content: space-between; padding: calc(12px + var(--safe-top)) 14px 0; }
  .lg-x {
    width: 44px; height: 44px; border: none; border-radius: 50%; cursor: pointer;
    display: flex; align-items: center; justify-content: center; color: #fff;
    background: rgba(255,255,255,.14); box-shadow: inset 0 0 0 1px rgba(255,255,255,.22);
    transition: transform 160ms var(--ease-out), background-color 160ms ease; -webkit-tap-highlight-color: transparent;
  }
  .lg-x:active { transform: scale(.94); background: rgba(255,255,255,.24); transition-duration: 90ms; }
  .lg-x:focus-visible { outline: 3px solid #F7CC5B; outline-offset: 2px; }
  .lg-brand { display: inline-flex; align-items: center; gap: 7px; font-family: var(--font-display); font-size: 15px; font-weight: 700; color: rgba(255,255,255,.92); }
  .lg-brand-mark {
    width: 20px; height: 20px; background: linear-gradient(145deg, #FFF1C4 0%, #F7CC5B 35%, #D99A1E 70%, #F3C24E 100%);
    -webkit-mask-size: contain; mask-size: contain; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
    -webkit-mask-position: center; mask-position: center;
  }
  /* The welcome: the words, and at sign-up the figure standing at the
     right, its feet tucked behind the card's top edge. */
  .lg-hello { flex: none; position: relative; display: flex; align-items: flex-end; gap: 6px; padding: 10px 18px 18px 20px; }
  .lg-hello.is-asking { padding-bottom: 0; }
  .lg-hello-txt { flex: 1; min-width: 0; }
  .lg-hello.is-asking .lg-hello-txt { padding-bottom: 20px; }
  .lg-hello-t { margin: 0; font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -.02em; line-height: 1.15; color: #fff; }
  .lg-hello-s { margin: 6px 0 0; font-size: 15px; line-height: 1.45; color: rgba(255,255,255,.88); }
  .lg-hello-s b { color: #F7CC5B; font-weight: 700; }
  /* The figure's own rules, here and not borrowed from the walkthrough's
     sheet: sign-up does not load that one. Three layers - the drawing, the
     eyelids (off but for a blink), the hand that waves from the wrist. */
  .lg-fig { position: relative; flex: none; width: 104px; aspect-ratio: 420 / 435; margin: -8px -6px -14px 0; }
  .lg-fig img { position: absolute; inset: 0; width: 100%; height: 100%; }
  .lg-fig .tm-eyes { opacity: 0; animation: lg-blink 3.8s step-end 2.3s infinite; }
  .lg-fig .tm-hand { transform-origin: 14.47% 61.55%; animation: lg-wave 1.7s var(--ease-io) 450ms both; }
  .lg-fig.buyer .tm-hand { transform-origin: 14.37% 55.91%; }
  @keyframes lg-blink { 0% { opacity: 1; } 4% { opacity: 0; } 100% { opacity: 0; } }
  @keyframes lg-wave {
    0%   { transform: rotate(0deg); }
    16%  { transform: rotate(-16deg); }
    32%  { transform: rotate(10deg); }
    48%  { transform: rotate(-16deg); }
    64%  { transform: rotate(10deg); }
    82%  { transform: rotate(-5deg); }
    100% { transform: rotate(0deg); }
  }

  .lg-card {
    position: relative; z-index: 1; flex: 1; min-height: 0; display: flex; flex-direction: column;
    background: var(--card); color: var(--text); border-radius: 28px 28px 0 0;
    box-shadow: 0 -12px 30px -14px rgba(0,0,0,.5);
  }
  /* The switch between the two: a pale track, the chosen one lifted white. */
  .lg-tabs { flex: none; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin: 14px 16px 0; padding: 4px; border-radius: 14px; background: var(--paper-alt); }
  .lg-tab {
    min-height: 44px; padding: 0 6px; border: none; border-radius: 11px; cursor: pointer; background: none;
    font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text-muted);
    transition: background-color 160ms ease, color 160ms ease, box-shadow 160ms ease; -webkit-tap-highlight-color: transparent;
  }
  .lg-tab[aria-selected="true"] { background: #fff; color: var(--tanim-deep); box-shadow: 0 1px 3px rgba(22,33,27,.14), 0 0 0 1px rgba(22,33,27,.05); }
  .lg-tab:focus-visible { outline: 3px solid var(--tanim); outline-offset: 1px; }
  .lg-body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 18px 22px 36px; scrollbar-width: none; }
  .lg-body::-webkit-scrollbar { display: none; }
  .lg-body:focus-visible { outline: none; }
  .lg-title { margin: 0 0 6px; font-family: var(--font-display); font-size: 24px; font-weight: 700; letter-spacing: -.015em; line-height: 1.2; color: var(--text); }
  /* The foot: fixed, with the text fading out above it. */
  .lg-foot {
    position: relative; flex: none; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
    padding: 8px 16px calc(14px + var(--safe-bottom)); background: var(--card);
  }
  .lg-foot.one { grid-template-columns: 1fr; }
  .lg-foot::before {
    content: ""; position: absolute; left: 0; right: 0; bottom: 100%; height: 44px; pointer-events: none;
    background: linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 100%);
  }
  .lg-decline, .lg-accept {
    min-height: 56px; border: none; border-radius: 16px; cursor: pointer;
    font-family: var(--font-display); font-size: var(--fs-lead); font-weight: 700;
    transition: transform 190ms var(--ease-out), background-color 160ms ease; -webkit-tap-highlight-color: transparent;
  }
  .lg-decline { background: var(--paper-alt); color: var(--text-soft); }
  .lg-accept {
    color: #fff; background-image: linear-gradient(180deg, #14875A 0%, var(--tanim) 54%, #075232 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.26), inset 0 -1px 0 rgba(0,0,0,.24), 0 8px 18px -10px rgba(6,38,23,.7);
  }
  .lg-decline:active, .lg-accept:active { transform: scale(.975); transition-duration: 90ms; }
  .lg-decline:focus-visible, .lg-accept:focus-visible { outline: 3px solid var(--tanim); outline-offset: 2px; }

  @media (prefers-reduced-motion: reduce) {
    .lg-decline:active, .lg-accept:active, .lg-x:active { transform: none; }
    .lg-fig .tm-hand, .lg-fig .tm-eyes { animation: none; }
  }
`;
