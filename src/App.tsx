import { lazy, Suspense, useMemo, useRef, useState } from "react";
import { ScreenContent, ScreenLoading } from "./components/layout/ScreenContent";
import type { Session } from "@supabase/supabase-js";
import { Screen, AuthScreen, UserRole, FarmDetails, TradeIntent } from "./types";
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
import { BottomNav } from "./components/layout/BottomNav";
import { LanguageScreen } from "./screens/auth/LanguageScreen";
import { SplashScreen } from "./screens/auth/SplashScreen";
import { RoleScreen } from "./screens/auth/RoleScreen";
import { WelcomeID, WelcomeInfo, makeMemberId } from "./components/profile/WelcomeID";
import { Tour } from "./components/tour/Tour";
import { loadTourSeen, saveTourSeen, TourName } from "./lib/tour";
import { ViewerContext } from "./store/viewer";
import { isSupabaseConfigured } from "./lib/supabase";
import {
  restoreSession, onAuthChange, signOut, deleteMyAccount, getMyProfile, updateMyProfile,
  toFarmerProfile, accountFromSession, rememberedMemberNo, rememberMemberNo, toE164Phone, setMyPhoto,
} from "./services/auth";
import { FarmerProfile } from "./types";
import { Sale } from "./lib/sales";
import { MarketContext, useMarketStore } from "./store/market";
import { AchievementId, earnedAchievements, loadSeenAchievements, saveSeenAchievements } from "./lib/achievements";
import { AchievementUnlocked } from "./components/profile/AchievementUnlocked";
import { useRetained } from "./hooks/usePresence";
import { kvRemove } from "./lib/localdb";
import { requireOnline, wipeAccountData } from "./lib/cache";
import { dropOutboxFor } from "./lib/outbox";

// Load each destination when opened; the chunks still ship inside the APK.
const AuthFormScreen = lazy(() => import("./screens/auth/AuthFormScreen").then(m => ({ default: m.AuthFormScreen })));
const HomeScreen = lazy(() => import("./screens/HomeScreen").then(m => ({ default: m.HomeScreen })));
const MarketScreen = lazy(() => import("./screens/MarketScreen").then(m => ({ default: m.MarketScreen })));
const ExpensesScreen = lazy(() => import("./screens/ExpensesScreen").then(m => ({ default: m.ExpensesScreen })));
const AnalyticsScreen = lazy(() => import("./screens/AnalyticsScreen").then(m => ({ default: m.AnalyticsScreen })));
const TradeScreen = lazy(() => import("./screens/TradeScreen").then(m => ({ default: m.TradeScreen })));
const WeatherScreen = lazy(() => import("./screens/WeatherScreen").then(m => ({ default: m.WeatherScreen })));
const GuideScreen = lazy(() => import("./screens/GuideScreen").then(m => ({ default: m.GuideScreen })));
const GuestScreen = lazy(() => import("./screens/GuestScreen").then(m => ({ default: m.GuestScreen })));
const ProfileScreen = lazy(() => import("./screens/ProfileScreen").then(m => ({ default: m.ProfileScreen })));

// The bottom-nav destinations. Anything else is a page opened from one of them.
const TABS: Screen[] = ["home", "market", "trade", "expenses", "profile"];

