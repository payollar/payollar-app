// Shared Smart Rate Card table templates for media agencies.
// These define common structures so the frontend can provide
// richer, role-based interactions (e.g. time class filters).

export const SMART_RATE_CARD_TEMPLATES = [
  {
    key: "tv_time_classes",
    label: "TV Time Classes & Segments",
    description:
      "Prebuilt table for TV time classes (Premium, M1–M4) with Mon–Fri and Sat–Sun rates.",
    defaultTitle: "Time Classes & Segments",
    // Column definitions map directly to SmartTableColumn fields.
    columns: [
      {
        name: "Time Class / Segment",
        dataType: "DROPDOWN",
        isVisibleOnFrontend: true,
        isRequiredForBooking: true,
        // config is stored as JSON in the SmartTableColumn.
        config: {
          role: "time_class",
          options: ["Premium", "M1", "M2", "M3", "M4"],
        },
      },
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
        name: "Notes",
        dataType: "NOTES",
        isVisibleOnFrontend: false,
        isRequiredForBooking: false,
        config: {
          role: "notes",
        },
      },
    ],
    // Pre-seeded rows. Only the time class/segment column is prefilled;
    // rate columns are left empty for the agency to fill.
    rows: [
      { "Time Class / Segment": "Premium" },
      { "Time Class / Segment": "M1" },
      { "Time Class / Segment": "M2" },
      { "Time Class / Segment": "M3" },
      { "Time Class / Segment": "M4" },
    ],
  },
  {
    key: "spot_advert",
    label: "Spot Advert",
    description:
      "Time class (Premium, M1–M4) with duration-based pricing (60s, 45s, 30s, 15s).",
    defaultTitle: "Spot Advert Rates",
    columns: [
      {
        name: "Time Class / Segment",
        dataType: "DROPDOWN",
        isVisibleOnFrontend: true,
        isRequiredForBooking: true,
        config: {
          role: "time_class",
          options: ["Premium", "M1", "M2", "M3", "M4"],
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
    ],
    rows: [
      { "Time Class / Segment": "Premium", "60 secs": "2000", "45 secs": "1900", "30 secs": "1600", "15 secs": "900" },
      { "Time Class / Segment": "M1", "60 secs": "1800", "45 secs": "1700", "30 secs": "1400", "15 secs": "800" },
      { "Time Class / Segment": "M2", "60 secs": "1500", "45 secs": "1400", "30 secs": "1200", "15 secs": "700" },
      { "Time Class / Segment": "M3", "60 secs": "1200", "45 secs": "1100", "30 secs": "950", "15 secs": "550" },
      { "Time Class / Segment": "M4", "60 secs": "1000", "45 secs": "950", "30 secs": "800", "15 secs": "450" },
    ],
  },
];

export function getSmartRateCardTemplate(templateKey) {
  return SMART_RATE_CARD_TEMPLATES.find((t) => t.key === templateKey) || null;
}

