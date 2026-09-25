import { useRef, useState } from "react";
import { Screen, AuthScreen, UserRole, FarmDetails, TradeIntent, Listing } from "./types";
import { useOffline } from "./hooks/useOffline";
import { useHardwareBack } from "./hooks/useHardwareBack";
import { setStatusBar, initKeyboard } from "./lib/platform";
import { useEffect } from "react";
import { tokensCss } from "./styles/tokens";
import { authCss } from "./styles/authStyles";
import { appCss } from "./styles/appStyles";
import { pickerCss } from "./styles/pickerStyles";
import { sheetCss } from "./styles/sheetStyles";
import { buttonCss } from "./styles/buttonStyles";
import { tourCss } from "./styles/tourStyles";
import { BUYER_TRANSACTIONS } from "./data/expenses";
import { LISTINGS } from "./data/marketplace";
import { BottomNav } from "./components/layout/BottomNav";
import { LanguageScreen } from "./screens/auth/LanguageScreen";
import { SplashScreen } from "./screens/auth/SplashScreen";
import { RoleScreen } from "./screens/auth/RoleScreen";
import { AuthFormScreen } from "./screens/auth/AuthFormScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { MarketScreen } from "./screens/MarketScreen";
import { ExpensesScreen } from "./screens/ExpensesScreen";
import { AnalyticsScreen } from "./screens/AnalyticsScreen";
import { TradeScreen } from "./screens/TradeScreen";
import { WeatherScreen } from "./screens/WeatherScreen";
import { GuideScreen } from "./screens/GuideScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { WelcomeID, WelcomeInfo, makeMemberId } from "./components/WelcomeID";
import { Tour } from "./components/tour/Tour";
import { loadTourSeen, saveTourSeen } from "./lib/tour";
import { ViewerContext } from "./lib/viewer";
import { PriceAlert, loadAlerts, saveAlerts } from "./lib/priceAlerts";
import { Planting, loadPlantings, savePlantings } from "./lib/plantings";
import { Sale, loadSales, saveSales } from "./lib/sales";

