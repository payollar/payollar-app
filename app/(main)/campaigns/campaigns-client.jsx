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

const PLATFORMS = [
  { id: "tiktok", label: "TikTok", icon: siTiktok, pattern: /tik\s?tok/i },
  { id: "instagram", label: "Instagram", icon: siInstagram, pattern: /instagram|\binsta\b/i },
  { id: "youtube", label: "YouTube", icon: siYoutube, pattern: /youtube|youtu\.be/i },
  { id: "facebook", label: "Facebook", icon: siFacebook, pattern: /facebook/i },
  { id: "x", label: "X", icon: siX, pattern: /twitter|\bx\.com\b/i },
];

const POSTED_FILTERS = [
  { id: "any", label: "Any time" },
  { id: "7", label: "Last 7 days" },
  { id: "30", label: "Last 30 days" },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [campaignTypes, setCampaignTypes] = useState([]);
  const [locationFilter, setLocationFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("any");
  const [postedFilter, setPostedFilter] = useState("any");
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
  }, [
    initialCampaigns,
    searchQuery,
    campaignTypes,
    locationFilter,
    budgetFilter,
    postedFilter,
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
    setBudgetFilter("any");
    setPostedFilter("any");
    setPlatformFilter("all");
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

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
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
                  const count = initialCampaigns.filter((campaign) =>
                    campaignPlatformIds(campaign).includes(platform.id)
                  ).length;
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
              options={[
                { id: "all", label: "Any location" },
                ...locationOptions.map((location) => ({ id: location, label: location })),
              ]}
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
              {filteredCampaigns.map((campaign) => (
                <li key={campaign.id}>
                  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-[#6d28d9]/35">
                    <div className="flex gap-4">
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="relative h-[5.5rem] w-[7.25rem] shrink-0 overflow-hidden rounded-xl bg-slate-100"
                      >
                        {campaign.imageUrl ? (
                          <Image src={campaign.imageUrl} alt="" fill className="object-cover" sizes="140px" />
                        ) : (
                          <CampaignArt title={campaign.brand || campaign.title} />
                        )}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="flex items-center gap-1 text-sm font-medium text-slate-700">
                              {campaign.brand}
                            </p>
                            <Link href={`/campaigns/${campaign.id}`} className="block">
                              <h3 className="truncate text-base font-semibold text-slate-950 hover:text-[#6d28d9]">
                                {campaign.title}
                              </h3>
                            </Link>
                          </div>
                          <Link
                            href={`/campaigns/${campaign.id}`}
                            className="hidden shrink-0 rounded-lg border border-[#6d28d9]/30 px-3 py-1.5 text-sm font-medium text-[#6d28d9] hover:bg-[#f5f3ff] sm:inline-flex"
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
                        className="rounded-lg border border-[#6d28d9]/30 px-3 py-1.5 text-sm font-medium text-[#6d28d9] sm:hidden"
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
