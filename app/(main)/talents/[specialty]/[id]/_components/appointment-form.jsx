"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Package } from "lucide-react";
import { startBookingChat } from "@/actions/booking-chat";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { Loader2, Clock, ArrowLeft, Calendar, CreditCard, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** Build booking description including optional physical-package request. */
export function buildBookingDescription({
  projectBrief = "",
  includePhysicalPackage = false,
  packageDetails = "",
}) {
  const brief = String(projectBrief || "").trim();
  if (!includePhysicalPackage) return brief.slice(0, 2000);

  const details = String(packageDetails || "").trim();
  const lines = [
    "Physical package: Yes — client will send a physical package for the creator to use on this project",
  ];
  if (details) {
    lines.push("Package details:");
    lines.push(details);
  } else {
    lines.push(
      "Package details: to be confirmed in chat (what’s being sent, when, and shipping needs)"
    );
  }

  const packageBlock = lines.join("\n");
  const combined = brief ? `${brief}\n\n${packageBlock}` : packageBlock;
  return combined.slice(0, 2000);
}

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
  const [includePhysicalPackage, setIncludePhysicalPackage] = useState(false);
  const [packageDetails, setPackageDetails] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProjectBrief(initialSessionNote ?? "");
    setIncludePhysicalPackage(false);
    setPackageDetails("");
  }, [slot?.startTime, initialSessionNote]);

  const description = buildBookingDescription({
    projectBrief,
    includePhysicalPackage,
    packageDetails,
  });

  const goToSignIn = (message) => {
    const next = `${window.location.pathname}${window.location.search}`;
    toast.error(message);
    router.push(`/sign-in?redirect_url=${encodeURIComponent(next)}`);
    setLoading(false);
  };

  const startChat = async () => {
    setLoading(true);
    try {
      const result = await startBookingChat({
        doctorId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        description,
      });
      if (result?.code === "UNAUTHENTICATED") {
        goToSignIn(result?.error || "Sign in to message this creator.");
        return;
      }
      if (result?.error || !result?.appointmentId) {
        toast.error(result?.error || "Could not open the chat.");
        setLoading(false);
        return;
      }
      router.push(`/messages/${result.appointmentId}`);
    } catch (error) {
      const message = String(error?.message || "");
      if (error?.digest || message.includes("Server Components render")) {
        toast.error("Could not open the chat. Sign in as a client and try again.");
        setLoading(false);
        return;
      }
      if (message === "Unauthorized") {
        goToSignIn("Sign in to message this creator.");
        return;
      }
      toast.error(message || "Could not open the chat.");
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
          description: description || undefined,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        goToSignIn("Sign in to pay for this session.");
        return;
      }

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
            <span className="block text-sm font-medium">
              {format(new Date(slot.startTime), "EEEE, MMM d, yyyy")}
            </span>
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

      <section
        className="rounded-2xl border border-slate-200 bg-white p-4"
        aria-labelledby="project-brief-heading"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f3ff] text-[#6d28d9]">
            <FileText className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h3
              id="project-brief-heading"
              className="text-sm font-semibold text-slate-950"
            >
              Project brief
            </h3>
            <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
              Tell them what you’re working on, what you need from the session,
              and any deadline. This goes with the booking.
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
        <p className="mt-2 text-right text-xs tabular-nums text-slate-400">
          {projectBrief.length} / 2000
        </p>
      </section>

      <section
        className={cn(
          "rounded-2xl border p-4 transition",
          includePhysicalPackage
            ? "border-[#ddd6fe] bg-[#faf8ff]"
            : "border-slate-200 bg-white"
        )}
        aria-labelledby="physical-package-heading"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f3ff] text-[#6d28d9]">
              <Package className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <h3
                id="physical-package-heading"
                className="text-sm font-semibold text-slate-950"
              >
                Send a physical package
              </h3>
              <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                You’ll ship a physical product or package to this creator for
                them to use on the project (samples, merch, props, gear, and
                more).
              </p>
            </div>
          </div>
          <Switch
            checked={includePhysicalPackage}
            onCheckedChange={setIncludePhysicalPackage}
            aria-label="Send a physical package"
            className="mt-1 shrink-0"
          />
        </div>

        {includePhysicalPackage ? (
          <div className="mt-4 space-y-2">
            <Label
              htmlFor="package-details"
              className="text-xs font-medium text-slate-600"
            >
              What’s in the package?
            </Label>
            <Textarea
              id="package-details"
              placeholder="e.g. 2 product samples + branded packaging for an unboxing video. Ready to ship next week — need your delivery address."
              value={packageDetails}
              onChange={(e) => setPackageDetails(e.target.value)}
              maxLength={800}
              className="min-h-[100px] resize-y rounded-xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
            />
            <p className="text-[11px] leading-relaxed text-slate-400">
              This is added to the booking brief. After booking, you can arrange
              shipping in Logistics once the creator shares their address.
            </p>
          </div>
        ) : null}
      </section>

      <p className="flex items-start gap-2 text-sm text-slate-500">
        <MessageCircle
          className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
          aria-hidden
        />
        Message them about this time first. Pay with Paystack when you are ready
        to confirm the session.
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
