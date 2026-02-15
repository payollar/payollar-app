"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ReportingForm({ mediaAgencyId, availableBookings = [] }) {
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("");
  const [reportType, setReportType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [content, setContent] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [selectedBookingType, setSelectedBookingType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-select booking from URL params
  useEffect(() => {
    const bookingId = searchParams?.get("bookingId");
    const bookingType = searchParams?.get("bookingType");
    if (bookingId && bookingType) {
      const booking = availableBookings.find((b) => b.id === bookingId && b.type === bookingType);
      if (booking) {
        setSelectedBookingId(bookingId);
        setSelectedBookingType(bookingType);
      }
    }
  }, [searchParams, availableBookings]);

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

      toast.success("Report created successfully!");
      setTitle("");
      setReportType("");
      setStartDate("");
      setEndDate("");
      setContent("");
      setSelectedBookingId("");
      setSelectedBookingType("");
      window.location.reload();
    } catch (error) {
      console.error("Error creating report:", error);
      toast.error("Failed to create report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bookingSelect">
          Link to Booking (Optional)
        </Label>
        <Select 
          value={selectedBookingId && selectedBookingType ? `${selectedBookingType}|${selectedBookingId}` : "none"}
          onValueChange={handleBookingChange}
          disabled={isLoading}
        >
          <SelectTrigger id="bookingSelect">
            <SelectValue placeholder="Select a booking to link this report" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No booking (general report)</SelectItem>
            {availableBookings.length === 0 ? (
              <SelectItem value="no-bookings" disabled>
                No confirmed/completed bookings available
              </SelectItem>
            ) : (
              availableBookings.map((booking) => (
                <SelectItem key={`${booking.type}-${booking.id}`} value={`${booking.type}|${booking.id}`}>
                  {booking.displayName} ({booking.status}) - {booking.listingName}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Select a confirmed or completed booking to link this report. The client will see it in their media library.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Report Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Q1 2024 Performance Report"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reportType">Report Type</Label>
        <Select value={reportType} onValueChange={setReportType} required>
          <SelectTrigger>
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BOOKING_SUMMARY">Booking Summary</SelectItem>
            <SelectItem value="PERFORMANCE">Performance</SelectItem>
            <SelectItem value="MONTHLY">Monthly</SelectItem>
            <SelectItem value="QUARTERLY">Quarterly</SelectItem>
            <SelectItem value="ANNUAL">Annual</SelectItem>
            <SelectItem value="CUSTOM">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Report Content (Optional)</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter report details, metrics, or notes..."
          rows={6}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Report"
        )}
      </Button>
    </form>
  );
}
