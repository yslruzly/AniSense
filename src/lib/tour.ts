import { Preferences } from "@capacitor/preferences";

// ─── Tour state ───────────────────────────────────────────────────────────────
// Whether this phone has already been walked through the app. One flag, kept
// in native storage, so the tour runs on the first farmer account to reach
// Home and never ambushes anyone again — including after the app is closed,
// which is the whole point of not keeping it in React state.
//
// The key carries a version. If the tour is ever rewritten for a new screen,
// bumping it to `tour-seen-2` shows the new one once to everybody.

const KEY = "tour-seen-1";

export async function loadTourSeen(): Promise<boolean> {
  try {
    const { value } = await Preferences.get({ key: KEY });
    return value === "1";
  } catch {
    // Storage unavailable: treat it as seen rather than showing the tour on
    // every launch. An unskippable loop is worse than a missed introduction.
    return true;
  }
}

export async function saveTourSeen(): Promise<void> {
  try {
    await Preferences.set({ key: KEY, value: "1" });
  } catch {
    // Nothing to do: it replays next launch, which is the harmless direction.
  }
}
