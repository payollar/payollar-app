"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Package } from "lucide-react";

export function ListingPackagesSection({ listing }) {
  const router = useRouter();
  const packages = listing.packages || [];
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: "30 seconds",
    spots: "",
    estimatedViewers: "",
  });

  const handleAddPackage = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.price === "") {
      toast.error("Package name and price are required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/media-agency/listings/${listing.id}/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          price: Number(form.price),
          duration: form.duration || null,
          spots: form.spots ? Number(form.spots) : null,
          estimatedViewers: form.estimatedViewers.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add package");
      toast.success("Package added");
      setForm({ name: "", price: "", duration: "30 seconds", spots: "", estimatedViewers: "" });
      setIsAdding(false);
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to add package");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (!confirm("Remove this package?")) return;
    try {
      const res = await fetch(`/api/media-agency/listings/packages/${packageId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete package");
      toast.success("Package removed");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to remove package");
    }
  };

  return (
    <div className="pt-4 border-t">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium flex items-center gap-2">
          <Package className="h-4 w-4" />
          Packages ({packages.length})
        </p>
        {!isAdding ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Package
          </Button>
        ) : null}
      </div>

      {packages.length > 0 && (
        <div className="grid gap-2 mb-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium">{pkg.name}</span>
                <span className="text-muted-foreground ml-2">
                  ₵{Number(pkg.price).toLocaleString()}
                  {pkg.duration && ` • ${pkg.duration}`}
                  {pkg.spots != null && ` • ${pkg.spots} spots`}
                  {pkg.estimatedViewers && ` • ${pkg.estimatedViewers}`}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDeletePackage(pkg.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {isAdding && (
        <Card className="bg-muted/20">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">New Package</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form onSubmit={handleAddPackage} className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Morning Show Package"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Price (₵) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="3500"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Duration</Label>
                <Input
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  placeholder="30 seconds"
                />
              </div>
              <div className="space-y-1">
                <Label>Spots</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.spots}
                  onChange={(e) => setForm((f) => ({ ...f, spots: e.target.value }))}
                  placeholder="5"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Estimated viewers</Label>
                <Input
                  value={form.estimatedViewers}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedViewers: e.target.value }))}
                  placeholder="e.g. 2.5M+ viewers"
                />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Add Package"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setForm({ name: "", price: "", duration: "30 seconds", spots: "", estimatedViewers: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
