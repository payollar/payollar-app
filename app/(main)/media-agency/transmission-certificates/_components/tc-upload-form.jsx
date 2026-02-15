"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload, X, FileText } from "lucide-react";
import { UploadButton } from "@uploadthing/react";
import Image from "next/image";

export function TransmissionCertificateForm({ mediaAgencyId, availableBookings = [] }) {
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

  // Auto-select booking from URL params
  useEffect(() => {
    const bookingId = searchParams?.get("bookingId");
    const bookingType = searchParams?.get("bookingType");
    if (bookingId && bookingType) {
      const booking = availableBookings.find((b) => b.id === bookingId && b.type === bookingType);
      if (booking) {
        setSelectedBookingId(bookingId);
        setSelectedBookingType(bookingType);
        setCampaignRefId(`${bookingType}-${bookingId.substring(0, 8).toUpperCase()}`);
      }
    }
  }, [searchParams, availableBookings]);

  // Auto-fill campaignRefId when booking is selected
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
    
    // Auto-generate campaign ref ID from booking
    const booking = availableBookings.find((b) => b.id === id && b.type === type);
    if (booking) {
      // Use booking ID as campaign ref, or generate one
      setCampaignRefId(`${type}-${id.substring(0, 8).toUpperCase()}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!uploadedFileData) {
      toast.error("Please upload a file first");
      return;
    }

    if (!uploadedFileData.url) {
      toast.error("File upload incomplete. Please upload the file again.");
      return;
    }

    if (!airDate) {
      toast.error("Please fill in Air Date");
      return;
    }

    // CampaignRefId is required, but can be auto-generated from booking
    const finalCampaignRefId = campaignRefId || (selectedBookingId ? `${selectedBookingType}-${selectedBookingId.substring(0, 8).toUpperCase()}` : "");
    if (!finalCampaignRefId) {
      toast.error("Please select a booking or enter a Campaign Reference ID");
      return;
    }

    setIsLoading(true);

    try {
      // Ensure we have a valid file URL
      const fileUrl = uploadedFileData.url || (uploadedFileData.key ? `https://utfs.io/f/${uploadedFileData.key}` : null);
      
      if (!fileUrl) {
        throw new Error("File URL is missing. Please upload the file again.");
      }

      // Save certificate data
      const response = await fetch("/api/media-agency/transmission-certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaAgencyId,
          campaignRefId: finalCampaignRefId,
          bookingId: selectedBookingId || null,
          bookingType: selectedBookingType || null,
          fileUrl: fileUrl,
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
      
      if (result.success) {
        toast.success("Transmission certificate uploaded successfully!");
        
        // Reset form
        setSelectedBookingId("");
        setSelectedBookingType("");
        setCampaignRefId("");
        setAirDate("");
        setAirTime("");
        setStationName("");
        setNotes("");
        setUploadedFileData(null);

        // Reload after a short delay to show success message
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error(result.error || "Failed to save certificate");
      }
    } catch (error) {
      console.error("Error uploading certificate:", error);
      toast.error(error.message || "Failed to upload transmission certificate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            <SelectValue placeholder="Select a booking to link this certificate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No booking (manual entry)</SelectItem>
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
          Select a confirmed or completed booking to automatically link this certificate. The client will see it in their media library.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="campaignRefId">
            Campaign Reference ID <span className="text-red-500">*</span>
          </Label>
          <Input
            id="campaignRefId"
            value={campaignRefId}
            onChange={(e) => setCampaignRefId(e.target.value)}
            placeholder="e.g., CAM-2024-001"
            required
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Auto-filled when booking is selected, or enter manually
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="airDate">
            Air Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="airDate"
            type="date"
            value={airDate}
            onChange={(e) => setAirDate(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="airTime">Air Time</Label>
          <Input
            id="airTime"
            type="time"
            value={airTime}
            onChange={(e) => setAirTime(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stationName">Station Name</Label>
          <Input
            id="stationName"
            value={stationName}
            onChange={(e) => setStationName(e.target.value)}
            placeholder="e.g., Joy FM, TV3"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes about this transmission..."
          rows={3}
            disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label>
          Certificate File (PDF or Image) <span className="text-red-500">*</span>
        </Label>
        <div className="border-2 border-dashed rounded-lg p-6">
          {!uploadedFileData ? (
            <div className="text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Upload PDF or image file
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                PDF, JPEG, PNG, WebP (Max 10MB)
              </p>
              <UploadButton
                endpoint="transmissionCertificate"
                onClientUploadComplete={(res) => {
                  try {
                    let fileData = null;
                    
                    // Handle array response
                    if (Array.isArray(res) && res.length > 0) {
                      const uploaded = res[0];
                      fileData = {
                        url: uploaded?.url || (uploaded?.key ? `https://utfs.io/f/${uploaded.key}` : null),
                        key: uploaded?.key,
                        name: uploaded?.name || "certificate",
                        type: uploaded?.type || "application/pdf",
                        size: uploaded?.size || null,
                      };
                    } 
                    // Handle single object response
                    else if (res && typeof res === 'object' && !Array.isArray(res)) {
                      fileData = {
                        url: res.url || (res.key ? `https://utfs.io/f/${res.key}` : null),
                        key: res.key,
                        name: res.name || "certificate",
                        type: res.type || "application/pdf",
                        size: res.size || null,
                      };
                    }
                    
                    if (fileData?.url) {
                      setUploadedFileData(fileData);
                      toast.success("File uploaded successfully! You can now submit the form.");
                    } else {
                      console.error("Upload response:", res);
                      toast.error("Upload completed but file URL not found. Please try uploading again.");
                    }
                  } catch (error) {
                    console.error("Error processing upload:", error);
                    toast.error("Error processing upload. Please try again.");
                  }
                }}
                onUploadError={(err) => {
                  console.error("Upload error:", err);
                  toast.error(`Upload failed: ${err.message || "Please check your connection and try again."}`);
                }}
                onUploadBegin={(name) => {
                  toast.info(`Uploading ${name}...`);
                }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {uploadedFileData.type?.startsWith("image/") ? (
                    <div className="relative w-16 h-16 rounded border overflow-hidden">
                      <Image
                        src={uploadedFileData.url}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded border flex items-center justify-center bg-muted">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{uploadedFileData.name || "Uploaded file"}</p>
                    <p className="text-xs text-muted-foreground">
                      {uploadedFileData.size ? `${(uploadedFileData.size / 1024).toFixed(1)} KB` : "File uploaded"}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUploadedFileData(null);
                  }}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Certificate
          </>
        )}
      </Button>
    </form>
  );
}
