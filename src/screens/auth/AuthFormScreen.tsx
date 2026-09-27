import { useEffect, useState, type KeyboardEvent, type ReactNode } from "react";
import { haptic } from "../../lib/platform";
import { Wheat, ShoppingCart, ArrowLeft, Check, AlertCircle, MapPin, Smartphone, Mail } from "lucide-react";
import { useLang } from "../../i18n";
import { UserRole, FarmDetails } from "../../types";
import { MAIN_CROPS } from "../../data/crops";
import { FARM_PROVINCE, MUNICIPALITIES, BARANGAYS_BY_MUNICIPALITY, formatFarmLocation } from "../../data/locations";
import { ISLAND_GROUPS, IslandGroup, PH_PROVINCES } from "../../data/phPlaces";
import { CropEmoji } from "../../components/CropEmoji";
import { PickerField } from "../../components/ui/PickerField";
import { AniSenseLogo } from "../../components/AniSenseLogo";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "../../lib/supabase";
import { formatName } from "../../lib/names";
import { createAccount, signIn, verifyEmailCode, resendEmailCode, authErrorKey } from "../../services/auth";

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
  flow, role, onBack, onSuccess, onSession,
}: {
  flow: "signin" | "signup";
  role: UserRole;
  onBack: () => void;
  /** Demo sign-in, used while no Supabase project is set up in .env.
   *  isNew: the account was just created (not signed in), so the app shows the welcome ID. */
  onSuccess: (name: string, role: UserRole, crops: string[], farmDetails?: FarmDetails, isNew?: boolean) => void;
  /** Real sign-in: a Supabase session, from signing in or from a new account. */
  onSession?: (session: Session, isNew: boolean) => void;
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
  const [step, setStep] = useState<"form" | "details" | "crops" | "verify">("form");
  // Only for projects that still have email confirmation on: the address the
  // code went to, what was typed, and a quiet "sent" line after a resend.
  const [pendingEmail, setPendingEmail] = useState("");
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [farmYears, setFarmYears] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");
  // A buyer can be anywhere in the country: island group, then province,
  // then their city or town. Farmers stay in Nueva Ecija.
  const [island, setIsland] = useState<IslandGroup>("Luzon");
  const [province, setProvince] = useState("");
  // Every barangay in the country is half a megabyte, so it is fetched only
  // for a buyer, once they reach the step that asks, and only once.
  const [phBarangays, setPhBarangays] = useState<Record<string, Record<string, string[]>> | null>(null);
  useEffect(() => {
    if (role !== "buyer" || step !== "details" || phBarangays) return;
    let alive = true;
    import("../../data/phBarangays.json")
      .then(m => { if (alive) setPhBarangays(m.default as Record<string, Record<string, string[]>>); })
      .catch(() => { /* barangay is optional; the field simply stays closed */ });
    return () => { alive = false; };
  }, [role, step, phBarangays]);
  const [farmPhone, setFarmPhone] = useState("");
  const { t, tn } = useLang();

  const signup = formFlow === "signup";
  // A real account when the app has a database to put it in; the demo
  // sign-in otherwise, so a build without .env still opens for respondents.
  const live = isSupabaseConfigured && !!onSession;
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
    // Both roles say where they are before the account exists: a farmer so
    // buyers can find them, a buyer so the listings they are shown are ones
    // they can actually drive to. It was only ever asked of farmers, which
    // left every buyer sitting in a default town they never chose.
    if (signup) {
      if (mode === "phone" && !farmPhone) setFarmPhone(contact);
      setStep("details");
      return;
    }
    setLoading(true);
    if (live) {
      signIn(mode, contact, password)
        .then(session => { setLoading(false); onSession!(session, false); })
        .catch(err => {
          setLoading(false);
          const key = authErrorKey(err);
          // A wrong password is the likeliest miss, and the password field is
          // where the fix is typed; anything else is about the whole attempt.
          if (key === "err_login_wrong") fail("password", t(key));
          else { setError(t(key)); setErrField(null); }
        });
      return;
    }
    setTimeout(() => {
      setLoading(false);
      const displayName = signup ? formatName(name) : (role === "farmer" ? "Juan Dela Cruz" : "Maria Santos");
      onSuccess(displayName, role, selectedCrops.length > 0 ? selectedCrops : ["Rice", "Corn"], undefined, signup);
    }, 1200);
  };

  // ── Sign up, at the last step ──
  // The account is made once, at the end, with everything the steps asked.
  // Made at the first step, a farmer who stopped halfway would own an account
  // with no town and no crops, and would never be asked for them again.
  const createLive = (details: { location: string; phone?: string; years?: number; crops: string[] }) => {
    setLoading(true);
    setError("");
    createAccount({ name: formatName(name), role, mode, contact, password, ...details })
      .then(({ session, email }) => {
        setLoading(false);
        if (session) { onSession!(session, true); return; }
        // The project still asks for email confirmation. A Gmail account can
        // answer with the code; a CP-number account has no inbox to read it.
        if (mode === "phone") { setError(t("err_phone_confirm_on")); return; }
        setPendingEmail(email);
        setCode("");
        setNotice("");
        setStep("verify");
      })
      .catch(err => {
        setLoading(false);
        const key = authErrorKey(err);
        // Both of these are answered on the first step, so go back to it and
        // put the message under the field that needs changing.
        if (key === "err_account_exists") { setStep("form"); fail("contact", t(key)); return; }
        if (key === "err_password_short") { setStep("form"); fail("password", t(key)); return; }
        setError(t(key));
      });
  };

  const finishDetails = () => {
    const yrs = Number(farmYears);
    if (!farmYears.trim() || isNaN(yrs) || yrs < 0 || yrs > 80) { setError(t("err_years_required")); return; }
    if (!municipality) { setError(t("err_municipality_required")); return; }
    if (!barangay) { setError(t("err_barangay_required")); return; }
    if (!farmPhone.trim()) { setError(t("err_phone_required")); return; }
    if (!/^0?9\d{9}$/.test(farmPhone)) { setError(t("err_valid_phone")); return; }
    setError("");
    setStep("crops");
  };

  // Province and city are what a farmer needs to plan a delivery, so those
  // are required; barangay only sharpens it, so it is not.
  // "Bagong Sikat, Cabanatuan City, Nueva Ecija" / "Quezon City, Metro Manila".
  const buyerLocation = () => [barangay, municipality, province].filter(Boolean).join(", ");
  const finishBuyerLocation = () => {
    if (!province) { setError(t("err_province_required")); return; }
    if (!municipality) { setError(t("err_municipality_required")); return; }
    setError("");
    if (live) { createLive({ location: buyerLocation(), crops: [] }); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(formatName(name), role, [], {
        location: buyerLocation(),
        phone: contact.trim(),
      }, true);
    }, 1200);
  };

  const finishCrops = () => {
    if (selectedCrops.length === 0) { setError(t("err_select_crop")); return; }
    setError("");
    if (live) {
      createLive({
        location: formatFarmLocation(barangay, municipality),
        phone: farmPhone.trim(),
        years: Number(farmYears),
        crops: selectedCrops,
      });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(formatName(name), role, selectedCrops, {
        years: farmYears.trim(),
        location: formatFarmLocation(barangay, municipality),
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

  // ── Last step, only while email confirmation is on: the 6-digit code ──
  if (step === "verify") {
    const verify = () => {
      if (!/^\d{6}$/.test(code)) { setError(t("err_code_required")); return; }
      setLoading(true);
      setError("");
      verifyEmailCode(pendingEmail, code)
        .then(session => { setLoading(false); if (session) onSession!(session, true); })
        .catch(err => {
          setLoading(false);
          const key = authErrorKey(err);
          setError(t(key === "err_auth_generic" ? "err_code_wrong" : key));
        });
    };
    const resend = () => {
      setError("");
      resendEmailCode(pendingEmail)
        .then(() => setNotice(t("verify_resent")))
        .catch(err => setError(t(authErrorKey(err))));
    };
    return (
      <form className="a-screen" noValidate onSubmit={e => { e.preventDefault(); verify(); }}>
        {head(t("verify_title"), t("verify_sub").replace("{email}", pendingEmail))}
        <div className="a-scroll">
          <div className="a-field">
            <label className="a-lbl" htmlFor="f-code">{t("verify_lbl")}</label>
            {/* one-time-code lets Android offer the code from the email or
                SMS notification without the app reading anyone's messages. */}
            <input id="f-code" className="a-inp num a-code" type="text" inputMode="numeric"
              autoComplete="one-time-code" enterKeyHint="go" maxLength={6} placeholder="000000"
              value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); setNotice(""); }} />
            <p className="a-help" role="status">{notice || t("verify_help")}</p>
          </div>
          <button type="button" className="a-link" onClick={resend}>{t("verify_resend")}</button>
          {alert()}
          <div style={{ height: 24 }} />
        </div>
        {dock(
          () => { setStep(role === "buyer" ? "details" : "crops"); setError(""); },
          <button type="submit" className="a-btn a-btn-green" disabled={loading} aria-busy={loading}>
            {loading ? busy(t("please_wait")) : t("verify_btn")}
          </button>,
        )}
      </form>
    );
  }

  // ── Step 2 (buyer): where they are ──
  // Anywhere in the Philippines, narrowed the way people say it: Luzon,
  // Visayas or Mindanao, then the province, then the city or town. The same
  // pickers and dock as the farmer step: one setup flow with two endings.
  if (step === "details" && role === "buyer") {
    const provinces = PH_PROVINCES.filter(p => p.island === island);
    const places = PH_PROVINCES.find(p => p.name === province)?.places ?? [];
    const barangays = phBarangays?.[province]?.[municipality] ?? [];
    const pickIsland = (g: IslandGroup) => {
      if (g === island) return;
      haptic.select();
      setIsland(g); setProvince(""); setMunicipality(""); setBarangay(""); setError("");
    };
    return (
      <div className="a-screen">
        {head(t("buyer_loc_title"), t("buyer_loc_sub"))}
        <div className="a-scroll">
          <div className="a-field">
            <label className="a-lbl" id="f-island">{t("buyer_island_lbl")}</label>
            {/* Three, all visible: it is the one question everyone in the
                country answers without thinking, and it cuts 82 provinces
                to a list short enough to scan. */}
            <div className="a-seg three" role="radiogroup" aria-labelledby="f-island" data-i={ISLAND_GROUPS.indexOf(island)}>
              <span className="a-seg-thumb" aria-hidden="true" />
              {ISLAND_GROUPS.map(g => (
                <button key={g} type="button" role="radio" aria-checked={island === g}
                  className={island === g ? "on" : ""} onClick={() => pickIsland(g)}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="a-field">
            <label className="a-lbl">{t("farm_province_lbl")}</label>
            <PickerField
              title={t("farm_province_lbl")}
              placeholder={t("farm_pick_province")}
              value={province}
              // The region under each name tells look-alikes apart and
              // confirms the choice for anyone unsure of a province's name.
              options={provinces.map(p => ({ value: p.name, label: p.name, sub: p.region }))}
              onChange={v => { if (v !== province) { setProvince(v); setMunicipality(""); setBarangay(""); } setError(""); }}
            />
          </div>

          <div className="a-field">
            <label className="a-lbl">{t("farm_municipality_lbl")}</label>
            <PickerField
              title={t("farm_municipality_lbl")}
              placeholder={t("farm_pick_municipality")}
              disabledHint={t("farm_pick_province_first")}
              disabled={!province}
              value={municipality}
              options={places}
              onChange={v => { setMunicipality(v); setBarangay(""); setError(""); }}
            />
            <p className="a-help">{t("buyer_municipality_help")}</p>
          </div>

          <div className="a-field">
            {/* The word "optional" sits on the label, not in the placeholder:
                a field you may skip should say so before it is tapped. */}
            <label className="a-lbl">{t("farm_barangay_lbl")} <small>{t("optional")}</small></label>
            <PickerField
              title={t("farm_barangay_lbl")}
              placeholder={t("farm_pick_barangay")}
              disabledHint={t(!municipality ? "farm_pick_municipality_first" : "list_loading")}
              disabled={!municipality || !phBarangays}
              value={barangay}
              options={barangays}
              onChange={v => { setBarangay(v); setError(""); }}
            />
            <p className="a-help">{t("buyer_barangay_help")}</p>
          </div>

          {alert()}
          <div style={{ height: 24 }} />
        </div>
        {dock(
          () => { setStep("form"); setError(""); },
          // Last step for a buyer, so the button says what it finishes, not
          // "Continue" into a step that does not exist.
          <button type="button" className="a-btn a-btn-green" disabled={loading} onClick={finishBuyerLocation}>
            {loading ? busy(t("please_wait")) : t("auth_create_btn")}
          </button>,
        )}
      </div>
    );
  }

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

          {/* Both were <select>s: 32 municipalities and up to 89 barangays in
              a system dropdown of 36px rows, with no way to search. */}
          <div className="a-field">
            <label className="a-lbl">{t("farm_municipality_lbl")}</label>
            <PickerField
              title={t("farm_municipality_lbl")}
              placeholder={t("farm_pick_municipality")}
              value={municipality}
              options={MUNICIPALITIES}
              onChange={v => { setMunicipality(v); setBarangay(""); setError(""); }}
            />
          </div>

          <div className="a-field">
            <label className="a-lbl">{t("farm_barangay_lbl")}</label>
            <PickerField
              title={t("farm_barangay_lbl")}
              placeholder={t("farm_pick_barangay")}
              disabledHint={t("farm_pick_municipality_first")}
              disabled={!municipality}
              value={barangay}
              options={BARANGAYS_BY_MUNICIPALITY[municipality] ?? []}
              onChange={v => { setBarangay(v); setError(""); }}
            />
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
              onBlur={() => setName(n => formatName(n))}
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
        {/* Errors about one field sit under that field. This is for the rest:
            no signal, too many tries — things no field can fix. */}
        {!errField && alert()}
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
