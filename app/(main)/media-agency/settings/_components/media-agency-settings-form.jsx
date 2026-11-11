"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UploadButton } from "@uploadthing/react";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  UserRound,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateMediaAgencySettings } from "@/actions/media-agency";
import { DASHBOARD_CARD_CLASS } from "@/lib/dashboard-theme";
import { cn, uploadThingResultToUrl } from "@/lib/utils";

const inputClass =
  "h-11 rounded-xl border-slate-200 bg-white text-slate-900 shadow-none focus-visible:border-slate-950/40 focus-visible:ring-slate-950/15";

const STATUS = {
  VERIFIED: {
    label: "Verified",
    hint: "Your media house can publish rate cards and receive bookings.",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    iconClass: "text-emerald-600",
  },
  PENDING: {
    label: "Pending review",
    hint: "We’re reviewing your media profile. You can still set up rate cards meanwhile.",
    icon: Clock3,
    className: "bg-amber-50 text-amber-800 border-amber-100",
    iconClass: "text-amber-600",
  },
  REJECTED: {
    label: "Rejected",
    hint: "Verification was declined. Update your details and contact support.",
    icon: XCircle,
    className: "bg-rose-50 text-rose-700 border-rose-100",
    iconClass: "text-rose-600",
  },
};

function Field({ id, label, children, hint }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function MediaAgencySettingsForm({ agency }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState(agency.logoUrl || "");
  const [form, setForm] = useState({
    agencyName: agency.agencyName || "",
    contactName: agency.contactName || "",
    phone: agency.phone || "",
    website: agency.website || "",
    address: agency.address || "",
    city: agency.city || "",
    region: agency.region || "",
    country: agency.country || "Ghana",
    description: agency.description || "",
  });

  const status = STATUS[agency.verificationStatus] || STATUS.PENDING;
  const StatusIcon = status.icon;
  const initial =
    (form.agencyName || "A").trim().charAt(0).toUpperCase() || "A";

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.agencyName.trim() || !form.contactName.trim()) {
      toast.error("Media name and contact person are required");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateMediaAgencySettings({
        ...form,
        logoUrl: logoUrl || null,
      });
      if (result?.success) {
        toast.success("Settings saved");
        router.refresh();
      } else {
        throw new Error(result?.error || "Failed to save settings");
      }
    } catch (error) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
        {/* Summary */}
        <div className="space-y-6">
          <div className={cn(DASHBOARD_CARD_CLASS, "overflow-hidden p-6")}>
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 bg-[#f7f8fc]">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={form.agencyName || "Media logo"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#e8f0ff] text-2xl font-semibold text-slate-950">
                    {initial}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                {form.agencyName || "Your media"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{agency.email}</p>
              <div
                className={cn(
                  "mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                  status.className
                )}
              >
                <StatusIcon className={cn("h-3.5 w-3.5", status.iconClass)} />
                {status.label}
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-left">
              <div className="flex items-start gap-3 text-sm">
                <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Contact</p>
                  <p className="font-medium text-slate-800">
                    {form.contactName || "—"}
                  </p>
                </div>
              </div>
              {form.phone ? (
                <div className="flex items-start gap-3 text-sm">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Phone</p>
                    <p className="font-medium text-slate-800">{form.phone}</p>
                  </div>
                </div>
              ) : null}
              {form.website ? (
                <div className="flex items-start gap-3 text-sm">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">Website</p>
                    <a
                      href={form.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-medium text-slate-950 hover:underline"
                    >
                      {form.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                </div>
              ) : null}
              {(form.city || form.region || form.country) && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Location</p>
                    <p className="font-medium text-slate-800">
                      {[form.city, form.region, form.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={cn(DASHBOARD_CARD_CLASS, "p-5")}>
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                  status.className
                )}
              >
                <StatusIcon className={cn("h-4 w-4", status.iconClass)} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-950">
                  Verification
                </p>
                <p className="mt-1 text-sm text-slate-500">{status.hint}</p>
              </div>
            </div>
          </div>

          <div className={cn(DASHBOARD_CARD_CLASS, "p-5")}>
            <p className="text-sm font-semibold text-slate-950">Related</p>
            <div className="mt-3 space-y-2">
              <Link
                href="/media-agency/terms"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <FileText className="h-4 w-4 text-slate-400" />
                Terms & conditions
              </Link>
              <Link
                href="/media-agency/smart-rate-card"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <Building2 className="h-4 w-4 text-slate-400" />
                Smart rate card
              </Link>
            </div>
          </div>
        </div>

        {/* Editable form */}
        <div className={cn(DASHBOARD_CARD_CLASS, "p-6 md:p-7")}>
          <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Media profile
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                How your media house appears to clients booking media.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="h-10 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save changes
            </Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">
                Agency logo
              </Label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-[#f7f8fc]">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt="Logo"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-950">
                      {initial}
                    </div>
                  )}
                </div>
                <UploadButton
                  endpoint="profileImage"
                  onClientUploadComplete={(res) => {
                    const url = uploadThingResultToUrl(res);
                    if (url) {
                      setLogoUrl(url);
                      toast.success("Logo uploaded");
                    }
                  }}
                  onUploadError={(error) => {
                    toast.error(error.message || "Upload failed");
                  }}
                  appearance={{
                    button:
                      "ut-ready:bg-slate-950 ut-uploading:cursor-not-allowed rounded-full bg-slate-950 px-4 text-xs font-semibold text-white after:bg-slate-800",
                    allowedContent: "text-xs text-slate-400",
                  }}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="agencyName" label="Agency name">
                <Input
                  id="agencyName"
                  value={form.agencyName}
                  onChange={setField("agencyName")}
                  className={inputClass}
                  placeholder="e.g. Joy Brands Media"
                />
              </Field>
              <Field id="contactName" label="Contact person">
                <Input
                  id="contactName"
                  value={form.contactName}
                  onChange={setField("contactName")}
                  className={inputClass}
                  placeholder="Primary contact name"
                />
              </Field>
              <Field
                id="email"
                label="Email"
                hint="Signed-in account email. Contact support to change it."
              >
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    value={agency.email || ""}
                    disabled
                    className={cn(inputClass, "cursor-not-allowed pl-10 opacity-70")}
                  />
                </div>
              </Field>
              <Field id="phone" label="Phone">
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={setField("phone")}
                  className={inputClass}
                  placeholder="e.g. 0532818725"
                />
              </Field>
              <Field id="website" label="Website" hint="Include https://">
                <Input
                  id="website"
                  value={form.website}
                  onChange={setField("website")}
                  className={cn(inputClass, "sm:col-span-2")}
                  placeholder="https://…"
                />
              </Field>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <p className="mb-4 text-sm font-semibold text-slate-950">
                Location
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="address" label="Address">
                  <Input
                    id="address"
                    value={form.address}
                    onChange={setField("address")}
                    className={inputClass}
                    placeholder="Street / building"
                  />
                </Field>
                <Field id="city" label="City">
                  <Input
                    id="city"
                    value={form.city}
                    onChange={setField("city")}
                    className={inputClass}
                    placeholder="e.g. Accra"
                  />
                </Field>
                <Field id="region" label="Region">
                  <Input
                    id="region"
                    value={form.region}
                    onChange={setField("region")}
                    className={inputClass}
                    placeholder="e.g. Greater Accra"
                  />
                </Field>
                <Field id="country" label="Country">
                  <Input
                    id="country"
                    value={form.country}
                    onChange={setField("country")}
                    className={inputClass}
                    placeholder="Ghana"
                  />
                </Field>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <Field
                id="description"
                label="About the media"
                hint="Short description clients may see with your inventory."
              >
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={setField("description")}
                  rows={4}
                  className="min-h-[7rem] resize-y rounded-xl border-slate-200 bg-white text-slate-900 shadow-none focus-visible:border-slate-950/40 focus-visible:ring-slate-950/15"
                  placeholder="Tell clients what markets and channels you cover…"
                />
              </Field>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="h-10 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
