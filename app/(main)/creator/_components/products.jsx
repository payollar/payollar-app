"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Package,
  TrendingUp,
  Eye,
  Download,
} from "lucide-react";
import Image from "next/image";
import { CreateProductModal } from "./create-product-modal";
import { EditProductModal } from "./edit-product-modal";
import {
  deleteDigitalProduct,
} from "@/actions/products";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreatorProducts({ products = [], productEarnings = {} }) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("productId", productId);

      const result = await deleteDigitalProduct(formData);

      if (result?.success) {
        toast.success("Product deleted successfully");
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  // Separate products by status
  const activeProducts = products.filter((p) => p.status === "ACTIVE");
  const draftProducts = products.filter((p) => p.status === "DRAFT");
  const archivedProducts = products.filter((p) => p.status === "ARCHIVED");

  const totalRevenue = productEarnings.totalRevenue || 0;
  const totalEarnings = productEarnings.totalEarnings || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Digital Products</h2>
          <p className="text-muted-foreground">
            Create and manage your digital products to sell directly to clients
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Product
        </Button>
      </div>

      {/* Earnings Summary */}
      {(totalRevenue > 0 || totalEarnings > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-emerald-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">All time sales</p>
                </div>
                <div className="bg-emerald-900/20 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Your Earnings</p>
                  <p className="text-2xl font-bold text-white">${totalEarnings.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">After 1% platform fee</p>
                </div>
                <div className="bg-emerald-900/20 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Products */}
      {activeProducts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-400" />
            Active Products ({activeProducts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => setEditingProduct(product)}
                onDelete={() => handleDelete(product.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Draft Products */}
      {draftProducts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Edit className="h-5 w-5 text-amber-400" />
            Draft Products ({draftProducts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {draftProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => setEditingProduct(product)}
                onDelete={() => handleDelete(product.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Archived Products */}
      {archivedProducts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-400" />
            Archived Products ({archivedProducts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => setEditingProduct(product)}
                onDelete={() => handleDelete(product.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {products.length === 0 && (
        <Card className="border-emerald-900/20">
          <CardContent className="p-12 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              No products yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first digital product to start earning. Sell music, videos, courses, templates, and more!
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Product
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Product Modal */}
      <CreateProductModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
          product={editingProduct}
        />
      )}
    </div>
  );
}

function ProductCard({ product, onEdit, onDelete }) {
  const statusColors = {
    ACTIVE: "bg-emerald-900/20 border-emerald-900/30 text-emerald-400",
    DRAFT: "bg-amber-900/20 border-amber-900/30 text-amber-400",
    ARCHIVED: "bg-gray-900/20 border-gray-900/30 text-gray-400",
  };

  return (
    <Card className="border-emerald-900/20 hover:border-emerald-700/40 transition-all overflow-hidden">
      {product.imageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-3 right-3">
            <Badge className={statusColors[product.status] || ""}>
              {product.status}
            </Badge>
          </div>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg font-bold text-white mb-1 line-clamp-2">
          {product.title}
        </CardTitle>
        {product.category && (
          <Badge variant="outline" className="text-xs w-fit">
            {product.category}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-white">${product.price.toFixed(2)}</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-muted-foreground">{product.salesCount || 0} sales</p>
            {product.totalEarnings > 0 && (
              <p className="text-emerald-400">${product.totalEarnings.toFixed(2)} earned</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{product.downloadCount || 0} downloads</span>
          <span>{format(new Date(product.createdAt), "MMM d, yyyy")}</span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-emerald-900/30"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-900/30 text-red-400 hover:bg-red-900/20"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

