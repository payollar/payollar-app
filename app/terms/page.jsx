import { LegalPageShell } from "@/components/legal/legal-page-shell";
import {
  TermsOfServiceBody,
  TERMS_META,
} from "@/components/legal/terms-of-service-body";

export default function TermsOfServicePage() {
  return (
    <LegalPageShell
      title={TERMS_META.title}
      description={TERMS_META.description}
      updated={TERMS_META.updated}
      otherHref="/privacy"
      otherLabel="Privacy Policy"
    >
      <TermsOfServiceBody />
    </LegalPageShell>
  );
}
