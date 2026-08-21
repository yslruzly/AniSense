// ─── AniSense design tokens ───────────────────────────────────────────────────
// One source of truth for both the pre-auth flow and the main app. Injected
// once at the root of App.tsx, before appCss and authCss.
//
// TYPE SCALE: five text sizes, two numeric. That's the whole set.
//   display 31 · title 23 · lead 19 · body 17 · label 16
//   num 40 · num-xl 76
// 16px is the floor. Nothing smaller ships, because the audience is 50–70.
// Icon and emoji sizing is deliberately NOT on this scale; icons are artwork,
// not text, and forcing them onto a type ramp makes them look arbitrary.
export const tokensCss = `
  @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&family=Source+Sans+3:wght@400;600;700&display=swap');

  :root {
    /* ── Colour ─────────────────────────────────────────────────────────── */
    --ink:        #16211B;   /* darkest surface, primary text */
    --ink-2:      #22302A;   /* raised panel on ink */
    --paper:      #FAF8F3;   /* app background */
    --paper-alt:  #F1EEE5;   /* recessed / secondary background */
    --card:       #FFFFFF;
    --line:       #DCD6C8;   /* hairline */
    --line-strong:#C7C1B2;

    --tanim:      #0B6B41;   /* primary action, positive movement (5.9:1 on paper) */
    --tanim-deep: #0F3524;
    --tanim-sk:   #E4F0E8;   /* selected / success surface */
    --palay:      #F2B32C;   /* accent on ink only; fails contrast on paper */
    --gold-text:  #8A5D0C;   /* the readable gold, for text and icons on paper */
    --gold-sk:    #FDF3DD;
    --gold-line:  #F0DCA6;

    --error:      #A5231B;
    --error-sk:   #FBEAE8;
    --error-line: #E9BDB8;

    --text:       #16211B;
    --text-soft:  #2E3833;
    --text-muted: #454F49;   /* 7.4:1 on paper */
    --text-faint: #6A736D;   /* 4.9:1 on paper, the lightest text allowed */

    /* ── Type ───────────────────────────────────────────────────────────── */
    --font-display: 'Lexend', system-ui, sans-serif;
    --font-body:    'Source Sans 3', system-ui, sans-serif;

    --fs-display: 31px;
    --fs-title:   23px;
    --fs-lead:    19px;
    --fs-body:    17px;
    --fs-label:   16px;
    --fs-num:     40px;
    --fs-num-xl:  76px;

    --lh-tight: 1.15;
    --lh-body:  1.5;

    /* ── Shape ──────────────────────────────────────────────────────────── */
    --radius-sm: 12px;
    --radius:    18px;
    --radius-lg: 24px;
    --radius-pill: 999px;

    /* ── Elevation ──────────────────────────────────────────────────────── */
    --shadow-sm: 0 2px 6px rgba(22,33,27,0.06);
    --shadow-md: 0 5px 14px rgba(22,33,27,0.09);
    --shadow-lg: 0 12px 28px rgba(22,33,27,0.14);

    /* ── Motion ─────────────────────────────────────────────────────────── */
    --ease-out: cubic-bezier(.23,1,.32,1);
    --ease-io:  cubic-bezier(.77,0,.175,1);

    /* ── Android safe areas ─────────────────────────────────────────────── */
    --safe-top:    env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);

    /* ── Legacy aliases ─────────────────────────────────────────────────────
       Older rules in appStyles still reference these names. They now resolve
       to the canonical tokens above, so the two halves of the app can never
       drift again. Prefer the canonical names in new code. */
    --green: var(--tanim);
    --green-deep: var(--tanim-deep);
    --green-mid: var(--tanim);
    --green-light: var(--tanim-sk);
    --green-bg: var(--tanim-sk);
    --lime: var(--palay);
    --gold: var(--gold-text);
    --gold-bg: var(--gold-sk);
    --red: var(--error);
    --red-light: var(--error-sk);
    --red-line: var(--error-line);
    --border: var(--line);
    --border-strong: var(--line-strong);
    --bg: var(--paper);
    --bg-alt: var(--paper-alt);
    --white: var(--card);
    --radius-lg-legacy: var(--radius-lg);
    /* The auth stylesheet asks for these short names. They were never defined,
       so every button, input, and card on those screens fell back to a 0
       radius and rendered square. */
    --r-md:   var(--radius);
    --r-lg:   var(--radius-lg);
    --r-pill: var(--radius-pill);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    height: 100%;
    font-family: var(--font-body);
    font-size: var(--fs-body);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }

  /* Everything structural uses Lexend; running text uses Source Sans 3. */
  .disp, h1, h2, h3, h4 { font-family: var(--font-display); }

  :focus-visible {
    outline: 3px solid var(--tanim);
    outline-offset: 3px;
    border-radius: 8px;
  }

  /* Reduced motion means fewer and gentler animations, not none. Blanket-zeroing
     every duration also kills the fades and colour transitions that aid
     comprehension, and strips press feedback, which makes the app feel broken
     rather than calm. Per-component handling lives with each component; this
     only caps anything that would otherwise run long. */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-iteration-count: 1 !important;
      animation-duration: 200ms !important;
      transition-duration: 160ms !important;
    }
  }
`;
