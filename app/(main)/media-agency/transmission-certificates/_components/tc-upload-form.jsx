"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Upload, X, FileText } from "lucide-react";
import { UploadButton } from "@uploadthing/react";
import Image from "next/image";

export function TransmissionCertificateForm({ mediaAgencyId }) {
  const [campaignRefId, setCampaignRefId] = useState("");
  const [airDate, setAirDate] = useState("");
  const [airTime, setAirTime] = useState("");
  const [stationName, setStationName] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadedFileData, setUploadedFileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!uploadedFileData) {
      toast.error("Please upload a file first");
      return;
    }

    if (!campaignRefId || !airDate) {
      toast.error("Please fill in Campaign Reference ID and Air Date");
      return;
    }

    setIsLoading(true);

    try {
      // Save certificate data
      const response = await fetch("/api/media-agency/transmission-certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaAgencyId,
          campaignRefId,
          fileUrl: uploadedFileData.url,
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

      toast.success("Transmission certificate uploaded successfully!");
      
      // Reset form
      setCampaignRefId("");
      setAirDate("");
      setAirTime("");
      setStationName("");
      setNotes("");
      setUploadedFileData(null);

      window.location.reload();
    } catch (error) {
      console.error("Error uploading certificate:", error);
      toast.error(error.message || "Failed to upload transmission certificate");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                    
                    if (Array.isArray(res) && res.length > 0) {
                      const uploaded = res[0];
                      fileData = {
                        url: uploaded?.key ? `https://utfs.io/f/${uploaded.key}` : uploaded?.url,
                        name: uploaded?.name,
                        type: uploaded?.type,
                        size: uploaded?.size,
                      };
                    } else if (res && typeof res === 'object' && !Array.isArray(res)) {
                      fileData = {
                        url: res.key ? `https://utfs.io/f/${res.key}` : res.url,
                        name: res.name,
                        type: res.type,
                        size: res.size,
                      };
                    }
                    
                    if (fileData?.url) {
                      setUploadedFileData(fileData);
                      toast.success("File uploaded successfully");
                    } else {
                      toast.error("Upload completed but file data not found");
                    }
                  } catch (error) {
                    console.error("Error processing upload:", error);
                    toast.error("Error processing upload");
                  }
                }}
                onUploadError={(err) => {
                  console.error("Upload error:", err);
                  toast.error(`Upload failed: ${err.message || "Please try again."}`);
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
