"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Clock } from "lucide-react";

export function ListingTimeClassesSection({ listing }) {
  const router = useRouter();
  const timeClasses = listing.timeClasses || [];
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    label: "",
    timeRange: "",
    ratePer30Sec: "",
  });

  const handleAddTimeClass = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.timeRange.trim() || form.ratePer30Sec === "") {
      toast.error("Label, time range and rate are required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/media-agency/listings/${listing.id}/time-classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: form.label.trim(),
          timeRange: form.timeRange.trim(),
          ratePer30Sec: Number(form.ratePer30Sec),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add time class");
      toast.success("Time class added");
      setForm({ label: "", timeRange: "", ratePer30Sec: "" });
      setIsAdding(false);
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to add time class");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTimeClass = async (timeClassId) => {
    if (!confirm("Remove this time class?")) return;
    try {
      const res = await fetch(`/api/media-agency/listings/time-classes/${timeClassId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      toast.success("Time class removed");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to remove");
    }
  };

  return (
    <div className="pt-4 border-t">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time classes & rates ({timeClasses.length})
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Used by the Custom Package Builder on your media page
          </p>
        </div>
        {!isAdding ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add time class
          </Button>
        ) : null}
      </div>

      {timeClasses.length > 0 && (
        <div className="grid gap-2 mb-4">
          {timeClasses.map((tc) => (
            <div
              key={tc.id}
              className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium">{tc.label}</span>
                <span className="text-muted-foreground ml-2">{tc.timeRange}</span>
                <span className="ml-2 font-medium">
                  ₵{Number(tc.ratePer30Sec).toLocaleString()} / 30 sec
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDeleteTimeClass(tc.id)}
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
            <CardTitle className="text-sm">New time class</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form onSubmit={handleAddTimeClass} className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Label *</Label>
                <Input
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Premium, M1, M2"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Time range *</Label>
                <Input
                  value={form.timeRange}
                  onChange={(e) => setForm((f) => ({ ...f, timeRange: e.target.value }))}
                  placeholder="e.g. 6:00am - 10:00am"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Rate per 30 sec (₵) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.ratePer30Sec}
                  onChange={(e) => setForm((f) => ({ ...f, ratePer30Sec: e.target.value }))}
                  placeholder="1209.52"
                  required
                />
              </div>
              <div className="flex gap-2 items-end sm:col-span-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Add time class"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setForm({ label: "", timeRange: "", ratePer30Sec: "" });
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
