import { useState, type KeyboardEvent, type ReactNode } from "react";
import { haptic } from "../../lib/platform";
import { Wheat, ShoppingCart, ArrowLeft, Check, AlertCircle, MapPin, Smartphone, Mail } from "lucide-react";
import { useLang } from "../../i18n";
import { UserRole, FarmDetails } from "../../types";
import { MAIN_CROPS } from "../../data/crops";
import { FARM_PROVINCE, MUNICIPALITIES, BARANGAYS_BY_MUNICIPALITY, formatFarmLocation } from "../../data/locations";
import { CropEmoji } from "../../components/CropEmoji";
import { AniSenseLogo } from "../../components/AniSenseLogo";

// ─── Sign In / Sign Up Form ───────────────────────────────────────────────────
// Validation and flow are unchanged from the original. What changed is the
// presentation: labels sit above the field permanently (placeholder-only labels
// vanish exactly when an older user looks up to check what they were filling
// in), the password reveal is a word rather than a 16px eye icon, and errors
// carry an icon so state is never signalled by colour alone.
//
// Errors now appear under the field they're about, and that field takes focus,
// so the fix is where the eye already is instead of at the bottom of the form.

type Field = "name" | "contact" | "password" | "confirm";

// Chunked the way Filipinos read numbers aloud: 917 123 4567, or 0917 123 4567.
// State keeps digits only, so validation never sees the spaces.
const fmtPhone = (d: string) => {
  const groups = d.startsWith("0") ? [4, 3, 4] : [3, 3, 4];
  const out: string[] = [];
  let i = 0;
  for (const n of groups) {
    if (i >= d.length) break;
    out.push(d.slice(i, i + n));
    i += n;
  }
  return out.join(" ");
};
const digits = (v: string) => v.replace(/\D/g, "").slice(0, 11);

// Enter on a "next" field moves on instead of submitting half a form.
const focusNext = (id: string) => (e: KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") { e.preventDefault(); document.getElementById(id)?.focus(); }
};

