"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@uploadthing/react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, ImagePlus, Loader2, MapPin, X } from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { createCampaign } from "@/actions/campaigns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CAMPAIGN_CATEGORIES } from "@/lib/campaign-categories";
import { loadPlaces } from "@/lib/campaign-places";

const fieldClass =
  "h-11 rounded-xl border border-slate-300 bg-white text-sm text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20";

export function CreateCampaignModal({ open, onOpenChange, defaultBrand = "" }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requirements, setRequirements] = useState([]);
  const [newRequirement, setNewRequirement] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    brand: defaultBrand,
    description: "",
    category: "",
    subcategory: "",
    budgetMin: "",
    budgetMax: "",
    country: "",
    location: "",
    deadline: "",
    imageUrl: "",
    status: "DRAFT",
  });

  useEffect(() => {
    if (open && defaultBrand) {
      setFormData((prev) => (prev.brand ? prev : { ...prev, brand: defaultBrand }));
    }
  }, [open, defaultBrand]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements((prev) => [...prev, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index) => {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.brand || !formData.description || !formData.category || !formData.subcategory || !formData.country || !formData.location || !formData.deadline) {
      toast.error("Please fill in all required fields");
      return;
    }

    const minBudget = formData.budgetMin ? Number(formData.budgetMin) : null;
    const maxBudget = formData.budgetMax ? Number(formData.budgetMax) : null;
    if (minBudget != null && maxBudget != null && minBudget > maxBudget) {
      toast.error("Minimum budget cannot be higher than the maximum");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitFormData = new FormData();
      submitFormData.append("title", formData.title);
      submitFormData.append("brand", formData.brand);
      submitFormData.append("description", formData.description);
      submitFormData.append("category", formData.category);
      submitFormData.append("subcategory", formData.subcategory);
      submitFormData.append("budgetMin", formData.budgetMin || "");
      submitFormData.append("budgetMax", formData.budgetMax || "");
      submitFormData.append("country", formData.country);
      submitFormData.append("location", formData.location);
      submitFormData.append("deadline", formData.deadline.includes("T") ? formData.deadline : `${formData.deadline}T23:59`);
      submitFormData.append("imageUrl", formData.imageUrl || "");
      submitFormData.append("requirements", JSON.stringify(requirements));
      submitFormData.append("status", formData.status);

      const result = await createCampaign(submitFormData);

      if (result?.success) {
        toast.success("Campaign created successfully!");
        onOpenChange(false);
        setFormData({
          title: "",
          brand: "",
          description: "",
          category: "",
          subcategory: "",
          budgetMin: "",
          budgetMax: "",
          country: "",
          location: "",
          deadline: "",
          imageUrl: "",
          status: "DRAFT",
        });
        setRequirements([]);
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,860px)] w-full flex-col gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 text-slate-900 shadow-2xl sm:max-w-2xl">
        <DialogHeader className="space-y-1 border-b border-slate-100 px-6 py-5 pr-12 text-left">
          <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950">
            Create new campaign
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Tell creators what you need, the budget, and when applications close.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <section className="space-y-4">
              <SectionLabel>Basics</SectionLabel>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-700">
                  Campaign title <Required />
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={fieldClass}
                  placeholder="Tech product launch"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand" className="text-slate-700">
                  Brand <Required />
                </Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  className={fieldClass}
                  placeholder="Company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">
                  Category <Required />
                </Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CAMPAIGN_CATEGORIES.map((cat) => {
                    const selected = formData.category === cat.name;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            category: cat.name,
                            subcategory: prev.category === cat.name ? prev.subcategory : "",
                          }));
                        }}
                        className={cn(
                          "rounded-xl border px-3 py-2.5 text-left transition-colors",
                          selected
                            ? "border-[#0055ff] bg-[#0055ff]/[0.06]"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        )}
                      >
                        <span className="block text-sm font-medium text-slate-950">{cat.name}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">{cat.detail}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.category ? (
                <div className="space-y-2">
                  <Label className="text-slate-700">
                    Subcategory <Required />
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {CAMPAIGN_CATEGORIES.find((cat) => cat.name === formData.category)?.subcategories.map((sub) => {
                      const selected = formData.subcategory === sub;
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => handleInputChange("subcategory", sub)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-sm transition-colors",
                            selected
                              ? "border-[#0055ff] bg-[#0055ff] text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          )}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700">
                  Description <Required />
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  className="min-h-28 resize-none rounded-xl border-slate-200 bg-white text-sm text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:border-[#0055ff] focus-visible:ring-[#0055ff]/20"
                  placeholder="What should creators make, and what do they get in return?"
                  required
                />
              </div>
            </section>

            <section className="space-y-4">
              <SectionLabel>Where and when</SectionLabel>
              <WhereFields formData={formData} onChange={handleInputChange} setFormData={setFormData} />
              <div className="space-y-2">
                <Label className="text-slate-700">Budget range</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₵</span>
                    <Input
                      id="budgetMin"
                      type="number"
                      value={formData.budgetMin}
                      onChange={(e) => handleInputChange("budgetMin", e.target.value)}
                      className={cn(fieldClass, "pl-8")}
                      placeholder="Minimum"
                      min="0"
                      aria-label="Minimum budget"
                    />
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₵</span>
                    <Input
                      id="budgetMax"
                      type="number"
                      value={formData.budgetMax}
                      onChange={(e) => handleInputChange("budgetMax", e.target.value)}
                      className={cn(fieldClass, "pl-8")}
                      placeholder="Maximum"
                      min="0"
                      aria-label="Maximum budget"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400">Optional. Creators see this as the pay range.</p>
              </div>
            </section>

            <section className="space-y-4">
              <SectionLabel>Creative</SectionLabel>
              <div className="space-y-2">
                <Label className="text-slate-700">Campaign image</Label>
                <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center">
                  <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-white sm:w-40">
                    {formData.imageUrl ? (
                      <Image
                        src={formData.imageUrl}
                        alt="Campaign preview"
                        fill
                        className="object-cover"
                        unoptimized
                        onError={() => {
                          toast.error("Failed to load image. Please try uploading again.");
                        }}
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-400">
                        <ImagePlus className="h-5 w-5" />
                        <span className="text-xs">No image yet</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="text-sm text-slate-500">
                      A cover helps creators recognize the brief. Square or wide photos both work.
                    </p>
                    <UploadButton
                      endpoint="portfolioUploader"
                      appearance={{
                        container: "w-full items-stretch gap-1",
                        button: "h-10 w-full rounded-xl bg-[#0055ff] text-sm font-medium text-white",
                        allowedContent: "text-xs text-slate-400",
                      }}
                      onClientUploadComplete={(res) => {
                        try {
                          let imageUrl = null;

                          if (Array.isArray(res) && res.length > 0) {
                            const file = res[0];
                            if (file?.key) {
                              imageUrl = `https://utfs.io/f/${file.key}`;
                            } else if (file?.url) {
                              imageUrl = file.url;
                            } else if (file?.serverData?.url) {
                              imageUrl = file.serverData.url;
                            }
                          } else if (res && typeof res === "object" && !Array.isArray(res)) {
                            if (res.key) {
                              imageUrl = `https://utfs.io/f/${res.key}`;
                            } else if (res.url) {
                              imageUrl = res.url;
                            } else if (res.serverData?.url) {
                              imageUrl = res.serverData.url;
                            }
                          }

                          if (imageUrl) {
                            setFormData((prev) => ({ ...prev, imageUrl }));
                            toast.success("Image uploaded successfully");
                          } else {
                            toast.error("Upload completed but URL not found");
                          }
                        } catch (error) {
                          console.error("Error processing upload:", error);
                          toast.error("Error processing upload");
                        }
                      }}
                      onUploadError={(error) => {
                        console.error("Upload error:", error);
                        toast.error(`Upload failed: ${error.message || "Please try again."}`);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Requirements</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addRequirement();
                      }
                    }}
                    className={cn(fieldClass, "min-w-0 flex-1")}
                    placeholder="10K followers on Instagram"
                  />
                  <Button
                    type="button"
                    onClick={addRequirement}
                    disabled={!newRequirement.trim()}
                    className="h-11 shrink-0 rounded-xl bg-slate-950 px-4 text-white hover:bg-slate-800"
                  >
                    Add
                  </Button>
                </div>
                {requirements.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {requirements.map((req, index) => (
                      <span
                        key={`${req}-${index}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#0055ff]/20 bg-[#0055ff]/[0.08] px-3 py-1 text-sm text-[#0055ff]"
                      >
                        {req}
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="rounded-full text-[#0055ff]/70 hover:text-[#0055ff]"
                          aria-label={`Remove ${req}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <SectionLabel>Publish</SectionLabel>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: "DRAFT", title: "Save as draft", detail: "Keep it private until you are ready." },
                  { value: "ACTIVE", title: "Publish now", detail: "Creators can apply as soon as you save." },
                ].map((option) => {
                  const selected = formData.status === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInputChange("status", option.value)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left transition-colors",
                        selected
                          ? "border-[#0055ff] bg-[#0055ff]/[0.06]"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <span className="block text-sm font-medium text-slate-950">{option.title}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{option.detail}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4">
            <p className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
              <MapPin className="h-3.5 w-3.5" />
              Nothing goes live until you publish.
            </p>
            <div className="ml-auto flex w-full gap-2 sm:w-auto">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 rounded-xl border-slate-200 text-slate-700 sm:flex-none"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="marketing"
                className="h-11 flex-1 rounded-xl px-5 sm:flex-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : formData.status === "ACTIVE" ? (
                  "Publish campaign"
                ) : (
                  "Save draft"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SearchSelect({ placeholder, value, options, onChange, disabled, loading, emptyHint }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => option.toLowerCase().includes(needle));
  }, [options, query]);

  const searching = query.trim().length > 0;
  const huge = options.length > 800;
  const shown =
    huge && !searching
      ? options.filter((option) => option === "Nationwide")
      : filtered.length <= 800
        ? filtered
        : filtered.slice(0, 200);

  return (
    <div ref={rootRef} className="space-y-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(fieldClass, "flex w-full items-center justify-between px-3 text-left disabled:opacity-60")}
      >
        <span className={cn("truncate", value ? "text-slate-950" : "text-slate-400")}>
          {loading ? "Loading…" : value || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>
      {open && !disabled ? (
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="h-9 border-slate-200 bg-slate-50 text-sm text-slate-950"
            autoFocus
          />
          <div className="mt-2 max-h-56 overflow-y-auto">
            {shown.length === 0 ? (
              <p className="px-2 py-3 text-sm text-slate-400">No matches</p>
            ) : (
              shown.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setQuery("");
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full rounded-lg px-2 py-1.5 text-left text-sm text-slate-800 hover:bg-[#0055ff]/10",
                    option === value && "bg-[#0055ff]/10 font-medium text-[#0055ff]"
                  )}
                >
                  {option}
                </button>
              ))
            )}
          </div>
          {!searching && huge && emptyHint ? (
            <p className="px-2 pt-2 text-xs text-slate-400">{emptyHint}</p>
          ) : null}
          {searching && filtered.length > shown.length ? (
            <p className="px-2 pt-2 text-xs text-slate-400">
              {filtered.length - shown.length} more. Keep typing to narrow the list.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function WhereFields({ formData, onChange, setFormData }) {
  const [places, setPlaces] = useState(null);
  const isRemote = formData.country === "Remote";

  useEffect(() => {
    let cancelled = false;
    loadPlaces().then((loaded) => {
      if (!cancelled) setPlaces(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const countryOptions = useMemo(() => {
    const names = places?.countries.map((country) => country.name) ?? [];
    return [...names, "Remote"];
  }, [places]);

  const cityOptions = useMemo(() => {
    if (!places || !formData.country || isRemote) return [];
    const match = places.countries.find((country) => country.name === formData.country);
    return match ? places.citiesFor(match.isoCode) : ["Nationwide"];
  }, [places, formData.country, isRemote]);

  const chooseCountry = (name) => {
    setFormData((prev) => ({
      ...prev,
      country: name,
      location: name === "Remote" ? "Remote" : "",
    }));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-slate-700">
            Country <Required />
          </Label>
          <SearchSelect
            placeholder={places ? "Select country" : "Loading countries…"}
            value={formData.country}
            options={countryOptions}
            onChange={chooseCountry}
            disabled={!places}
            loading={!places}
          />
        </div>

        {isRemote ? (
          <div className="flex items-end">
            <p className="pb-3 text-sm text-slate-500">Creators can apply from anywhere.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label className="text-slate-700">
              City <Required />
            </Label>
            <SearchSelect
              placeholder={
                formData.country
                  ? cityOptions.length
                    ? "Search cities"
                    : "Loading cities…"
                  : "Choose a country first"
              }
              value={formData.location}
              options={cityOptions}
              onChange={(value) => onChange("location", value)}
              disabled={!formData.country || cityOptions.length === 0}
              loading={Boolean(formData.country) && cityOptions.length === 0}
              emptyHint={
                cityOptions.length > 1
                  ? `${cityOptions.length - 1} cities. Search to find one.`
                  : ""
              }
            />
          </div>
        )}
      </div>

      <div className="space-y-2 sm:max-w-[calc(50%-0.5rem)]">
        <Label className="text-slate-700">
          Applications close <Required />
        </Label>
        <CloseDateField value={formData.deadline} onChange={(next) => onChange("deadline", next)} />
        <p className="text-xs text-slate-400">Creators can apply through this day.</p>
      </div>
    </div>
  );
}

function CloseDateField({ value, onChange }) {
  const selected = value ? parseLocalDate(value) : null;
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => selected || new Date());
  const rootRef = useRef(null);
  const today = startOfDay(new Date());

  useEffect(() => {
    if (!open) return;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });
  const canGoBack = !isBefore(endOfMonth(addMonths(month, -1)), today);

  return (
    <div ref={rootRef} className="space-y-2">
      <button
        type="button"
        onClick={() => {
          setMonth(selected || new Date());
          setOpen((current) => !current);
        }}
        className={cn(fieldClass, "flex w-full items-center justify-between px-3 text-left")}
      >
        <span className={selected ? "text-slate-950" : "text-slate-400"}>
          {selected ? format(selected, "d MMM yyyy") : "Choose a date"}
        </span>
        <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
      </button>
      {open ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              disabled={!canGoBack}
              onClick={() => setMonth((current) => addMonths(current, -1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-medium text-slate-950">{format(month, "MMMM yyyy")}</p>
            <button
              type="button"
              onClick={() => setMonth((current) => addMonths(current, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const past = isBefore(day, today);
              const inMonth = isSameMonth(day, month);
              const active = selected ? isSameDay(day, selected) : false;
              return (
                <button
                  key={format(day, "yyyy-MM-dd")}
                  type="button"
                  disabled={past}
                  onClick={() => {
                    onChange(toInputDate(day));
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-8 items-center justify-center rounded-full text-sm",
                    active && "bg-[#0055ff] font-medium text-white",
                    !active && inMonth && !past && "text-slate-800 hover:bg-[#0055ff]/10",
                    !active && !inMonth && "text-slate-300",
                    past && "cursor-not-allowed text-slate-300"
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function parseLocalDate(value) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toInputDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-medium uppercase tracking-wider text-[#0055ff]">{children}</p>
  );
}

function Required() {
  return <span className="text-[#0055ff]">*</span>;
}
