"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Check,
  CreditCard,
  Loader2,
  MapPin,
  Megaphone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Wallet,
} from "lucide-react";
import { siFacebook, siInstagram, siTiktok, siX, siYoutube } from "simple-icons";
import { toast } from "sonner";
import { applyToCampaign } from "@/actions/campaigns";
import { campaignCategoryLabel } from "@/lib/campaign-categories";
import { campaignPlaceLabel } from "@/lib/campaign-places";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const BUDGET_FILTERS = [
  { id: "any", label: "Any budget" },
  { id: "under-1000", label: "Under GH₵1,000" },
  { id: "1000-5000", label: "GH₵1,000 – 5,000" },
  { id: "5000-plus", label: "GH₵5,000+" },
];

const CAMPAIGN_TYPES = [
  { id: "influencer", label: "Influencer Campaigns" },
  { id: "content", label: "Content Creation" },
  { id: "event", label: "Event Coverage" },
  { id: "ambassador", label: "Brand Ambassadors" },
  { id: "takeover", label: "Social Media Takeovers" },
  { id: "review", label: "Product Reviews" },
];

function matchesCampaignType(campaign, typeId) {
  const blob = `${campaign.category || ""} ${campaign.subcategory || ""} ${campaignHaystack(campaign)}`;
  if (typeId === "influencer") return campaign.category === "Influencer" || /influencer/i.test(blob);
  if (typeId === "event") return /event/i.test(blob);
  if (typeId === "ambassador") return /ambassador/i.test(blob);
  if (typeId === "takeover") return /takeover/i.test(blob);
  if (typeId === "review") return /product review|unboxing/i.test(blob);
  if (typeId === "content") {
    return (
      ["Social", "Video", "Digital Media"].includes(campaign.category) ||
      /content|clipping|short-form|faceless/i.test(blob)
    );
  }
  return false;
}

const PLATFORMS = [
  { id: "tiktok", label: "TikTok", icon: siTiktok, pattern: /tik\s?tok/i },
  { id: "instagram", label: "Instagram", icon: siInstagram, pattern: /instagram|\binsta\b/i },
  { id: "youtube", label: "YouTube", icon: siYoutube, pattern: /youtube|youtu\.be/i },
  { id: "facebook", label: "Facebook", icon: siFacebook, pattern: /facebook/i },
  { id: "x", label: "X (Twitter)", icon: siX, pattern: /twitter|\bx\.com\b/i },
];

function campaignHaystack(campaign) {
  return [campaign.title, campaign.description, campaign.category, campaign.subcategory, ...(campaign.requirements || [])]
    .filter(Boolean)
    .join(" ");
}

function campaignPlatformIds(campaign) {
  const text = campaignHaystack(campaign);
  return PLATFORMS.filter((platform) => platform.pattern.test(text)).map((platform) => platform.id);
}

function PlatformGlyph({ icon, className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden style={{ color: `#${icon.hex}` }}>
      <path fill="currentColor" d={icon.path} />
    </svg>
  );
}

const POSTED_FILTERS = [
  { id: "any", label: "Any time" },
  { id: "7", label: "Last 7 days" },
  { id: "30", label: "Last 30 days" },
];

