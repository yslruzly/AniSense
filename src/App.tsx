import { useState } from "react";
import { Screen, AuthScreen, UserRole, FarmDetails } from "./types";
import { useOffline } from "./hooks/useOffline";
import { useHardwareBack } from "./hooks/useHardwareBack";
import { setStatusBar, initKeyboard } from "./lib/platform";
import { useEffect } from "react";
import { tokensCss } from "./styles/tokens";
import { authCss } from "./styles/authStyles";
import { appCss } from "./styles/appStyles";
import { BUYER_TRANSACTIONS } from "./data/expenses";
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
import { ProfileScreen } from "./screens/ProfileScreen";

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

  // ── App state ──
  const [active, setActive] = useState<Screen>("home");
  const { isOffline, lastUpdated } = useOffline();

  useEffect(() => { initKeyboard(); }, []);

  // The status bar sits over the content, so it has to follow whatever screen is
  // underneath it. Auth and the app headers are ink; the rest is paper.
  useEffect(() => {
    if (!isAuthed) { setStatusBar(authScreen === "splash" ? "dark" : "light"); return; }
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
    if (active !== "home") { setActive("home"); return true; }
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

  const handleAuthSuccess = (name: string, role: UserRole, crops: string[] = ["Rice", "Corn"], farmDetails?: FarmDetails) => {
    setUserName(name);
    setUserRole(role);
    setFarmerProfile(p => ({
      ...p,
      name,
      crops: crops.length > 0 ? crops : p.crops,
      ...(farmDetails ? {
        experience: `${farmDetails.years} years`,
        location: farmDetails.location,
        phone: `+63 ${farmDetails.phone.replace(/^0/, "")}`,
      } : {}),
    }));
    setIsAuthed(true);
  };

  const handleSignOut = () => {
    setIsAuthed(false);
    setAuthScreen("splash");
    setSelectedRole(null);
    setUserRole(null);
    setActive("home");
  };

  // ── Auth flow ──
  if (!isAuthed) {
    return (
      <>
        <style>{tokensCss}</style>
        <style>{authCss}</style>
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

  const goHome = () => setActive("home");
  const openProfile = () => setActive("profile");
  const goBack = () => setActive("home");

  const renderScreen = () => {
    switch (active) {
      case "home": return <HomeScreen onNavigate={setActive} onProfile={openProfile} isOffline={isOffline} lastUpdated={lastUpdated} userName={userName} userInitials={initials} userRole={userRole} farmerCrops={farmerProfile.crops} />;
      case "market": return <MarketScreen onProfile={openProfile} isOffline={isOffline} lastUpdated={lastUpdated} onBack={goHome} userInitials={initials} userRole={userRole} />;
      case "expenses": return <ExpensesScreen onProfile={openProfile} onBack={goHome} farmerCrops={farmerProfile.crops} userInitials={initials} isBuyer={userRole === "buyer"} buyerTransactions={BUYER_TRANSACTIONS} />;
      case "analytics": return <AnalyticsScreen onProfile={openProfile} onBack={goHome} userInitials={initials} farmerCrops={farmerProfile.crops} />;
      case "trade": return <TradeScreen onProfile={openProfile} onBack={goHome} userName={userName} userInitials={initials} userRole={userRole} />;
      case "weather": return <WeatherScreen onProfile={openProfile} onBack={goHome} userInitials={initials} />;
      case "profile": return <ProfileScreen onNavigate={setActive} onBack={goBack} profile={farmerProfile} setProfile={setFarmerProfile} onSignOut={handleSignOut} userInitials={initials} userRole={userRole} />;
    }
  };

  return (
    <>
      <style>{tokensCss}</style>
      <style>{appCss}</style>
      <div className="outer">
        <div className="shell">
          {renderScreen()}
          <BottomNav active={active} onNavigate={setActive} />
        </div>
      </div>
    </>
  );
}
