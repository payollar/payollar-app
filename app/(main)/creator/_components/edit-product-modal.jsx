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
import { UploadButton } from "@uploadthing/react";
import { Loader2, Package } from "lucide-react";
import { updateDigitalProduct } from "@/actions/products";
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

export function EditProductModal({ open, onOpenChange, product }) {
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

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        category: product.category || "",
        imageUrl: product.imageUrl || "",
        fileUrl: product.fileUrl || "",
        fileType: product.fileType || "",
        status: product.status || "DRAFT",
      });
    }
  }, [product]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.price) {
      toast.error("Title, description, and price are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitFormData = new FormData();
      submitFormData.append("productId", product.id);
      submitFormData.append("title", formData.title);
      submitFormData.append("description", formData.description);
      submitFormData.append("price", formData.price);
      submitFormData.append("category", formData.category || "");
      submitFormData.append("imageUrl", formData.imageUrl || "");
      submitFormData.append("fileUrl", formData.fileUrl || "");
      submitFormData.append("fileType", formData.fileType || "");
      submitFormData.append("status", formData.status);

      const result = await updateDigitalProduct(submitFormData);

      if (result?.success) {
        toast.success("Product updated successfully!");
        onOpenChange(false);
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Edit Digital Product
          </DialogTitle>
          <DialogDescription>
            Update your product information. Changes will be reflected immediately.
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
              placeholder="Describe your product..."
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
            <Label className="text-gray-300">Digital File</Label>
            <p className="text-xs text-muted-foreground mb-2">
              {formData.fileUrl ? "Current file is uploaded. Upload a new file to replace it." : "Upload the digital file"}
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
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
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
              disabled={isSubmitting || !formData.title || !formData.description || !formData.price}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Update Product
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

