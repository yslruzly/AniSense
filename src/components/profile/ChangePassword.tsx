import { useEffect, useRef, useState } from "react";
import { KeyRound, ChevronRight, X, Check, AlertTriangle, Mail, Smartphone, ShieldCheck } from "lucide-react";
import { Sheet } from "../ui/Sheet";
import { useLang } from "../../i18n";
import { haptic } from "../../lib/platform";
import { isSupabaseConfigured } from "../../lib/supabase";
import { passwordRules, passwordProblem } from "../../lib/password";
import { ContactMode, mySignInContact } from "../../services/auth";
import { CodeError, changePassword, sendCode, checkCode, saveNewPassword } from "../../services/verification";

// ─── Change password (Profile) ────────────────────────────────────────────────
// A row in Manage account that opens a sheet. Two ways through it:
//
//   · they know their password: the current one, a new one, the new one
//     again, Save
//   · they don't ("Forgot your current password?"): a 6-digit code to the
//     Gmail or CP number they sign in with, then a new one
//
// Either way a new password may not be one the account has had before - its
// current one or any of its last ten. The server keeps the history and says
// so (supabase/functions/verify-code, schema.sql section 10), and the sheet
// says it in words under the new password: you can't use an old password,
// try a new one. Every other reason is said where it belongs too: a wrong
// current password under that field, a code that's wrong under the code.

type Step = "change" | "send" | "code" | "new" | "done";
type Field = "current" | "next" | "confirm" | "code" | null;

