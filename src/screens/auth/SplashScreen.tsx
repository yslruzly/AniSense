import type { ReactNode } from "react";
import { TrendingUp, Store, ReceiptText, CloudSun, ChevronRight } from "lucide-react";
import { useLang } from "../../i18n";
import { AniSenseLogo } from "../../components/brand/AniSenseLogo";

// ─── Welcome ──────────────────────────────────────────────────────────────────
// The first screen, set the way an iPhone app welcomes you: a calm, light
// page with a soft green and gold light at the top, the AniSense icon on its
// tile, "Welcome to AniSense" large, the slogan, then what the app does in
// four lines - each a coloured icon, a bold name and one plain sentence - and
// the two ways in pinned to the foot, the one to do solid, the other as words.
//
// It arrives once, in order: the icon settles, the title rises, the four
// lines follow one after another, then the buttons. Seen at the very start
// (and again only after signing out), so it can afford that one entrance.
//
// The Terms of Service and the Privacy Policy are asked for where an account
// is made (sign-up's first page), not here.

const FEATURES: { tone: string; ico: ReactNode; title: string; line: string }[] = [
  { tone: "green", ico: <TrendingUp size={24} strokeWidth={2.4} />, title: "wel_f1_t", line: "wel_f1_s" },
  { tone: "gold",  ico: <Store size={24} strokeWidth={2.4} />,      title: "wel_f2_t", line: "wel_f2_s" },
  { tone: "blue",  ico: <ReceiptText size={24} strokeWidth={2.4} />, title: "wel_f3_t", line: "wel_f3_s" },
  { tone: "sky",   ico: <CloudSun size={24} strokeWidth={2.4} />,   title: "wel_f4_t", line: "wel_f4_s" },
];

export function SplashScreen({ onSignIn, onSignUp, onGuest }: { onSignIn: () => void; onSignUp: () => void;
  /** Guest mode: the prices, without an account. */
  onGuest?: () => void }) {
  const { t } = useLang();
  return (
    <div className="a-screen wl">
      {/* Behind it all: three soft lights drifting slowly - green, gold and a
          pale leaf green - and the fine lines of rice terraces rising from
          the foot. Felt more than seen. */}
      <div className="wl-bg" aria-hidden="true">
        <span className="wl-orb o1" />
        <span className="wl-orb o2" />
        <span className="wl-orb o3" />
        <span className="wl-terraces" />
      </div>
      <div className="wl-page">
        <div className="wl-icon" aria-hidden="true"><AniSenseLogo size={62} /></div>
        <h1 className="wl-title">
          {t("wel_title_a")}<br /><span className="wl-name">AniSense</span>
        </h1>
        <p className="wl-slogan">{t("splash_slogan")}</p>

        <ul className="wl-list">
          {FEATURES.map((f, i) => (
            <li key={f.title} className={`wl-item ${f.tone}`} style={{ animationDelay: `${300 + i * 70}ms` }}>
              <span className="wl-ico" aria-hidden="true">{f.ico}</span>
              <span className="wl-txt">
                <span className="wl-item-t">{t(f.title)}</span>
                <span className="wl-item-s">{t(f.line)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* The two ways in, under the thumb: the one to do, solid; the other,
          for someone who is back, as words. */}
      <div className="wl-dock">
        <button type="button" className="wl-primary" onClick={onSignUp}>{t("splash_create_account")}</button>
        <button type="button" className="wl-secondary" onClick={onSignIn}>{t("splash_have_account")}</button>
        {/* For someone who only wants to look first: the prices, as a guest. */}
        {onGuest && (
          <button type="button" className="wl-guest" onClick={onGuest}>
            {t("guest_q")} <b>{t("guest_go")}</b><ChevronRight size={16} strokeWidth={2.6} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
