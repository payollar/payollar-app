"use client";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { createService } from "@/actions/services";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SERVICE_CATEGORIES } from "@/lib/service-categories";

const CHARGE_OPTIONS = [
  { value: "PER_HOUR", label: "Per hour" },
  { value: "PER_SESSION", label: "Per session" },
  { value: "FIXED", label: "Fixed price" },
];

const fieldClass =
  "h-11 rounded-xl border border-slate-300 bg-white text-sm text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20";

export function CreateServiceModal({ open, onOpenChange }) {
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
      submitFormData.append("title", formData.title);
      submitFormData.append("description", formData.description || "");
      submitFormData.append("rate", formData.rate);
      submitFormData.append("rateType", formData.rateType);
      submitFormData.append("duration", formData.duration || "");
      submitFormData.append("category", formData.category || "");
      submitFormData.append("isActive", formData.isActive.toString());

      const result = await createService(submitFormData);

      if (result?.success) {
        toast.success("Service created successfully!");
        onOpenChange(false);
        setFormData({
          title: "",
          description: "",
          rate: "",
          rateType: "PER_HOUR",
          duration: "",
          category: "",
          isActive: true,
        });
        router.refresh();
      } else {
        toast.error(result?.error || "Failed to create service");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create service");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,820px)] w-full flex-col gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 text-slate-900 shadow-2xl sm:max-w-2xl">
        <DialogHeader className="space-y-1 border-b border-slate-100 px-6 py-5 pr-12 text-left">
          <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950">Create service</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Name the offer, set the rate, and choose whether clients can book it now.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <section className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[#0055ff]">Offer</p>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-700">
                  Service title <span className="text-[#0055ff]">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={fieldClass}
                  placeholder="Music production session"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-700">
                  Category
                </Label>
                <Select
                  value={formData.category || undefined}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger
                    id="category"
                    className={cn(fieldClass, "w-full justify-between shadow-none")}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 bg-white text-slate-900">
                    {SERVICE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  className="min-h-28 resize-none rounded-xl border border-slate-300 bg-white text-sm text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20"
                  placeholder="What the client gets, and how long it usually takes."
                />
              </div>
            </section>

            <section className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[#0055ff]">Price</p>
              <div className="space-y-2">
                <Label htmlFor="rate" className="text-slate-700">
                  Rate (₵) <span className="text-[#0055ff]">*</span>
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₵</span>
                  <Input
                    id="rate"
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
                <Label htmlFor="rateType" className="text-slate-700">
                  Charge
                </Label>
                <Select
                  value={formData.rateType}
                  onValueChange={(value) => handleInputChange("rateType", value)}
                >
                  <SelectTrigger
                    id="rateType"
                    className={cn(fieldClass, "w-full justify-between shadow-none")}
                  >
                    <SelectValue placeholder="How you charge" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 bg-white text-slate-900">
                    {CHARGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.rateType === "PER_SESSION" ? (
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-slate-700">Session length (minutes)</Label>
                  <Input
                    id="duration"
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
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-950">
                    {formData.isActive ? "Active" : "Hidden"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formData.isActive
                      ? "Clients can see and book this service."
                      : "Keep it off your public profile for now."}
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  size="lg"
                  className="shrink-0 data-[state=checked]:bg-[#0055ff] data-[state=unchecked]:bg-slate-300"
                  aria-label="Toggle service visibility"
                />
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
              variant="black"
              className="h-11 rounded-xl px-5"
              disabled={isSubmitting || !formData.title || !formData.rate}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Create service"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
