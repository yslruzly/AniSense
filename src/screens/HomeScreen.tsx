import { Store, PhilippinePeso, BarChart2, CloudSun, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Bot, ChevronRight } from "lucide-react";
import { useLang } from "../i18n";
import { Screen, UserRole } from "../types";
import { CROPS, CROP_GROUP_BY_ID } from "../data/crops";
import { DotRow, Sparkline } from "../components/charts/Micro";
import { cropPhoto } from "../data/cropPhotos";
import { CropIcon } from "../components/icons";
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
  const { t, tn, lang } = useLang();
  const now = new Date();
  const dateStr = now.toLocaleDateString(lang === "tl" ? "fil-PH" : "en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const hour = now.getHours();
  const greeting = hour < 12 ? t("good_morning") : hour < 18 ? t("good_afternoon") : t("good_evening");
  const firstName = userName.split(" ")[0];

  const allModules = [
    { id: "market" as Screen, ico: <TrendingUp size={24} color="var(--tanim)" />, bg: "var(--tanim-sk)", lbl: t("home_mod_market"), desc: t("home_mod_market_desc"), roles: ["farmer", "buyer"] },
    { id: "weather" as Screen, ico: <CloudSun size={24} color="var(--tanim-deep)" />, bg: "var(--paper-alt)", lbl: t("home_mod_weather"), desc: t("home_mod_weather_desc"), roles: ["farmer"] },
    { id: "expenses" as Screen, ico: <PhilippinePeso size={24} color="var(--tanim)" />, bg: "var(--paper-alt)", lbl: t("home_mod_expenses"), desc: t("home_mod_expenses_desc"), roles: ["farmer", "buyer"] },
    { id: "analytics" as Screen, ico: <BarChart2 size={24} color="var(--ink-2)" />, bg: "var(--paper-alt)", lbl: t("home_mod_analytics"), desc: t("home_mod_analytics_desc"), roles: ["farmer"] },
    { id: "trade" as Screen, ico: <Store size={24} color="var(--gold-text)" />, bg: "var(--gold-sk)", lbl: t("home_mod_marketplace"), desc: t("home_mod_marketplace_desc"), roles: ["farmer", "buyer"] },
  ];

  const modules = userRole === "buyer"
    ? allModules.filter(m => (m.roles as string[]).includes("buyer"))
    : allModules;

  const totalExpenses = EXPENSES.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, e) => s + e.amount, 0);
  const risingCrops = CROPS.filter(c => c.change > 0).length;

  // The five that moved most today, either direction — what a farmer actually
  // scans a home screen for. The full twenty live in Market.
  const topMovers = [...CROPS].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 5);

  // Six months of spend, oldest first, for the sparkline under the total.
  const expenseTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return EXPENSES
      .filter(e => { const x = new Date(e.date); return x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear(); })
      .reduce((sum, e) => sum + e.amount, 0);
  });

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

        {/* Quick stats. The mark shows the shape behind the figure — how many of
            the twenty rose, and which way the month has been running. */}
        <div className="g2">
          <div className="stat">
            <div className="stat-lbl">{t("home_crops_rising")}</div>
            <div className="stat-mark"><DotRow total={CROPS.length} filled={risingCrops} /></div>
            <div className="stat-val">{risingCrops}/{CROPS.length}</div>
            <div className="stat-foot">{t("home_crops_up")}</div>
          </div>
          <div className="stat">
            <div className="stat-lbl">{t("home_total_expenses")}</div>
            <div className="stat-mark"><Sparkline values={expenseTrend} /></div>
            <div className="stat-val sm">₱{totalExpenses.toLocaleString()}</div>
            <div className="stat-foot">{t("home_this_month")}</div>
          </div>
        </div>

        {/* Current prices. A horizontal strip you swipe through, each crop
            carrying its own photograph so the row is scannable by sight
            rather than by reading twenty names. */}
        <div>
          <div className="home-sec">{t("home_current_prices")}</div>
          <div className="home-sec-sub">{t("home_tap_market")}</div>
          <div className="price-strip">
            {CROPS.map(c => {
              const up = c.change >= 0;
              return (
                <button key={c.id} className="pcard" onClick={() => onNavigate("market")}>
                  <span className="pcard-photo">
                    {cropPhoto(c.id)
                      ? <img src={cropPhoto(c.id)} alt="" loading="lazy" decoding="async" />
                      : <CropIcon crop={CROP_GROUP_BY_ID[c.id] || c.name} size={24} />}
                    <span className={`pcard-chg ${up ? "up" : "down"}`}>
                      {up ? <TrendingUp size={13} strokeWidth={2.8} /> : <TrendingDown size={13} strokeWidth={2.8} />}
                      {up ? "+" : ""}{c.change}%
                    </span>
                  </span>
                  <span className="pcard-name">{c.name}</span>
                  <span className="pcard-group">{tn(CROP_GROUP_BY_ID[c.id] || "")}</span>
                  <span className="pcard-price">
                    ₱{c.pricePerKg}<span className="unit-suffix">{t("per_kg_short")}</span>
                  </span>
                </button>
              );
            })}
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
                <div className="module-text">
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
