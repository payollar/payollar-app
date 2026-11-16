"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Loader2, Mail, Phone, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaAgencyPageShell } from "./media-agency-page-shell";
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

const inputClass =
  "h-11 rounded-xl border-slate-200 bg-white pl-10 text-slate-900 shadow-none focus-visible:border-slate-950/40 focus-visible:ring-slate-950/15";

/**
 * Shown when the user is MEDIA_AGENCY but has no MediaAgency row yet
 * (e.g. interrupted signup). Completes registration then opens the dashboard.
 */
export function CompleteAgencyProfile({
  defaultEmail = "",
  defaultContactName = "",
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    agencyName: "",
    contactName: defaultContactName || "",
    email: defaultEmail || "",
    phone: "",
    website: "",
  });

  const update = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.agencyName.trim() || !form.contactName.trim() || !form.email.trim()) {
      setError("Agency name, contact person, and email are required.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/media-agency/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName: form.agencyName.trim(),
          contactName: form.contactName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          website: form.website.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Could not create your agency profile");
      }

      toast.success("Agency profile ready");
      router.replace("/media-agency");
      router.refresh();
    } catch (err) {
      const message = err.message || "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MediaAgencyPageShell
      eyebrow="Media agency"
      title="Finish setup"
      description="Add your agency details to open the media dashboard."
    >
      <div className={cn(DASHBOARD_CARD_CLASS, "mx-auto max-w-lg p-6 sm:p-8")}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="agencyName">Agency / station name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="agencyName"
                value={form.agencyName}
                onChange={update("agencyName")}
                className={inputClass}
                placeholder="e.g. Joy FM"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Contact person</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="contactName"
                value={form.contactName}
                onChange={update("contactName")}
                className={inputClass}
                placeholder="Full name"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={update("email")}
                className={inputClass}
                placeholder="you@station.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={update("phone")}
                  className={inputClass}
                  placeholder="+233…"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={update("website")}
                  className={inputClass}
                  placeholder="https://"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="mt-2 h-11 w-full rounded-full bg-slate-950 text-white hover:bg-slate-800"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Open dashboard"
            )}
          </Button>
        </form>
      </div>
    </MediaAgencyPageShell>
  );
}