// The bottom-nav destinations. Anything else is a page opened from one of them.
const TABS: Screen[] = ["home", "market", "trade", "expenses", "profile"];

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  // ── Auth state ──
  // The welcome board is the root. Language is now the first step of signing in
  // or signing up rather than a one-time gate ahead of the app.
  const [authScreen, setAuthScreen] = useState<AuthScreen>("splash");
  const [authFlow, setAuthFlow] = useState<"signin" | "signup">("signup");
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [userName, setUserName] = useState("Juan Dela Cruz");
  const [userRole, setUserRole] = useState<UserRole>(null);
  // The welcome ID: set once, when an account is created, and shown over Home.
  const [welcome, setWelcome] = useState<WelcomeInfo | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [idMode, setIdMode] = useState<"welcome" | "view">("welcome");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  // ── App state ──
  const [active, setActive] = useState<Screen>("home");
  // How the last navigation moved, so the screen can enter the right way:
  // tab switches cross-fade, pages opened from Home (Weather, Analytics)
  // slide in from the right and slide back out the way they came.
  const [nav, setNav] = useState<"tab" | "push" | "pop">("tab");
  // Screens already seen this session. On a revisit the entrance cascades
  // and growing bars are skipped: they earn their place once, not on the
  // twentieth tab switch of the day.
  const visited = useRef(new Set<Screen>(["home"]));
  const [revisit, setRevisit] = useState(false);
  // Price targets a farmer set. Loaded once from native storage, and
  // written back whenever they change, so they outlive the app closing.
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const alertsLoaded = useRef(false);
  useEffect(() => { loadAlerts().then(a => { setPriceAlerts(a); alertsLoaded.current = true; }); }, []);
  useEffect(() => { if (alertsLoaded.current) saveAlerts(priceAlerts); }, [priceAlerts]);

  // What the farmer sold. The income half of the profit snapshot; the app
  // has no other record of a farmer's earnings.
  const [sales, setSales] = useState<Sale[]>([]);
  const salesLoaded = useRef(false);
  useEffect(() => { loadSales().then(s => { setSales(s); salesLoaded.current = true; }); }, []);
  useEffect(() => { if (salesLoaded.current) saveSales(sales); }, [sales]);

  // What the farmer has in the ground. Same shape as the price targets:
  // read once at launch, written back on every change.
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const plantingsLoaded = useRef(false);
  useEffect(() => { loadPlantings().then(p => { setPlantings(p); plantingsLoaded.current = true; }); }, []);
  useEffect(() => { if (plantingsLoaded.current) savePlantings(plantings); }, [plantings]);

  // ── The guided tour ──
  // Runs once per role on this phone, on the first Home the account lands
  // on. It is held back until the welcome ID is out of the way, because two
  // things introducing themselves at once is neither of them being read.
  const [tourOpen, setTourOpen] = useState(false);
  const [tourPending, setTourPending] = useState(false);
  const tourChecked = useRef(false);
  useEffect(() => {
    if (!isAuthed || !userRole || tourChecked.current) return;
    tourChecked.current = true;
    loadTourSeen(userRole).then(seen => { if (!seen) setTourPending(true); });
  }, [isAuthed, userRole]);
  useEffect(() => {
    if (!tourPending || showWelcome || active !== "home") return;
    // Home's own entrance runs first; the spotlight lands on a page that has
    // finished arriving rather than on one still sliding into place.
    const id = setTimeout(() => { setTourPending(false); setTourOpen(true); }, 520);
    return () => clearTimeout(id);
  }, [tourPending, showWelcome, active]);
  const endTour = () => { setTourOpen(false); if (userRole) void saveTourSeen(userRole); };
  // Asked for from the guide page or from Profile: go to Home first, because
  // Home is what the tour is about, then let the effect above start it.
  const replayTour = () => { navigate("home"); setTourPending(true); };

  // The marketplace listings live here, not inside the marketplace screen.
  // That screen is unmounted whenever the farmer changes tab, so a harvest
  // they had just posted disappeared on the way back; and Home cannot show
  // a farmer their own listings from state it cannot see.
  const [listings, setListings] = useState<Listing[]>(() => [...LISTINGS]);

  // Set only by openMarketplace, and cleared by every other navigation, so a
  // later tap on the Market tab opens the plain marketplace, not the last
  // filter Home asked for.
  const [tradeIntent, setTradeIntent] = useState<TradeIntent | null>(null);
  const navigate = (next: Screen) => {
    if (next === active) return;
    setTradeIntent(null);
    setNav(!TABS.includes(next) ? "push" : !TABS.includes(active) ? "pop" : "tab");
    setRevisit(visited.current.has(next));
    visited.current.add(next);
    setActive(next);
  };
  const openMarketplace = (intent: TradeIntent) => { navigate("trade"); setTradeIntent(intent); };
  const { isOffline, lastUpdated } = useOffline();

  useEffect(() => { initKeyboard(); }, []);

  // The status bar sits over the content, so it has to follow whatever screen is
  // underneath it. Auth and the app headers are ink; the rest is paper.
  useEffect(() => {
    // Every signup screen is ink at the top -- the terraces photo on welcome,
    // the ink header on the rest -- and the bar now sits over it, so the icons
    // stay light for the whole flow.
    if (!isAuthed) { setStatusBar("dark"); return; }
    // Home used to open on a full-bleed ink header; the greeting is a card on
    // paper now, so the bar matches the paper like every other screen.
    setStatusBar("light");
  }, [isAuthed, authScreen, active]);

  // Back during auth walks the flow backwards rather than exiting mid-signup.
  useHardwareBack(() => {
    if (isAuthed) return false;
    if (authScreen === "signin") { setAuthScreen("role"); return true; }
    if (authScreen === "role")   { setAuthScreen("lang"); return true; }
    if (authScreen === "lang")   { setAuthScreen("splash"); return true; }
    return false; // splash is the root, so back exits
  }, !isAuthed);

  // In the app, back goes up to home; on home it falls through and exits.
  useHardwareBack(() => {
    if (!isAuthed) return false;
    if (active !== "home") { navigate("home"); return true; }
    return false;
  }, isAuthed);

  const [farmerProfile, setFarmerProfile] = useState({
    name: "Juan Dela Cruz",
    phone: "+63 912 345 6789",
    email: "juan.delacruz@gmail.com",
    location: "Cabanatuan City, Nueva Ecija",
    experience: "12 years",
    crops: ["Rice", "Corn"],
  });

  // ── Auth handlers ──
  const handleRoleSelect = (role: UserRole, flow: "signin" | "signup") => {
    setSelectedRole(role);
    setAuthFlow(flow);
    setAuthScreen("signin");
  };

  const handleAuthSuccess = (name: string, role: UserRole, crops: string[] = ["Rice", "Corn"], farmDetails?: FarmDetails, isNew = false) => {
    setUserName(name);
    setUserRole(role);
    setFarmerProfile(p => ({
      ...p,
      name,
      crops: crops.length > 0 ? crops : p.crops,
      ...(farmDetails ? {
        location: farmDetails.location,
        ...(farmDetails.years ? { experience: `${farmDetails.years} years` } : {}),
        ...(farmDetails.phone ? { phone: `+63 ${farmDetails.phone.replace(/^0/, "")}` } : {}),
      } : {}),
    }));
    // Every account has a member ID (Profile can show it any time). New
    // accounts also land on Home with it open; closing leaves them there.
    // Until the database is wired, a signed-in account's ID and "since" are
    // made at sign-in; they should come from the user's record.
    setWelcome({ id: makeMemberId(), since: new Date() });
    if (isNew) {
      setActive("home");
      setIdMode("welcome");
      setShowWelcome(true);
    }
    setIsAuthed(true);
  };

  const handleSignOut = () => {
    setIsAuthed(false);
    setAuthScreen("splash");
    setSelectedRole(null);
    setUserRole(null);
    setActive("home");
    setShowWelcome(false);
    setWelcome(null);
    setUserPhoto(null);
    visited.current = new Set(["home"]);
    setRevisit(false);
    setNav("tab");
    // The next account on this phone may be the other role, with its own
    // tour still unseen: look again when it signs in.
    tourChecked.current = false;
    setTourPending(false);
    setTourOpen(false);
  };

  // ── Auth flow ──
  if (!isAuthed) {
    return (
      <>
        <style>{tokensCss}</style>
        <style>{authCss}</style>
        <style>{sheetCss}</style>
        <style>{pickerCss}</style>
        <style>{buttonCss}</style>
        <div className="auth-outer">
          <div className="auth-shell">
            {authScreen === "lang" && (
              <LanguageScreen
                onDone={() => setAuthScreen("role")}
                onBack={() => setAuthScreen("splash")}
              />
            )}
            {authScreen === "splash" && (
              <SplashScreen
                onSignIn={() => { setAuthFlow("signin"); setAuthScreen("lang"); }}
                onSignUp={() => { setAuthFlow("signup"); setAuthScreen("lang"); }}
              />
            )}
            {authScreen === "role" && (
              <RoleScreen
                flow={authFlow}
                onBack={() => setAuthScreen("lang")}
                onSelect={handleRoleSelect}
              />
            )}
            {authScreen === "signin" && (
              <AuthFormScreen
                flow={authFlow}
                role={selectedRole}
                onBack={() => setAuthScreen("role")}
                onSuccess={handleAuthSuccess}
              />
            )}
          </div>
        </div>
      </>
    );
  }

  // ── Main app ──
  const initials = userName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const goHome = () => navigate("home");
  const openProfile = () => navigate("profile");
  const goBack = () => navigate("home");

  const renderScreen = () => {
    switch (active) {
      case "home": return <HomeScreen onNavigate={navigate} onShop={openMarketplace} listings={listings} priceAlerts={priceAlerts} onPriceAlerts={setPriceAlerts} plantings={plantings} onPlantings={setPlantings} sales={sales} onSales={setSales} onProfile={openProfile} isOffline={isOffline} lastUpdated={lastUpdated} userName={userName} userInitials={initials} userRole={userRole} farmerCrops={farmerProfile.crops} />;
      case "market": return <MarketScreen onProfile={openProfile} isOffline={isOffline} lastUpdated={lastUpdated} onBack={goHome} userInitials={initials} userRole={userRole} />;
      case "expenses": return <ExpensesScreen onProfile={openProfile} onBack={goHome} farmerCrops={farmerProfile.crops} userInitials={initials} isBuyer={userRole === "buyer"} buyerTransactions={BUYER_TRANSACTIONS} />;
      case "analytics": return <AnalyticsScreen onProfile={openProfile} onBack={goHome} userInitials={initials} farmerCrops={farmerProfile.crops} />;
      case "trade": return <TradeScreen onProfile={openProfile} onBack={goHome} userName={userName} userInitials={initials} userRole={userRole} intent={tradeIntent ?? undefined} listings={listings} setListings={setListings} />;
      case "guide": return <GuideScreen onBack={goHome} onReplay={replayTour} />;
      case "weather": return <WeatherScreen onProfile={openProfile} onBack={goHome} userInitials={initials} userRole={userRole} />;
      case "profile": return <ProfileScreen onNavigate={navigate} onBack={goBack} profile={farmerProfile} setProfile={setFarmerProfile} onSignOut={handleSignOut} userInitials={initials} userRole={userRole} userPhoto={userPhoto} onShowId={() => { setIdMode("view"); setShowWelcome(true); }} onReplayTour={replayTour} />;
    }
  };

  return (
    <>
      <style>{tokensCss}</style>
      <style>{appCss}</style>
      <style>{sheetCss}</style>
      <style>{pickerCss}</style>
      <style>{buttonCss}</style>
      <style>{tourCss}</style>
      <ViewerContext.Provider value={{ role: userRole, location: farmerProfile.location, priceAlerts, plantings }}>
      <div className="outer">
        <div className="shell" data-nav={nav} data-revisit={revisit || undefined}>
          {renderScreen()}
          <BottomNav active={active} onNavigate={navigate} />
          <WelcomeID
            open={showWelcome}
            onClose={() => setShowWelcome(false)}
            mode={idMode}
            name={farmerProfile.name}
            initials={initials}
            role={userRole}
            location={farmerProfile.location}
            info={welcome}
            photo={userPhoto}
            onPhoto={setUserPhoto}
          />
          {/* Last inside the shell, so it covers the tab bar and the ID. */}
          <Tour open={tourOpen} onFinish={endTour} role={userRole} />
        </div>
      </div>
      </ViewerContext.Provider>
    </>
  );
}
