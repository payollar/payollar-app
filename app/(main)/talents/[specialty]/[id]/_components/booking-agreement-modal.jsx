"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FileText, Sparkles } from "lucide-react";

const BOOKING_AGREEMENT_TERMS = [
  "You are booking a paid session with this creator through Payollar. The creator is responsible for delivering the session; Payollar provides the platform and payment flow.",
  "You agree to pay the rate shown for your chosen time slot. Payment is processed securely via Paystack before the booking is confirmed.",
  "You will join the session at the scheduled time. Cancellations or no-shows may follow the creator’s stated policy where applicable.",
  "You agree to our Terms of Service. Payollar connects clients and creators and may help with disputes, but the service agreement is between you and the creator.",
  "After you accept, you’ll choose an available time slot and add optional notes (for example, which service you’re booking).",
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className={cn(
          "max-h-[min(90dvh,720px)] max-w-2xl overflow-y-auto",
          "rounded-2xl border border-border/60 bg-card/95 shadow-2xl shadow-black/20 backdrop-blur-xl"
        )}
      >
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-foreground [font-family:var(--font-heading)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <FileText className="h-5 w-5" aria-hidden />
            </span>
            Before you book
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Review the points below, then continue to pick a time with{" "}
            <span className="font-medium text-foreground">{creatorName || "this creator"}</span>.
          </DialogDescription>
        </DialogHeader>

        {bookingContext ? (
          <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-foreground">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <p>
              <span className="font-medium">Session focus: </span>
              {bookingContext.replace(/^Service:\s*/i, "")}
            </p>
          </div>
        ) : null}

        <div className="space-y-4 py-1">
          <div className="rounded-xl border border-border/50 bg-muted/30 p-4 sm:p-5">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
              Booking terms
            </h4>
            <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              {BOOKING_AGREEMENT_TERMS.map((term, index) => (
                <li key={index} className="flex gap-3">
                  <span className="font-medium tabular-nums text-primary">{index + 1}.</span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-border/50 pt-3 text-xs text-muted-foreground">
              Full legal terms:{" "}
              <Link
                href="/terms"
                className="font-medium text-primary underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </Link>
            </p>
          </div>

          <label
            htmlFor="booking-agree"
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-background/50 p-4 transition-colors hover:border-primary/30 hover:bg-muted/20"
          >
            <input
              type="checkbox"
              id="booking-agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0 rounded border-border bg-background",
                "cursor-pointer accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              )}
            />
            <span className="text-sm leading-snug text-foreground">
              I have read and agree to these booking terms and the platform&apos;s{" "}
              <Link href="/terms" className="text-primary underline-offset-4 hover:underline" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </Link>
              .
            </span>
          </label>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={handleClose} className="rounded-full">
            Cancel
          </Button>
          <Button
            type="button"
            variant="marketing"
            onClick={handleContinue}
            disabled={!agreed}
            className="rounded-full"
          >
            Continue to choose a time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
