"use client";

import dynamic from "next/dynamic";
import { ExternalLink, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const MapCanvas = dynamic(
  () =>
    import(
      "@/app/(main)/media-agency/rate-card/_components/billboard-map-canvas"
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[220px] items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">
        Loading map…
      </div>
    ),
  }
);

/**
 * Read-only map for buyers viewing a billboard site.
 */
export function BillboardLocationMap({
  latitude,
  longitude,
  locationLabel,
  className,
}) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const hasPin = Number.isFinite(lat) && Number.isFinite(lng);

  if (!hasPin) {
    if (!locationLabel) return null;
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500",
          className
        )}
      >
        <p className="inline-flex items-center gap-1.5 font-medium text-slate-700">
          <MapPin className="h-4 w-4 text-slate-400" />
          {locationLabel}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Exact map pin not published for this site yet.
        </p>
      </div>
    );
  }

  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-950">Site map</p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0055ff] hover:underline"
        >
          Open in Maps
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {locationLabel ? (
        <p className="flex items-start gap-1.5 text-sm text-slate-500">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>{locationLabel}</span>
        </p>
      ) : null}
      <MapCanvas
        center={{ lat, lng }}
        pin={{ lat, lng }}
        interactive={false}
        heightClassName="h-[220px]"
      />
    </div>
  );
}
