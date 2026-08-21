import { useState } from "react";
import { haptic } from "../../lib/platform";
import { Wheat, ShoppingCart, ArrowLeft, Check, AlertCircle, MapPin } from "lucide-react";
import { useLang } from "../../i18n";
import { UserRole, FarmDetails } from "../../types";
import { MAIN_CROPS } from "../../data/crops";
import { FARM_PROVINCE, MUNICIPALITIES, BARANGAYS_BY_MUNICIPALITY, formatFarmLocation } from "../../data/locations";
import { CropEmoji } from "../../components/CropEmoji";

// ─── Sign In / Sign Up Form ───────────────────────────────────────────────────
// Validation and flow are unchanged from the original. What changed is the
// presentation: labels sit above the field permanently (placeholder-only labels
// vanish exactly when an older user looks up to check what they were filling
// in), the password reveal is a word rather than a 16px eye icon, and errors
// carry an icon so state is never signalled by colour alone.
export function AuthFormScreen({
  flow, role, onBack, onSuccess,
}: {
  flow: "signin" | "signup";
  role: UserRole;
  onBack: () => void;
  onSuccess: (name: string, role: UserRole, crops: string[], farmDetails?: FarmDetails) => void;
}) {
  const [mode, setMode] = useState<"gmail" | "phone">("phone");
  const [formFlow, setFormFlow] = useState(flow);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "details" | "crops">("form");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [farmYears, setFarmYears] = useState("");
  const [farmMunicipality, setFarmMunicipality] = useState("");
  const [farmBarangay, setFarmBarangay] = useState("");
  const [farmPhone, setFarmPhone] = useState("");
  const { t, tn } = useLang();

  const roleLabel = role === "farmer" ? t("auth_farmer_account") : t("auth_buyer_account");
  const roleIcon = role === "farmer"
    ? <Wheat size={15} color="#fff" strokeWidth={2.2} />
    : <ShoppingCart size={15} color="#fff" strokeWidth={2.2} />;

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
    if (!farmMunicipality) { setError(t("err_municipality_required")); return; }
    if (!farmBarangay) { setError(t("err_barangay_required")); return; }
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
        location: formatFarmLocation(farmBarangay, farmMunicipality),
        phone: farmPhone.trim(),
      });
    }, 1200);
  };

  const toggleCrop = (crop: string) => {
    setSelectedCrops(prev =>
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    );
  };

  const Alert = () => error ? (
    <div className="a-alert" role="alert">
      <AlertCircle size={22} strokeWidth={2.2} />
      <span>{error}</span>
    </div>
  ) : null;

  const Head = ({ onUp, title, sub }: { onUp: () => void; title: string; sub?: string }) => (
    <div className="a-inkhead">
      <button className="a-iconbtn" onClick={onUp} aria-label={t("back")}>
        <ArrowLeft size={24} color="#fff" strokeWidth={2.4} />
      </button>
      <h1 className="a-title on-ink" style={{ marginTop: 18 }}>{title}</h1>
      {sub && <p className="a-sub on-ink">{sub}</p>}
      <span className="a-badge">{roleIcon} {roleLabel}</span>
    </div>
  );

  // ── Step 2 (farmer): farm details ──
  if (step === "details") {
    return (
      <div className="a-screen">
        <Head onUp={() => { setStep("form"); setError(""); }} title={t("farm_details_title")} sub={t("farm_details_sub")} />
        <div className="a-scroll">
          <div className="a-field">
            <label className="a-lbl" htmlFor="f-years">{t("farm_years_lbl")}</label>
            <input id="f-years" className="a-inp num" type="number" inputMode="numeric" min={0} max={80}
              placeholder={t("farm_years_ph")} value={farmYears}
              onChange={e => { setFarmYears(e.target.value); setError(""); }} />
            <p className="a-help">{t("auth_help_years")}</p>
          </div>

          {/* Location is picked, not typed. Free text produced "Talavera",
              "talavera n.e.", and "Brgy. San Ricardo Talavera" for the same
              place, none of which a buyer can filter on. */}
          <div className="a-field">
            <label className="a-lbl">{t("farm_loc_lbl")}</label>
            <div className="a-locked">
              <MapPin size={20} color="var(--tanim)" />
              <span>{FARM_PROVINCE}</span>
              <span className="a-locked-note">{t("farm_province_lbl")}</span>
            </div>
          </div>

          <div className="a-field">
            <label className="a-lbl" htmlFor="f-mun">{t("farm_municipality_lbl")}</label>
            <select id="f-mun" className="a-inp a-select" value={farmMunicipality}
              onChange={e => { setFarmMunicipality(e.target.value); setFarmBarangay(""); setError(""); }}>
              <option value="">{t("farm_pick_municipality")}</option>
              {MUNICIPALITIES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="a-field">
            <label className="a-lbl" htmlFor="f-brgy">{t("farm_barangay_lbl")}</label>
            <select id="f-brgy" className="a-inp a-select" value={farmBarangay}
              disabled={!farmMunicipality}
              onChange={e => { setFarmBarangay(e.target.value); setError(""); }}>
              <option value="">
                {farmMunicipality ? t("farm_pick_barangay") : t("farm_pick_municipality_first")}
              </option>
              {(BARANGAYS_BY_MUNICIPALITY[farmMunicipality] ?? []).map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div className="a-field">
            <label className="a-lbl" htmlFor="f-phone">{t("farm_phone_lbl")}</label>
            <div className="a-prefix-row">
              <span className="a-prefix">+63</span>
              <input id="f-phone" className="a-inp num" type="tel" placeholder="9XX XXX XXXX" maxLength={11}
                value={farmPhone}
                onChange={e => { setFarmPhone(e.target.value.replace(/\D/g, "")); setError(""); }} />
            </div>
          </div>

          <Alert />
          <div style={{ height: 24 }} />
        </div>
        <div className="a-dock">
          <button className="a-btn a-btn-green" onClick={finishDetails}>{t("continue")}</button>
        </div>
      </div>
    );
  }

  // ── Step 3 (farmer): crop specialisation ──
  if (step === "crops") {
    return (
      <div className="a-screen">
        <Head onUp={() => { setStep("details"); setError(""); }} title={t("crops_title")} sub={t("crops_sub")} />
        <div className="a-scroll">
          <div className="a-cropgrid">
            {MAIN_CROPS.map(crop => {
              const on = selectedCrops.includes(crop);
              return (
                <button
                  key={crop}
                  className={`a-crop ${on ? "on" : ""}`}
                  aria-pressed={on}
                  onClick={() => { haptic.select(); toggleCrop(crop); setError(""); }}
                >
                  <CropEmoji crop={crop} size={34} />
                  <span>
                    <span className="a-crop-n">{tn(crop)}</span>
                    <span className="a-crop-e">{crop}</span>
                  </span>
                  <span className="a-crop-tick"><Check size={14} color="#fff" strokeWidth={3.6} /></span>
                </button>
              );
            })}
          </div>
          <Alert />
          <div style={{ height: 20 }} />
        </div>
        <div className="a-dock">
          <p className="a-count">
            {selectedCrops.length === 0
              ? t("crops_none_yet")
              : `${selectedCrops.length} ${t("crops_selected")}`}
          </p>
          <button className="a-btn a-btn-green" onClick={finishCrops} disabled={loading}>
            {loading ? t("crops_setting_up") : t("continue")}
          </button>
        </div>
      </div>
    );
  }

  // ── Step 1: account ──
  return (
    <div className="a-screen">
      <Head
        onUp={onBack}
        title={formFlow === "signin" ? t("auth_signin_title") : t("auth_create_title")}
        sub={formFlow === "signin" ? t("auth_signin_sub") : t("auth_create_sub")}
      />

      <div className="a-scroll">
        {formFlow === "signup" && (
          <div className="a-field">
            <label className="a-lbl" htmlFor="f-name">{t("auth_full_name")}</label>
            <input id="f-name" className="a-inp" placeholder={t("auth_full_name_ph")}
              value={name} onChange={e => { setName(e.target.value); setError(""); }} />
          </div>
        )}

        <div className="a-field">
          <label className="a-lbl" htmlFor="f-contact">{labelContact}</label>
          {mode === "gmail" ? (
            <input id="f-contact" className="a-inp" type="email" placeholder="juan@gmail.com"
              value={contact} onChange={e => { setContact(e.target.value); setError(""); }} />
          ) : (
            <div className="a-prefix-row">
              <span className="a-prefix">+63</span>
              <input id="f-contact" className="a-inp num" type="tel" placeholder="9XX XXX XXXX" maxLength={11}
                value={contact}
                onChange={e => { setContact(e.target.value.replace(/\D/g, "")); setError(""); }} />
            </div>
          )}
          <p className="a-help">{t("auth_help_cp")}</p>
          <button
            className="a-link"
            onClick={() => { setMode(mode === "phone" ? "gmail" : "phone"); setContact(""); setError(""); }}
          >
            {t("auth_sign_in_with")} {mode === "phone" ? "Gmail" : t("auth_cp_number")}
          </button>
        </div>

        <div className="a-field">
          <label className="a-lbl" htmlFor="f-pw">{t("auth_password")}</label>
          <div className="a-pwrow">
            <input id="f-pw" className="a-inp" type={showPw ? "text" : "password"}
              placeholder={t("auth_password_ph")}
              value={password} onChange={e => { setPassword(e.target.value); setError(""); }} />
            <button className="a-reveal" onClick={() => setShowPw(s => !s)}>
              {showPw ? t("auth_hide") : t("auth_show")}
            </button>
          </div>
          {formFlow === "signup" && <p className="a-help">{t("auth_help_pw")}</p>}
        </div>

        {formFlow === "signup" && (
          <div className="a-field">
            <label className="a-lbl" htmlFor="f-confirm">{t("auth_confirm_password")}</label>
            <input id="f-confirm" className="a-inp" type={showPw ? "text" : "password"}
              placeholder={t("auth_confirm_password_ph")}
              value={confirm} onChange={e => { setConfirm(e.target.value); setError(""); }} />
          </div>
        )}

        <Alert />

        {formFlow === "signin" && (
          <div style={{ marginTop: 6 }}>
            <button className="a-link">{t("auth_forgot")}</button>
          </div>
        )}
        <div style={{ height: 20 }} />
      </div>

      <div className="a-dock">
        <button className="a-btn a-btn-green" onClick={submit} disabled={loading}>
          {loading ? t("please_wait") : formFlow === "signin" ? t("auth_signin_btn") : t("auth_create_btn")}
        </button>
        <p className="a-switch">
          {formFlow === "signin"
            ? <>{t("auth_no_account")} <button className="a-link" onClick={() => { setFormFlow("signup"); setError(""); }}>{t("auth_sign_up_link")}</button></>
            : <>{t("auth_have_account")} <button className="a-link" onClick={() => { setFormFlow("signin"); setError(""); }}>{t("auth_signin_btn")}</button></>
          }
        </p>
      </div>
    </div>
  );
}
