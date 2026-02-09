"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, FileText, Calendar } from "lucide-react";

function formatDate(d) {
  if (!d) return "—";
  const x = new Date(d);
  return x.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function toInputDate(d) {
  if (!d) return "";
  const x = new Date(d);
  return x.toISOString().slice(0, 10);
}

export function CustomPackageDetailsSection({ mediaAgency }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      toast.success("Custom package details updated");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to save details");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Custom package section – latest update details
        </CardTitle>
        <CardDescription>
          Fill out the details that apply when clients build a custom package for your listings. These can be shown on your rate card and to buyers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customPackageNotes">Custom package notes / description</Label>
            <Textarea
              id="customPackageNotes"
              value={form.customPackageNotes}
              onChange={(e) => setForm((f) => ({ ...f, customPackageNotes: e.target.value }))}
              placeholder="e.g. Contact us for custom slot combinations. Minimum 5 spots for custom packages."
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customPackageTerms">Terms for custom packages</Label>
            <Textarea
              id="customPackageTerms"
              value={form.customPackageTerms}
              onChange={(e) => setForm((f) => ({ ...f, customPackageTerms: e.target.value }))}
              placeholder="e.g. Rates subject to availability. Bulk discounts available on request. Payment terms: 50% upfront."
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rateCardValidFrom" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Valid from
              </Label>
              <Input
                id="rateCardValidFrom"
                type="date"
                value={form.rateCardValidFrom}
                onChange={(e) => setForm((f) => ({ ...f, rateCardValidFrom: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rateCardValidTo">Valid to</Label>
              <Input
                id="rateCardValidTo"
                type="date"
                value={form.rateCardValidTo}
                onChange={(e) => setForm((f) => ({ ...f, rateCardValidTo: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save latest update details
            </Button>
            {mediaAgency?.rateCardLastUpdated && (
              <span className="text-sm text-muted-foreground">
                Last updated: {formatDate(mediaAgency.rateCardLastUpdated)}
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
