import { LegalPageShell } from "@/components/legal/legal-page-shell";
import {
  PrivacyPolicyBody,
  PRIVACY_META,
} from "@/components/legal/privacy-policy-body";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      title={PRIVACY_META.title}
      description={PRIVACY_META.description}
      updated={PRIVACY_META.updated}
      otherHref="/terms"
      otherLabel="Terms of Service"
    >
      <PrivacyPolicyBody />
    </LegalPageShell>
  );
}
