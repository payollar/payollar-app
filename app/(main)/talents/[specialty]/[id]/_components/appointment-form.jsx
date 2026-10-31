"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { startBookingChat } from "@/actions/booking-chat";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Loader2, Clock, ArrowLeft, Calendar, CreditCard, FileText } from "lucide-react";
import { toast } from "sonner";

export function AppointmentForm({
  doctorId,
  slot,
  onBack,
  onComplete: _onComplete,
  /** Prefill when visitor started booking from a specific service card */
  initialSessionNote,
}) {
  const router = useRouter();
  const [projectBrief, setProjectBrief] = useState(initialSessionNote ?? "");

  useEffect(() => {
    setProjectBrief(initialSessionNote ?? "");
  }, [slot?.startTime, initialSessionNote]);
  const [loading, setLoading] = useState(false);

  const startChat = async () => {
    setLoading(true);
    try {
      const result = await startBookingChat({
        doctorId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        description: projectBrief.trim(),
      });
      router.push(`/messages/${result.appointmentId}`);
    } catch (error) {
      toast.error(error.message || "Could not open the chat.");
      setLoading(false);
    }
  };

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
    <form
      onSubmit={(event) => {
        event.preventDefault();
        startChat();
      }}
      className="space-y-5 text-slate-900"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#6d28d9]">
            <Calendar className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-xs text-slate-500">Date</span>
            <span className="block text-sm font-medium">{format(new Date(slot.startTime), "EEEE, MMM d, yyyy")}</span>
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#6d28d9]">
            <Clock className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-xs text-slate-500">Time</span>
            <span className="block text-sm font-medium">{slot.formatted}</span>
          </span>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4" aria-labelledby="project-brief-heading">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f3ff] text-[#6d28d9]">
            <FileText className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h3 id="project-brief-heading" className="text-sm font-semibold text-slate-950">
              Project brief
            </h3>
            <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
              Tell them what you’re working on, what you need from the session, and any deadline. This goes with the booking.
            </p>
          </div>
        </div>
        <Label htmlFor="project-brief" className="sr-only">
          Project brief
        </Label>
        <Textarea
          id="project-brief"
          placeholder="We’re launching a single in June and need vocal coaching plus a content plan for TikTok and IG Reels."
          value={projectBrief}
          onChange={(e) => setProjectBrief(e.target.value)}
          maxLength={2000}
          className="mt-3 min-h-[140px] resize-y rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
        />
        <p className="mt-2 text-right text-xs tabular-nums text-slate-400">{projectBrief.length} / 2000</p>
      </section>

      <p className="flex items-start gap-2 text-sm text-slate-500">
        <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        Message them about this time first. Pay with Paystack when you are ready to confirm the session.
      </p>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Change time
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Pay with Paystack
          </Button>
          <Button
            type="button"
            onClick={startChat}
            disabled={loading}
            className="rounded-xl bg-[#6d28d9] text-white hover:bg-[#5b21b6]"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {loading ? (
              "Please wait..."
            ) : (
              <>
                <MessageCircle className="mr-2 h-4 w-4" />
                Message creator
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
