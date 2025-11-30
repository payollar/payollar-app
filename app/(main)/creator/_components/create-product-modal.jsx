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
import { Loader2, Sparkles, Package } from "lucide-react";
import { createDigitalProduct } from "@/actions/products";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

const PRODUCT_CATEGORIES = [
  "Music",
  "Video",
  "Course",
  "Template",
  "Art",
  "Photography",
  "Document",
  "Software",
  "Other",
];

export function CreateProductModal({ open, onOpenChange }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
    fileUrl: "",
    fileType: "",
    status: "DRAFT",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.price || !formData.fileUrl) {
      toast.error("Title, description, price, and file are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitFormData = new FormData();
      submitFormData.append("title", formData.title);
      submitFormData.append("description", formData.description);
      submitFormData.append("price", formData.price);
      submitFormData.append("category", formData.category || "");
      submitFormData.append("imageUrl", formData.imageUrl || "");
      submitFormData.append("fileUrl", formData.fileUrl);
      submitFormData.append("fileType", formData.fileType || "");
      submitFormData.append("status", formData.status);

      const result = await createDigitalProduct(submitFormData);

      if (result?.success) {
        toast.success("Product created successfully!");
        onOpenChange(false);
        // Reset form
        setFormData({
          title: "",
          description: "",
          price: "",
          category: "",
          imageUrl: "",
          fileUrl: "",
          fileType: "",
          status: "DRAFT",
        });
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Create Digital Product
          </DialogTitle>
          <DialogDescription>
            Upload and sell your digital products. You'll receive 99% of each sale directly to your bank account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Product Title & Category */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">
                Product Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="e.g., Premium Music Pack"
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
                  {PRODUCT_CATEGORIES.map((cat) => (
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
              Product Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={5}
              className="bg-gray-800 border-gray-700 text-white resize-none"
              placeholder="Describe your product, what buyers will receive, and what makes it special..."
              required
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-gray-300">
              Price (USD) *
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="0.00"
              required
            />
            <p className="text-xs text-muted-foreground">
              You'll receive 99% of the sale price. Platform fee is 1%.
            </p>
          </div>

          {/* Product Image */}
          <div className="space-y-2">
            <Label className="text-gray-300">Product Image</Label>
            <div className="space-y-3">
              {formData.imageUrl && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-700">
                  <Image
                    src={formData.imageUrl}
                    alt="Product preview"
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

          {/* Digital File Upload */}
          <div className="space-y-2">
            <Label className="text-gray-300">Digital File *</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Upload the digital file that buyers will download (MP3, MP4, PDF, ZIP, etc.)
            </p>
            <UploadButton
              endpoint="portfolioUploader"
              onClientUploadComplete={(res) => {
                if (res && res[0]?.url) {
                  handleInputChange("fileUrl", res[0].url);
                  handleInputChange("fileType", res[0].type || "");
                  toast.success("File uploaded successfully");
                }
              }}
              onUploadError={(error) => {
                toast.error(`Upload failed: ${error.message}`);
              }}
            />
            {formData.fileUrl && (
              <p className="text-sm text-emerald-400 mt-2">
                ✓ File uploaded successfully
              </p>
            )}
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
              disabled={isSubmitting || !formData.title || !formData.description || !formData.price || !formData.fileUrl}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  {formData.status === "ACTIVE" ? "Publish Product" : "Save as Draft"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

