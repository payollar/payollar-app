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

export const DEMO_BILLBOARD_SITES = [
  {
    id: "bb-airport-roundabout",
    listingType: "BILLBOARD",
    name: "Airport Roundabout",
    category: "STATIC",
    location: "Airport Roundabout, Accra",
    city: "Accra",
    size: "12m × 6m",
    boardType: "Static Billboard",
    orientation: "Dual-facing",
    traffic: "Est. daily traffic ~145,000 vehicles",
    reach: "145K daily",
    description:
      "High-traffic location near Kotoka International Airport — premium visibility for arrivals and city-bound traffic.",
    status: "AVAILABLE",
    statusLabel: "Available",
    imageUrl: "/billboard.jpg",
    gallery: ["/billboard.jpg"],
    priceRange: "₵6,000+",
    rating: 4.9,
    isDemo: true,
    owner: {
      name: "Skyline Outdoor GH",
      verificationStatus: "VERIFIED",
    },
    tags: ["Billboard", "Airport", "Accra"],
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
    ],
  },
  {
    id: "bb-spintex-road",
    listingType: "BILLBOARD",
    name: "Spintex Road",
    category: "STATIC",
    location: "Spintex Road, Accra",
    city: "Accra",
    size: "10m × 5m",
    boardType: "Static Billboard",
    orientation: "Single-facing",
    traffic: "Est. daily traffic ~98,000 vehicles",
    reach: "98K daily",
    description:
      "Busy commercial corridor with strong retail and residential commute traffic.",
    status: "LIMITED",
    statusLabel: "Limited",
    imageUrl: "/billboard.jpg",
    gallery: ["/billboard.jpg"],
    priceRange: "₵5,000+",
    rating: 4.7,
    isDemo: true,
    owner: {
      name: "Coastal Media Boards",
      verificationStatus: "VERIFIED",
    },
    tags: ["Billboard", "Spintex", "Accra"],
    availability: {
      label: "Limited: Jan 15 – Feb 28, 2027",
      from: "2027-01-15",
      to: "2027-02-28",
    },
    rates: [
      { id: "1w", label: "1 week", weeks: 1, price: 5000 },
      { id: "4w", label: "4 weeks (1 month)", weeks: 4, price: 17000 },
      { id: "12w", label: "12 weeks (3 months)", weeks: 12, price: 45000 },
      { id: "52w", label: "12 months", weeks: 52, price: 150000 },
    ],
    specs: [
      { label: "Size", value: "10m × 5m" },
      { label: "Type", value: "Static Billboard" },
      { label: "Orientation", value: "Single-facing" },
      { label: "Traffic", value: "~98,000 vehicles / day" },
      { label: "Lighting", value: "Night illuminated" },
    ],
  },
  {
    id: "bb-circle-digital",
    listingType: "BILLBOARD",
    name: "Kwame Nkrumah Circle LED",
    category: "DIGITAL_OOH",
    location: "Kwame Nkrumah Circle, Accra",
    city: "Accra",
    size: "14m × 4m",
    boardType: "Digital LED",
    orientation: "Dual-facing",
    traffic: "~160,000 vehicles & pedestrians / day",
    reach: "160K daily",
    description:
      "Landmark digital screen at Accra’s busiest interchange — high dwell and rotation inventory.",
    status: "AVAILABLE",
    statusLabel: "Available",
    imageUrl: "/billboard.jpg",
    gallery: ["/billboard.jpg"],
    priceRange: "₵15,000+",
    rating: 4.9,
    isDemo: true,
    owner: {
      name: "Circle Digital Screens",
      verificationStatus: "VERIFIED",
    },
    tags: ["Digital OOH", "Circle", "Accra"],
    availability: {
      label: "Available from Dec 2026",
      from: "2026-12-01",
      to: "2027-03-31",
    },
    rates: [
      { id: "1w", label: "1 week", weeks: 1, price: 15000 },
      { id: "2w", label: "2 weeks", weeks: 2, price: 28000 },
      { id: "4w", label: "4 weeks (1 month)", weeks: 4, price: 50000 },
    ],
    specs: [
      { label: "Size", value: "14m × 4m" },
      { label: "Type", value: "Digital LED" },
      { label: "Orientation", value: "Dual-facing" },
      { label: "Rotations", value: "12 / hour" },
      { label: "Traffic", value: "~160,000 / day" },
    ],
  },
  {
    id: "bb-tetteh-quarshie",
    listingType: "BILLBOARD",
    name: "Tetteh Quarshie Interchange",
    category: "STATIC",
    location: "Tetteh Quarshie, Accra",
    city: "Accra",
    size: "12m × 6m",
    boardType: "Static Billboard",
    orientation: "Dual-facing",
    traffic: "Est. daily traffic ~130,000 vehicles",
    reach: "130K daily",
    description:
      "Prime interchange visibility for East Legon, Accra Mall, and Spintex-bound traffic.",
    status: "AVAILABLE",
    statusLabel: "Available",
    imageUrl: "/billboard.jpg",
    gallery: ["/billboard.jpg"],
    priceRange: "₵7,500+",
    rating: 4.8,
    isDemo: true,
    owner: {
      name: "Skyline Outdoor GH",
      verificationStatus: "VERIFIED",
    },
    tags: ["Billboard", "Interchange", "Accra"],
    availability: {
      label: "Available: Jan – Mar 2027",
      from: "2027-01-01",
      to: "2027-03-31",
    },
    rates: [
      { id: "1w", label: "1 week", weeks: 1, price: 7500 },
      { id: "4w", label: "4 weeks (1 month)", weeks: 4, price: 24000 },
      { id: "12w", label: "12 weeks (3 months)", weeks: 12, price: 65000 },
      { id: "52w", label: "12 months", weeks: 52, price: 200000 },
    ],
    specs: [
      { label: "Size", value: "12m × 6m" },
      { label: "Type", value: "Static Billboard" },
      { label: "Orientation", value: "Dual-facing" },
      { label: "Traffic", value: "~130,000 vehicles / day" },
    ],
  },
  {
    id: "bb-accra-mall-transit",
    listingType: "BILLBOARD",
    name: "Accra Mall Transit Shelter",
    category: "TRANSIT",
    location: "Accra Mall, Tetteh Quarshie",
    city: "Accra",
    size: "1.8m × 1.2m",
    boardType: "Transit shelter",
    orientation: "Single-facing",
    traffic: "High pedestrian + shopper footfall",
    reach: "45K daily",
    description:
      "Transit shelter panels at Accra Mall — ideal for retail and lifestyle campaigns.",
    status: "LIMITED",
    statusLabel: "Limited",
    imageUrl: "/billboard.jpg",
    gallery: ["/billboard.jpg"],
    priceRange: "₵2,500+",
    rating: 4.5,
    isDemo: true,
    owner: {
      name: "Urban Transit Ads",
      verificationStatus: "VERIFIED",
    },
    tags: ["Transit", "Mall", "Accra"],
    availability: {
      label: "Limited slots in Q1 2027",
      from: "2027-01-01",
      to: "2027-02-15",
    },
    rates: [
      { id: "1w", label: "1 week", weeks: 1, price: 2500 },
      { id: "4w", label: "4 weeks (1 month)", weeks: 4, price: 8000 },
      { id: "12w", label: "12 weeks (3 months)", weeks: 12, price: 21000 },
    ],
    specs: [
      { label: "Size", value: "1.8m × 1.2m" },
      { label: "Type", value: "Transit shelter" },
      { label: "Orientation", value: "Single-facing" },
      { label: "Footfall", value: "High shopper traffic" },
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
