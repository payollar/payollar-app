"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  Calendar,
  Check,
  ChevronDown,
  Globe,
  Heart,
  MapPin,
  Music2,
  PanelTop,
  Radio,
  RotateCcw,
  Search,
  ShoppingCart,
  Star,
  Tv,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  loadMediaPlannerCart,
  mediaPlannerCartTotal,
  removeMediaPlannerCartItem,
} from "@/lib/media-planner-cart";

const CATEGORIES = [
  { id: "ALL", label: "All Media", icon: PanelTop },
  { id: "RADIO", label: "Radio", icon: Radio },
  { id: "TV", label: "Television", icon: Tv },
  { id: "DIGITAL", label: "Digital Media", icon: Globe },
  { id: "BILLBOARD", label: "Print & Outdoor", icon: PanelTop },
  { id: "INFLUENCER_MARKETING", label: "Music & Entertainment", icon: Music2 },
];

const TYPE_META = {
  TV: {
    label: "Television",
    href: "/products/tv-media",
    image: "/tv-media.jpg",
    available: true,
  },
  RADIO: {
    label: "Radio",
    href: "/products/radio-media",
    image: "/radio-media.jpg",
    available: true,
  },
  BILLBOARD: {
    label: "Outdoor",
    href: null,
    image: "/billboard.jpg",
    available: false,
  },
  DIGITAL: {
    label: "Digital",
    href: "/products/digital-media",
    image: "/social-media.jpg",
    available: true,
  },
  INFLUENCER_MARKETING: {
    label: "Influencer",
    href: "/products/influencer-marketing",
    image: "/bloggers.jpg",
    available: true,
  },
  VIDEO_CLIPPING: {
    label: "Clipping",
    href: "/products/video-clipping",
    image: "/clipping.jpg",
    available: true,
  },
};

const PRICE_MAX = 50000;

const REACH_OPTIONS = [
  { id: "any", label: "Any reach" },
  { id: "under_100k", label: "Under 100K", min: 0, max: 100_000 },
  { id: "100k_1m", label: "100K – 1M", min: 100_000, max: 1_000_000 },
  { id: "1m_5m", label: "1M – 5M", min: 1_000_000, max: 5_000_000 },
  { id: "5m_plus", label: "5M+", min: 5_000_000, max: Infinity },
];

