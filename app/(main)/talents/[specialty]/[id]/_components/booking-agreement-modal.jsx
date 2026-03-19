"use client";

import { useState } from "react";
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
import { FileText, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

const BOOKING_AGREEMENT_TERMS = [
  "I understand that by booking this session, I am entering into an agreement with the creator/talent through the Payollar platform.",
  "I agree to pay the stated rate for the service and understand that payment is processed securely via Paystack.",
  "I will attend the scheduled session at the agreed time. Cancellations or no-shows may be subject to the creator's cancellation policy.",
  "I agree to the Platform's Terms of Service and acknowledge that Payollar acts as an intermediary and is not a party to the booking agreement.",
  "Any disputes regarding the service shall be resolved directly with the creator, with Payollar providing dispute resolution support where applicable.",
];

export function BookingAgreementModal({ isOpen, onClose, onAccept, creatorName, doctorId, availableDays }) {
  const [agreed, setAgreed] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Get first available slot for direct payment (when no slot selection needed)
  const firstSlot = availableDays?.find((day) => day.slots?.length > 0)?.slots?.[0];
  const hasSlots = !!firstSlot;

  const handlePayWithPaystack = async () => {
    if (!agreed || !hasSlots || !doctorId) return;
    setIsPaying(true);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          startTime: firstSlot.startTime,
          endTime: firstSlot.endTime,
          description: undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to start payment");
        setIsPaying(false);
        return;
      }

      if (data.authorizationUrl) {
        toast.success("Redirecting to Paystack to complete payment...");
        window.location.href = data.authorizationUrl;
        return;
      }

      toast.error("Payment link not received");
      setIsPaying(false);
    } catch (err) {
      console.error("Paystack init error:", err);
      toast.error("Something went wrong. Please try again.");
      setIsPaying(false);
    }
  };

  const handleContinueToBooking = () => {
    if (!agreed) return;
    onAccept();
    setAgreed(false);
    onClose();
  };

  const handleClose = () => {
    setAgreed(false);
    setIsPaying(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-emerald-900/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <FileText className="h-5 w-5 text-emerald-400" />
            Booking Agreement
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Please review and accept the agreement before proceeding to book {creatorName || "this creator"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-emerald-900/20 bg-emerald-950/20 p-4 space-y-4">
            <h4 className="font-semibold text-white">Terms of the Booking</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {BOOKING_AGREEMENT_TERMS.map((term, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-emerald-400 shrink-0">{index + 1}.</span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground pt-2">
              For full terms, please see our{" "}
              <Link href="/terms" className="text-emerald-400 hover:underline" target="_blank">
                Terms of Service
              </Link>
              .
            </p>
          </div>

          <div className="flex items-start space-x-3 rounded-lg border border-emerald-900/20 p-4">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className={cn(
                "mt-1 h-4 w-4 shrink-0 rounded border-emerald-700 bg-background",
                "text-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0",
                "cursor-pointer accent-emerald-600"
              )}
            />
            <label
              htmlFor="agree"
              className="text-sm text-muted-foreground cursor-pointer leading-tight"
            >
              I have read and agree to the booking agreement and the Platform&apos;s Terms of Service.
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="border-emerald-900/30"
            disabled={isPaying}
          >
            Cancel
          </Button>
          {hasSlots ? (
            <Button
              type="button"
              onClick={handlePayWithPaystack}
              disabled={!agreed || isPaying}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
            >
              {isPaying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to payment...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay with Paystack
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleContinueToBooking}
              disabled={!agreed}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
            >
              I Accept — Continue to Booking
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
