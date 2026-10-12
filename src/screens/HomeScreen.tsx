import { CloudSun, CloudMoon, BarChart2, BookOpen, PlayCircle, CheckCircle, AlertTriangle, ChevronRight, Wallet, Megaphone, Store, Search } from "lucide-react";
import { useState } from "react";
import { useLang } from "../i18n";
import { haptic } from "../lib/platform";
import { Screen, UserRole, TradeIntent } from "../types";
import { ShopByCrop, FeaturedProducts, CheapestToday, FeaturedFarmers, YourPurchases, PriceMoves } from "../components/home/BuyerHome";
import { YourHarvest, YourCropPrices } from "../components/home/FarmerHome";
import { PriceAlerts } from "../components/home/PriceAlerts";
import { CropTracker } from "../components/home/CropTracker";
import { ProfitSnapshot } from "../components/home/ProfitSnapshot";
import { Sale } from "../lib/sales";
import { Planting } from "../lib/plantings";
import { PriceAlert } from "../lib/priceAlerts";
import { useViewer } from "../store/viewer";
import { CROPS, CROP_GROUP_BY_ID } from "../data/crops";
import { useWeather } from "../store/weather";
import { nextWetDay, whenSaid } from "../services/weather";
import { useMarket } from "../store/market";
import { PriceSheet } from "../components/prices/PriceSheet";
import { PriceItem } from "../services/prices";
import { SellOrWait } from "../components/home/SellOrWait";
import { Hdr } from "../components/layout/Hdr";
import { AniSenseLogo } from "../components/brand/AniSenseLogo";
import { useIsNight } from "../hooks/useIsNight";
import anisensePoster from "../assets/anisense-poster.webp";
import homePoster from "../assets/anisense-poster-home.webp";
import { PosterCarousel } from "../components/home/PosterCarousel";
import { peso } from "../lib/money";

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

