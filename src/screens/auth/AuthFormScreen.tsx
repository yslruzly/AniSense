import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { haptic } from "../../lib/platform";
import { ChevronLeft, Check, AlertCircle, MapPin, Smartphone, Mail, Send, BadgeCheck } from "lucide-react";
import { useLang } from "../../i18n";
import { UserRole, FarmDetails } from "../../types";
import { CROPS, MAIN_CROPS } from "../../data/crops";
import { hasRecords } from "../../data/priceRecords";
import { FARM_PROVINCE, MUNICIPALITIES, BARANGAYS_BY_MUNICIPALITY, formatFarmLocation } from "../../data/locations";
import { ISLAND_GROUPS, IslandGroup, PH_PROVINCES } from "../../data/generated/phPlaces";
import { CropEmoji } from "../../components/icons/CropEmoji";
import { PickerField } from "../../components/ui/PickerField";
import juanPeekBody from "../../assets/juan-peek-body.webp";
import juanPeekHand from "../../assets/juan-peek-hand.webp";
import juanMouthHalf from "../../assets/juan-peek-mouth-half.webp";
import juanMouthShut from "../../assets/juan-peek-mouth-shut.webp";
import buyerMascot from "../../assets/buyer-mascot.webp";
import buyerEyes from "../../assets/buyer-mascot-eyes.webp";
import buyerMouth from "../../assets/buyer-mascot-mouth.webp";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "../../lib/supabase";
import { formatName } from "../../lib/names";
import { createAccount, signIn, verifyEmailCode, resendEmailCode, authErrorKey } from "../../services/auth";
import { LegalSheet } from "../../components/legal/LegalSheet";
import { codeKey, sendSignupCode, checkSignupCode } from "../../services/verification";
import { PRIVACY, LegalDocData } from "../../data/privacyPolicy";
import { TERMS } from "../../data/termsOfService";

// ─── Sign In / Create Account ─────────────────────────────────────────────────
// Signing in is one short page: two fields, for someone who has done it before.
//
// Creating an account is a conversation instead of a form. Juan asks one
// question per page, in plain words, and the answer goes right under it:
// name, how to reach you, a password, then the farm (or, for a buyer, where
// they are). A long form asks for everything at once and reads like paperwork
// at the municipal hall; one question at a time is easy to answer, easy to
// get right, and the bar at the top shows how little is left.
//
// What stays from the form: labels are never only placeholders, the password
// reveal is a word, errors carry an icon and sit under the field they are
// about, and that field takes focus, so the fix is where the eye already is.

type Field = "first" | "last" | "contact" | "vcode" | "password" | "confirm" | "years" | "phone" | "terms";
/** Years of farming must be under this. The database holds the same limit
 *  (profiles.years_farming in supabase/schema.sql). */
const MAX_YEARS = 80;
type Page = "signin" | "name" | "contact" | "password" | "years" | "farm" | "phone" | "crops" | "where" | "verify";

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
const validPhone = (d: string) => /^0?9\d{9}$/.test(d);

// Enter on a "next" field moves on instead of submitting half a page.
const focusNext = (id: string) => (e: KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") { e.preventDefault(); document.getElementById(id)?.focus(); }
};

