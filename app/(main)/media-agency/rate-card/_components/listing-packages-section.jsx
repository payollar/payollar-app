"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Package } from "lucide-react";

const fieldClass =
  "h-10 rounded-xl border-slate-200 bg-white shadow-none focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20";

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

  const resetForm = () =>
    setForm({
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
      resetForm();
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Package className="h-4 w-4 text-[#0055ff]" />
            Packages
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-500">
              {packages.length}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            Ready-made buys clients can pick on your media page
          </p>
        </div>
        {!isAdding ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 shrink-0 rounded-full border-slate-200"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add
          </Button>
        ) : null}
      </div>

      {packages.length > 0 ? (
        <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100">
          {packages.map((pkg) => (
            <li
              key={pkg.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {pkg.name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  ₵{Number(pkg.price).toLocaleString("en-GH")}
                  {pkg.duration ? ` · ${pkg.duration}` : ""}
                  {pkg.spots != null ? ` · ${pkg.spots} spots` : ""}
                  {pkg.estimatedViewers ? ` · ${pkg.estimatedViewers}` : ""}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={() => handleDeletePackage(pkg.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : !isAdding ? (
        <p className="mt-3 rounded-xl bg-[#f8fafc] px-3 py-4 text-center text-xs text-slate-400">
          No packages yet — add one for quick client checkout.
        </p>
      ) : null}

      {isAdding ? (
        <form
          onSubmit={handleAddPackage}
          className="mt-3 space-y-3 rounded-xl border border-slate-100 bg-[#f8fafc] p-3"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            New package
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Morning Show Package"
                required
                className={fieldClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Price (₵) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="3500"
                required
                className={fieldClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Duration</Label>
              <Input
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                placeholder="30 seconds"
                className={fieldClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Spots</Label>
              <Input
                type="number"
                min="0"
                value={form.spots}
                onChange={(e) => setForm((f) => ({ ...f, spots: e.target.value }))}
                placeholder="5"
                className={fieldClass}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs text-slate-600">Estimated viewers</Label>
              <Input
                value={form.estimatedViewers}
                onChange={(e) =>
                  setForm((f) => ({ ...f, estimatedViewers: e.target.value }))
                }
                placeholder="e.g. 2.5M+ viewers"
                className={fieldClass}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8 rounded-full bg-[#0055ff] px-3 text-xs text-white hover:bg-[#0046d4]"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Add package"
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 rounded-full border-slate-200 text-xs"
              onClick={() => {
                setIsAdding(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
