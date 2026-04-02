"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Loader2, Clock, ArrowLeft, Calendar, CreditCard } from "lucide-react";
import { toast } from "sonner";

export function AppointmentForm({
  doctorId,
  slot,
  onBack,
  onComplete,
  /** Prefill when visitor started booking from a specific service card */
  initialSessionNote,
}) {
  const [description, setDescription] = useState(initialSessionNote ?? "");

  useEffect(() => {
    setDescription(initialSessionNote ?? "");
  }, [slot?.startTime, initialSessionNote]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          startTime: slot.startTime,
          endTime: slot.endTime,
          description: description.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to start payment");
        setLoading(false);
        return;
      }

      if (data.authorizationUrl) {
        toast.success("Redirecting to Paystack to complete payment...");
        window.location.href = data.authorizationUrl;
        return;
      }

      toast.error("Payment link not received");
      setLoading(false);
    } catch (err) {
      console.error("Paystack init error:", err);
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
        <div className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">
            {format(new Date(slot.startTime), "EEEE, MMMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center">
          <Clock className="mr-2 h-5 w-5 text-primary" />
          <span className="text-foreground">{slot.formatted}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Session notes (optional)</Label>
        <Textarea
          id="description"
          placeholder="Share goals, context, or questions for this session..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-32 border-border/60 bg-background"
        />
        <p className="text-sm text-muted-foreground">
          This is shared with the creator before your session.
        </p>
      </div>

      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        You will be redirected to Paystack to pay securely. Booking is confirmed
        after successful payment.
      </p>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Change Time Slot
        </Button>
        <Button type="submit" disabled={loading} variant="marketing" className="rounded-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting to payment...
            </>
          ) : (
            "Pay with Paystack"
          )}
        </Button>
      </div>
    </form>
  );
}
