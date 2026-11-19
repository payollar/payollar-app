/**
 * Agency vertical (TV / Radio / …) — drives signup + dashboard scoping.
 */

export const MEDIA_AGENCY_TYPES = [
  {
    value: "TV",
    label: "TV",
    description: "Broadcast & TV stations",
    agencyPlaceholder: "e.g. TV3, Joy Prime",
    listingNoun: "station",
  },
  {
    value: "RADIO",
    label: "Radio",
    description: "FM / radio stations",
    agencyPlaceholder: "e.g. Joy FM, Peace FM",
    listingNoun: "station",
  },
  {
    value: "BILLBOARD",
    label: "Billboard",
    description: "OOH & outdoor sites",
    agencyPlaceholder: "e.g. Accra OOH Network",
    listingNoun: "site",
  },
  {
    value: "DIGITAL",
    label: "Digital",
    description: "Web, apps & digital inventory",
    agencyPlaceholder: "e.g. MyNews Online",
    listingNoun: "property",
  },
  {
    value: "INFLUENCER_MARKETING",
    label: "Influencer",
    description: "Creator / influencer campaigns",
    agencyPlaceholder: "e.g. Creator House GH",
    listingNoun: "channel",
  },
  {
    value: "VIDEO_CLIPPING",
    label: "Video clipping",
    description: "Clip & highlight packages",
    agencyPlaceholder: "e.g. ClipDesk Africa",
    listingNoun: "package line",
  },
];

export function mediaAgencyTypeMeta(value) {
  const normalized = normalizeMediaAgencyType(value);
  return MEDIA_AGENCY_TYPES.find((t) => t.value === normalized) || null;
}

export const MEDIA_AGENCY_TYPE_VALUES = MEDIA_AGENCY_TYPES.map((t) => t.value);

export const MEDIA_TYPE_STORAGE_KEY = "payollar_media_primary_type";

export function isValidMediaAgencyType(value) {
  return MEDIA_AGENCY_TYPE_VALUES.includes(String(value || "").toUpperCase());
}

export function normalizeMediaAgencyType(value) {
  const raw = String(value || "").trim().toUpperCase();
  if (!isValidMediaAgencyType(raw)) return null;
  return raw;
}

export function mediaAgencyTypeLabel(value) {
  const normalized = normalizeMediaAgencyType(value);
  return (
    MEDIA_AGENCY_TYPES.find((t) => t.value === normalized)?.label ||
    normalized ||
    "Media"
  );
}

/** Listing types this agency is allowed to create. */
export function allowedListingTypesForAgency(primaryMediaType) {
  const normalized = normalizeMediaAgencyType(primaryMediaType);
  if (!normalized) return MEDIA_AGENCY_TYPE_VALUES;
  return [normalized];
}

export function agencyAllowsListingType(primaryMediaType, listingType) {
  const allowed = allowedListingTypesForAgency(primaryMediaType);
  const type = String(listingType || "").toUpperCase();
  return allowed.includes(type);
}

export function readStoredMediaAgencyType() {
  if (typeof window === "undefined") return null;
  try {
    return normalizeMediaAgencyType(
      window.sessionStorage.getItem(MEDIA_TYPE_STORAGE_KEY)
    );
  } catch {
    return null;
  }
}

export function storeMediaAgencyType(value) {
  if (typeof window === "undefined") return;
  const normalized = normalizeMediaAgencyType(value);
  try {
    if (normalized) {
      window.sessionStorage.setItem(MEDIA_TYPE_STORAGE_KEY, normalized);
    } else {
      window.sessionStorage.removeItem(MEDIA_TYPE_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export function clearStoredMediaAgencyType() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(MEDIA_TYPE_STORAGE_KEY);
  } catch {
    // ignore
  }
}
