import { CloudSun, CloudMoon, BarChart2, CheckCircle, AlertTriangle, Bot, ChevronRight, ArrowUpRight, ArrowDownRight, ArrowRight, Sprout, Wallet, Megaphone, Store, Tag, MapPin, Search } from "lucide-react";
import { useLang } from "../i18n";
import { Screen, UserRole, TradeIntent, Listing } from "../types";
import { ShopByCrop, FeaturedProducts, FeaturedFarmers, YourPurchases, PriceMoves } from "../components/home/BuyerHome";
import { YourHarvest } from "../components/home/FarmerHome";
import { PriceAlerts } from "../components/home/PriceAlerts";
import { CropTracker } from "../components/home/CropTracker";
import { ProfitSnapshot } from "../components/home/ProfitSnapshot";
import { Sale } from "../lib/sales";
import { Planting } from "../lib/plantings";
import { PriceAlert } from "../lib/priceAlerts";
import { useViewer } from "../lib/viewer";
import { CROPS, CROP_GROUP_BY_ID } from "../data/crops";
import { LISTINGS } from "../data/marketplace";
import { cropPhotoFor } from "../data/cropPhotos";
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
import anisensePoster from "../assets/anisense-poster.webp";
import homePoster from "../assets/anisense-poster-home.webp";

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

