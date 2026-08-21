import { useEffect, useRef } from "react";
import { App as CapApp } from "@capacitor/app";

// ─── useHardwareBack ──────────────────────────────────────────────────────────
// On Android, back is a system-level promise. An app that ignores it, or that
// closes when the user expected to go up one level, feels broken in a way no
// amount of visual polish repairs; guideline 4 rates this High for exactly
// that reason.
//
// The contract this implements:
//   · An open sheet, modal, or picker consumes back first. Back closes it.
//   · Otherwise back goes UP one level: any screen returns to home.
//   · On home, back exits the app. It does NOT quietly do nothing; a dead back
//     button on the root screen makes people think the phone has frozen.
//
// Handlers register in a stack; the most recently mounted runs first. Return
// true to say "I handled it" and stop the chain.

type BackHandler = () => boolean;

const stack: BackHandler[] = [];
let wired = false;

function wire() {
  if (wired) return;
  wired = true;
  void CapApp.addListener("backButton", () => {
    // Most recent first: the topmost modal gets the press.
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i]()) return;
    }
    void CapApp.exitApp();
  });
}

/**
 * @param handler return true if you consumed the press
 * @param enabled skip registration when the thing isn't open
 */
export function useHardwareBack(handler: BackHandler, enabled = true) {
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    if (!enabled) return;
    wire();
    const entry: BackHandler = () => ref.current();
    stack.push(entry);
    return () => {
      const i = stack.indexOf(entry);
      if (i >= 0) stack.splice(i, 1);
    };
  }, [enabled]);
}
