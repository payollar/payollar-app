"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Loader2, Clock, ArrowLeft, Calendar, CreditCard, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AppointmentForm({
  doctorId,
  slot,
  onBack,
  onComplete: _onComplete,
  /** Prefill when visitor started booking from a specific service card */
  initialSessionNote,
}) {
  const [projectBrief, setProjectBrief] = useState(initialSessionNote ?? "");

  useEffect(() => {
    setProjectBrief(initialSessionNote ?? "");
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
          description: projectBrief.trim() || undefined,
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

      <section
        className={cn(
          "space-y-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-5",
          "ring-1 ring-primary/10"
        )}
        aria-labelledby="project-brief-heading"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <FileText className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 id="project-brief-heading" className="text-base font-semibold text-foreground">
              Your project brief for the talent
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Help them prepare: describe your brand or event, what you need from the session, timeline, references, or
              deliverables. This is sent to the creator with your booking.
            </p>
          </div>
        </div>
        <div className="space-y-2 pt-1">
          <Label htmlFor="project-brief" className="sr-only">
            Project brief
          </Label>
          <Textarea
            id="project-brief"
            placeholder="Example: We’re launching a single in June and need vocal coaching plus a content plan for TikTok and IG Reels. Budget is flexible for the right fit…"
            value={projectBrief}
            onChange={(e) => setProjectBrief(e.target.value)}
            maxLength={2000}
            className="min-h-[140px] resize-y border-border/60 bg-background text-foreground"
          />
          <div className="flex justify-end text-xs text-muted-foreground tabular-nums">
            {projectBrief.length} / 2000
          </div>
        </div>
      </section>

      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <CreditCard className="h-4 w-4 shrink-0" aria-hidden />
        You will be redirected to Paystack to pay securely. Booking is confirmed after successful payment.
      </p>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Change time slot
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
