"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaConfirmPanel } from "@/components/products/media-confirm-panels";
import { formatCompactCount } from "@/lib/media-planner-pricing";

function MetaChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

/**
 * Confirm-step campaign summary — station hero, chips, slot cards, day pills.
 */
export function MediaCampaignSummary({
  campaignName,
  brandName,
  audienceLabels = [],
  objectiveLabels = [],
  industryLabels = [],
  contactName,
  contactEmail,
  contactPhone,
  stationTitle,
  agencyName,
  location,
  adFormatLabel,
  spotLengthLabel,
  windowStartLabel,
  windowEndLabel,
  dayCount,
  slots = [],
  activeDays = [],
  weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  className,
}) {
  const contactBits = [contactName, contactEmail, contactPhone].filter(Boolean);
  const briefChips = [
    brandName,
    ...(audienceLabels || []),
    ...(objectiveLabels || []),
    ...(industryLabels || []),
  ].filter(Boolean);

  return (
    <MediaConfirmPanel title="Campaign summary" className={className}>
      <div className="space-y-5">
        {campaignName ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Campaign
            </p>
            <p className="mt-1 text-base font-semibold text-slate-950 sm:text-lg">{campaignName}</p>
            {briefChips.length > 0 ? (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {briefChips.map((chip) => (
                  <MetaChip key={chip}>{chip}</MetaChip>
                ))}
              </div>
            ) : null}
            {contactBits.length > 0 ? (
              <p className="mt-2 text-xs text-slate-500">{contactBits.join(" · ")}</p>
            ) : null}
          </div>
        ) : null}

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Station</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
            {stationTitle || "—"}
          </p>
          {agencyName ? <p className="mt-1 text-sm text-slate-500">{agencyName}</p> : null}

          <div className="mt-3 flex flex-wrap gap-2">
            {location ? (
              <MetaChip>
                <MapPin className="mr-1 h-3 w-3 text-slate-400" />
                {location}
              </MetaChip>
            ) : null}
            {adFormatLabel ? <MetaChip>{adFormatLabel}</MetaChip> : null}
            {spotLengthLabel ? <MetaChip>{spotLengthLabel}</MetaChip> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Campaign window
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950 sm:text-base">
                {windowStartLabel || "—"}
                {windowEndLabel ? (
                  <>
                    <span className="font-normal text-slate-400"> — </span>
                    {windowEndLabel}
                  </>
                ) : null}
              </p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 ring-1 ring-slate-200">
              <CalendarDays className="h-5 w-5" strokeWidth={1.75} />
            </div>
          </div>
          {dayCount ? (
            <p className="mt-3 inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
              {dayCount} day{dayCount === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Airtime plan
            </p>
            <p className="text-xs tabular-nums text-slate-400">
              {slots.length} slot{slots.length === 1 ? "" : "s"}
            </p>
          </div>

          {slots.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
              No airtime slots selected.
            </p>
          ) : (
            <ul className="space-y-2">
              {slots.map((slot) => {
                const impressionsLabel = formatCompactCount(
                  slot.lineImpressions ?? slot.impressionsPerAiring
                );
                return (
                  <li
                    key={slot.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-3.5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{slot.label}</p>
                      {slot.range ? (
                        <p className="mt-0.5 text-xs text-slate-400">{slot.range}</p>
                      ) : null}
                      {impressionsLabel ? (
                        <p className="mt-1 text-xs font-medium tabular-nums text-slate-500">
                          Est. {impressionsLabel} impressions
                          {slot.impressionsSource !== "agency" ? (
                            <span className="font-normal text-slate-400"> · demo</span>
                          ) : null}
                        </p>
                      ) : null}
                    </div>
                    {slot.frequencyLabel ? (
                      <span className="shrink-0 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                        {slot.frequencyLabel}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Active days
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {weekdays.map((label, index) => {
              const on = Boolean(activeDays[index]);
              return (
                <div
                  key={label}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-xl text-[11px] font-semibold sm:h-10 sm:text-xs",
                    on
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-300"
                  )}
                >
                  {label.slice(0, 1)}
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {weekdays.filter((_, i) => activeDays[i]).join(", ") || "No days selected"}
          </p>
        </div>
      </div>
    </MediaConfirmPanel>
  );
}
