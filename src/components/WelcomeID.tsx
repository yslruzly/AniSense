import { useRef, useState } from "react";
import { Camera, MapPin, Download, Check, AlertCircle } from "lucide-react";
import { useLang } from "../i18n";
import { haptic, saveImage } from "../lib/platform";
import { renderMemberId } from "../lib/memberIdImage";
import { downscaleImage } from "../lib/image";
import { UserRole } from "../types";
import { Sheet } from "./ui/Sheet";
import { AniSenseLogo } from "./AniSenseLogo";

// ─── Welcome ID ───────────────────────────────────────────────────────────────
// Shown once, right after an account is created: the new member's AniSense
// ID, like a real one: issuer on the top band, photo in the middle, name at
// the foot, an ID number and a barcode along the bottom edge.
//
// Seen once per account, at the end of sign-up, so it's the one place in the
// app that earns a real entrance: the card drops in on its lanyard, settles
// with a little swing, and a light sweeps across it like a laminated card.
//
// Profile reopens the same card in "view" mode: its own title, a Close
// button, and a plain scale-in, because a swing that delights once becomes a
// wait the fifth time someone pulls their ID up to show a buyer.

export type WelcomeInfo = { id: string; since: Date };

/** "Bagong Sikat, Cabanatuan City, Nueva Ecija" → "…, Cabanatuan City, N.E.":
 *  everyone on AniSense is in Nueva Ecija, so on a card this narrow the
 *  province is the part to shorten, and the barangay and town keep room. */
export const shortPlace = (place: string) => place.replace(/\bNueva\s+Ecija\b\.?/i, "N.E.");

/** AS-2026-04817: "AS" for AniSense, the year joined, five digits. */
export function makeMemberId(d = new Date()) {
  return `AS-${d.getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;
}

export function WelcomeID({ open, onClose, mode = "welcome", name, initials, role, location, info, photo, onPhoto }: {
  open: boolean;
  onClose: () => void;
  mode?: "welcome" | "view";
  /** Farmers only; buyers aren't asked where they are. Passed live, so an
   *  edit on Profile shows on the card. */
  location?: string;
  name: string;
  initials: string;
  role: UserRole;
  info: WelcomeInfo | null;
  photo: string | null;
  onPhoto: (dataUrl: string) => void;
}) {
  const { t } = useLang();
  const place = location ? shortPlace(location) : undefined;
  const fileRef = useRef<HTMLInputElement>(null);
  const first = name.split(" ")[0];
  // idle → busy → done (or failed), then back to idle after a moment. The
  // button says each step in place, so nothing else on screen has to.
  const [dl, setDl] = useState<"idle" | "busy" | "done" | "failed">("idle");

  const pickPhoto = async (file: File | undefined) => {
    if (!file) return;
    try { onPhoto(await downscaleImage(file, 800)); haptic.select(); } catch { haptic.warn(); }
  };

  if (!info) return null;

  const download = async () => {
    if (dl === "busy") return;
    setDl("busy");
    try {
      const blob = await renderMemberId({
        name, initials, role: role === "buyer" ? "Buyer" : "Farmer",
        location: place, id: info.id, since: info.since, photo,
      });
      const result = await saveImage(blob, `AniSense-ID-${info.id}.png`, "AniSense Member ID");
      if (result === "failed") { haptic.warn(); setDl("failed"); }
      else if (result === "downloaded") { haptic.success(); setDl("done"); }
      // On the phone the share sheet was the confirmation; nothing to add.
      else { setDl("idle"); return; }
    } catch {
      haptic.warn();
      setDl("failed");
    }
    window.setTimeout(() => setDl("idle"), 2400);
  };
  // The card itself is a document, so it's always in English, whatever
  // language the app is set to: the same ID reads the same to anyone it's
  // shown to. The heading and buttons around it still follow the app.
  const roleLabel = role === "buyer" ? "Buyer" : "Farmer";

  return (
    <Sheet open={open} onClose={onClose} variant="center" className="wid-panel" label={mode === "view" ? t("id_view_title") : t("welcome_sub")}>
      <div className={`wid ${mode === "view" ? "is-view" : ""}`}>
        <h2 className="wid-title">{mode === "view" ? t("id_view_title") : t("welcome_title").replace("{name}", first)}</h2>
        <p className="wid-sub">{mode === "view" ? t("id_view_sub") : t("welcome_sub")}</p>

        {/* The card. aria-label reads it as one thing; its parts are visual. */}
        <div className="wid-card" role="img"
          aria-label={`Member ID: ${name}, ${roleLabel}, ID No. ${info.id}`}>
          <span className="wid-slot" aria-hidden="true" />
          <div className="wid-band">
            <span className="wid-mark"><AniSenseLogo size={20} /></span>
            <span className="wid-brand">AniSense</span>
            <span className="wid-kind">Member ID</span>
          </div>

          <div className="wid-body">
            {/* The photo slot is the button: tap it to take or choose a
                picture. Initials stand in until there is one. */}
            <button type="button" className="wid-photo" onClick={() => fileRef.current?.click()}
              aria-label={photo ? t("welcome_change_photo") : t("welcome_add_photo")}>
              {photo
                ? <img src={photo} alt="" key={photo} className="wid-photo-img" />
                : <span className="wid-initials">{initials}</span>}
              <span className="wid-cam" aria-hidden="true"><Camera size={15} strokeWidth={2.4} /></span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden
              onChange={e => { pickPhoto(e.target.files?.[0]); e.target.value = ""; }} />

            <div className="wid-name">{name}</div>
            <div className="wid-role">{roleLabel}</div>
            {place && (
              <div className="wid-loc"><MapPin size={13} strokeWidth={2.4} aria-hidden="true" />{place}</div>
            )}
          </div>

          <div className="wid-foot">
            <div className="wid-field">
              <span className="wid-lbl">ID No.</span>
              <span className="wid-val">{info.id}</span>
            </div>
            <div className="wid-field end">
              <span className="wid-lbl">Member since</span>
              <span className="wid-val">{info.since.toLocaleDateString("en-PH", { month: "short", year: "numeric" })}</span>
            </div>
            <span className="wid-barcode" aria-hidden="true" />
          </div>
          <span className="wid-shine" aria-hidden="true" />
        </div>

        <div className="wid-actions">
          {/* Viewing your ID is when you'd want a copy of it. */}
          {mode === "view" && (
            <button type="button" className={`wid-btn ghost ${dl === "done" ? "is-done" : ""} ${dl === "failed" ? "is-failed" : ""}`}
              onClick={download} aria-busy={dl === "busy"}>
              {/* Keyed on the state so each label arrives with a short
                  blur-in rather than cutting. */}
              <span className="wid-btn-lbl" key={dl}>
                {dl === "busy" && <><span className="wid-spin" aria-hidden="true" /> {t("id_preparing")}</>}
                {dl === "done" && <><Check size={18} strokeWidth={2.6} /> {t("id_saved")}</>}
                {dl === "failed" && <><AlertCircle size={18} strokeWidth={2.4} /> {t("id_save_failed")}</>}
                {dl === "idle" && <><Download size={18} strokeWidth={2.2} /> {t("id_download")}</>}
              </span>
            </button>
          )}
          {!photo && (
            <button type="button" className="wid-btn ghost" onClick={() => fileRef.current?.click()}>
              <Camera size={18} strokeWidth={2.2} /> {t("welcome_add_photo")}
            </button>
          )}
          <button type="button" className="wid-btn primary" onClick={onClose}>{mode === "view" ? t("close") : t("welcome_home")}</button>
        </div>
      </div>
    </Sheet>
  );
}
