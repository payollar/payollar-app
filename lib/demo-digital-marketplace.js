/**
 * Demo digital media publishers for the marketplace when live DIGITAL
 * inventory is thin. Marked with `isDemo: true` so UI can label them.
 */
export const DEMO_DIGITAL_MARKETPLACE = [
  {
    id: "demo-joy-online",
    listingType: "DIGITAL",
    name: "Joy Online",
    network: "Multimedia Group",
    location: "Ghana",
    frequency: "News · Digital",
    description:
      "Ghana’s leading digital news publisher. Homepage takeovers, article sponsorships, and newsletter integrations.",
    reach: "2.5M monthly",
    demographics: ["News readers", "Professionals", "18–45"],
    imageUrl: "/social-media.jpg",
    logoText: "Joy",
    logoTone: "rose",
    priceRange: "₵2,500+",
    rating: 4.8,
    isDemo: true,
    tags: ["News", "Digital", "Ghana"],
    packages: [
      { id: "joy-hp", name: "Homepage takeover", price: 8500, duration: "24 hours", spots: 1 },
      { id: "joy-article", name: "Sponsored article", price: 3500, duration: "7 days", spots: 1 },
      { id: "joy-nl", name: "Newsletter feature", price: 2500, duration: "1 send", spots: 1 },
    ],
    /** Weekly-priced ad units for the Build Your Quote flow */
    quoteAdTypes: [
      {
        id: "joy-homepage-banner-top",
        label: "Homepage Banner (Top)",
        weeklyRate: 4500,
        defaultImpressions: 100000,
        unit: "views",
      },
      {
        id: "joy-homepage-takeover",
        label: "Homepage takeover",
        weeklyRate: 8500,
        defaultImpressions: 250000,
        unit: "views",
      },
      {
        id: "joy-sponsored-article",
        label: "Sponsored article",
        weeklyRate: 3500,
        defaultImpressions: 80000,
        unit: "views",
      },
      {
        id: "joy-newsletter",
        label: "Newsletter feature",
        weeklyRate: 2500,
        defaultImpressions: 45000,
        unit: "sends",
      },
    ],
    agency: {
      id: null,
      agencyName: "Joy Online",
      verificationStatus: "VERIFIED",
    },
  },
  {
    id: "demo-citi-digital",
    listingType: "DIGITAL",
    name: "Citi Digital",
    network: "Citi FM / Channel One",
    location: "Accra",
    frequency: "News · Business",
    description:
      "Business and current-affairs digital inventory across Citi’s web and social properties.",
    reach: "1.8M monthly",
    demographics: ["Business", "Urban professionals"],
    imageUrl: "/social-media.jpg",
    logoText: "citi",
    logoTone: "slate",
    priceRange: "₵3,000+",
    rating: 4.7,
    isDemo: true,
    tags: ["News", "Business", "Ghana"],
    packages: [
      { id: "citi-banner", name: "ROS banner flight", price: 4500, duration: "7 days", spots: 1 },
      { id: "citi-story", name: "Branded news story", price: 5000, duration: "5 days", spots: 1 },
      { id: "citi-social", name: "Social amplification", price: 3000, duration: "3 posts", spots: 3 },
    ],
    quoteAdTypes: [
      {
        id: "citi-ros-banner",
        label: "ROS banner flight",
        weeklyRate: 4500,
        defaultImpressions: 120000,
        unit: "views",
      },
      {
        id: "citi-branded-story",
        label: "Branded news story",
        weeklyRate: 5000,
        defaultImpressions: 90000,
        unit: "views",
      },
      {
        id: "citi-social",
        label: "Social amplification",
        weeklyRate: 3000,
        defaultImpressions: 60000,
        unit: "views",
      },
    ],
    agency: {
      id: null,
      agencyName: "Citi Digital",
      verificationStatus: "VERIFIED",
    },
  },
  {
    id: "demo-ghanaweb",
    listingType: "DIGITAL",
    name: "GhanaWeb",
    network: "GhanaWeb",
    location: "Nationwide",
    frequency: "News · Lifestyle",
    description:
      "High-traffic Ghanaian portal for news and lifestyle. Display, native, and section sponsorships.",
    reach: "4.1M monthly",
    demographics: ["General audience", "Lifestyle"],
    imageUrl: "/social-media.jpg",
    logoText: "GW",
    logoTone: "emerald",
    priceRange: "₵2,000+",
    rating: 4.6,
    isDemo: true,
    tags: ["News", "Lifestyle", "Ghana"],
    packages: [
      { id: "gw-display", name: "Sitewide display", price: 4000, duration: "7 days", spots: 1 },
      { id: "gw-native", name: "Native content", price: 3200, duration: "7 days", spots: 1 },
      { id: "gw-section", name: "Section sponsorship", price: 7500, duration: "14 days", spots: 1 },
    ],
    quoteAdTypes: [
      {
        id: "gw-sitewide",
        label: "Sitewide display",
        weeklyRate: 4000,
        defaultImpressions: 200000,
        unit: "views",
      },
      {
        id: "gw-native",
        label: "Native content",
        weeklyRate: 3200,
        defaultImpressions: 75000,
        unit: "views",
      },
      {
        id: "gw-section",
        label: "Section sponsorship",
        weeklyRate: 3750,
        defaultImpressions: 150000,
        unit: "views",
      },
    ],
    agency: {
      id: null,
      agencyName: "GhanaWeb",
      verificationStatus: "VERIFIED",
    },
  },
  {
    id: "demo-morning-brief",
    listingType: "DIGITAL",
    name: "Morning Brief Show",
    network: "Payollar Digital",
    location: "YouTube · Instagram",
    frequency: "Daily digital show",
    description:
      "Weekday digital morning show. Sponsored segments, host reads, and clip packages for brands.",
    reach: "320K avg viewers",
    demographics: ["Professionals", "Weekday mornings"],
    imageUrl: "/social-media.jpg",
    logoText: "MB",
    logoTone: "blue",
    priceRange: "₵4,500+",
    rating: 4.9,
    isDemo: true,
    tags: ["Show", "YouTube", "Instagram"],
    packages: [
      { id: "mb-single", name: "Single episode", price: 4500, duration: "1 episode", spots: 1 },
      { id: "mb-week", name: "Weekly flight", price: 18000, duration: "4 episodes", spots: 4 },
      { id: "mb-season", name: "Season partner", price: 55000, duration: "Season", spots: 12 },
    ],
    quoteAdTypes: [
      {
        id: "mb-sponsored-segment",
        label: "Sponsored segment",
        weeklyRate: 4500,
        defaultImpressions: 320000,
        unit: "views",
      },
      {
        id: "mb-host-read",
        label: "Host read",
        weeklyRate: 3800,
        defaultImpressions: 280000,
        unit: "views",
      },
      {
        id: "mb-weekly-flight",
        label: "Weekly flight (4 episodes)",
        weeklyRate: 18000,
        defaultImpressions: 900000,
        unit: "views",
      },
    ],
    agency: {
      id: null,
      agencyName: "Morning Brief",
      verificationStatus: "VERIFIED",
    },
  },
  {
    id: "demo-pulse-gh",
    listingType: "DIGITAL",
    name: "Pulse Ghana",
    network: "Pulse",
    location: "Ghana",
    frequency: "Entertainment · Lifestyle",
    description:
      "Youth-focused entertainment and culture coverage with social-first distribution.",
    reach: "1.2M monthly",
    demographics: ["18–34", "Entertainment"],
    imageUrl: "/social-media.jpg",
    logoText: "Pulse",
    logoTone: "violet",
    priceRange: "₵2,800+",
    rating: 4.5,
    isDemo: true,
    tags: ["Entertainment", "Youth", "Social"],
    packages: [
      { id: "pulse-feature", name: "Feature package", price: 2800, duration: "5 days", spots: 1 },
      { id: "pulse-social", name: "Social takeover", price: 5500, duration: "3 days", spots: 5 },
    ],
    quoteAdTypes: [
      {
        id: "pulse-feature",
        label: "Feature package",
        weeklyRate: 2800,
        defaultImpressions: 90000,
        unit: "views",
      },
      {
        id: "pulse-social",
        label: "Social takeover",
        weeklyRate: 5500,
        defaultImpressions: 150000,
        unit: "views",
      },
    ],
    agency: {
      id: null,
      agencyName: "Pulse Ghana",
      verificationStatus: "VERIFIED",
    },
  },
];

