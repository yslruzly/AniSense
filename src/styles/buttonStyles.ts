// ─── Buttons ──────────────────────────────────────────────────────────────────
// One button system for the whole app, injected after both stylesheets so it
// dresses the classes that already exist rather than asking every screen to
// change.
//
// A flat fill with a flat shadow is what makes a button read as a coloured
// rectangle. A button that reads as a real, pressable object is built in
// layers, all of which the eye reads as one thing:
//
//   · a gradient down the fill, so the surface has a top and a bottom
//   · a light line along the top edge, where light would catch it
//   · a darker line along the bottom edge, its thickness
//   · a tight contact shadow, holding it to the surface
//
// No wide coloured glow: it reads as a halo rather than as light, and on a
// page of cards every glowing button competes with the content around it.
// Pressing collapses the stack: the button shrinks, the contact shadow
// tightens and the highlight dims, so it reads as pushed INTO the page
// rather than merely smaller. Press is 90ms (it must land before the finger
// lifts) and release is 190ms, because a symmetric button feels rubbery.
export const buttonCss = `
  /* Shared shape and motion for every filled button in the app. */
  .a-btn, .btn-primary, .btn-secondary, .btn-danger,
  .buy-now-btn, .add-cart-btn, .btn-call, .btn-details, .call-seller-btn,
  .cart-checkout-btn, .cart-empty-btn, .mp-sell-btn, .add-btn, .post-btn,
  .calc-use, .wid-btn, .prof-id-btn, .signout-btn, .hm-shop-btn, .pick-field {
    transition:
      transform 190ms var(--ease-out),
      box-shadow 190ms var(--ease-out),
      background-color 140ms ease,
      filter 140ms ease;
  }
  .a-btn:active, .btn-primary:active, .btn-secondary:active, .btn-danger:active,
  .buy-now-btn:active, .add-cart-btn:active, .btn-call:active, .btn-details:active,
  .call-seller-btn:active, .cart-checkout-btn:active, .cart-empty-btn:active,
  .mp-sell-btn:active, .add-btn:active, .post-btn:active, .calc-use:active,
  .wid-btn:active, .prof-id-btn:active, .signout-btn:active, .pick-field:active {
    transition-duration: 90ms;
  }

  /* ── Primary: the green ones ────────────────────────────────────────────── */
  .a-btn-green, .btn-primary, .buy-now-btn, .btn-call, .call-seller-btn,
  .cart-checkout-btn, .mp-sell-btn, .add-btn, .post-btn, .calc-use, .wid-btn.primary {
    background-image: linear-gradient(180deg, #14875A 0%, var(--tanim) 54%, #075232 100%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.26),
      inset 0 -1px 0 rgba(0,0,0,.24),
      inset 0 0 0 1px rgba(4,40,24,.22),
      0 1px 2px rgba(6,38,23,.30);
  }
  .a-btn-green:active, .btn-primary:active, .buy-now-btn:active, .btn-call:active,
  .call-seller-btn:active, .cart-checkout-btn:active, .mp-sell-btn:active,
  .add-btn:active, .post-btn:active, .calc-use:active, .wid-btn.primary:active {
    /* The contact shadow tightens and the top highlight dims: pressed in,
       not just smaller. */
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.12),
      inset 0 -1px 0 rgba(0,0,0,.28),
      inset 0 0 0 1px rgba(4,40,24,.26),
      0 1px 1px rgba(6,38,23,.34);
    filter: brightness(.97);
  }

  /* ── Gold: the accent action ────────────────────────────────────────────── */
  .a-btn-gold, .hm-shop-btn {
    background-image: linear-gradient(180deg, #FFCB5B 0%, var(--palay) 52%, #D79A11 100%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.55),
      inset 0 -1px 0 rgba(120,78,0,.3),
      inset 0 0 0 1px rgba(120,78,0,.22),
      0 1px 2px rgba(95,62,0,.24);
  }
  .a-btn-gold:active, .hm-shop-btn:active {
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.3),
      inset 0 -1px 0 rgba(120,78,0,.34),
      inset 0 0 0 1px rgba(120,78,0,.26),
      0 1px 1px rgba(95,62,0,.28);
    filter: brightness(.98);
  }

  /* ── Danger ─────────────────────────────────────────────────────────────── */
  .btn-danger {
    background-image: linear-gradient(180deg, #BE3229 0%, var(--error) 54%, #7E1611 100%);
    color: #fff;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.22),
      inset 0 -1px 0 rgba(0,0,0,.26),
      inset 0 0 0 1px rgba(60,10,6,.24),
      0 1px 2px rgba(60,10,6,.3);
  }
  .btn-danger:active {
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.1),
      inset 0 -1px 0 rgba(0,0,0,.3),
      inset 0 0 0 1px rgba(60,10,6,.28),
      0 1px 1px rgba(60,10,6,.34);
    filter: brightness(.97);
  }

  /* ── Secondary: white, on paper ─────────────────────────────────────────── */
  /* A hairline plus a whisper of a shadow. It has to sit beside the primary
     without competing, and still look raised rather than drawn on. */
  .btn-secondary, .btn-details, .cart-empty-btn, .pick-field {
    background-image: linear-gradient(180deg, #FFFFFF 0%, #F5F7F5 100%);
    box-shadow:
      inset 0 1px 0 #FFFFFF,
      inset 0 0 0 1px rgba(22,33,27,.13),
      0 1px 2px rgba(22,33,27,.10);
  }
  .btn-secondary:active, .btn-details:active, .cart-empty-btn:active, .pick-field:active {
    background-image: linear-gradient(180deg, #F3F5F3 0%, #EAEDEA 100%);
    box-shadow:
      inset 0 1px 2px rgba(22,33,27,.12),
      inset 0 0 0 1px rgba(22,33,27,.16),
      0 1px 1px rgba(22,33,27,.08);
  }
  /* The picker field keeps its green focus ring when open. */
  .pick-field:active { box-shadow: inset 0 0 0 2px var(--tanim), inset 0 1px 2px rgba(22,33,27,.1); }

  /* ── Tonal: green on green, the quieter half of a pair ──────────────────── */
  .add-cart-btn {
    background-image: linear-gradient(180deg, #E3F1E8 0%, #CFE6D9 100%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.8),
      inset 0 0 0 1px rgba(11,107,65,.2),
      0 1px 2px rgba(11,107,65,.12);
  }
  .add-cart-btn:active {
    background-image: linear-gradient(180deg, #D3E7DB 0%, #C2DCCC 100%);
    box-shadow: inset 0 1px 2px rgba(11,107,65,.18), inset 0 0 0 1px rgba(11,107,65,.24);
  }
  .add-cart-btn.in-cart {
    background-image: linear-gradient(180deg, #FFFFFF 0%, #F5F7F5 100%);
    box-shadow:
      inset 0 1px 0 #FFFFFF,
      inset 0 0 0 1px rgba(22,33,27,.13),
      0 1px 2px rgba(22,33,27,.10);
  }

  /* ── Glass: buttons that sit on ink or on a photograph ──────────────────── */
  .a-btn-ghost-ink, .wid-btn.ghost, .prof-id-btn {
    background-image: linear-gradient(180deg, rgba(255,255,255,.2) 0%, rgba(255,255,255,.08) 100%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.34),
      inset 0 0 0 1px rgba(255,255,255,.22),
      0 1px 2px rgba(0,0,0,.25);
    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  }
  .a-btn-ghost-ink:active, .wid-btn.ghost:active, .prof-id-btn:active {
    background-image: linear-gradient(180deg, rgba(255,255,255,.26) 0%, rgba(255,255,255,.14) 100%);
    box-shadow: inset 0 1px 2px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.26);
  }

  /* ── Sign out: solid red ────────────────────────────────────────────────
     The same layers as the green buttons - a gradient with a top and a
     bottom, a highlight where light catches the top edge, a darker line for
     its thickness, a contact shadow - in the app's error red, so it reads as
     the same family of object with the one colour that means "leaving". */
  .signout-btn {
    color: #fff; min-height: 54px;
    font-family: var(--font-display); font-size: 16px; letter-spacing: -.005em;
    background-image: linear-gradient(180deg, #C8392E 0%, var(--error) 55%, #861A13 100%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.24),
      inset 0 -1px 0 rgba(0,0,0,.24),
      inset 0 0 0 1px rgba(80,10,6,.24),
      0 1px 2px rgba(80,10,6,.30),
      0 10px 20px -12px rgba(120,20,14,.55);
  }
  .signout-btn:active {
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.12),
      inset 0 -1px 0 rgba(0,0,0,.28),
      inset 0 0 0 1px rgba(80,10,6,.28),
      0 1px 1px rgba(80,10,6,.34),
      0 4px 10px -8px rgba(120,20,14,.5);
  }

  /* ── Round icon buttons: the same stack, in a disc ──────────────────────── */
  .a-iconbtn.on-paper, .calc-close, .pick-clear {
    background-image: linear-gradient(180deg, #FFFFFF 0%, #F3F5F3 100%);
    box-shadow:
      inset 0 1px 0 #FFFFFF,
      inset 0 0 0 1px rgba(22,33,27,.13),
      0 1px 2px rgba(22,33,27,.12);
  }
  .a-iconbtn.on-paper:active, .calc-close:active {
    background-image: linear-gradient(180deg, #EFF1EF 0%, #E6E9E6 100%);
    box-shadow: inset 0 1px 2px rgba(22,33,27,.14), inset 0 0 0 1px rgba(22,33,27,.16);
  }

  /* ── Disabled: flat on purpose ──────────────────────────────────────────── */
  /* Everything above is what "pressable" looks like here, so a button that
     can't be pressed drops all of it: no gradient, no lift, no glow. */
  .a-btn:disabled, .btn-primary:disabled, .btn-secondary:disabled, .btn-danger:disabled,
  .buy-now-btn:disabled, .add-cart-btn:disabled, .btn-call:disabled, .btn-details:disabled,
  .cart-checkout-btn:disabled, .mp-sell-btn:disabled, .add-btn:disabled, .post-btn:disabled,
  .calc-use:disabled, .wid-btn:disabled, .pick-field:disabled {
    background-image: none;
    background-color: #E3E5E3;
    color: #8B9089;
    box-shadow: inset 0 0 0 1px rgba(22,33,27,.10);
    filter: none;
  }
  /* Icons inside a disabled button follow the same grey as its text, rather
     than staying in their own colour. */
  .a-btn:disabled svg, .btn-primary:disabled svg, .buy-now-btn:disabled svg,
  .mp-sell-btn:disabled svg, .add-btn:disabled svg, .post-btn:disabled svg,
  .cart-checkout-btn:disabled svg, .calc-use:disabled svg, .wid-btn:disabled svg { color: #8B9089; }
  .pick-field:disabled { background-color: var(--paper-alt); color: #8F958E; box-shadow: inset 0 0 0 2px var(--line); }
  /* Busy is not disabled: a button that is working keeps its colour and its
     lift, it just stops taking new taps. */
  .a-btn.a-btn-green[aria-busy="true"]:disabled,
  .cart-checkout-btn[aria-busy="true"]:disabled {
    background-image: linear-gradient(180deg, #14875A 0%, var(--tanim) 54%, #075232 100%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.2),
      inset 0 -1px 0 rgba(0,0,0,.2),
      0 1px 2px rgba(6,38,23,.26);
  }

  /* ── Choice cards ────────────────────────────────────────────────────────
     Farmer / Buyer and the crop tiles: everything you pick
     from rather than press once. They were a flat white box that grew a 3px
     green outline when chosen, which reads as a highlighter mark drawn on
     top rather than as the card itself changing.

     Now they're built from the same layers as the buttons. Unchosen: white
     with a hairline and a whisper of a shadow, so the card sits ON the page.
     Chosen: the fill turns green, the ring thickens into part of the card,
     the whole thing lifts 1px and casts a soft green shadow. Nothing is
     drawn over it; the object itself has changed state. */
  .a-role, .a-crop, .crop-pick, .crop-toggle {
    background-image: linear-gradient(180deg, #FFFFFF 0%, #F7F9F7 100%);
    box-shadow:
      inset 0 1px 0 #FFFFFF,
      inset 0 0 0 1.5px rgba(22,33,27,.13),
      0 1px 2px rgba(22,33,27,.09);
    transition:
      transform 190ms var(--ease-out),
      box-shadow 190ms var(--ease-out),
      background-color 180ms ease,
      background-image 180ms ease;
  }
  /* The press is the same everywhere: in fast, out slow. */
  .a-role:active, .a-crop:active, .crop-pick:active, .crop-toggle:active {
    transform: scale(.985);
    box-shadow:
      inset 0 1px 2px rgba(22,33,27,.1),
      inset 0 0 0 1.5px rgba(22,33,27,.16);
    transition-duration: 90ms;
  }
  .a-role.on, .a-crop.on, .crop-pick.on, .crop-toggle.on {
    background-image: linear-gradient(180deg, #E4F1E9 0%, #D2E7DA 100%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.85),
      inset 0 0 0 2px var(--tanim),
      0 2px 4px rgba(11,107,65,.16),
      0 10px 20px -14px rgba(11,107,65,.8);
    transform: translateY(-1px);
  }
  .a-role.on:active, .a-crop.on:active,
  .crop-pick.on:active, .crop-toggle.on:active {
    transform: translateY(-1px) scale(.985);
    box-shadow: inset 0 1px 2px rgba(11,107,65,.2), inset 0 0 0 2px var(--tanim);
  }
  /* The list variants set their own shadow, so they get the same treatment
     with their lift kept. */
  .a-rolelist .a-role.on {
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.85),
      inset 0 0 0 2px var(--tanim),
      0 2px 4px rgba(11,107,65,.16),
      0 10px 20px -14px rgba(11,107,65,.8);
  }

  /* The tick: an empty ring while unchosen, a green disc with a white check
     once picked. It pops in slightly past full size and settles, which is
     the one place a little overshoot belongs: it's the answer to a tap. */
  .a-tick {
    background-image: linear-gradient(180deg, #FFFFFF 0%, #F4F6F4 100%);
    box-shadow: inset 0 0 0 2px rgba(22,33,27,.18), inset 0 1px 0 #fff;
  }
  .a-role.on .a-tick {
    background-image: linear-gradient(180deg, #17915F 0%, var(--tanim) 60%, #075232 100%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.3),
      inset 0 0 0 1px rgba(4,40,24,.3),
      0 2px 5px rgba(11,107,65,.4);
    animation: tick-pop 260ms var(--ease-out);
  }
  @keyframes tick-pop {
    0% { transform: scale(.7); }
    60% { transform: scale(1.06); }
    100% { transform: scale(1); }
  }
  /* The icon tile inside a chosen card goes white, so the card's new green
     has something to sit against. */
  .a-role.on .a-role-ico {
    background: #fff;
    box-shadow: inset 0 0 0 1px rgba(11,107,65,.18), 0 1px 3px rgba(11,107,65,.18);
  }

  @media (prefers-reduced-motion: reduce) {
    /* The press still answers, it just stops moving: the shadow collapse
       alone is enough to read as a press. */
    .a-btn:active, .btn-primary:active, .btn-secondary:active, .btn-danger:active,
    .buy-now-btn:active, .add-cart-btn:active, .btn-call:active, .btn-details:active,
    .cart-checkout-btn:active, .mp-sell-btn:active, .add-btn:active, .post-btn:active,
    .calc-use:active, .wid-btn:active, .prof-id-btn:active, .signout-btn:active,
    .pick-field:active { transform: none; }
    .a-role.on, .a-crop.on, .crop-pick.on, .crop-toggle.on { transform: none; }
    .a-role:active, .a-crop:active, .crop-pick:active, .crop-toggle:active,
    .a-role.on:active, .a-crop.on:active { transform: none; }
    .a-role.on .a-tick { animation: none; }
  }
`;
