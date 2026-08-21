import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Keyboard, KeyboardResize } from "@capacitor/keyboard";

// ─── Platform layer ───────────────────────────────────────────────────────────
// Every call here is guarded and swallowed. Capacitor plugins reject on web, and
// an unhandled rejection from a haptic tap is not worth crashing a screen over,
// especially since `npm run dev` runs in a browser, where none of this exists.
//
// The rule: a missing native capability degrades to nothing happening, never to
// an error the user can see.

export const isNative = Capacitor.isNativePlatform();

const quiet = (p: Promise<unknown> | undefined) => { void p?.catch(() => {}); };

/**
 * Match the status bar to whatever is behind it.
 *
 * The bar sits on top of your content, so a dark-icon bar over the ink header
 * is invisible. `dark` here means dark *background*, so we ask for light icons.
 * Getting this backwards is the single most common Capacitor styling bug.
 */
export function setStatusBar(tone: "dark" | "light") {
  if (!isNative) return;
  quiet(StatusBar.setStyle({ style: tone === "dark" ? Style.Dark : Style.Light }));
  quiet(StatusBar.setBackgroundColor({ color: tone === "dark" ? "#16211B" : "#FAF8F3" }));
}

/**
 * Haptics. Selection is the light tick you want on a crop tile or a tab; it is
 * deliberately the quietest option, because a farmer taps these hundreds of
 * times a day and anything heavier becomes noise.
 */
export const haptic = {
  select: () => { if (isNative) quiet(Haptics.selectionStart().then(() => Haptics.selectionEnd())); },
  tap:    () => { if (isNative) quiet(Haptics.impact({ style: ImpactStyle.Light })); },
  success:() => { if (isNative) quiet(Haptics.notification({ type: NotificationType.Success })); },
  warn:   () => { if (isNative) quiet(Haptics.notification({ type: NotificationType.Warning })); },
};

/**
 * Keyboard behaviour. `Native` resize keeps the webview above the keyboard so a
 * focused input is never hidden behind it, which on a signup form means the
 * field you're typing into stays visible.
 */
export function initKeyboard() {
  if (!isNative) return;
  quiet(Keyboard.setResizeMode({ mode: KeyboardResize.Native }));
  quiet(Keyboard.setScroll({ isDisabled: false }));
}
