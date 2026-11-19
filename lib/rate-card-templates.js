// Shared Smart Rate Card table templates for media agencies.
// These define common structures so the frontend can provide
// richer, role-based interactions (e.g. time class filters).

import { defaultTimeRangeForSegment } from "@/lib/rate-card-time-range";

/** Starter segment only — agencies rename / add their own (Morning, Drive, etc.). */
const TIME_CLASS_OPTIONS = ["Prime"];
const DAY_BAND_OPTIONS = ["Mon–Fri", "Sat–Sun"];
const STARTER_SEGMENT = "Prime";

const TIME_RANGE_COLUMN = {
  name: "Time range",
  dataType: "TEXT",
  isVisibleOnFrontend: true,
  isRequiredForBooking: false,
  config: {
    role: "time_range",
    placeholder: "e.g. 6:00pm – 10:00pm",
  },
};

const TIME_CLASS_COLUMN = {
  name: "Time Class / Segment",
  dataType: "DROPDOWN",
  isVisibleOnFrontend: true,
  isRequiredForBooking: true,
  config: {
    role: "time_class",
    options: TIME_CLASS_OPTIONS,
    placeholder: "e.g. Prime",
  },
};

/**
 * One rate sheet per ad type: time class × day band × spot duration.
 * Planner reads 30s by default; day band follows buyer Mon–Fri / Sat–Sun days.
 * Seeds one example segment (Prime) × day bands — add more rows as needed.
 */
function buildAdTypeTimeClassTemplate(adTypeId, adTypeLabel) {
  return {
    key: `ad_type_${adTypeId.replace(/-/g, "_")}_time_class`,
    label: `${adTypeLabel} rates`,
    description: `One rate sheet for ${adTypeLabel}: start with Prime, then add your own segments × Mon–Fri / Sat–Sun × spot length (60/45/30/15s).`,
    defaultTitle: "Rates",
    columns: [
      {
        name: "Ad Type",
        dataType: "TEXT",
        isVisibleOnFrontend: false,
        isRequiredForBooking: true,
        config: { role: "ad_type_identifier" },
      },
      TIME_CLASS_COLUMN,
      TIME_RANGE_COLUMN,
      {
        name: "Days",
        dataType: "DROPDOWN",
        isVisibleOnFrontend: true,
        isRequiredForBooking: true,
        config: {
          role: "day_band",
          options: DAY_BAND_OPTIONS,
        },
      },
      {
        name: "60 secs",
        dataType: "CURRENCY",
        isVisibleOnFrontend: true,
        isRequiredForBooking: false,
        config: { role: "rate_60s" },
      },
      {
        name: "45 secs",
        dataType: "CURRENCY",
        isVisibleOnFrontend: true,
        isRequiredForBooking: false,
        config: { role: "rate_45s" },
      },
      {
        name: "30 secs",
        dataType: "CURRENCY",
        isVisibleOnFrontend: true,
        isRequiredForBooking: false,
        config: { role: "rate_30s" },
      },
      {
        name: "15 secs",
        dataType: "CURRENCY",
        isVisibleOnFrontend: true,
        isRequiredForBooking: false,
        config: { role: "rate_15s" },
      },
      {
        name: "Impressions",
        dataType: "NUMBER",
        isVisibleOnFrontend: true,
        isRequiredForBooking: false,
        config: { role: "impressions" },
      },
      {
        name: "Programs",
        dataType: "NOTES",
        isVisibleOnFrontend: true,
        isRequiredForBooking: false,
        config: {
          role: "programs",
          placeholder:
            "e.g. Morning Show, News @ 7 (one per line or comma-separated)",
        },
      },
    ],
    rows: DAY_BAND_OPTIONS.map((band) => ({
      "Ad Type": adTypeId,
      "Time Class / Segment": STARTER_SEGMENT,
      "Time range": defaultTimeRangeForSegment(STARTER_SEGMENT),
      Days: band,
      "60 secs": "",
      "45 secs": "",
      "30 secs": "",
      "15 secs": "",
      Impressions: "",
      Programs: "",
    })),
  };
}

function buildAdTypeTimeClassTemplates() {
  const allAdTypes = [
    { id: "tvc", label: "TVC" },
    { id: "lpm", label: "LPM" },
    { id: "sponsorship", label: "Sponsorship" },
    { id: "product-placement", label: "Product Placement" },
    { id: "documentary", label: "Documentary" },
    { id: "announcement", label: "Announcement" },
    { id: "interview", label: "Interview" },
    { id: "billboard", label: "Billboard" },
    { id: "jingle", label: "Jingle" },
    { id: "produced-spot", label: "Produced Spot" },
    { id: "live-read", label: "Live Read" },
    { id: "custom", label: "Custom" },
  ];
  const seen = new Set();
  return allAdTypes
    .filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    })
    .map((a) => buildAdTypeTimeClassTemplate(a.id, a.label));
}

