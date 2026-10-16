import { useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { useLang } from "../i18n";
import { isSupabaseConfigured } from "../lib/supabase";
import { fetchPriceHistory, fetchForecasts } from "../services/catalog";
import { applyHistory } from "../data/priceRecords";
import { applyForecasts } from "../data/forecast";
import { MarketScreen } from "./MarketScreen";

// ─── Guest mode: prices only ──────────────────────────────────────────────────
// For someone who wants to look before they sign up ("Just looking? See
// prices" on the welcome screen): the Prices page itself - this month's
// prices, the crops, each crop's sheet with its year and forecast - and
// nothing that needs an account. No tab bar, no bell, no Market; at the foot,
// what an account adds and the two ways to one.
//
// The prices are the same live ones a member sees: the catalog is open to
// guests on the database (schema.sql, section 6). The page reads today's
// prices itself; the records and the forecasts behind each crop's sheet are
// laid over the copy the app shipped with here, as the market store does for
// a member.

export function GuestScreen({ onExit, onSignUp, onSignIn, isOffline, lastUpdated }: {
  onExit: () => void;
  onSignUp: () => void;
  onSignIn: () => void;
  isOffline: boolean;
  lastUpdated: string;
}) {
  const { t } = useLang();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let alive = true;
    fetchPriceHistory().then(r => { if (alive && r.data.length) applyHistory(r.data); }).catch(() => {});
    fetchForecasts().then(r => { if (alive && r.data.length) applyForecasts(r.data); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <div className="a-screen gs">
      <MarketScreen guest={{ onSignIn }} onProfile={onSignIn} isOffline={isOffline} lastUpdated={lastUpdated} onBack={onExit} />

      {/* What an account adds, and the way to one, under the thumb. */}
      <div className="gs-dock">
        <div className="gs-cta">
          <span className="gs-cta-ico" aria-hidden="true"><TrendingUp size={20} strokeWidth={2.4} /></span>
          <span className="gs-cta-txt">
            <span className="gs-cta-t">{t("guest_cta_t")}</span>
            <span className="gs-cta-s">{t("guest_cta_s")}</span>
          </span>
        </div>
        <button type="button" className="gs-join" onClick={onSignUp}>{t("splash_create_account")}</button>
      </div>
    </div>
  );
}
