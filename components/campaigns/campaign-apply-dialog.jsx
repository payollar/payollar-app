"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { applyToCampaign } from "@/actions/campaigns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function CampaignApplyDialog({
  campaign,
  open,
  onOpenChange,
  creatorProfile = null,
}) {
  const router = useRouter();
  const canUseProfile = Boolean(creatorProfile?.ready);
  const [rate, setRate] = useState("");
  const [availability, setAvailability] = useState("");
  const [note, setNote] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRate(creatorProfile?.defaults?.rate || "");
    setAvailability(creatorProfile?.defaults?.availability || "");
    setNote("");
    setAcceptedTerms(false);
  }, [open, creatorProfile]);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setRate("");
      setAvailability("");
      setNote("");
      setAcceptedTerms(false);
    }
    onOpenChange?.(nextOpen);
  };

  const handleSubmitApplication = async (event) => {
    event.preventDefault();
    if (!campaign) return;
    if (!canUseProfile) {
      toast.error("Complete your creator profile before applying.");
      return;
    }
    if (!acceptedTerms) {
      toast.error("Confirm you understand selection is subject to final terms.");
      return;
    }

    const formData = new FormData();
    formData.append("campaignId", campaign.id);
    formData.append("rate", rate ?? "");
    formData.append("availability", availability ?? "");
    formData.append("note", note ?? "");

    setIsSubmitting(true);
    try {
      const result = await applyToCampaign(formData);
      if (result?.success) {
        toast.success("Application submitted — your profile was shared with the brand.");
        handleOpenChange(false);
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border-slate-200 bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-950">
            Application · {campaign?.title || "Campaign"}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            {campaign?.brand
              ? `${campaign.brand} will receive your saved Payollar profile with this application.`
              : "Your saved Payollar profile is shared with the brand automatically."}
          </DialogDescription>
        </DialogHeader>

        {creatorProfile ? (
          <div
            className={cn(
              "mt-4 rounded-2xl border p-3.5",
              canUseProfile
                ? "border-violet-200 bg-[#f5f3ff]"
                : "border-amber-200 bg-amber-50"
            )}
          >
            {canUseProfile ? (
              <>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6d28d9] text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-950">
                      Profile attached automatically
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                      Name, bio, specialty, experience, skills, and portfolio from
                      your creator profile go to the brand — no need to re-enter
                      them.
                    </p>
                    <p className="mt-2 truncate text-xs font-medium text-slate-800">
                      {creatorProfile.defaults?.name || "Your profile"}
                      {creatorProfile.specialty
                        ? ` · ${creatorProfile.specialty}`
                        : ""}
                    </p>
                  </div>
                </div>
                <Link
                  href="/creator/profile"
                  className="mt-3 inline-flex text-xs font-medium text-[#6d28d9] hover:underline"
                >
                  Edit profile
                </Link>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Finish your creator profile first
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Add a bio, specialty, or portfolio so brands can review you
                    when you apply.
                  </p>
                </div>
                <Button asChild type="button" variant="black" className="rounded-full">
                  <Link href="/creator/profile">Complete profile</Link>
                </Button>
              </div>
            )}
          </div>
        ) : null}

        {canUseProfile ? (
          <form onSubmit={handleSubmitApplication} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="campaign-apply-rate">Your proposed fee</Label>
                <Input
                  id="campaign-apply-rate"
                  name="rate"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={rate}
                  onChange={(event) => setRate(event.target.value)}
                  placeholder="GH₵"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign-apply-availability">Availability</Label>
                <Input
                  id="campaign-apply-availability"
                  name="availability"
                  value={availability}
                  onChange={(event) => setAvailability(event.target.value)}
                  placeholder="e.g. Dec 7–31"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign-apply-note">
                Note to brand <span className="font-normal text-slate-400">(optional)</span>
              </Label>
              <Textarea
                id="campaign-apply-note"
                name="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Anything campaign-specific they should know"
                rows={3}
                maxLength={500}
                className="rounded-xl"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#6d28d9] focus:ring-[#6d28d9]"
              />
              <span>
                I understand that selection is subject to final terms.
              </span>
            </label>

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-full bg-[#6d28d9] font-semibold text-white hover:bg-[#5b21b6]"
                disabled={isSubmitting || !acceptedTerms}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit application
                    <ArrowUpRight className="ml-1.5 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
