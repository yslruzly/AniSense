import React, { useState } from "react";
import { ArrowLeft, Camera, Bell, IdCard, Award, Sprout, Wheat, SlidersHorizontal, Info, ChevronRight, Globe, ShieldCheck, HelpCircle, PlayCircle, Settings, LogOut, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { useLang, LanguageToggle } from "../i18n";
import { Screen, UserRole, FarmerProfile } from "../types";
import { CropEmoji } from "../components/CropEmoji";
import { formatName } from "../lib/names";
import { AniSenseLogo } from "../components/AniSenseLogo";
import leafMask from "../assets/anisense-leaf-mask.png";
import { Achievements } from "../components/profile/Achievements";
import { Sale } from "../lib/sales";
import { DeleteAccount } from "../components/profile/DeleteAccount";

// ─── Profile Screen ───────────────────────────────────────────────────────────
export function ProfileScreen({ onNavigate, onBack, profile, setProfile, onSignOut, onDeleteAccount, userInitials = "JD", userRole, userPhoto = null, onShowId, onReplayTour, sales = [], memberSince }: {
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
  onShowId?: () => void;
  /** Runs the guided walkthrough again, from wherever the farmer asked. */
  onReplayTour?: () => void;
  /** For the achievements: what they have sold, and when they joined. */
  sales?: Sale[];
  memberSince?: Date;
}) {
  const { t, tn } = useLang();

  // Each group gets one coloured chip: gold for what he's earned, blue for
  // how to reach him, green for the farm and what grows on it, grey for the
  // app's own switches. Colour as a label, not as decoration.
  const head = (tone: string, ico: React.ReactNode, title: string) => (
    <div className="card-head">
      <span className={`card-ico ${tone}`}>{ico}</span>
      <div className="card-title" style={{ margin: 0 }}>{title}</div>
    </div>
  );
  const [editing, setEditing] = useState(false);
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
  // arrows in this app are decoration.
  //
  // Two doors, because they answer different questions. The tour is for "show
  // me round again"; the guide is "how do I post a harvest" for a farmer and
  // "how do I order" for a buyer, read at their own pace.
  const supportSettings = [
    ...(onReplayTour ? [{
      ico: <PlayCircle size={16} color="var(--tanim)" />, bg: "var(--tanim-sk)",
      label: t("gd_replay_t"), sub: t("prof_tour_sub"),
      go: onReplayTour as (() => void) | undefined,
    }] : []),
    {
      ico: <HelpCircle size={16} color="var(--tanim)" />, bg: "var(--tanim-sk)",
      label: t("prof_help"), sub: t("prof_help_sub"),
      go: (() => onNavigate("guide")) as (() => void) | undefined,
    },
    // After the two ways to get help, before the version: where people look
    // for it in any app.
    {
      ico: <ShieldCheck size={16} color="var(--tanim)" />, bg: "var(--tanim-sk)", label: t("prof_privacy"), sub: t("prof_privacy_sub"),
      go: (() => onNavigate("privacy")) as (() => void) | undefined,
    },
    { ico: <Settings size={16} color="var(--ink-2)" />, bg: "var(--paper-alt)", label: t("prof_about"), sub: t("prof_version"), go: undefined as (() => void) | undefined },
  ];

  const contactFields = [
    { ico: <Phone size={15} color="var(--tanim)" />, lbl: t("prof_phone"), key: "phone" as const },
    { ico: <Mail size={15} color="var(--tanim)" />, lbl: t("prof_email"), key: "email" as const },
    { ico: <MapPin size={15} color="var(--tanim)" />, lbl: t("prof_location"), key: "location" as const },
  ];

  const farmFields = [
    { ico: <Calendar size={15} color="var(--tanim)" />, lbl: t("prof_experience"), key: "experience" as const },
  ];

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
        {/* A member card: brand on the top edge, the person in the middle,
            their crops at the foot. The ground is terrace contour lines and a
            faint leaf watermark, so it reads as AniSense's without a word. */}
        <div className="prof-hero">
          <div className="prof-brand">
            <span className="prof-brand-mark"><AniSenseLogo size={18} /></span>
            <span className="prof-brand-name">AniSense</span>
          </div>
          <span className="prof-role-pill">{userRole === "buyer" ? t("role_buyer") : t("role_farmer")}</span>
          <img className="prof-watermark" src={leafMask} alt="" aria-hidden="true" />

          <div className="prof-ava-wrap">
            <div className="prof-ava">{userPhoto ? <img src={userPhoto} alt="" className="prof-ava-img" /> : userInitials}</div>
            {editing && (
              <button className="prof-edit-btn">
                <Camera size={14} color="var(--text-soft)" />
              </button>
            )}
          </div>
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
              <span key={c} className="crop-tag" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <CropEmoji crop={c} size={14} /> {tn(c)}
              </span>
            ))}
          </div>
          )}
          {/* The ID lives on the card that already looks like one: the
              natural place to reach for it when a buyer asks who you are. */}
          {onShowId && !editing && (
            <button className="prof-id-btn" onClick={onShowId}>
              <IdCard size={19} strokeWidth={2.2} /> {t("id_show")}
            </button>
          )}
        </div>

        {/* Personal Stats, farmer only */}
        {userRole !== "buyer" && (
          <div className="card tint-gold">
            {head("tint-gold", <Award size={20} strokeWidth={2.2} />, t("prof_stats"))}
            <div className="stat-row-grid">
              {[
                { val: "12", lbl: t("prof_years_farming") },
                { val: "₱84K", lbl: t("prof_monthly_revenue") },
                { val: "5", lbl: t("prof_active_listings") },
                { val: "4.8", lbl: t("prof_seller_rating") },
                { val: "24", lbl: t("prof_trades") },
              ].map(s => (
                <div key={s.lbl} className="mini-stat">
                  <div className="mini-stat-val">{s.val}</div>
                  <div className="mini-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What they have earned on AniSense, right under their numbers. */}
        {userRole !== "buyer" && !editing && <Achievements sales={sales} memberSince={memberSince} />}

        {/* Contact Info */}
        <div className="card">
          {head("tint-blue", <Phone size={20} strokeWidth={2.2} />, t("prof_contact"))}
          {contactFields.map(f => (
            <div className="info-row" key={f.key}>
              <div className="info-ico">{f.ico}</div>
              <div style={{ flex: 1 }}>
                <div className="info-lbl">{f.lbl}</div>
                {editing
                  ? <input value={draft[f.key]} onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                    style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 6, padding: "4px 8px", fontFamily: "inherit", fontSize: "var(--fs-label)", fontWeight: 600, color: "var(--text)", outline: "none", background: "var(--paper)" }} />
                  : <div className="info-val">{profile[f.key]}</div>
                }
              </div>
            </div>
          ))}
        </div>

        {/* Farm Details, farmer only */}
        {userRole !== "buyer" && (
          <div className="card">
            {head("tint-green", <Sprout size={20} strokeWidth={2.2} />, t("prof_farm_details"))}
            {farmFields.map(f => (
              <div className="info-row" key={f.key}>
                <div className="info-ico">{f.ico}</div>
                <div style={{ flex: 1 }}>
                  <div className="info-lbl">{f.lbl}</div>
                  {editing
                    ? <input value={draft[f.key]} onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                      style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 6, padding: "4px 8px", fontFamily: "inherit", fontSize: "var(--fs-label)", fontWeight: 600, color: "var(--text)", outline: "none", background: "var(--paper)" }} />
                    : <div className="info-val">{profile[f.key]}</div>
                  }
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Crop Specialization, farmer only */}
        {userRole !== "buyer" && (
          <div className="card">
            {head("tint-green", <Wheat size={20} strokeWidth={2.2} />, t("prof_crop_spec"))}
            {editing
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
            }
          </div>
        )}

        {/* Settings */}
        {!editing && (
          <>
            <div className="card">
              {head("tint-slate", <SlidersHorizontal size={20} strokeWidth={2.2} />, t("prof_preferences"))}
              <div className="setting-row">
                <div className="setting-ico" style={{ background: "var(--gold-sk)" }}><Bell size={16} color="var(--gold-text)" /></div>
                <div style={{ flex: 1 }}>
                  <div className="setting-lbl">{t("prof_notifications")}</div>
                  <div className="setting-sub">{t("prof_notifications_sub")}</div>
                </div>
                <ChevronRight size={16} color="var(--line-strong)" />
              </div>
              <div className="setting-row" style={{ cursor: "default", flexDirection: "column", alignItems: "stretch", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <div className="setting-ico" style={{ background: "var(--paper-alt)" }}><Globe size={16} color="var(--tanim-deep)" /></div>
                  <div style={{ flex: 1 }}>
                    <div className="setting-lbl">{t("prof_language")}</div>
                    <div className="setting-sub">{t("prof_language_sub")}</div>
                  </div>
                </div>
                <LanguageToggle />
              </div>
            </div>

            <div className="card">
              {head("tint-violet", <Info size={20} strokeWidth={2.2} />, t("prof_support"))}
              {supportSettings.map(s => {
                const body = (
                  <>
                    <div className="setting-ico" style={{ background: s.bg }}>{s.ico}</div>
                    <div style={{ flex: 1 }}>
                      <div className="setting-lbl">{s.label}</div>
                      <div className="setting-sub">{s.sub}</div>
                    </div>
                    <ChevronRight size={16} color="var(--line-strong)" />
                  </>
                );
                return s.go
                  ? <button key={s.label} className="setting-row as-btn" onClick={s.go}>{body}</button>
                  : <div key={s.label} className="setting-row">{body}</div>;
              })}
            </div>

            <button className="signout-btn" onClick={onSignOut} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <LogOut size={18} strokeWidth={2.4} aria-hidden="true" /> {t("prof_sign_out")}
            </button>

            {/* Under Sign Out and quieter than it: leaving for good is rare,
                and should never be what a thumb aiming for Sign Out lands on. */}
            {onDeleteAccount && <DeleteAccount role={userRole} onDelete={onDeleteAccount} />}

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