function asMoney(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function money(value) {
  return value.toLocaleString("en-GH");
}

function formatBudget(campaign) {
  const min = asMoney(campaign.budgetMin);
  const max = asMoney(campaign.budgetMax);
  if (min != null && max != null) return `GH₵ ${money(min)} – ${money(max)}`;
  if (min != null) return `From GH₵ ${money(min)}`;
  if (max != null) return `Up to GH₵ ${money(max)}`;
  return "Budget not set";
}

function budgetCeiling(campaign) {
  return asMoney(campaign.budgetMax) ?? asMoney(campaign.budgetMin);
}

function matchesBudget(campaign, filter) {
  if (filter === "any") return true;
  const amount = budgetCeiling(campaign);
  if (amount == null) return false;
  if (filter === "under-1000") return amount < 1000;
  if (filter === "1000-5000") return amount >= 1000 && amount <= 5000;
  if (filter === "5000-plus") return amount > 5000;
  return true;
}

function matchesPosted(campaign, filter) {
  if (filter === "any") return true;
  const days = Number(filter);
  const created = new Date(campaign.createdAt).getTime();
  if (!Number.isFinite(created)) return false;
  return Date.now() - created <= days * 24 * 60 * 60 * 1000;
}

function talentHref(talent) {
  if (!talent?.id || !talent.specialty) return null;
  return `/talents/${encodeURIComponent(talent.specialty)}/${talent.id}`;
}

function FilterChoices({ legend, value, onChange, options, scrollable = false }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-900">{legend}</legend>
      <div className={cn("mt-2 space-y-0.5", scrollable && "max-h-40 overflow-y-auto pr-1")}>
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50",
                selected && "bg-[#f5f3ff] font-medium text-[#6d28d9]"
              )}
            >
              <span className="min-w-0 truncate">{option.label}</span>
              {selected ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span className="w-3.5 shrink-0" />}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function MetaItem({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      {children}
    </span>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f3ff] text-[#6d28d9]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function CampaignArt({ title }) {
  const letter = (title || "C").trim().charAt(0).toUpperCase() || "C";
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#6d28d9]">
      <div className="absolute -right-4 -top-6 h-16 w-16 rounded-full bg-white/15" />
      <div className="absolute bottom-2 left-3 text-2xl font-semibold text-white/80">{letter}</div>
    </div>
  );
}