// The role of the last account used on this phone. "I already have an
// account" goes straight to Sign in, with no language or role step: a real
// account brings its own role. Until then this only picks who greets them on
// Sign in, and, in the demo, which sample account opens. Farmer if none yet.
const LAST_ROLE = "anisense-last-role";
const lastRole = (): UserRole => localStorage.getItem(LAST_ROLE) === "buyer" ? "buyer" : "farmer";

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  // ── Auth state ──
  // The welcome board is the root. Language is the first step of signing up
  // rather than a one-time gate ahead of the app; signing in goes straight to
  // its page.
  const [authScreen, setAuthScreen] = useState<AuthScreen>("splash");
  const [authFlow, setAuthFlow] = useState<"signin" | "signup">("signup");
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [userName, setUserName] = useState("Juan Dela Cruz");
  const [userRole, setUserRole] = useState<UserRole>(null);
  useEffect(() => {
    if (userRole) localStorage.setItem(LAST_ROLE, userRole);
  }, [userRole]);
  // The signed-in database account, when there is one. Null in the demo.
  const [accountId, setAccountId] = useState<string | null>(null);
  // The welcome ID: set once, when an account is created, and shown over Home.
  const [welcome, setWelcome] = useState<WelcomeInfo | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  // Set when an account has just been made; the ID opens a beat after Home.
  // Opened in the same render that first builds the whole app, the card's
  // drop played out while the phone was still busy drawing Home, and on
  // screen it simply appeared - no drop, no swing, the backdrop already dark.
  const [welcomePending, setWelcomePending] = useState(false);
  const [idMode, setIdMode] = useState<"welcome" | "view">("welcome");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  // True while a saved session is being looked for at launch. Without it a
  // returning user watches the welcome board flash past on the way to Home.
  const [booting, setBooting] = useState(isSupabaseConfigured);

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
  // ── Where you were, in each tab ──
  // Each tab keeps its place, the way a phone's own apps do: how far down
  // each page was scrolled, and the page last open in it (Privacy, opened
  // from Profile; Weather, from Home). Leave a tab and come back, and it is
  // as you left it; a Back button returns to the spot it left. A page opened
  // fresh from a button starts at its top. Tapping the tab you are on goes
  // to its first page, or, already there, glides to the top. Kept for the
  // session, and forgotten on signing out.
  const scrollAt = useRef<Partial<Record<Screen, number>>>({});
  const openedFrom = useRef<Partial<Record<Screen, Screen>>>({});
  const lastIn = useRef<Partial<Record<Screen, Screen>>>({});
  // ── The guided tour ──
  // Runs once per role on this phone, on the first Home the account lands
  // on. It is held back until the welcome ID is out of the way, because two
  // things introducing themselves at once is neither of them being read.
  const [tourOpen, setTourOpen] = useState(false);
  const [tourPending, setTourPending] = useState(false);
  // Which script is running: the Home tour for the role, or Expenses.
  const [tourScript, setTourScript] = useState<TourName | null>(null);
  const tourChecked = useRef(false);
  useEffect(() => {
    if (!isAuthed || !userRole || tourChecked.current) return;
    tourChecked.current = true;
    loadTourSeen(userRole).then(seen => { if (!seen) setTourPending(true); });
  }, [isAuthed, userRole]);
  // Home first, then the ID. The wait starts after Home has painted (this is
  // an effect), so on a slow phone the card still drops, swings and shines
  // in full view; and it opens from closed, so the backdrop fades in too.
  useEffect(() => {
    if (!isAuthed || !welcomePending) return;
    const id = setTimeout(() => { setWelcomePending(false); setShowWelcome(true); }, 380);
    return () => clearTimeout(id);
  }, [isAuthed, welcomePending]);

  useEffect(() => {
    if (!tourPending || showWelcome || welcomePending || active !== "home") return;
    // Home's own entrance runs first; the spotlight lands on a page that has
    // finished arriving rather than on one still sliding into place.
    const id = setTimeout(() => { setTourPending(false); setTourScript(userRole); setTourOpen(true); }, 520);
    return () => clearTimeout(id);
  }, [tourPending, showWelcome, welcomePending, active]);

  // The Expenses walkthrough: not part of the Home tour. It waits for the
  // first time a farmer opens Expenses on this phone (a new account's, or
  // anyone's who has not seen it yet), and can be asked for again from
  // Profile. Leaving Expenses before it starts keeps it for next time.
  const [expTourPending, setExpTourPending] = useState(false);
  const expTourChecked = useRef(false);
  useEffect(() => {
    if (!isAuthed || userRole !== "farmer" || active !== "expenses" || expTourChecked.current) return;
    expTourChecked.current = true;
    loadTourSeen("expenses").then(seen => { if (!seen) setExpTourPending(true); });
  }, [isAuthed, userRole, active]);
  useEffect(() => {
    if (!expTourPending || active !== "expenses" || tourOpen || showWelcome || welcomePending) return;
    // As on Home: the page arrives first, then the light.
    const id = setTimeout(() => { setExpTourPending(false); setTourScript("expenses"); setTourOpen(true); }, 520);
    return () => clearTimeout(id);
  }, [expTourPending, active, tourOpen, showWelcome, welcomePending]);
  const replayExpensesTour = () => { navigate("expenses"); setExpTourPending(true); };

  const endTour = () => { setTourOpen(false); if (tourScript) void saveTourSeen(tourScript); };

  // ── Achievements unlocked ──
  // A new account's badges are news (Newbie, at least); an account opened
  // here for the first time after this feature existed has its current ones
  // filed quietly, so nobody is greeted by a pile of old celebrations.
  const justJoined = useRef(false);
  const [achQueue, setAchQueue] = useState<AchievementId[]>([]);
  const [achOpen, setAchOpen] = useState(false);
  // Asked for from the guide page or from Profile: go to Home first, because
  // Home is what the tour is about, then let the effect above start it.
  const replayTour = () => { navigate("home"); setTourPending(true); };

  // Listings, sellers, purchases and expenses live here, not inside the
  // screens. A screen is unmounted whenever the farmer changes tab, so a
  // harvest they had just posted disappeared on the way back; and Home
  // cannot show a farmer their own listings from state it cannot see.
  // The store reads the database for a real account, and the sample data
  // otherwise (src/store/market.tsx).
  const initials = userName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const market = useMarketStore({ accountId, role: userRole, name: userName, initials });
  // A farmer's own records (price alerts, plantings, sales typed in) live in
  // the store too: on the database for a real account, on the phone in the
  // demo. Their earnings are the typed sales plus what they sold through the
  // marketplace; only the typed ones are theirs to edit.
  const { priceAlerts, setPriceAlerts, plantings, setPlantings } = market;
  const allSales = useMemo(
    () => market.marketSales.length ? [...market.sales, ...market.marketSales] : market.sales,
    [market.sales, market.marketSales],
  );
  const setTypedSales = (next: Sale[]) => market.setSales(next.filter(s => !s.id.startsWith("tx-")));

  // Whose badges these are: the database account, or this phone's demo one.
  const achOwner = isAuthed && userRole === "farmer" ? (accountId ?? "demo") : null;
  // Compare what the farmer has earned with what they have been shown, every
  // time their listings, sales or the week's spotlight change: a harvest
  // posted is a badge unlocked, right then.
  useEffect(() => {
    if (!achOwner || market.loading) return;
    const earned = [...earnedAchievements({
      listings: market.listings, isMine: market.isMine, sellers: market.sellers,
      sellerKeyOf: market.sellerKeyOf, sales: allSales, awarded: market.awards,
    })];
    let alive = true;
    (async () => {
      let seen = await loadSeenAchievements(achOwner);
      if (justJoined.current) {
        // A brand-new account starts with nothing shown, whatever an earlier
        // account on this phone had seen.
        justJoined.current = false;
        seen = [];
        await saveSeenAchievements(achOwner, []);
      }
      if (!alive) return;
      if (seen === null) { await saveSeenAchievements(achOwner, earned); return; }
      // Newbie comes with joining, which already has the welcome ID and the
      // walkthrough: it shows as earned on Profile, but gets no pop-up.
      const fresh = earned.filter(x => x !== "newbie" && !seen!.includes(x));
      if (fresh.length) setAchQueue(q => [...q, ...fresh.filter(x => !q.includes(x))]);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achOwner, market.loading, market.listings, market.sellers, market.awards, allSales]);

  // Shown when nothing else is: never over the welcome ID or the walkthrough,
  // and a beat after the screen underneath has settled.
  const achBlocked = showWelcome || welcomePending || tourOpen || tourPending;
  useEffect(() => {
    if (achOpen || achQueue.length === 0 || achBlocked || !isAuthed) return;
    const id = window.setTimeout(() => setAchOpen(true), 650);
    return () => window.clearTimeout(id);
  }, [achQueue.length, achBlocked, achOpen, isAuthed]);
  // Held while the sheet closes, so it fades out still showing its badge.
  const shownAch = useRetained(achQueue[0] ?? null);
  // Every save carries everything marked this session, so two quick taps of
  // "Next" can't have the second save overwrite the first.
  const achMarked = useRef<AchievementId[]>([]);
  const markAchSeen = (ids: AchievementId[]) => {
    if (!achOwner || ids.length === 0) return;
    achMarked.current = [...achMarked.current, ...ids];
    void loadSeenAchievements(achOwner).then(seen => saveSeenAchievements(achOwner, [...(seen ?? []), ...achMarked.current]));
  };
  const nextAch = () => {
    const [cur, ...rest] = achQueue;
    if (cur) markAchSeen([cur]);
    setAchQueue(rest);
    if (rest.length === 0) setAchOpen(false);
  };

  // Set only by openMarketplace, and cleared by every other navigation, so a
  // later tap on the Market tab opens the plain marketplace, not the last
  // filter Home asked for.
  const [tradeIntent, setTradeIntent] = useState<TradeIntent | null>(null);
  // The tab a screen belongs to: a tab is its own; a page, the tab it was opened from.
  const tabOf = (s: Screen): Screen => (TABS.includes(s) ? s : openedFrom.current[s] ?? "home");
  const scroller = () => document.querySelector<HTMLElement>(".shell > .screen .scroll");
  // `resume`: back to a page as it was left (the tab bar), not opened afresh.
  const navigate = (next: Screen, resume = false) => {
    if (next === active) return;
    // Note where this page was left, and that it was the last one seen in its tab.
    const here = scroller();
    if (here) scrollAt.current[active] = here.scrollTop;
    lastIn.current[tabOf(active)] = active;
    // A page opened from a button belongs to the tab it was opened from, and starts at its top.
    if (!resume && !TABS.includes(next)) {
      openedFrom.current[next] = tabOf(active);
      delete scrollAt.current[next];
    }
    setTradeIntent(null);
    setNav(resume ? "tab" : !TABS.includes(next) ? "push" : !TABS.includes(active) ? "pop" : "tab");
    setRevisit(visited.current.has(next));
    visited.current.add(next);
    setActive(next);
  };
  // The tab bar. Another tab: back to where you were in it. The tab you are
  // in: from a page opened in it, its first page; on that page already, up
  // to the top.
  const navigateTab = (tab: Screen) => {
    if (tab === active) {
      const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      scroller()?.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
      return;
    }
    if (tabOf(active) === tab) { navigate(tab); return; }
    const last = lastIn.current[tab];
    navigate(last ?? tab, !!last && last !== tab);
  };
  // Home sending the buyer to particular harvests: the Market opens fresh, at its top.
  const openMarketplace = (intent: TradeIntent) => { delete scrollAt.current.trade; navigate("trade"); setTradeIntent(intent); };

  const { isOffline, lastUpdated } = useOffline();

  useEffect(() => { initKeyboard(); }, []);

  // The status bar sits over the content, so it has to follow whatever screen is
  // underneath it. Auth and the app headers are ink; the rest is paper.
  useEffect(() => {
    // Every signup screen is ink at the top -- the terraces photo on welcome,
    // the ink header on the rest -- and the bar now sits over it, so the icons
    // stay light for the whole flow.
    // The welcome is a light page, so its icons go dark.
    if (!isAuthed) { setStatusBar(authScreen === "splash" ? "light" : "dark"); return; }
    // Home used to open on a full-bleed ink header; the greeting is a card on
    // paper now, so the bar matches the paper like every other screen.
    setStatusBar("light");
  }, [isAuthed, authScreen, active]);

  // Back during auth walks the flow backwards rather than exiting mid-signup.
  useHardwareBack(() => {
    if (isAuthed) return false;
    if (authScreen === "signin") { setAuthScreen(authFlow === "signin" ? "splash" : "role"); return true; }
    if (authScreen === "role")   { setAuthScreen("lang"); return true; }
    if (authScreen === "lang")   { setAuthScreen("splash"); return true; }
    if (authScreen === "guest")  { setAuthScreen("splash"); return true; }
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
    // This is the demo (no database): the number is made here, in the
    // database's form. A real account's comes from its profile row
    // (applySession, below).
    setWelcome({ id: makeMemberId(), since: new Date() });
    justJoined.current = isNew;
    // A new account always gets the walkthrough after its welcome ID. The
    // "seen" flag is kept per phone and role, so without this, a second
    // account made on the same phone would never be shown round.
    if (isNew) { tourChecked.current = true; setTourPending(true); }
    if (isNew) {
      setActive("home");
      setIdMode("welcome");
      setWelcomePending(true);
    }
    setIsAuthed(true);
  };

  // ── Real accounts (Supabase) ──
  // A session opens the app on what the account says: its name, its role,
  // its town and crops. The copy inside the session is enough to open
  // straight away, offline included; the profile row then replaces it, since
  // that is where edits made on another phone land.
  const applySession = (session: Session, isNew: boolean) => {
    const { role, profile } = accountFromSession(session);
    setAccountId(session.user.id);
    setUserName(profile.name);
    setUserRole(role);
    setFarmerProfile(profile);
    // The member number comes from the profile row. Until it arrives, the
    // number this phone last saw for the account, or a dash on the card.
    const since = new Date(session.user.created_at ?? Date.now());
    setWelcome({ id: "", since });
    void rememberedMemberNo(session.user.id).then(no => { if (no) setWelcome(w => (w && !w.id ? { ...w, id: no } : w)); });
    justJoined.current = isNew;
    // A new account always gets the walkthrough after its welcome ID. The
    // "seen" flag is kept per phone and role, so without this, a second
    // account made on the same phone would never be shown round.
    if (isNew) { tourChecked.current = true; setTourPending(true); }
    if (isNew) {
      setActive("home");
      setIdMode("welcome");
      setWelcomePending(true);
    }
    setIsAuthed(true);
    getMyProfile()
      .then(row => {
        if (!row) return;
        setUserName(row.full_name);
        setUserRole(row.role);
        setFarmerProfile(toFarmerProfile(row, session.user.email ?? ""));
        setUserPhoto(row.avatar_url ?? null);
        if (row.member_no) {
          const memberNo = row.member_no;
          setWelcome(w => (w ? { id: memberNo, since: row.created_at ? new Date(row.created_at) : since } : w));
          void rememberMemberNo(session.user.id, memberNo);
        }
      })
      .catch(() => { /* offline or not yet reachable: the session's copy stands */ });
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let alive = true;
    // With no signal, the session saved on the phone opens it (services/auth.ts).
    restoreSession()
      .then(({ session: s }) => { if (alive && s) applySession(s, false); })
      .catch(() => {})
      .finally(() => { if (alive) setBooting(false); });
    // Signed out somewhere else, or the session could not be renewed: back
    // to the welcome board rather than a Home that can no longer load.
    const off = onAuthChange((_s, event) => { if (alive && event === "SIGNED_OUT") resetToSplash(); });
    return () => { alive = false; off(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Profile edits, kept on the account so they follow it to any phone. */
  const saveProfile = (p: FarmerProfile) => {
    setFarmerProfile(p);
    setUserName(p.name);
    if (!isSupabaseConfigured) return;
    const years = parseInt(p.experience, 10);
    void updateMyProfile({
      full_name: p.name,
      location: p.location,
      crops: p.crops,
      ...(p.phone.replace(/\D/g, "") ? { phone: toE164Phone(p.phone) } : {}),
      ...(Number.isFinite(years) ? { years_farming: years } : {}),
    }).catch(() => { /* kept on this phone; saved again with the next edit */ });
  };

  // A new photo, from the Profile or the ID card: shown at once, then saved to
  // the account so it is there on the next start and on another phone. If it
  // can't be saved, the one before comes back and the caller says so. The
  // demo has no account, so there it stays on this phone for the visit.
  const changePhoto = async (dataUrl: string) => {
    const before = userPhoto;
    setUserPhoto(dataUrl);
    if (!isSupabaseConfigured) return;
    try { await setMyPhoto(dataUrl); }
    catch (e) { setUserPhoto(before); throw e; }
  };

  const handleSignOut = () => {
    if (isSupabaseConfigured) void signOut().catch(() => {});
    resetToSplash();
  };

  // Deleting the account: the server first (it throws if it can't, and the
  // sheet says so), then what this phone kept for it, then out to the welcome
  // screen. In the demo there is no server account, so it clears the demo's
  // records from this phone.
  const handleDeleteAccount = async () => {
    if (isSupabaseConfigured && accountId) {
      requireOnline("Deleting your account");
      await deleteMyAccount();
      await Promise.all([wipeAccountData(accountId), dropOutboxFor(accountId)]).catch(() => {});
    } else {
      await Promise.all(["sales", "plantings", "price_alerts", "harvest-plans", "ach_seen:demo"]
        .map(key => kvRemove(key))).catch(() => {});
    }
    localStorage.removeItem(LAST_ROLE);
    resetToSplash();
  };

  const resetToSplash = () => {
    setIsAuthed(false);
    setAuthScreen("splash");
    setSelectedRole(null);
    setUserRole(null);
    setAccountId(null);
    setActive("home");
    setShowWelcome(false);
    setWelcomePending(false);
    setWelcome(null);
    setUserPhoto(null);
    visited.current = new Set(["home"]);
    scrollAt.current = {}; openedFrom.current = {}; lastIn.current = {};
    setRevisit(false);
    setNav("tab");
    // The next account on this phone may be the other role, with its own
    // tour still unseen: look again when it signs in.
    tourChecked.current = false;
    setTourPending(false);
    setTourOpen(false);
    expTourChecked.current = false;
    setExpTourPending(false);
    justJoined.current = false;
    achMarked.current = [];
    setAchQueue([]);
    setAchOpen(false);
  };

  // ── Auth flow ──
  if (booting) {
    return (
      <>
        <style>{tokensCss}</style>
        <style>{authCss}</style>
        <div className="auth-outer"><div className="auth-shell" aria-busy="true" /></div>
      </>
    );
  }
  if (!isAuthed) {
    return (
      <>
        <style>{tokensCss}</style>
        <style>{authCss}</style>
        <style>{sheetCss}</style>
        <style>{pickerCss}</style>
        <style>{buttonCss}</style>
        {/* The guest's Prices page is an app page, so it needs the app's styles. */}
        {authScreen === "guest" && <style>{appCss}</style>}
        <div className="auth-outer">
          <div className="auth-shell">
            <Suspense fallback={<ScreenLoading />}>
            {authScreen === "lang" && (
              <LanguageScreen
                onDone={() => setAuthScreen("role")}
                onBack={() => setAuthScreen("splash")}
              />
            )}
            {authScreen === "splash" && (
              <SplashScreen
                onSignIn={() => { setAuthFlow("signin"); setSelectedRole(lastRole()); setAuthScreen("signin"); }}
                onSignUp={() => { setAuthFlow("signup"); setAuthScreen("lang"); }}
                onGuest={() => setAuthScreen("guest")}
              />
            )}
            {/* Guest mode: the prices only, and the way to an account. */}
            {authScreen === "guest" && (
              <GuestScreen
                onExit={() => setAuthScreen("splash")}
                onSignUp={() => { setAuthFlow("signup"); setAuthScreen("lang"); }}
                onSignIn={() => { setAuthFlow("signin"); setSelectedRole(lastRole()); setAuthScreen("signin"); }}
                isOffline={isOffline}
                lastUpdated={lastUpdated}
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
                onBack={() => setAuthScreen(authFlow === "signin" ? "splash" : "role")}
                // Straight from the welcome screen there was no language or
                // role step, so a new account starts with them.
                onCreateAccount={authFlow === "signin" ? () => { setAuthFlow("signup"); setSelectedRole(null); setAuthScreen("lang"); } : undefined}
                onSuccess={handleAuthSuccess}
                onSession={applySession}
              />
            )}
            </Suspense>
          </div>
        </div>
      </>
    );
  }

  // ── Main app ──
  const goHome = () => navigate("home");
  const openProfile = () => navigate("profile");
  const goBack = () => navigate("home");

  const renderScreen = () => {
    switch (active) {
      case "home": return <HomeScreen onNavigate={navigate} onShop={openMarketplace} onReplayTour={replayTour} priceAlerts={priceAlerts} onPriceAlerts={setPriceAlerts} plantings={plantings} onPlantings={setPlantings} sales={allSales} onSales={setTypedSales} onProfile={openProfile} isOffline={isOffline} lastUpdated={lastUpdated} userName={userName} userInitials={initials} userRole={userRole} farmerCrops={farmerProfile.crops} />;
      case "market": return <MarketScreen onProfile={openProfile} isOffline={isOffline} lastUpdated={lastUpdated} onBack={goHome} userInitials={initials} userRole={userRole} />;
      case "expenses": return <ExpensesScreen onProfile={openProfile} onBack={goHome} farmerCrops={farmerProfile.crops} userInitials={initials} isBuyer={userRole === "buyer"} sales={allSales} />;
      case "analytics": return <AnalyticsScreen onProfile={openProfile} onBack={goHome} userInitials={initials} farmerCrops={farmerProfile.crops} />;
      case "trade": return <TradeScreen onProfile={openProfile} onBack={goHome} userName={userName} userInitials={initials} userRole={userRole} intent={tradeIntent ?? undefined} />;
      case "guide": return <GuideScreen onBack={goHome} onReplay={replayTour} />;
      case "weather": return <WeatherScreen onProfile={openProfile} onBack={goHome} userInitials={initials} userRole={userRole} />;
      case "profile": return <ProfileScreen onNavigate={navigate} onBack={goBack} profile={farmerProfile} setProfile={saveProfile} onSignOut={handleSignOut} onDeleteAccount={handleDeleteAccount} userInitials={initials} userRole={userRole} userPhoto={userPhoto} onPhoto={changePhoto} onShowId={() => { setIdMode("view"); setShowWelcome(true); }} onReplayTour={replayTour} onReplayExpensesTour={userRole === "farmer" ? replayExpensesTour : undefined} sales={allSales} memberSince={welcome?.since} />;
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
      <ViewerContext.Provider value={{ role: userRole, location: farmerProfile.location, priceAlerts, plantings, orders: market.incomingOrders, confirmOrder: market.confirmOrder }}>
      <MarketContext.Provider value={market}>
      <div className="outer">
        <div className="shell" data-nav={nav} data-revisit={revisit || undefined}>
          <Suspense fallback={<ScreenLoading />} key={active}>
            <ScreenContent scrollTop={scrollAt.current[active] ?? 0}>
              {renderScreen()}
            </ScreenContent>
          </Suspense>
          <BottomNav active={tabOf(active)} onNavigate={navigateTab} />
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
            onPhoto={changePhoto}
          />
          {/* Last inside the shell, so it covers the tab bar and the ID. */}
          <AchievementUnlocked
            id={shownAch}
            open={achOpen}
            remaining={Math.max(0, achQueue.length - 1)}
            memberSince={welcome?.since}
            onNext={nextAch}
            onSeeAll={() => { markAchSeen(achQueue); setAchQueue([]); setAchOpen(false); navigate("profile"); }}
          />
          <Tour open={tourOpen} onFinish={endTour} script={tourScript} />
        </div>
      </div>
      </MarketContext.Provider>
      </ViewerContext.Provider>
    </>
  );
}
