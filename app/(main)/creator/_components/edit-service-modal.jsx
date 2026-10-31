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
import { UploadButton } from "@uploadthing/react";
import { ImageIcon, Loader2, X } from "lucide-react";
import { updateService } from "@/actions/services";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn, uploadThingResultToUrl } from "@/lib/utils";

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

const fieldClass =
  "h-11 rounded-xl border border-slate-300 bg-white text-sm text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20";

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

  const categories =
    formData.category && !SERVICE_CATEGORIES.includes(formData.category)
      ? [formData.category, ...SERVICE_CATEGORIES]
      : SERVICE_CATEGORIES;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,820px)] w-full flex-col gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 text-slate-900 shadow-2xl sm:max-w-2xl">
        <DialogHeader className="space-y-1 border-b border-slate-100 px-6 py-5 pr-12 text-left">
          <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950">Edit service</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Update the offer. Clients see the new details as soon as you save.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <section className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[#0055ff]">Offer</p>
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-slate-700">
                  Service title <span className="text-[#0055ff]">*</span>
                </Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={fieldClass}
                  placeholder="Music production session"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Category</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const selected = formData.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleInputChange("category", selected ? "" : cat)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm transition-colors",
                          selected
                            ? "border-[#0055ff] bg-[#0055ff] text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                        )}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-slate-700">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  className="min-h-28 resize-none rounded-xl border border-slate-300 bg-white text-sm text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20"
                  placeholder="What the client gets, and how long it usually takes."
                />
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-[#0055ff]">Cover</p>
              <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 sm:flex-row sm:items-center">
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-white sm:w-40">
                  {imageUrl ? (
                    <Image src={imageUrl} alt="" fill className="object-cover" sizes="160px" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-400">
                      <ImageIcon className="h-5 w-5" />
                      <span className="text-xs">No cover yet</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-sm text-slate-500">
                    Optional. Your profile photo still shows on the card.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <UploadButton
                      endpoint="serviceImage"
                      appearance={{
                        container: "w-auto items-start",
                        button: "h-10 rounded-xl bg-[#0055ff] px-4 text-sm font-medium text-white",
                        allowedContent: "text-xs text-slate-400",
                      }}
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
                    {imageUrl ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-xl border-slate-300"
                        onClick={() => setImageUrl(null)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Remove
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[#0055ff]">Price</p>
              <div className="space-y-2">
                <Label htmlFor="edit-rate" className="text-slate-700">
                  Rate (₵) <span className="text-[#0055ff]">*</span>
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₵</span>
                  <Input
                    id="edit-rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.rate}
                    onChange={(e) => handleInputChange("rate", e.target.value)}
                    className={cn(fieldClass, "pl-8")}
                    placeholder="1000"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Charge</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {[
                    { value: "PER_HOUR", label: "Per hour" },
                    { value: "PER_SESSION", label: "Per session" },
                    { value: "FIXED", label: "Fixed price" },
                  ].map((option) => {
                    const selected = formData.rateType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange("rateType", option.value)}
                        className={cn(
                          "h-11 rounded-xl border text-sm font-medium transition-colors",
                          selected
                            ? "border-[#0055ff] bg-[#0055ff]/[0.06] text-[#0055ff]"
                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {formData.rateType === "PER_SESSION" ? (
                <div className="space-y-2">
                  <Label htmlFor="edit-duration" className="text-slate-700">Session length (minutes)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    className={fieldClass}
                    placeholder="60"
                  />
                </div>
              ) : null}
            </section>

            <section className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-[#0055ff]">Visibility</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: true, title: "Active", detail: "Clients can see and book this service." },
                  { value: false, title: "Hidden", detail: "Keep it off your public profile for now." },
                ].map((option) => {
                  const selected = formData.isActive === option.value;
                  return (
                    <button
                      key={option.title}
                      type="button"
                      onClick={() => handleInputChange("isActive", option.value)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left transition-colors",
                        selected
                          ? "border-[#0055ff] bg-[#0055ff]/[0.06]"
                          : "border-slate-300 bg-white hover:border-slate-400"
                      )}
                    >
                      <span className="block text-sm font-medium text-slate-950">{option.title}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{option.detail}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-slate-300 text-slate-700"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="marketing"
              className="h-11 rounded-xl px-5"
              disabled={isSubmitting || !formData.title || !formData.rate}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Update service"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