export const DIGITAL_QUOTE_DURATIONS = [
  { id: "1w", label: "1 week", weeks: 1 },
  { id: "2w", label: "2 weeks", weeks: 2 },
  { id: "3w", label: "3 weeks", weeks: 3 },
  { id: "4w", label: "4 weeks", weeks: 4 },
  { id: "6w", label: "6 weeks", weeks: 6 },
  { id: "8w", label: "8 weeks", weeks: 8 },
];

const LOGO_TONES = {
  rose: "bg-rose-500 text-white",
  slate: "bg-slate-900 text-white",
  emerald: "bg-emerald-600 text-white",
  blue: "bg-[#0055ff] text-white",
  violet: "bg-violet-600 text-white",
};

export function digitalLogoToneClass(tone) {
  return LOGO_TONES[tone] || LOGO_TONES.blue;
}

export function findDigitalPublisher(publisherKey) {
  const key = String(publisherKey || "")
    .trim()
    .toLowerCase();
  if (!key) return null;
  return (
    DEMO_DIGITAL_MARKETPLACE.find(
      (item) =>
        item.id === key ||
        item.id === `demo-${key}` ||
        item.id.replace(/^demo-/, "") === key ||
        String(item.name || "")
          .toLowerCase()
          .replace(/\s+/g, "-") === key
    ) || null
  );
}

