import { useState } from "react";
import { AlertTriangle, ChevronRight, Trash2, X } from "lucide-react";
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
//     away from Sign Out, and all it does is open the sheet
//   · the sheet says in plain words what goes and what other people keep
//   · the red button stays off until the box is ticked
//   · Cancel comes first, on the side the thumb rests
//   · while it runs, nothing can dismiss the sheet or start it twice
// If it fails (no signal, the server refuses), the sheet stays and says why.

export function DeleteAccount({ role, onDelete }: {
  role?: UserRole;
  /** Deletes the account; resolves once the app has left for the welcome
   *  screen, and rejects with the reason if it couldn't. */
  onDelete: () => Promise<void>;
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
        <div className="setting-ico" style={{ background: "var(--error-sk)" }}><Trash2 size={16} color="var(--error)" /></div>
        <div style={{ flex: 1 }}>
          <div className="setting-lbl del-row-lbl">{t("del_link")}</div>
          <div className="setting-sub">{t("del_row_sub")}</div>
        </div>
        <ChevronRight size={16} color="var(--line-strong)" />
      </button>

      <Sheet open={open} onClose={close} className="confirm-sheet del-sheet" label={t("del_title")} dismissible={!busy}>
        <div className="del-ico" aria-hidden="true"><AlertTriangle size={26} strokeWidth={2.2} /></div>
        <h2 className="del-title">{t("del_title")}</h2>
        <p className="del-body">{t("del_body")}</p>

        <ul className="del-list">
          {gone.map(k => (
            <li key={k}><X size={16} strokeWidth={2.8} aria-hidden="true" /> {t(k)}</li>
          ))}
        </ul>
        <p className="del-kept">{t("del_kept")}</p>

        <label className="del-check">
          <input type="checkbox" checked={sure} disabled={busy} onChange={e => setSure(e.target.checked)} />
          <span>{t("del_sure")}</span>
        </label>

        {error && <p className="form-err" role="alert"><AlertTriangle size={17} /> {error}</p>}

        <div className="del-actions">
          <button type="button" className="btn-secondary" onClick={close} disabled={busy}>{t("cancel")}</button>
          <button type="button" className="btn-danger" onClick={run} disabled={!sure || busy} aria-busy={busy}>
            {busy ? t("del_busy") : t("del_btn")}
          </button>
        </div>
      </Sheet>
    </>
  );
}
