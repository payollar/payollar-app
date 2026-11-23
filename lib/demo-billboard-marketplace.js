/**
 * Demo outdoor / billboard sites for the Billboard marketplace workflow.
 */

export const BILLBOARD_CATEGORIES = [
  { id: "ALL", label: "All OOH" },
  { id: "STATIC", label: "Billboards" },
  { id: "DIGITAL_OOH", label: "Digital OOH" },
  { id: "TRANSIT", label: "Transit" },
  { id: "OTHER", label: "Other" },
];

/** Single demo site so the marketplace isn’t crowded — owned by Payollar Media. */
export const DEMO_BILLBOARD_SITES = [
  {
    id: "bb-airport-roundabout",
    listingType: "BILLBOARD",
    name: "Airport Roundabout",
    category: "STATIC",
    location: "Airport Roundabout, Accra",
    city: "Accra",
    latitude: 5.605,
    longitude: -0.1675,
    size: "12m × 6m",
    boardType: "Static Billboard",
    orientation: "Dual-facing",
    traffic: "Est. daily traffic ~145,000 vehicles",
    reach: "145K daily",
    description:
      "High-traffic location near Kotoka International Airport — premium visibility for arrivals and city-bound traffic. Demo inventory from Payollar Media.",
    status: "AVAILABLE",
    statusLabel: "Available",
    imageUrl: "/billboard.jpg",
    gallery: ["/billboard.jpg"],
    priceRange: "₵6,000+",
    rating: 4.9,
    isDemo: true,
    owner: {
      name: "Payollar Media",
      verificationStatus: "VERIFIED",
    },
    tags: ["Billboard", "Airport", "Accra", "Payollar Media"],
    availability: {
      label: "Available: Dec 1 – Dec 31, 2026",
      from: "2026-12-01",
      to: "2026-12-31",
    },
    rates: [
      { id: "1w", label: "1 week", weeks: 1, price: 6000 },
      { id: "4w", label: "4 weeks (1 month)", weeks: 4, price: 20000 },
      { id: "12w", label: "12 weeks (3 months)", weeks: 12, price: 54000 },
      { id: "52w", label: "12 months", weeks: 52, price: 180000 },
    ],
    specs: [
      { label: "Size", value: "12m × 6m" },
      { label: "Type", value: "Static Billboard" },
      { label: "Orientation", value: "Dual-facing" },
      { label: "Traffic", value: "~145,000 vehicles / day" },
      { label: "Lighting", value: "Night illuminated" },
      { label: "Material", value: "Flex / vinyl face" },
      { label: "Owner", value: "Payollar Media" },
    ],
  },
];

export function findBillboardSite(siteKey) {
  const key = String(siteKey || "")
    .trim()
    .toLowerCase();
  if (!key) return null;
  return (
    DEMO_BILLBOARD_SITES.find(
      (site) =>
        site.id === key ||
        site.id === `bb-${key}` ||
        site.id.replace(/^bb-/, "") === key ||
        String(site.name || "")
          .toLowerCase()
          .replace(/\s+/g, "-") === key
    ) || null
  );
}

