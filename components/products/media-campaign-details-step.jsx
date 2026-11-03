"use client";

import { useState } from "react";
import { Megaphone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { MediaMultiSelect } from "@/components/products/media-multi-select";
import {
  MEDIA_AUDIENCE_TYPES,
  MEDIA_CAMPAIGN_OBJECTIVES,
  MEDIA_INDUSTRY_OPTIONS,
} from "@/lib/media-campaign-brief";

const fieldLabelClass = "text-sm font-semibold text-slate-800";
const fieldControlClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-slate-900/10";

/**
 * Campaign info form — compact card layout with multi-select brief fields.
 */
export function MediaCampaignDetailsStep({
  campaignName,
  onCampaignNameChange,
  brandName,
  onBrandNameChange,
  objectiveIds = [],
  onObjectiveIdsChange,
  audienceTypeIds = [],
  onAudienceTypeIdsChange,
  industryIds = [],
  onIndustryIdsChange,
  contactName,
  onContactNameChange,
  contactPhone,
  onContactPhoneChange,
  contactEmail,
  onContactEmailChange,
  campaignNameId = "media-campaign-name",
  brandNameId = "media-brand-name",
  contactNameId = "media-contact-name",
  contactPhoneId = "media-contact-phone",
  contactEmailId = "media-contact-email",
  showContact = true,
  continueDisabled = false,
  continueLabel = "Continue",
  onContinue,
  className,
}) {
  const [section, setSection] = useState("brief");

  return (
    <div
      className={cn(
        "rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]",
        className
      )}
    >
      <div className="rounded-t-[28px] border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
            <Megaphone className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
              Campaign info
            </h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-500">
              Add the basics for this flight—name, audience, and contact—before you pick stations and airtime.
            </p>
          </div>
        </div>

        {showContact ? (
          <div className="mt-5 inline-flex rounded-full bg-slate-100 p-1">
            {[
              { id: "brief", label: "Campaign brief" },
              { id: "contact", label: "Contact" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSection(tab.id)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  section === tab.id
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
        {section === "brief" || !showContact ? (
          <>
            <div className="space-y-2">
              <Label htmlFor={campaignNameId} className={fieldLabelClass}>
                Campaign name <span className="text-red-500">*</span>
              </Label>
              <Input
                id={campaignNameId}
                value={campaignName}
                onChange={(e) => onCampaignNameChange?.(e.target.value)}
                placeholder="e.g. Q1 Product Launch"
                className={fieldControlClass}
                autoComplete="off"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={brandNameId} className={fieldLabelClass}>
                Brand / product
              </Label>
              <Input
                id={brandNameId}
                value={brandName}
                onChange={(e) => onBrandNameChange?.(e.target.value)}
                placeholder="e.g. Acme Mobile"
                className={fieldControlClass}
                autoComplete="organization"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className={fieldLabelClass}>
                  Audience type <span className="text-red-500">*</span>
                </Label>
                <MediaMultiSelect
                  options={MEDIA_AUDIENCE_TYPES}
                  values={audienceTypeIds}
                  onChange={onAudienceTypeIdsChange}
                  placeholder="Select one or more"
                />
              </div>

              <div className="space-y-2">
                <Label className={fieldLabelClass}>Objective</Label>
                <MediaMultiSelect
                  options={MEDIA_CAMPAIGN_OBJECTIVES}
                  values={objectiveIds}
                  onChange={onObjectiveIdsChange}
                  placeholder="Select one or more"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between gap-3">
                <Label className={fieldLabelClass}>Industry</Label>
                {industryIds.length > 0 ? (
                  <span className="text-xs tabular-nums text-slate-400">
                    {industryIds.length} selected
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-slate-400">
                Choose every sector this campaign relates to—search to find them faster.
              </p>
              <MediaMultiSelect
                options={MEDIA_INDUSTRY_OPTIONS}
                values={industryIds}
                onChange={onIndustryIdsChange}
                placeholder="Search or select industries"
                searchable
                searchPlaceholder="Search industries…"
              />
            </div>
          </>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={contactNameId} className={fieldLabelClass}>
                Contact name
              </Label>
              <Input
                id={contactNameId}
                value={contactName}
                onChange={(e) => onContactNameChange?.(e.target.value)}
                placeholder="Full name"
                className={fieldControlClass}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={contactPhoneId} className={fieldLabelClass}>
                Phone
              </Label>
              <Input
                id={contactPhoneId}
                type="tel"
                value={contactPhone}
                onChange={(e) => onContactPhoneChange?.(e.target.value)}
                placeholder="+233 …"
                className={fieldControlClass}
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={contactEmailId} className={fieldLabelClass}>
                Email
              </Label>
              <Input
                id={contactEmailId}
                type="email"
                value={contactEmail}
                onChange={(e) => onContactEmailChange?.(e.target.value)}
                placeholder="billing@company.com"
                className={fieldControlClass}
                autoComplete="email"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-b-[28px] border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <p className="text-xs text-slate-400 sm:text-sm">
          {section === "brief"
            ? "Pick at least one audience type to continue."
            : "Contact is optional—useful for booking follow-up."}
        </p>
        <div className="flex items-center gap-2">
          {showContact && section === "brief" ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-slate-200 px-4 text-slate-700 hover:bg-slate-50"
              onClick={() => setSection("contact")}
            >
              Add contact
            </Button>
          ) : null}
          {showContact && section === "contact" ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-slate-200 px-4 text-slate-700 hover:bg-slate-50"
              onClick={() => setSection("brief")}
            >
              Back to brief
            </Button>
          ) : null}
          <Button
            type="button"
            disabled={continueDisabled}
            onClick={onContinue}
            className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {continueLabel}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
