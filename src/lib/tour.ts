import { Preferences } from "@capacitor/preferences";

// ─── Tour state ───────────────────────────────────────────────────────────────
// Whether this phone has already been walked through the app. One flag, kept
// in native storage, so the tour runs on the first account of each role to
// reach Home and never ambushes anyone again — including after the app is closed,
// which is the whole point of not keeping it in React state.
//
// The key carries a version. If the tour is ever rewritten for a new screen,
// bumping it to `tour-seen-2` shows the new one once to everybody.
//
// One flag per role. A respondent who tries the farmer side and then signs up
// as a buyer on the same phone has not seen the buyer's tour; one shared flag
// would have skipped it. The farmer's key keeps its original name so phones
// that already saw the farmer tour are not shown it a second time.
const keyFor = (role: "farmer" | "buyer") => (role === "buyer" ? "tour-seen-1-buyer" : "tour-seen-1");

export async function loadTourSeen(role: "farmer" | "buyer"): Promise<boolean> {
  try {
    const { value } = await Preferences.get({ key: keyFor(role) });
    return value === "1";
  } catch {
    // Storage unavailable: treat it as seen rather than showing the tour on
    // every launch. An unskippable loop is worse than a missed introduction.
    return true;
  }
}

export async function saveTourSeen(role: "farmer" | "buyer"): Promise<void> {
  try {
    await Preferences.set({ key: keyFor(role), value: "1" });
  } catch {
    // Nothing to do: it replays next launch, which is the harmless direction.
  }
}
