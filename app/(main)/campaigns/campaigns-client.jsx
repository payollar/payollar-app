"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
  BadgeCheck,
  Calendar,
  Check,
  CreditCard,
  MapPin,
  Megaphone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Wallet,
} from "lucide-react";
import { siFacebook, siInstagram, siTiktok, siX, siYoutube } from "simple-icons";
import { campaignCategoryLabel } from "@/lib/campaign-categories";
import { formatFollowerRange } from "@/lib/campaign-followers";
import { campaignPlaceLabel } from "@/lib/campaign-places";
import { cn } from "@/lib/utils";

const BUDGET_FILTERS = [
  { id: "any", label: "Any" },
  { id: "under-1000", label: "Under 1k" },
  { id: "1000-5000", label: "1k – 5k" },
  { id: "5000-plus", label: "5k+" },
];

const CAMPAIGN_TYPES = [
  { id: "influencer", label: "Influencer Campaigns" },
  { id: "content", label: "Content Creation" },
  { id: "event", label: "Event Coverage" },
  { id: "ambassador", label: "Brand Ambassadors" },
  { id: "takeover", label: "Social Media Takeovers" },
  { id: "review", label: "Product Reviews" },
];

const PLATFORMS = [
  { id: "tiktok", label: "TikTok", icon: siTiktok, pattern: /tik\s?tok/i },
  { id: "instagram", label: "Instagram", icon: siInstagram, pattern: /instagram|\binsta\b/i },
  { id: "youtube", label: "YouTube", icon: siYoutube, pattern: /youtube|youtu\.be/i },
  { id: "facebook", label: "Facebook", icon: siFacebook, pattern: /facebook/i },
  { id: "x", label: "X", icon: siX, pattern: /twitter|\bx\.com\b/i },
];

const POSTED_FILTERS = [
  { id: "any", label: "Any time" },
  { id: "7", label: "7 days" },
  { id: "30", label: "30 days" },
];

const filterSelectedClass =
  "bg-slate-950 font-medium text-white hover:bg-slate-800 hover:text-white";
const filterIdleClass =
  "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-950";
const filterInputClass =
  "h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5";

function campaignHaystack(campaign) {
  return [campaign.title, campaign.description, campaign.category, campaign.subcategory, ...(campaign.requirements || [])]
    .filter(Boolean)
    .join(" ");
}

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

function campaignBudgetTouchesRange(campaign, min, max) {
  const campMin = asMoney(campaign.budgetMin);
  const campMax = asMoney(campaign.budgetMax);
  if (campMin == null && campMax == null) return false;
  const low = campMin ?? campMax;
  const high = campMax ?? campMin;
  if (min != null && high < min) return false;
  if (max != null && low > max) return false;
  return true;
}

function matchesBudget(campaign, filter, customMin, customMax) {
  if (filter === "any") return true;
  if (filter === "custom") {
    const min = asMoney(customMin);
    const max = asMoney(customMax);
    if (min == null && max == null) return true;
    return campaignBudgetTouchesRange(campaign, min, max);
  }
  const amount = budgetCeiling(campaign);
  if (amount == null) return false;
  if (filter === "under-1000") return amount < 1000;
  if (filter === "1000-5000") return amount >= 1000 && amount <= 5000;
  if (filter === "5000-plus") return amount > 5000;
  return true;
}

function matchesPosted(campaign, filter, customDays) {
  if (filter === "any") return true;
  const days =
    filter === "custom" ? asMoney(customDays) : Number(filter);
  if (days == null || !Number.isFinite(days) || days <= 0) {
    return filter === "custom";
  }
  const created = new Date(campaign.createdAt).getTime();
  if (!Number.isFinite(created)) return false;
  return Date.now() - created <= days * 24 * 60 * 60 * 1000;
}

function matchesLocation(campaign, filter, customLocation) {
  if (filter === "all") return true;
  if (filter === "custom") {
    const query = String(customLocation || "").trim().toLowerCase();
    if (!query) return true;
    const place = `${campaign.location || ""} ${campaignPlaceLabel(campaign)}`.toLowerCase();
    return place.includes(query);
  }
  return campaign.location === filter;
}

function FilterSection({ icon: Icon, title, children }) {
  return (
    <fieldset className="rounded-2xl border border-slate-200 bg-[#f7f8fc] p-3.5">
      <legend className="flex items-center gap-2 px-0.5 text-sm font-semibold text-slate-900">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-700 shadow-sm ring-1 ring-slate-200/80">
          <Icon className="h-3.5 w-3.5" />
        </span>
        {title}
      </legend>
      <div className="mt-3 space-y-3">{children}</div>
    </fieldset>
  );
}