export const SMART_RATE_CARD_TEMPLATES = [
  {
    key: "tv_time_classes",
    label: "TV Time Classes & Segments",
    description:
      "Start with one segment (Prime), then add Morning, Drive, Late Night — whatever you sell.",
    defaultTitle: "Time Classes & Segments",
    // Column definitions map directly to SmartTableColumn fields.
    columns: [
      TIME_CLASS_COLUMN,
      TIME_RANGE_COLUMN,
      {
        name: "Mon–Fri Rate (30s)",
        dataType: "CURRENCY",
        isVisibleOnFrontend: true,
        isRequiredForBooking: false,
        config: {
          role: "rate_mon_fri_30",
        },
      },
      {
        name: "Sat–Sun Rate (30s)",
        dataType: "CURRENCY",
        isVisibleOnFrontend: true,
        isRequiredForBooking: false,
        config: {
          role: "rate_weekend_30",
        },
      },
      {
        name: "Impressions",
        dataType: "NUMBER",
        isVisibleOnFrontend: true,
        isRequiredForBooking: false,
        config: {
          role: "impressions",
        },
      },
      {
        name: "Programs",
        dataType: "NOTES",
        isVisibleOnFrontend: true,
        isRequiredForBooking: false,
        config: {
          role: "programs",
          placeholder:
            "e.g. Morning Show, News @ 7 (one per line or comma-separated)",
        },
      },
      {
        name: "Notes",
        dataType: "NOTES",
        isVisibleOnFrontend: false,
        isRequiredForBooking: false,
        config: {
          role: "notes",
        },
      },
    ],
    // One starter row — agencies add their own segments.
    rows: [
      {
        "Time Class / Segment": STARTER_SEGMENT,
        "Time range": defaultTimeRangeForSegment(STARTER_SEGMENT),
        Impressions: "",
        Programs: "",
      },
    ],
  },
  {
    key: "spot_advert",
    label: "Spot Advert",
    description:
      "Start with Prime, then add segments with duration-based pricing (60s, 45s, 30s, 15s).",
    defaultTitle: "Spot Advert Rates",
    columns: [
      TIME_CLASS_COLUMN,
      TIME_RANGE_COLUMN,
      {
        name: "60 secs",
        dataType: "CURRENCY",
        isVisibleOnFrontend: true,
        isRequiredForBooking: false,
        config: { role: "rate_60s" },
      },
      {
        name: "45 secs",
        dataType: "CURRENCY",
        isVisibleOnFrontend: true,
        isRequiredForBooking: false,
        config: { role: "rate_45s" },
      },
      {
        name: "30 secs",
        dataType: "CURRENCY",
        isVisibleOnFrontend: true,
        isRequiredForBooking: false,
        config: { role: "rate_30s" },
      },
      {
        name: "15 secs",
        dataType: "CURRENCY",
        isVisibleOnFrontend: true,
        isRequiredForBooking: false,
        config: { role: "rate_15s" },
      },
      {
        name: "Impressions",
        dataType: "NUMBER",
        isVisibleOnFrontend: true,
        isRequiredForBooking: false,
        config: { role: "impressions" },
      },
      {
        name: "Programs",
        dataType: "NOTES",
        isVisibleOnFrontend: true,
        isRequiredForBooking: false,
        config: {
          role: "programs",
          placeholder:
            "e.g. Morning Show, News @ 7 (one per line or comma-separated)",
        },
      },
    ],
    rows: [
      {
        "Time Class / Segment": STARTER_SEGMENT,
        "Time range": defaultTimeRangeForSegment(STARTER_SEGMENT),
        "60 secs": "",
        "45 secs": "",
        "30 secs": "",
        "15 secs": "",
        Impressions: "",
        Programs: "",
      },
    ],
  },
  // Per-ad-type: one sheet (time class × Mon–Fri/Sat–Sun × 60/45/30/15s)
  ...buildAdTypeTimeClassTemplates(),
];

export function getSmartRateCardTemplate(templateKey) {
  return SMART_RATE_CARD_TEMPLATES.find((t) => t.key === templateKey) || null;
}

/** Get template key for an ad type's time-class rates section */
export function getAdTypeTimeClassTemplateKey(adTypeId) {
  return `ad_type_${String(adTypeId).replace(/-/g, "_")}_time_class`;
}

/** Ad types that have time-class templates, by media type */
export const TV_AD_TYPE_IDS = [
  "tvc",
  "lpm",
  "sponsorship",
  "product-placement",
  "documentary",
  "jingle",
  "announcement",
  "interview",
  "billboard",
];
export const RADIO_AD_TYPE_IDS = [
  "jingle",
  "produced-spot",
  "live-read",
  "lpm",
  "sponsorship",
];
