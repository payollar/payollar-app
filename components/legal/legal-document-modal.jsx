"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  PrivacyPolicyBody,
  PRIVACY_META,
} from "@/components/legal/privacy-policy-body";
import {
  TermsOfServiceBody,
  TERMS_META,
} from "@/components/legal/terms-of-service-body";

/**
 * @param {"terms"|"privacy"|null} document
 * @param {(doc: "terms"|"privacy"|null) => void} onDocumentChange
 */
export function LegalDocumentModal({ document, onDocumentChange }) {
  const open = document === "terms" || document === "privacy";
  const meta = document === "privacy" ? PRIVACY_META : TERMS_META;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onDocumentChange(null);
      }}
    >
      <DialogContent
        className={cn(
          "flex max-h-[min(90dvh,760px)] w-full max-w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl sm:max-w-2xl",
          "[&>button]:right-4 [&>button]:top-4 [&>button]:text-slate-400 [&>button]:hover:text-slate-700"
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-slate-100 px-5 py-4 text-left sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Legal
          </p>
          <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950">
            {meta.title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-slate-500">
            Last updated: {meta.updated}
          </DialogDescription>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => onDocumentChange("terms")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                document === "terms"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              )}
            >
              Terms
            </button>
            <button
              type="button"
              onClick={() => onDocumentChange("privacy")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                document === "privacy"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              )}
            >
              Privacy
            </button>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <article className="space-y-8 text-[14px] leading-relaxed text-slate-600 [&_h2]:text-lg">
            {document === "privacy" ? (
              <PrivacyPolicyBody compact />
            ) : (
              <TermsOfServiceBody
                compact
                onOpenPrivacy={() => onDocumentChange("privacy")}
              />
            )}
          </article>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Inline “Terms” / “Privacy Policy” buttons that open LegalDocumentModal. */
export function AuthLegalAgreementText({ className }) {
  const [legalDoc, setLegalDoc] = useState(null);

  return (
    <>
      <p className={cn("text-center text-[11px] leading-relaxed text-slate-400", className)}>
        By registering, you agree to our{" "}
        <button
          type="button"
          onClick={() => setLegalDoc("terms")}
          className="font-medium text-primary transition-colors hover:text-primary/90 hover:underline underline-offset-4"
        >
          Terms
        </button>{" "}
        and{" "}
        <button
          type="button"
          onClick={() => setLegalDoc("privacy")}
          className="font-medium text-primary transition-colors hover:text-primary/90 hover:underline underline-offset-4"
        >
          Privacy Policy
        </button>
        .
      </p>
      <LegalDocumentModal document={legalDoc} onDocumentChange={setLegalDoc} />
    </>
  );
}
