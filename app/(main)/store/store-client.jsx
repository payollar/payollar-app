"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  ShoppingBag,
  DollarSign,
  Package,
  Download,
  User,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { purchaseDigitalProduct } from "@/actions/products";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

export function StoreClient({ initialProducts = [] }) {
  const router = useRouter();
  const { userId, isSignedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const filteredProducts = initialProducts.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const allCategories = [
    ...new Set(initialProducts.map((p) => p.category).filter(Boolean)),
  ].sort();

  const handlePurchase = (product) => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    setSelectedProduct(product);
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseSubmit = async () => {
    if (!selectedProduct) return;

    setIsPurchasing(true);
    try {
      const formData = new FormData();
      formData.append("productId", selectedProduct.id);
      formData.append("paymentMethodId", "manual"); // For future payment integration

      const result = await purchaseDigitalProduct(formData);

      if (result?.success) {
        toast.success("Product purchased successfully! Download link sent to your email.");
        setIsPurchaseModalOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to purchase product");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background py-16">
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="secondary" className="w-fit mx-auto">
              <Package className="h-3 w-3 mr-1" />
              {initialProducts.length} Products Available
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-balance">
              Digital Products Store
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Discover digital products from talented creators. Music, videos, courses, templates, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="border-b border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Package className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => handlePurchase(product)}
                >
                  <div className="relative overflow-hidden">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted flex items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    {product.category && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="backdrop-blur">
                          {product.category}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/talents/${product.creator.specialty || "creator"}/${product.creator.id}`}
                          className="text-sm font-medium text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {product.creator.name || "Creator"}
                        </Link>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Download className="h-3 w-3 mr-1" />
                          {product.purchaseCount || 0}
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-primary mr-1" />
                        <span className="text-2xl font-bold">
                          ₵{product.price.toFixed(2)}
                        </span>
                      </div>
                      <Button className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Buy Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Purchase Modal */}
      <Dialog open={isPurchaseModalOpen} onOpenChange={setIsPurchaseModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Purchase Product</DialogTitle>
            <DialogDescription>
              Complete your purchase to download this digital product
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-6 mt-4">
              <div className="flex gap-4">
                {selectedProduct.imageUrl && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedProduct.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>

              <div className="bg-muted/20 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product Price:</span>
                  <span className="text-white font-medium">
                    ₵{selectedProduct.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee (1%):</span>
                  <span className="text-white font-medium">
                    ₵{(selectedProduct.price * 0.01).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold">
                  <span className="text-white">Total:</span>
                  <span className="text-emerald-400">
                    ₵{selectedProduct.price.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  disabled={isPurchasing}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={handlePurchaseSubmit}
                  disabled={isPurchasing}
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Complete Purchase
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

