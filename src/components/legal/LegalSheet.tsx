import { X } from "lucide-react";
import { Sheet } from "../ui/Sheet";
import { LegalDocument } from "./LegalDocument";
import { useLang } from "../../i18n";
import { LegalDocData } from "../../data/privacyPolicy";
import { useRetained } from "../../hooks/usePresence";

// ─── A legal document, in a sheet ─────────────────────────────────────────────
// The Privacy Policy or the Terms of Service, read and put away again without
// leaving the screen it was opened from (welcome, sign-up, Profile). A title
// bar that stays put with a 48px Close, the document scrolling under it, and
// one button at the foot to go back. The document and its name are always in
// English; the button that closes it follows the app's language.
//
// `doc` null closes it. The last document is kept while the sheet slides
// away, so it never empties on the way out.
export function LegalSheet({ doc, onClose }: { doc: LegalDocData | null; onClose: () => void }) {
  const { t } = useLang();
  const shown = useRetained(doc);
  return (
    <Sheet open={!!doc} onClose={onClose} className="pp-sheet" label={shown?.title ?? ""}>
      {shown && <>
        <div className="pp-sheet-head">
          <h2 className="pp-sheet-title" lang="en">{shown.title}</h2>
          <button type="button" className="pp-sheet-close" onClick={onClose} aria-label={t("close")}>
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>
        <div className="pp-sheet-body"><LegalDocument doc={shown} /></div>
        <div className="pp-sheet-foot">
          <button type="button" className="pp-done" onClick={onClose}>{t("pp_done")}</button>
        </div>
      </>}
    </Sheet>
  );
}
