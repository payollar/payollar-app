"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { UploadButton } from "@uploadthing/react";
import { toast } from "sonner";
import {
  Download,
  FileAudio,
  FileText,
  Film,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createClientMediaCampaignAsset,
  deleteClientMediaCampaignAsset,
} from "@/actions/media-campaign-assets";
import {
  MEDIA_ASSET_TYPES,
  mediaAssetTypeLabel,
} from "@/lib/media-campaign-assets";
import { cn } from "@/lib/utils";
import { clientCardClass } from "./client-page-shell";

function formatFileSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function assetIcon(fileType = "") {
  if (fileType.startsWith("video/")) return Film;
  if (fileType.startsWith("audio/")) return FileAudio;
  if (fileType.startsWith("image/")) return ImageIcon;
  return FileText;
}

function AssetPreviewThumb({ url, fileType = "", className }) {
  const type = String(fileType || "").toLowerCase();
  const Icon = assetIcon(type);

  if (url && type.startsWith("image/")) {
    return (
      <span
        className={cn(
          "relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  if (url && type.startsWith("video/")) {
    return (
      <span
        className={cn(
          "relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-950 ring-1 ring-slate-200/80",
          className
        )}
      >
        <video
          src={url}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
          <Film className="h-3.5 w-3.5 text-white" />
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700",
        className
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

function parseUploadFiles(res) {
  if (!Array.isArray(res)) return [];
  return res
    .map((file) => {
      const serverData = file?.serverData || {};
      return {
        url: serverData.url || file?.url || file?.ufsUrl || "",
        key: serverData.key || file?.key || null,
        type: serverData.type || file?.type || "application/octet-stream",
        name: serverData.name || file?.name || "creative",
        size: serverData.size ?? file?.size ?? null,
      };
    })
    .filter((file) => file.url);
}

function bookingLabel(booking) {
  const name =
    booking.mediaCampaignName ||
    booking.packageName ||
    booking.listing?.name ||
    "Media booking";
  const agency = booking.agency?.agencyName || "Station";
  return `${name} · ${agency}`;
}

function guessAssetType(file) {
  const name = String(file?.name || "").toLowerCase();
  const type = String(file?.type || "").toLowerCase();
  if (name.includes("jingle") || type.startsWith("audio/")) return "jingle";
  if (name.includes("spot") || name.includes("produced")) return "produced-spot";
  if (name.includes("script") || name.includes("live-read")) return "live-read";
  if (type.startsWith("video/") || name.includes("tvc")) return "tvc";
  return "tvc";
}

function makeDraft(file, defaults = {}) {
  return {
    id: `${file.key || file.url}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    assetType: defaults.assetType || guessAssetType(file),
    title: defaults.title || file.name.replace(/\.[^.]+$/, ""),
    notes: defaults.notes || "",
  };
}

export function MediaAssetsPanel({
  bookings = [],
  assets = [],
  searchQuery = "",
  preferredBookingId = null,
  onChanged,
}) {
  const uploadableBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status !== "CANCELLED" &&
          (booking.bookingType === "RATE_CARD" || booking.bookingType === "MEDIA")
      ),
    [bookings]
  );

  const [bookingKey, setBookingKey] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [sharedNotes, setSharedNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!preferredBookingId) return;
    const match = uploadableBookings.find((b) => b.id === preferredBookingId);
    if (match) setBookingKey(`${match.bookingType}|${match.id}`);
  }, [preferredBookingId, uploadableBookings]);

  useEffect(() => {
    if (bookingKey || uploadableBookings.length === 0) return;
    const first = uploadableBookings[0];
    setBookingKey(`${first.bookingType}|${first.id}`);
  }, [bookingKey, uploadableBookings]);

  const filteredAssets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return assets.filter((asset) => {
      if (!q) return true;
      const haystack = [
        asset.title,
        asset.fileName,
        asset.campaignName,
        asset.assetType,
        asset.agency?.agencyName,
        mediaAssetTypeLabel(asset.assetType),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [assets, searchQuery]);

  const groupedAssets = useMemo(() => {
    const groups = new Map();
    for (const asset of filteredAssets) {
      const key = `${asset.bookingType}:${asset.bookingId}`;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          campaignName: asset.campaignName || "Campaign",
          agencyName: asset.agency?.agencyName || "Station",
          items: [],
        });
      }
      groups.get(key).items.push(asset);
    }
    return [...groups.values()];
  }, [filteredAssets]);

  const updateDraft = (id, patch) => {
    setDrafts((current) =>
      current.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft))
    );
  };

  const removeDraft = (id) => {
    setDrafts((current) => current.filter((draft) => draft.id !== id));
  };

  const resetForm = () => {
    setDrafts([]);
    setSharedNotes("");
  };

  const handleSave = async () => {
    if (!bookingKey.includes("|")) {
      toast.error("Select a booking");
      return;
    }
    if (drafts.length === 0) {
      toast.error("Upload at least one creative file");
      return;
    }

    const [bookingType, bookingId] = bookingKey.split("|");
    setSaving(true);
    try {
      let saved = 0;
      for (const draft of drafts) {
        const result = await createClientMediaCampaignAsset({
          bookingType,
          bookingId,
          assetType: draft.assetType,
          title: draft.title || draft.file.name,
          notes: draft.notes || sharedNotes || null,
          fileUrl: draft.file.url,
          fileName: draft.file.name,
          fileType: draft.file.type,
          fileSize: draft.file.size,
          fileKey: draft.file.key,
        });
        if (!result?.success) {
          toast.error(result?.error || `Could not save ${draft.file.name}`);
          continue;
        }
        saved += 1;
      }

      if (saved === 0) {
        toast.error("No creatives were saved");
        return;
      }

      toast.success(
        saved === 1
          ? "Creative submitted to the station"
          : `${saved} creatives submitted to the station`
      );
      resetForm();
      onChanged?.();
    } catch (error) {
      console.error(error);
      toast.error("Could not save creatives");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (assetId) => {
    setDeletingId(assetId);
    try {
      const result = await deleteClientMediaCampaignAsset(assetId);
      if (!result?.success) {
        toast.error(result?.error || "Could not delete creative");
        return;
      }
      toast.success("Creative removed");
      onChanged?.();
    } catch (error) {
      console.error(error);
      toast.error("Could not delete creative");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <Card className={cn(clientCardClass, "border-0")}>
        <CardContent className="space-y-5 p-4 sm:p-5">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-slate-950">
              Upload creatives
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Add one or more TVCs, jingles, or spots for a booked campaign.
            </p>
          </div>

          {uploadableBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-[#f7f8fc] px-4 py-8 text-center text-sm text-slate-500">
              Book a media campaign first, then upload creatives here.
            </div>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">
                    Booking
                  </Label>
                  <Select value={bookingKey} onValueChange={setBookingKey}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-[#f7f8fc]">
                      <SelectValue placeholder="Select a booking" />
                    </SelectTrigger>
                    <SelectContent>
                      {uploadableBookings.map((booking) => (
                        <SelectItem
                          key={`${booking.bookingType}-${booking.id}`}
                          value={`${booking.bookingType}|${booking.id}`}
                        >
                          {bookingLabel(booking)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">
                    Shared notes (optional)
                  </Label>
                  <Textarea
                    value={sharedNotes}
                    onChange={(event) => setSharedNotes(event.target.value)}
                    placeholder="Applies to all files unless you add a note on a file"
                    className="min-h-[44px] rounded-xl border-slate-200 bg-[#f7f8fc]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <Label className="text-xs font-medium text-slate-600">
                      Creative files
                    </Label>
                    <p className="mt-1 text-xs text-slate-400">
                      Upload multiple files · video, audio, image, or PDF
                    </p>
                  </div>
                  {drafts.length > 0 ? (
                    <p className="text-xs font-medium text-slate-500">
                      {drafts.length} ready to submit
                    </p>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-dashed border-slate-200 bg-[#f7f8fc] p-4">
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
                        <Upload className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Add creatives
                        </p>
                        <p className="text-xs text-slate-500">
                          Select several files at once · up to 8 per upload
                        </p>
                      </div>
                    </div>
                    <UploadButton
                      endpoint="mediaCampaignAsset"
                      appearance={{
                        container: "w-auto items-start",
                        button:
                          "h-10 rounded-full bg-[#0055ff] px-4 text-xs font-semibold text-white ut-ready:bg-[#0055ff] ut-uploading:bg-[#0046d6]",
                        allowedContent: "hidden",
                      }}
                      content={{
                        button({ ready, isUploading }) {
                          if (isUploading) return "Uploading…";
                          if (!ready) return "Preparing…";
                          return drafts.length ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Plus className="h-3.5 w-3.5" />
                              Add more
                            </span>
                          ) : (
                            "Choose files"
                          );
                        },
                      }}
                      onClientUploadComplete={(res) => {
                        const uploaded = parseUploadFiles(res);
                        if (!uploaded.length) {
                          toast.error("Upload finished but file URL was missing");
                          return;
                        }
                        setDrafts((current) => {
                          const seen = new Set(
                            current.map((draft) => draft.file.url)
                          );
                          const next = [...current];
                          for (const file of uploaded) {
                            if (seen.has(file.url)) continue;
                            seen.add(file.url);
                            next.push(makeDraft(file));
                          }
                          return next;
                        });
                        toast.success(
                          uploaded.length === 1
                            ? "File added"
                            : `${uploaded.length} files added`
                        );
                      }}
                      onUploadError={(error) => {
                        toast.error(error?.message || "Upload failed");
                      }}
                    />
                  </div>
                </div>

                {drafts.length > 0 ? (
                  <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {drafts.map((draft, index) => {
                      return (
                        <li key={draft.id} className="space-y-3 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-3">
                              <AssetPreviewThumb
                                url={draft.file.url}
                                fileType={draft.file.type}
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  File {index + 1}
                                </p>
                                <p className="truncate text-sm font-medium text-slate-900">
                                  {draft.file.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {formatFileSize(draft.file.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
                              onClick={() => removeDraft(draft.id)}
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              Remove
                            </Button>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-slate-600">
                                Asset type
                              </Label>
                              <Select
                                value={draft.assetType}
                                onValueChange={(value) =>
                                  updateDraft(draft.id, { assetType: value })
                                }
                              >
                                <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-[#f7f8fc]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {MEDIA_ASSET_TYPES.map((type) => (
                                    <SelectItem key={type.id} value={type.id}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-slate-600">
                                Title
                              </Label>
                              <Input
                                value={draft.title}
                                onChange={(event) =>
                                  updateDraft(draft.id, {
                                    title: event.target.value,
                                  })
                                }
                                placeholder="e.g. Thanksgiving TVC 30s"
                                className="h-10 rounded-xl border-slate-200 bg-[#f7f8fc]"
                              />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                              <Label className="text-xs font-medium text-slate-600">
                                Notes for this file (optional)
                              </Label>
                              <Input
                                value={draft.notes}
                                onChange={(event) =>
                                  updateDraft(draft.id, {
                                    notes: event.target.value,
                                  })
                                }
                                placeholder="Air version, duration, cut…"
                                className="h-10 rounded-xl border-slate-200 bg-[#f7f8fc]"
                              />
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">
                  {drafts.length === 0
                    ? "Choose files to get started"
                    : `${drafts.length} creative${drafts.length === 1 ? "" : "s"} will go to the station`}
                </p>
                <Button
                  type="button"
                  variant="black"
                  className="rounded-full"
                  disabled={saving || drafts.length === 0}
                  onClick={handleSave}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : drafts.length > 1 ? (
                    `Submit ${drafts.length} creatives`
                  ) : (
                    "Submit creative"
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-950">
              Submitted creatives
            </h3>
            <p className="text-sm text-slate-500">
              Files the station can download for your campaigns
            </p>
          </div>
          <p className="text-xs font-medium text-slate-400">
            {filteredAssets.length} file{filteredAssets.length === 1 ? "" : "s"}
          </p>
        </div>

        {groupedAssets.length === 0 ? (
          <Card className={cn(clientCardClass, "border-0")}>
            <CardContent className="px-6 py-12 text-center">
              <Upload className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="font-semibold text-slate-950">
                {assets.length === 0
                  ? "No creatives yet"
                  : "No matching creatives"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {assets.length === 0
                  ? "Upload a TVC, jingle, or other asset for a booked campaign."
                  : "Try another search."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {groupedAssets.map((group) => (
              <Card key={group.key} className={cn(clientCardClass, "border-0")}>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {group.campaignName}
                      </p>
                      <p className="text-xs text-slate-500">{group.agencyName}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="rounded-full border-slate-200 bg-slate-50 text-slate-600"
                    >
                      {group.items.length} file
                      {group.items.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {group.items.map((asset) => {
                      return (
                        <li
                          key={asset.id}
                          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5"
                        >
                          <div className="flex min-w-0 items-start gap-3">
                            <AssetPreviewThumb
                              url={asset.fileUrl}
                              fileType={asset.fileType}
                            />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-sm font-semibold text-slate-950">
                                  {asset.title || asset.fileName}
                                </p>
                                <Badge
                                  variant="outline"
                                  className="rounded-full border-slate-200 bg-white text-slate-600"
                                >
                                  {mediaAssetTypeLabel(asset.assetType)}
                                </Badge>
                              </div>
                              <p className="mt-1 text-xs text-slate-400">
                                {asset.fileName} · {formatFileSize(asset.fileSize)} ·{" "}
                                {format(new Date(asset.createdAt), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="rounded-full border-slate-200"
                            >
                              <a
                                href={asset.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Download className="mr-1.5 h-3.5 w-3.5" />
                                Open
                              </a>
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
                              disabled={deletingId === asset.id}
                              onClick={() => handleDelete(asset.id)}
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              {deletingId === asset.id ? "Removing…" : "Remove"}
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
