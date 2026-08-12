import { useState } from "react";
import { Wheat, ShoppingCart, ArrowLeft, Calendar, MapPin, Phone, User, Mail, Lock } from "lucide-react";
import { useLang } from "../../i18n";
import { UserRole, FarmDetails } from "../../types";
import { MAIN_CROPS } from "../../data/crops";
import { CropIcon } from "../../components/icons";

// ─── Sign In / Sign Up Form ───────────────────────────────────────────────────
export function AuthFormScreen({
  flow, role, onBack, onSuccess,
}: {
  flow: "signin" | "signup";
  role: UserRole;
  onBack: () => void;
  onSuccess: (name: string, role: UserRole, crops: string[], farmDetails?: FarmDetails) => void;
}) {
  const [mode, setMode] = useState<"gmail" | "phone">("gmail");
  const [formFlow, setFormFlow] = useState(flow);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "details" | "crops">("form");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [farmYears, setFarmYears] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [farmPhone, setFarmPhone] = useState("");
  const { t, tn } = useLang();

  const roleLabel = role === "farmer" ? t("auth_farmer_account") : t("auth_buyer_account");
  const roleIcon = role === "farmer"
    ? <Wheat size={14} color="#fff" />
    : <ShoppingCart size={14} color="#fff" />;

  const placeholderContact = mode === "gmail" ? "you@gmail.com" : "9XX XXX XXXX";
  const labelContact = mode === "gmail" ? t("auth_gmail_address") : t("auth_cp_number");

  const validate = () => {
    if (formFlow === "signup" && !name.trim()) { setError(t("err_full_name")); return false; }
    if (!contact.trim()) { setError(mode === "gmail" ? t("err_gmail_required") : t("err_cp_required")); return false; }
    if (mode === "gmail" && !contact.includes("@")) { setError(t("err_valid_gmail")); return false; }
    if (mode === "phone" && !/^0?9\d{9}$/.test(contact.replace(/\s/g, ""))) { setError(t("err_valid_phone")); return false; }
    if (!password) { setError(t("err_password_required")); return false; }
    if (formFlow === "signup" && password.length < 6) { setError(t("err_password_short")); return false; }
    if (formFlow === "signup" && password !== confirm) { setError(t("err_password_mismatch")); return false; }
    return true;
  };

  const submit = () => {
    setError("");
    if (!validate()) return;
    if (formFlow === "signup" && role === "farmer") {
      // Pre-fill the phone field if they signed up with a CP number
      if (mode === "phone" && !farmPhone) setFarmPhone(contact);
      setStep("details");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const displayName = formFlow === "signup" ? name.trim() : (role === "farmer" ? "Juan Dela Cruz" : "Maria Santos");
      onSuccess(displayName, role, selectedCrops.length > 0 ? selectedCrops : ["Rice", "Corn"]);
    }, 1200);
  };

  const finishDetails = () => {
    const yrs = Number(farmYears);
    if (!farmYears.trim() || isNaN(yrs) || yrs < 0 || yrs > 80) { setError(t("err_years_required")); return; }
    if (!farmLocation.trim()) { setError(t("err_loc_required")); return; }
    if (!farmPhone.trim()) { setError(t("err_phone_required")); return; }
    if (!/^0?9\d{9}$/.test(farmPhone.replace(/\s/g, ""))) { setError(t("err_valid_phone")); return; }
    setError("");
    setStep("crops");
  };

  const finishCrops = () => {
    if (selectedCrops.length === 0) { setError(t("err_select_crop")); return; }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(name.trim(), role, selectedCrops, {
        years: farmYears.trim(),
        location: farmLocation.trim(),
        phone: farmPhone.trim(),
      });
    }, 1200);
  };

  const toggleCrop = (crop: string) => {
    setSelectedCrops(prev =>
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    );
  };

  if (step === "details") {
    return (
      <div className="auth-form-wrap">
        <div className="auth-form-top">
          <button className="role-back-btn" onClick={() => { setStep("form"); setError(""); }}>
            <ArrowLeft size={16} color="#fff" />
          </button>
          <div className="auth-form-brand">
            <Wheat size={14} color="rgba(255,255,255,0.8)" /> AniSense
          </div>
          <div className="auth-form-title">{t("farm_details_title")}</div>
          <div className="auth-form-sub">{t("farm_details_sub")}</div>
          <div className="auth-role-badge"><Wheat size={14} color="#fff" /> {t("auth_farmer_account")}</div>
        </div>
        <div className="auth-body">
          <div>
            <div className="auth-field-lbl">{t("farm_years_lbl")}</div>
            <div className="auth-input-icon-wrap">
              <Calendar size={15} color="#aa9d8a" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
              <input className="auth-input" style={{ paddingLeft: 42 }} type="number" inputMode="numeric" min={0} max={80}
                placeholder={t("farm_years_ph")} value={farmYears}
                onChange={e => { setFarmYears(e.target.value); setError(""); }} />
            </div>
          </div>

          <div>
            <div className="auth-field-lbl">{t("farm_loc_lbl")}</div>
            <div className="auth-input-icon-wrap">
              <MapPin size={15} color="#aa9d8a" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
              <input className="auth-input" style={{ paddingLeft: 42 }} type="text"
                placeholder={t("farm_loc_ph")} value={farmLocation}
                onChange={e => { setFarmLocation(e.target.value); setError(""); }} />
            </div>
          </div>

          <div>
            <div className="auth-field-lbl">{t("farm_phone_lbl")}</div>
            <div style={{ display: "flex", gap: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#e6f2e9", border: "1.5px solid #2e7d4f", borderRight: "none", borderRadius: "12px 0 0 12px", padding: "0 12px", flexShrink: 0 }}>
                <Phone size={14} color="#2e7d4f" />
                <span style={{ fontSize: 15, fontWeight: 700, color: "#2e7d4f", whiteSpace: "nowrap" }}>+63</span>
              </div>
              <input
                className="auth-input"
                style={{ borderRadius: "0 12px 12px 0", borderLeft: "none", flex: 1 }}
                type="tel"
                placeholder="9XX XXX XXXX"
                maxLength={11}
                value={farmPhone}
                onChange={e => { setFarmPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
              />
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit-btn" onClick={finishDetails}>
            {t("continue")}
          </button>
        </div>
      </div>
    );
  }

  if (step === "crops") {
    return (
      <div className="auth-form-wrap">
        <div className="auth-form-top">
          <button className="role-back-btn" onClick={() => { setStep("details"); setError(""); }}>
            <ArrowLeft size={16} color="#fff" />
          </button>
          <div className="auth-form-brand">
            <Wheat size={14} color="rgba(255,255,255,0.8)" /> AniSense
          </div>
          <div className="auth-form-title">{t("crops_title")}</div>
          <div className="auth-form-sub">{t("crops_sub")}</div>
          <div className="auth-role-badge"><Wheat size={14} color="#fff" /> {t("auth_farmer_account")}</div>
        </div>
        <div className="auth-body">
          <div>
            <div className="auth-field-lbl">{t("crops_select_label")} ({selectedCrops.length} {t("crops_selected")})</div>
            <div className="crop-picker-grid">
              {MAIN_CROPS.map(crop => {
                const on = selectedCrops.includes(crop);
                return (
                  <button
                    key={crop}
                    className={`crop-picker-btn ${on ? "on" : ""}`}
                    onClick={() => { toggleCrop(crop); setError(""); }}
                  >
                    <span className="crop-picker-ico"><CropIcon crop={crop} size={20} /></span>
                    <span className="crop-picker-name">{tn(crop)}</span>
                    {on && <span className="crop-picker-check">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit-btn" onClick={finishCrops} disabled={loading}>
            {loading ? t("crops_setting_up") : `${t("crops_continue_with")} ${selectedCrops.length || 0} ${t("crops_crops")}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form-wrap">
      <div className="auth-form-top">
        <button className="role-back-btn" onClick={onBack}>
          <ArrowLeft size={16} color="#fff" />
        </button>
        <div className="auth-form-brand">
          <Wheat size={14} color="rgba(255,255,255,0.8)" /> AniSense
        </div>
        <div className="auth-form-title">{formFlow === "signin" ? t("auth_signin_title") : t("auth_create_title")}</div>
        <div className="auth-form-sub">{formFlow === "signin" ? t("auth_signin_sub") : t("auth_create_sub")}</div>
        <div className="auth-role-badge">{roleIcon} {roleLabel}</div>
      </div>

      <div className="auth-body">
        {/* Gmail / CP toggle */}
        <div>
          <div className="auth-field-lbl">{t("auth_sign_in_with")}</div>
          <div className="auth-toggle-row">
            <button className={`auth-tab ${mode === "gmail" ? "on" : ""}`} onClick={() => { setMode("gmail"); setContact(""); setError(""); }}>
              <Mail size={14} /> Gmail
            </button>
            <button className={`auth-tab ${mode === "phone" ? "on" : ""}`} onClick={() => { setMode("phone"); setContact(""); setError(""); }}>
              <Phone size={14} /> {t("auth_cp_number")}
            </button>
          </div>
        </div>

        {formFlow === "signup" && (
          <div>
            <div className="auth-field-lbl">{t("auth_full_name")}</div>
            <div className="auth-input-icon-wrap">
              <User size={15} color="#aa9d8a" className="auth-input-icon" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
              <input className="auth-input" style={{ paddingLeft: 42 }} placeholder={t("auth_full_name_ph")} value={name} onChange={e => setName(e.target.value)} />
            </div>
          </div>
        )}

        <div>
          <div className="auth-field-lbl">{labelContact}</div>
          {mode === "gmail" ? (
            <div className="auth-input-icon-wrap">
              <Mail size={15} color="#aa9d8a" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
              <input className="auth-input" style={{ paddingLeft: 42 }} type="email"
                placeholder={placeholderContact} value={contact} onChange={e => setContact(e.target.value)} />
            </div>
          ) : (
            <div style={{ display: "flex", gap: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#e6f2e9", border: "1.5px solid #2e7d4f", borderRight: "none", borderRadius: "12px 0 0 12px", padding: "0 12px", flexShrink: 0 }}>
                <Phone size={14} color="#2e7d4f" />
                <span style={{ fontSize: 15, fontWeight: 700, color: "#2e7d4f", whiteSpace: "nowrap" }}>+63</span>
              </div>
              <input
                className="auth-input"
                style={{ borderRadius: "0 12px 12px 0", borderLeft: "none", flex: 1 }}
                type="tel"
                placeholder="9XX XXX XXXX"
                maxLength={11}
                value={contact}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "");
                  setContact(val);
                }}
              />
            </div>
          )}
        </div>

        <div>
          <div className="auth-field-lbl">{t("auth_password")}</div>
          <div className="auth-input-icon-wrap">
            <Lock size={15} color="#aa9d8a" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
            <input className="auth-input" style={{ paddingLeft: 42 }} type="password"
              placeholder={t("auth_password_ph")} value={password} onChange={e => setPassword(e.target.value)} />
          </div>
        </div>

        {formFlow === "signup" && (
          <div>
            <div className="auth-field-lbl">{t("auth_confirm_password")}</div>
            <div className="auth-input-icon-wrap">
              <Lock size={15} color="#aa9d8a" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
              <input className="auth-input" style={{ paddingLeft: 42 }} type="password"
                placeholder={t("auth_confirm_password_ph")} value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-submit-btn" onClick={submit} disabled={loading}>
          {loading ? t("please_wait") : formFlow === "signin" ? t("auth_signin_btn") : t("auth_create_btn")}
        </button>

        <div className="auth-divider">
          <div className="auth-divider-line" /><div className="auth-divider-txt">{t("auth_or")}</div><div className="auth-divider-line" />
        </div>

        <div className="auth-switch-txt">
          {formFlow === "signin"
            ? <>{t("auth_no_account")} <span className="auth-switch-link" onClick={() => { setFormFlow("signup"); setError(""); }}>{t("auth_sign_up_link")}</span></>
            : <>{t("auth_have_account")} <span className="auth-switch-link" onClick={() => { setFormFlow("signin"); setError(""); }}>{t("auth_signin_btn")}</span></>
          }
        </div>
      </div>
    </div>
  );
}
