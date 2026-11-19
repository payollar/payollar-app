"use client";

import {
  Building2,
  Megaphone,
  Radio,
  Smartphone,
  Tv,
  Users,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MEDIA_AGENCY_TYPES } from "@/lib/media-agency-type";

const TYPE_ICONS = {
  TV: Tv,
  RADIO: Radio,
  BILLBOARD: Megaphone,
  DIGITAL: Smartphone,
  INFLUENCER_MARKETING: Users,
  VIDEO_CLIPPING: Video,
};

/**
 * Shared media-vertical picker for signup, complete-profile, and type gate.
 */
export function MediaTypePicker({
  value,
  onChange,
  disabled = false,
  className,
  tone = "auth", // "auth" | "dashboard"
}) {
  const activeBorder =
    tone === "dashboard"
      ? "border-[#0055ff] bg-[#eef2ff]/60 text-[#0055ff] ring-2 ring-[#0055ff]/15"
      : "border-primary bg-primary/[0.06] text-primary shadow-sm ring-2 ring-primary/15";
  const activeMuted =
    tone === "dashboard" ? "text-[#0055ff]/80" : "text-primary/80";

  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3", className)}>
      {MEDIA_AGENCY_TYPES.map((type) => {
        const Icon = TYPE_ICONS[type.value] || Building2;
        const active = value === type.value;
        return (
          <button
            key={type.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(type.value)}
            aria-pressed={active}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition disabled:opacity-60",
              active
                ? activeBorder
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.9} />
            <span className="text-[13px] font-semibold leading-tight">
              {type.label}
            </span>
            <span
              className={cn(
                "text-[11px] leading-snug",
                active ? activeMuted : "text-slate-400"
              )}
            >
              {type.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function MediaTypeIcon({ type, className }) {
  const Icon = TYPE_ICONS[String(type || "").toUpperCase()] || Building2;
  return <Icon className={className} />;
}
