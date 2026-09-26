import React, { useState } from "react";
import { ArrowLeft, Bell, BellRing, BellOff, TrendingUp, TrendingDown, CloudRain, X, Sprout, Scissors } from "lucide-react";
import { useLang } from "../../i18n";
import { haptic } from "../../lib/platform";
import { buildAlerts, Alert } from "../../data/alerts";
import { Sheet } from "../ui/Sheet";
import { useViewer } from "../../lib/viewer";

// The bell rings once per session, on the first screen that shows it with
// unread alerts: enough to say "something's waiting", and never again, so it
// doesn't become a jingle on every screen change.
let bellRung = false;

// ─── Shared Header ────────────────────────────────────────────────────────────
// No avatar on the right. It duplicated the Profile tab one thumb-reach
// below, and two doors to the same room is one more thing to read on every
// screen. The bell takes its place at the edge.
export function Hdr({ icon, title, sub, onBack, extra, center }: { icon?: React.ReactNode; title: string; sub?: string; onBack?: () => void; extra?: React.ReactNode; center?: boolean }) {
  const { t, tn } = useLang();
  const [showAlerts, setShowAlerts] = useState(false);
  const { role, location, priceAlerts, plantings } = useViewer();
  const isBuyer = role === "buyer";
  const alerts = buildAlerts(role, location, priceAlerts, plantings);

  // The badge counts what the sheet can actually show. A hardcoded "3" over an
  // empty sheet is the kind of small lie that costs trust.
  const count = alerts.length;
  const [ring] = useState(() => {
    if (bellRung || count === 0) return false;
    bellRung = true;
    return true;
  });

  // One alert, as the sheet shows it: a filled tile in the colour of what it
  // means, a small label naming the kind, the headline, one line of detail,
  // and - where there is a number - the number pulled out into a chip on the
  // right, where the eye lands last and reads first.
  type Tone = "green" | "gold" | "red" | "blue";
  const row = (a: Alert): { tone: Tone; kind: string; ico: React.ReactNode; title: string; body: string; chip?: string } => {
    const c = a.change || 0;
    const pct = `${c > 0 ? "+" : c < 0 ? "−" : ""}${Math.abs(c)}%`;
    const I = { size: 20, strokeWidth: 2.4 };
    if (a.kind === "harvest-due") {
      return {
        tone: "gold", kind: t("alert_kind_harvest"), ico: <Scissors {...I} />,
        title: t("ct_alert_title"),
        body: t("ct_alert_body").replace("{crop}", tn(a.crop || "")).replace("{days}", String(a.dayCount)),
      };
    }
    if (a.kind === "price-target") {
      return {
        tone: "green", kind: t("alert_kind_target"), ico: <BellRing {...I} />,
        title: t("pa_alert_title"),
        body: t("pa_alert_body").replace("{crop}", tn(a.crop || "")).replace("{price}", `₱${a.target}`),
        chip: `₱${a.target}`,
      };
    }
    if (a.kind === "new-listing") {
      return {
        tone: "green", kind: t("alert_kind_listing"), ico: <Sprout {...I} />,
        title: t("alert_new_near"),
        body: `${tn(a.crop || "")} · ${a.seller}`,
        chip: `₱${a.pricePerKg}${t("per_kg_short")}`,
      };
    }
    if (a.kind === "weather") {
      return {
        tone: "blue", kind: t("alert_kind_weather"), ico: <CloudRain {...I} />,
        title: t("home_adv_rain"), body: t("home_adv_rain_sub"),
      };
    }
    const down = a.kind === "price-down";
    if (isBuyer) {
      // The colours flip for a buyer: a drop is the good news, so it gets the
      // green; a rise is the warning, so it gets the gold. Red would say
      // "something is wrong", and nothing is: it is just time to buy.
      return {
        tone: down ? "green" : "gold", kind: t("alert_kind_price"),
        ico: down ? <TrendingDown {...I} /> : <TrendingUp {...I} />,
        title: down ? t("alert_buy_cheaper") : t("alert_buy_rising"),
        body: `${tn(a.crop || "")} · ${down ? t("alert_buy_cheaper_note") : t("alert_buy_rising_note")}`,
        chip: pct,
      };
    }
    return {
      tone: down ? "red" : "green", kind: t("alert_kind_price"),
      ico: down ? <TrendingDown {...I} /> : <TrendingUp {...I} />,
      title: down ? t("alert_price_down") : t("alert_price_up"),
      body: tn(a.crop || ""),
      chip: pct,
    };
  };

  return (
    <>
      <div className={`hdr${center ? " center" : ""}`}>
        <div className="hdr-brand">
          {onBack && (
            <button onClick={onBack} className="hdr-back" aria-label={t("back")}>
              <ArrowLeft size={16} color="var(--tanim)" />
            </button>
          )}
          {icon && <span className="hdr-icon">{icon}</span>}
          <div>
            <div className="hdr-title">{title}</div>
            {sub && <div className="hdr-sub">{sub}</div>}
          </div>
        </div>
        <div className="hdr-right">
          {extra}
          <button
            className="notif"
            data-tour="bell"
            aria-label={t("alerts_open")}
            onClick={() => { haptic.select(); setShowAlerts(true); }}
          >
            <span className={`notif-ico ${ring ? "ring" : ""}`}>
              <Bell size={21} color="var(--text-soft)" />
              {count > 0 && <span className="nbadge">{count}</span>}
            </span>
          </button>
        </div>
      </div>

      <Sheet
        open={showAlerts}
        onClose={() => setShowAlerts(false)}
        className="alerts-sheet modal-sheet"
        label={t("alerts_title")}
      >
        {/* The head: the bell in a glass tile, the title, what this sheet
            is for, and how many there are today - the one number that says
            whether it is worth reading now. */}
        <div className="alerts-head">
          <span className="alerts-head-ico" aria-hidden="true"><Bell size={22} strokeWidth={2.4} /></span>
          <div className="alerts-head-txt">
            <div className="alerts-head-t">
              {t("alerts_title")}
              {alerts.length > 0 && <span className="alerts-count">{t("alerts_count").replace("{n}", String(alerts.length))}</span>}
            </div>
            <div className="alerts-head-s">{t(isBuyer ? "alerts_sub_buyer" : "alerts_sub")}</div>
          </div>
          <button className="alerts-close" onClick={() => setShowAlerts(false)} aria-label={t("close")}>
            <X size={20} color="#fff" strokeWidth={2.6} />
          </button>
        </div>

        {/* Staggered, because the sheet's own travel and the rows arriving at
            once are two events competing for the same moment. Letting the
            rows follow the panel in gives the eye an order to read them in.
            Rare enough to earn it: this opens a handful of times a day. */}
        <div className="alerts-body stagger-list">
          {alerts.length === 0 ? (
            <div className="alerts-empty">
              <span className="alerts-empty-ico" aria-hidden="true"><BellOff size={26} strokeWidth={2.2} /></span>
              <div className="alerts-empty-t">{t("alerts_none")}</div>
              <div className="alerts-empty-s">{t(isBuyer ? "alerts_none_sub_buyer" : "alerts_none_sub")}</div>
            </div>
          ) : alerts.map(a => {
            const r = row(a);
            return (
              <div key={a.id} className={`alert-row ${r.tone}`}>
                <span className="alert-ico" aria-hidden="true">{r.ico}</span>
                <span className="alert-txt">
                  <span className="alert-kind">{r.kind}</span>
                  <span className="alert-t">{r.title}</span>
                  <span className="alert-b">{r.body}</span>
                </span>
                {r.chip && <span className="alert-chip">{r.chip}</span>}
              </div>
            );
          })}
        </div>
      </Sheet>
    </>
  );
}
