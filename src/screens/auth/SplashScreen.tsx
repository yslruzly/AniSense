import { useLang } from "../../i18n";

// ─── Welcome ──────────────────────────────────────────────────────────────────
// The AniSense poster, full screen: the name, its promise ("Real farmers. Real
// produce.") and Juan with the day's harvest are all in the picture, so the
// screen adds only what the app does, its slogan and the two ways in, low
// under the thumb. The picture carries no text a screen reader can see, so
// the heading says it for them.

export function SplashScreen({ onSignIn, onSignUp }: { onSignIn: () => void; onSignUp: () => void }) {
  const { t } = useLang();
  return (
    <div className="a-screen a-welcome-shell">
      <div className="a-welcome a-stagger">
        <h1 className="a-sr">{t("splash_sr")}</h1>
        <p className="a-tagline">
          {t("splash_lines")}{"\n"}<em>{t("splash_slogan")}</em>
        </p>
        <div className="a-welcome-cta">
          <button className="a-btn a-btn-gold" onClick={onSignUp}>{t("splash_create_account")}</button>
          <button className="a-btn a-btn-ghost-ink" onClick={onSignIn}>{t("splash_have_account")}</button>
        </div>
        <p className="a-legal">{t("splash_free")}</p>
      </div>
    </div>
  );
}
