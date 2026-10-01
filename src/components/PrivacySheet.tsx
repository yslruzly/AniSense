import { X } from "lucide-react";
import { Sheet } from "./ui/Sheet";
import { PrivacyPolicy } from "./PrivacyPolicy";
import { useLang } from "../i18n";
import { PRIVACY } from "../data/privacyPolicy";

// ─── Privacy policy, in a sheet ───────────────────────────────────────────────
// The policy for someone who isn't signed in yet: opened from the welcome
// screen, read, and put away again without leaving that screen. A title bar
// that stays put with a 48px Close, the policy scrolling under it, and one
// button at the foot to go back. The policy and its name are always in
// English; the button that closes it follows the app's language.
export function PrivacySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLang();
  return (
    <Sheet open={open} onClose={onClose} className="pp-sheet" label={PRIVACY.title}>
      <div className="pp-sheet-head">
        <h2 className="pp-sheet-title" lang="en">{PRIVACY.title}</h2>
        <button type="button" className="pp-sheet-close" onClick={onClose} aria-label={t("close")}>
          <X size={20} strokeWidth={2.4} />
        </button>
      </div>
      <div className="pp-sheet-body"><PrivacyPolicy /></div>
      <div className="pp-sheet-foot">
        <button type="button" className="pp-done" onClick={onClose}>{t("pp_done")}</button>
      </div>
    </Sheet>
  );
}
