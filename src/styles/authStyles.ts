// ─── Auth CSS ─────────────────────────────────────────────────────────────────
export const authCss = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Figtree:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; font-family: 'Figtree', sans-serif; -webkit-font-smoothing: antialiased; }
  :focus-visible { outline: 2px solid #b97d10; outline-offset: 2px; border-radius: 6px; }

  .auth-outer {
    min-height: 100vh; background: #ece4d6;
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  @media (max-width: 430px) {
    .auth-outer { padding: 0; background: #fff; align-items: flex-start; }
  }
  .auth-shell {
    width: 390px; min-height: 844px; background: #fff;
    border-radius: 44px; box-shadow: 0 36px 70px rgba(20,15,5,0.45), 0 0 0 10px #152b1e;
    overflow: hidden; display: flex; flex-direction: column; position: relative;
  }
  @media (max-width: 430px) {
    .auth-shell { width: 100vw; min-height: 100dvh; border-radius: 0; box-shadow: none; }
  }

  /* Splash */
  .splash-bg {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: #152b1e;
    padding: 44px 32px; gap: 0;
  }
  .splash-logo-ring {
    width: 108px; height: 108px; border-radius: 24px;
    background: #f7c948; border: none;
    display: flex; align-items: center; justify-content: center; margin-bottom: 30px;
  }
  .splash-brand { font-family: 'Bricolage Grotesque', sans-serif; font-size: 40px; font-weight: 700; color: #fff; letter-spacing: -0.5px; margin-bottom: 9px; }
  .splash-tagline { font-size: 15px; color: rgba(255,255,255,0.85); font-weight: 500; text-align: center; line-height: 1.55; margin-bottom: 58px; }
  .splash-bottom { width: 100%; }
  .splash-btn-primary {
    width: 100%; padding: 17px; background: #f7c948; color: #152b1e;
    border: none; border-radius: 12px; font-family: inherit; font-size: 16px; font-weight: 800;
    cursor: pointer; margin-bottom: 12px;
  }
  .splash-btn-secondary {
    width: 100%; padding: 17px; background: transparent; color: #fff;
    border: 1.5px solid rgba(255,255,255,0.35); border-radius: 12px; font-family: inherit;
    font-size: 16px; font-weight: 700; cursor: pointer;
  }
  .splash-footer { font-size: 12px; color: rgba(255,255,255,0.55); text-align: center; margin-top: 24px; }

  /* Role picker */
  .role-wrap {
    flex: 1; display: flex; flex-direction: column;
    background: #faf6ef;
    padding: 0;
  }
  .role-top {
    background: #152b1e;
    padding: 50px 28px 38px; color: #fff;
  }
  .role-back-btn {
    background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);
    border-radius: 9px; width: 36px; height: 36px; display: flex; align-items: center;
    justify-content: center; cursor: pointer; margin-bottom: 22px;
  }
  .role-heading { font-family: 'Bricolage Grotesque', sans-serif; font-size: 28px; font-weight: 700; line-height: 1.25; margin-bottom: 7px; }
  .role-sub { font-size: 14px; opacity: .85; font-weight: 500; }
  .role-cards { display: flex; flex-direction: column; gap: 15px; padding: 28px 24px; flex: 1; }
  .role-card {
    border: 2px solid #e9e0d2; border-radius: 20px; padding: 22px 20px;
    display: flex; align-items: center; gap: 16px; cursor: pointer;
    background: #fff; transition: all 0.15s; box-shadow: 0 2px 10px rgba(58,42,18,0.07);
  }
  .role-card.active { border-color: #2e7d4f; background: #e6f2e9; box-shadow: 0 5px 18px rgba(43,107,63,0.18); }
  .role-card-ico {
    width: 62px; height: 62px; border-radius: 17px; display: flex; align-items: center;
    justify-content: center; font-size: 28px; flex-shrink: 0;
  }
  .role-card-title { font-size: 18px; font-weight: 800; color: #26201a; margin-bottom: 5px; }
  .role-card-desc  { font-size: 13px; color: #82735f; line-height: 1.55; font-weight: 500; }
  .role-radio {
    width: 24px; height: 24px; border-radius: 50%; border: 2px solid #d6cab6;
    margin-left: auto; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  }
  .role-radio.checked { border-color: #2e7d4f; background: #2e7d4f; }
  .role-radio.checked::after { content: ""; width: 9px; height: 9px; background: #fff; border-radius: 50%; }
  .role-continue-btn {
    margin: 0 24px 32px; padding: 17px; background: #2e7d4f; color: #fff;
    border: none; border-radius: 12px; font-family: inherit; font-size: 16px;
    font-weight: 800; cursor: pointer;
  }
  .role-continue-btn:disabled { background: #d6cab6; cursor: not-allowed; box-shadow: none; }

  /* Auth form */
  .auth-form-wrap {
    flex: 1; display: flex; flex-direction: column;
    background: #e6f2e9;
  }
  .auth-form-top {
    background: #152b1e;
    padding: 50px 28px 34px; color: #fff;
  }
  .auth-form-brand { font-size: 14px; font-weight: 700; opacity: .85; margin-bottom: 13px; display: flex; align-items: center; gap: 6px; }
  .auth-form-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 28px; font-weight: 700; line-height: 1.25; margin-bottom: 7px; }
  .auth-form-sub   { font-size: 14px; opacity: .85; font-weight: 500; }
  .auth-role-badge {
    display: inline-flex; align-items: center; gap: 6px; margin-top: 15px;
    background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.35);
    border-radius: 99px; padding: 6px 15px; font-size: 13px; font-weight: 700; color: #fff;
  }
  .auth-body { padding: 28px 24px; flex: 1; display: flex; flex-direction: column; gap: 17px; }
  .auth-field-lbl { font-size: 12px; font-weight: 700; color: #82735f; margin-bottom: 7px; letter-spacing: 0.04em; text-transform: uppercase; }
  .auth-input {
    width: 100%; border: 1.5px solid #e9e0d2; border-radius: 13px;
    padding: 14px 15px; font-family: inherit; font-size: 15px; outline: none;
    background: #faf6ef; color: #26201a; transition: border-color 0.15s;
  }
  .auth-input:focus { border-color: #2e7d4f; background: #fff; }
  .auth-input-icon-wrap { position: relative; }
  .auth-input-icon-wrap .auth-input { padding-left: 44px; }
  .auth-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); }
  .auth-toggle-row { display: flex; align-items: center; gap: 9px; margin-top: -4px; }
  .auth-tab { flex: 1; padding: 11px; border-radius: 11px; border: 1.5px solid #e9e0d2; background: #faf6ef; font-family: inherit; font-size: 13px; font-weight: 700; color: #82735f; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
  .auth-tab.on { border-color: #2e7d4f; background: #e6f2e9; color: #2e7d4f; }
  .auth-divider { display: flex; align-items: center; gap: 10px; }
  .auth-divider-line { flex: 1; height: 1px; background: #e9e0d2; }
  .auth-divider-txt { font-size: 12px; font-weight: 600; color: #aa9d8a; }
  .auth-submit-btn {
    width: 100%; padding: 16px; background: #2e7d4f; color: #fff;
    border: none; border-radius: 12px; font-family: inherit; font-size: 16px;
    font-weight: 800; cursor: pointer; margin-top: 4px;
  }
  .auth-switch-txt { font-size: 13px; color: #82735f; text-align: center; font-weight: 500; }
  .auth-switch-link { color: #2e7d4f; font-weight: 700; cursor: pointer; }
  .auth-error { background: #f9e4dc; color: #c74133; font-size: 12.5px; font-weight: 600; padding: 11px 15px; border-radius: 11px; border: 1px solid #f0cbb9; }
  .auth-success { background: #e6f2e9; color: #3a9160; font-size: 12.5px; font-weight: 600; padding: 11px 15px; border-radius: 11px; border: 1px solid #b3d9c0; }

  /* Crop Picker */
  .crop-picker-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 11px; margin-top: 9px;
  }
  .crop-picker-btn {
    position: relative; display: flex; align-items: center; gap: 11px;
    padding: 15px 13px; border-radius: 15px; border: 2px solid #e9e0d2;
    background: #faf6ef; cursor: pointer; font-family: inherit;
    transition: all 0.15s; text-align: left;
  }
  .crop-picker-btn.on {
    border-color: #2e7d4f; background: #e6f2e9;
    box-shadow: 0 3px 10px rgba(43,107,63,0.16);
  }
  .crop-picker-ico {
    width: 38px; height: 38px; border-radius: 11px; background: #fff;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    box-shadow: 0 1px 5px rgba(58,42,18,0.10);
  }
  .crop-picker-btn.on .crop-picker-ico { background: #cfe7d6; }
  .crop-picker-name {
    font-size: 14px; font-weight: 700; color: #4d4237; flex: 1;
  }
  .crop-picker-btn.on .crop-picker-name { color: #3a9160; }
  .crop-picker-check {
    position: absolute; top: 9px; right: 9px;
    width: 19px; height: 19px; border-radius: 50%; background: #2e7d4f;
    color: #fff; font-size: 10px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
  }
`;
