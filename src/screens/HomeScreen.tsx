import { LayoutDashboard, Banknote, BarChart2, ShoppingCart, CloudSun, CheckCircle, AlertTriangle } from "lucide-react";
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
    { id: "market" as Screen, ico: <LayoutDashboard size={24} color="#2e7d4f" />, bg: "#e6f2e9", lbl: t("home_mod_market"), desc: t("home_mod_market_desc"), roles: ["farmer", "buyer"] },
    { id: "expenses" as Screen, ico: <Banknote size={24} color="#3a6ea5" />, bg: "#e9eff6", lbl: t("home_mod_expenses"), desc: t("home_mod_expenses_desc"), roles: ["farmer", "buyer"] },
    { id: "analytics" as Screen, ico: <BarChart2 size={24} color="#7448c0" />, bg: "#f0eaf8", lbl: t("home_mod_analytics"), desc: t("home_mod_analytics_desc"), roles: ["farmer"] },
    { id: "trade" as Screen, ico: <ShoppingCart size={24} color="#8a5d0c" />, bg: "#fdf3dd", lbl: t("home_mod_marketplace"), desc: t("home_mod_marketplace_desc"), roles: ["farmer", "buyer"] },
    { id: "weather" as Screen, ico: <CloudSun size={24} color="#2f5586" />, bg: "#e9eff6", lbl: t("home_mod_weather"), desc: t("home_mod_weather_desc"), roles: ["farmer"] },
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
      {/* Green header */}
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
          <div className="home-status-dot" style={{ background: isOffline ? "#d4553f" : "#f7c948", animation: isOffline ? "pulse 1.5s infinite" : "none" }} />
          <span className="home-status-txt">{isOffline ? t("home_offline_cached") : t("online")}</span>
        </div>
      </div>

      <div className="scroll">
        {/* Quick Stats */}
        <div className="g2">
          <div className="card" style={{ borderLeft: "4px solid #2e7d4f" }}>
            <div style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>{t("home_crops_rising")}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#2e7d4f" }}>{risingCrops}/{CROPS.length}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{t("home_crops_up")}</div>
          </div>
          <div className="card" style={{ borderLeft: "4px solid #3a6ea5" }}>
            <div style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>{t("home_total_expenses")}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#3a6ea5" }}>₱{totalExpenses.toLocaleString()}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{t("home_this_month")}</div>
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
                <div className="price-pill-val">₱{c.pricePerKg}</div>
                <div className="price-pill-chg" style={{ color: c.change >= 0 ? "#2f9e63" : "#c74133" }}>
                  {c.change >= 0 ? "+" : ""}{c.change}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ARIMA + AI Buy/Sell/Hold — farmer only */}
        {userRole !== "buyer" && <AIAdvisorCard farmerCrops={farmerCrops} />}

        {/* Predicted Price — farmer only */}
        {userRole !== "buyer" && <PredictedPriceCard farmerCrops={farmerCrops} />}

        {/* Module buttons */}
        <div>
          <div className="home-sec">{t("home_what_to_do")}</div>
          <div className="home-sec-sub">{t("home_tap_any")}</div>
          <div className="module-grid">
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

        {/* Farming advisory — farmer only */}
        {userRole !== "buyer" && (
          <div>
            <div className="home-sec">{t("home_advisory")}</div>
            <div className="home-sec-sub">{t("home_advisory_sub")}</div>
            {[
              { bg: "#e6f2e9", border: "#b3d9c0", ico: <CheckCircle size={20} color="#2e7d4f" />, txt: t("home_adv_planting"), sub: t("home_adv_planting_sub") },
              { bg: "#fdf3dd", border: "#f0dca6", ico: <AlertTriangle size={20} color="#8a5d0c" />, txt: t("home_adv_rain"), sub: t("home_adv_rain_sub") },
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
