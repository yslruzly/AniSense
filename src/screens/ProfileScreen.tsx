import React, { useRef, useState } from "react";
import { ArrowLeft, Camera, Bell, IdCard, Sprout, Wheat, SlidersHorizontal, Info, ChevronRight, Globe, ShieldCheck, UserCog, FileText, HelpCircle, PlayCircle, LogOut, Phone, Mail, MapPin, Calendar, Check, AlertCircle } from "lucide-react";
import { useLang, LanguageToggle } from "../i18n";
import { Screen, UserRole, FarmerProfile } from "../types";
import { CropEmoji } from "../components/icons/CropEmoji";
import { formatName } from "../lib/names";
import { downscaleImage } from "../lib/image";
import { haptic } from "../lib/platform";
import leafMask from "../assets/anisense-leaf-mask.png";
import { Achievements } from "../components/profile/Achievements";
import { Sale } from "../lib/sales";
import { DeleteAccount } from "../components/profile/DeleteAccount";
import { PRIVACY } from "../data/privacyPolicy";
import { TERMS } from "../data/termsOfService";
import { LegalSheet } from "../components/legal/LegalSheet";
import { FarmStats } from "../components/profile/FarmStats";

// ─── Profile Screen ───────────────────────────────────────────────────────────
export function ProfileScreen({ onNavigate, onBack, profile, setProfile, onSignOut, onDeleteAccount, userInitials = "JD", userRole, userPhoto = null, onPhoto, onShowId, onReplayTour, onReplayExpensesTour, sales = [], memberSince }: {
  onNavigate: (s: Screen) => void;
  onBack: () => void;
  profile: FarmerProfile;
  setProfile: (p: FarmerProfile) => void;
  onSignOut: () => void;
  /** Deletes this account for good; rejects with the reason if it couldn't. */
  onDeleteAccount?: () => Promise<void>;
  userInitials?: string;
  userRole?: UserRole;
  userPhoto?: string | null;
  /** Shows a new photo and saves it to the account; rejects if it couldn't. */
  onPhoto?: (dataUrl: string) => Promise<void> | void;
  onShowId?: () => void;
  /** Runs the guided walkthrough again, from wherever the farmer asked. */
  onReplayTour?: () => void;
  /** Farmers only: the Expenses page's own walkthrough. */
  onReplayExpensesTour?: () => void;
  /** For the achievements: what they have sold, and when they joined. */
  sales?: Sale[];
  memberSince?: Date;
}) {
  const { t, tn } = useLang();

  // Each section is one white card, named at its top beside one coloured
  // chip: gold for what he's earned, blue for how to reach him, green for
  // the farm and what grows on it, grey for the account and the app's own
  // switches, violet for help. Colour as a label, not as decoration. In the
  // lists every row is built the same: a grey line icon, the words, and a
  // chevron only where the row goes somewhere, with a hairline between rows.
  const group = (id: string, tone: string, chip: React.ReactNode, title: string, body: React.ReactNode, opts: { card?: string; list?: boolean } = {}) => (
    <section className={`card prof-card${opts.list ? " is-list" : ""}`} data-card={opts.card} aria-labelledby={`pg-${id}`}>
      <div className="card-head">
        <span className={`card-ico ${tone}`} aria-hidden="true">{chip}</span>
        <div className="card-title" id={`pg-${id}`} style={{ margin: 0 }}>{title}</div>
      </div>
      {body}
    </section>
  );
  const C = { size: 20, strokeWidth: 2.2 };
  const I = { size: 22, strokeWidth: 1.8 };
  const ico = (node: React.ReactNode) => <span className="setting-ico" aria-hidden="true">{node}</span>;
  const chev = <ChevronRight className="setting-chev" size={20} strokeWidth={2} aria-hidden="true" />;
  const [editing, setEditing] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [draft, setDraft] = useState({ ...profile });

  const ALL_CROPS = ["Rice", "Corn", "Onions", "Tomatoes", "Calamansi", "Mango", "Garlic", "Squash", "Mongo"];

  const toggleCrop = (crop: string) => {
    setDraft(d => ({
      ...d,
      crops: d.crops.includes(crop) ? d.crops.filter(c => c !== crop) : [...d.crops, crop],
    }));
  };

  const save = () => { setProfile({ ...draft, name: formatName(draft.name) || profile.name }); setEditing(false); };
  const cancel = () => { setDraft({ ...profile }); setEditing(false); };

  // The help rows do something. They used to be chevrons pointing at
  // nothing, which is the worst kind of button: it teaches people that the
  // arrows in this app are decoration. About goes nowhere, so it shows the
  // version where a chevron would be.
  //
  // Two doors, because they answer different questions. The tour is for "show
  // me round again"; the guide is "how do I post a harvest" for a farmer and
  // "how do I order" for a buyer, read at their own pace.
  const supportSettings: { ico: React.ReactNode; label: string; go?: () => void; value?: string }[] = [
    ...(onReplayTour ? [{ ico: <PlayCircle {...I} />, label: t("gd_replay_t"), go: onReplayTour }] : []),
    ...(onReplayExpensesTour ? [{ ico: <PlayCircle {...I} />, label: t("tour_e_replay"), go: onReplayExpensesTour }] : []),
    { ico: <HelpCircle {...I} />, label: t("prof_help"), go: () => onNavigate("guide") },
    { ico: <Info {...I} />, label: t("prof_about"), value: t("prof_version") },
  ];

  const contactFields = [
    { ico: <Phone {...I} />, lbl: t("prof_phone"), key: "phone" as const },
    { ico: <Mail {...I} />, lbl: t("prof_email"), key: "email" as const },
    { ico: <MapPin {...I} />, lbl: t("prof_location"), key: "location" as const },
  ];

  const farmFields = [
    { ico: <Calendar {...I} />, lbl: t("prof_experience"), key: "experience" as const },
  ];

  // What is on record: the label small and grey over the value. Editing
  // turns the value into a field.
  const infoRow = (f: { ico: React.ReactNode; lbl: string; key: "phone" | "email" | "location" | "experience" }) => (
    <div className="info-row" key={f.key}>
      <span className="info-ico" aria-hidden="true">{f.ico}</span>
      <div className="info-body">
        <div className="info-lbl">{f.lbl}</div>
        {editing
          ? <input value={draft[f.key]} onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))} aria-label={f.lbl}
            style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 6, padding: "4px 8px", fontFamily: "inherit", fontSize: "var(--fs-label)", fontWeight: 600, color: "var(--text)", outline: "none", background: "var(--paper)" }} />
          : <div className="info-val">{profile[f.key]}</div>
        }
      </div>
    </div>
  );

  // A new profile photo: made small on the phone (a camera photo is several
  // megabytes), then shown and saved. "Saved" stays a moment, then the
  // button goes back to offering a change.
  const photoInput = useRef<HTMLInputElement>(null);
  const [photoState, setPhotoState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const pickPhoto = async (file: File | undefined) => {
    if (!file || !onPhoto) return;
    setPhotoState("saving");
    try {
      await onPhoto(await downscaleImage(file, 800));
      haptic.success();
      setPhotoState("saved");
      window.setTimeout(() => setPhotoState(s => (s === "saved" ? "idle" : s)), 2400);
    } catch {
      haptic.warn();
      setPhotoState("failed");
    }
  };

  return (
    <div className="screen">
      {/* Header */}
      <div className="hdr">
        <div className="hdr-brand">
          {/* The shared class rather than a copy of its styles inline: this is
              the same control as every other back button, so it should press
              like one. It did not, because there was no class to hang it on. */}
          <button className="hdr-back" onClick={onBack} aria-label={t("back")}>
            <ArrowLeft size={16} color="var(--tanim)" />
          </button>
          <div>
            <div className="hdr-title">{t("prof_title")}</div>
          </div>
        </div>
        <div className="hdr-right">
          {!editing
            ? <button className="chip-btn" onClick={() => setEditing(true)}>{t("edit")}</button>
            : <button className="chip-btn on" onClick={save}>{t("save")}</button>
          }
        </div>
      </div>

      <div className="scroll screen-enter">
        {/* Avatar + name hero */}
        {/* A member card in AniSense green: the brand and the member's role
            along the top edge, the person in the middle on a gold-plated
            disc, their crops under the name, the ID at the foot. The ground
            is terrace contour lines and a faint leaf, so it reads as
            AniSense's without a word. */}
        <div className="prof-hero">
          <img className="prof-watermark" src={leafMask} alt="" aria-hidden="true" />
          <div className="prof-top">
            <div className="prof-brand">
              {/* The leaf in gold: the white cut-out of the mark used as a
                  stencil, so it reads on the green where the full-colour
                  logo, drawn on white, showed as a blank tile. */}
              <span className="prof-brand-mark" aria-hidden="true"
                style={{ WebkitMaskImage: `url(${leafMask})`, maskImage: `url(${leafMask})` }} />
              <span className="prof-brand-name">AniSense</span>
            </div>
            <span className="prof-role-pill">{userRole === "buyer" ? t("role_buyer") : t("role_farmer")}</span>
          </div>

          {/* While editing, the picture is the button for a new photo (the
              camera or the gallery, as the phone offers), with the same
              action spelled out under it, which also says how the save went. */}
          <div className="prof-ava-wrap">
            {editing && onPhoto ? (
              <button type="button" className="prof-ava is-btn" onClick={() => photoInput.current?.click()} disabled={photoState === "saving"}
                aria-label={userPhoto ? t("welcome_change_photo") : t("welcome_add_photo")} aria-busy={photoState === "saving"}>
                {userPhoto ? <img src={userPhoto} alt="" className="prof-ava-img" /> : userInitials}
                {photoState === "saving" && <span className="prof-ava-busy" aria-hidden="true"><span className="wid-spin" /></span>}
              </button>
            ) : (
              <div className="prof-ava">{userPhoto ? <img src={userPhoto} alt="" className="prof-ava-img" /> : userInitials}</div>
            )}
            {editing && onPhoto && (
              <span className="prof-edit-btn" aria-hidden="true"><Camera size={15} strokeWidth={2.4} color="var(--tanim-deep)" /></span>
            )}
            <input ref={photoInput} type="file" accept="image/*" hidden
              onChange={e => { void pickPhoto(e.target.files?.[0]); e.target.value = ""; }} />
          </div>
          {editing && onPhoto && (
            <button type="button" className={`prof-photo-btn is-${photoState}`} onClick={() => photoInput.current?.click()} disabled={photoState === "saving"}>
              {photoState === "saving" ? <><span className="wid-spin" aria-hidden="true" /> {t("photo_saving")}</>
                : photoState === "saved" ? <><Check size={17} strokeWidth={2.6} aria-hidden="true" /> {t("photo_saved")}</>
                : <><Camera size={17} strokeWidth={2.4} aria-hidden="true" /> {userPhoto ? t("welcome_change_photo") : t("welcome_add_photo")}</>}
            </button>
          )}
          {editing && photoState === "failed" && (
            <p className="prof-photo-err" role="alert"><AlertCircle size={17} strokeWidth={2.4} aria-hidden="true" /> {t("photo_save_failed")}</p>
          )}
          {editing
            ? <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                onBlur={() => setDraft(d => ({ ...d, name: formatName(d.name) }))}
              style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 8, padding: "6px 12px", color: "#fff", fontFamily: "inherit", fontSize: "var(--fs-body)", fontWeight: 700, textAlign: "center", width: "100%", marginBottom: 4, outline: "none" }} />
            : <div className="prof-name">{profile.name}</div>
          }
          {/* Location on its own line. Run together behind an icon, a
              barangay-level address wrapped around the glyph and left it
              stranded beside two lines of text. The role moved to the pill in
              the card's corner. */}
          <div className="prof-loc">{profile.location}</div>
          {/* Crops say what this person grows, so they belong to a farmer.
              A buyer was being shown Rice and Corn they never chose. */}
          {userRole !== "buyer" && (
          <div className="prof-crops">
            {(editing ? draft : profile).crops.map(c => (
              <span key={c} className="prof-crop">
                <span className="prof-crop-art" aria-hidden="true"><CropEmoji crop={c} size={17} /></span>
                {tn(c)}
              </span>
            ))}
          </div>
          )}
          {/* The ID lives on the card that already looks like one: the
              natural place to reach for it when a buyer asks who you are. */}
          {onShowId && !editing && (
            <button className="prof-id-btn" onClick={onShowId}>
              <IdCard size={20} strokeWidth={2.3} aria-hidden="true" /> {t("id_show")}
            </button>
          )}
        </div>

        {/* The farm in four real numbers, farmer only */}
        {userRole !== "buyer" && group("stats", "tint-green", <Sprout {...C} />, t("prof_stats"), <FarmStats experience={profile.experience} sales={sales} />)}

        {/* What they have earned on AniSense, right under their numbers. */}
        {userRole !== "buyer" && !editing && <Achievements sales={sales} memberSince={memberSince} />}

        {group("contact", "tint-blue", <Phone {...C} />, t("prof_contact"), contactFields.map(infoRow), { list: true })}

        {/* Farm Details, farmer only */}
        {userRole !== "buyer" && group("farm", "tint-green", <Sprout {...C} />, t("prof_farm_details"), farmFields.map(infoRow), { list: true })}

        {/* Crop Specialization, farmer only */}
        {userRole !== "buyer" && group("crops", "tint-green", <Wheat {...C} />, t("prof_crop_spec"), editing
          ? <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ALL_CROPS.map(c => (
              <button key={c} onClick={() => toggleCrop(c)}
                aria-pressed={draft.crops.includes(c)}
                className={`crop-toggle ${draft.crops.includes(c) ? "on" : ""}`}>
                <CropEmoji crop={c} size={16} /> {tn(c)}
              </button>
            ))}
          </div>
          : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {profile.crops.map(c => (
              <span key={c} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 99, background: "var(--tanim-sk)", border: "1px solid var(--tanim-sk)", color: "var(--tanim)", fontSize: "var(--fs-label)", fontWeight: 600 }}>
                <CropEmoji crop={c} size={16} /> {tn(c)}
              </span>
            ))}
          </div>
        )}

        {/* Settings */}
        {!editing && (
          <>
            {group("prefs", "tint-slate", <SlidersHorizontal {...C} />, t("prof_preferences"), <>
              <div className="setting-row">
                {ico(<Bell {...I} />)}
                <span className="setting-lbl">{t("prof_notifications")}</span>
                {chev}
              </div>
              {/* The language switch under its name, lined up with the words. */}
              <div className="setting-row is-stack">
                <div className="setting-line">
                  {ico(<Globe {...I} />)}
                  <span className="setting-lbl">{t("prof_language")}</span>
                </div>
                <div className="setting-ctl"><LanguageToggle /></div>
              </div>
            </>, { card: "preferences", list: true })}

            {group("support", "tint-violet", <Info {...C} />, t("prof_support"), supportSettings.map(r => {
              const body = (
                <>
                  {ico(r.ico)}
                  <span className="setting-lbl">{r.label}</span>
                  {r.go ? chev : r.value && <span className="setting-val">{r.value}</span>}
                </>
              );
              return r.go
                ? <button key={r.label} className="setting-row as-btn" onClick={r.go}>{body}</button>
                : <div key={r.label} className="setting-row">{body}</div>;
            }), { list: true })}

            {/* Manage account: the things about the account itself, last,
                right above Sign out, where people look for the account's own
                business. What is kept about you (the privacy policy), the
                terms, and the way to take it all back (deleting the account),
                which is the last row and only opens a sheet that asks again. */}
            {group("manage", "tint-slate", <UserCog {...C} />, t("prof_manage"), <>
              {/* A real button: it opens the Privacy screen. The policy's
                  name is in English in both languages, like the policy. */}
              <button className="setting-row as-btn" onClick={() => onNavigate("privacy")}>
                {ico(<ShieldCheck {...I} />)}
                <span className="setting-lbl" lang="en">{PRIVACY.title}</span>
                {chev}
              </button>
              {/* The terms agreed to at sign-up, readable again any time.
                  A sheet over Profile, like the delete step below. */}
              <button className="setting-row as-btn" onClick={() => setShowTerms(true)}>
                {ico(<FileText {...I} />)}
                <span className="setting-lbl" lang="en">{TERMS.title}</span>
                {chev}
              </button>
              {onDeleteAccount && <DeleteAccount role={userRole} onDelete={onDeleteAccount} />}
            </>, { card: "manage", list: true })}
            <LegalSheet doc={showTerms ? TERMS : null} onClose={() => setShowTerms(false)} />

            <button className="signout-btn" onClick={onSignOut} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <LogOut size={18} strokeWidth={2.4} aria-hidden="true" /> {t("prof_sign_out")}
            </button>

            <div className="version-txt">AniSense v1.0.0 · Ani mo, alam mo.</div>
          </>
        )}

        {editing && (
          <button className="btn-secondary sm" onClick={cancel} style={{ width: "100%", border: "none", borderRadius: "var(--radius)" }}>
            {t("cancel")}
          </button>
        )}
      </div>
    </div>
  );
}