const PUBLISHER_CACHE_PREFIX = "digital-publisher:";

/** Normalize a live MediaListing into marketplace/quote publisher shape. */
export function liveListingToDigitalPublisher(listing) {
  if (!listing?.id) return null;
  const name = listing.name || "Digital publisher";
  const logoText = String(name)
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return {
    id: listing.id,
    listingType: listing.listingType || "DIGITAL",
    name,
    network: listing.network || listing.agency?.agencyName || null,
    location: listing.location,
    frequency: listing.frequency || "Digital",
    description: listing.description,
    reach: listing.reach,
    demographics: listing.demographics || [],
    imageUrl: listing.imageUrl,
    logoText,
    logoTone: "blue",
    priceRange: listing.priceRange,
    rating: listing.rating,
    isDemo: false,
    tags: ["Digital", listing.location].filter(Boolean),
    packages: listing.packages || [],
    agency: listing.agency
      ? {
          id: listing.agency.id,
          agencyName: listing.agency.agencyName,
          verificationStatus: listing.agency.verificationStatus,
        }
      : null,
  };
}

export function cacheDigitalPublisher(publisher) {
  if (!publisher?.id || typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      `${PUBLISHER_CACHE_PREFIX}${publisher.id}`,
      JSON.stringify(publisher)
    );
  } catch {
    /* ignore */
  }
}

