import React, { useState } from "react";
import { ArrowLeft, Bell, BellRing, BellOff, TrendingUp, TrendingDown, CloudRain, X, Sprout, Scissors, ShoppingBag, Phone, Check, MapPin } from "lucide-react";
import { useLang } from "../../i18n";
import { haptic } from "../../lib/platform";
import { buildAlerts, openAlerts, Alert } from "../../lib/alerts";
import { IncomingOrder } from "../../types";
import { Sheet } from "../ui/Sheet";
import { useViewer } from "../../store/viewer";
import { peso } from "../../lib/money";

// ─── An order from a buyer ────────────────────────────────────────────────────
// The one alert that asks the farmer to do something, so it is the one alert
// with buttons. It reads in the order the farmer acts: who ordered and what
// (the name, the kilos, the total), their number in full, then the two steps
// as two full-width buttons: call the buyer, then confirm the order. Call is
// the filled one, because it comes first; nothing is agreed until they have
// spoken.
//
// Confirmed, the card settles: a tick and "You confirmed this order" where
// Confirm was, and Call stays, quieter, in case the farmer needs the buyer
// again. It no longer counts on the bell.
function OrderAlert({ order, onConfirm }: { order: IncomingOrder; onConfirm: (id: string) => void }) {
  const { t, lang } = useLang();
  const done = order.status === "confirmed";
  const tel = order.phone.replace(/[^\d+]/g, "");
  const peso = `₱${order.amount.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
  // "12 min ago", "2 hr ago", then the date.
  const mins = Math.max(0, Math.round((Date.now() - new Date(order.placedAt).getTime()) / 60_000));
  const when = mins < 1 ? t("ord_just_now")
    : mins < 60 ? t("ord_min_ago").replace("{n}", String(mins))
    : mins < 24 * 60 ? t("ord_hr_ago").replace("{n}", String(Math.round(mins / 60)))
    : new Date(order.placedAt).toLocaleDateString(lang === "tl" ? "fil-PH" : "en-PH", { month: "short", day: "numeric" });
  return (
    <div className={`alert-row alert-order green ${done ? "done" : ""}`}>
      <div className="ord-top">
        <span className="alert-ico" aria-hidden="true">
          {done ? <Check size={22} strokeWidth={2.8} /> : <ShoppingBag size={20} strokeWidth={2.4} />}
        </span>
        <span className="alert-txt">
          <span className="alert-kind">{t(done ? "alert_kind_order_done" : "alert_kind_order")} · {when}</span>
          <span className="ord-name">{order.buyer}</span>
          <span className="ord-what">{order.kg} kg {order.crop}</span>
        </span>
        <span className="alert-chip">{peso}</span>
      </div>

      {/* The buyer's number and town, written out: the farmer may want to
          read the number, save it, or call from another phone. */}
      <div className="ord-facts">
        <span className="ord-fact"><Phone size={17} strokeWidth={2.4} aria-hidden="true" /><span className="ord-phone">{order.phone}</span></span>
        <span className="ord-fact"><MapPin size={17} strokeWidth={2.4} aria-hidden="true" />{order.location}</span>
      </div>

      {!done && <p className="ord-hint">{t("ord_hint")}</p>}

      <div className="ord-actions">
        <a className={`ord-btn call ${done ? "quiet" : ""}`} href={`tel:${tel}`} onClick={() => haptic.tap()}
          aria-label={`${t("ord_call")}: ${order.buyer}, ${order.phone}`}>
          <Phone size={20} strokeWidth={2.4} aria-hidden="true" /> {t("ord_call")}
        </a>
        {done ? (
          <div className="ord-done" role="status">
            <Check size={20} strokeWidth={2.8} aria-hidden="true" /> {t("ord_confirmed")}
          </div>
        ) : (
          <button type="button" className="ord-btn confirm" onClick={() => { haptic.success(); onConfirm(order.id); }}>
            <Check size={20} strokeWidth={2.6} aria-hidden="true" /> {t("ord_confirm")}
          </button>
        )}
      </div>
    </div>
  );
}

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
  const { role, location, priceAlerts, plantings, orders, confirmOrder } = useViewer();
  const isBuyer = role === "buyer";
  const alerts = buildAlerts(role, location, priceAlerts, plantings, orders);

  // The badge counts what the sheet can actually show. A hardcoded "3" over an
  // empty sheet is the kind of small lie that costs trust. An order the
  // farmer has confirmed stays in the sheet but stops counting: it is done.
  const count = openAlerts(alerts);
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
        body: t("pa_alert_body").replace("{crop}", tn(a.crop || "")).replace("{price}", peso(a.target ?? 0)),
        chip: peso(a.target ?? 0),
      };
    }
    if (a.kind === "new-listing") {
      return {
        tone: "green", kind: t("alert_kind_listing"), ico: <Sprout {...I} />,
        title: t("alert_new_near"),
        body: `${tn(a.crop || "")} · ${a.seller}`,
        chip: `${peso(a.pricePerKg ?? 0)}${t("per_kg_short")}`,
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
              {count > 0 && <span className="alerts-count">{t("alerts_count").replace("{n}", String(count))}</span>}
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
            if (a.order) return <OrderAlert key={a.id} order={a.order} onConfirm={confirmOrder} />;
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