export function HomeScreen({ onNavigate, onShop, onProfile, isOffline, userName = "Juan", userInitials = "JD", userRole, farmerCrops = ["Rice", "Corn"], listings = [], priceAlerts = [], onPriceAlerts, plantings = [], onPlantings, sales = [], onSales }: {
  onNavigate: (s: Screen) => void;
  /** Open the marketplace already showing a crop, a farmer or the search. */
  onShop?: (intent: TradeIntent) => void;
  onProfile: () => void;
  isOffline: boolean;
  lastUpdated: string;
  userName?: string;
  userInitials?: string;
  /** Live marketplace listings, so a farmer sees their own on Home. */
  listings?: Listing[];
  priceAlerts?: PriceAlert[];
  onPriceAlerts?: (next: PriceAlert[]) => void;
  plantings?: Planting[];
  onPlantings?: (next: Planting[]) => void;
  sales?: Sale[];
  onSales?: (next: Sale[]) => void;
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
  const up = CROPS.filter(c => c.change > 0).length;

  // ── Buyer figures ──────────────────────────────────────────────────────
  // What a crop goes for today, so a listing can be called cheap or not.
  const marketPrice = (crop: string, variety: string) => {
    const named = CROPS.find(c => c.name.toLowerCase() === (variety || "").toLowerCase() || c.name.toLowerCase() === crop.toLowerCase());
    if (named) return named.pricePerKg;
    const inGroup = CROPS.find(c => CROP_GROUP_BY_ID[c.id] === crop);
    return inGroup?.pricePerKg ?? null;
  };
  // The three cheapest kilos on the marketplace, with how each compares to
  // today's price. Ranking by "under market" alone leaves the card empty on
  // a day when every farmer is asking the going rate, and an empty card is
  // worse than none: this one always has something to say.
  const deals = [...LISTINGS]
    .sort((a, b) => a.pricePerKg - b.pricePerKg)
    .slice(0, 3)
    .map(l => { const m = marketPrice(l.crop, l.variety); return { l, save: m ? m - l.pricePerKg : 0 }; });
  const { location: buyerLocation } = useViewer();
  const shop = (intent: TradeIntent) => (onShop ? onShop(intent) : onNavigate("trade"));
  const sellerCount = new Set(LISTINGS.map(l => l.seller)).size;

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
      {/* Buyers open on the brand: the mark is larger and the pair sits in
          the middle of the bar, with the bell keeping its corner. */}
      <Hdr icon={<AniSenseLogo size={isBuyer ? 36 : 28} />} title="AniSense" center={isBuyer} />
      <div className="scroll screen-enter">

        {/* Buyers: search sits at the very top, under the brand and above
            the banner — the first thing on the page, because it is the one
            control that serves any errand. It opens the marketplace with
            the keyboard up rather than pretending to be a field itself. */}
        {isBuyer && (
          <button className="hm-search" onClick={() => shop({ focusSearch: true })}>
            <Search size={21} strokeWidth={2.4} aria-hidden="true" />
            <span>{t("home_search_ph")}</span>
            {/* The green key at the end: the shape people press to search. */}
            <span className="hm-search-go" aria-hidden="true">
              <Search size={20} strokeWidth={2.8} />
            </span>
          </button>
        )}

        {/* Buyers: the brand banner follows it. */}
        {isBuyer && (
          <figure className="hm-banner">
            <img src={homePoster} alt={t("home_poster_alt")} width={1000} height={500} decoding="async" />
          </figure>
        )}

        {/* 1 ── Greeting. The same farm as the Weather screen, by day or by
            night, and the weather itself as a chip that opens it. */}
        <section className="home-header" data-time={isNight ? "night" : "day"}>
          <div className="home-greeting">{greeting}, {firstName}! 👋</div>
          <div className="home-date">{dateStr}</div>
          <div className="hm-hero-foot">
            {/* Weather for both: a buyer drives out to collect what they
                buy, so rain is their business too. The advisory below is
                still farmer-only — that one is about planting. */}
            <button className="hm-wx" onClick={() => onNavigate("weather")}>
              {isNight ? <CloudMoon size={22} strokeWidth={2} /> : <CloudSun size={22} strokeWidth={2} />}
              <span className="hm-wx-temp">28°</span>
              <span className="hm-wx-cond">{t("wx_partly_cloudy")}</span>
              <ChevronRight size={18} strokeWidth={2.4} aria-hidden="true" />
            </button>
            {isOffline && (
              <span className="hm-offline"><span className="hm-offline-dot" /> {t("home_offline_cached")}</span>
            )}
          </div>
        </section>

        {/* Farmers: their own half of the marketplace. Everything else on
            this page is something to read; this is the one block about their
            business, and the only place on Home they can act from. */}
        {!isBuyer && (
          <YourHarvest
            listings={listings}
            userInitials={userInitials}
            onPost={() => shop({ post: true })}
            onOpenMarket={() => shop({})}
          />
        )}

        {/* Then every crop on one screen, as pictures. */}
        {isBuyer && <ShopByCrop onShop={shop} />}

        {/* What is worth looking at today, as products rather than rows. */}
        {isBuyer && <FeaturedProducts onShop={shop} />}

        {/* "Browse the marketplace" as the see-everything step after the
            eight crops: every way to start shopping sits in one place. */}
        {isBuyer && (
          <button className="hm-shop" onClick={() => onNavigate("trade")}>
            <span className="hm-shop-copy">
              <span className="hm-shop-t">{t("home_buyer_cta_t")}</span>
              <span className="hm-shop-s">
                {t("home_market_chip").replace("{n}", String(LISTINGS.length)).replace("{s}", String(sellerCount))}
              </span>
              <span className="hm-shop-btn">{t("cart_browse")} <ChevronRight size={16} strokeWidth={2.6} /></span>
            </span>
            <img className="hm-shop-img" src={buyerMascot} alt="" aria-hidden="true" />
          </button>
        )}

        {/* 2 ── Buyers: the day's price moves, as one light chart. */}
        {isBuyer && <PriceMoves onOpen={() => onNavigate("market")} />}

        {/* 2 ── Your crops today, farmer only. A short vertical list: no
            swiping to find your own crop among twenty. */}
        {!isBuyer && (
        <section className="hm-card tint-green">
          <div className="hm-card-head">
            {/* Each card carries one accent, and the accent means something:
                green for what grows, gold for money, blue for the sky,
                violet for the numbers. Never a colour for its own sake. */}
            <span className="hm-ico"><Sprout size={20} strokeWidth={2.2} /></span>
            <div>
              <h2 className="hm-title">{t("home_your_crops")}</h2>
              <div className="hm-sub">{t("mkt_pulse_head").replace("{up}", String(up)).replace("{n}", String(CROPS.length))}</div>
            </div>
            <button className="hm-link" onClick={() => onNavigate("market")}>
              {t("mkt_all")} <ChevronRight size={16} strokeWidth={2.6} />
            </button>
          </div>
          <div className="stagger-list">
            {myCrops.map(c => {
              const photo = cropPhoto(c.id);
              const group = CROP_GROUP_BY_ID[c.id] || "";
              return (
                <button key={c.id} className="hm-crop" onClick={() => onNavigate("market")}>
                  <span className="hm-crop-photo">
                    {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropIcon crop={group || c.name} size={22} />}
                  </span>
                  <span className="hm-crop-body">
                    <span className="hm-crop-name">{tn(group)}</span>
                    <span className="hm-crop-var">{c.name}</span>
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
        )}

        {/* The brand poster, as a mid-page break. Its last line, "buy
            directly from local farmers", is what the next section shows.
            A banner looks tappable, so it is: it opens the marketplace,
            like the poster's first line promises. The frame holds the
            poster's shape before the image loads, so nothing below jumps. */}
        {isBuyer && (
          <button className="hm-poster" onClick={() => shop({})} aria-label={t("poster_alt")}>
            <img src={anisensePoster} alt="" width={1000} height={562} loading="lazy" decoding="async" />
          </button>
        )}

        {/* Who grows it: the trust half of a marketplace, after the day's
            prices. */}
        {isBuyer && <FeaturedFarmers onShop={shop} buyerLocation={buyerLocation} />}

        {/* The cheapest kilos on the marketplace right now. */}
        {isBuyer && (
          <section className="hm-card tint-green">
            <div className="hm-card-head">
              <span className="hm-ico"><Tag size={20} strokeWidth={2.2} /></span>
              <div>
                <h2 className="hm-title">{t("home_deals")}</h2>
                <div className="hm-sub">{t("home_deals_sub")}</div>
              </div>
            </div>
            {deals.length === 0 ? (
              <p className="hm-empty">{t("home_no_deals")}</p>
            ) : (
              <div className="stagger-list">
                {deals.map(({ l, save }) => {
                  const photo = cropPhotoFor(l.crop, l.variety);
                  return (
                    <button key={l.id} className="hm-crop" onClick={() => shop({ search: l.variety || l.crop })}>
                      <span className="hm-crop-photo">
                        {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CropIcon crop={l.crop} size={22} />}
                      </span>
                      <span className="hm-crop-body">
                        <span className="hm-crop-name">{l.variety && l.variety !== l.crop ? l.variety : l.crop}</span>
                        <span className="hm-crop-var"><MapPin size={12} strokeWidth={2.4} /> {l.location} · {l.seller}</span>
                      </span>
                      <span className="hm-crop-end">
                        <span className="hm-crop-price">₱{l.pricePerKg}<small>{t("per_kg_short")}</small></span>
                        {/* The saving, not just the price: a number means more
                            beside the one it beats. */}
                        {/* Only when there is something to say. A chip on
                            every row reading "at market price" is noise, and
                            it was squeezing the seller's name off the line. */}
                        {save > 0 && <span className="pr-chg up">−₱{save} {t("home_below")}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Buy again and the running total, as one card about "my buying". */}
        {isBuyer && <YourPurchases onShop={shop} onHistory={() => onNavigate("expenses")} />}

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

        {/* What is in the ground, and how far along. The one thing on this
            page that changes overnight without the market doing anything. */}
        {!isBuyer && onPlantings && (
          <CropTracker plantings={plantings} onChange={onPlantings} />
        )}

        {/* The forecast above says a price is climbing; this is what a
            farmer does about it. Directly under the two model cards, where
            that thought happens. */}
        {!isBuyer && onPriceAlerts && (
          <PriceAlerts alerts={priceAlerts} onChange={onPriceAlerts} farmerCrops={farmerCrops} />
        )}

        {/* 4 ── Earned, spent, and what is left. It replaces the card that
            showed spending alone: a cost with nothing beside it is half the
            story, and the net is the figure a farmer is actually after. */}
        {!isBuyer && onSales && (
          <ProfitSnapshot
            sales={sales}
            onChange={onSales}
            plantings={plantings}
            onOpenExpenses={() => onNavigate("expenses")}
          />
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
