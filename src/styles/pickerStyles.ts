// ─── Picker field ─────────────────────────────────────────────────────────────
// Injected next to both stylesheets, because the picker is used during signup
// (authCss) and will be used inside the app (appCss).
export const pickerCss = `
  /* The field: reads like the inputs beside it, behaves like a button. The
     chevron points down, because what opens is a list, not a page. */
  .pick-field {
    width: 100%; min-height: 62px; padding: 0 16px; border: none; border-radius: var(--radius); cursor: pointer;
    display: flex; align-items: center; gap: 12px; text-align: left;
    background: var(--card); box-shadow: inset 0 0 0 2px var(--line);
    font-family: var(--font-body); font-size: var(--fs-lead); color: #8F958E;
    transition: transform 160ms var(--ease-out), box-shadow 140ms ease, background-color 140ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .pick-field.has { color: var(--ink); }
  .pick-field:active { transform: scale(.99); box-shadow: inset 0 0 0 3px var(--tanim); transition-duration: 90ms; }
  .pick-field:disabled { background: var(--paper-alt); color: #8F958E; cursor: default; box-shadow: inset 0 0 0 2px var(--line); }
  .pick-field:disabled:active { transform: none; }
  .pick-field-val { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pick-field-arrow { color: var(--text-soft); flex-shrink: 0; }
  .pick-field:disabled .pick-field-arrow { opacity: .4; }

  /* The sheet: nearly the full screen, because the list is the task. */
  .pick-sheet {
    width: 100%; height: 88%; background: var(--paper);
    border-radius: 24px 24px 0 0; display: flex; flex-direction: column; overflow: hidden;
  }
  .pick-head {
    flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 18px 16px 16px 20px; background: var(--tanim); border-radius: 24px 24px 0 0;
  }
  .pick-title { font-family: var(--font-display); font-size: var(--fs-lead); font-weight: 700; color: #fff; }
  /* Its own close and clear buttons: the app's versions live in appCss, which
     the signup screens never load, so borrowing them left bare boxes here. */
  .pick-close {
    width: 44px; height: 44px; flex-shrink: 0; border: none; border-radius: 50%; cursor: pointer;
    background: rgba(255,255,255,.2); color: #fff;
    display: flex; align-items: center; justify-content: center;
    transition: transform 160ms var(--ease-out), background-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .pick-close:active { transform: scale(.92); background: rgba(255,255,255,.34); transition-duration: 90ms; }
  .pick-clear {
    width: 34px; height: 34px; margin: -6px -4px -6px auto; flex-shrink: 0;
    border: none; border-radius: 50%; cursor: pointer;
    background: var(--paper-alt); color: var(--text-soft);
    display: flex; align-items: center; justify-content: center;
  }
  .pick-search {
    flex-shrink: 0; display: flex; align-items: center; gap: 10px; margin: 12px 16px 4px; padding: 12px 14px;
    background: var(--card); border-radius: 14px; box-shadow: inset 0 0 0 1.5px var(--line);
  }
  .pick-search input {
    flex: 1; min-width: 0; border: none; outline: none; background: none;
    font-family: var(--font-body); font-size: var(--fs-body); color: var(--ink);
  }
  .pick-search:focus-within { box-shadow: inset 0 0 0 2px var(--tanim); }

  .pick-list { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 8px 12px 20px; -webkit-overflow-scrolling: touch; }
  .pick-list::-webkit-scrollbar { width: 0; }
  /* 60px rows and 17px names: a list meant to be read at arm's length and
     hit without aiming. A native select gives about 36px and 14px. */
  .pick-row {
    position: relative; width: 100%; min-height: 60px; padding: 10px 14px; border: none; border-radius: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: space-between; gap: 12px; text-align: left;
    background: none; color: var(--ink); font-family: var(--font-body); font-size: 17px; line-height: 1.3;
    transition: background-color 160ms ease;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  }
  .pick-row:active { background: var(--paper-alt); transition-duration: 0ms; }
  .pick-row + .pick-row::before { content: ""; position: absolute; top: 0; left: 14px; right: 14px; height: 1px; background: var(--line); }
  .pick-row:active::before, .pick-row:active + .pick-row::before { opacity: 0; }
  /* The one already chosen: tinted, bold, ticked. Three signals, not one. */
  .pick-row.on { background: var(--tanim-sk); color: var(--tanim); font-weight: 700; }
  .pick-row.on::before, .pick-row.on + .pick-row::before { opacity: 0; }
  .pick-row.on svg { flex-shrink: 0; }
  .pick-none { padding: 28px 16px; text-align: center; font-size: var(--fs-body); color: var(--text-muted); line-height: 1.5; }

  @media (prefers-reduced-motion: reduce) {
    .pick-field:active, .pick-close:active { transform: none; }
  }
`;
