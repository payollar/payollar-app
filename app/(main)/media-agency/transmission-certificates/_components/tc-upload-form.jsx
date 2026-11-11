"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { UploadButton } from "@uploadthing/react";
import { toast } from "sonner";
import { FileText, Link2, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const inputClass =
  "h-10 rounded-xl border-slate-200 bg-[#f7f8fc] text-slate-900 shadow-none focus-visible:border-slate-950/40 focus-visible:bg-white focus-visible:ring-slate-950/15";

function normalizeBookingType(value) {
  const raw = String(value || "").toUpperCase();
  if (raw === "MEDIA" || raw === "MEDIA_BOOKING") return "MEDIA";
  if (raw === "RATE_CARD" || raw === "RATE_CARD_BOOKING") return "RATE_CARD";
  return "";
}

function Field({ id, label, children, hint, className, required }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium text-slate-600">
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-[11px] leading-snug text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function TransmissionCertificateForm({
  mediaAgencyId,
  availableBookings = [],
  onCancel,
  onCreated,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [selectedBookingType, setSelectedBookingType] = useState("");
  const [campaignRefId, setCampaignRefId] = useState("");
  const [airDate, setAirDate] = useState("");
  const [airTime, setAirTime] = useState("");
  const [stationName, setStationName] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadedFileData, setUploadedFileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const bookingId = searchParams?.get("bookingId");
    const rawType = searchParams?.get("bookingType");
    if (!bookingId) return;

    const bookingType = normalizeBookingType(rawType);
    const booking =
      availableBookings.find(
        (b) => b.id === bookingId && (!bookingType || b.type === bookingType)
      ) || availableBookings.find((b) => b.id === bookingId);

    const resolvedType = booking?.type || bookingType || "RATE_CARD";
    setSelectedBookingId(bookingId);
    setSelectedBookingType(resolvedType);
    setCampaignRefId(
      `${resolvedType}-${bookingId.substring(0, 8).toUpperCase()}`
    );
  }, [searchParams, availableBookings]);

  const resetForm = () => {
    setSelectedBookingId("");
    setSelectedBookingType("");
    setCampaignRefId("");
    setAirDate("");
    setAirTime("");
    setStationName("");
    setNotes("");
    setUploadedFileData(null);
  };

  const handleBookingChange = (value) => {
    if (value === "none") {
      setSelectedBookingId("");
      setSelectedBookingType("");
      setCampaignRefId("");
      return;
    }
    const [type, id] = value.split("|");
    setSelectedBookingId(id);
    setSelectedBookingType(type);
    setCampaignRefId(`${type}-${id.substring(0, 8).toUpperCase()}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!uploadedFileData?.url && !uploadedFileData?.key) {
      toast.error("Please upload a certificate file");
      return;
    }
    if (!airDate) {
      toast.error("Air date is required");
      return;
    }

    const finalCampaignRefId =
      campaignRefId ||
      (selectedBookingId
        ? `${selectedBookingType}-${selectedBookingId.substring(0, 8).toUpperCase()}`
        : "");
    if (!finalCampaignRefId) {
      toast.error("Select a booking or enter a campaign reference");
      return;
    }

    setIsLoading(true);
    try {
      const fileUrl =
        uploadedFileData.url ||
        (uploadedFileData.key ? `https://utfs.io/f/${uploadedFileData.key}` : null);
      if (!fileUrl) throw new Error("File URL missing — upload again");

      const response = await fetch("/api/media-agency/transmission-certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaAgencyId,
          campaignRefId: finalCampaignRefId,
          bookingId: selectedBookingId || null,
          bookingType: selectedBookingType || null,
          fileUrl,
          fileName: uploadedFileData.name || "certificate",
          fileType: uploadedFileData.type || "application/pdf",
          fileSize: uploadedFileData.size || null,
          airDate,
          airTime: airTime || null,
          stationName: stationName || null,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save certificate");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to save certificate");
      }

      toast.success("Certificate uploaded");
      resetForm();
      onCreated?.();
      router.refresh();
    } catch (error) {
      console.error("Error uploading certificate:", error);
      toast.error(error.message || "Failed to upload certificate");
    } finally {
      setIsLoading(false);
    }
  };

  const bookingValue =
    selectedBookingId && selectedBookingType
      ? `${selectedBookingType}|${selectedBookingId}`
      : "none";

  const bookingOptions = [...availableBookings];
  if (
    selectedBookingId &&
    selectedBookingType &&
    !bookingOptions.some(
      (booking) =>
        booking.id === selectedBookingId && booking.type === selectedBookingType
    )
  ) {
    bookingOptions.unshift({
      id: selectedBookingId,
      type: selectedBookingType,
      displayName: "Selected request booking",
      listingName: "From request page",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="bookingSelect"
          label="Booking"
          hint="Optional — linked certs show in the client library"
          className="sm:col-span-2"
        >
          <Select
            value={bookingValue}
            onValueChange={handleBookingChange}
            disabled={isLoading}
          >
            <SelectTrigger id="bookingSelect" className={cn(inputClass, "w-full")}>
              <div className="flex min-w-0 items-center gap-2">
                <Link2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <SelectValue placeholder="No booking" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No booking (manual)</SelectItem>
              {bookingOptions.map((booking) => (
                <SelectItem
                  key={`${booking.type}-${booking.id}`}
                  value={`${booking.type}|${booking.id}`}
                >
                  {booking.displayName}
                  {booking.listingName ? ` — ${booking.listingName}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          id="campaignRefId"
          label="Campaign reference"
          required
          hint="Auto-filled from booking when linked"
        >
          <Input
            id="campaignRefId"
            value={campaignRefId}
            onChange={(e) => setCampaignRefId(e.target.value)}
            placeholder="e.g. CAM-2024-001"
            className={inputClass}
            required
            disabled={isLoading}
          />
        </Field>

        <Field id="airDate" label="Air date" required>
          <Input
            id="airDate"
            type="date"
            value={airDate}
            onChange={(e) => setAirDate(e.target.value)}
            className={inputClass}
            required
            disabled={isLoading}
          />
        </Field>

        <Field id="airTime" label="Air time">
          <Input
            id="airTime"
            type="time"
            value={airTime}
            onChange={(e) => setAirTime(e.target.value)}
            className={inputClass}
            disabled={isLoading}
          />
        </Field>

        <Field id="stationName" label="Station">
          <Input
            id="stationName"
            value={stationName}
            onChange={(e) => setStationName(e.target.value)}
            placeholder="e.g. Joy FM, TV3"
            className={inputClass}
            disabled={isLoading}
          />
        </Field>

        <Field id="notes" label="Notes" className="sm:col-span-2">
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything the client should know…"
            rows={2}
            className="min-h-[4.5rem] resize-y rounded-xl border-slate-200 bg-[#f7f8fc] text-slate-900 shadow-none focus-visible:border-slate-950/40 focus-visible:bg-white focus-visible:ring-slate-950/15"
            disabled={isLoading}
          />
        </Field>

        <Field
          id="certificateFile"
          label="Certificate file"
          required
          className="sm:col-span-2"
        >
          <div className="rounded-2xl border border-dashed border-slate-200 bg-[#f7f8fc] p-4">
            {!uploadedFileData ? (
              <div className="flex flex-col items-center py-3 text-center">
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-950 shadow-sm ring-1 ring-slate-100">
                  <Upload className="h-4 w-4" />
                </span>
                <p className="text-sm font-medium text-slate-800">
                  PDF or image
                </p>
                <p className="mb-3 text-[11px] text-slate-400">
                  JPEG, PNG, WebP, PDF · max 10MB
                </p>
                <UploadButton
                  endpoint="transmissionCertificate"
                  onClientUploadComplete={(res) => {
                    try {
                      let fileData = null;
                      if (Array.isArray(res) && res.length > 0) {
                        const uploaded = res[0];
                        fileData = {
                          url:
                            uploaded?.url ||
                            (uploaded?.key
                              ? `https://utfs.io/f/${uploaded.key}`
                              : null),
                          key: uploaded?.key,
                          name: uploaded?.name || "certificate",
                          type: uploaded?.type || "application/pdf",
                          size: uploaded?.size || null,
                        };
                      } else if (res && typeof res === "object") {
                        fileData = {
                          url:
                            res.url ||
                            (res.key ? `https://utfs.io/f/${res.key}` : null),
                          key: res.key,
                          name: res.name || "certificate",
                          type: res.type || "application/pdf",
                          size: res.size || null,
                        };
                      }
                      if (fileData?.url) {
                        setUploadedFileData(fileData);
                        toast.success("File ready");
                      } else {
                        toast.error("Upload finished but URL missing — try again");
                      }
                    } catch (error) {
                      console.error("Error processing upload:", error);
                      toast.error("Could not process upload");
                    }
                  }}
                  onUploadError={(err) => {
                    toast.error(err.message || "Upload failed");
                  }}
                  appearance={{
                    button:
                      "ut-ready:bg-slate-950 ut-uploading:cursor-not-allowed h-9 rounded-full bg-slate-950 px-4 text-xs font-semibold text-white after:bg-slate-800",
                    allowedContent: "hidden",
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {uploadedFileData.type?.startsWith("image/") ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200">
                      <Image
                        src={uploadedFileData.url}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white">
                      <FileText className="h-5 w-5 text-slate-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {uploadedFileData.name || "Uploaded file"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {uploadedFileData.size
                        ? `${(uploadedFileData.size / 1024).toFixed(1)} KB`
                        : "Ready to save"}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-full text-slate-500 hover:bg-white"
                  onClick={() => setUploadedFileData(null)}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isLoading}
            onClick={() => {
              resetForm();
              onCancel();
            }}
            className="h-10 rounded-full px-5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="mr-1.5 h-4 w-4" />
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={isLoading}
          className="h-10 rounded-full bg-slate-950 px-6 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Save certificate
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
