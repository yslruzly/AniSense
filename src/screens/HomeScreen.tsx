import { CloudSun, CloudMoon, BarChart2, CheckCircle, AlertTriangle, Bot, ChevronRight, ArrowUpRight, ArrowDownRight, ArrowRight, Sprout, Wallet, Megaphone } from "lucide-react";
import { useLang } from "../i18n";
import { Screen, UserRole } from "../types";
import { CROPS, CROP_GROUP_BY_ID } from "../data/crops";
import { Sparkline } from "../components/charts/Micro";
import { cropPhoto } from "../data/cropPhotos";
import { CropIcon } from "../components/icons";
import { EXPENSES } from "../data/expenses";
import { AIAdvisorCard } from "../components/analytics/AIAdvisorCard";
import { PredictedPriceCard } from "../components/analytics/PredictedPriceCard";
import { Hdr } from "../components/layout/Hdr";
import { AniSenseLogo } from "../components/AniSenseLogo";
import { useIsNight } from "../hooks/useIsNight";
import buyerMascot from "../assets/buyer-mascot.webp";

// ─── Home ─────────────────────────────────────────────────────────────────────
// A morning check, in the order a farmer asks:
//   1. Hello, what's today like?     → greeting, date, the weather in one chip
//   2. How are MY crops doing?        → only their crops, price and change
//   3. What should I do?              → the AI recommendations (unchanged)
//   4. How's my money this month?     → one figure, its trend, vs last month
//   5. Anything I should know?        → the DA advisory
//   6. Where else can I go?           → the two pages the tab bar doesn't have
// Market, Marketplace and Expenses used to be buttons here as well; the tab
// bar already has them, so they only pushed the useful things further down.

const dirOf = (n: number) => (n > 0 ? "up" : n < 0 ? "down" : "flat");

function Chg({ value }: { value: number }) {
  const dir = dirOf(value);
  const Arrow = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : ArrowRight;
  return (
    <span className={`pr-chg ${dir}`}>
      <Arrow size={14} strokeWidth={2.6} aria-hidden="true" />
      {value > 0 ? "+" : value < 0 ? "−" : ""}{Math.abs(value)}%
    </span>
  );
}