// The bottom of the header, laid out like the language and role steps: the
// speech bubble on the left, whoever is asking standing on the header's edge
// on the right (Juan for a farmer, the buyer mascot for a buyer, drawn with
// the same layers and moved by the same rules). With each new question they
// say it (the mouth moves for about a second); Juan waves once, when he
// first appears. The figure is decorative: the question is the heading.
function Scene({ role, cue, children }: { role: UserRole; cue: string; children?: ReactNode }) {
  // Counted once per new cue, so typing (which re-renders) changes nothing.
  const said = useRef({ cue, n: 0 });
  if (said.current.cue !== cue) said.current = { cue, n: said.current.n + 1 };
  // The first line waits for the figure to rise into place.
  const first = said.current.n === 0 ? "is-first" : "";
  const fig = role === "buyer" ? "buyer" : "farmer";
  return (
    <div className="a-askscene" data-fig={fig}>
      {children}
      <div className="a-askfig" data-fig={fig} aria-hidden="true">
        <div className="a-cast" data-fig={fig}>
          {fig === "buyer" ? (
            <span className="a-fig a-fig-layers fig-buyer on">
              <img src={buyerMascot} alt="" />
              <img className="a-fig-eyes" src={buyerEyes} alt="" />
              <img key={`m${cue}`} className={`a-fig-mouth ${first}`} src={buyerMouth} alt="" />
            </span>
          ) : (
            <span className="a-fig a-fig-layers fig-farmer on">
              <img src={juanPeekBody} alt="" />
              <img key={`h${cue}`} className={`a-fig-talk half ${first}`} src={juanMouthHalf} alt="" />
              <img key={`s${cue}`} className={`a-fig-talk shut ${first}`} src={juanMouthShut} alt="" />
              <img className="a-fig-hand is-first" src={juanPeekHand} alt="" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const [page, setPage] = useState<Page>(flow === "signin" ? "signin" : "name");
  const [mode, setMode] = useState<"gmail" | "phone">("phone");
  // The first page's agreement to the Terms of Service and Privacy Policy,
  // and which of the two is open in a sheet over the form.
  const [agreed, setAgreed] = useState(false);
  // Checking the CP number or Gmail is theirs: where the last code went, the
  // code being typed, which number or address has passed, the wait before
  // another code can be sent, and the demo code shown while nothing is
  // really sent (services/verification.ts). Each is tied to the number or
  // address, so changing it, or switching between CP number and Gmail,
  // starts the check again.
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [vcode, setVcode] = useState("");
  const [verifiedFor, setVerifiedFor] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [sending, setSending] = useState(false);
  const [demoCode, setDemoCode] = useState("");
  const [legal, setLegal] = useState<LegalDocData | null>(null);
  // First and last name, asked separately; the account keeps them as one
  // full name ("Juan Dela Cruz").
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const name = [givenName.trim(), familyName.trim()].filter(Boolean).join(" ");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [errField, setErrField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(false);
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
  // for a buyer, once they reach the page that asks, and only once.
  const [phBarangays, setPhBarangays] = useState<Record<string, Record<string, string[]>> | null>(null);
  useEffect(() => {
    if (role !== "buyer" || page !== "where" || phBarangays) return;
    let alive = true;
    import("../../data/generated/phBarangays.json")
      .then(m => { if (alive) setPhBarangays(m.default as Record<string, Record<string, string[]>>); })
      .catch(() => { /* barangay is optional; the field simply stays closed */ });
    return () => { alive = false; };
  }, [role, page, phBarangays]);
  const [farmPhone, setFarmPhone] = useState("");
  const { t, tn } = useLang();

  // The questions, in order. A farmer who signs up with a CP number has
  // already given the number buyers should call, so they aren't asked twice;
  // only a Gmail sign-up gets that page.
  const pages: Page[] = role === "farmer"
    ? ["name", "contact", "password", "years", "farm", ...(mode === "gmail" ? ["phone" as const] : []), "crops"]
    : ["name", "contact", "password", "where"];
  const at = pages.indexOf(page);

  // How the page arrives. A question further on comes in from the right and
  // one back from the left, like iOS navigation; switching between Sign in
  // and Create account settles in place. Worked out once per change of page
  // and remembered, so typing (which re-renders) never replays it. The first
  // page comes in from the right: it follows the role step.
  const order = (p: Page) => p === "verify" ? pages.length : pages.indexOf(p);
  const nav = useRef<{ page: Page; anim: "fwd" | "back" | "swap" }>({ page, anim: "fwd" });
  if (nav.current.page !== page) {
    const from = nav.current.page;
    nav.current.anim = from === "signin" || page === "signin" ? "swap" : order(page) > order(from) ? "fwd" : "back";
    nav.current.page = page;
  }
  const anim = nav.current.anim;

  // A real account when the app has a database to put it in; the demo
  // sign-in otherwise, so a build without .env still opens for respondents.
  const live = isSupabaseConfigured && !!onSession;

  const labelContact = mode === "gmail" ? t("auth_gmail_address") : t("auth_cp_number");
  // The number buyers call: the sign-in number when there is one.
  const buyersCall = mode === "phone" ? contact : farmPhone;
  const firstName = formatName(givenName);

  const clear = () => { setError(""); setErrField(null); };

  const contactKey = codeKey(mode, contact);
  const codeSent = sentTo === contactKey;
  const verified = verifiedFor === contactKey;
  // The countdown before "Send the code again" can be tapped.
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn(s => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);
  const go = (p: Page) => { clear(); setPage(p); };

  const fail = (field: Field, msg: string) => {
    setError(msg);
    setErrField(field);
    haptic.select();
    // After paint, so the field is focusable if it only just gained its error
    // or its page only just arrived.
    requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(`f-${field}`)?.focus()));
    return false;
  };

  const contactError = () => {
    if (!contact.trim()) return mode === "gmail" ? t("err_gmail_required") : t("err_cp_required");
    if (mode === "gmail" && !contact.includes("@")) return t("err_valid_gmail");
    if (mode === "phone" && !validPhone(contact)) return t("err_valid_phone");
    return "";
  };

  // ── Sign in ──
  const signInNow = () => {
    const bad = contactError();
    if (bad) return fail("contact", bad);
    if (!password) return fail("password", t("err_password_required"));
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
      onSuccess(role === "farmer" ? "Juan Dela Cruz" : "Maria Santos", role, ["Rice", "Corn"], undefined, false);
    }, 1200);
  };

  // ── Create the account, after the last question ──
  // The account is made once, at the end, with every answer. Made at the
  // first question, a farmer who stopped halfway would own an account with no
  // town and no crops, and would never be asked for them again.
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
        go("verify");
      })
      .catch(err => {
        setLoading(false);
        const key = authErrorKey(err);
        // Both of these were answered earlier, so go back to that question
        // and put the message under the field that needs changing.
        if (key === "err_account_exists") { go("contact"); fail("contact", t(key)); return; }
        if (key === "err_password_short") { go("password"); fail("password", t(key)); return; }
        setError(t(key));
      });
  };

  // "Bagong Sikat, Cabanatuan City, Nueva Ecija" / "Quezon City, Metro Manila".
  const buyerLocation = () => [barangay, municipality, province].filter(Boolean).join(", ");

  const finish = () => {
    const farmer = role === "farmer";
    const location = farmer ? formatFarmLocation(barangay, municipality) : buyerLocation();
    if (live) {
      createLive(farmer
        ? { location, phone: buyersCall.trim(), years: Number(farmYears), crops: selectedCrops }
        : { location, crops: [] });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(formatName(name), role, farmer ? selectedCrops : [], farmer
        ? { years: farmYears.trim(), location, phone: buyersCall.trim() }
        : { location, phone: contact.trim() }, true);
    }, 1200);
  };

  // ── Continue: check this page's answer, then the next question ──
  const next = () => {
    clear();
    if (page === "signin") { signInNow(); return; }
    if (page === "name" && !givenName.trim()) { fail("first", t("err_first_name")); return; }
    if (page === "name" && !familyName.trim()) { fail("last", t("err_last_name")); return; }
    if (page === "name" && !agreed) { fail("terms", t("err_agree_required")); return; }
    if (page === "name") { setGivenName(formatName(givenName)); setFamilyName(formatName(familyName)); }
    if (page === "contact") {
      const bad = contactError();
      if (bad) { fail("contact", bad); return; }
      // Only a number or address that has been checked goes on.
      if (!verified) {
        if (!codeSent) { fail("contact", t(mode === "gmail" ? "err_verify_gmail_first" : "err_verify_cp_first")); return; }
        fail("vcode", t("err_code_required")); return;
      }
    }
    if (page === "password") {
      if (!password) { fail("password", t("err_password_required")); return; }
      if (password.length < 6) { fail("password", t("err_password_short")); return; }
      if (password !== confirm) { fail("confirm", t("err_password_mismatch")); return; }
    }
    if (page === "years") {
      const yrs = Number(farmYears);
      // Under 80: a farmer of 80 years would be well past 90. An empty box
      // and a number that is too big get different messages, so the fix is
      // plain either way.
      if (!farmYears.trim() || isNaN(yrs) || yrs < 0) { fail("years", t("err_years_required")); return; }
      if (yrs >= MAX_YEARS) { fail("years", t("err_years_max").replace("{max}", String(MAX_YEARS))); return; }
    }
    if (page === "farm") {
      if (!municipality) { setError(t("err_municipality_required")); return; }
      if (!barangay) { setError(t("err_barangay_required")); return; }
    }
    if (page === "phone") {
      if (!farmPhone.trim()) { fail("phone", t("err_phone_required")); return; }
      if (!validPhone(farmPhone)) { fail("phone", t("err_valid_phone")); return; }
    }
    if (page === "crops" && selectedCrops.length === 0) { setError(t("err_select_crop")); return; }
    if (page === "where") {
      // Province and city are what a farmer needs to plan a delivery, so
      // those are required; barangay only sharpens it, so it is not.
      if (!province) { setError(t("err_province_required")); return; }
      if (!municipality) { setError(t("err_municipality_required")); return; }
    }
    if (at === pages.length - 1) { finish(); return; }
    go(pages[at + 1]);
  };

  const back = () => {
    if (page === "verify") { go(pages[pages.length - 1]); return; }
    if (at > 0) { go(pages[at - 1]); return; }
    onBack();
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
  const bad = (f: Field) => errField === f ? "bad" : "";

  const busy = (label: string) => (
    <><span className="a-spin" aria-hidden="true" />{label}</>
  );

  // The main button. Its words swap with a short blur when they change, so
  // "Continue" turning into "Create Account" on the last question is seen.
  const primary = (label: string, busyLabel = t("please_wait")) => (
    <button type="submit" className="a-btn a-btn-green" disabled={loading} aria-busy={loading}>
      {loading ? busy(busyLabel) : <span className="a-swap" key={label}>{label}</span>}
    </button>
  );

  // Back beside the primary action, as on the earlier steps, so the whole
  // setup is driven from one place under the thumb.
  const dock = (main: ReactNode, before?: ReactNode) => (
    <div className="a-dock">
      {before}
      <div className="a-dockpair">
        <button type="button" className="a-iconbtn on-paper" onClick={back} aria-label={t("back")}>
          <ChevronLeft size={28} color="var(--ink)" strokeWidth={2.4} />
        </button>
        {main}
      </div>
    </div>
  );

  // CP number or Gmail, both visible at once, then the field for the one
  // picked. Shared by Sign in and the "how can we reach you" question.
  // The switch says which one the field is for, so the field has no label
  // of its own on screen; it is read out with it.
  const switchMode = (id: "phone" | "gmail") => {
    if (mode === id) return;
    haptic.select(); setMode(id); setContact(""); clear();
  };
  const contactInput = (autoFocus: boolean) => (
    <>
      <div className="a-seg" role="radiogroup" aria-label={t("auth_contact_method")} data-mode={mode}>
        <span className="a-seg-thumb" aria-hidden="true" />
        {([["phone", <Smartphone key="i" size={18} strokeWidth={2.2} />, t("auth_cp_number")],
           ["gmail", <Mail key="i" size={18} strokeWidth={2.2} />, "Gmail"]] as const).map(([id, ico, lbl]) => (
          <button key={id} type="button" role="radio" aria-checked={mode === id}
            className={mode === id ? "on" : ""}
            onClick={() => {
              if (mode === id) return;
              switchMode(id);
              requestAnimationFrame(() => document.getElementById("f-contact")?.focus());
            }}>
            {ico}{lbl}
          </button>
        ))}
      </div>
      {mode === "gmail" ? (
        <input id="f-contact" className={`a-inp ${bad("contact")}`} type="email"
          placeholder="juan@gmail.com" autoComplete={page === "signin" ? "username" : "email"} autoCapitalize="none" spellCheck={false}
          enterKeyHint="next" onKeyDown={page === "signin" ? focusNext("f-password") : undefined} autoFocus={autoFocus}
          aria-label={labelContact}
          {...errProps("contact", page === "signin" ? undefined : "f-contact-help")}
          value={contact} onChange={e => { setContact(e.target.value.trim()); clear(); }} />
      ) : (
        <div className="a-prefix-row">
          <span className="a-prefix">+63</span>
          <input id="f-contact" className={`a-inp num ${bad("contact")}`} type="tel"
            inputMode="numeric" autoComplete={page === "signin" ? "username" : "tel-national"} placeholder="9XX XXX XXXX" maxLength={13}
            enterKeyHint="next" onKeyDown={page === "signin" ? focusNext("f-password") : undefined} autoFocus={autoFocus}
            aria-label={labelContact}
            {...errProps("contact", page === "signin" ? undefined : "f-contact-help")}
            value={fmtPhone(contact)}
            onChange={e => { setContact(digits(e.target.value)); clear(); }} />
        </div>
      )}
      {/* The "we'll send your confirmation here" line is about a new
          account, so Sign in doesn't show it. */}
      {errField === "contact" ? fieldErr("contact") : page !== "signin" && <p className="a-help" id="f-contact-help">{t("auth_help_cp")}</p>}
    </>
  );

  // ── Checking the number or address ──
  const sendCode = async () => {
    clear();
    const bad = contactError();
    if (bad) { fail("contact", bad); return; }
    setSending(true);
    try {
      const { demoCode: dc } = await sendSignupCode(mode, contact);
      setSentTo(contactKey); setVcode(""); setDemoCode(dc ?? ""); setResendIn(30);
      haptic.select();
      requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById("f-vcode")?.focus()));
    } catch {
      setError(t("err_auth_generic")); setErrField(null);
    } finally {
      setSending(false);
    }
  };
  // The code is checked as soon as six digits are in: no extra button.
  const typeCode = async (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 6);
    setVcode(d); clear();
    if (d.length < 6) return;
    const r = await checkSignupCode(mode, contact, d);
    if (r === "ok") { setVerifiedFor(contactKey); haptic.success(); return; }
    setVcode("");
    fail("vcode", t(r === "wrong" ? "err_code_mismatch" : r === "expired" ? "err_code_expired" : "err_code_tries"));
  };
  const who = mode === "gmail" ? contact.trim() : `+63 ${fmtPhone(contact).replace(/^0/, "")}`;

  // Under the field: "Send code" until a code is out; then where it went,
  // the box for it and the way to send another; then, once it matches, a
  // green line saying so.
  const verifyBlock = () => verified ? (
    <p className="a-verified" role="status">
      <BadgeCheck size={22} strokeWidth={2.4} aria-hidden="true" />
      {t(mode === "gmail" ? "auth_verified_gmail" : "auth_verified_cp")}
    </p>
  ) : !codeSent ? (
    <button type="button" className="a-sendcode" onClick={sendCode} disabled={sending} aria-busy={sending}>
      {sending ? <><span className="a-spin green" aria-hidden="true" />{t("auth_sending_code")}</>
        : <><Send size={19} strokeWidth={2.4} aria-hidden="true" />{t("auth_send_code")}</>}
    </button>
  ) : (
    <div className="a-codebox">
      <p className="a-codebox-t" role="status">{t("auth_code_sent").replace("{to}", who)}</p>
      {demoCode && <p className="a-demo-code">{t("auth_code_demo").replace("{code}", demoCode)}</p>}
      <label className="a-lbl" htmlFor="f-vcode">{t("verify_lbl")}</label>
      <input id="f-vcode" className={`a-inp num a-code ${bad("vcode")}`} type="text" inputMode="numeric"
        autoComplete="one-time-code" maxLength={6} placeholder="000000"
        {...errProps("vcode")}
        value={vcode} onChange={e => { void typeCode(e.target.value); }} />
      {fieldErr("vcode")}
      <p className="a-resend">
        {resendIn > 0
          ? <span className="a-resend-wait">{t("auth_resend_in").replace("{s}", String(resendIn))}</span>
          : <button type="button" className="a-link" onClick={sendCode} disabled={sending}>{t("verify_resend")}</button>}
      </p>
    </div>
  );

  const reveal = (
    <button type="button" className="a-reveal" aria-pressed={showPw} onClick={() => setShowPw(s => !s)}>
      <span className="a-swap" key={String(showPw)}>{showPw ? t("auth_hide") : t("auth_show")}</span>
    </button>
  );

  // ── Sign in: one short page ──
  if (page === "signin") {
    // A greeting for the time of day, the way people here greet each other,
    // rather than a stock "welcome back".
    const hour = new Date().getHours();
    const greeting = t(hour >= 5 && hour < 12 ? "signin_morning" : hour >= 12 && hour < 18 ? "signin_afternoon" : "signin_evening");
    // And a reason to sign in, from the price records: for a farmer the crop
    // that rose the most from the month before (good news for a seller), for
    // a buyer the one that fell the most (a deal). Only crops with real
    // records make the news; a sample price is never announced. If nothing
    // moved that way, Juan just says hi.
    const byChange = CROPS.filter(c => hasRecords(c.id)).sort((a, b) => b.change - a.change);
    const pick = role === "buyer" ? byChange[byChange.length - 1] : byChange[0];
    const news = pick && (role === "buyer" ? pick.change < 0 : pick.change > 0) ? pick : null;
    const fill = (key: string) => t(key)
      .replace("{crop}", tn(news!.name))
      .replace("{pct}", Math.abs(news!.change).toFixed(1))
      .replace("{price}", String(Math.round(news!.pricePerKg * 100) / 100));
    const up = role !== "buyer";
    return (
      // A real form, so the keyboard's Go key submits and password managers
      // recognise the sign-in.
      <form className="a-screen a-setup a-askscreen" noValidate onSubmit={e => { e.preventDefault(); next(); }}>
        <div className="a-inkhead a-formhead a-askhead">
          <div className="a-swap" key="signin">
            <h1 className="a-title on-ink">{greeting}</h1>
            <p className="a-sub on-ink">{t("auth_signin_title")}</p>
          </div>
          <Scene role={role} cue="signin">
            <div className="a-ask a-ask-hi">
              {news ? (
                <>
                  <p className="a-ask-q">{fill(up ? "signin_up_q" : "signin_down_q")}</p>
                  <p className="a-ask-why">{fill(up ? "signin_up_why" : "signin_down_why")}</p>
                </>
              ) : <p className="a-ask-q">{t("ask_signin_say")}</p>}
            </div>
          </Scene>
        </div>

        <div className="a-scroll a-step" data-anim={anim} key="signin">
          {/* No label over the field: the switch right above it already says
              "CP Number" or "Gmail". It is still read out with the field. */}
          <div className="a-field">{contactInput(false)}</div>
          <div className="a-field">
            {/* "Forgot?" sits on the password's own label row, where the need
                arises, instead of on a line of its own below. */}
            <div className="a-lbl-row">
              <label className="a-lbl" htmlFor="f-password">{t("auth_password")}</label>
              <button type="button" className="a-link">{t("auth_forgot")}</button>
            </div>
            <div className="a-pwrow">
              <input id="f-password" className={`a-inp ${bad("password")}`}
                type={showPw ? "text" : "password"} placeholder={t("auth_password_ph")}
                autoComplete="current-password" enterKeyHint="go"
                {...errProps("password")}
                value={password} onChange={e => { setPassword(e.target.value); clear(); }} />
              {reveal}
            </div>
            {fieldErr("password")}
          </div>
          {/* For someone who lands here without an account: under the last
              field, the mirror of "Already have an account? Sign In" on the
              first sign-up question, and away from the Sign In button. */}
          <p className="a-switch">
            {t("signin_new_q")} <button type="button" className="a-link" onClick={() => go("name")}>{t("signin_new_btn")}</button>
          </p>
          {/* Errors about one field sit under that field. This is for the
              rest: no signal, too many tries, things no field can fix. */}
          {!errField && alert()}
        </div>

        {dock(primary(t("auth_signin_btn")))}
      </form>
    );
  }

  // ── Create account: Juan asks, one question per page ──
  // The header carries a progress bar: "Step 2 of 6"
  // in words for anyone who reads, and a row of segments that fill as each
  // question is answered. The header stays mounted from page to page, so the
  // next segment visibly fills rather than the whole bar being redrawn.
  const step = page === "verify" ? pages.length : at + 1;
  const stepLabel = t("ask_step").replace("{n}", String(step)).replace("{total}", String(pages.length));

  // The layout, top to bottom: the header, ending in the question (in a
  // bubble on the left) and whoever is asking it (standing on the right);
  // then the answer, right under the header; then Continue, at the bottom.
  //
  // plain: the question as the header's own title, with no one asking it,
  // for an answer that needs the room (the crop grid is ten tiles long).
  const ask = (q: string, why: string | undefined, body: ReactNode, main: ReactNode, onSubmit = next, beforeDock?: ReactNode, plain = false) => (
    <form className="a-screen a-setup a-askscreen" noValidate onSubmit={e => { e.preventDefault(); onSubmit(); }}>
      <div className={`a-inkhead a-formhead a-askhead${plain ? " plain" : ""}`}>
        {plain ? (
          <div className="a-swap" key={`q-${page}`}>
            <h1 className="a-title on-ink" id="ask-q">{q}</h1>
            {why && <p className="a-sub on-ink">{why}</p>}
          </div>
        ) : (
          // What all these questions add up to. Not a heading: the question
          // in the bubble is this page's heading.
          <p className="a-title on-ink a-asktitle">{t("ask_title")}</p>
        )}
        <div className="a-progress" role="progressbar" aria-label={stepLabel}
          aria-valuemin={1} aria-valuemax={pages.length} aria-valuenow={step}>
          <span className="a-progress-t" aria-hidden="true"><span className="a-swap" key={stepLabel}>{stepLabel}</span></span>
          <span className="a-progress-bar" aria-hidden="true">
            {pages.map((p, i) => <span key={p} className="a-progress-seg"><span className={i < step ? "on" : ""} /></span>)}
          </span>
        </div>
        {/* Keyed by page, so each question pops out of the bubble's point
            afresh as the asker says it. In the header, not the scrolling
            part, so it stays in view while the answer is typed. */}
        {!plain && (
          <Scene role={role} cue={page}>
            <div className="a-ask" key={`q-${page}`}>
              <h1 className="a-ask-q" id="ask-q">{q}</h1>
              {why && <p className="a-ask-why">{why}</p>}
            </div>
          </Scene>
        )}
      </div>

      {/* Keyed by page: each answer arrives in the direction of travel. */}
      <div className="a-scroll a-step" data-anim={anim} key={`a-${page}`}>
        <div className="a-ask-body">{body}</div>
        {!errField && alert()}
      </div>

      {dock(main, beforeDock)}
    </form>
  );

  const last = at === pages.length - 1;
  const onward = primary(last ? t("auth_create_btn") : t("continue"));

  // ── Only while email confirmation is on: the 6-digit code ──
  if (page === "verify") {
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
    return ask(
      t("verify_title"),
      t("verify_sub").replace("{email}", pendingEmail),
      <>
        {/* one-time-code lets Android offer the code from the email or SMS
            notification without the app reading anyone's messages. */}
        <input id="f-code" className="a-inp num a-code" type="text" inputMode="numeric"
          autoComplete="one-time-code" enterKeyHint="go" maxLength={6} placeholder="000000" autoFocus
          aria-label={t("verify_lbl")}
          value={code}
          onChange={e => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); setNotice(""); }} />
        <p className="a-help" role="status">{notice || t("verify_help")}</p>
        <button type="button" className="a-link" onClick={resend}>{t("verify_resend")}</button>
      </>,
      primary(t("verify_btn")),
      verify,
    );
  }

  // ── 1. Name ──
  // First name and last name, each with its own small label, so there is no
  // guessing which goes where; then the agreement to the Terms of Service
  // and Privacy Policy. The way back to Sign in stays on this first question
  // only.
  if (page === "name") {
    const [agreeA, rest = ""] = t("auth_agree").split("{terms}");
    const [agreeB, agreeC = ""] = rest.split("{privacy}");
    return ask(
      t("ask_name"),
      t("ask_name_why"),
      <>
        <div className="a-namefield">
          <label className="a-lbl" htmlFor="f-first">{t("auth_first_name")}</label>
          <input id="f-first" className={`a-inp ${bad("first")}`}
            placeholder={t("auth_first_name_ph")}
            autoComplete="given-name" autoCapitalize="words" enterKeyHint="next" autoFocus
            onKeyDown={focusNext("f-last")} {...errProps("first")}
            onBlur={() => setGivenName(n => formatName(n))}
            value={givenName} onChange={e => { setGivenName(e.target.value); clear(); }} />
          {fieldErr("first")}
        </div>
        <div className="a-namefield">
          <label className="a-lbl" htmlFor="f-last">{t("auth_last_name")}</label>
          <input id="f-last" className={`a-inp ${bad("last")}`}
            placeholder={t("auth_last_name_ph")}
            autoComplete="family-name" autoCapitalize="words" enterKeyHint="next"
            {...errProps("last")}
            onBlur={() => setFamilyName(n => formatName(n))}
            value={familyName} onChange={e => { setFamilyName(e.target.value); clear(); }} />
          {fieldErr("last")}
        </div>

        {/* The agreement, a real checkbox: the box and its sentence are one
            52px target, and each document's name opens it in a sheet
            without ticking the box. Asked here, before anything else is
            typed in. */}
        <div className={`a-agree ${agreed ? "on" : ""} ${bad("terms")}`}>
          <input id="f-terms" type="checkbox" className="a-agree-box" checked={agreed}
            onChange={e => { setAgreed(e.target.checked); if (e.target.checked) haptic.select(); clear(); }}
            {...errProps("terms")} />
          <label htmlFor="f-terms" className="a-agree-t">
            <span className="a-agree-tick" aria-hidden="true"><Check size={16} strokeWidth={3.2} /></span>
            <span className="a-agree-words">
            {agreeA}
            <button type="button" className="a-agree-link" lang="en" onClick={e => { e.preventDefault(); setLegal(TERMS); }}>{TERMS.title}</button>
            {agreeB}
            <button type="button" className="a-agree-link" lang="en" onClick={e => { e.preventDefault(); setLegal(PRIVACY); }}>{PRIVACY.title}</button>
            {agreeC}
            </span>
          </label>
        </div>
        {fieldErr("terms")}

        <p className="a-switch">
          {t("auth_have_account")} <button type="button" className="a-link" onClick={() => go("signin")}>{t("auth_signin_btn")}</button>
        </p>
        <LegalSheet doc={legal} onClose={() => setLegal(null)} />
      </>,
      onward,
    );
  }

  // ── 2. How to reach you ── (by name, now that Juan knows it)
  if (page === "contact") {
    return ask(
      t("ask_contact").replace("{name}", firstName),
      t("ask_contact_why"),
      <>
        {contactInput(true)}
        {verifyBlock()}
      </>,
      onward,
    );
  }

  // ── 3. Password ── (and once more, to be sure it was typed as meant)
  if (page === "password") {
    const pwOk = password.length >= 6;
    const confirmOk = confirm.length > 0 && confirm === password;
    return ask(
      t("ask_password"),
      t("ask_password_why"),
      <>
        <div className="a-pwrow">
          <input id="f-password" className={`a-inp ${bad("password")}`}
            type={showPw ? "text" : "password"} placeholder={t("auth_password_ph")}
            autoComplete="new-password" enterKeyHint="next" onKeyDown={focusNext("f-confirm")} autoFocus
            aria-labelledby="ask-q" {...errProps("password", "f-password-help")}
            value={password} onChange={e => { setPassword(e.target.value); clear(); }} />
          {reveal}
        </div>
        {errField === "password"
          ? fieldErr("password")
          : (
            // The rule turns into a tick the moment it's met: the page
            // confirms progress as it happens, not only on Continue.
            <p className={`a-help a-hint ${pwOk ? "ok" : ""}`} id="f-password-help">
              <span className="a-hint-ico"><Check size={12} strokeWidth={3.4} /></span>
              {t("auth_help_pw")}
            </p>
          )}
        <div className="a-field">
          <label className="a-lbl" htmlFor="f-confirm">{t("auth_confirm_password")}</label>
          <input id="f-confirm" className={`a-inp ${bad("confirm")}`}
            type={showPw ? "text" : "password"} placeholder={t("auth_confirm_password_ph")}
            autoComplete="new-password" enterKeyHint="next"
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
      </>,
      onward,
    );
  }

  // ── 4 (farmer). Years farming ── A number with its unit beside it.
  if (page === "years") {
    return ask(
      t("ask_years"),
      t("ask_years_why"),
      <>
        <div className="a-prefix-row a-unit-row">
          <input id="f-years" className={`a-inp num a-inp-lg ${bad("years")}`} type="text"
            inputMode="numeric" pattern="[0-9]*" maxLength={2} placeholder={t("farm_years_ph")}
            enterKeyHint="next" autoFocus aria-labelledby="ask-q" {...errProps("years")}
            value={farmYears} onChange={e => { setFarmYears(e.target.value.replace(/\D/g, "").slice(0, 2)); clear(); }} />
          <span className="a-prefix a-suffix">{t("ask_years_unit")}</span>
        </div>
        {fieldErr("years")}
      </>,
      onward,
    );
  }

  // ── 5 (farmer). Where the farm is ──
  // Picked, not typed. Free text produced "Talavera", "talavera n.e.", and
  // "Brgy. San Ricardo Talavera" for the same place, none of which a buyer
  // can filter on. The province is fixed, so it is shown rather than asked.
  if (page === "farm") {
    return ask(
      t("ask_farm"),
      t("ask_farm_why"),
      <>
        <div className="a-locked">
          <MapPin size={20} color="var(--tanim)" />
          <span>{FARM_PROVINCE}</span>
          <span className="a-locked-note">{t("farm_province_lbl")}</span>
        </div>
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
      </>,
      onward,
    );
  }

  // ── 6 (farmer, Gmail sign-up only). The number buyers call ──
  if (page === "phone") {
    return ask(
      t("ask_phone"),
      t("ask_phone_why"),
      <>
        <div className="a-prefix-row">
          <span className="a-prefix">+63</span>
          <input id="f-phone" className={`a-inp num ${bad("phone")}`} type="tel" inputMode="numeric" autoComplete="tel-national"
            placeholder="9XX XXX XXXX" maxLength={13} enterKeyHint="next" autoFocus
            aria-labelledby="ask-q" {...errProps("phone")}
            value={fmtPhone(farmPhone)}
            onChange={e => { setFarmPhone(digits(e.target.value)); clear(); }} />
        </div>
        {fieldErr("phone")}
      </>,
      onward,
    );
  }

  // ── Last (farmer). What they grow ── Ten tiles, so the page keeps its
  // plain header, the question as its title, and gives the grid the room.
  if (page === "crops") {
    return ask(
      t("crops_title"),
      t("crops_sub"),
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
      </div>,
      primary(t("auth_create_btn"), t("crops_setting_up")),
      next,
      <p className="a-count">
        {selectedCrops.length === 0
          ? t("crops_none_yet")
          : `${selectedCrops.length} ${t("crops_selected")}`}
      </p>,
      true,
    );
  }

  // ── Last (buyer). Where they are ──
  // Anywhere in the Philippines, narrowed the way people say it: Luzon,
  // Visayas or Mindanao, then the province, then the city or town.
  const provinces = PH_PROVINCES.filter(p => p.island === island);
  const places = PH_PROVINCES.find(p => p.name === province)?.places ?? [];
  const barangays = phBarangays?.[province]?.[municipality] ?? [];
  const pickIsland = (g: IslandGroup) => {
    if (g === island) return;
    haptic.select();
    setIsland(g); setProvince(""); setMunicipality(""); setBarangay(""); setError("");
  };
  return ask(
    t("buyer_loc_title"),
    t("buyer_loc_sub"),
    <>
      <div className="a-field">
        <label className="a-lbl" id="f-island">{t("buyer_island_lbl")}</label>
        {/* Three, all visible: it is the one question everyone in the
            country answers without thinking, and it cuts 82 provinces to a
            list short enough to scan. */}
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
          // The region under each name tells look-alikes apart and confirms
          // the choice for anyone unsure of a province's name.
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
        {/* The word "optional" sits on the label, not in the placeholder: a
            field you may skip should say so before it is tapped. */}
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
    </>,
    onward,
  );
}
