"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  FileText,
  Archive,
} from "lucide-react";
import Image from "next/image";
import { CreateProductModal } from "./create-product-modal";
import { EditProductModal } from "./edit-product-modal";
import { deleteDigitalProduct } from "@/actions/products";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreatorProducts({ products = [], productEarnings = {} }) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

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

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.status === "ACTIVE") ||
        (statusFilter === "draft" && product.status === "DRAFT") ||
        (statusFilter === "archived" && product.status === "ARCHIVED");

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, searchQuery, statusFilter, categoryFilter]);

  // Separate filtered products by status
  const activeProducts = filteredProducts.filter((p) => p.status === "ACTIVE");
  const draftProducts = filteredProducts.filter((p) => p.status === "DRAFT");
  const archivedProducts = filteredProducts.filter((p) => p.status === "ARCHIVED");

  // Calculate statistics
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === "ACTIVE").length;
    const draft = products.filter((p) => p.status === "DRAFT").length;
    const archived = products.filter((p) => p.status === "ARCHIVED").length;
    const totalSales = products.reduce((sum, p) => sum + (p.salesCount || 0), 0);
    const totalRevenue = productEarnings.totalRevenue || 0;
    const totalEarnings = productEarnings.totalEarnings || 0;

    return { total, active, draft, archived, totalSales, totalRevenue, totalEarnings };
  }, [products, productEarnings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Digital Products</h2>
            <p className="text-muted-foreground mt-1">
              Create and manage your digital products to sell directly to clients
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-white hover:bg-gray-100 text-gray-900"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Product
          </Button>
        </div>

        {/* Statistics Cards */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-white/20 bg-transparent backdrop-blur-md">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground/80 mb-1">Total Products</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl"></div>
                    <Package className="h-10 w-10 text-emerald-400 relative z-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/20 bg-transparent backdrop-blur-md">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground/80 mb-1">Active</p>
                    <p className="text-3xl font-bold text-emerald-400 mt-1">
                      {stats.active}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl"></div>
                    <CheckCircle2 className="h-10 w-10 text-emerald-400 relative z-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/20 bg-transparent backdrop-blur-md">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground/80 mb-1">Total Sales</p>
                    <p className="text-3xl font-bold text-blue-400 mt-1">
                      {stats.totalSales}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl"></div>
                    <TrendingUp className="h-10 w-10 text-blue-400 relative z-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/20 bg-gradient-to-br from-blue-900/20 via-blue-900/10 to-transparent backdrop-blur-md">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground/80 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-blue-400 mt-1">
                      ₵{stats.totalRevenue.toFixed(0)}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl"></div>
                    <DollarSign className="h-10 w-10 text-blue-400 relative z-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Earnings Summary - Show if there are earnings */}
        {(stats.totalRevenue > 0 || stats.totalEarnings > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-emerald-900/20 bg-emerald-900/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">₵{stats.totalRevenue.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">All time sales</p>
                  </div>
                  <div className="bg-emerald-900/20 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-emerald-900/20 bg-emerald-900/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Your Earnings</p>
                    <p className="text-2xl font-bold text-white">₵{stats.totalEarnings.toFixed(2)}</p>
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
      </div>

      {/* Search and Filters */}
      {products.length > 0 && (
        <Card className="border-emerald-900/20">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-emerald-900/30"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-background border-emerald-900/30">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              {categories.length > 0 && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-background border-emerald-900/30">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Products */}
      {activeProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Active Products ({activeProducts.length})
            </h3>
          </div>
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-400" />
              Draft Products ({draftProducts.length})
            </h3>
          </div>
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Archive className="h-5 w-5 text-gray-400" />
              Archived Products ({archivedProducts.length})
            </h3>
          </div>
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

      {/* No Results */}
      {products.length > 0 && filteredProducts.length === 0 && (
        <Card className="border-emerald-900/20">
          <CardContent className="p-12 text-center">
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {products.length === 0 && (
        <Card className="border-emerald-900/20">
          <CardContent className="p-12 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first digital product to start earning. Sell music, videos, courses, templates, and more!
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
              size="lg"
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
    <Card className="group border-emerald-900/20 hover:border-emerald-700/40 transition-all overflow-hidden hover:shadow-lg hover:shadow-emerald-900/10">
      {product.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3">
            <Badge className={statusColors[product.status] || ""}>
              {product.status}
            </Badge>
          </div>
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-400">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
      {!product.imageUrl && (
        <div className="relative h-48 w-full bg-gradient-to-br from-emerald-900/20 to-teal-900/20 flex items-center justify-center">
          <Package className="h-16 w-16 text-muted-foreground" />
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
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>

        <div className="space-y-2 pt-2 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">₵{product.price.toFixed(2)}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-muted-foreground">{product.salesCount || 0} sales</p>
              {product.totalEarnings > 0 && (
                <p className="text-emerald-400 font-medium">
                  ₵{product.totalEarnings.toFixed(2)} earned
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span>{product.downloadCount || 0} downloads</span>
            </div>
            <span>{format(new Date(product.createdAt), "MMM d, yyyy")}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-emerald-900/30 hover:bg-emerald-900/10"
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
