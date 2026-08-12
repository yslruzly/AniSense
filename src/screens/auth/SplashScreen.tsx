import { Wheat } from "lucide-react";
import { useLang } from "../../i18n";

// ─── Splash Screen ────────────────────────────────────────────────────────────
export function SplashScreen({ onSignIn, onSignUp }: { onSignIn: () => void; onSignUp: () => void }) {
  const { t } = useLang();
  return (
    <div className="splash-bg">
      <div className="splash-logo-ring">
        <Wheat size={54} color="#152b1e" />
      </div>
      <div className="splash-brand">AniSense</div>
      <div className="splash-tagline">{t("splash_tagline")}{"\n"}{t("splash_slogan")}</div>
      <div className="splash-bottom">
        <button className="splash-btn-primary" onClick={onSignUp}>{t("splash_create_account")}</button>
        <button className="splash-btn-secondary" onClick={onSignIn}>{t("splash_sign_in")}</button>
        <div className="splash-footer">AniSense · Ani mo, alam mo. · v1.0.0</div>
      </div>
    </div>
  );
}
