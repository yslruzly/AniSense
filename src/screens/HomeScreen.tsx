import { LayoutDashboard, Banknote, BarChart2, ShoppingCart, CloudSun, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Bot } from "lucide-react";
import { useLang } from "../i18n";
import { Screen, UserRole } from "../types";
import { CROPS } from "../data/crops";
import { EXPENSES } from "../data/expenses";
import { AIAdvisorCard } from "../components/analytics/AIAdvisorCard";
import { PredictedPriceCard } from "../components/analytics/PredictedPriceCard";

// ─── Home / Summary Screen ────────────────────────────────────────────────────
export function HomeScreen({ onNavigate, onProfile, isOffline, lastUpdated, userName = "Juan", userInitials = "JD", userRole, farmerCrops = ["Rice", "Corn"] }: {
  onNavigate: (s: Screen) => void;
  onProfile: () => void;
  isOffline: boolean;
  lastUpdated: string;
  userName?: string;
  userInitials?: string;
  userRole?: UserRole;
  farmerCrops?: string[];
}) {
  const { t, lang } = useLang();
  const now = new Date();
  const dateStr = now.toLocaleDateString(lang === "tl" ? "fil-PH" : "en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const hour = now.getHours();
  const greeting = hour < 12 ? t("good_morning") : hour < 18 ? t("good_afternoon") : t("good_evening");
  const firstName = userName.split(" ")[0];

  const allModules = [
    { id: "market" as Screen, ico: <LayoutDashboard size={24} color="var(--tanim)" />, bg: "var(--tanim-sk)", lbl: t("home_mod_market"), desc: t("home_mod_market_desc"), roles: ["farmer", "buyer"] },
    { id: "expenses" as Screen, ico: <Banknote size={24} color="var(--tanim)" />, bg: "var(--paper-alt)", lbl: t("home_mod_expenses"), desc: t("home_mod_expenses_desc"), roles: ["farmer", "buyer"] },
    { id: "analytics" as Screen, ico: <BarChart2 size={24} color="var(--ink-2)" />, bg: "var(--paper-alt)", lbl: t("home_mod_analytics"), desc: t("home_mod_analytics_desc"), roles: ["farmer"] },
    { id: "trade" as Screen, ico: <ShoppingCart size={24} color="var(--gold-text)" />, bg: "var(--gold-sk)", lbl: t("home_mod_marketplace"), desc: t("home_mod_marketplace_desc"), roles: ["farmer", "buyer"] },
    { id: "weather" as Screen, ico: <CloudSun size={24} color="var(--tanim-deep)" />, bg: "var(--paper-alt)", lbl: t("home_mod_weather"), desc: t("home_mod_weather_desc"), roles: ["farmer"] },
  ];

  const modules = userRole === "buyer"
    ? allModules.filter(m => (m.roles as string[]).includes("buyer"))
    : allModules;

  const totalExpenses = EXPENSES.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, e) => s + e.amount, 0);
  const risingCrops = CROPS.filter(c => c.change > 0).length;

  return (
    <div className="screen">
      <div className="scroll screen-enter">
        {/* Greeting card, on a lowland bukid rather than a flat colour. */}
        <div className="home-header">
          <div className="home-top">
            <div>
              <div className="home-greeting">{greeting},<br />{firstName}! 👋</div>
              <div className="home-date">{dateStr}</div>
            </div>
            <button className="home-ava-btn" onClick={onProfile}>{userInitials}</button>
          </div>
          {/* Online/offline status */}
          <div className="home-status">
            <div className="home-status-dot" style={{ background: isOffline ? "var(--error)" : "var(--palay)", animation: isOffline ? "pulse 1.5s infinite" : "none" }} />
            <span className="home-status-txt">{isOffline ? t("home_offline_cached") : t("online")}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="g2">
          <div className="card">
            <div style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>{t("home_crops_rising")}</div>
            <div style={{ fontSize: "var(--fs-display)", fontWeight: 800, color: "var(--tanim)" }}>{risingCrops}/{CROPS.length}</div>
            <div style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)", marginTop: 2 }}>{t("home_crops_up")}</div>
          </div>
          <div className="card">
            <div style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>{t("home_total_expenses")}</div>
            <div style={{ fontSize: "var(--fs-title)", fontWeight: 800, color: "var(--tanim)" }}>₱{totalExpenses.toLocaleString()}</div>
            <div style={{ fontSize: "var(--fs-label)", color: "var(--text-muted)", marginTop: 2 }}>{t("home_this_month")}</div>
          </div>
        </div>

        {/* Quick price strip */}
        <div>
          <div className="home-sec">{t("home_current_prices")}</div>
          <div className="home-sec-sub">{t("home_tap_market")}</div>
          <div className="price-strip">
            {CROPS.map(c => (
              <div key={c.id} className="price-pill">
                <div className="price-pill-name">{c.name}</div>
                <div className="price-pill-val">₱{c.pricePerKg}<span className="unit-suffix">{t("per_kg_short")}</span></div>
                <div className="price-pill-chg" style={{ color: c.change >= 0 ? "var(--tanim)" : "var(--error)" }}>
                  {c.change >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                  {c.change >= 0 ? "+" : ""}{c.change}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heading for the two model cards. Farmer-only like the cards it
            introduces, or a buyer would get a heading over nothing. */}
        {userRole !== "buyer" && (
          <div className="ai-reco-head">
            <Bot size={22} color="#fff" strokeWidth={2.2} />
            <span>{t("home_ai_recos")}</span>
          </div>
        )}

        {/* ARIMA + AI Buy/Sell/Hold, farmer only */}
        {userRole !== "buyer" && <AIAdvisorCard farmerCrops={farmerCrops} />}

        {/* Predicted Price, farmer only */}
        {userRole !== "buyer" && <PredictedPriceCard farmerCrops={farmerCrops} />}

        {/* Module buttons */}
        <div>
          <div className="home-sec">{t("home_what_to_do")}</div>
          <div className="home-sec-sub">{t("home_tap_any")}</div>
          <div className="module-grid stagger-list">
            {modules.map(m => (
              <button key={m.id} className="module-btn" onClick={() => onNavigate(m.id)}>
                <div className="module-ico-wrap" style={{ background: m.bg }}>{m.ico}</div>
                <div>
                  <div className="module-lbl">{m.lbl}</div>
                  <div className="module-desc">{m.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Farming advisory, farmer only */}
        {userRole !== "buyer" && (
          <div>
            <div className="home-sec">{t("home_advisory")}</div>
            <div className="home-sec-sub">{t("home_advisory_sub")}</div>
            {[
              { bg: "var(--tanim-sk)", border: "var(--line)", ico: <CheckCircle size={20} color="var(--tanim)" />, txt: t("home_adv_planting"), sub: t("home_adv_planting_sub") },
              { bg: "var(--gold-sk)", border: "var(--gold-line)", ico: <AlertTriangle size={20} color="var(--gold-text)" />, txt: t("home_adv_rain"), sub: t("home_adv_rain_sub") },
            ].map(a => (
              <div key={a.txt} className="adv-banner" style={{ background: a.bg, border: `1px solid ${a.border}`, marginBottom: 8 }}>
                <div style={{ flexShrink: 0, marginTop: 1 }}>{a.ico}</div>
                <div>
                  <div className="adv-banner-txt">{a.txt}</div>
                  <div className="adv-banner-sub">{a.sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="version-txt">AniSense v1.0.0 · Ani mo, alam mo.</div>
      </div>
    </div>
  );
}
