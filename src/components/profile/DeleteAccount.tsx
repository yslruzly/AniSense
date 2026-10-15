import { useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, Award, Check, ChevronRight, IdCard, MapPin, Package, ReceiptText, Trash2, Users } from "lucide-react";
import { Sheet } from "../ui/Sheet";
import { useLang } from "../../i18n";
import { isNetworkError } from "../../lib/cache";
import { UserRole } from "../../types";

// ─── Delete account ───────────────────────────────────────────────────────────
// The way out of AniSense for good, which Google Play requires every app with
// accounts to offer from inside the app.
//
// It is the one action here that can't be undone, so it is built to be hard
// to do by accident and easy to back out of:
//   · the door to it is the last row of Manage account on Profile, well
//     away from Sign Out, and all it does is open the dialog
//   · the dialog comes up in the middle of the screen, the way a phone asks
//     "are you sure?", and all of it fits at once: nothing to scroll past,
//     so nothing it says can be missed
//   · it says in plain words what goes, each with its picture, and apart
//     from that, what other people keep
//   · the red button stays off until the box is ticked, and the box is a
//     card that turns red when it is
//   · Cancel sits first, and a gentler way out is offered under it: sign
//     out instead
//   · while it runs, nothing can dismiss the dialog or start it twice
// If it fails (no signal, the server refuses), the dialog stays and says why.

const GONE: Record<string, ReactNode> = {
  del_gone_profile: <IdCard size={16} strokeWidth={2.3} />,
  del_gone_listings: <Package size={16} strokeWidth={2.3} />,
  del_gone_records: <ReceiptText size={16} strokeWidth={2.3} />,
  del_gone_badges: <Award size={16} strokeWidth={2.3} />,
  del_gone_buyer: <MapPin size={16} strokeWidth={2.3} />,
};

export function DeleteAccount({ role, onDelete, onSignOut }: {
  role?: UserRole;
  /** Deletes the account; resolves once the app has left for the welcome
   *  screen, and rejects with the reason if it couldn't. */
  onDelete: () => Promise<void>;
  /** The gentler way out, offered in the sheet: keep everything, just leave. */
  onSignOut?: () => void;
}) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [sure, setSure] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    if (busy) return;
    setOpen(false); setSure(false); setError("");
  };
  const run = async () => {
    setBusy(true);
    setError("");
    try {
      await onDelete();
    } catch (e) {
      setError(t(isNetworkError(e) ? "err_offline_action" : "del_failed"));
      setBusy(false);
    }
  };

  // A buyer keeps no farm records, so their list is shorter.
  const gone = role === "buyer"
    ? ["del_gone_profile", "del_gone_buyer"]
    : ["del_gone_profile", "del_gone_listings", "del_gone_records", "del_gone_badges"];

  return (
    <>
      {/* A settings row like the ones above it, in red so it is never
          mistaken for one of them. */}
      <button type="button" className="setting-row as-btn del-row" onClick={() => setOpen(true)}>
        <span className="setting-ico" aria-hidden="true"><Trash2 size={22} strokeWidth={1.8} /></span>
        <span className="setting-lbl del-row-lbl">{t("del_link")}</span>
        <ChevronRight className="setting-chev" size={20} strokeWidth={2} aria-hidden="true" />
      </button>

      <Sheet open={open} onClose={close} variant="center" className="del-dialog" label={t("del_title")} dismissible={!busy}>
        <div className="del-head">
          <span className="del-ico" aria-hidden="true"><Trash2 size={22} strokeWidth={2.3} /></span>
          <h2 className="del-title">{t("del_title")}</h2>
        </div>
        <p className="del-body">{t("del_body")}</p>

        {/* What goes: one line each, with its picture. */}
        <section className="del-box" aria-labelledby="del-gone-t">
          <h3 className="del-box-t" id="del-gone-t">{t("del_gone_t")}</h3>
          <ul className="del-list">
            {gone.map(k => (
              <li key={k}><span className="del-li-ico" aria-hidden="true">{GONE[k]}</span>{t(k)}</li>
            ))}
          </ul>
        </section>
        {/* And, apart from it, what other people keep. */}
        <p className="del-kept"><Users size={17} strokeWidth={2.3} aria-hidden="true" /><span>{t("del_kept")}</span></p>

        {/* The tick that arms the button: a card, the whole of it the
            target, red once ticked. The real checkbox sits under the drawn
            one, so it is still a checkbox to a screen reader and a keyboard. */}
        <label className={`del-check${sure ? " on" : ""}`}>
          <input type="checkbox" className="del-check-in" checked={sure} disabled={busy} onChange={e => setSure(e.target.checked)} />
          <span className="del-check-box" aria-hidden="true"><Check size={17} strokeWidth={3.2} /></span>
          <span className="del-check-t">{t("del_sure")}</span>
        </label>

        {error && <p className="form-err del-err" role="alert"><AlertTriangle size={17} /> {error}</p>}

        <div className="del-actions">
          <button type="button" className="btn-secondary del-cancel" onClick={close} disabled={busy}>{t("cancel")}</button>
          <button type="button" className="btn-danger del-go" onClick={run} disabled={!sure || busy} aria-busy={busy}>
            {busy ? <><span className="wid-spin" aria-hidden="true" /> {t("del_busy")}</> : t("del_btn")}
          </button>
        </div>

        {onSignOut && (
          <p className="del-alt">
            {t("del_alt")}{" "}
            <button type="button" className="del-alt-btn" onClick={() => { close(); onSignOut(); }} disabled={busy}>{t("del_alt_btn")}</button>
          </p>
        )}
      </Sheet>
    </>
  );
}
