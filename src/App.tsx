import { useState } from "react";
import { Screen, AuthScreen, UserRole, FarmDetails } from "./types";
import { useOffline } from "./hooks/useOffline";
import { authCss } from "./styles/authStyles";
import { appCss } from "./styles/appStyles";
import { BUYER_TRANSACTIONS } from "./data/expenses";
import { BottomNav } from "./components/layout/BottomNav";
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
  const [authScreen, setAuthScreen] = useState<AuthScreen>("splash");
  const [authFlow, setAuthFlow] = useState<"signin" | "signup">("signup");
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [userName, setUserName] = useState("Juan Dela Cruz");
  const [userRole, setUserRole] = useState<UserRole>(null);

  // ── App state ──
  const [active, setActive] = useState<Screen>("home");
  const { isOffline, lastUpdated } = useOffline();

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
        <style>{authCss}</style>
        <div className="auth-outer">
          <div className="auth-shell">
            {authScreen === "splash" && (
              <SplashScreen
                onSignIn={() => { setAuthFlow("signin"); setAuthScreen("role"); }}
                onSignUp={() => { setAuthFlow("signup"); setAuthScreen("role"); }}
              />
            )}
            {authScreen === "role" && (
              <RoleScreen
                flow={authFlow}
                onBack={() => setAuthScreen("splash")}
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
      case "trade": return <TradeScreen onProfile={openProfile} onBack={goHome} userInitials={initials} userRole={userRole} />;
      case "weather": return <WeatherScreen onProfile={openProfile} onBack={goHome} userInitials={initials} />;
      case "profile": return <ProfileScreen onNavigate={setActive} onBack={goBack} profile={farmerProfile} setProfile={setFarmerProfile} onSignOut={handleSignOut} userInitials={initials} userRole={userRole} />;
    }
  };

  return (
    <>
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
