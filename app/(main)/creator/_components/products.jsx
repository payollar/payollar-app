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
import { CreatorPageShell, creatorCardClass } from "./creator-page-shell";
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
    <CreatorPageShell
      eyebrow="Store"
      title="Digital products"
      description="Create and manage digital products to sell directly to clients."
      actions={
        <Button variant="marketing" size="lg" onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create product
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className={creatorCardClass}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Total products</p>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{stats.total}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={creatorCardClass}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Active</p>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-primary">{stats.active}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={creatorCardClass}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Total sales</p>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{stats.totalSales}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={creatorCardClass}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Total revenue</p>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
                      ₵{stats.totalRevenue.toFixed(0)}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {(stats.totalRevenue > 0 || stats.totalEarnings > 0) && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className={creatorCardClass}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Total revenue</p>
                    <p className="text-2xl font-bold tabular-nums text-foreground">₵{stats.totalRevenue.toFixed(2)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">All time sales</p>
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={creatorCardClass}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Your earnings</p>
                    <p className="text-2xl font-bold tabular-nums text-foreground">₵{stats.totalEarnings.toFixed(2)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">After platform fee</p>
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      {/* Search and Filters */}
      {products.length > 0 && (
        <Card className={creatorCardClass}>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-border/60 bg-background/80 pl-10 backdrop-blur-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full border-border/60 bg-background/80 backdrop-blur-sm md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
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
                  <SelectTrigger className="w-full border-border/60 bg-background/80 backdrop-blur-sm md:w-[180px]">
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
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Active products ({activeProducts.length})
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
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <FileText className="h-5 w-5 text-amber-500" />
              Draft products ({draftProducts.length})
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
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Archive className="h-5 w-5 text-muted-foreground" />
              Archived products ({archivedProducts.length})
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
        <Card className={creatorCardClass}>
          <CardContent className="p-12 text-center">
            <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-medium text-foreground">No products found</h3>
            <p className="mb-6 text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="glass"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {products.length === 0 && (
        <Card className={creatorCardClass}>
          <CardContent className="p-12 text-center">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-medium text-foreground">No products yet</h3>
            <p className="mx-auto mb-6 max-w-md text-muted-foreground">
              Create your first digital product to start earning. Sell music, videos, courses, templates, and more!
            </p>
            <Button variant="marketing" size="lg" onClick={() => setIsCreateModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create your first product
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
    </CreatorPageShell>
  );
}

function ProductCard({ product, onEdit, onDelete }) {
  const statusColors = {
    ACTIVE: "border-primary/30 bg-primary/10 text-primary",
    DRAFT: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    ARCHIVED: "border-border/60 bg-muted/50 text-muted-foreground",
  };

  return (
    <Card className={`group ${creatorCardClass} overflow-hidden transition-all hover:border-primary/25 hover:shadow-md`}>
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
        <CardTitle className="mb-1 line-clamp-2 text-lg font-semibold text-foreground">
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

        <div className="space-y-2 border-t border-border/50 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold tabular-nums text-foreground">₵{product.price.toFixed(2)}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-muted-foreground">{product.salesCount || 0} sales</p>
              {product.totalEarnings > 0 && (
                <p className="font-medium text-primary">
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
          <Button variant="glass" size="sm" className="flex-1" onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