export function AuthFormScreen({
  flow, role, onBack, onSuccess,
}: {
  flow: "signin" | "signup";
  role: UserRole;
  onBack: () => void;
  /** isNew: the account was just created (not signed in), so the app shows the welcome ID. */
  onSuccess: (name: string, role: UserRole, crops: string[], farmDetails?: FarmDetails, isNew?: boolean) => void;
}) {
  const [mode, setMode] = useState<"gmail" | "phone">("phone");
  const [formFlow, setFormFlow] = useState(flow);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [errField, setErrField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "details" | "crops">("form");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [farmYears, setFarmYears] = useState("");
  const [farmMunicipality, setFarmMunicipality] = useState("");
  const [farmBarangay, setFarmBarangay] = useState("");
  const [farmPhone, setFarmPhone] = useState("");
  const { t, tn } = useLang();

  const signup = formFlow === "signup";
  // Short on purpose: it rides the brand row, and "Account ng Magsasaka" would
  // push it off a 360px screen. The title already says it's an account.
  const roleLabel = role === "farmer" ? t("role_farmer") : t("role_buyer");
  const roleIcon = role === "farmer"
    ? <Wheat size={14} color="#fff" strokeWidth={2.2} />
    : <ShoppingCart size={14} color="#fff" strokeWidth={2.2} />;

  const labelContact = mode === "gmail" ? t("auth_gmail_address") : t("auth_cp_number");

  const clear = () => { setError(""); setErrField(null); };

  const fail = (field: Field, msg: string) => {
    setError(msg);
    setErrField(field);
    haptic.select();
    // After paint, so the field is focusable if it only just gained its error.
    requestAnimationFrame(() => document.getElementById(`f-${field}`)?.focus());
    return false;
  };

  const validate = () => {
    if (signup && !name.trim()) return fail("name", t("err_full_name"));
    if (!contact.trim()) return fail("contact", mode === "gmail" ? t("err_gmail_required") : t("err_cp_required"));
    if (mode === "gmail" && !contact.includes("@")) return fail("contact", t("err_valid_gmail"));
    if (mode === "phone" && !/^0?9\d{9}$/.test(contact)) return fail("contact", t("err_valid_phone"));
    if (!password) return fail("password", t("err_password_required"));
    if (signup && password.length < 6) return fail("password", t("err_password_short"));
    if (signup && password !== confirm) return fail("confirm", t("err_password_mismatch"));
    return true;
  };

  const submit = () => {
    clear();
    if (!validate()) return;
    if (signup && role === "farmer") {
      if (mode === "phone" && !farmPhone) setFarmPhone(contact);
      setStep("details");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const displayName = signup ? name.trim() : (role === "farmer" ? "Juan Dela Cruz" : "Maria Santos");
      onSuccess(displayName, role, selectedCrops.length > 0 ? selectedCrops : ["Rice", "Corn"], undefined, signup);
    }, 1200);
  };

  const finishDetails = () => {
    const yrs = Number(farmYears);
    if (!farmYears.trim() || isNaN(yrs) || yrs < 0 || yrs > 80) { setError(t("err_years_required")); return; }
    if (!farmMunicipality) { setError(t("err_municipality_required")); return; }
    if (!farmBarangay) { setError(t("err_barangay_required")); return; }
    if (!farmPhone.trim()) { setError(t("err_phone_required")); return; }
    if (!/^0?9\d{9}$/.test(farmPhone)) { setError(t("err_valid_phone")); return; }
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
      }, true);
    }, 1200);
  };

  const toggleCrop = (crop: string) => {
    setSelectedCrops(prev =>
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    );
  };

  const alert = () => error ? (
    <div className="a-alert" role="alert">
      <AlertCircle size={22} strokeWidth={2.2} />
      <span>{error}</span>
    </div>
  ) : null;

  // Error line under one field. Keyed on the message so a second, different
  // mistake on the same field re-announces and re-enters.
  const fieldErr = (f: Field) => errField === f && error ? (
    <p className="a-err" id={`f-${f}-err`} role="alert" key={error}>
      <AlertCircle size={18} strokeWidth={2.4} />
      <span>{error}</span>
    </p>
  ) : null;

  const errProps = (f: Field, helpId?: string) => ({
    "aria-invalid": errField === f || undefined,
    "aria-describedby": [errField === f ? `f-${f}-err` : "", helpId ?? ""].filter(Boolean).join(" ") || undefined,
  });

  // Same header as the language and role steps: whose app on top, what this
  // step is below, and the account type riding on the brand row where it
  // costs no height.
  const head = (title: string, sub?: string, extra?: ReactNode) => (
    <div className="a-inkhead a-formhead">
      <div className="a-brandrow">
        <span className="a-brandmark"><AniSenseLogo size={26} /></span>
        <span className="a-brandname">AniSense</span>
        <span className="a-badge">{roleIcon} {roleLabel}</span>
      </div>
      <h1 className="a-title on-ink">{title}</h1>
      {sub && <p className="a-sub on-ink">{sub}</p>}
      {extra}
    </div>
  );

  // Back beside the primary action, as on the earlier steps, so the whole
  // setup is driven from one place under the thumb.
  const dock = (onUp: () => void, primary: ReactNode, before?: ReactNode, after?: ReactNode) => (
    <div className="a-dock">
      {before}
      <div className="a-dockpair">
        <button type="button" className="a-iconbtn on-paper" onClick={onUp} aria-label={t("back")}>
          <ArrowLeft size={24} color="var(--ink)" strokeWidth={2.4} />
        </button>
        {primary}
      </div>
      {after}
    </div>
  );

  const busy = (label: string) => (
    <><span className="a-spin" aria-hidden="true" />{label}</>
  );

  // ── Step 2 (farmer): farm details ──
  if (step === "details") {
    return (
      <div className="a-screen">
        {head(t("farm_details_title"), t("farm_details_sub"))}
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
              <input id="f-phone" className="a-inp num" type="tel" inputMode="numeric" autoComplete="tel-national"
                placeholder="9XX XXX XXXX" maxLength={13}
                value={fmtPhone(farmPhone)}
                onChange={e => { setFarmPhone(digits(e.target.value)); setError(""); }} />
            </div>
          </div>

          {alert()}
          <div style={{ height: 24 }} />
        </div>
        {dock(
          () => { setStep("form"); setError(""); },
          <button type="button" className="a-btn a-btn-green" onClick={finishDetails}>{t("continue")}</button>,
        )}
      </div>
    );
  }

  // ── Step 3 (farmer): crop specialisation ──
  if (step === "crops") {
    return (
      <div className="a-screen">
        {head(t("crops_title"), t("crops_sub"))}
        <div className="a-scroll">
          <div className="a-cropgrid">
            {MAIN_CROPS.map(crop => {
              const on = selectedCrops.includes(crop);
              return (
                <button
                  key={crop}
                  type="button"
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
          {alert()}
          <div style={{ height: 20 }} />
        </div>
        {dock(
          () => { setStep("details"); setError(""); },
          <button type="button" className="a-btn a-btn-green" onClick={finishCrops} disabled={loading} aria-busy={loading}>
            {loading ? busy(t("crops_setting_up")) : t("continue")}
          </button>,
          <p className="a-count">
            {selectedCrops.length === 0
              ? t("crops_none_yet")
              : `${selectedCrops.length} ${t("crops_selected")}`}
          </p>,
        )}
      </div>
    );
  }

  // ── Step 1: account ──
  const pwOk = password.length >= 6;
  const confirmOk = confirm.length > 0 && confirm === password;

  return (
    // A real form, so the keyboard's Go key submits and password managers
    // recognise the sign-up.
    <form className="a-screen" noValidate onSubmit={e => { e.preventDefault(); submit(); }}>
      {/* The sign-in / sign-up switch lives up here, not under the primary
          button: a returning user sees it before typing anything, and it's
          out of reach of a thumb aiming for Create Account. */}
      {head(
        signup ? t("auth_create_title") : t("auth_signin_title"),
        signup ? t("auth_create_sub") : t("auth_signin_sub"),
        <p className="a-switch on-ink">
          {signup
            ? <>{t("auth_have_account")} <button type="button" className="a-link" onClick={() => { setFormFlow("signin"); clear(); }}>{t("auth_signin_btn")}</button></>
            : <>{t("auth_no_account")} <button type="button" className="a-link" onClick={() => { setFormFlow("signup"); clear(); }}>{t("auth_sign_up_link")}</button></>
          }
        </p>,
      )}

      <div className="a-scroll">
        {signup && (
          <div className="a-field">
            <label className="a-lbl" htmlFor="f-name">{t("auth_full_name")}</label>
            <input id="f-name" className={`a-inp ${errField === "name" ? "bad" : ""}`}
              placeholder={t("auth_full_name_ph")}
              autoComplete="name" autoCapitalize="words" enterKeyHint="next"
              onKeyDown={focusNext("f-contact")}
              {...errProps("name")}
              value={name} onChange={e => { setName(e.target.value); clear(); }} />
            {fieldErr("name")}
          </div>
        )}

        {/* Both ways in are visible at once. A link that swaps the field hid
            the Gmail option and read "Sign in" on a sign-up screen. */}
        <div className="a-field">
          <div className="a-seg" role="radiogroup" aria-label={t("auth_contact_method")} data-mode={mode}>
            <span className="a-seg-thumb" aria-hidden="true" />
            {([["phone", <Smartphone key="i" size={18} strokeWidth={2.2} />, t("auth_cp_number")],
               ["gmail", <Mail key="i" size={18} strokeWidth={2.2} />, "Gmail"]] as const).map(([id, ico, lbl]) => (
              <button key={id} type="button" role="radio" aria-checked={mode === id}
                className={mode === id ? "on" : ""}
                onClick={() => {
                  if (mode === id) return;
                  haptic.select(); setMode(id); setContact(""); clear();
                  requestAnimationFrame(() => document.getElementById("f-contact")?.focus());
                }}>
                {ico}{lbl}
              </button>
            ))}
          </div>

          <label className="a-lbl" htmlFor="f-contact">{labelContact}</label>
          {mode === "gmail" ? (
            <input id="f-contact" className={`a-inp ${errField === "contact" ? "bad" : ""}`} type="email"
              placeholder="juan@gmail.com" autoComplete="email" autoCapitalize="none" spellCheck={false}
              enterKeyHint="next" onKeyDown={focusNext("f-password")}
              {...errProps("contact", "f-contact-help")}
              value={contact} onChange={e => { setContact(e.target.value.trim()); clear(); }} />
          ) : (
            <div className="a-prefix-row">
              <span className="a-prefix">+63</span>
              <input id="f-contact" className={`a-inp num ${errField === "contact" ? "bad" : ""}`} type="tel"
                inputMode="numeric" autoComplete="tel-national" placeholder="9XX XXX XXXX" maxLength={13}
                enterKeyHint="next" onKeyDown={focusNext("f-password")}
                {...errProps("contact", "f-contact-help")}
                value={fmtPhone(contact)}
                onChange={e => { setContact(digits(e.target.value)); clear(); }} />
            </div>
          )}
          {errField === "contact" ? fieldErr("contact") : <p className="a-help" id="f-contact-help">{t("auth_help_cp")}</p>}
        </div>

        <div className="a-field">
          <label className="a-lbl" htmlFor="f-password">{t("auth_password")}</label>
          <div className="a-pwrow">
            <input id="f-password" className={`a-inp ${errField === "password" ? "bad" : ""}`}
              type={showPw ? "text" : "password"}
              placeholder={t("auth_password_ph")}
              autoComplete={signup ? "new-password" : "current-password"}
              enterKeyHint={signup ? "next" : "go"}
              onKeyDown={signup ? focusNext("f-confirm") : undefined}
              {...errProps("password", signup ? "f-password-help" : undefined)}
              value={password} onChange={e => { setPassword(e.target.value); clear(); }} />
            <button type="button" className="a-reveal" aria-pressed={showPw} onClick={() => setShowPw(s => !s)}>
              {showPw ? t("auth_hide") : t("auth_show")}
            </button>
          </div>
          {errField === "password"
            ? fieldErr("password")
            : signup && (
              // The rule turns into a tick the moment it's met: the form
              // confirms progress as it happens, not only on submit.
              <p className={`a-help a-hint ${pwOk ? "ok" : ""}`} id="f-password-help">
                <span className="a-hint-ico"><Check size={12} strokeWidth={3.4} /></span>
                {t("auth_help_pw")}
              </p>
            )}
        </div>

        {signup && (
          <div className="a-field">
            <label className="a-lbl" htmlFor="f-confirm">{t("auth_confirm_password")}</label>
            <input id="f-confirm" className={`a-inp ${errField === "confirm" ? "bad" : ""}`}
              type={showPw ? "text" : "password"}
              placeholder={t("auth_confirm_password_ph")}
              autoComplete="new-password" enterKeyHint="go"
              {...errProps("confirm")}
              value={confirm} onChange={e => { setConfirm(e.target.value); clear(); }} />
            {errField === "confirm"
              ? fieldErr("confirm")
              : confirmOk && (
                <p className="a-help a-hint ok a-hint-in">
                  <span className="a-hint-ico"><Check size={12} strokeWidth={3.4} /></span>
                  {t("auth_pw_match")}
                </p>
              )}
          </div>
        )}

        {!signup && (
          <div style={{ marginTop: 6 }}>
            <button type="button" className="a-link">{t("auth_forgot")}</button>
          </div>
        )}
        <div style={{ height: 20 }} />
      </div>

      {dock(
        onBack,
        <button type="submit" className="a-btn a-btn-green" disabled={loading} aria-busy={loading}>
          {loading ? busy(t("please_wait")) : signup ? t("auth_create_btn") : t("auth_signin_btn")}
        </button>,
      )}
    </form>
  );
}
