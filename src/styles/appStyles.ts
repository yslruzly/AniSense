export const appCss = `
  /* Tokens (colour, type ramp, radii, motion) live in styles/tokens.ts,
     injected once at the root of App.tsx. */






  /* ── Shell ── */
  .shell {
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
      padding-top: var(--safe-top);
      padding-bottom: var(--safe-bottom);
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

  /* ── Header ── */
  .hdr {
    height: 66px; background: var(--white); flex-shrink: 0;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 18px; border-bottom: 1px solid var(--border);
  }
  .hdr-brand { display: flex; align-items: center; gap: 11px; }
  .hdr-icon { font-size: 23px; }
  .hdr-title { font-family: var(--font-display); font-size: var(--fs-body); font-weight: 700; color: var(--text); line-height: 1.15; }
  .hdr-sub   { font-size: var(--fs-label); color: var(--text-muted); margin-top: 1px; }
  .hdr-right { display: flex; align-items: center; gap: 12px; }
  .notif { font-size: var(--fs-lead); position: relative; cursor: pointer; }
  .nbadge {
    position: absolute; top: -5px; right: -5px;
    background: var(--red); color: #fff; font-size: var(--fs-label); font-weight: 700;
    border-radius: 99px; padding: 1px 4px; min-width: 15px; text-align: center;
  }
  .ava {
    width: 34px; height: 34px; border-radius: 50%;
    background: var(--tanim);
    color:#fff; font-size: var(--fs-label); font-weight:700;
    display:flex; align-items:center; justify-content:center;
    border: 2px solid var(--tanim-sk); transition: box-shadow 0.15s; cursor: pointer;
  }
  .ava:hover { box-shadow: 0 0 0 3px var(--line); }

  /* ── Scroll ── */
  .scroll {
    flex: 1; overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 14px; padding-bottom: 10px;
  }
  .scroll > * { flex-shrink: 0; }
  .scroll::-webkit-scrollbar { display: none; }

  /* ── Card ── */
  .card { background: var(--white); border-radius: var(--radius); padding: 16px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
  .card-title { font-size: var(--fs-label); font-weight: 700; color: var(--text); margin-bottom: 13px; }

  /* ── Grid 2 ── */
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }

  /* ── Stat card ── */
  .stat-ico { font-size: 21px; margin-bottom: 6px; }
  .stat-chg { font-size: var(--fs-label); font-weight: 600; color: var(--green); margin-bottom: 3px; }
  .stat-val { font-size: var(--fs-lead); font-weight: 800; color: var(--text); }
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

  .sec-title { font-family: var(--font-display); font-size: var(--fs-lead); font-weight: 700; color: var(--text); }
  .sec-sub   { font-size: var(--fs-label); color: var(--text-muted); margin-top: 2px; }

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
  .mkt-row {
    display:flex; align-items:center; gap:12px; padding:13px 14px;
    border-radius:14px; background:var(--white); border:1px solid var(--paper-alt);
    border-left:4px solid transparent;
  }
  .mkt-row.up   { border-left-color:var(--tanim); }
  .mkt-row.down { border-left-color:var(--error); }
  .mkt-row-ico  { width:42px; height:42px; border-radius:12px; background:var(--green-bg); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .mkt-row-name { font-size: var(--fs-label); font-weight:700; color:var(--text); }
  .mkt-row-unit { font-size: var(--fs-label); color:var(--text-muted); margin-top:1px; }
  .mkt-row-right { margin-left:auto; text-align:right; flex-shrink:0; }
  .mkt-row-price { font-size: var(--fs-body); font-weight:800; color:var(--text); }
  .mkt-row-chg { font-size: var(--fs-label); font-weight:700; display:flex; align-items:center; gap:3px; justify-content:flex-end; margin-top:3px; }

  /* ── Chart ── */
  .chart-svg { width:100%; height:auto; }
  .legend { display:flex; gap:16px; justify-content:center; margin-top:9px; }
  .leg-item { display:flex; align-items:center; gap:5px; font-size: var(--fs-label); color:var(--text-muted); font-weight:600; }
  .leg-dot  { width:9px; height:9px; border-radius:50%; }

  /* ── Bottom nav ── */
  .bnav {
    height: 76px; background: var(--white); border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-around; flex-shrink: 0;
    padding: 0 4px;
  }
  .ntab {
    flex:1; display:flex; flex-direction:column; align-items:center; gap:3px;
    background:none; border:none; cursor:pointer; padding:9px 2px; border-radius:14px;
    margin: 0 2px; transition: background 0.15s;
  }
  .ntab-ico { font-size:21px; display:flex; }
  .ntab-lbl { font-size: var(--fs-label); font-weight:600; color:var(--text-muted); }
  .ntab.on { background: var(--green-bg); }
  .ntab.on .ntab-lbl { color:var(--green); font-weight:700; }

  /* ── Expenses ── */
  .exp-hero { background: var(--tanim); border-radius:var(--radius); padding:26px 18px; color:#fff; text-align:center; }
  .exp-total-lbl { font-size: var(--fs-label); opacity:.85; margin-bottom:6px; font-weight:500; }
  .exp-total { font-family: var(--font-display); font-size: var(--fs-display); font-weight:700; }

  .frow { display:flex; gap:8px; overflow-x:auto; padding-bottom:2px; flex-shrink:0; }
  .frow::-webkit-scrollbar { display:none; }
  .fchip { flex-shrink:0; background:var(--white); border:1.5px solid var(--border); border-radius:99px; padding:7px 14px; font-size: var(--fs-label); font-weight:600; color:var(--text-muted); cursor:pointer; font-family:inherit; }
  .fchip.on { background:var(--green); border-color:var(--green); color:#fff; }

  .exp-row { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--border); }
  .exp-row:last-child { border-bottom:none; }
  .exp-ico { width:40px; height:40px; border-radius:12px; background:var(--green-bg); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .exp-desc { font-size: var(--fs-label); font-weight:600; color:var(--text); }
  .exp-meta { font-size: var(--fs-label); color:var(--text-muted); margin-top:2px; }
  .exp-amt  { font-size: var(--fs-label); font-weight:700; color:var(--text); margin-left:auto; }
  .add-btn  { width:100%; padding:15px; background:var(--green); color:#fff; border:none; border-radius:var(--radius); font-family:inherit; font-size: var(--fs-label); font-weight:700; cursor:pointer; }

  /* ── Analytics ── */
  .bar-row { display:flex; align-items:center; gap:9px; margin-bottom:11px; }
  .bar-lbl { font-size: var(--fs-label); font-weight:600; color:var(--text); width:64px; flex-shrink:0; }
  .bar-track { flex:1; height:10px; background:var(--bg-alt); border-radius:99px; overflow:hidden; }
  .bar-fill  { height:100%; border-radius:99px; }
  .bar-val   { font-size: var(--fs-label); color:var(--text-muted); width:44px; text-align:right; flex-shrink:0; }

  .perf-grid { display:grid; grid-template-columns:1fr 1fr; gap:9px; }
  .perf-card { border-radius:14px; padding:13px; text-align:center; }
  .perf-name  { font-size: var(--fs-label); font-weight:600; color:var(--text-muted); margin-bottom:4px; }
  .perf-price { font-size: var(--fs-body); font-weight:800; color:var(--text); }
  .perf-chg   { font-size: var(--fs-label); font-weight:700; margin-top:3px; }

  .sum-row { display:flex; justify-content:space-around; }
  .sum-val { font-size: var(--fs-lead); font-weight:800; color:var(--tanim); }
  .sum-lbl { font-size: var(--fs-label); color:var(--text-muted); margin-top:3px; text-align:center; }

  /* ── Marketplace ── */
  .mp-title-row { display:flex; align-items:flex-start; justify-content:space-between; }
  .mp-title { font-family: var(--font-display); font-size: var(--fs-title); font-weight:700; color:var(--text); }
  .mp-sub   { font-size: var(--fs-label); color:var(--text-muted); margin-top:3px; max-width:170px; line-height:1.45; }
  .post-btn { background:var(--text); color:#fff; border:none; border-radius:11px; padding:11px 15px; font-family:inherit; font-size: var(--fs-label); font-weight:700; cursor:pointer; flex-shrink:0; }

  .search-box { display:flex; align-items:center; gap:9px; background:var(--white); border:1.5px solid var(--border); border-radius:13px; padding:12px 14px; }
  .search-box input { border:none; outline:none; font-family:inherit; font-size: var(--fs-label); color:var(--text); flex:1; background:transparent; }
  .search-box input::placeholder { color:var(--text-faint); }

  .mp-filter-row { display:flex; flex-direction:column; gap:7px; }
  .cat-tabs { display:grid; grid-template-columns:repeat(3,1fr); gap:9px; }
  .cat-tab {
    padding:14px 6px; border-radius:16px; border:2px solid var(--border);
    background:var(--white); font-family:inherit; font-size: var(--fs-label); font-weight:700;
    color:var(--text-muted); cursor:pointer; display:flex; flex-direction:column;
    align-items:center; gap:8px; text-align:center; line-height:1.25;
    box-shadow:var(--shadow-sm);
  }
  .cat-tab.active { background:var(--tanim-sk); border-color:var(--tanim); color:var(--tanim); }
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
  .listing-ico  { width:54px; height:54px; border-radius:15px; background:var(--green-bg); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .listing-name { font-family: var(--font-display); font-size: var(--fs-lead); font-weight:700; color:var(--text); line-height:1.25; }
  .listing-var  { font-size: var(--fs-label); color:var(--text-muted); margin-top:3px; font-weight:500; }
  .listing-price{ font-size: var(--fs-lead); font-weight:800; color:var(--text); white-space:nowrap; }
  .listing-desc { font-size: var(--fs-label); color:var(--text-muted); line-height:1.65; margin-bottom:11px; }
  .listing-meta { display:flex; justify-content:space-between; font-size: var(--fs-label); color:var(--text-muted); font-weight:600; margin-bottom:13px; background:var(--paper); padding:10px 13px; border-radius:11px; }
  .seller-row   { display:flex; align-items:center; gap:11px; margin-bottom:15px; padding:11px 13px; background:var(--paper); border-radius:13px; }
  .seller-ava   { width:44px; height:44px; border-radius:50%; background:var(--tanim); display:flex; align-items:center; justify-content:center; font-size: var(--fs-label); font-weight:800; color:#fff; flex-shrink:0; }
  .seller-name  { font-size: var(--fs-label); font-weight:700; color:var(--text); }
  .seller-stars { font-size: var(--fs-label); color:var(--gold-text); font-weight:700; margin-top:3px; display:flex; align-items:center; gap:3px; }
  .seller-loc   { font-size: var(--fs-label); color:var(--text-muted); display:flex; align-items:center; gap:3px; margin-left:auto; }
  .listing-btns { display:flex; gap:11px; }
  .btn-call     { flex:1; background:var(--green); color:#fff; border:none; border-radius:13px; padding:17px; font-family:inherit; font-size: var(--fs-body); font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; }
  .btn-details  { flex:1; background:var(--white); color:var(--text); border:2px solid var(--border); border-radius:13px; padding:17px; font-family:inherit; font-size: var(--fs-body); font-weight:800; cursor:pointer; }
  .empty-msg    { text-align:center; color:var(--text-faint); padding:44px 16px; font-size: var(--fs-body); font-weight:600; line-height:1.6; }

  /* ── Cart ── */
  .cart-badge-wrap { position:relative; }
  .cart-badge {
    position:absolute; top:-6px; right:-6px;
    background:var(--error); color:#fff; font-size: var(--fs-label); font-weight:800;
    border-radius:99px; padding:1px 5px; min-width:17px; text-align:center; line-height:1.6;
  }
  .cart-btn-icon {
    width:36px; height:36px; border-radius:50%; background:var(--tanim-sk); border:2px solid var(--tanim-sk);
    display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0;
  }
  .cart-drawer {
    position:absolute; inset:0; background:rgba(30,22,12,0.55);
    display:flex; align-items:flex-end; z-index:60;
  }
  .cart-sheet {
    background:var(--paper); border-radius:26px 26px 0 0;
    width:100%; max-height:88%; display:flex; flex-direction:column;
  }
  .cart-sheet-hdr {
    background: var(--tanim);
    border-radius:26px 26px 0 0;
    padding:20px 22px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
  }
  .cart-item-row {
    display:flex; gap:13px; align-items:flex-start;
    padding:15px 17px; border-bottom:1px solid var(--paper-alt); background:#fff;
  }
  .cart-item-ico { width:46px; height:46px; border-radius:13px; background:var(--tanim-sk); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .cart-item-name { font-size: var(--fs-label); font-weight:700; color:var(--text); }
  .cart-item-seller { font-size: var(--fs-label); color:var(--text-muted); margin-top:2px; }
  .cart-item-price { font-size: var(--fs-label); font-weight:800; color:var(--tanim); margin-top:4px; }
  .cart-qty-row { display:flex; align-items:center; gap:9px; margin-top:7px; }
  .cart-qty-btn {
    width:30px; height:30px; border-radius:9px; border:2px solid var(--line);
    background:var(--paper); font-size: var(--fs-body); font-weight:800; color:var(--text-soft);
    display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0;
  }
  .cart-qty-btn:hover { background:var(--line); }
  .cart-qty-val { font-size: var(--fs-label); font-weight:800; color:var(--text); min-width:34px; text-align:center; }
  .cart-qty-unit { font-size: var(--fs-label); color:var(--text-muted); font-weight:600; }
  .cart-remove-btn { background:var(--error-sk); border:none; border-radius:9px; width:30px; height:30px; cursor:pointer; display:flex; align-items:center; justify-content:center; margin-left:auto; flex-shrink:0; }
  .cart-footer { padding:18px; border-top:1px solid var(--line); background:#fff; flex-shrink:0; }
  .cart-total-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; }
  .cart-total-lbl { font-size: var(--fs-label); font-weight:600; color:var(--text-muted); }
  .cart-total-val { font-size: var(--fs-title); font-weight:900; color:var(--text); }
  .cart-checkout-btn {
    width:100%; padding:18px; background:var(--tanim); color:#fff; border:none;
    border-radius:16px; font-family:inherit; font-size: var(--fs-body); font-weight:800;
    cursor:pointer; box-shadow:var(--shadow-md);
  }
  .cart-empty { text-align:center; padding:44px 20px; }
  .cart-empty-ico { display:flex; align-items:center; justify-content:center; margin-bottom:13px; }
  .cart-empty-txt { font-size: var(--fs-body); font-weight:700; color:var(--text-soft); }
  .cart-empty-sub { font-size: var(--fs-label); color:var(--text-faint); margin-top:5px; }
  .add-cart-btn {
    flex:1; background:var(--tanim); color:#fff; border:none; border-radius:13px; padding:17px;
    font-family:inherit; font-size: var(--fs-label); font-weight:800; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .add-cart-btn.in-cart { background:var(--tanim-sk); color:var(--tanim); border:2px solid var(--line); }
  .qty-picker-row { display:flex; align-items:center; gap:11px; background:var(--paper); border-radius:13px; padding:11px 15px; border:1.5px solid var(--line); }
  .qty-pick-btn { width:36px; height:36px; border-radius:10px; border:2px solid var(--line); background:#fff; font-size: var(--fs-lead); font-weight:800; color:var(--text-soft); display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
  .qty-pick-btn:hover { background:var(--line); }
  .qty-pick-val { flex:1; text-align:center; font-size: var(--fs-body); font-weight:800; color:var(--text); }
  .qty-pick-unit { font-size: var(--fs-label); color:var(--text-muted); font-weight:600; }
  .checkout-success {
    position:absolute; inset:0; background:rgba(30,22,12,0.6);
    display:flex; align-items:center; justify-content:center; z-index:70;
  }
  .checkout-card {
    background:#fff; border-radius:26px; padding:38px 28px; text-align:center; margin:24px; width:100%; max-width:320px;
  }

  /* ── Seller Details Modal ── */
  .seller-modal-overlay {
    position:absolute; inset:0; background:rgba(30,22,12,0.6);
    display:flex; align-items:flex-end; z-index:70;
  }
  .seller-modal-sheet {
    background:var(--paper); border-radius:30px 30px 0 0;
    width:100%; max-height:90%; display:flex; flex-direction:column;
    overflow:hidden;
  }
  .seller-modal-hero {
    background: var(--tanim);
    padding:26px 22px 22px; flex-shrink:0;
  }
  .seller-modal-ava {
    width:70px; height:70px; border-radius:50%;
    background:rgba(255,255,255,0.25); border:3px solid rgba(255,255,255,0.6);
    display:flex; align-items:center; justify-content:center;
    font-size: var(--fs-title); font-weight:900; color:#fff; margin-bottom:13px;
  }
  .seller-modal-name { font-family: var(--font-display); font-size: var(--fs-title); font-weight:700; color:#fff; margin-bottom:4px; }
  .seller-modal-sub  { font-size: var(--fs-label); color:rgba(255,255,255,0.85); }
  .seller-modal-stats {
    display:grid; grid-template-columns:repeat(3,1fr); gap:11px;
    padding:18px 18px; background:#fff; border-bottom:1px solid var(--paper-alt); flex-shrink:0;
  }
  .sms-item { text-align:center; }
  .sms-val  { font-size: var(--fs-lead); font-weight:900; color:var(--text); }
  .sms-lbl  { font-size: var(--fs-label); color:var(--text-muted); margin-top:3px; font-weight:600; }
  .seller-modal-body { flex:1; overflow-y:auto; padding:18px; display:flex; flex-direction:column; gap:15px; }
  .sdm-row { display:flex; align-items:center; gap:15px; padding:14px 15px; background:#fff; border-radius:15px; border:1px solid var(--paper-alt); }
  .sdm-ico { width:44px; height:44px; border-radius:13px; background:var(--tanim-sk); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .sdm-lbl { font-size: var(--fs-label); color:var(--text-muted); font-weight:600; margin-bottom:2px; }
  .sdm-val { font-size: var(--fs-label); font-weight:700; color:var(--text); }
  .sdm-bio { background:#fff; border-radius:15px; padding:15px; border:1px solid var(--paper-alt); font-size: var(--fs-label); color:var(--text-soft); line-height:1.75; }
  .sdm-crops { display:flex; gap:8px; flex-wrap:wrap; margin-top:9px; }
  .sdm-crop-tag { background:var(--tanim-sk); border:1px solid var(--line); color:var(--tanim); font-size: var(--fs-label); font-weight:700; border-radius:99px; padding:5px 12px; }
  .star-fill { color:var(--gold-text); }
  .seller-modal-footer { padding:18px; background:#fff; border-top:1px solid var(--line); flex-shrink:0; }
  .call-seller-btn {
    width:100%; padding:18px; background:var(--tanim); color:#fff; border:none;
    border-radius:16px; font-family:inherit; font-size: var(--fs-body); font-weight:800;
    cursor:pointer; display:flex; align-items:center; justify-content:center; gap:9px;
    box-shadow:var(--shadow-md);
  }

  /* ── Weather ── */
  .wx-hero { background: var(--tanim-deep); border-radius:var(--radius); padding:28px 18px; color:#fff; text-align:center; }
  .wx-ico  { font-size:50px; margin-bottom:7px; }
  .wx-temp { font-family: var(--font-display); font-size: var(--fs-num); font-weight:700; }
  .wx-cond { font-size: var(--fs-body); opacity:.92; margin-top:4px; font-weight:500; }
  .wx-loc  { font-size: var(--fs-label); opacity:.75; margin-top:7px; }

  .fc-row  { display:flex; justify-content:space-between; }
  .fc-item { text-align:center; flex:1; }
  .fc-day  { font-size: var(--fs-label); font-weight:700; color:var(--text-muted); margin-bottom:6px; }
  .fc-ico  { font-size:21px; margin-bottom:4px; }
  .fc-hi   { font-size: var(--fs-label); font-weight:700; color:var(--text); }
  .fc-lo   { font-size: var(--fs-label); color:var(--text-muted); }

  .adv-item { display:flex; gap:9px; align-items:flex-start; padding:11px 13px; border-radius:12px; font-size: var(--fs-label); font-weight:500; line-height:1.55; margin-bottom:9px; }
  .adv-item:last-child { margin-bottom:0; }
  .adv-good { background:var(--green-bg); color:var(--tanim-deep); }
  .adv-warn { background:var(--gold-sk); color:var(--gold-text); }
  .adv-info { background:var(--paper-alt); color:var(--tanim-deep); }

  /* ── LSTM Forecast ── */
  .lstm-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:13px; }
  .lstm-badge { background:var(--ink); color:var(--palay); font-size: var(--fs-label); font-weight:700; padding:4px 9px; border-radius:99px; letter-spacing:0.5px; }
  .lstm-acc   { font-size: var(--fs-label); color:var(--text-muted); }
  .lstm-acc span { color:var(--tanim); font-weight:700; }

  .lstm-crop-tabs { display:flex; gap:7px; overflow-x:auto; margin-bottom:15px; padding-bottom:2px; flex-shrink:0; }
  .lstm-crop-tabs::-webkit-scrollbar { display:none; }
  .lstm-tab { flex-shrink:0; padding:6px 13px; border-radius:99px; border:1.5px solid var(--border); background:var(--bg); font-family:inherit; font-size: var(--fs-label); font-weight:600; color:var(--text-muted); cursor:pointer; }
  .lstm-tab.on { background:var(--ink); border-color:var(--ink); color:#fff; }

  .lstm-summary { display:grid; grid-template-columns:repeat(3,1fr); gap:9px; margin-bottom:15px; }
  .lstm-sum-item { background:var(--bg); border-radius:12px; padding:10px 9px; text-align:center; }
  .lstm-sum-val  { font-size: var(--fs-label); font-weight:800; color:var(--text); }
  .lstm-sum-lbl  { font-size: var(--fs-label); color:var(--text-muted); margin-top:3px; line-height:1.35; }

  .lstm-trend-up   { color:var(--tanim); }
  .lstm-trend-down { color:var(--error); }
  .lstm-trend-stable { color:var(--gold-text); }

  .lstm-forecast-row { display:flex; gap:6px; overflow-x:auto; padding-bottom:4px; margin-bottom:13px; flex-shrink:0; }
  .lstm-forecast-row::-webkit-scrollbar { display:none; }
  .lstm-day-card { flex-shrink:0; text-align:center; padding:9px 7px; border-radius:12px; min-width:46px; }
  .lstm-day-card.future { background:var(--paper-alt); border:1px solid var(--line); }
  .lstm-day-card.past   { background:var(--bg); border:1px solid var(--border); }
  .lstm-day-card.now    { background:var(--ink); border:1px solid var(--ink); }
  .lstm-day-lbl  { font-size: var(--fs-label); font-weight:700; color:var(--text-muted); margin-bottom:5px; }
  .lstm-day-card.now .lstm-day-lbl { color:var(--palay); }
  .lstm-day-price { font-size: var(--fs-label); font-weight:800; color:var(--text); }
  .lstm-day-card.now .lstm-day-price { color:#fff; }
  .lstm-day-card.future .lstm-day-price { color:var(--ink-2); }
  .lstm-day-dot  { font-size:8px; margin-top:3px; }

  .lstm-note { font-size: var(--fs-label); color:var(--text-faint); line-height:1.55; padding:9px 11px; background:var(--bg); border-radius:10px; border-left:3px solid var(--palay); }

  /* ── Profile ── */
  .prof-hero {
    background: var(--ink);
    padding: 32px 18px 26px; display: flex; flex-direction: column; align-items: center;
    color: #fff; flex-shrink: 0;
  }
  .prof-ava-wrap { position: relative; margin-bottom: 13px; }
  .prof-ava {
    width: 82px; height: 82px; border-radius: 50%;
    background: var(--lime); border: none;
    display: flex; align-items: center; justify-content: center;
    font-size: var(--fs-display); font-weight: 800; color: var(--ink);
  }
  .prof-edit-btn {
    position: absolute; bottom: 0; right: 0; width: 27px; height: 27px;
    border-radius: 50%; background: #fff; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: var(--fs-label);
  }
  .prof-name  { font-family: var(--font-display); font-size: var(--fs-lead); font-weight: 700; margin-bottom: 3px; }
  .prof-role  { font-size: var(--fs-label); opacity: .85; margin-bottom: 11px; }
  .prof-crops { display: flex; gap: 7px; flex-wrap: wrap; justify-content: center; }
  .crop-tag   { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); border-radius: 99px; padding: 4px 11px; font-size: var(--fs-label); font-weight: 600; color: #fff; }

  .info-row { display: flex; align-items: center; gap: 13px; padding: 13px 0; border-bottom: 1px solid var(--border); }
  .info-row:last-child { border-bottom: none; }
  .info-ico  { width: 38px; height: 38px; border-radius: 12px; background: var(--green-bg); display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
  .info-lbl  { font-size: var(--fs-label); color: var(--text-muted); margin-bottom: 2px; }
  .info-val  { font-size: var(--fs-label); font-weight: 600; color: var(--text); }

  .stat-row-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 9px; }
  .mini-stat     { background: var(--green-bg); border-radius: 12px; padding: 12px 9px; text-align: center; }
  .mini-stat-val { font-size: var(--fs-body); font-weight: 800; color: var(--green); }
  .mini-stat-lbl { font-size: var(--fs-label); color: var(--text-muted); margin-top: 3px; line-height: 1.35; }

  .setting-row { display: flex; align-items: center; gap: 13px; padding: 14px 0; border-bottom: 1px solid var(--border); cursor: pointer; }
  .setting-row:last-child { border-bottom: none; }
  .setting-ico { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
  .setting-lbl { font-size: var(--fs-label); font-weight: 600; color: var(--text); flex: 1; }
  .setting-sub { font-size: var(--fs-label); color: var(--text-muted); margin-top: 2px; }
  .setting-arr { font-size: 15px; color: var(--line-strong); }

  .signout-btn { width: 100%; padding: 16px; background: var(--error-sk); color: var(--red); border: none; border-radius: var(--radius); font-family: inherit; font-size: var(--fs-label); font-weight: 700; cursor: pointer; }
  .version-txt { text-align: center; font-size: var(--fs-label); color: var(--text-faint); padding: 8px 0 12px; }

  /* ── Home / Summary Screen (Senior-friendly) ── */
  .home-header {
    background: var(--ink);
    padding: 22px 18px 20px; color: #fff; flex-shrink: 0; position: relative;
  }
  .home-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .home-greeting { font-family: var(--font-display); font-size: var(--fs-title); font-weight: 700; line-height: 1.25; }
  .home-date     { font-size: var(--fs-label); opacity: .88; margin-top: 4px; }
  .home-ava-btn  {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--lime); border: none;
    display: flex; align-items: center; justify-content: center;
    font-size: var(--fs-body); font-weight: 800; color: var(--ink); cursor: pointer; flex-shrink: 0;
  }
  .home-status { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.14); border-radius:99px; padding:7px 13px; width:fit-content; }
  .home-status-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
  .home-status-txt { font-size: var(--fs-label); font-weight:600; opacity:.92; }

  /* Module grid */
  .module-grid { display:grid; grid-template-columns:1fr 1fr; gap:13px; }
  .module-btn {
    background: var(--white); border-radius: var(--radius); padding: 20px 15px;
    border: 1.5px solid var(--border); cursor: pointer;
    display: flex; flex-direction: column; align-items: flex-start; gap: 11px;
    box-shadow: var(--shadow-sm); transition: border-color 0.15s, transform 0.1s;
    text-align: left;
  }
  .module-btn:active { border-color: var(--green); background: var(--green-bg); transform: scale(0.98); }
  .module-ico-wrap { width:50px; height:50px; border-radius:14px; display:flex; align-items:center; justify-content:center; }
  .module-lbl { font-size: var(--fs-body); font-weight: 800; color: var(--text); }
  .module-desc { font-size: var(--fs-label); color: var(--text-muted); margin-top: -3px; line-height: 1.45; }

  /* Quick price strip */
  .price-strip { display:flex; gap:9px; overflow-x:auto; padding-bottom:2px; flex-shrink:0; }
  .price-strip::-webkit-scrollbar { display:none; }
  .price-pill {
    flex-shrink:0; background:var(--white); border:1.5px solid var(--border);
    border-radius:14px; padding:11px 15px; display:flex; flex-direction:column; gap:4px;
    min-width:96px; box-shadow:var(--shadow-sm);
  }
  .price-pill-name  { font-size: var(--fs-label); font-weight:600; color:var(--text-muted); }
  .price-pill-val   { font-size: var(--fs-lead); font-weight:800; color:var(--text); }
  .price-pill-chg   { font-size: var(--fs-label); font-weight:700; }

  /* Home section label */
  .home-sec { font-family: var(--font-display); font-size: var(--fs-body); font-weight:700; color:var(--text); margin-bottom:3px; }
  .home-sec-sub { font-size: var(--fs-label); color:var(--text-muted); margin-bottom:11px; }

  /* Advisory banner */
  .adv-banner { border-radius:14px; padding:15px; display:flex; gap:11px; align-items:flex-start; }
  .adv-banner-txt { font-size: var(--fs-label); font-weight:600; line-height:1.55; }
  .adv-banner-sub { font-size: var(--fs-label); opacity:.78; margin-top:3px; }


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
    animation: skel-sweep 1.4s var(--ease-io) infinite;
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
  .card, .mkt-row, .exp-row, .price-row, .price-pill, .module-btn,
  .setting-row, .info-row, .fchip, .lstm-tab, .add-btn, .post-btn,
  .ntab, .crop-tag, .signout-btn {
    transition: transform 190ms var(--ease-out), background-color 160ms ease;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .card:active, .mkt-row:active, .exp-row:active, .price-row:active,
  .price-pill:active, .module-btn:active, .setting-row:active, .info-row:active,
  .fchip:active, .lstm-tab:active, .add-btn:active, .post-btn:active,
  .ntab:active, .crop-tag:active, .signout-btn:active {
    transition-duration: 100ms;
  }
  .mkt-row:active, .exp-row:active, .price-row:active,
  .setting-row:active, .info-row:active, .card:active { transform: scale(0.99); }
  .price-pill:active, .module-btn:active { transform: scale(0.975); }
  .fchip:active, .lstm-tab:active, .crop-tag:active,
  .add-btn:active, .post-btn:active, .signout-btn:active { transform: scale(0.97); }
  .ntab:active { transform: scale(0.97); }

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
    will-change: transform;
  }
  @keyframes bar-grow { from { transform: scaleX(0); } }
  .bar-track { overflow: hidden; }

  /* ── Sheets ──────────────────────────────────────────────────────────────
     Transition, not keyframes, because a sheet is gesture-adjacent: if it is
     dismissed mid-open it must retarget from where it actually is rather than
     restart. Rises from the bottom edge it belongs to. Scrim fades faster than
     the sheet travels, so the sheet is what the eye follows. */
  .sheet-scrim {
    opacity: 0;
    transition: opacity 180ms var(--ease-out);
  }
  .sheet-scrim[data-open="true"] { opacity: 1; }
  .sheet {
    transform: translateY(100%);
    transition: transform 280ms var(--ease-out);
    will-change: transform;
  }
  .sheet[data-open="true"] { transform: translateY(0); }

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
    .stagger-list > * { animation: row-in-reduced 200ms ease both; }
    @keyframes row-in-reduced { from { opacity: 0; } }
    .bar-fill { animation: none; }
    .sheet { transition-duration: 120ms; }
    .offline-banner[data-entering="true"] { transform: none; }
  }

`;
