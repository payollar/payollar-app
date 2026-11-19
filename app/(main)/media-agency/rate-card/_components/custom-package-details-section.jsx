"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save, FileText, Calendar, ChevronDown } from "lucide-react";
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

const fieldClass =
  "rounded-xl border-slate-200 bg-white shadow-none focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20";

function formatDate(d) {
  if (!d) return null;
  const x = new Date(d);
  return x.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toInputDate(d) {
  if (!d) return "";
  const x = new Date(d);
  return x.toISOString().slice(0, 10);
}

function hasExistingDetails(agency) {
  return Boolean(
    agency?.customPackageNotes?.trim() ||
      agency?.customPackageTerms?.trim() ||
      agency?.rateCardValidFrom ||
      agency?.rateCardValidTo
  );
}

export function CustomPackageDetailsSection({ mediaAgency }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(() => hasExistingDetails(mediaAgency));
  const [form, setForm] = useState({
    customPackageNotes: "",
    customPackageTerms: "",
    rateCardValidFrom: "",
    rateCardValidTo: "",
  });

  useEffect(() => {
    setForm({
      customPackageNotes: mediaAgency?.customPackageNotes ?? "",
      customPackageTerms: mediaAgency?.customPackageTerms ?? "",
      rateCardValidFrom: toInputDate(mediaAgency?.rateCardValidFrom),
      rateCardValidTo: toInputDate(mediaAgency?.rateCardValidTo),
    });
  }, [mediaAgency]);

  const lastUpdated = formatDate(mediaAgency?.rateCardLastUpdated);
  const filledSummary = useMemo(() => {
    const bits = [];
    if (form.customPackageNotes.trim()) bits.push("notes");
    if (form.customPackageTerms.trim()) bits.push("terms");
    if (form.rateCardValidFrom || form.rateCardValidTo) bits.push("dates");
    if (bits.length === 0) return "Optional — specials, minimums, and booking terms";
    return `Saved: ${bits.join(", ")}`;
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/media-agency/rate-card-details", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customPackageNotes: form.customPackageNotes.trim() || null,
          customPackageTerms: form.customPackageTerms.trim() || null,
          rateCardValidFrom: form.rateCardValidFrom || null,
          rateCardValidTo: form.rateCardValidTo || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      toast.success("Package notes updated");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to save details");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={cn(DASHBOARD_CARD_CLASS, "overflow-hidden")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50/80 sm:px-6"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#0055ff]">
          <FileText className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-950">
                Package notes & terms
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">{filledSummary}</p>
              <p className="mt-1 text-xs text-slate-400">
                Shown on billboard / digital package pages and in Negotiate.
              </p>
              {lastUpdated && !open ? (
                <p className="mt-1 text-xs text-slate-400">
                  Last saved {lastUpdated}
                </p>
              ) : null}
            </div>
            <ChevronDown
              className={cn(
                "mt-1 h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </div>
        </div>
      </button>

      {open ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 border-t border-slate-100 px-5 py-5 sm:px-6"
        >
          <p className="text-sm text-slate-500">
            Specials, minimums, and booking terms. Valid dates become the open
            booking window on billboard site pages.
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="customPackageNotes"
                className="text-sm font-medium text-slate-700"
              >
                Notes / description
              </Label>
              <Textarea
                id="customPackageNotes"
                value={form.customPackageNotes}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    customPackageNotes: e.target.value,
                  }))
                }
                placeholder="e.g. Q1 promo: 10% off 8-week buys. Minimum 4 weeks for billboard sites."
                rows={4}
                className={cn(fieldClass, "min-h-[108px] resize-y")}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="customPackageTerms"
                className="text-sm font-medium text-slate-700"
              >
                Terms
              </Label>
              <Textarea
                id="customPackageTerms"
                value={form.customPackageTerms}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    customPackageTerms: e.target.value,
                  }))
                }
                placeholder="e.g. Rates subject to availability. 50% upfront."
                rows={4}
                className={cn(fieldClass, "min-h-[108px] resize-y")}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="rateCardValidFrom"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700"
              >
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Valid from
              </Label>
              <Input
                id="rateCardValidFrom"
                type="date"
                value={form.rateCardValidFrom}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    rateCardValidFrom: e.target.value,
                  }))
                }
                className={cn(fieldClass, "h-11")}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="rateCardValidTo"
                className="text-sm font-medium text-slate-700"
              >
                Valid to
              </Label>
              <Input
                id="rateCardValidTo"
                type="date"
                value={form.rateCardValidTo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rateCardValidTo: e.target.value }))
                }
                className={cn(fieldClass, "h-11")}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
            {lastUpdated ? (
              <p className="text-xs text-slate-400">Last saved {lastUpdated}</p>
            ) : (
              <span />
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-full bg-[#0055ff] px-5 text-white hover:bg-[#0046d4]"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save notes
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
