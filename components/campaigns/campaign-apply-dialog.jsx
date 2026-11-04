"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, UserRound } from "lucide-react";
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

const EMPTY_APPLICATION = {
  name: "",
  email: "",
  phone: "",
  location: "",
  portfolio: "",
  experience: "",
  rate: "",
  availability: "",
  additionalInfo: "",
};

function applicationFromProfile(profile) {
  if (!profile?.defaults) return { ...EMPTY_APPLICATION };
  return {
    ...EMPTY_APPLICATION,
    ...profile.defaults,
    name: profile.defaults.name || "",
    email: profile.defaults.email || "",
    phone: profile.defaults.phone || "",
    location: profile.defaults.location || "",
    portfolio: profile.defaults.portfolio || "",
    experience: profile.defaults.experience || "",
    rate: profile.defaults.rate || "",
    availability: profile.defaults.availability || "",
    additionalInfo: profile.defaults.additionalInfo || "",
  };
}

function initialFormFromProfile(profile) {
  if (profile?.ready) return applicationFromProfile(profile);
  return {
    ...EMPTY_APPLICATION,
    name: profile?.defaults?.name || "",
    email: profile?.defaults?.email || "",
  };
}

export function CampaignApplyDialog({
  campaign,
  open,
  onOpenChange,
  creatorProfile = null,
}) {
  const router = useRouter();
  const canUseProfile = Boolean(creatorProfile?.ready);
  const [applicationForm, setApplicationForm] = useState(EMPTY_APPLICATION);
  const [usedProfile, setUsedProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setApplicationForm(initialFormFromProfile(creatorProfile));
    setUsedProfile(Boolean(creatorProfile?.ready));
  }, [open, creatorProfile]);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setApplicationForm(EMPTY_APPLICATION);
      setUsedProfile(false);
    }
    onOpenChange?.(nextOpen);
  };

  const fillFromProfile = () => {
    if (!canUseProfile) return;
    setApplicationForm(applicationFromProfile(creatorProfile));
    setUsedProfile(true);
    toast.success("Filled from your creator profile");
  };

  const updateApplicationField = (field) => (event) => {
    const value = event.target.value;
    setApplicationForm((current) => ({ ...current, [field]: value }));
    setUsedProfile(false);
  };

  const handleSubmitApplication = async (event) => {
    event.preventDefault();
    if (!campaign) return;

    const formData = new FormData();
    formData.append("campaignId", campaign.id);
    Object.entries(applicationForm).forEach(([key, value]) => {
      formData.append(key, value ?? "");
    });

    setIsSubmitting(true);
    try {
      const result = await applyToCampaign(formData);
      if (result?.success) {
        toast.success("Application submitted successfully!");
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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl border-slate-200 bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-950">Apply to campaign</DialogTitle>
          <DialogDescription className="text-slate-500">
            {campaign?.title} · {campaign?.brand}
          </DialogDescription>
        </DialogHeader>

        {creatorProfile ? (
          <div
            className={cn(
              "mt-4 flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center sm:justify-between",
              usedProfile
                ? "border-violet-200 bg-[#f5f3ff]"
                : "border-slate-200 bg-slate-50"
            )}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">
                {usedProfile
                  ? "Using your creator profile"
                  : canUseProfile
                    ? "Apply with your creator profile"
                    : "Finish your creator profile for one-tap apply"}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {canUseProfile
                  ? "Name, email, portfolio, experience, skills, and rate fill in automatically. Edit anything before you send."
                  : "Add a bio, specialty, or portfolio links on your profile, then come back here."}
              </p>
            </div>
            {canUseProfile ? (
              <Button
                type="button"
                variant="outline"
                onClick={fillFromProfile}
                disabled={isSubmitting}
                className="shrink-0 rounded-full border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
              >
                <UserRound className="mr-1.5 h-4 w-4" />
                {usedProfile ? "Refill from profile" : "Use my profile"}
              </Button>
            ) : (
              <Button asChild type="button" variant="outline" className="shrink-0 rounded-full">
                <Link href="/creator/profile">Complete profile</Link>
              </Button>
            )}
          </div>
        ) : null}

        <form onSubmit={handleSubmitApplication} className="mt-4 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="campaign-apply-name">Full name *</Label>
              <Input
                id="campaign-apply-name"
                name="name"
                value={applicationForm.name}
                onChange={updateApplicationField("name")}
                placeholder="Your full name"
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-apply-email">Email *</Label>
              <Input
                id="campaign-apply-email"
                name="email"
                type="email"
                value={applicationForm.email}
                onChange={updateApplicationField("email")}
                placeholder="you@email.com"
                required
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="campaign-apply-phone">Phone</Label>
              <Input
                id="campaign-apply-phone"
                name="phone"
                type="tel"
                value={applicationForm.phone}
                onChange={updateApplicationField("phone")}
                placeholder="+233 …"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-apply-location">Location</Label>
              <Input
                id="campaign-apply-location"
                name="location"
                value={applicationForm.location}
                onChange={updateApplicationField("location")}
                placeholder="City, region"
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign-apply-portfolio">Portfolio / social links</Label>
            <Textarea
              id="campaign-apply-portfolio"
              name="portfolio"
              value={applicationForm.portfolio}
              onChange={updateApplicationField("portfolio")}
              placeholder="Instagram, YouTube, site…"
              rows={2}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign-apply-experience">Relevant experience *</Label>
            <Textarea
              id="campaign-apply-experience"
              name="experience"
              value={applicationForm.experience}
              onChange={updateApplicationField("experience")}
              placeholder="Why you’re a fit for this campaign…"
              rows={4}
              required
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign-apply-rate">Your rate (GH₵)</Label>
            <Input
              id="campaign-apply-rate"
              name="rate"
              type="number"
              value={applicationForm.rate}
              onChange={updateApplicationField("rate")}
              placeholder="Expected compensation"
              min="0"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign-apply-availability">Availability</Label>
            <Textarea
              id="campaign-apply-availability"
              name="availability"
              value={applicationForm.availability}
              onChange={updateApplicationField("availability")}
              placeholder="Start dates, constraints…"
              rows={2}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign-apply-additional">Anything else?</Label>
            <Textarea
              id="campaign-apply-additional"
              name="additionalInfo"
              value={applicationForm.additionalInfo}
              onChange={updateApplicationField("additionalInfo")}
              placeholder="Optional details"
              rows={3}
              className="rounded-xl"
            />
          </div>
          <div className="flex gap-3 pt-2">
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
              variant="black"
              className="flex-1 rounded-full font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit application"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
