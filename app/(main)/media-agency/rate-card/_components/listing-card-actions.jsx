"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Edit,
  Loader2,
  Megaphone,
  Plus,
  Radio,
  Smartphone,
  Trash2,
  Tv,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ListingCoverUpload } from "./listing-cover-upload";
import { BillboardMapPicker } from "./billboard-map-picker";

const fieldClass =
  "h-11 rounded-xl border-slate-200 bg-white text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20";

const STATUS_OPTIONS = [
  {
    value: "ACTIVE",
    label: "Active",
    hint: "Visible on marketplace",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  {
    value: "DRAFT",
    label: "Draft",
    hint: "Hidden until ready",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  {
    value: "INACTIVE",
    label: "Inactive",
    hint: "Paused / offline",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
];

const TYPE_META = {
  TV: {
    icon: Tv,
    label: "TV",
    name: "Station name",
    channel: "Channel",
    reach: "Estimated reach",
    slots: "Dayparts / time slots",
    slotsPlaceholder: "e.g. Prime Time",
  },
  RADIO: {
    icon: Radio,
    label: "Radio",
    name: "Station name",
    channel: "Frequency",
    reach: "Estimated reach",
    slots: "Dayparts / time slots",
    slotsPlaceholder: "e.g. Morning Drive",
  },
  DIGITAL: {
    icon: Smartphone,
    label: "Digital",
    name: "Publisher / platform",
    channel: "Category / vertical",
    reach: "Estimated reach",
    slots: "Ad placements",
    slotsPlaceholder: "e.g. Homepage takeover",
  },
  BILLBOARD: {
    icon: Megaphone,
    label: "Billboard",
    name: "Site name",
    channel: "Board type / size",
    reach: "Daily traffic / reach",
    slots: "Facing / positions",
    slotsPlaceholder: "e.g. Dual-facing",
  },
  INFLUENCER_MARKETING: {
    icon: Building2,
    label: "Influencer",
    name: "Talent / show name",
    channel: "Platform",
    reach: "Estimated followers",
    slots: "Deliverables",
    slotsPlaceholder: "e.g. 1 Reel + story",
  },
  VIDEO_CLIPPING: {
    icon: Building2,
    label: "Clipping",
    name: "Clipping product",
    channel: "Format",
    reach: "Estimated views",
    slots: "Clip types",
    slotsPlaceholder: "e.g. Vertical short",
  },
};

function Field({ label, required, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="ml-0.5 text-[#0055ff]">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="space-y-3">
      <div className="space-y-0.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {title}
        </h3>
        {description ? (
          <p className="text-xs text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ChipEditor({ label, items, onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const value = draft.trim();
    if (!value || items.includes(value)) return;
    onChange([...items, value]);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className={cn(fieldClass, "min-w-0 flex-1")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={add}
          className="h-11 shrink-0 rounded-xl border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-50"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(items.filter((x) => x !== item))}
                className="rounded-full p-0.5 text-slate-400 transition hover:bg-white hover:text-rose-600"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400">None added yet</p>
      )}
    </div>
  );
}

export function ListingCardActions({ listing }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(() => ({
    name: listing.name || "",
    network: listing.network || "",
    location: listing.location || "",
    frequency: listing.frequency || "",
    reach: listing.reach || "",
    priceRange: listing.priceRange || "",
    description: listing.description || "",
    status: listing.status || "ACTIVE",
    imageUrl: listing.imageUrl || "",
    timeSlots: listing.timeSlots || [],
    demographics: listing.demographics || [],
    latitude: listing.latitude ?? null,
    longitude: listing.longitude ?? null,
  }));

  useEffect(() => {
    if (!open) return;
    setForm({
      name: listing.name || "",
      network: listing.network || "",
      location: listing.location || "",
      frequency: listing.frequency || "",
      reach: listing.reach || "",
      priceRange: listing.priceRange || "",
      description: listing.description || "",
      status: listing.status || "ACTIVE",
      imageUrl: listing.imageUrl || "",
      timeSlots: listing.timeSlots || [],
      demographics: listing.demographics || [],
      latitude: listing.latitude ?? null,
      longitude: listing.longitude ?? null,
    });
  }, [open, listing]);

  const meta = useMemo(
    () =>
      TYPE_META[listing.listingType] || {
        icon: Building2,
        label: "Listing",
        name: "Listing name",
        channel: "Channel / category",
        reach: "Estimated reach",
        slots: "Time slots / placements",
        slotsPlaceholder: "Add a placement or slot",
      },
    [listing.listingType]
  );

  const TypeIcon = meta.icon;

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const dirty =
    form.name !== (listing.name || "") ||
    form.network !== (listing.network || "") ||
    form.location !== (listing.location || "") ||
    form.frequency !== (listing.frequency || "") ||
    form.reach !== (listing.reach || "") ||
    form.priceRange !== (listing.priceRange || "") ||
    form.description !== (listing.description || "") ||
    form.status !== (listing.status || "ACTIVE") ||
    form.imageUrl !== (listing.imageUrl || "") ||
    JSON.stringify(form.timeSlots) !==
      JSON.stringify(listing.timeSlots || []) ||
    JSON.stringify(form.demographics) !==
      JSON.stringify(listing.demographics || []) ||
    form.latitude !== (listing.latitude ?? null) ||
    form.longitude !== (listing.longitude ?? null);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) {
      toast.error("Name and location are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/media-agency/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          network: form.network.trim() || null,
          location: form.location.trim(),
          frequency: form.frequency.trim() || null,
          reach: form.reach.trim() || null,
          priceRange: form.priceRange.trim() || null,
          description: form.description.trim() || null,
          status: form.status,
          imageUrl: form.imageUrl || null,
          timeSlots: form.timeSlots,
          demographics: form.demographics,
          latitude:
            listing.listingType === "BILLBOARD" ? form.latitude : null,
          longitude:
            listing.listingType === "BILLBOARD" ? form.longitude : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update listing");
      toast.success("Listing updated");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to update listing");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Delete “${listing.name}”? This removes its packages and cannot be undone.`
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/media-agency/listings/${listing.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to delete listing");
      toast.success("Listing deleted");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to delete listing");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex shrink-0 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-full border-slate-200"
          onClick={() => setOpen(true)}
        >
          <Edit className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-full border-rose-200 text-rose-700 hover:bg-rose-50"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          )}
          Delete
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[min(92vh,880px)] w-full flex-col gap-0 overflow-hidden border-slate-200 bg-white p-0 text-slate-950 shadow-2xl shadow-slate-900/10 sm:max-w-2xl [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:text-slate-500 [&>button]:hover:bg-slate-100 [&>button]:hover:text-slate-900">
          <DialogHeader className="shrink-0 space-y-0 border-b border-slate-100 px-6 pb-4 pt-6 text-left">
            <div className="flex items-start gap-3 pr-8">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#0055ff]">
                <TypeIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950">
                    Edit listing
                  </DialogTitle>
                  <Badge className="rounded-full border-0 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    {meta.label}
                  </Badge>
                </div>
                <DialogDescription className="text-sm leading-relaxed text-slate-500">
                  Update how <span className="font-medium text-slate-700">{listing.name}</span> appears
                  to buyers. Packages stay on the card.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            onSubmit={handleSave}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <Section
                title="Cover"
                description="Shown on the marketplace card and quote pages."
              >
                <div className="rounded-2xl border border-slate-200 bg-[#f7f8fc] p-4">
                  <ListingCoverUpload
                    value={form.imageUrl}
                    onChange={(url) =>
                      setForm((prev) => ({ ...prev, imageUrl: url || "" }))
                    }
                    showLabel={false}
                    showHint
                  />
                </div>
              </Section>

              <Section title="Basics">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label={meta.name} required className="sm:col-span-2">
                    <Input
                      value={form.name}
                      onChange={setField("name")}
                      required
                      className={fieldClass}
                    />
                  </Field>

                  <Field label="Network / brand">
                    <Input
                      value={form.network}
                      onChange={setField("network")}
                      placeholder="Optional"
                      className={fieldClass}
                    />
                  </Field>

                  <Field label="Location" required>
                    <Input
                      value={form.location}
                      onChange={setField("location")}
                      required
                      className={fieldClass}
                    />
                  </Field>

                  {listing.listingType === "BILLBOARD" ? (
                    <div className="sm:col-span-2">
                      <BillboardMapPicker
                        value={{
                          latitude: form.latitude,
                          longitude: form.longitude,
                        }}
                        onChange={({ latitude, longitude }) =>
                          setForm((prev) => ({
                            ...prev,
                            latitude,
                            longitude,
                          }))
                        }
                        onLocationLabel={(label) => {
                          if (!form.location.trim()) {
                            setForm((prev) => ({ ...prev, location: label }));
                          }
                        }}
                      />
                    </div>
                  ) : null}

                  <Field label={meta.channel}>
                    <Input
                      value={form.frequency}
                      onChange={setField("frequency")}
                      className={fieldClass}
                    />
                  </Field>

                  <Field label={meta.reach}>
                    <Input
                      value={form.reach}
                      onChange={setField("reach")}
                      placeholder="e.g. 2.5M"
                      className={fieldClass}
                    />
                  </Field>

                  <Field label="Price range" className="sm:col-span-2">
                    <Input
                      value={form.priceRange}
                      onChange={setField("priceRange")}
                      placeholder="e.g. ₵2,500 – 5,000"
                      className={fieldClass}
                    />
                  </Field>

                  <Field label="Description" className="sm:col-span-2">
                    <Textarea
                      value={form.description}
                      onChange={setField("description")}
                      rows={3}
                      placeholder="What buyers should know about this inventory…"
                      className="min-h-[88px] resize-y rounded-xl border-slate-200 bg-white text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20"
                    />
                  </Field>
                </div>
              </Section>

              <Section
                title="Status"
                description="Active listings appear in the Digital marketplace."
              >
                <div className="grid gap-2 sm:grid-cols-3">
                  {STATUS_OPTIONS.map((option) => {
                    const active = form.status === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, status: option.value }))
                        }
                        className={cn(
                          "rounded-2xl border px-3 py-3 text-left transition",
                          active
                            ? "border-[#0055ff] bg-white shadow-sm ring-2 ring-[#0055ff]/15"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            option.className
                          )}
                        >
                          {option.label}
                        </span>
                        <p className="mt-2 text-xs leading-snug text-slate-500">
                          {option.hint}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Section
                title="Audience & placements"
                description="Tags help buyers scan fit before requesting a quote."
              >
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-[#f7f8fc] p-4">
                  <ChipEditor
                    label={meta.slots}
                    items={form.timeSlots}
                    onChange={(timeSlots) =>
                      setForm((prev) => ({ ...prev, timeSlots }))
                    }
                    placeholder={meta.slotsPlaceholder}
                  />
                  <ChipEditor
                    label="Target demographics"
                    items={form.demographics}
                    onChange={(demographics) =>
                      setForm((prev) => ({ ...prev, demographics }))
                    }
                    placeholder="e.g. Business owners"
                  />
                </div>
              </Section>
            </div>

            <DialogFooter className="shrink-0 gap-2 border-t border-slate-100 bg-[#fafbfd] px-6 py-4 sm:items-center sm:justify-between">
              <p className="hidden text-xs text-slate-400 sm:block">
                {dirty ? "You have unsaved changes" : "No changes yet"}
              </p>
              <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !dirty}
                  className="h-10 rounded-full bg-[#0055ff] px-5 text-white hover:bg-[#0046d4] disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