export function readCachedDigitalPublisher(publisherKey) {
  if (!publisherKey || typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem(`${PUBLISHER_CACHE_PREFIX}${publisherKey}`) ||
      sessionStorage.getItem(
        `${PUBLISHER_CACHE_PREFIX}demo-${publisherKey}`
      );
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function looksLikeDemoPublisherKey(key) {
  const k = String(key || "").trim().toLowerCase();
  if (!k) return false;
  if (k.startsWith("demo-")) return true;
  return Boolean(findDigitalPublisher(k));
}

/**
 * Resolve demo or live DIGITAL publisher for quote/negotiate.
 * Live listings are fetched from /api/media/listings/[id] (cache is fallback only).
 */
export async function resolveDigitalPublisher(publisherKey) {
  const key = String(publisherKey || "").trim();
  if (!key) return null;

  const demo = findDigitalPublisher(key);
  if (demo) return demo;

  // Prefer network for live IDs so package updates aren't stuck in sessionStorage
  if (!looksLikeDemoPublisherKey(key)) {
    try {
      const res = await fetch(`/api/media/listings/${encodeURIComponent(key)}`);
      if (res.ok) {
        const data = await res.json();
        const publisher = liveListingToDigitalPublisher(data.listing);
        if (publisher) {
          cacheDigitalPublisher(publisher);
          return publisher;
        }
      }
    } catch {
      /* fall through to cache */
    }
  }

  const cached = readCachedDigitalPublisher(key);
  if (cached) return cached;

  try {
    const res = await fetch(`/api/media/listings/${encodeURIComponent(key)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const publisher = liveListingToDigitalPublisher(data.listing);
    if (publisher) cacheDigitalPublisher(publisher);
    return publisher;
  } catch {
    return null;
  }
}

/** Derive marketplace "From ₵X+" when listing.priceRange is empty. */
export function priceRangeFromPackages(packages = []) {
  const prices = (packages || [])
    .map((pkg) => Number(pkg.price))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!prices.length) return null;
  const min = Math.min(...prices);
  return `₵${min.toLocaleString("en-GH", { maximumFractionDigits: 0 })}+`;
}

function parseImpressionsFromReach(reach) {
  if (!reach) return 50000;
  const m = String(reach)
    .replace(/,/g, "")
    .match(/([\d.]+)\s*([kKmMbB])?/);
  if (!m) return 50000;
  let n = Number(m[1]);
  if (!Number.isFinite(n)) return 50000;
  const unit = (m[2] || "").toUpperCase();
  if (unit === "K") n *= 1_000;
  if (unit === "M") n *= 1_000_000;
  if (unit === "B") n *= 1_000_000_000;
  // Monthly reach → rough weekly impressions for quote defaults
  return Math.max(10000, Math.round(n / 4));
}

/** Quote options for a publisher — prefers quoteAdTypes, falls back to packages. */
export function digitalPublisherQuoteAdTypes(publisher) {
  if (Array.isArray(publisher?.quoteAdTypes) && publisher.quoteAdTypes.length) {
    return publisher.quoteAdTypes;
  }
  const defaultImpressions = parseImpressionsFromReach(publisher?.reach);
  return (publisher?.packages || []).map((pkg) => ({
    id: pkg.id || pkg.name,
    label: pkg.name,
    // Package price is the list rate used as weekly base for flight estimates
    weeklyRate: Number(pkg.price) || 0,
    defaultImpressions: defaultImpressions,
    unit: "views",
    durationHint: pkg.duration || null,
  }));
}

/** Merge live DIGITAL listings with demos (demos fill gaps; avoid duplicate names). */
export function withDigitalMarketplaceDemos(listings = []) {
  const live = Array.isArray(listings) ? listings : [];
  const liveDigitalNames = new Set(
    live
      .filter((l) => l.listingType === "DIGITAL")
      .map((l) => String(l.name || "").trim().toLowerCase())
  );

  const demosToAdd = DEMO_DIGITAL_MARKETPLACE.filter(
    (demo) => !liveDigitalNames.has(String(demo.name).trim().toLowerCase())
  );

  return [...live, ...demosToAdd];
}

/** Marketplace browse URL — Digital Media tab on /products. */
export function digitalMarketplaceHref(listing) {
  const params = new URLSearchParams();
  params.set("type", "DIGITAL");
  if (listing?.isDemo) {
    params.set("demo", String(listing.id).replace(/^demo-/, ""));
  } else if (listing?.id) {
    params.set("listing", listing.id);
  }
  if (listing?.rateCardId) params.set("rateCard", listing.rateCardId);
  return `/products?${params.toString()}`;
}

/** Build Your Quote page for a publisher. */
export function digitalQuoteBuilderHref(listing, { adTypeId } = {}) {
  const params = new URLSearchParams();
  const publisherKey = listing?.isDemo
    ? String(listing.id).replace(/^demo-/, "")
    : listing?.id || "";
  if (publisherKey) params.set("publisher", publisherKey);
  if (adTypeId) params.set("adType", adTypeId);
  const qs = params.toString();
  return qs ? `/products/digital-quote?${qs}` : "/products/digital-quote";
}