function FilterChips({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              selected
                ? "border-slate-950 bg-slate-950 text-white hover:border-slate-800 hover:bg-slate-800 hover:text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
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

function CampaignArt({ title }) {
  const letter = (title || "C").trim().charAt(0).toUpperCase() || "C";
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
      <div className="absolute -right-4 -top-6 h-16 w-16 rounded-full bg-[#0055ff]/20" />
      <div className="absolute bottom-2 left-3 text-2xl font-semibold text-white/80">{letter}</div>
    </div>
  );
}

export function CampaignsClient({ initialCampaigns = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [campaignTypes, setCampaignTypes] = useState([]);
  const [locationFilter, setLocationFilter] = useState("all");
  const [customLocation, setCustomLocation] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("any");
  const [customBudgetMin, setCustomBudgetMin] = useState("");
  const [customBudgetMax, setCustomBudgetMax] = useState("");
  const [postedFilter, setPostedFilter] = useState("any");
  const [customPostedDays, setCustomPostedDays] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
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
      const matchesPlatform =
        platformFilter === "all" || campaignPlatformIds(campaign).includes(platformFilter);
      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation(campaign, locationFilter, customLocation) &&
        matchesPlatform &&
        matchesBudget(campaign, budgetFilter, customBudgetMin, customBudgetMax) &&
        matchesPosted(campaign, postedFilter, customPostedDays)
      );
    });

    return list.sort((a, b) => {
      if (sortBy === "deadline") return new Date(a.deadline) - new Date(b.deadline);
      if (sortBy === "budget") return (budgetCeiling(b) || 0) - (budgetCeiling(a) || 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [
    initialCampaigns,
    searchQuery,
    campaignTypes,
    locationFilter,
    customLocation,
    budgetFilter,
    customBudgetMin,
    customBudgetMax,
    postedFilter,
    customPostedDays,
    platformFilter,
    sortBy,
  ]);

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
    setCustomLocation("");
    setBudgetFilter("any");
    setCustomBudgetMin("");
    setCustomBudgetMax("");
    setPostedFilter("any");
    setCustomPostedDays("");
    setPlatformFilter("all");
  };

  return (
    <div className="mx-auto max-w-[90rem] px-4 pb-16 sm:px-6 lg:px-8">
      <section className="relative min-h-[17.5rem] overflow-hidden rounded-3xl bg-slate-950 text-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.45)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,85,255,0.22),_transparent_55%)]" />
        {heroImage ? (
          <div className="absolute inset-y-0 right-0 hidden w-[48%] md:block">
            <Image src={heroImage} alt="" fill className="object-cover object-[center_20%]" sizes="640px" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/30" />
          </div>
        ) : null}
        <div className="relative grid gap-8 px-6 py-8 md:grid-cols-[minmax(0,1fr)_17rem] md:px-10 md:py-10">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8eb6ff]">
              Campaigns
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-[2.4rem] md:leading-tight">
              Find the right brief for your work
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">
              Browse open campaigns, check the budget and deadline, and apply with the details the brand asked for.
            </p>
            <Link
              href="/client/campaigns"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0055ff] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0046d6]"
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
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/8 text-[#8eb6ff] ring-1 ring-white/10">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-medium">{title}</span>
                  <span className="text-xs leading-snug text-slate-400">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-28">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Filter campaigns</h2>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-slate-600 hover:text-slate-950 hover:underline"
            >
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
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
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
                      className="h-4 w-4 rounded border-slate-300 accent-slate-950"
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-slate-900">Platform</legend>
              <div className="mt-2 space-y-0.5">
                {PLATFORMS.map((platform) => {
                  const count = initialCampaigns.filter((campaign) =>
                    campaignPlatformIds(campaign).includes(platform.id)
                  ).length;
                  const selected = platformFilter === platform.id;
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => setPlatformFilter(platform.id)}
                      className={cn(filterIdleClass, "gap-2.5 px-1.5", selected && filterSelectedClass)}
                    >
                      <PlatformGlyph icon={platform.icon} />
                      <span className="flex-1 text-left">{platform.label}</span>
                      <span className={cn("text-xs", selected ? "text-white/60" : "text-slate-400")}>
                        {count}
                      </span>
                      {selected ? <Check className="h-3.5 w-3.5" /> : <span className="w-3.5" />}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setPlatformFilter("all")}
                  className={cn(filterIdleClass, "gap-2.5 px-1.5", platformFilter === "all" && filterSelectedClass)}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border text-[9px] font-semibold",
                      platformFilter === "all"
                        ? "border-white/40 text-white"
                        : "border-slate-300 text-slate-500"
                    )}
                  >
                    All
                  </span>
                  <span className="flex-1 text-left">All platforms</span>
                  {platformFilter === "all" ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span className="w-3.5" />
                  )}
                </button>
              </div>
            </fieldset>

            <FilterSection icon={Wallet} title="Budget">
              <FilterChips
                value={budgetFilter === "custom" ? null : budgetFilter}
                onChange={(id) => {
                  setBudgetFilter(id);
                  setCustomBudgetMin("");
                  setCustomBudgetMax("");
                }}
                options={BUDGET_FILTERS}
              />
              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Or custom GH₵ range
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <label className="space-y-1">
                    <span className="text-xs text-slate-500">Min</span>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        ₵
                      </span>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={customBudgetMin}
                        onChange={(event) => {
                          setCustomBudgetMin(event.target.value);
                          setBudgetFilter("custom");
                        }}
                        placeholder="0"
                        className={cn(filterInputClass, "pl-6")}
                      />
                    </div>
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-slate-500">Max</span>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        ₵
                      </span>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={customBudgetMax}
                        onChange={(event) => {
                          setCustomBudgetMax(event.target.value);
                          setBudgetFilter("custom");
                        }}
                        placeholder="Any"
                        className={cn(filterInputClass, "pl-6")}
                      />
                    </div>
                  </label>
                </div>
              </div>
            </FilterSection>

            <FilterSection icon={MapPin} title="Location">
              <FilterChips
                value={locationFilter === "custom" ? null : locationFilter}
                onChange={(id) => {
                  setLocationFilter(id);
                  setCustomLocation("");
                }}
                options={[
                  { id: "all", label: "Any" },
                  ...locationOptions.map((location) => ({ id: location, label: location })),
                ]}
              />
              <label className="block space-y-1.5">
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Or type a place
                </span>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(event) => {
                      setCustomLocation(event.target.value);
                      setLocationFilter("custom");
                    }}
                    placeholder="e.g. Kumasi, Tamale"
                    className={cn(filterInputClass, "pl-8")}
                  />
                </div>
              </label>
            </FilterSection>

            <FilterSection icon={Calendar} title="Posted">
              <FilterChips
                value={postedFilter === "custom" ? null : postedFilter}
                onChange={(id) => {
                  setPostedFilter(id);
                  setCustomPostedDays("");
                }}
                options={POSTED_FILTERS}
              />
              <label className="block space-y-1.5">
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Or within days
                </span>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    value={customPostedDays}
                    onChange={(event) => {
                      setCustomPostedDays(event.target.value);
                      setPostedFilter("custom");
                    }}
                    placeholder="e.g. 14"
                    className={cn(filterInputClass, "pr-12")}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    days
                  </span>
                </div>
              </label>
            </FilterSection>
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
              <h3 className="font-semibold text-slate-950">No campaigns match</h3>
              <p className="mt-1 text-sm text-slate-500">
                Clear a filter or check back when a new brief is posted.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredCampaigns.map((campaign) => (
                <li key={campaign.id}>
                  <article className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.03)] transition-all hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
                    <div className="flex gap-4">
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="relative h-[5.5rem] w-[7.25rem] shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80"
                      >
                        {campaign.imageUrl ? (
                          <Image
                            src={campaign.imageUrl}
                            alt=""
                            fill
                            className="object-cover transition duration-300 group-hover:scale-[1.03]"
                            sizes="140px"
                          />
                        ) : (
                          <CampaignArt title={campaign.brand || campaign.title} />
                        )}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-500">{campaign.brand}</p>
                            <Link href={`/campaigns/${campaign.id}`} className="block">
                              <h3 className="truncate text-base font-semibold text-slate-950 transition-colors group-hover:text-[#0055ff]">
                                {campaign.title}
                              </h3>
                            </Link>
                          </div>
                          <Link
                            href={`/campaigns/${campaign.id}`}
                            className="hidden shrink-0 items-center rounded-full bg-[#0055ff] px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#0046d6] sm:inline-flex"
                          >
                            View details
                          </Link>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {campaign.category ? (
                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                              {campaignCategoryLabel(campaign)}
                            </span>
                          ) : null}
                          {PLATFORMS.filter((platform) =>
                            campaignPlatformIds(campaign).includes(platform.id)
                          ).map((platform) => (
                            <span key={platform.id} title={platform.label} className="inline-flex">
                              <PlatformGlyph icon={platform.icon} className="h-3.5 w-3.5" />
                            </span>
                          ))}
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                          {campaign.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3">
                      <MetaItem icon={Wallet}>{formatBudget(campaign)}</MetaItem>
                      {formatFollowerRange(campaign) ? (
                        <MetaItem icon={Users}>{formatFollowerRange(campaign)}</MetaItem>
                      ) : (
                        <MetaItem icon={Users}>
                          {campaign.applicants || 0}{" "}
                          {(campaign.applicants || 0) === 1 ? "applicant" : "applicants"}
                        </MetaItem>
                      )}
                      <MetaItem icon={MapPin}>{campaignPlaceLabel(campaign)}</MetaItem>
                      <MetaItem icon={Calendar}>
                        {format(new Date(campaign.deadline), "MMM d, yyyy")}
                      </MetaItem>
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="ml-auto inline-flex rounded-full bg-[#0055ff] px-3.5 py-1.5 text-sm font-semibold text-white sm:hidden"
                      >
                        View details
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
