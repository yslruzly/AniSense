import { useState } from "react";
import { ArrowLeft, Camera, ShoppingCart, Wheat, Bell, ChevronRight, Globe, Lock, HelpCircle, Settings, LogOut, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { useLang, LanguageToggle } from "../i18n";
import { Screen, UserRole, FarmerProfile } from "../types";
import { CropIcon } from "../components/icons";

// ─── Profile Screen ───────────────────────────────────────────────────────────
export function ProfileScreen({ onNavigate, onBack, profile, setProfile, onSignOut, userInitials = "JD", userRole }: {
  onNavigate: (s: Screen) => void;
  onBack: () => void;
  profile: FarmerProfile;
  setProfile: (p: FarmerProfile) => void;
  onSignOut: () => void;
  userInitials?: string;
  userRole?: UserRole;
}) {
  const { t, tn } = useLang();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...profile });

  const ALL_CROPS = ["Rice", "Corn", "Onions", "Tomatoes", "Calamansi", "Mango", "Garlic", "Squash", "Mongo"];

  const toggleCrop = (crop: string) => {
    setDraft(d => ({
      ...d,
      crops: d.crops.includes(crop) ? d.crops.filter(c => c !== crop) : [...d.crops, crop],
    }));
  };

  const save = () => { setProfile({ ...draft }); setEditing(false); };
  const cancel = () => { setDraft({ ...profile }); setEditing(false); };

  const supportSettings = [
    { ico: <Lock size={16} color="#4d4237" />, bg: "#f1e9dc", label: t("prof_privacy"), sub: t("prof_privacy_sub") },
    { ico: <HelpCircle size={16} color="#2e7d4f" />, bg: "#e6f2e9", label: t("prof_help"), sub: t("prof_help_sub") },
    { ico: <Settings size={16} color="#7448c0" />, bg: "#f0eaf8", label: t("prof_about"), sub: t("prof_version") },
  ];

  const contactFields = [
    { ico: <Phone size={15} color="#2e7d4f" />, lbl: t("prof_phone"), key: "phone" as const },
    { ico: <Mail size={15} color="#2e7d4f" />, lbl: t("prof_email"), key: "email" as const },
    { ico: <MapPin size={15} color="#2e7d4f" />, lbl: t("prof_location"), key: "location" as const },
  ];

  const farmFields = [
    { ico: <Calendar size={15} color="#2e7d4f" />, lbl: t("prof_experience"), key: "experience" as const },
  ];

  return (
    <div className="screen">
      {/* Header */}
      <div className="hdr">
        <div className="hdr-brand">
          <button onClick={onBack} style={{ background: "#e6f2e9", border: "1px solid #cfe7d6", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginRight: 6 }}>
            <ArrowLeft size={16} color="#2e7d4f" />
          </button>
          <div>
            <div className="hdr-title">{t("prof_title")}</div>
            <div className="hdr-sub">{userRole === "buyer" ? t("prof_buyer") : t("prof_farmer")}</div>
          </div>
        </div>
        <div className="hdr-right">
          {!editing
            ? <button onClick={() => setEditing(true)} style={{ background: "#e6f2e9", border: "1px solid #cfe7d6", borderRadius: 8, padding: "5px 12px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#2e7d4f", cursor: "pointer" }}>{t("edit")}</button>
            : <button onClick={save} style={{ background: "#2e7d4f", border: "none", borderRadius: 8, padding: "5px 12px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}>{t("save")}</button>
          }
        </div>
      </div>

      <div className="scroll">
        {/* Avatar + name hero */}
        <div className="prof-hero">
          <div className="prof-ava-wrap">
            <div className="prof-ava">{userInitials}</div>
            {editing && (
              <button className="prof-edit-btn">
                <Camera size={14} color="#4d4237" />
              </button>
            )}
          </div>
          {editing
            ? <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 8, padding: "6px 12px", color: "#fff", fontFamily: "inherit", fontSize: 17, fontWeight: 700, textAlign: "center", width: "100%", marginBottom: 4, outline: "none" }} />
            : <div className="prof-name">{profile.name}</div>
          }
          <div className="prof-role" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {userRole === "buyer"
              ? <><ShoppingCart size={13} color="rgba(255,255,255,0.8)" /> {t("role_buyer")} · {profile.location}</>
              : <><Wheat size={13} color="rgba(255,255,255,0.8)" /> {t("role_farmer")} · {profile.location}</>
            }
          </div>
          <div className="prof-crops">
            {(editing ? draft : profile).crops.map(c => (
              <span key={c} className="crop-tag" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <CropIcon crop={c} size={12} /> {tn(c)}
              </span>
            ))}
          </div>
        </div>

        {/* Personal Stats — farmer only */}
        {userRole !== "buyer" && (
          <div className="card">
            <div className="card-title">{t("prof_stats")}</div>
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

        {/* Contact Info */}
        <div className="card">
          <div className="card-title">{t("prof_contact")}</div>
          {contactFields.map(f => (
            <div className="info-row" key={f.key}>
              <div className="info-ico">{f.ico}</div>
              <div style={{ flex: 1 }}>
                <div className="info-lbl">{f.lbl}</div>
                {editing
                  ? <input value={draft[f.key]} onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                    style={{ width: "100%", border: "1px solid #e9e0d2", borderRadius: 6, padding: "4px 8px", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: "#26201a", outline: "none", background: "#faf6ef" }} />
                  : <div className="info-val">{profile[f.key]}</div>
                }
              </div>
            </div>
          ))}
        </div>

        {/* Farm Details — farmer only */}
        {userRole !== "buyer" && (
          <div className="card">
            <div className="card-title">{t("prof_farm_details")}</div>
            {farmFields.map(f => (
              <div className="info-row" key={f.key}>
                <div className="info-ico">{f.ico}</div>
                <div style={{ flex: 1 }}>
                  <div className="info-lbl">{f.lbl}</div>
                  {editing
                    ? <input value={draft[f.key]} onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                      style={{ width: "100%", border: "1px solid #e9e0d2", borderRadius: 6, padding: "4px 8px", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: "#26201a", outline: "none", background: "#faf6ef" }} />
                    : <div className="info-val">{profile[f.key]}</div>
                  }
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Crop Specialization — farmer only */}
        {userRole !== "buyer" && (
          <div className="card">
            <div className="card-title">{t("prof_crop_spec")}</div>
            {editing
              ? <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ALL_CROPS.map(c => (
                  <button key={c} onClick={() => toggleCrop(c)}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 99, border: `1px solid ${draft.crops.includes(c) ? "#2e7d4f" : "#e9e0d2"}`, background: draft.crops.includes(c) ? "#e6f2e9" : "#fff", color: draft.crops.includes(c) ? "#2e7d4f" : "#82735f", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                    <CropIcon crop={c} size={14} /> {tn(c)}
                  </button>
                ))}
              </div>
              : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {profile.crops.map(c => (
                  <span key={c} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 99, background: "#e6f2e9", border: "1px solid #cfe7d6", color: "#2e7d4f", fontSize: 14, fontWeight: 600 }}>
                    <CropIcon crop={c} size={14} /> {tn(c)}
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
              <div className="card-title">{t("prof_preferences")}</div>
              <div className="setting-row">
                <div className="setting-ico" style={{ background: "#faeecd" }}><Bell size={16} color="#6f4a08" /></div>
                <div style={{ flex: 1 }}>
                  <div className="setting-lbl">{t("prof_notifications")}</div>
                  <div className="setting-sub">{t("prof_notifications_sub")}</div>
                </div>
                <ChevronRight size={16} color="#d6cab6" />
              </div>
              <div className="setting-row" style={{ cursor: "default", flexDirection: "column", alignItems: "stretch", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <div className="setting-ico" style={{ background: "#e9eff6" }}><Globe size={16} color="#2f5586" /></div>
                  <div style={{ flex: 1 }}>
                    <div className="setting-lbl">{t("prof_language")}</div>
                    <div className="setting-sub">{t("prof_language_sub")}</div>
                  </div>
                </div>
                <LanguageToggle />
              </div>
            </div>

            <div className="card">
              <div className="card-title">{t("prof_support")}</div>
              {supportSettings.map(s => (
                <div key={s.label} className="setting-row">
                  <div className="setting-ico" style={{ background: s.bg }}>{s.ico}</div>
                  <div style={{ flex: 1 }}>
                    <div className="setting-lbl">{s.label}</div>
                    <div className="setting-sub">{s.sub}</div>
                  </div>
                  <ChevronRight size={16} color="#d6cab6" />
                </div>
              ))}
            </div>

            <button className="signout-btn" onClick={onSignOut} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <LogOut size={16} color="#c74133" /> {t("prof_sign_out")}
            </button>

            <div className="version-txt">AniSense v1.0.0 · Ani mo, alam mo.</div>
          </>
        )}

        {editing && (
          <button onClick={cancel} style={{ width: "100%", padding: 14, background: "#f1e9dc", color: "#4d4237", border: "none", borderRadius: "var(--radius)", fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            {t("cancel")}
          </button>
        )}
      </div>
    </div>
  );
}