export function HomeScreen({ onNavigate, onProfile, isOffline, userName = "Juan", userInitials = "JD", userRole, farmerCrops = ["Rice", "Corn"] }: {
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
  const locale = lang === "tl" ? "fil-PH" : "en-PH";
  const isNight = useIsNight();
  const isBuyer = userRole === "buyer";
  const now = new Date();
  const dateStr = now.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" });
  const hour = now.getHours();
  // Before 5 AM it's still the night before, as far as a greeting goes.
  const greeting = hour < 5 ? t("good_evening") : hour < 12 ? t("good_morning") : hour < 18 ? t("good_afternoon") : t("good_evening");
  const firstName = userName.split(" ")[0];

  // Farmers see their own crops (each group's lead variety); buyers, who
  // don't grow anything, see the day's biggest moves instead.
  const myCrops = farmerCrops
    .map(g => CROPS.find(c => CROP_GROUP_BY_ID[c.id] === g))
    .filter((c): c is NonNullable<typeof c> => !!c);
  const movers = [...CROPS].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 4);
  const cropRows = isBuyer ? movers : myCrops;
  const up = CROPS.filter(c => c.change > 0).length;

  // This month's spend, last month's, and six months of trend for the line.
  const monthTotal = (offset: number) => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    return EXPENSES
      .filter(e => { const x = new Date(e.date); return x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear(); })
      .reduce((sum, e) => sum + e.amount, 0);
  };
  const thisMonth = monthTotal(0), lastMonth = monthTotal(1);
  const vsLast = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;
  const expenseTrend = [5, 4, 3, 2, 1, 0].map(monthTotal);

  return (
    <div className="screen">
      <Hdr icon={<AniSenseLogo size={28} />} title="AniSense" onProfile={onProfile} userInitials={userInitials} />
      <div className="scroll screen-enter">

        {/* 1 ── Greeting. The same farm as the Weather screen, by day or by
            night, and the weather itself as a chip that opens it. */}
        <section className="home-header" data-time={isNight ? "night" : "day"}>
          <div className="home-greeting">{greeting}, {firstName}! 👋</div>
          <div className="home-date">{dateStr}</div>
          <div className="hm-hero-foot">
            {!isBuyer ? (
              <button className="hm-wx" onClick={() => onNavigate("weather")}>
                {isNight ? <CloudMoon size={22} strokeWidth={2} /> : <CloudSun size={22} strokeWidth={2} />}
                <span className="hm-wx-temp">28°</span>
                <span className="hm-wx-cond">{t("wx_partly_cloudy")}</span>
                <ChevronRight size={18} strokeWidth={2.4} aria-hidden="true" />
              </button>
            ) : <span />}
            {isOffline && (
              <span className="hm-offline"><span className="hm-offline-dot" /> {t("home_offline_cached")}</span>
            )}
          </div>
        </section>

        {/* 2 ── Your crops today (buyers: the day's biggest moves). A short
            vertical list: no swiping to find your own crop among twenty. */}
        <section className="hm-card tint-green">
          <div className="hm-card-head">
            {/* Each card carries one accent, and the accent means something:
                green for what grows, gold for money, blue for the sky,
                violet for the numbers. Never a colour for its own sake. */}
            <span className="hm-ico"><Sprout size={20} strokeWidth={2.2} /></span>
            <div>
              <h2 className="hm-title">{isBuyer ? t("mkt_movers") : t("home_your_crops")}</h2>
              <div className="hm-sub">{t("mkt_pulse_head").replace("{up}", String(up)).replace("{n}", String(CROPS.length))}</div>
            </div>
            <button className="hm-link" onClick={() => onNavigate("market")}>
              {t("mkt_all")} <ChevronRight size={16} strokeWidth={2.6} />
            </button>
          </div>
          <div className="stagger-list">
            {cropRows.map(c => {
              const photo = cropPhoto(c.id);
              const group = CROP_GROUP_BY_ID[c.id] || "";
              return (
                <button key={c.id} className="hm-crop" onClick={() => onNavigate("market")}>
                  <span className="hm-crop-photo">
                    {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropIcon crop={group || c.name} size={22} />}
                  </span>
                  <span className="hm-crop-body">
                    <span className="hm-crop-name">{isBuyer ? c.name : tn(group)}</span>
                    <span className="hm-crop-var">{isBuyer ? tn(group) : c.name}</span>
                  </span>
                  <span className="hm-crop-end">
                    <span className="hm-crop-price">₱{c.pricePerKg}<small>{t("per_kg_short")}</small></span>
                    <Chg value={c.change} />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Buyers: the one thing they came for, one tap away. */}
        {isBuyer && (
          <button className="hm-shop" onClick={() => onNavigate("trade")}>
            <span className="hm-shop-copy">
              <span className="hm-shop-t">{t("home_buyer_cta_t")}</span>
              <span className="hm-shop-s">{t("home_buyer_cta_s")}</span>
              <span className="hm-shop-btn">{t("cart_browse")} <ChevronRight size={16} strokeWidth={2.6} /></span>
            </span>
            <img className="hm-shop-img" src={buyerMascot} alt="" aria-hidden="true" />
          </button>
        )}

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

        {/* 4 ── This month's spending, farmer only (the figures are farm
            expenses; a buyer's spending lives with their purchases). */}
        {!isBuyer && (
          <button className="hm-card tint-gold hm-spend" onClick={() => onNavigate("expenses")}>
            <span className="hm-ico"><Wallet size={20} strokeWidth={2.2} /></span>
            <span className="hm-spend-copy">
              <span className="hm-title">{t("home_spent_month")}</span>
              <span className="hm-spend-val">₱{thisMonth.toLocaleString()}</span>
              {/* Nothing yet: say so, rather than drawing a flat line. */}
              {thisMonth === 0 && <span className="hm-sub">{t("home_spent_none")}</span>}
              {thisMonth > 0 && vsLast !== null && (
                // More spending is not "good", so this chip reads neutral
                // grey rather than borrowing the price colours.
                <span className="hm-spend-vs">
                  {vsLast > 0 ? "▲" : vsLast < 0 ? "▼" : "•"} {Math.abs(vsLast)}% {t("home_vs_last")}
                </span>
              )}
            </span>
            {expenseTrend.some(v => v > 0) && (
              <span className="hm-spend-chart" aria-hidden="true">
                <Sparkline values={expenseTrend} width={96} height={44} tone="var(--gold-text)" />
              </span>
            )}
            <ChevronRight size={18} className="pr-row-chev" aria-hidden="true" />
          </button>
        )}

        {/* 5 ── Advisory, farmer only: one card, two rows. */}
        {!isBuyer && (
          <section className="hm-card tint-blue">
            <div className="hm-card-head">
              <span className="hm-ico"><Megaphone size={20} strokeWidth={2.2} /></span>
              <div>
                <h2 className="hm-title">{t("home_advisory")}</h2>
                <div className="hm-sub">{t("home_advisory_sub")}</div>
              </div>
            </div>
            {[
              { tone: "good", ico: <CheckCircle size={20} strokeWidth={2.2} />, txt: t("home_adv_planting"), sub: t("home_adv_planting_sub") },
              { tone: "warn", ico: <AlertTriangle size={20} strokeWidth={2.2} />, txt: t("home_adv_rain"), sub: t("home_adv_rain_sub") },
            ].map(a => (
              <div key={a.txt} className={`hm-adv ${a.tone}`}>
                <span className="hm-adv-ico">{a.ico}</span>
                <span>
                  <span className="hm-adv-t">{a.txt}</span>
                  <span className="hm-adv-s">{a.sub}</span>
                </span>
              </div>
            ))}
          </section>
        )}

        {/* 6 ── The two pages the tab bar doesn't reach. */}
        {!isBuyer && (
          <section>
            <h2 className="hm-title hm-out">{t("home_tools")}</h2>
            <div className="hm-tools">
              <button className="hm-tool tint-blue" onClick={() => onNavigate("weather")}>
                <span className="hm-tool-ico wx">{isNight ? <CloudMoon size={24} /> : <CloudSun size={24} />}</span>
                <span className="hm-tool-t">{t("home_mod_weather")}</span>
                <span className="hm-tool-s">{t("home_mod_weather_desc")}</span>
              </button>
              <button className="hm-tool tint-violet" onClick={() => onNavigate("analytics")}>
                <span className="hm-tool-ico an"><BarChart2 size={24} /></span>
                <span className="hm-tool-t">{t("home_mod_analytics")}</span>
                <span className="hm-tool-s">{t("home_mod_analytics_desc")}</span>
              </button>
            </div>
          </section>
        )}

        <div className="version-txt">AniSense v1.0.0 · Ani mo, alam mo.</div>
      </div>
    </div>
  );
}