function money(n) {
  return `₵${Number(n || 0).toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}

function parseListingPrice(listing) {
  const packagePrice = listing.packages?.[0]?.price;
  if (packagePrice != null && Number.isFinite(Number(packagePrice))) {
    return Number(packagePrice);
  }
  const raw = String(listing.priceRange || "").replace(/,/g, "");
  const nums = [...raw.matchAll(/(\d+(?:\.\d+)?)/g)].map((m) => Number(m[1]));
  if (!nums.length) return null;
  return Math.min(...nums);
}

function parseReachAudience(reach) {
  if (!reach) return null;
  const m = String(reach)
    .replace(/,/g, "")
    .match(/([\d.]+)\s*([kKmMbB])?/);
  if (!m) return null;
  let n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  const unit = (m[2] || "").toUpperCase();
  if (unit === "K") n *= 1_000;
  if (unit === "M") n *= 1_000_000;
  if (unit === "B") n *= 1_000_000_000;
  return n;
}

function flightLabel(item) {
  const channel = String(item.channel || "TV").toUpperCase();
  const format = item.adFormatLabel || "";
  return [item.rateCardTitle || channel, format].filter(Boolean).join(" · ");
}

function listingHref(listing) {
  const meta = TYPE_META[listing.listingType] || TYPE_META.TV;
  if (!meta.available || !meta.href) return null;
  if (listing.listingType === "TV" || listing.listingType === "RADIO") {
    return meta.href;
  }
  return `/media/schedule?type=${listing.listingType}&listing=${listing.id}`;
}

function listingImage(listing) {
  if (listing.imageUrl) return listing.imageUrl;
  return TYPE_META[listing.listingType]?.image || "/tv-media.jpg";
}

function ListingCard({ listing, favorited, onToggleFavorite }) {
  const meta = TYPE_META[listing.listingType] || TYPE_META.TV;
  const href = listingHref(listing);
  const rating = Number(listing.rating) || 0;
  const available = Boolean(href);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={listingImage(listing)}
          alt={listing.name}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-slate-950/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          {meta.label}
        </span>
        <button
          type="button"
          onClick={() => onToggleFavorite(listing.id)}
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm hover:text-rose-500"
          aria-label={favorited ? "Remove from favorites" : "Save listing"}
        >
          <Heart
            className={cn("h-3.5 w-3.5", favorited && "fill-rose-500 text-rose-500")}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="flex items-start gap-1.5">
          <h3 className="min-w-0 truncate text-[15px] font-semibold tracking-tight text-slate-950">
            {listing.name}
          </h3>
          {listing.agency?.verificationStatus === "VERIFIED" ? (
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
          ) : null}
        </div>

        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500">
          {listing.location ? (
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="h-3 w-3" />
              {listing.location}
            </span>
          ) : null}
          {listing.frequency ? (
            <>
              <span className="text-slate-300">·</span>
              <span>{listing.frequency}</span>
            </>
          ) : null}
        </p>

        {rating > 0 ? (
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-700">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {rating.toFixed(1)}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {listing.reach ? (
            <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600">
              <Users className="h-3 w-3 text-slate-400" />
              {listing.reach}
            </span>
          ) : null}
          {listing.location ? (
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600">
              {listing.location}
            </span>
          ) : null}
          {(listing.packages || []).length > 0 ? (
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600">
              {listing.packages.length} package
              {listing.packages.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              From
            </p>
            <p className="truncate text-sm font-semibold tabular-nums text-slate-950">
              {listing.priceRange ||
                (listing.packages?.[0]?.price
                  ? money(listing.packages[0].price)
                  : "Custom")}
            </p>
          </div>
          {available ? (
            <Button
              asChild
              className="h-9 shrink-0 rounded-full bg-slate-950 px-3.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Link href={href}>
                Book now
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              disabled
              variant="outline"
              className="h-9 shrink-0 rounded-full border-slate-200 px-3.5 text-xs text-slate-400"
            >
              Coming soon
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

const VALID_CATEGORIES = new Set(CATEGORIES.map((c) => c.id));

export function ProductsMediaBuying({ listings = [] }) {
  const searchParams = useSearchParams();
  const typeFromQuery = String(searchParams.get("type") || "")
    .trim()
    .toUpperCase();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(() =>
    VALID_CATEGORIES.has(typeFromQuery) ? typeFromQuery : "ALL"
  );
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [location, setLocation] = useState("all");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(PRICE_MAX);
  const [reach, setReach] = useState("any");
  const [availableFrom, setAvailableFrom] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [favorites, setFavorites] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (VALID_CATEGORIES.has(typeFromQuery)) {
      setCategory(typeFromQuery);
    }
  }, [typeFromQuery]);

  useEffect(() => {
    const refresh = () => setCartItems(loadMediaPlannerCart());
    refresh();
    window.addEventListener("media-planner-cart-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("media-planner-cart-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const counts = useMemo(() => {
    const map = { ALL: listings.length };
    for (const cat of CATEGORIES) {
      if (cat.id === "ALL") continue;
      map[cat.id] = listings.filter((l) => l.listingType === cat.id).length;
    }
    return map;
  }, [listings]);

  const locations = useMemo(() => {
    const set = new Set();
    for (const l of listings) {
      if (l.location) set.add(l.location);
    }
    return [...set].sort();
  }, [listings]);

  const filtered = useMemo(() => {
    let rows = [...listings];
    const reachOption = REACH_OPTIONS.find((o) => o.id === reach);

    if (category !== "ALL") {
      rows = rows.filter((l) => l.listingType === category);
    }
    if (selectedTypes.length > 0) {
      rows = rows.filter((l) => selectedTypes.includes(l.listingType));
    }
    if (location !== "all") {
      rows = rows.filter((l) => l.location === location);
    }
    if (priceMin > 0 || priceMax < PRICE_MAX) {
      rows = rows.filter((l) => {
        const price = parseListingPrice(l);
        if (price == null) return true;
        return price >= priceMin && price <= priceMax;
      });
    }
    if (reachOption && reachOption.id !== "any") {
      rows = rows.filter((l) => {
        const audience = parseReachAudience(l.reach);
        if (audience == null) return true;
        return audience >= reachOption.min && audience < reachOption.max;
      });
    }
    if (availableFrom) {
      // Listings without schedule windows stay visible; prefer ones with packages.
      rows = rows.filter((l) => (l.packages || []).length > 0 || Boolean(l.priceRange));
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((l) => {
        const hay = [
          l.name,
          l.location,
          l.frequency,
          l.reach,
          l.agency?.agencyName,
          l.listingType,
          l.priceRange,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    rows.sort((a, b) => {
      if (sortBy === "price_asc") {
        return (parseListingPrice(a) ?? Infinity) - (parseListingPrice(b) ?? Infinity);
      }
      if (sortBy === "price_desc") {
        return (parseListingPrice(b) ?? -Infinity) - (parseListingPrice(a) ?? -Infinity);
      }
      if (sortBy === "name") return String(a.name).localeCompare(String(b.name));
      if (sortBy === "rating") return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      return String(a.name).localeCompare(String(b.name));
    });

    return rows;
  }, [
    listings,
    category,
    selectedTypes,
    location,
    priceMin,
    priceMax,
    reach,
    availableFrom,
    query,
    sortBy,
  ]);

  const cartTotal = mediaPlannerCartTotal(cartItems);

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setLocation("all");
    setPriceMin(0);
    setPriceMax(PRICE_MAX);
    setReach("any");
    setAvailableFrom("");
    setSortBy("popular");
    setQuery("");
    setCategory("ALL");
  };

  const filtersActive =
    selectedTypes.length > 0 ||
    location !== "all" ||
    priceMin > 0 ||
    priceMax < PRICE_MAX ||
    reach !== "any" ||
    Boolean(availableFrom) ||
    sortBy !== "popular";

  const priceMinPct = (priceMin / PRICE_MAX) * 100;
  const priceMaxPct = (priceMax / PRICE_MAX) * 100;

  const fieldClass =
    "h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-9 text-sm text-slate-800 outline-none transition-colors focus:border-slate-400 focus:bg-white";

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="-mt-[5.25rem] min-h-dvh bg-[#f3f4f6] pt-[5.25rem] text-slate-900 md:-mt-28 md:pt-28">
      <div className="mx-auto max-w-[90rem] px-4 pb-20 pt-2 sm:px-6 sm:pt-4 lg:px-8">
        <header className="mb-6 sm:mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Media buying
          </p>
          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Browse media services
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
                Filter stations and channels, then book TV or radio flights into your media cart.
              </p>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search station, location, or media type…"
                className="h-11 rounded-full border-slate-200 bg-white pl-10 shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Category tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm",
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
                <span
                  className={cn(
                    "tabular-nums",
                    active ? "text-white/70" : "text-slate-400"
                  )}
                >
                  ({counts[cat.id] || 0})
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)_280px] xl:grid-cols-[240px_minmax(0,1fr)_300px]">
          {/* Filters */}
          <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:sticky lg:top-24 xl:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-950">Filter results</h2>
              <button
                type="button"
                onClick={resetFilters}
                disabled={!filtersActive}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                  filtersActive
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950"
                    : "cursor-default text-slate-300"
                )}
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              <div className="pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Media type
                </p>
                <ul className="mt-3 space-y-1">
                  {["RADIO", "TV", "DIGITAL", "BILLBOARD", "INFLUENCER_MARKETING"].map(
                    (type) => {
                      const checked = selectedTypes.includes(type);
                      return (
                        <li key={type}>
                          <button
                            type="button"
                            onClick={() => toggleType(type)}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm transition-colors",
                              checked
                                ? "bg-slate-950 text-white"
                                : "text-slate-700 hover:bg-slate-50"
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                                checked
                                  ? "border-white bg-white text-slate-950"
                                  : "border-slate-300 bg-white"
                              )}
                            >
                              {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                            </span>
                            <span className="min-w-0 flex-1 truncate">
                              {TYPE_META[type]?.label || type}
                            </span>
                            <span
                              className={cn(
                                "text-xs tabular-nums",
                                checked ? "text-white/60" : "text-slate-400"
                              )}
                            >
                              {counts[type] || 0}
                            </span>
                          </button>
                        </li>
                      );
                    }
                  )}
                </ul>
              </div>

              <div className="py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Location
                </p>
                <div className="relative mt-2.5">
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="all">All regions</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="py-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Price range
                  </p>
                  <p className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-700">
                    {money(priceMin)} –{" "}
                    {priceMax >= PRICE_MAX ? `${money(PRICE_MAX)}+` : money(priceMax)}
                  </p>
                </div>
                <div className="relative mt-5 h-6">
                  <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
                  <div
                    className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-900"
                    style={{
                      left: `${priceMinPct}%`,
                      width: `${Math.max(priceMaxPct - priceMinPct, 0)}%`,
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={PRICE_MAX}
                    step={500}
                    value={priceMin}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setPriceMin(Math.min(next, priceMax - 500));
                    }}
                    aria-label="Minimum price"
                    className="pointer-events-none absolute inset-0 z-20 m-0 h-full w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-slate-900 [&::-moz-range-thumb]:shadow [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-slate-900 [&::-webkit-slider-thumb]:shadow"
                  />
                  <input
                    type="range"
                    min={0}
                    max={PRICE_MAX}
                    step={500}
                    value={priceMax}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setPriceMax(Math.max(next, priceMin + 500));
                    }}
                    aria-label="Maximum price"
                    className="pointer-events-none absolute inset-0 z-30 m-0 h-full w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-slate-900 [&::-moz-range-thumb]:shadow [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-30 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-slate-900 [&::-webkit-slider-thumb]:shadow"
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] tabular-nums text-slate-400">
                  <span>₵0</span>
                  <span>₵50,000+</span>
                </div>
              </div>

              <div className="py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Audience reach
                </p>
                <div className="relative mt-2.5">
                  <select
                    value={reach}
                    onChange={(e) => setReach(e.target.value)}
                    className={fieldClass}
                  >
                    {REACH_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Available from
                </p>
                <div className="relative mt-2.5">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className={cn(fieldClass, "pl-9 pr-3")}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  {availableFrom
                    ? new Date(`${availableFrom}T00:00:00`).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Any date"}
                </p>
              </div>

              <div className="pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Sort by
                </p>
                <div className="relative mt-2.5">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="popular">Most popular</option>
                    <option value="rating">Highest rated</option>
                    <option value="price_asc">Price: low to high</option>
                    <option value="price_desc">Price: high to low</option>
                    <option value="name">Name A–Z</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          </aside>

          {/* Listings */}
          <div className="min-w-0 space-y-5">
            {/* Channel shortcuts (TV / Radio / Outdoor) hidden for now */}

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                <span className="font-semibold tabular-nums text-slate-900">
                  {filtered.length}
                </span>{" "}
                listing{filtered.length === 1 ? "" : "s"}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                <p className="text-base font-semibold text-slate-900">No listings match</p>
                <p className="mt-2 text-sm text-slate-500">
                  Try another filter, or start a TV or radio campaign directly.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Button asChild className="h-10 rounded-full bg-slate-950 px-4 hover:bg-slate-800">
                    <Link href="/products/tv-media">TV planner</Link>
                  </Button>
                  <Button asChild variant="outline" className="h-10 rounded-full border-slate-200 px-4">
                    <Link href="/products/radio-media">Radio planner</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    favorited={favorites.includes(listing.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <ShoppingCart className="h-4 w-4" />
                Your media cart
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-600">
                {cartItems.length} item{cartItems.length === 1 ? "" : "s"}
              </span>
            </div>

            {cartItems.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center">
                <p className="text-sm font-medium text-slate-700">Cart is empty</p>
                <p className="mt-1 text-xs text-slate-500">
                  Flights you add from the TV or radio planner show up here.
                </p>
              </div>
            ) : (
              <ul className="mt-4 max-h-[22rem] space-y-3 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                      {String(item.channel || "").toUpperCase() === "RADIO" ? (
                        <Radio className="h-4 w-4" />
                      ) : (
                        <Tv className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-900">
                        {item.mediaCampaignName || "Untitled"}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {flightLabel(item)}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold tabular-nums text-slate-900">
                        {money(item.total)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCartItems(removeMediaPlannerCartItem(item.id))}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-rose-600"
                      aria-label="Remove from cart"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 space-y-1.5 border-t border-dashed border-slate-200 pt-4 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-medium tabular-nums text-slate-800">
                  {money(cartTotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Taxes at checkout</span>
                <span className="font-medium tabular-nums text-slate-800">—</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-slate-950">
                <span>Total</span>
                <span className="tabular-nums">{money(cartTotal)}</span>
              </div>
            </div>

            <Button
              asChild
              className="mt-4 h-11 w-full rounded-full bg-slate-950 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Link href="/products/media-cart">
                {cartItems.length > 0 ? "Proceed to checkout" : "Open media cart"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="mt-2 h-10 w-full rounded-full border-slate-200 text-sm font-semibold text-slate-700"
            >
              <Link href="/products/media-cart#drafts">
                <Bookmark className="mr-2 h-3.5 w-3.5" />
                View drafts
              </Link>
            </Button>

            <div className="mt-4 rounded-xl bg-slate-50 px-3 py-3">
              <p className="text-xs font-semibold text-slate-800">Need help?</p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Start with TV or radio planners to build flights for a campaign.
              </p>
              <Link
                href="/products/tv-media"
                className="mt-2 inline-flex items-center text-[11px] font-semibold text-slate-900 hover:underline"
              >
                Open TV planner
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
