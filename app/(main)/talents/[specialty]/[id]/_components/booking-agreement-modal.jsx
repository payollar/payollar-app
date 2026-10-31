"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const BOOKING_AGREEMENT_TERMS = [
  {
    title: "Paid session",
    body: "You are booking a paid session with this creator through Payollar. The creator is responsible for delivering the session; Payollar provides the platform and payment flow.",
  },
  {
    title: "Payment",
    body: "You agree to pay the rate shown for your chosen time slot. Payment is processed securely via Paystack before the booking is confirmed.",
  },
  {
    title: "Show up",
    body: "You will join the session at the scheduled time. Cancellations or no-shows may follow the creator’s stated policy where applicable.",
  },
  {
    title: "Who is responsible",
    body: "You agree to our Terms of Service. Payollar connects clients and creators and may help with disputes, but the service agreement is between you and the creator.",
  },
  {
    title: "What happens next",
    body: "After you accept, you’ll choose a time slot and write a project brief for the talent (what you’re working on, what you need from the session, and any deadlines).",
  },
];

export function BookingAgreementModal({
  isOpen,
  onClose,
  onAccept,
  creatorName,
  /** e.g. "Service: Title" when the visitor started from a service card */
  bookingContext,
}) {
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!isOpen) setAgreed(false);
  }, [isOpen]);

  const handleContinue = () => {
    if (!agreed) return;
    onAccept();
    setAgreed(false);
    onClose();
  };

  const handleClose = () => {
    setAgreed(false);
    onClose();
  };

  const focus = bookingContext?.replace(/^Service:\s*/i, "").trim();
  const name = creatorName || "this creator";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className={cn(
          "flex max-h-[min(88dvh,680px)] flex-col gap-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl",
          "[&>button]:text-slate-400 [&>button]:hover:text-slate-700"
        )}
      >
        <DialogHeader className="space-y-1.5 px-6 pt-6 pb-4 text-left">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#6d28d9]">Step 1 of 2</p>
          <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950">
            Before you book
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-slate-500">
            Read the terms, then pick a time with <span className="font-medium text-slate-800">{name}</span>.
          </DialogDescription>
          {focus ? (
            <p className="pt-1 text-sm text-slate-700">
              Session focus <span className="font-medium text-slate-950">{focus}</span>
            </p>
          ) : null}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto border-t border-slate-100 px-6 py-4">
          <ol className="space-y-4">
            {BOOKING_AGREEMENT_TERMS.map((term, index) => (
              <li key={term.title} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f3e8ff] text-xs font-semibold text-[#6d28d9]">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950">{term.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{term.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-slate-500">
            Full legal terms:{" "}
            <Link
              href="/terms"
              className="font-medium text-[#6d28d9] underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </Link>
          </p>
        </div>

        <div className="space-y-3 border-t border-slate-200 bg-[#f8f7fc] px-6 py-4">
          <label htmlFor="booking-agree" className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              id="booking-agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-[#6d28d9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d28d9]"
            />
            <span className="text-sm leading-snug text-slate-700">
              I agree to these booking terms and the{" "}
              <Link
                href="/terms"
                className="font-medium text-[#6d28d9] underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </Link>
              .
            </span>
          </label>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={!agreed}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#6d28d9] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5b21b6] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
