"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Clock } from "lucide-react";

const fieldClass =
  "h-10 rounded-xl border-slate-200 bg-white shadow-none focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20";

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

  const resetForm = () =>
    setForm({ label: "", timeRange: "", ratePer30Sec: "" });

  const handleAddTimeClass = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.timeRange.trim() || form.ratePer30Sec === "") {
      toast.error("Label, time range and rate are required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/media-agency/listings/${listing.id}/time-classes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: form.label.trim(),
            timeRange: form.timeRange.trim(),
            ratePer30Sec: Number(form.ratePer30Sec),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add time class");
      toast.success("Time class added");
      resetForm();
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
      const res = await fetch(
        `/api/media-agency/listings/time-classes/${timeClassId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      toast.success("Time class removed");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to remove");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Clock className="h-4 w-4 text-[#0055ff]" />
            Time classes & rates
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-500">
              {timeClasses.length}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            Powers the custom package builder on your media page
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

      {timeClasses.length > 0 ? (
        <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100">
          {timeClasses.map((tc) => (
            <li
              key={tc.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {tc.label}
                  <span className="ml-2 font-normal text-slate-500">
                    {tc.timeRange}
                  </span>
                </p>
                <p className="text-xs font-medium tabular-nums text-[#0055ff]">
                  ₵{Number(tc.ratePer30Sec).toLocaleString("en-GH")} / 30 sec
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={() => handleDeleteTimeClass(tc.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : !isAdding ? (
        <p className="mt-3 rounded-xl bg-[#f8fafc] px-3 py-4 text-center text-xs text-slate-400">
          No time classes yet — add rates clients can mix into a custom package.
        </p>
      ) : null}

      {isAdding ? (
        <form
          onSubmit={handleAddTimeClass}
          className="mt-3 space-y-3 rounded-xl border border-slate-100 bg-[#f8fafc] p-3"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            New time class
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Label *</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Premium, M1…"
                required
                className={fieldClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Time range *</Label>
              <Input
                value={form.timeRange}
                onChange={(e) =>
                  setForm((f) => ({ ...f, timeRange: e.target.value }))
                }
                placeholder="6:00am – 10:00am"
                required
                className={fieldClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Rate / 30s (₵) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.ratePer30Sec}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ratePer30Sec: e.target.value }))
                }
                placeholder="1209.52"
                required
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
                "Add time class"
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
