"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UploadButton } from "@uploadthing/react";
import { ImageIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, uploadThingResultToUrl } from "@/lib/utils";

/**
 * Cover image for a media listing (marketplace card / site hero).
 * Controlled mode: pass value + onChange (create form).
 * Persist mode: pass listingId (existing listing PATCH).
 */
export function ListingCoverUpload({
  listingId,
  value,
  onChange,
  className,
  compact = false,
  showLabel = true,
  showHint = true,
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const url = value || null;

  const persist = async (nextUrl) => {
    if (!listingId) {
      onChange?.(nextUrl);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/media-agency/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: nextUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save image");
      onChange?.(nextUrl);
      toast.success(nextUrl ? "Cover image updated" : "Cover image removed");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to save image");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {!compact && showLabel ? (
        <p className="text-sm font-medium text-slate-700">Cover image</p>
      ) : null}
      <div
        className={cn(
          "flex gap-3",
          compact ? "items-center" : "flex-col sm:flex-row sm:items-center"
        )}
      >
        <div
          className={cn(
            "relative shrink-0 overflow-hidden border border-slate-200 bg-slate-100",
            compact ? "h-14 w-20 rounded-xl" : "h-24 w-40 rounded-2xl"
          )}
        >
          {url ? (
            <Image
              src={url}
              alt=""
              fill
              className="object-cover"
              unoptimized
              sizes="160px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <ImageIcon className={compact ? "h-5 w-5" : "h-7 w-7"} />
            </div>
          )}
          {saving ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UploadButton
            endpoint="mediaAgencyImage"
            onClientUploadComplete={(res) => {
              const next = uploadThingResultToUrl(res);
              if (!next) {
                toast.error("Upload finished but no image URL returned");
                return;
              }
              persist(next);
            }}
            onUploadError={(error) => {
              toast.error(error.message || "Upload failed");
            }}
            appearance={{
              button:
                "ut-ready:bg-slate-950 ut-uploading:cursor-not-allowed h-9 rounded-full bg-slate-950 px-4 text-xs font-semibold text-white after:bg-slate-800",
              allowedContent: "hidden",
            }}
          />
          {url ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-full border-slate-200 text-xs"
              disabled={saving}
              onClick={() => persist(null)}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Remove
            </Button>
          ) : null}
        </div>
      </div>
      {!compact && showHint ? (
        <p className="text-xs text-slate-400">
          Shown on the marketplace card. JPG or PNG, up to 8MB.
        </p>
      ) : null}
    </div>
  );
}
