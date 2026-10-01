import { ShieldCheck } from "lucide-react";
import { useLang } from "../i18n";
import { Hdr } from "../components/layout/Hdr";
import { PrivacyPolicy } from "../components/PrivacyPolicy";
import { PRIVACY } from "../data/privacyPolicy";

// ─── Privacy ──────────────────────────────────────────────────────────────────
// The policy, reachable from Profile at any time. Google Play asks for it
// inside the app as well as on the web, and the Data Privacy Act asks that
// people can always find out what is held about them.
export function PrivacyScreen({ onBack }: { onBack: () => void }) {
  const { t, lang } = useLang();
  return (
    <div className="screen">
      <Hdr icon={<ShieldCheck size={20} color="var(--tanim)" />} title={PRIVACY.title[lang]} sub={t("pp_sub")} onBack={onBack} />
      <div className="scroll screen-enter">
        <PrivacyPolicy />
      </div>
    </div>
  );
}