export function ChangePassword({ fallback }: {
  /** Where a code goes in a build without a database (the demo): the
   *  profile's Gmail or number. A real account's comes from its session. */
  fallback?: { mode: ContactMode; contact: string } | null;
}) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("change");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<{ field: Field; msg: string } | null>(null);
  const [via, setVia] = useState<{ mode: ContactMode; contact: string } | null>(null);
  const [code, setCode] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const first = useRef<HTMLInputElement>(null);

  // The countdown before another code can be sent.
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn(s => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  const reset = () => {
    setStep("change"); setCurrent(""); setNext(""); setConfirm(""); setShow(false);
    setErr(null); setCode(""); setDemoCode(""); setBusy(false);
  };
  const close = () => { if (busy) return; setOpen(false); window.setTimeout(reset, 260); };
  const fail = (field: Field, msg: string) => { setErr({ field, msg }); haptic.warn(); };
  const go = (s: Step) => { setErr(null); setStep(s); requestAnimationFrame(() => requestAnimationFrame(() => first.current?.focus())); };

  // The new password and its twin: the rule, a match, and not the current.
  const nextProblem = (): { field: Field; msg: string } | null => {
    const p = passwordProblem(next);
    if (p === "easy") return { field: "next", msg: t("err_password_easy") };
    if (p) return { field: "next", msg: t("err_password_short") };
    if (confirm !== next) return { field: "confirm", msg: t("err_password_mismatch") };
    return null;
  };

  // What the server said, in words, under the field it is about.
  const said = (e: unknown) => {
    const c = e instanceof CodeError ? e.code : "";
    if (c === "WRONG_PASSWORD") fail("current", t("err_pw_wrong"));
    else if (c === "SAME_AS_CURRENT") fail("next", t("err_pw_same"));
    else if (c === "USED_BEFORE") fail("next", t("err_pw_used"));
    else if (c === "WEAK_PASSWORD") fail("next", t("err_password_short"));
    else if (c === "TOO_MANY_TRIES") fail(null, t("err_pw_locked").replace("{m}", String((e as CodeError).wait ?? 15)));
    else if (c === "OFFLINE") fail(null, t("err_auth_offline"));
    else if (c === "NOT_DEPLOYED") fail(null, t("err_pw_not_ready"));
    else fail(null, t("err_auth_generic"));
  };

  // ── They know it ──
  const saveChange = async () => {
    if (busy) return;
    if (!current) { fail("current", t("err_pw_current_needed")); return; }
    const p = nextProblem();
    if (p) { fail(p.field, p.msg); return; }
    if (next === current) { fail("next", t("err_pw_same")); return; }
    setBusy(true); setErr(null);
    try { await changePassword(current, next); haptic.success(); setStep("done"); }
    catch (e) { said(e); }
    finally { setBusy(false); }
  };

  // ── They forgot it: a code to where they sign in ──
  const openForgot = async () => {
    setErr(null); setCurrent("");
    const mine = isSupabaseConfigured ? await mySignInContact() : fallback ?? null;
    setVia(mine);
    setStep("send");
  };
  const send = async () => {
    if (!via || busy) return;
    setBusy(true); setErr(null);
    try {
      const { demoCode: dc } = await sendCode("reset", via.mode, via.contact);
      setDemoCode(dc ?? ""); setCode(""); setResendIn(30);
      haptic.select();
      go("code");
    } catch (e) {
      const c = e instanceof CodeError ? e.code : "";
      if (c === "WAIT") { setResendIn((e as CodeError).wait ?? 30); fail(null, t("err_code_wait").replace("{s}", String((e as CodeError).wait ?? 30))); }
      else if (c === "TOO_MANY_SENDS") fail(null, t("err_code_sends"));
      else if (c === "SMS_NOT_READY") fail(null, t("err_sms_not_ready"));
      else if (c === "RESET_NOT_READY") fail(null, t("err_reset_not_ready"));
      else if (c === "OFFLINE") fail(null, t("err_auth_offline"));
      else fail(null, t("err_code_send_failed"));
    } finally { setBusy(false); }
  };
  // Checked as soon as six digits are in, as on sign-up.
  const typeCode = async (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 6);
    setCode(d); setErr(null);
    if (d.length < 6 || !via) return;
    setBusy(true);
    try {
      const r = await checkCode("reset", via.mode, via.contact, d);
      if (r === "ok") { haptic.success(); go("new"); }
      else { setCode(""); fail("code", t(r === "wrong" ? "err_code_mismatch" : r === "expired" ? "err_code_expired" : "err_code_tries")); }
    } catch (e) {
      setCode(""); fail("code", t(e instanceof CodeError && e.code === "OFFLINE" ? "err_auth_offline" : "err_auth_generic"));
    } finally { setBusy(false); }
  };
  const saveReset = async () => {
    if (!via || busy) return;
    const p = nextProblem();
    if (p) { fail(p.field, p.msg); return; }
    setBusy(true); setErr(null);
    try {
      const r = await saveNewPassword(via.mode, via.contact, next);
      if (r === "expired") { setNext(""); setConfirm(""); setStep("send"); fail(null, t("err_reset_again")); return; }
      haptic.success(); setStep("done");
    } catch (e) { said(e); }
    finally { setBusy(false); }
  };

  const shownContact = via
    ? via.mode === "phone" ? `+${via.contact.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/, "$1 $2 $3 $4")}` : via.contact
    : "";

  // ── Pieces ──
  const errUnder = (field: Field) => err && err.field === field
    ? <p className="pw-err" role="alert" id={`pw-err-${field}`}><AlertTriangle size={16} strokeWidth={2.4} aria-hidden="true" />{err.msg}</p>
    : null;
  const pwInput = (id: string, label: string, value: string, set: (v: string) => void, field: Field, autoComplete: string, focus?: boolean) => (
    <div className="pw-field">
      <label className="pw-lbl" htmlFor={id}>{label}</label>
      <div className={`pw-box${err?.field === field ? " bad" : ""}`}>
        <input id={id} ref={focus ? first : undefined} className="pw-inp" type={show ? "text" : "password"} value={value}
          autoComplete={autoComplete} autoCapitalize="off" spellCheck={false}
          aria-invalid={err?.field === field || undefined} aria-describedby={err?.field === field ? `pw-err-${field}` : undefined}
          onChange={e => { set(e.target.value); if (err?.field === field) setErr(null); }} />
        <button type="button" className="pw-eye" aria-pressed={show} onClick={() => setShow(s => !s)}>{show ? t("auth_hide") : t("auth_show")}</button>
      </div>
      {errUnder(field)}
    </div>
  );
  const rules = passwordRules(next);
  const newFields = (
    <>
      {pwInput("pw-next", t("reset_new_lbl"), next, setNext, "next", "new-password", step === "new")}
      <ul className="pw-rules" aria-label={t("pw_rules")}>
        {([["long", "pw_rule_len"], ["letter", "pw_rule_letter"], ["numOrSymbol", "pw_rule_numsym"]] as const).map(([r, k]) => (
          <li key={r} className={rules[r] ? "ok" : ""}>
            <span className="pw-tick" aria-hidden="true"><Check size={12} strokeWidth={3.4} /></span>{t(k)}
            {rules[r] && <span className="sr-only">, {t("pw_rule_done")}</span>}
          </li>
        ))}
        <li className="pw-rule-old"><span className="pw-tick" aria-hidden="true"><ShieldCheck size={12} strokeWidth={2.8} /></span>{t("pw_rule_old")}</li>
      </ul>
      {pwInput("pw-confirm", t("reset_confirm_lbl"), confirm, setConfirm, "confirm", "new-password")}
    </>
  );

  const head: Record<Step, [string, string]> = {
    change: [t("pw_change"), t("pw_change_sub")],
    send: [t("reset_forgot_title"), t("pw_send_sub")],
    code: [t("pw_code_title"), t("pw_code_sub").replace("{contact}", shownContact)],
    new: [t("reset_new_title"), t("reset_new_sub")],
    done: [t("pw_done_t"), t("pw_done_s")],
  };

  return (
    <>
      {/* Opened with the cursor already in the current password, once the
          sheet has come up, so the keyboard is there for the first thing. */}
      <button type="button" className="setting-row as-btn" onClick={() => { reset(); setOpen(true); window.setTimeout(() => first.current?.focus(), 320); }}>
        <span className="setting-ico" aria-hidden="true"><KeyRound size={22} strokeWidth={1.8} /></span>
        <span className="setting-lbl">{t("pw_change")}</span>
        <ChevronRight className="setting-chev" size={20} strokeWidth={2} aria-hidden="true" />
      </button>

      <Sheet open={open} onClose={close} className="pw-sheet modal-sheet" label={head[step][0]} dismissible={!busy}>
        <div className="pw-head">
          <span className={`pw-ico${step === "done" ? " ok" : ""}`} aria-hidden="true">
            {step === "done" ? <Check size={24} strokeWidth={2.8} /> : <KeyRound size={22} strokeWidth={2.3} />}
          </span>
          <div className="pw-head-txt">
            <h2 className="pw-title">{head[step][0]}</h2>
            <p className="pw-sub">{head[step][1]}</p>
          </div>
          <button type="button" className="pw-x" onClick={close} aria-label={t("close")} disabled={busy}><X size={20} strokeWidth={2.4} /></button>
        </div>

        <div className="pw-body" key={step}>
          {step === "change" && <>
            {pwInput("pw-current", t("pw_current"), current, setCurrent, "current", "current-password", true)}
            <button type="button" className="pw-link" onClick={openForgot}>{t("pw_forgot_link")}</button>
            {newFields}
          </>}

          {step === "send" && (via ? (
            <div className="pw-via">
              <span className="pw-via-ico" aria-hidden="true">{via.mode === "phone" ? <Smartphone size={20} strokeWidth={2.2} /> : <Mail size={20} strokeWidth={2.2} />}</span>
              <span className="pw-via-txt">
                <span className="pw-via-lbl">{t(via.mode === "phone" ? "pw_via_phone" : "pw_via_gmail")}</span>
                <span className="pw-via-val">{shownContact}</span>
              </span>
            </div>
          ) : <p className="pw-err" role="alert"><AlertTriangle size={16} strokeWidth={2.4} aria-hidden="true" />{t("err_auth_generic")}</p>)}

          {step === "code" && <>
            <div className="pw-field">
              <label className="pw-lbl" htmlFor="pw-code">{t("verify_lbl")}</label>
              <div className={`pw-box${err?.field === "code" ? " bad" : ""}`}>
                <input id="pw-code" ref={first} className="pw-inp pw-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                  value={code} onChange={e => typeCode(e.target.value)} disabled={busy}
                  aria-invalid={err?.field === "code" || undefined} aria-describedby={err?.field === "code" ? "pw-err-code" : undefined} />
              </div>
              {errUnder("code")}
            </div>
            {demoCode && <p className="pw-demo" role="note">{t("auth_code_demo").replace("{code}", demoCode)}</p>}
            <button type="button" className="pw-link" onClick={send} disabled={resendIn > 0 || busy}>
              {resendIn > 0 ? t("pw_resend_in").replace("{s}", String(resendIn)) : t("verify_resend")}
            </button>
          </>}

          {step === "new" && newFields}

          {errUnder(null)}
        </div>

        <div className={`pw-foot${step === "done" ? " one" : ""}`}>
          {step === "change" && <>
            <button type="button" className="pw-btn ghost" onClick={close} disabled={busy}>{t("cancel")}</button>
            <button type="button" className="pw-btn" onClick={saveChange} disabled={busy} aria-busy={busy}>{busy ? t("reset_saving") : t("reset_save")}</button>
          </>}
          {step === "send" && <>
            <button type="button" className="pw-btn ghost" onClick={() => go("change")} disabled={busy}>{t("back")}</button>
            <button type="button" className="pw-btn" onClick={send} disabled={busy || !via || resendIn > 0} aria-busy={busy}>
              {busy ? t("please_wait") : resendIn > 0 ? t("pw_resend_in").replace("{s}", String(resendIn)) : t("auth_send_code")}
            </button>
          </>}
          {step === "code" && <>
            <button type="button" className="pw-btn ghost" onClick={() => go("send")} disabled={busy}>{t("back")}</button>
            <button type="button" className="pw-btn" onClick={() => typeCode(code)} disabled={busy || code.length < 6} aria-busy={busy}>{busy ? t("please_wait") : t("continue")}</button>
          </>}
          {step === "new" && (
            <button type="button" className="pw-btn wide" onClick={saveReset} disabled={busy} aria-busy={busy}>{busy ? t("reset_saving") : t("reset_save")}</button>
          )}
          {step === "done" && <button type="button" className="pw-btn" onClick={close}>{t("pp_done")}</button>}
        </div>
      </Sheet>
    </>
  );
}
