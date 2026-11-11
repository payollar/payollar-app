"use client";

import { ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mediaAssetTypeLabel } from "@/lib/media-campaign-assets";
import { cn } from "@/lib/utils";

function CreativeList({ assets }) {
  return (
    <ul className="space-y-2">
      {assets.map((asset) => (
        <li
          key={asset.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#f7f8fc] px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {asset.title || asset.fileName}
            </p>
            <p className="text-xs text-slate-500">
              {mediaAssetTypeLabel(asset.assetType)}
              {asset.notes ? ` · ${asset.notes}` : ""}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-slate-200"
            asChild
          >
            <a href={asset.fileUrl} target="_blank" rel="noreferrer">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Open
            </a>
          </Button>
        </li>
      ))}
    </ul>
  );
}

export function BookingCreatives({ assets = [], collapsible = false, className }) {
  if (!assets.length) return null;

  if (!collapsible) {
    return (
      <section
        className={cn(
          "overflow-hidden rounded-2xl border border-slate-200 bg-white",
          className
        )}
      >
        <div className="border-b border-slate-100 px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Client creatives
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-950">
            {assets.length} file{assets.length === 1 ? "" : "s"} ready to download
          </p>
        </div>
        <div className="px-4 py-4">
          <CreativeList assets={assets} />
        </div>
      </section>
    );
  }

  return (
    <details
      className={cn(
        "group overflow-hidden rounded-2xl border border-slate-200 bg-[#f7f8fc] open:bg-white open:shadow-sm",
        className
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Client creatives
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-950">
            {assets.length} file{assets.length === 1 ? "" : "s"} ready to download
          </p>
        </div>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition group-open:rotate-180 group-open:border-slate-300 group-open:text-slate-900">
          <ChevronDown className="h-4 w-4" />
        </span>
      </summary>
      <div className="border-t border-slate-100 px-4 pb-4 pt-3">
        <CreativeList assets={assets} />
      </div>
    </details>
  );
}
