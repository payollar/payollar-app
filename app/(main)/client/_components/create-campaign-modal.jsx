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
import { UploadButton } from "@uploadthing/react";
import { Loader2, X, Plus, Sparkles } from "lucide-react";
import { createCampaign } from "@/actions/campaigns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

const CAMPAIGN_CATEGORIES = [
  "TV Media",
  "Radio Media",
  "Digital Media",
  "Billboard Media",
  "Influencer Marketing",
  "Video Clipping",
];

const LOCATIONS = [
  "Accra",
  "Kumasi",
  "Takoradi",
  "Tamale",
  "Cape Coast",
  "Nationwide",
  "Multiple Cities",
];

export function CreateCampaignModal({ open, onOpenChange }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requirements, setRequirements] = useState([]);
  const [newRequirement, setNewRequirement] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    description: "",
    category: "",
    budgetMin: "",
    budgetMax: "",
    location: "",
    deadline: "",
    imageUrl: "",
    status: "DRAFT",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements((prev) => [...prev, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index) => {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.brand || !formData.description || !formData.category || !formData.location || !formData.deadline) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitFormData = new FormData();
      submitFormData.append("title", formData.title);
      submitFormData.append("brand", formData.brand);
      submitFormData.append("description", formData.description);
      submitFormData.append("category", formData.category);
      submitFormData.append("budgetMin", formData.budgetMin || "");
      submitFormData.append("budgetMax", formData.budgetMax || "");
      submitFormData.append("location", formData.location);
      submitFormData.append("deadline", formData.deadline);
      submitFormData.append("imageUrl", formData.imageUrl || "");
      submitFormData.append("requirements", JSON.stringify(requirements));
      submitFormData.append("status", formData.status);

      const result = await createCampaign(submitFormData);

      if (result?.success) {
        toast.success("Campaign created successfully!");
        onOpenChange(false);
        // Reset form
        setFormData({
          title: "",
          brand: "",
          description: "",
          category: "",
          budgetMin: "",
          budgetMax: "",
          location: "",
          deadline: "",
          imageUrl: "",
          status: "DRAFT",
        });
        setRequirements([]);
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Create New Campaign
          </DialogTitle>
          <DialogDescription>
            Fill in the details to create a campaign and attract talented creators
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Campaign Title & Brand */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">
                Campaign Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="e.g., Tech Product Launch Campaign"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-gray-300">
                Brand/Company Name *
              </Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Your company name"
                required
              />
            </div>
          </div>

          {/* Category & Location */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-300">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                required
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CAMPAIGN_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-gray-300">
                Location *
              </Label>
              <Select
                value={formData.location}
                onValueChange={(value) => handleInputChange("location", value)}
                required
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              Campaign Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={5}
              className="bg-gray-800 border-gray-700 text-white resize-none"
              placeholder="Describe your campaign, what you're looking for, and what creators can expect..."
              required
            />
          </div>

          {/* Budget Range */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetMin" className="text-gray-300">
                Minimum Budget (₵)
              </Label>
              <Input
                id="budgetMin"
                type="number"
                value={formData.budgetMin}
                onChange={(e) => handleInputChange("budgetMin", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="5000"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetMax" className="text-gray-300">
                Maximum Budget (₵)
              </Label>
              <Input
                id="budgetMax"
                type="number"
                value={formData.budgetMax}
                onChange={(e) => handleInputChange("budgetMax", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="15000"
                min="0"
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline" className="text-gray-300">
              Application Deadline *
            </Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => handleInputChange("deadline", e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Campaign Image */}
          <div className="space-y-2">
            <Label className="text-gray-300">Campaign Image</Label>
            <div className="space-y-3">
              {formData.imageUrl && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-700">
                  <Image
                    src={formData.imageUrl}
                    alt="Campaign preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <UploadButton
                endpoint="portfolioUploader"
                onClientUploadComplete={(res) => {
                  if (res && res[0]?.url) {
                    handleInputChange("imageUrl", res[0].url);
                    toast.success("Image uploaded successfully");
                  }
                }}
                onUploadError={(error) => {
                  toast.error(`Upload failed: ${error.message}`);
                }}
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label className="text-gray-300">Requirements</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRequirement();
                    }
                  }}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="e.g., 10K+ followers, Instagram & TikTok"
                />
                <Button
                  type="button"
                  onClick={addRequirement}
                  disabled={!newRequirement.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {requirements.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {requirements.map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full border border-gray-700"
                    >
                      <span className="text-white text-sm">{req}</span>
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-gray-300">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft (Save for later)</SelectItem>
                <SelectItem value="ACTIVE">Active (Publish now)</SelectItem>
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
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {formData.status === "ACTIVE" ? "Publish Campaign" : "Save as Draft"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}