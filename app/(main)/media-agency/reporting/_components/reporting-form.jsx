"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Link2, Loader2, X } from "lucide-react";
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
  "h-10 rounded-xl border-slate-200 bg-[#f7f8fc] text-slate-900 shadow-none focus-visible:border-[#0055ff]/40 focus-visible:bg-white focus-visible:ring-[#0055ff]/15";

const REPORT_TYPES = [
  { value: "BOOKING_SUMMARY", label: "Booking summary" },
  { value: "PERFORMANCE", label: "Performance" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUAL", label: "Annual" },
  { value: "CUSTOM", label: "Custom" },
];

function Field({ id, label, children, hint, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium text-slate-600">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-[11px] leading-snug text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function ReportingForm({
  mediaAgencyId,
  availableBookings = [],
  onCancel,
  onCreated,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("");
  const [reportType, setReportType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [content, setContent] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [selectedBookingType, setSelectedBookingType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const bookingId = searchParams?.get("bookingId");
    const bookingType = searchParams?.get("bookingType");
    if (bookingId && bookingType) {
      const booking = availableBookings.find(
        (b) => b.id === bookingId && b.type === bookingType
      );
      if (booking) {
        setSelectedBookingId(bookingId);
        setSelectedBookingType(bookingType);
      }
    }
  }, [searchParams, availableBookings]);

  const resetForm = () => {
    setTitle("");
    setReportType("");
    setStartDate("");
    setEndDate("");
    setContent("");
    setSelectedBookingId("");
    setSelectedBookingType("");
  };

  const handleBookingChange = (value) => {
    if (value === "none") {
      setSelectedBookingId("");
      setSelectedBookingType("");
      return;
    }
    const [type, id] = value.split("|");
    setSelectedBookingId(id);
    setSelectedBookingType(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !reportType || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/media-agency/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaAgencyId,
          title,
          reportType,
          startDate,
          endDate,
          content,
          bookingId: selectedBookingId || null,
          bookingType: selectedBookingType || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create report");
      }

      toast.success("Report created");
      resetForm();
      onCreated?.();
      router.refresh();
    } catch (error) {
      console.error("Error creating report:", error);
      toast.error("Failed to create report");
    } finally {
      setIsLoading(false);
    }
  };

  const bookingValue =
    selectedBookingId && selectedBookingType
      ? `${selectedBookingType}|${selectedBookingId}`
      : "none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="title" label="Title" className="sm:col-span-2">
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q1 performance — Joy FM"
            className={inputClass}
            required
          />
        </Field>

        <Field id="reportType" label="Type">
          <Select value={reportType} onValueChange={setReportType} required>
            <SelectTrigger id="reportType" className={cn(inputClass, "w-full")}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          id="bookingSelect"
          label="Booking"
          hint={availableBookings.length ? "Optional link for the client library" : "No bookings to link yet"}
        >
          <Select
            value={bookingValue}
            onValueChange={handleBookingChange}
            disabled={isLoading}
          >
            <SelectTrigger id="bookingSelect" className={cn(inputClass, "w-full")}>
              <div className="flex min-w-0 items-center gap-2">
                <Link2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <SelectValue placeholder="None" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No booking</SelectItem>
              {availableBookings.map((booking) => (
                <SelectItem
                  key={`${booking.type}-${booking.id}`}
                  value={`${booking.type}|${booking.id}`}
                >
                  {booking.displayName} — {booking.listingName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field id="startDate" label="Start">
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
            required
          />
        </Field>
        <Field id="endDate" label="End">
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
            required
          />
        </Field>

        <Field id="content" label="Notes & metrics" className="sm:col-span-2">
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Impressions, delivery notes, key results…"
            rows={3}
            className="min-h-[5.5rem] resize-y rounded-xl border-slate-200 bg-[#f7f8fc] text-slate-900 shadow-none focus-visible:border-[#0055ff]/40 focus-visible:bg-white focus-visible:ring-[#0055ff]/15"
          />
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
          className="h-10 rounded-full bg-[#0055ff] px-6 text-sm font-semibold text-white hover:bg-[#003ecc]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save report"
          )}
        </Button>
      </div>
    </form>
  );
}