/** Shape a live MediaListing into the billboard site detail model. */
function toIsoDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function formatAvailLabel(fromIso, toIso) {
  if (!fromIso || !toIso) return null;
  const fmt = (iso) => {
    const d = new Date(`${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  return `${fmt(fromIso)} – ${fmt(toIso)}`;
}

export function liveListingToBillboardSite(listing) {
  if (!listing || String(listing.listingType || "").toUpperCase() !== "BILLBOARD") {
    return null;
  }

  const packages = Array.isArray(listing.packages) ? listing.packages : [];
  const rates = packages.map((pkg, index) => {
    const weeksMatch = String(pkg.duration || "").match(/(\d+)\s*w/i);
    const weeks = weeksMatch ? Number(weeksMatch[1]) : index === 0 ? 1 : 4;
    return {
      id: pkg.id || `pkg-${index}`,
      label: pkg.name || pkg.duration || `Package ${index + 1}`,
      weeks,
      price: Number(pkg.price) || 0,
    };
  });

  const availFrom = toIsoDate(listing.agency?.rateCardValidFrom);
  const availTo = toIsoDate(listing.agency?.rateCardValidTo);
  const availLabel = formatAvailLabel(availFrom, availTo);

  return {
    id: listing.id,
    listingType: "BILLBOARD",
    name: listing.name,
    category: "STATIC",
    location: listing.location,
    city: listing.location,
    latitude: listing.latitude ?? null,
    longitude: listing.longitude ?? null,
    size: listing.frequency || null,
    boardType: listing.frequency || listing.network || "Billboard",
    orientation: Array.isArray(listing.timeSlots)
      ? listing.timeSlots[0] || null
      : null,
    traffic: listing.reach || null,
    reach: listing.reach || null,
    description: listing.description || null,
    status: listing.status === "ACTIVE" ? "AVAILABLE" : "LIMITED",
    statusLabel: listing.status === "ACTIVE" ? "Available" : "Limited",
    imageUrl: listing.imageUrl || "/billboard.jpg",
    gallery: listing.imageUrl ? [listing.imageUrl] : ["/billboard.jpg"],
    priceRange: listing.priceRange || null,
    rating: listing.rating || null,
    isDemo: false,
    agency: listing.agency || null,
    packageNotes: listing.agency?.customPackageNotes || null,
    packageTerms: listing.agency?.customPackageTerms || null,
    owner: listing.agency
      ? {
          name: listing.agency.agencyName,
          verificationStatus: listing.agency.verificationStatus,
        }
      : null,
    tags: ["Billboard"],
    availability:
      availFrom && availTo
        ? {
            from: availFrom,
            to: availTo,
            label: availLabel,
          }
        : null,
    rates,
    specs: [
      listing.frequency
        ? { label: "Type", value: listing.frequency }
        : null,
      listing.reach ? { label: "Traffic", value: listing.reach } : null,
      listing.location ? { label: "Location", value: listing.location } : null,
    ].filter(Boolean),
  };
}

/** Merge live BILLBOARD listings with demos. */
export function withBillboardMarketplaceDemos(listings = []) {
  const live = Array.isArray(listings) ? listings : [];
  const liveNames = new Set(
    live
      .filter((l) => l.listingType === "BILLBOARD")
      .map((l) => String(l.name || "").trim().toLowerCase())
  );

  const demos = DEMO_BILLBOARD_SITES.filter(
    (demo) => !liveNames.has(String(demo.name).trim().toLowerCase())
  ).map((demo) => ({
    ...demo,
    // Shape compatible with products listing filters
    frequency: demo.boardType,
    agency: {
      id: null,
      agencyName: demo.owner?.name,
      verificationStatus: demo.owner?.verificationStatus,
    },
    packages: (demo.rates || []).map((rate) => ({
      id: rate.id,
      name: rate.label,
      price: rate.price,
      duration: rate.label,
      spots: 1,
    })),
  }));

  return [...live, ...demos];
}

export function billboardSiteHref(site) {
  const id = site?.id || "";
  return id ? `/products/billboard/${id}` : "/products?type=BILLBOARD";
}

export function billboardQuoteHref(site, { rateId, weeks } = {}) {
  const params = new URLSearchParams();
  if (site?.id) params.set("site", site.id);
  if (rateId) params.set("rate", rateId);
  if (rateId === BILLBOARD_CUSTOM_RATE_ID && weeks) {
    params.set("weeks", String(weeks));
  }
  const qs = params.toString();
  return qs ? `/products/billboard-quote?${qs}` : "/products/billboard-quote";
}

export const BILLBOARD_CUSTOM_RATE_ID = "custom";

/** Weekly list rate used to estimate custom durations. */
export function billboardWeeklyBaseRate(site) {
  const rates = site?.rates || [];
  const week1 = rates.find((r) => Number(r.weeks) === 1);
  if (week1?.price != null) return Number(week1.price) || 0;
  const month = rates.find((r) => Number(r.weeks) === 4);
  if (month?.price != null) return Math.round(Number(month.price) / 4) || 0;
  const any = rates[0];
  if (any?.price != null && any?.weeks) {
    return Math.round(Number(any.price) / Number(any.weeks)) || 0;
  }
  return 0;
}

export function buildBillboardCustomRate(site, weeks = 6) {
  const w = Math.max(1, Math.min(52, Number(weeks) || 6));
  const weekly = billboardWeeklyBaseRate(site);
  return {
    id: BILLBOARD_CUSTOM_RATE_ID,
    label: "Custom",
    weeks: w,
    price: weekly * w,
    weeklyRate: weekly,
    isCustom: true,
  };
}

/** Preset rates + custom option for rate card / quote UI. */
export function billboardRatesWithCustom(site, customWeeks = 6) {
  const presets = Array.isArray(site?.rates) ? site.rates : [];
  return [...presets, buildBillboardCustomRate(site, customWeeks)];
}

export function resolveBillboardRate(site, rateId, customWeeks = 6) {
  if (rateId === BILLBOARD_CUSTOM_RATE_ID || rateId === "custom") {
    return buildBillboardCustomRate(site, customWeeks);
  }
  const rates = site?.rates || [];
  return (
    rates.find((r) => r.id === rateId) ||
    rates.find((r) => r.weeks === 4) ||
    rates[0] ||
    null
  );
}

export function billboardStatusClass(status) {
  if (status === "AVAILABLE") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (status === "LIMITED") return "bg-amber-50 text-amber-800 border-amber-100";
  return "bg-slate-100 text-slate-600 border-slate-200";
}
