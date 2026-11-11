"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseNotes(notes) {
  if (!notes) return { kind: "empty" };
  if (typeof notes === "object" && !Array.isArray(notes)) {
    return { kind: "object", data: notes };
  }
  if (typeof notes !== "string") {
    return { kind: "text", text: String(notes) };
  }
  const trimmed = notes.trim();
  if (!trimmed) return { kind: "empty" };
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { kind: "object", data: parsed };
      }
    } catch {
      // fall through to plain text
    }
  }
  return { kind: "text", text: trimmed };
}

function money(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return `₵${n.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ");
  }
  return value ? String(value) : "";
}

function formatBroadcastDays(value) {
  if (!Array.isArray(value) || value.length === 0) return "";
  if (value.every((item) => typeof item === "boolean")) {
    return DAY_LABELS.filter((_, index) => value[index]).join(", ");
  }
  return formatList(value);
}

function formatSpotLengths(value) {
  if (!Array.isArray(value) || value.length === 0) return "";
  return value.map((sec) => `${sec}s`).join(", ");
}

function formatImpressions(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "";
  return n.toLocaleString("en-GH");
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600">
      {children}
    </span>
  );
}

function Detail({ label, children }) {
  if (children == null || children === "") return null;
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-800">{children}</p>
    </div>
  );
}

function SectionPanel({
  title,
  subtitle,
  chips = [],
  children,
  collapsible = false,
  defaultOpen = false,
  className,
}) {
  if (!collapsible) {
    return (
      <section
        className={cn(
          "overflow-hidden rounded-2xl border border-slate-200 bg-white",
          className
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3.5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {title}
            </p>
            {subtitle ? (
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-950">
                {subtitle}
              </p>
            ) : null}
          </div>
          {chips.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {chips.map((chip) => (
                <Chip key={chip}>{chip}</Chip>
              ))}
            </div>
          ) : null}
        </div>
        <div className="px-4 py-4">{children}</div>
      </section>
    );
  }

  return (
    <details
      className={cn(
        "group overflow-hidden rounded-2xl border border-slate-200 bg-[#f7f8fc] open:bg-white open:shadow-sm",
        className
      )}
      defaultOpen={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </p>
          {subtitle ? (
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-950">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {chips.length > 0 ? (
            <div className="hidden flex-wrap justify-end gap-1.5 sm:flex">
              {chips.slice(0, 3).map((chip) => (
                <Chip key={chip}>{chip}</Chip>
              ))}
            </div>
          ) : null}
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition group-open:rotate-180 group-open:border-slate-300 group-open:text-slate-900">
            <ChevronDown className="h-4 w-4" />
          </span>
        </div>
      </summary>
      <div className="border-t border-slate-100 px-4 pb-4 pt-3">{children}</div>
    </details>
  );
}

function PlannerCampaignNotes({ data, collapsible }) {
  const audience = formatList(data.audienceLabels);
  const objectives = formatList(data.objectiveLabels);
  const industries = formatList(data.industryLabels);
  const days = formatBroadcastDays(data.activeBroadcastDays);
  const spots = formatSpotLengths(data.spotLengthsSec);
  const impressions = formatImpressions(
    data.estimatedImpressions ?? data.lineImpressions
  );
  const channel =
    data.channel || (data.source === "media_planner_cart" ? "TV" : null);

  const chips = [
    channel ? String(channel).toUpperCase() : null,
    data.adFormatLabel || null,
    data.dayCount ? `${data.dayCount} day${data.dayCount === 1 ? "" : "s"}` : null,
    spots ? `Spots ${spots}` : null,
  ].filter(Boolean);

  const hasPricing =
    data.subtotal != null ||
    data.vat != null ||
    data.nhilGetfund != null ||
    data.total != null;

  return (
    <SectionPanel
      title="Campaign brief"
      subtitle={data.brandName || "Media planner booking"}
      chips={chips}
      collapsible={collapsible}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Audience">{audience}</Detail>
        <Detail label="Objectives">{objectives}</Detail>
        <Detail label="Industry">{industries}</Detail>
        <Detail label="Broadcast days">{days}</Detail>
        <Detail label="Est. impressions">{impressions}</Detail>
        <Detail label="Ad format">{data.adFormatLabel}</Detail>
      </div>

      {hasPricing ? (
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-[#f7f8fc] p-3 sm:grid-cols-4">
          <Detail label="Subtotal">{money(data.subtotal)}</Detail>
          <Detail label="VAT">{money(data.vat)}</Detail>
          <Detail label="NHIL / GETFund">{money(data.nhilGetfund)}</Detail>
          <Detail label="Campaign total">{money(data.total)}</Detail>
        </div>
      ) : null}
    </SectionPanel>
  );
}

export function BookingNotes({ notes, className, collapsible = false }) {
  const parsed = parseNotes(notes);
  if (parsed.kind === "empty") return null;

  if (parsed.kind === "object") {
    const data = parsed.data;
    const isPlanner =
      data.source === "media_planner_cart" ||
      data.source === "media_planner_cart_negotiate" ||
      data.channel ||
      data.audienceLabels ||
      data.adFormatLabel;

    if (isPlanner) {
      return (
        <div className={className}>
          <PlannerCampaignNotes data={data} collapsible={collapsible} />
        </div>
      );
    }

    const entries = Object.entries(data).filter(
      ([key, value]) =>
        value != null &&
        value !== "" &&
        !["source"].includes(key) &&
        !(Array.isArray(value) && value.length === 0)
    );

    if (entries.length === 0) return null;

    return (
      <div className={className}>
        <SectionPanel
          title="Notes"
          subtitle="Additional booking details"
          collapsible={collapsible}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {entries.map(([key, value]) => (
              <Detail key={key} label={key.replace(/([A-Z])/g, " $1")}>
                {Array.isArray(value) ? value.join(", ") : String(value)}
              </Detail>
            ))}
          </div>
        </SectionPanel>
      </div>
    );
  }

  return (
    <div className={className}>
      <SectionPanel title="Notes" subtitle="Client message" collapsible={collapsible}>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {parsed.text}
        </p>
      </SectionPanel>
    </div>
  );
}
