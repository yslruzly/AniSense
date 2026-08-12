export const appCss = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Figtree:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --green: #2e7d4f; --green-deep: #143f27; --green-mid: #3a9160; --green-light: #cfe7d6; --green-bg: #e6f2e9;
    --ink: #152b1e; --lime: #f7c948;
    --gold: #b97d10; --gold-bg: #fdf3dd; --gold-line: #f0dca6; --gold-deep: #8a5d0c;
    --red: #c74133;   --red-light: #f9e4dc; --red-line: #f0cbb9;
    --text: #26201a;  --text-soft: #4d4237; --text-muted: #82735f; --text-faint: #aa9d8a;
    --border: #e9e0d2; --border-strong: #d6cab6; --bg: #faf6ef; --bg-alt: #f1e9dc; --white: #ffffff;
    --radius: 16px; --radius-sm: 11px; --radius-lg: 22px;
    --shadow-sm: 0 2px 6px rgba(110,54,8,0.07);
    --shadow-md: 0 5px 14px rgba(110,54,8,0.10);
    --shadow-lg: 0 12px 28px rgba(110,54,8,0.16);
  }

  html, body { height: 100%; margin: 0; font-family: 'Figtree', sans-serif; -webkit-font-smoothing: antialiased; }
  .disp { font-family: 'Bricolage Grotesque', sans-serif; }

  :focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; border-radius: 6px; }

  /* ── Android Safe Area ── */
  :root {
    --safe-top: env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
  }

  /* ── Shell ── */
  .shell {
    width: 390px; height: 844px;
    background: var(--bg); display: flex; flex-direction: column;
    overflow: hidden; border-radius: 44px;
    box-shadow: 0 36px 70px rgba(20,15,5,0.45), 0 0 0 10px #152b1e;
    margin: auto; position: relative;
  }
  .outer {
    min-height: 100vh; background: #ece4d6;
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
    background: #152b1e; color: #faf6ef;
    padding: 9px 18px; font-size: 12px; font-weight: 600;
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0; gap: 8px;
  }
  .offline-left  { display: flex; align-items: center; gap: 7px; }
  .offline-dot   { width: 8px; height: 8px; border-radius: 50%; background: #d4553f; flex-shrink: 0; }
  @media (prefers-reduced-motion: no-preference) { .offline-dot { animation: pulse 1.5s infinite; } }
  .online-dot    { background: #6cb86f; animation: none; }
  .offline-time  { font-size: 11px; color: #aa9d8a; }
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
  .hdr-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 17px; font-weight: 700; color: var(--text); line-height: 1.15; }
  .hdr-sub   { font-size: 12px; color: var(--text-muted); margin-top: 1px; }
  .hdr-right { display: flex; align-items: center; gap: 12px; }
  .notif { font-size: 19px; position: relative; cursor: pointer; }
  .nbadge {
    position: absolute; top: -5px; right: -5px;
    background: var(--red); color: #fff; font-size: 9px; font-weight: 700;
    border-radius: 99px; padding: 1px 4px; min-width: 15px; text-align: center;
  }
  .ava {
    width: 34px; height: 34px; border-radius: 50%;
    background: #2e7d4f;
    color:#fff; font-size:12px; font-weight:700;
    display:flex; align-items:center; justify-content:center;
    border: 2px solid #cfe7d6; transition: box-shadow 0.15s; cursor: pointer;
  }
  .ava:hover { box-shadow: 0 0 0 3px #b3d9c0; }

  /* ── Scroll ── */
  .scroll {
    flex: 1; overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 14px; padding-bottom: 10px;
  }
  .scroll > * { flex-shrink: 0; }
  .scroll::-webkit-scrollbar { display: none; }

  /* ── Card ── */
  .card { background: var(--white); border-radius: var(--radius); padding: 16px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
  .card-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 13px; }

  /* ── Grid 2 ── */
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }

  /* ── Stat card ── */
  .stat-ico { font-size: 21px; margin-bottom: 6px; }
  .stat-chg { font-size: 12px; font-weight: 600; color: var(--green); margin-bottom: 3px; }
  .stat-val { font-size: 19px; font-weight: 800; color: var(--text); }
  .stat-lbl { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

  /* ── Hero ── */
  .hero {
    background: #3a9160;
    border-radius: var(--radius); padding: 20px; position: relative; overflow: hidden;
    display: flex; align-items: center; justify-content: space-between; color: #fff;
  }
  .hero-greet { font-family: 'Bricolage Grotesque', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 4px; }
  .hero-loc   { font-size: 12px; opacity: .85; }
  .hero-emoji { font-size: 40px; }

  .sec-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 19px; font-weight: 700; color: var(--text); }
  .sec-sub   { font-size: 13px; color: var(--text-muted); margin-top: 2px; }

  /* ── Badge ── */
  .chg-badge { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 99px; }
  .pos { background: #dff2e5; color: #2f9e63; }
  .neg { background: var(--red-light);   color: var(--red); }

  /* ── Price list ── */
  .price-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border); }
  .price-row:last-child { border-bottom:none; }
  .pname-row { display:flex; align-items:center; gap:8px; margin-bottom:3px; }
  .pname  { font-size:14px; font-weight:600; color:var(--text); }
  .pvol   { font-size:12px; color:var(--text-muted); }
  .pright { display:flex; align-items:center; gap:7px; }
  .pprice { font-size:16px; font-weight:800; color:var(--text); }
  .punit  { font-size:11px; color:var(--text-muted); }

  /* ── Market: Top Movers ── */
  .movers-row { display:flex; gap:10px; }
  .movers-col { flex:1; background:var(--white); border-radius:14px; padding:13px; border:1px solid #f1e9dc; }
  .movers-col-title { font-size:12px; font-weight:700; margin-bottom:9px; display:flex; align-items:center; gap:5px; }
  .mover-item { display:flex; justify-content:space-between; align-items:center; padding:5px 0; }
  .mover-item-name { font-size:12.5px; font-weight:600; color:var(--text); }
  .mover-item-chg { font-size:12px; font-weight:700; flex-shrink:0; margin-left:8px; }

  /* ── Market: ticker rows ── */
  .mkt-list-hdr { font-size:12.5px; font-weight:700; color:var(--text-muted); margin-top:2px; }
  .mp-list-hdr-row { display:flex; align-items:center; justify-content:space-between; }
  .mkt-row {
    display:flex; align-items:center; gap:12px; padding:13px 14px;
    border-radius:14px; background:var(--white); border:1px solid #f1e9dc;
    border-left:4px solid transparent;
  }
  .mkt-row.up   { border-left-color:#2f9e63; }
  .mkt-row.down { border-left-color:#d4553f; }
  .mkt-row-ico  { width:42px; height:42px; border-radius:12px; background:var(--green-bg); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .mkt-row-name { font-size:14.5px; font-weight:700; color:var(--text); }
  .mkt-row-unit { font-size:11.5px; color:var(--text-muted); margin-top:1px; }
  .mkt-row-right { margin-left:auto; text-align:right; flex-shrink:0; }
  .mkt-row-price { font-size:16.5px; font-weight:800; color:var(--text); }
  .mkt-row-chg { font-size:12px; font-weight:700; display:flex; align-items:center; gap:3px; justify-content:flex-end; margin-top:3px; }

  /* ── Chart ── */
  .chart-svg { width:100%; height:auto; }
  .legend { display:flex; gap:16px; justify-content:center; margin-top:9px; }
  .leg-item { display:flex; align-items:center; gap:5px; font-size:11px; color:var(--text-muted); font-weight:600; }
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
  .ntab-lbl { font-size:10.5px; font-weight:600; color:var(--text-muted); }
  .ntab.on { background: var(--green-bg); }
  .ntab.on .ntab-lbl { color:var(--green); font-weight:700; }

  /* ── Expenses ── */
  .exp-hero { background: #3a9160; border-radius:var(--radius); padding:26px 18px; color:#fff; text-align:center; }
  .exp-total-lbl { font-size:13px; opacity:.85; margin-bottom:6px; font-weight:500; }
  .exp-total { font-family: 'Bricolage Grotesque', sans-serif; font-size:34px; font-weight:700; }

  .frow { display:flex; gap:8px; overflow-x:auto; padding-bottom:2px; flex-shrink:0; }
  .frow::-webkit-scrollbar { display:none; }
  .fchip { flex-shrink:0; background:var(--white); border:1.5px solid var(--border); border-radius:99px; padding:7px 14px; font-size:12px; font-weight:600; color:var(--text-muted); cursor:pointer; font-family:inherit; }
  .fchip.on { background:var(--green); border-color:var(--green); color:#fff; }

  .exp-row { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--border); }
  .exp-row:last-child { border-bottom:none; }
  .exp-ico { width:40px; height:40px; border-radius:12px; background:var(--green-bg); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .exp-desc { font-size:13.5px; font-weight:600; color:var(--text); }
  .exp-meta { font-size:11.5px; color:var(--text-muted); margin-top:2px; }
  .exp-amt  { font-size:14.5px; font-weight:700; color:var(--text); margin-left:auto; }
  .add-btn  { width:100%; padding:15px; background:var(--green); color:#fff; border:none; border-radius:var(--radius); font-family:inherit; font-size:14.5px; font-weight:700; cursor:pointer; }

  /* ── Analytics ── */
  .bar-row { display:flex; align-items:center; gap:9px; margin-bottom:11px; }
  .bar-lbl { font-size:12px; font-weight:600; color:var(--text); width:64px; flex-shrink:0; }
  .bar-track { flex:1; height:10px; background:var(--bg-alt); border-radius:99px; overflow:hidden; }
  .bar-fill  { height:100%; border-radius:99px; }
  .bar-val   { font-size:11px; color:var(--text-muted); width:44px; text-align:right; flex-shrink:0; }

  .perf-grid { display:grid; grid-template-columns:1fr 1fr; gap:9px; }
  .perf-card { border-radius:14px; padding:13px; text-align:center; }
  .perf-name  { font-size:11px; font-weight:600; color:var(--text-muted); margin-bottom:4px; }
  .perf-price { font-size:17px; font-weight:800; color:var(--text); }
  .perf-chg   { font-size:12px; font-weight:700; margin-top:3px; }

  .sum-row { display:flex; justify-content:space-around; }
  .sum-val { font-size:19px; font-weight:800; color:#2f9e63; }
  .sum-lbl { font-size:12px; color:var(--text-muted); margin-top:3px; text-align:center; }

  /* ── Marketplace ── */
  .mp-title-row { display:flex; align-items:flex-start; justify-content:space-between; }
  .mp-title { font-family: 'Bricolage Grotesque', sans-serif; font-size:22px; font-weight:700; color:var(--text); }
  .mp-sub   { font-size:12px; color:var(--text-muted); margin-top:3px; max-width:170px; line-height:1.45; }
  .post-btn { background:#26201a; color:#fff; border:none; border-radius:11px; padding:11px 15px; font-family:inherit; font-size:12px; font-weight:700; cursor:pointer; flex-shrink:0; }

  .search-box { display:flex; align-items:center; gap:9px; background:var(--white); border:1.5px solid var(--border); border-radius:13px; padding:12px 14px; }
  .search-box input { border:none; outline:none; font-family:inherit; font-size:13px; color:var(--text); flex:1; background:transparent; }
  .search-box input::placeholder { color:#aa9d8a; }

  .mp-filter-row { display:flex; flex-direction:column; gap:7px; }
  .cat-tabs { display:grid; grid-template-columns:repeat(3,1fr); gap:9px; }
  .cat-tab {
    padding:14px 6px; border-radius:16px; border:2px solid var(--border);
    background:var(--white); font-family:inherit; font-size:13.5px; font-weight:700;
    color:var(--text-muted); cursor:pointer; display:flex; flex-direction:column;
    align-items:center; gap:8px; text-align:center; line-height:1.25;
    box-shadow:var(--shadow-sm);
  }
  .cat-tab.active { background:#e6f2e9; border-color:#2e7d4f; color:#2e7d4f; }
  .cat-tab-ico { width:40px; height:40px; border-radius:12px; background:#f1e9dc; display:flex; align-items:center; justify-content:center; }
  .cat-tab.active .cat-tab-ico { background:#cfe7d6; }

  .var-tabs { display:grid; grid-template-columns:repeat(2,1fr); gap:9px; }
  .var-tab {
    padding:13px 11px; border-radius:14px; border:2px solid #e2d8f2;
    background:#edf1f6; font-family:inherit; font-size:13px; font-weight:700;
    color:#6d4bb8; cursor:pointer; text-align:center; line-height:1.35;
  }
  .var-tab.active { background:var(--green); border-color:var(--green); color:#fff; }

  .drop-wrap  { position:relative; display:flex; align-items:center; }
  .drop-sel   { appearance:none; -webkit-appearance:none; background:var(--white); border:1.5px solid var(--border); border-radius:10px; padding:8px 30px 8px 13px; font-family:inherit; font-size:12px; font-weight:600; color:var(--text); cursor:pointer; }
  .drop-arr   { position:absolute; right:10px; font-size:11px; color:var(--text-muted); pointer-events:none; }

  .mp-stats { display:grid; grid-template-columns:1fr 1fr; gap:11px; }
  .mp-stat  { background:var(--white); border-radius:14px; padding:15px 16px; box-shadow:var(--shadow-sm); }
  .mp-stat-val { font-size:19px; font-weight:800; color:var(--text); }
  .mp-stat-lbl { font-size:11px; color:var(--text-muted); margin-top:3px; }

  .listing { background:var(--white); border-radius:var(--radius); padding:19px; border:1px solid var(--border); }
  .listing-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:11px; }
  .listing-crop-row { display:flex; align-items:flex-start; gap:13px; }
  .listing-ico  { width:54px; height:54px; border-radius:15px; background:var(--green-bg); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .listing-name { font-family: 'Bricolage Grotesque', sans-serif; font-size:19px; font-weight:700; color:var(--text); line-height:1.25; }
  .listing-var  { font-size:13.5px; color:var(--text-muted); margin-top:3px; font-weight:500; }
  .listing-price{ font-size:21px; font-weight:800; color:#26201a; white-space:nowrap; }
  .listing-desc { font-size:13.5px; color:var(--text-muted); line-height:1.65; margin-bottom:11px; }
  .listing-meta { display:flex; justify-content:space-between; font-size:12.5px; color:#82735f; font-weight:600; margin-bottom:13px; background:#faf6ef; padding:10px 13px; border-radius:11px; }
  .seller-row   { display:flex; align-items:center; gap:11px; margin-bottom:15px; padding:11px 13px; background:#faf6ef; border-radius:13px; }
  .seller-ava   { width:44px; height:44px; border-radius:50%; background:#2e7d4f; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:800; color:#fff; flex-shrink:0; }
  .seller-name  { font-size:15.5px; font-weight:700; color:var(--text); }
  .seller-stars { font-size:13px; color:#b97d10; font-weight:700; margin-top:3px; display:flex; align-items:center; gap:3px; }
  .seller-loc   { font-size:12.5px; color:var(--text-muted); display:flex; align-items:center; gap:3px; margin-left:auto; }
  .listing-btns { display:flex; gap:11px; }
  .btn-call     { flex:1; background:var(--green); color:#fff; border:none; border-radius:13px; padding:17px; font-family:inherit; font-size:16px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; }
  .btn-details  { flex:1; background:var(--white); color:var(--text); border:2px solid var(--border); border-radius:13px; padding:17px; font-family:inherit; font-size:16px; font-weight:800; cursor:pointer; }
  .empty-msg    { text-align:center; color:#aa9d8a; padding:44px 16px; font-size:16px; font-weight:600; line-height:1.6; }

  /* ── Cart ── */
  .cart-badge-wrap { position:relative; }
  .cart-badge {
    position:absolute; top:-6px; right:-6px;
    background:#c74133; color:#fff; font-size:9px; font-weight:800;
    border-radius:99px; padding:1px 5px; min-width:17px; text-align:center; line-height:1.6;
  }
  .cart-btn-icon {
    width:36px; height:36px; border-radius:50%; background:#e6f2e9; border:2px solid #cfe7d6;
    display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0;
  }
  .cart-drawer {
    position:absolute; inset:0; background:rgba(30,22,12,0.55);
    display:flex; align-items:flex-end; z-index:60;
  }
  .cart-sheet {
    background:#faf6ef; border-radius:26px 26px 0 0;
    width:100%; max-height:88%; display:flex; flex-direction:column;
  }
  .cart-sheet-hdr {
    background: #2e7d4f;
    border-radius:26px 26px 0 0;
    padding:20px 22px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
  }
  .cart-item-row {
    display:flex; gap:13px; align-items:flex-start;
    padding:15px 17px; border-bottom:1px solid #f1e9dc; background:#fff;
  }
  .cart-item-ico { width:46px; height:46px; border-radius:13px; background:#e6f2e9; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .cart-item-name { font-size:15px; font-weight:700; color:#26201a; }
  .cart-item-seller { font-size:12px; color:#82735f; margin-top:2px; }
  .cart-item-price { font-size:14px; font-weight:800; color:#2e7d4f; margin-top:4px; }
  .cart-qty-row { display:flex; align-items:center; gap:9px; margin-top:7px; }
  .cart-qty-btn {
    width:30px; height:30px; border-radius:9px; border:2px solid #e9e0d2;
    background:#faf6ef; font-size:17px; font-weight:800; color:#4d4237;
    display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0;
  }
  .cart-qty-btn:hover { background:#e9e0d2; }
  .cart-qty-val { font-size:15px; font-weight:800; color:#26201a; min-width:34px; text-align:center; }
  .cart-qty-unit { font-size:12px; color:#82735f; font-weight:600; }
  .cart-remove-btn { background:#f9e4dc; border:none; border-radius:9px; width:30px; height:30px; cursor:pointer; display:flex; align-items:center; justify-content:center; margin-left:auto; flex-shrink:0; }
  .cart-footer { padding:18px; border-top:1px solid #e9e0d2; background:#fff; flex-shrink:0; }
  .cart-total-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; }
  .cart-total-lbl { font-size:14px; font-weight:600; color:#82735f; }
  .cart-total-val { font-size:24px; font-weight:900; color:#26201a; }
  .cart-checkout-btn {
    width:100%; padding:18px; background:#2e7d4f; color:#fff; border:none;
    border-radius:16px; font-family:inherit; font-size:17px; font-weight:800;
    cursor:pointer; box-shadow:var(--shadow-md);
  }
  .cart-empty { text-align:center; padding:44px 20px; }
  .cart-empty-ico { display:flex; align-items:center; justify-content:center; margin-bottom:13px; }
  .cart-empty-txt { font-size:16px; font-weight:700; color:#4d4237; }
  .cart-empty-sub { font-size:13px; color:#aa9d8a; margin-top:5px; }
  .add-cart-btn {
    flex:1; background:#3a6ea5; color:#fff; border:none; border-radius:13px; padding:17px;
    font-family:inherit; font-size:15.5px; font-weight:800; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .add-cart-btn.in-cart { background:#e6f2e9; color:#2e7d4f; border:2px solid #b3d9c0; }
  .qty-picker-row { display:flex; align-items:center; gap:11px; background:#faf6ef; border-radius:13px; padding:11px 15px; border:1.5px solid #e9e0d2; }
  .qty-pick-btn { width:36px; height:36px; border-radius:10px; border:2px solid #e9e0d2; background:#fff; font-size:19px; font-weight:800; color:#4d4237; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
  .qty-pick-btn:hover { background:#e9e0d2; }
  .qty-pick-val { flex:1; text-align:center; font-size:18px; font-weight:800; color:#26201a; }
  .qty-pick-unit { font-size:13px; color:#82735f; font-weight:600; }
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
    background:#faf6ef; border-radius:30px 30px 0 0;
    width:100%; max-height:90%; display:flex; flex-direction:column;
    overflow:hidden;
  }
  .seller-modal-hero {
    background: #3a9160;
    padding:26px 22px 22px; flex-shrink:0;
  }
  .seller-modal-ava {
    width:70px; height:70px; border-radius:50%;
    background:rgba(255,255,255,0.25); border:3px solid rgba(255,255,255,0.6);
    display:flex; align-items:center; justify-content:center;
    font-size:25px; font-weight:900; color:#fff; margin-bottom:13px;
  }
  .seller-modal-name { font-family: 'Bricolage Grotesque', sans-serif; font-size:23px; font-weight:700; color:#fff; margin-bottom:4px; }
  .seller-modal-sub  { font-size:14px; color:rgba(255,255,255,0.85); }
  .seller-modal-stats {
    display:grid; grid-template-columns:repeat(3,1fr); gap:11px;
    padding:18px 18px; background:#fff; border-bottom:1px solid #f1e9dc; flex-shrink:0;
  }
  .sms-item { text-align:center; }
  .sms-val  { font-size:19px; font-weight:900; color:#26201a; }
  .sms-lbl  { font-size:11px; color:#82735f; margin-top:3px; font-weight:600; }
  .seller-modal-body { flex:1; overflow-y:auto; padding:18px; display:flex; flex-direction:column; gap:15px; }
  .sdm-row { display:flex; align-items:center; gap:15px; padding:14px 15px; background:#fff; border-radius:15px; border:1px solid #f1e9dc; }
  .sdm-ico { width:44px; height:44px; border-radius:13px; background:#e6f2e9; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .sdm-lbl { font-size:12px; color:#82735f; font-weight:600; margin-bottom:2px; }
  .sdm-val { font-size:15px; font-weight:700; color:#26201a; }
  .sdm-bio { background:#fff; border-radius:15px; padding:15px; border:1px solid #f1e9dc; font-size:14px; color:#4d4237; line-height:1.75; }
  .sdm-crops { display:flex; gap:8px; flex-wrap:wrap; margin-top:9px; }
  .sdm-crop-tag { background:#e6f2e9; border:1px solid #b3d9c0; color:#2e7d4f; font-size:12px; font-weight:700; border-radius:99px; padding:5px 12px; }
  .star-fill { color:#b97d10; }
  .seller-modal-footer { padding:18px; background:#fff; border-top:1px solid #e9e0d2; flex-shrink:0; }
  .call-seller-btn {
    width:100%; padding:18px; background:#2e7d4f; color:#fff; border:none;
    border-radius:16px; font-family:inherit; font-size:17px; font-weight:800;
    cursor:pointer; display:flex; align-items:center; justify-content:center; gap:9px;
    box-shadow:var(--shadow-md);
  }

  /* ── Weather ── */
  .wx-hero { background: #2f5586; border-radius:var(--radius); padding:28px 18px; color:#fff; text-align:center; }
  .wx-ico  { font-size:50px; margin-bottom:7px; }
  .wx-temp { font-family: 'Bricolage Grotesque', sans-serif; font-size:46px; font-weight:700; }
  .wx-cond { font-size:16px; opacity:.92; margin-top:4px; font-weight:500; }
  .wx-loc  { font-size:12px; opacity:.75; margin-top:7px; }

  .fc-row  { display:flex; justify-content:space-between; }
  .fc-item { text-align:center; flex:1; }
  .fc-day  { font-size:11px; font-weight:700; color:var(--text-muted); margin-bottom:6px; }
  .fc-ico  { font-size:21px; margin-bottom:4px; }
  .fc-hi   { font-size:13px; font-weight:700; color:var(--text); }
  .fc-lo   { font-size:11px; color:var(--text-muted); }

  .adv-item { display:flex; gap:9px; align-items:flex-start; padding:11px 13px; border-radius:12px; font-size:12.5px; font-weight:500; line-height:1.55; margin-bottom:9px; }
  .adv-item:last-child { margin-bottom:0; }
  .adv-good { background:var(--green-bg); color:#1e5c3a; }
  .adv-warn { background:#fdf3dd; color:#6f4a08; }
  .adv-info { background:#e9eff6; color:#2f5586; }

  /* ── LSTM Forecast ── */
  .lstm-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:13px; }
  .lstm-badge { background:#2c2350; color:#b9a5e2; font-size:10px; font-weight:700; padding:4px 9px; border-radius:99px; letter-spacing:0.5px; }
  .lstm-acc   { font-size:11px; color:var(--text-muted); }
  .lstm-acc span { color:#2e7d4f; font-weight:700; }

  .lstm-crop-tabs { display:flex; gap:7px; overflow-x:auto; margin-bottom:15px; padding-bottom:2px; flex-shrink:0; }
  .lstm-crop-tabs::-webkit-scrollbar { display:none; }
  .lstm-tab { flex-shrink:0; padding:6px 13px; border-radius:99px; border:1.5px solid var(--border); background:var(--bg); font-family:inherit; font-size:12px; font-weight:600; color:var(--text-muted); cursor:pointer; }
  .lstm-tab.on { background:#2c2350; border-color:#2c2350; color:#fff; }

  .lstm-summary { display:grid; grid-template-columns:repeat(3,1fr); gap:9px; margin-bottom:15px; }
  .lstm-sum-item { background:var(--bg); border-radius:12px; padding:10px 9px; text-align:center; }
  .lstm-sum-val  { font-size:15px; font-weight:800; color:var(--text); }
  .lstm-sum-lbl  { font-size:10.5px; color:var(--text-muted); margin-top:3px; line-height:1.35; }

  .lstm-trend-up   { color:#2f9e63; }
  .lstm-trend-down { color:#c74133; }
  .lstm-trend-stable { color:#b97d10; }

  .lstm-forecast-row { display:flex; gap:6px; overflow-x:auto; padding-bottom:4px; margin-bottom:13px; flex-shrink:0; }
  .lstm-forecast-row::-webkit-scrollbar { display:none; }
  .lstm-day-card { flex-shrink:0; text-align:center; padding:9px 7px; border-radius:12px; min-width:46px; }
  .lstm-day-card.future { background:#edf1f6; border:1px solid #dbe2ec; }
  .lstm-day-card.past   { background:var(--bg); border:1px solid var(--border); }
  .lstm-day-card.now    { background:#2c2350; border:1px solid #2c2350; }
  .lstm-day-lbl  { font-size:9px; font-weight:700; color:var(--text-muted); margin-bottom:5px; }
  .lstm-day-card.now .lstm-day-lbl { color:#b9a5e2; }
  .lstm-day-price { font-size:12px; font-weight:800; color:var(--text); }
  .lstm-day-card.now .lstm-day-price { color:#fff; }
  .lstm-day-card.future .lstm-day-price { color:#3b2f6e; }
  .lstm-day-dot  { font-size:8px; margin-top:3px; }

  .lstm-note { font-size:11px; color:#aa9d8a; line-height:1.55; padding:9px 11px; background:var(--bg); border-radius:10px; border-left:3px solid #b9a5e2; }

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
    font-size: 30px; font-weight: 800; color: var(--ink);
  }
  .prof-edit-btn {
    position: absolute; bottom: 0; right: 0; width: 27px; height: 27px;
    border-radius: 50%; background: #fff; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 13px;
  }
  .prof-name  { font-family: 'Bricolage Grotesque', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 3px; }
  .prof-role  { font-size: 13px; opacity: .85; margin-bottom: 11px; }
  .prof-crops { display: flex; gap: 7px; flex-wrap: wrap; justify-content: center; }
  .crop-tag   { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); border-radius: 99px; padding: 4px 11px; font-size: 11px; font-weight: 600; color: #fff; }

  .info-row { display: flex; align-items: center; gap: 13px; padding: 13px 0; border-bottom: 1px solid var(--border); }
  .info-row:last-child { border-bottom: none; }
  .info-ico  { width: 38px; height: 38px; border-radius: 12px; background: var(--green-bg); display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
  .info-lbl  { font-size: 11px; color: var(--text-muted); margin-bottom: 2px; }
  .info-val  { font-size: 14px; font-weight: 600; color: var(--text); }

  .stat-row-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 9px; }
  .mini-stat     { background: var(--green-bg); border-radius: 12px; padding: 12px 9px; text-align: center; }
  .mini-stat-val { font-size: 17px; font-weight: 800; color: var(--green); }
  .mini-stat-lbl { font-size: 10px; color: var(--text-muted); margin-top: 3px; line-height: 1.35; }

  .setting-row { display: flex; align-items: center; gap: 13px; padding: 14px 0; border-bottom: 1px solid var(--border); cursor: pointer; }
  .setting-row:last-child { border-bottom: none; }
  .setting-ico { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
  .setting-lbl { font-size: 14px; font-weight: 600; color: var(--text); flex: 1; }
  .setting-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
  .setting-arr { font-size: 15px; color: #d6cab6; }

  .signout-btn { width: 100%; padding: 16px; background: #f9e4dc; color: var(--red); border: none; border-radius: var(--radius); font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; }
  .version-txt { text-align: center; font-size: 11px; color: #aa9d8a; padding: 8px 0 12px; }

  /* ── Home / Summary Screen (Senior-friendly) ── */
  .home-header {
    background: var(--ink);
    padding: 22px 18px 20px; color: #fff; flex-shrink: 0; position: relative;
  }
  .home-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .home-greeting { font-family: 'Bricolage Grotesque', sans-serif; font-size: 24px; font-weight: 700; line-height: 1.25; }
  .home-date     { font-size: 14px; opacity: .88; margin-top: 4px; }
  .home-ava-btn  {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--lime); border: none;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 800; color: var(--ink); cursor: pointer; flex-shrink: 0;
  }
  .home-status { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.14); border-radius:99px; padding:7px 13px; width:fit-content; }
  .home-status-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
  .home-status-txt { font-size:12px; font-weight:600; opacity:.92; }

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
  .module-lbl { font-size: 16px; font-weight: 800; color: var(--text); }
  .module-desc { font-size: 12px; color: var(--text-muted); margin-top: -3px; line-height: 1.45; }

  /* Quick price strip */
  .price-strip { display:flex; gap:9px; overflow-x:auto; padding-bottom:2px; flex-shrink:0; }
  .price-strip::-webkit-scrollbar { display:none; }
  .price-pill {
    flex-shrink:0; background:var(--white); border:1.5px solid var(--border);
    border-radius:14px; padding:11px 15px; display:flex; flex-direction:column; gap:4px;
    min-width:96px; box-shadow:var(--shadow-sm);
  }
  .price-pill-name  { font-size:12px; font-weight:600; color:var(--text-muted); }
  .price-pill-val   { font-size:19px; font-weight:800; color:var(--text); }
  .price-pill-chg   { font-size:11px; font-weight:700; }

  /* Home section label */
  .home-sec { font-family: 'Bricolage Grotesque', sans-serif; font-size:18px; font-weight:700; color:var(--text); margin-bottom:3px; }
  .home-sec-sub { font-size:13px; color:var(--text-muted); margin-bottom:11px; }

  /* Advisory banner */
  .adv-banner { border-radius:14px; padding:15px; display:flex; gap:11px; align-items:flex-start; }
  .adv-banner-txt { font-size:14px; font-weight:600; line-height:1.55; }
  .adv-banner-sub { font-size:12px; opacity:.78; margin-top:3px; }
`;
