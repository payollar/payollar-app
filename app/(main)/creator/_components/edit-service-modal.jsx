"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { UploadButton } from "@uploadthing/react";
import { Loader2, Briefcase, ImageIcon, X } from "lucide-react";
import { updateService } from "@/actions/services";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { uploadThingResultToUrl } from "@/lib/utils";

const SERVICE_CATEGORIES = [
  "Consultation",
  "Performance",
  "Content Creation",
  "Music Production",
  "Video Production",
  "Photography",
  "Writing",
  "Design",
  "Coaching",
  "Tutoring",
  "Other",
];

const inputClass =
  "border-border/60 bg-background text-foreground placeholder:text-muted-foreground";

export function EditServiceModal({ open, onOpenChange, service }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    rate: "",
    rateType: "PER_HOUR",
    duration: "",
    category: "",
    isActive: true,
  });
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || "",
        description: service.description || "",
        rate: service.rate?.toString() || "",
        rateType: service.rateType || "PER_HOUR",
        duration: service.duration?.toString() || "",
        category: service.category || "",
        isActive: service.isActive ?? true,
      });
      setImageUrl(service.imageUrl || null);
    }
  }, [service]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.rate) {
      toast.error("Title and rate are required");
      return;
    }

    const rate = parseFloat(formData.rate);
    if (isNaN(rate) || rate <= 0) {
      toast.error("Rate must be a positive number");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitFormData = new FormData();
      submitFormData.append("serviceId", service.id);
      submitFormData.append("title", formData.title);
      submitFormData.append("description", formData.description || "");
      submitFormData.append("rate", formData.rate);
      submitFormData.append("rateType", formData.rateType);
      submitFormData.append("duration", formData.duration || "");
      submitFormData.append("category", formData.category || "");
      submitFormData.append("isActive", formData.isActive.toString());
      submitFormData.append("imageUrl", imageUrl || "");

      const result = await updateService(submitFormData);

      if (result?.success) {
        toast.success("Service updated successfully!");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result?.error || "Failed to update service");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update service");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-border/60 bg-card/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Edit service</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your service information. Changes will be reflected immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-muted-foreground">
                Service title *
              </Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={inputClass}
                placeholder="e.g., Music production consultation"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-muted-foreground">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-muted-foreground">
              Service description
            </Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="Describe your service..."
            />
          </div>

          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-start gap-2">
              <ImageIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <Label className="text-foreground">Service image (optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Cover image for this listing. Your profile photo is always shown on the card.
                </p>
              </div>
            </div>
            {imageUrl ? (
              <div className="relative aspect-[2/1] max-h-44 w-full overflow-hidden rounded-lg border border-border/60 bg-muted">
                <Image src={imageUrl} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, 640px" />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 rounded-full shadow-md"
                  onClick={() => setImageUrl(null)}
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <UploadButton
                endpoint="serviceImage"
                onClientUploadComplete={(res) => {
                  const url = uploadThingResultToUrl(res);
                  if (url) {
                    setImageUrl(url);
                    toast.success("Image uploaded");
                  } else {
                    toast.error("Upload completed but URL was not found");
                  }
                }}
                onUploadError={(err) => {
                  console.error(err);
                  toast.error(err?.message || "Upload failed");
                }}
              />
            )}
            <p className="text-xs text-muted-foreground">JPG, PNG, or WebP. Max 4MB.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-rate" className="text-muted-foreground">
                Rate (GHS) *
              </Label>
              <Input
                id="edit-rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.rate}
                onChange={(e) => handleInputChange("rate", e.target.value)}
                className={inputClass}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rateType" className="text-muted-foreground">
                Rate type *
              </Label>
              <Select
                value={formData.rateType}
                onValueChange={(value) => handleInputChange("rateType", value)}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PER_HOUR">Per hour</SelectItem>
                  <SelectItem value="PER_SESSION">Per session</SelectItem>
                  <SelectItem value="FIXED">Fixed price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.rateType === "PER_SESSION" && (
            <div className="space-y-2">
              <Label htmlFor="edit-duration" className="text-muted-foreground">
                Duration (minutes)
              </Label>
              <Input
                id="edit-duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                className={inputClass}
                placeholder="e.g., 60"
              />
              <p className="text-xs text-muted-foreground">How long does this service typically take?</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-isActive" className="text-muted-foreground">
              Status
            </Label>
            <Select
              value={formData.isActive.toString()}
              onValueChange={(value) => handleInputChange("isActive", value === "true")}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active (visible to clients)</SelectItem>
                <SelectItem value="false">Inactive (hidden from clients)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="glass"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="marketing"
              className="flex-1"
              disabled={isSubmitting || !formData.title || !formData.rate}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Update service
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
