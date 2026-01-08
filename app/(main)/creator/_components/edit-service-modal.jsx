"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Briefcase } from "lucide-react";
import { updateService } from "@/actions/services";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

  // Initialize form data when service changes
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Edit Service
          </DialogTitle>
          <DialogDescription>
            Update your service information. Changes will be reflected immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Service Title & Category */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">
                Service Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="e.g., Music Production Consultation"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-300">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              Service Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className="bg-gray-800 border-gray-700 text-white resize-none"
              placeholder="Describe your service..."
            />
          </div>

          {/* Rate & Rate Type */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rate" className="text-gray-300">
                Rate (GHS) *
              </Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.rate}
                onChange={(e) => handleInputChange("rate", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rateType" className="text-gray-300">
                Rate Type *
              </Label>
              <Select
                value={formData.rateType}
                onValueChange={(value) => handleInputChange("rateType", value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PER_HOUR">Per Hour</SelectItem>
                  <SelectItem value="PER_SESSION">Per Session</SelectItem>
                  <SelectItem value="FIXED">Fixed Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration (optional, for sessions) */}
          {formData.rateType === "PER_SESSION" && (
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-gray-300">
                Duration (minutes)
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="e.g., 60"
              />
              <p className="text-xs text-muted-foreground">
                How long does this service typically take?
              </p>
            </div>
          )}

          {/* Active Status */}
          <div className="space-y-2">
            <Label htmlFor="isActive" className="text-gray-300">
              Status
            </Label>
            <Select
              value={formData.isActive.toString()}
              onValueChange={(value) => handleInputChange("isActive", value === "true")}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active (Visible to clients)</SelectItem>
                <SelectItem value="false">Inactive (Hidden from clients)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-gray-700"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.rate}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Update Service
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