export function HomeScreen({ onNavigate, onShop, onProfile, onReplayTour, isOffline, userName = "Juan", userInitials = "JD", userRole, farmerCrops = ["Rice", "Corn"], priceAlerts = [], onPriceAlerts, plantings = [], onPlantings, sales = [], onSales }: {
  onNavigate: (s: Screen) => void;
  /** Open the marketplace already showing a crop, a farmer or the search. */
  onShop?: (intent: TradeIntent) => void;
  onProfile: () => void;
  /** Runs the walkthrough again; the buyer's tutorial tile in More tools. */
  onReplayTour?: () => void;
  isOffline: boolean;
  lastUpdated: string;
  userName?: string;
  userInitials?: string;
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
  // The forecast (store/weather): its temperature on the greeting card, and
  // the day rain is likely in the advisory, when there is one.
  const wx = useWeather();
  const wet = wx.data ? nextWetDay(wx.data, new Date()) : undefined;
  // The farmer's expenses, from the database for a real account and from the
  // sample data otherwise. Not the sample ones a new account's Expenses page
  // shows: a sample was never money spent.
  const expenses = useMarket().expenses.filter(e => !e.sample);
  const isBuyer = userRole === "buyer";
  const now = new Date();
  const dateStr = now.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" });
  const hour = now.getHours();
  // Before 5 AM it's still the night before, as far as a greeting goes.
  const greeting = hour < 5 ? t("good_evening") : hour < 12 ? t("good_morning") : hour < 18 ? t("good_afternoon") : t("good_evening");
  const firstName = userName.split(" ")[0];

  // Farmers see their own crops (each group's lead variety); buyers, who
  // don't grow anything, see the day's biggest moves instead.
  // The crop whose price sheet is open: the same sheet the Prices page opens.
  const [openCrop, setOpenCrop] = useState<PriceItem | null>(null);
  const myCrops = farmerCrops
    .map(g => CROPS.find(c => CROP_GROUP_BY_ID[c.id] === g))
    .filter((c): c is NonNullable<typeof c> => !!c);

  // ── Buyer figures ──────────────────────────────────────────────────────
  const { location: buyerLocation } = useViewer();
  const shop = (intent: TradeIntent) => (onShop ? onShop(intent) : onNavigate("trade"));

  // This month's spend, last month's, and six months of trend for the line.
  const monthTotal = (offset: number) => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    return expenses
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

        {/* Search sits at the very top, under the brand and above the
            banner — the first thing on the page, because it is the one
            control that serves any errand: a buyer's shopping, a farmer
            seeing who else sells their crop and at what price. It opens the
            marketplace with the keyboard up rather than pretending to be a
            field itself. The same bar for both. */}
        <button className="hm-search" data-tour={isBuyer ? "b-search" : undefined} onClick={() => shop({ focusSearch: true })}>
          <Search size={21} strokeWidth={2.4} aria-hidden="true" />
          <span>{t("home_search_ph")}</span>
          {/* The green key at the end: the shape people press to search. */}
          <span className="hm-search-go" aria-hidden="true">
            <Search size={20} strokeWidth={2.8} />
          </span>
        </button>

        {/* Buyers: the brand banner follows it, two posters taking turns:
            "Fresh local produce" first, then "Fresh produce, better prices,
            stronger communities", cropped to the same 2:1 frame (a little
            sky and field off its foot, none of its words). A tap on either
            shows it whole and large. */}
        {isBuyer && (
          <PosterCarousel posters={[
            { src: homePoster, alt: t("home_poster_alt"), width: 1000, height: 500 },
            { src: anisensePoster, alt: t("poster_alt"), width: 1200, height: 675, position: "50% 35%" },
          ]} />
        )}

        {/* 1 ── Farmers: their good morning, the date and the weather, as
            the first of three in a banner that turns, then the same two
            AniSense posters a buyer sees. The weather button works as usual
            while the card is showing; a tap on a poster shows it whole. A
            buyer opens on the search bar and the posters; the weather they
            need is a tool, not a headline, so it lives in More tools below.
            In this taller frame the posters sit on their left edge, where
            their words are, so any cropping comes off the picture side. */}
        {!isBuyer && (
          <PosterCarousel
            lead={{
              label: `${greeting}, ${firstName}`,
              node: (
                <div className="home-header" data-time={isNight ? "night" : "day"}>
                  <div className="home-greeting">{greeting}, {firstName}! 👋</div>
                  <div className="home-date">{dateStr}</div>
                  <div className="hm-hero-foot">
                    <button className="hm-wx" onClick={() => onNavigate("weather")}>
                      {isNight ? <CloudMoon size={22} strokeWidth={2} /> : <CloudSun size={22} strokeWidth={2} />}
                      {wx.data ? (
                        <>
                          <span className="hm-wx-temp">{wx.data.now.temp}°</span>
                          <span className="hm-wx-cond">{t(isNight && wx.data.now.icon === "Sunny" ? "wx_cond_clear_night" : `wx_cond_${wx.data.now.icon}`)}</span>
                        </>
                      ) : (
                        // Not here yet, or no signal the first time: the way
                        // to the Weather page all the same, without a number.
                        <span className="hm-wx-cond">{t("wx_title")}</span>
                      )}
                      <ChevronRight size={18} strokeWidth={2.4} aria-hidden="true" />
                    </button>
                    {isOffline && (
                      <span className="hm-offline"><span className="hm-offline-dot" /> {t("home_offline_cached")}</span>
                    )}
                  </div>
                </div>
              ),
            }}
            posters={[
              { src: homePoster, alt: t("home_poster_alt"), width: 1000, height: 500, position: "0% 50%" },
              { src: anisensePoster, alt: t("poster_alt"), width: 1200, height: 675, position: "0% 35%" },
            ]} />
        )}

        {/* Farmers: their own half of the marketplace. Everything else on
            this page is something to read; this is the one block about their
            business, and the only place on Home they can act from. */}
        {!isBuyer && (
          <YourHarvest
            onPost={() => shop({ post: true })}
            onOpenMarket={() => shop({})}
            onOpen={id => shop({ listing: id })}
          />
        )}

        {/* Then every crop on one screen, as pictures. */}
        {isBuyer && <ShopByCrop onShop={shop} />}

        {/* What is worth looking at today, as products rather than rows. */}
        {isBuyer && <FeaturedProducts onShop={shop} />}

        {/* The cheapest kilos on the marketplace right now, straight after
            the featured harvests: the two "what to buy today" blocks together,
            before the invitation to browse everything. */}
        {isBuyer && <CheapestToday />}

        {/* 2 ── Your crops' prices, farmer only: a tile per crop. Tapping one
            opens its price sheet right here (this year's prices and the
            forecast), the same one the Prices page opens; "All prices" in
            the corner is the way to the full page. */}
        {!isBuyer && (
          <YourCropPrices
            crops={myCrops}
            onOpen={c => { haptic.select(); setOpenCrop({ id: c.id, name: c.name, pricePerKg: c.pricePerKg, change: c.change, group: CROP_GROUP_BY_ID[c.id] || "" }); }}
            onAll={() => onNavigate("market")}
          />
        )}

        {/* Farmers see the marketplace's best harvests too: what is selling,
            from whom and for how much, right under their own prices. */}
        {!isBuyer && <FeaturedProducts onShop={shop} />}

        {/* Who grows it: the trust half of a marketplace. */}
        {isBuyer && <FeaturedFarmers onShop={shop} buyerLocation={buyerLocation} />}

        {/* The day's price moves, as one light chart. */}
        {isBuyer && <PriceMoves onOpen={() => onNavigate("market")} />}

        {/* Buy again and the running total, as one card about "my buying". */}
        {isBuyer && <YourPurchases onShop={shop} onHistory={() => onNavigate("expenses")} />}

        {/* The AI's advice and the forecast behind it, one card per crop,
            farmer only. */}
        {userRole !== "buyer" && <SellOrWait farmerCrops={farmerCrops} />}

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
              // Only when the forecast has rain coming, and which day.
              ...(wet ? [{ tone: "warn", ico: <AlertTriangle size={20} strokeWidth={2.2} />, txt: t("home_adv_rain").replace("{when}", whenSaid(wet.date, new Date(), t, lang === "tl" ? "fil-PH" : "en-PH")), sub: t("home_adv_rain_sub") }] : []),
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

        {/* 6 ── The pages the tab bar doesn't reach. Weather is here for
            both: a buyer drives out to collect what they buy, so rain is
            their business too — it is just not their headline. Analytics
            forecasts a farm's own crops, so it stays with the farmer. */}
        <section data-tour="tools">
          <h2 className="hm-title hm-out">{t("home_tools")}</h2>
          <div className={`hm-tools${isBuyer ? " one" : ""}`}>
            {/* The weather tile shows the weather: the same field as the
                greeting card, by day or by night as it is outside. */}
            <button className="hm-tool wx-photo" data-time={isNight ? "night" : "day"} onClick={() => onNavigate("weather")}>
              <span className="hm-tool-ico wx">{isNight ? <CloudMoon size={24} /> : <CloudSun size={24} />}</span>
              <span className="hm-tool-t">{t("home_mod_weather")}</span>
              <span className="hm-tool-s">{t(isBuyer ? "home_mod_weather_buyer" : "home_mod_weather_desc")}</span>
            </button>
            {!isBuyer && (
              <button className="hm-tool tint-violet" onClick={() => onNavigate("analytics")}>
                <span className="hm-tool-ico an"><BarChart2 size={24} /></span>
                <span className="hm-tool-t">{t("home_mod_analytics")}</span>
                <span className="hm-tool-s">{t("home_mod_analytics_desc")}</span>
              </button>
            )}
            {!isBuyer && (
              <button className="hm-tool wide" onClick={() => onNavigate("guide")}>
                <span className="hm-tool-ico gd"><BookOpen size={24} /></span>
                <span className="hm-tool-t">{t("home_mod_guide")}</span>
                <span className="hm-tool-s">{t("home_mod_guide_desc")}</span>
              </button>
            )}
            {/* The buyer's counterpart. The step-by-step guide is written for
                farmers' jobs, so a buyer's tile runs their own walkthrough
                again instead, right here on Home. */}
            {isBuyer && onReplayTour && (
              <button className="hm-tool wide" onClick={onReplayTour}>
                <span className="hm-tool-ico gd"><PlayCircle size={24} /></span>
                <span className="hm-tool-t">{t("home_mod_tour")}</span>
                <span className="hm-tool-s">{t("home_mod_tour_desc")}</span>
              </button>
            )}
          </div>
        </section>

        <div className="version-txt">AniSense v1.0.0 · Ani mo, alam mo.</div>
      </div>

      {/* A farmer's own crop, opened from "Your crops' prices". */}
      <PriceSheet item={openCrop} onClose={() => setOpenCrop(null)} />
    </div>
  );
}