export function CampaignsClient({ initialCampaigns = [] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [campaignTypes, setCampaignTypes] = useState([]);
  const [locationFilter, setLocationFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("any");
  const [postedFilter, setPostedFilter] = useState("any");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedId, setSelectedId] = useState(initialCampaigns[0]?.id || null);
  const [applyCampaign, setApplyCampaign] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const locationOptions = useMemo(() => {
    return [...new Set(initialCampaigns.map((campaign) => campaign.location).filter(Boolean))].sort();
  }, [initialCampaigns]);

  const filteredCampaigns = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = initialCampaigns.filter((campaign) => {
      const matchesSearch =
        !query ||
        campaign.title.toLowerCase().includes(query) ||
        campaign.brand.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query);
      const matchesCategory =
        campaignTypes.length === 0 || campaignTypes.some((typeId) => matchesCampaignType(campaign, typeId));
      const matchesLocation = locationFilter === "all" || campaign.location === locationFilter;
      const matchesPlatform = platformFilter === "all" || campaignPlatformIds(campaign).includes(platformFilter);
      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesPlatform &&
        matchesBudget(campaign, budgetFilter) &&
        matchesPosted(campaign, postedFilter)
      );
    });

    return list.sort((a, b) => {
      if (sortBy === "deadline") return new Date(a.deadline) - new Date(b.deadline);
      if (sortBy === "budget") return (budgetCeiling(b) || 0) - (budgetCeiling(a) || 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [initialCampaigns, searchQuery, campaignTypes, locationFilter, budgetFilter, postedFilter, platformFilter, sortBy]);

  const selected =
    filteredCampaigns.find((campaign) => campaign.id === selectedId) || filteredCampaigns[0] || null;
  const heroImage = initialCampaigns.find((campaign) => campaign.imageUrl)?.imageUrl || null;

  const toggleCampaignType = (typeId) => {
    setCampaignTypes((current) =>
      current.includes(typeId) ? current.filter((item) => item !== typeId) : [...current, typeId]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCampaignTypes([]);
    setLocationFilter("all");
    setBudgetFilter("any");
    setPostedFilter("any");
    setPlatformFilter("all");
  };

  const selectCampaign = (campaign) => {
    setSelectedId(campaign.id);
    document.getElementById("campaign-details")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleSubmitApplication = async (event) => {
    event.preventDefault();
    if (!applyCampaign) return;

    const formData = new FormData(event.target);
    formData.append("campaignId", applyCampaign.id);

    setIsSubmitting(true);
    try {
      const result = await applyToCampaign(formData);
      if (result?.success) {
        toast.success("Application submitted successfully!");
        setApplyCampaign(null);
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[90rem] px-4 pb-16 sm:px-6 lg:px-8">
      <section className="relative min-h-[17.5rem] overflow-hidden rounded-3xl bg-[#120f2d] text-white shadow-xl">
        {heroImage ? (
          <div className="absolute inset-y-0 right-0 hidden w-[48%] md:block">
            <Image src={heroImage} alt="" fill className="object-cover object-[center_20%]" sizes="640px" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-[#120f2d] via-[#120f2d]/75 to-[#120f2d]/25" />
          </div>
        ) : null}
        <div className="relative grid gap-8 px-6 py-8 md:grid-cols-[minmax(0,1fr)_17rem] md:px-10 md:py-10">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-200">Campaigns</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-[2.4rem] md:leading-tight">
              Find the right brief for your work
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
              Browse open campaigns, check the budget and deadline, and apply with the details the brand asked for.
            </p>
            <Link
              href="/client/campaigns"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#6d28d9] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5b21b6]"
            >
              <Megaphone className="h-4 w-4" />
              Post a campaign
            </Link>
          </div>
          <ul className="space-y-4 self-center text-sm">
            {[
              [ShieldCheck, "Verified creators", "Brands review applications from Payollar profiles."],
              [CreditCard, "Secure payments", "Bookings and payouts run through Paystack."],
              [BadgeCheck, "Clear briefs", "Budget, location, and deadline stay on the campaign."],
            ].map(([Icon, title, body]) => (
              <li key={title} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-violet-200">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-medium">{title}</span>
                  <span className="text-xs leading-snug text-white/65">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[22rem_minmax(0,1fr)_20rem]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-28">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Filter campaigns</h2>
            <button type="button" onClick={clearFilters} className="text-xs font-medium text-[#6d28d9] hover:underline">
              Clear all
            </button>
          </div>
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 text-sm text-slate-600 lg:hidden"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {filtersOpen ? "Hide filters" : "Show filters"}
          </button>
          <div className={cn("mt-4 space-y-5", filtersOpen ? "block" : "hidden lg:block")}>
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search title or brand"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm"
              />
            </label>
            <fieldset>
              <legend className="text-sm font-semibold text-slate-900">Campaign Type</legend>
              <div className="mt-3 space-y-2.5">
                {CAMPAIGN_TYPES.map((type) => (
                  <label key={type.id} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={campaignTypes.includes(type.id)}
                      onChange={() => toggleCampaignType(type.id)}
                      className="h-4 w-4 rounded border-slate-300 accent-[#6d28d9]"
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium text-slate-800">Platform</legend>
              <div className="mt-2 space-y-0.5">
                {PLATFORMS.map((platform) => {
                  const count = initialCampaigns.filter((campaign) => campaignPlatformIds(campaign).includes(platform.id)).length;
                  const selected = platformFilter === platform.id;
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => setPlatformFilter(platform.id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50",
                        selected && "bg-[#f5f3ff]"
                      )}
                    >
                      <PlatformGlyph icon={platform.icon} />
                      <span className="flex-1 text-left">{platform.label}</span>
                      <span className="text-xs text-slate-400">{count}</span>
                      {selected ? <Check className="h-3.5 w-3.5 text-[#6d28d9]" /> : <span className="w-3.5" />}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setPlatformFilter("all")}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50",
                    platformFilter === "all" && "bg-[#f5f3ff]"
                  )}
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[9px] font-semibold text-slate-500">
                    All
                  </span>
                  <span className="flex-1 text-left">All platforms</span>
                  {platformFilter === "all" ? <Check className="h-3.5 w-3.5 text-[#6d28d9]" /> : <span className="w-3.5" />}
                </button>
              </div>
            </fieldset>

            <FilterChoices
              legend="Budget"
              value={budgetFilter}
              onChange={setBudgetFilter}
              options={BUDGET_FILTERS}
            />

            <FilterChoices
              legend="Location"
              value={locationFilter}
              onChange={setLocationFilter}
              options={[{ id: "all", label: "Any location" }, ...locationOptions.map((location) => ({ id: location, label: location }))]}
              scrollable
            />

            <FilterChoices
              legend="Posted"
              value={postedFilter}
              onChange={setPostedFilter}
              options={POSTED_FILTERS}
            />
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Open campaigns</h2>
              <p className="text-sm text-slate-500">
                {filteredCampaigns.length} open {filteredCampaigns.length === 1 ? "brief" : "briefs"}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-500">
              Sort by
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort campaigns"
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800"
              >
                <option value="newest">Newest</option>
                <option value="deadline">Deadline</option>
                <option value="budget">Highest budget</option>
              </select>
            </label>
          </div>

          {filteredCampaigns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
              <h3 className="font-semibold">No campaigns match</h3>
              <p className="mt-1 text-sm text-slate-500">Clear a filter or check back when a new brief is posted.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredCampaigns.map((campaign) => {
                const active = selected?.id === campaign.id;
                return (
                  <li key={campaign.id}>
                    <article
                      className={cn(
                        "rounded-2xl border bg-white p-4 shadow-sm",
                        active ? "border-[#6d28d9] ring-1 ring-[#6d28d9]/20" : "border-slate-200"
                      )}
                    >
                      <div className="flex gap-4">
                        <div className="relative h-[5.5rem] w-[7.25rem] shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          {campaign.imageUrl ? (
                            <Image src={campaign.imageUrl} alt="" fill className="object-cover" sizes="140px" />
                          ) : (
                            <CampaignArt title={campaign.brand || campaign.title} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="flex items-center gap-1 text-sm font-medium text-slate-700">
                                {campaign.brand}
                              </p>
                              <h3 className="truncate text-base font-semibold text-slate-950">{campaign.title}</h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => selectCampaign(campaign)}
                              className="hidden shrink-0 rounded-lg border border-[#6d28d9]/30 px-3 py-1.5 text-sm font-medium text-[#6d28d9] hover:bg-[#f5f3ff] sm:inline-flex"
                            >
                              View details
                            </button>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {campaign.category ? (
                              <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                {campaignCategoryLabel(campaign)}
                              </span>
                            ) : null}
                            {PLATFORMS.filter((platform) => campaignPlatformIds(campaign).includes(platform.id)).map((platform) => (
                              <span key={platform.id} title={platform.label} className="inline-flex">
                                <PlatformGlyph icon={platform.icon} className="h-3.5 w-3.5" />
                              </span>
                            ))}
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{campaign.description}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3">
                        <MetaItem icon={Wallet}>{formatBudget(campaign)}</MetaItem>
                        <MetaItem icon={Users}>
                          {campaign.applicants || 0} {(campaign.applicants || 0) === 1 ? "applicant" : "applicants"}
                        </MetaItem>
                        <MetaItem icon={MapPin}>{campaignPlaceLabel(campaign)}</MetaItem>
                        <MetaItem icon={Calendar}>{format(new Date(campaign.deadline), "MMM d, yyyy")}</MetaItem>
                        <button
                          type="button"
                          onClick={() => selectCampaign(campaign)}
                          className="rounded-lg border border-[#6d28d9]/30 px-3 py-1.5 text-sm font-medium text-[#6d28d9] sm:hidden"
                        >
                          View details
                        </button>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside id="campaign-details" className="lg:sticky lg:top-28">
          {selected ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-slate-400">Campaign details</p>
                <h2 className="mt-2 text-xl font-semibold leading-snug text-slate-950">{selected.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{selected.brand}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {selected.category ? (
                    <span className="inline-flex rounded-full bg-[#f5f3ff] px-2.5 py-1 text-xs font-medium text-[#6d28d9]">
                      {campaignCategoryLabel(selected)}
                    </span>
                  ) : null}
                  {PLATFORMS.filter((platform) => campaignPlatformIds(selected).includes(platform.id)).map((platform) => (
                    <span key={platform.id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      <PlatformGlyph icon={platform.icon} className="h-3.5 w-3.5" />
                      {platform.label}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{selected.description}</p>
                <div className="mt-5 space-y-3">
                  <DetailRow icon={Wallet} label="Budget" value={formatBudget(selected)} />
                  <DetailRow icon={Users} label="Applicants" value={String(selected.applicants || 0)} />
                  <DetailRow icon={MapPin} label="Location" value={campaignPlaceLabel(selected)} />
                  <DetailRow icon={Calendar} label="Deadline" value={format(new Date(selected.deadline), "MMM d, yyyy")} />
                </div>
                {selected.requirements?.length > 0 ? (
                  <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm text-slate-600">
                    {selected.requirements.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#6d28d9]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <button
                  type="button"
                  onClick={() => setApplyCampaign(selected)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6d28d9] py-3 text-sm font-semibold text-white hover:bg-[#5b21b6]"
                >
                  Apply now
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Applicants ({selected.applicants || 0})</h3>
                </div>
                {selected.applications?.length > 0 ? (
                  <ul className="mt-3 space-y-3">
                    {selected.applications.map((application) => {
                      const talent = application.talent;
                      const href = talentHref(talent);
                      const row = (
                        <>
                          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-100">
                            {talent?.imageUrl ? (
                              <Image src={talent.imageUrl} alt="" fill className="object-cover" sizes="36px" />
                            ) : (
                              <span className="flex h-full items-center justify-center text-xs font-semibold text-slate-500">
                                {(talent?.name || "?").charAt(0).toUpperCase()}
                              </span>
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-1 text-sm font-medium text-slate-900">
                              <span className="truncate">{talent?.name || "Creator"}</span>
                              {talent?.verificationStatus === "VERIFIED" ? (
                                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                              ) : null}
                            </span>
                            {talent?.specialty ? (
                              <span className="block truncate text-xs text-slate-500">{talent.specialty}</span>
                            ) : null}
                          </span>
                        </>
                      );
                      return (
                        <li key={application.id}>
                          {href ? (
                            <Link href={href} className="flex items-center gap-3 rounded-xl hover:bg-slate-50">
                              {row}
                            </Link>
                          ) : (
                            <div className="flex items-center gap-3">{row}</div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No one has applied yet.</p>
                )}
              </div>
              <div className="rounded-2xl border border-violet-100 bg-[#f5f3ff] p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Before you apply</p>
                <ul className="mt-2 space-y-1.5">
                  <li>Say what you will deliver for this brief.</li>
                  <li>Add a portfolio or social link the brand can open.</li>
                  <li>Check the location and deadline before you send it.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
              Campaign details show here when a brief is open.
            </div>
          )}
        </aside>
      </div>

      <Dialog open={Boolean(applyCampaign)} onOpenChange={(open) => !open && setApplyCampaign(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl border-slate-200 bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-950">Apply to campaign</DialogTitle>
            <DialogDescription className="text-slate-500">
              {applyCampaign?.title} · {applyCampaign?.brand}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitApplication} className="mt-4 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name *</Label>
                <Input id="name" name="name" placeholder="Your full name" required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" placeholder="you@email.com" required className="rounded-xl" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" placeholder="+233 …" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="City, region" className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio / social links</Label>
              <Input id="portfolio" name="portfolio" placeholder="Instagram, YouTube, site…" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Relevant experience *</Label>
              <Textarea
                id="experience"
                name="experience"
                placeholder="Why you’re a fit for this campaign…"
                rows={4}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Your rate (GH₵)</Label>
              <Input id="rate" name="rate" type="number" placeholder="Expected compensation" min="0" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Textarea
                id="availability"
                name="availability"
                placeholder="Start dates, constraints…"
                rows={2}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Anything else?</Label>
              <Textarea id="additionalInfo" name="additionalInfo" placeholder="Optional details" rows={3} className="rounded-xl" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setApplyCampaign(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-full bg-[#6d28d9] font-semibold hover:bg-[#5b21b6]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit application"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
