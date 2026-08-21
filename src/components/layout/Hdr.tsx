import React, { useState } from "react";
import { ArrowLeft, Bell, TrendingUp, TrendingDown, CloudRain, X } from "lucide-react";
import { useLang } from "../../i18n";
import { haptic } from "../../lib/platform";
import { buildAlerts, Alert } from "../../data/alerts";

// ─── Shared Header ────────────────────────────────────────────────────────────
export function Hdr({ icon, title, sub, onProfile, onBack, userInitials = "JD", extra }: { icon: React.ReactNode; title: string; sub: string; onProfile?: () => void; onBack?: () => void; userInitials?: string; extra?: React.ReactNode }) {
  const { t, tn } = useLang();
  const [showAlerts, setShowAlerts] = useState(false);
  const alerts = buildAlerts();

  // The badge counts what the sheet can actually show. A hardcoded "3" over an
  // empty sheet is the kind of small lie that costs trust.
  const count = alerts.length;

  const row = (a: Alert) => {
    if (a.kind === "weather") {
      return {
        ico: <CloudRain size={20} color="var(--gold-text)" />,
        bg: "var(--gold-sk)",
        title: t("home_adv_rain"),
        body: t("home_adv_rain_sub"),
      };
    }
    const up = a.kind === "price-up";
    return {
      ico: up ? <TrendingUp size={20} color="var(--tanim)" /> : <TrendingDown size={20} color="var(--error)" />,
      bg: up ? "var(--tanim-sk)" : "var(--error-sk)",
      title: up ? t("alert_price_up") : t("alert_price_down"),
      body: `${tn(a.crop || "")} · ${(a.change || 0) > 0 ? "+" : ""}${a.change}%`,
    };
  };

  return (
    <>
      <div className="hdr">
        <div className="hdr-brand">
          {onBack && (
            <button onClick={onBack} className="hdr-back" aria-label={t("back")}>
              <ArrowLeft size={16} color="var(--tanim)" />
            </button>
          )}
          <span className="hdr-icon">{icon}</span>
          <div>
            <div className="hdr-title">{title}</div>
            <div className="hdr-sub">{sub}</div>
          </div>
        </div>
        <div className="hdr-right">
          {extra}
          <button
            className="notif"
            aria-label={t("alerts_open")}
            onClick={() => { haptic.select(); setShowAlerts(true); }}
          >
            <span className="notif-ico">
              <Bell size={21} color="var(--text-soft)" />
              {count > 0 && <span className="nbadge">{count}</span>}
            </span>
          </button>
          <button className="ava" onClick={onProfile} disabled={!onProfile}>{userInitials}</button>
        </div>
      </div>

      {showAlerts && (
        <div className="alerts-scrim" onClick={() => setShowAlerts(false)}>
          <div className="alerts-sheet modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="alerts-head">
              <div>
                <div className="alerts-head-t">{t("alerts_title")}</div>
                <div className="alerts-head-s">{t("alerts_sub")}</div>
              </div>
              <button className="alerts-close" onClick={() => setShowAlerts(false)} aria-label={t("close")}>
                <X size={22} color="#fff" strokeWidth={2.4} />
              </button>
            </div>

            <div className="alerts-body">
              {alerts.length === 0 ? (
                <div className="alerts-empty">
                  <div className="alerts-empty-t">{t("alerts_none")}</div>
                  <div className="alerts-empty-s">{t("alerts_none_sub")}</div>
                </div>
              ) : alerts.map(a => {
                const r = row(a);
                return (
                  <div key={a.id} className="alert-row">
                    <span className="alert-ico" style={{ background: r.bg }}>{r.ico}</span>
                    <span className="alert-txt">
                      <span className="alert-t">{r.title}</span>
                      <span className="alert-b">{r.body}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
