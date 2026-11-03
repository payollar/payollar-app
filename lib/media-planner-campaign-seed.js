/** Carry campaign brief into a new planner flight (add more spots / formats). */

export const MEDIA_PLANNER_CAMPAIGN_SEED_KEY = "payollarMediaPlannerCampaignSeed";

/**
 * Brief fields shared across flights in one campaign.
 * Rate card / station is carried so "Add more" lands on the same station;
 * format and slots are still chosen fresh.
 */
export function buildCampaignSeedFromItem(item) {
  if (!item) return null;
  return {
    mediaCampaignName: item.mediaCampaignName || "",
    brandName: item.brandName || null,
    audienceTypeIds: Array.isArray(item.audienceTypeIds) ? item.audienceTypeIds : [],
    audienceLabels: Array.isArray(item.audienceLabels) ? item.audienceLabels : [],
    objectiveIds: Array.isArray(item.objectiveIds) ? item.objectiveIds : [],
    objectiveLabels: Array.isArray(item.objectiveLabels) ? item.objectiveLabels : [],
    industryIds: Array.isArray(item.industryIds) ? item.industryIds : [],
    industryLabels: Array.isArray(item.industryLabels) ? item.industryLabels : [],
    contact: {
      name: item.contact?.name || "",
      email: item.contact?.email || "",
      phone: item.contact?.phone || "",
    },
    campaignStart: item.campaignStart || null,
    campaignEnd: item.campaignEnd || null,
    sourceChannel: item.channel || null,
    rateCardId: item.rateCardId || null,
    rateCardTitle: item.rateCardTitle || null,
  };
}

export function stashMediaPlannerCampaignSeed(seed) {
  if (typeof window === "undefined" || !seed) return;
  try {
    sessionStorage.setItem(MEDIA_PLANNER_CAMPAIGN_SEED_KEY, JSON.stringify(seed));
  } catch {
    /* ignore quota / private mode */
  }
}

/** Read and clear the seed once. */
export function takeMediaPlannerCampaignSeed() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(MEDIA_PLANNER_CAMPAIGN_SEED_KEY);
    sessionStorage.removeItem(MEDIA_PLANNER_CAMPAIGN_SEED_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function campaignChannel(item) {
  return String(item?.channel || "TV").toUpperCase() === "RADIO" ? "RADIO" : "TV";
}

export function campaignGroupKey(item) {
  const name = String(item?.mediaCampaignName || "")
    .trim()
    .toLowerCase();
  const brand = String(item?.brandName || "")
    .trim()
    .toLowerCase();
  const channel = campaignChannel(item);
  return `${name}::${brand}::${channel}` || `untitled::${channel}`;
}

export function groupMediaPlannerCartByCampaign(items = []) {
  const map = new Map();
  for (const item of items) {
    const key = campaignGroupKey(item);
    if (!map.has(key)) {
      map.set(key, {
        key,
        channel: campaignChannel(item),
        mediaCampaignName: item.mediaCampaignName || "Untitled campaign",
        brandName: item.brandName || null,
        audienceLabels: item.audienceLabels || [],
        objectiveLabels: item.objectiveLabels || [],
        contact: item.contact || null,
        flights: [],
        total: 0,
      });
    }
    const group = map.get(key);
    group.flights.push(item);
    group.total += Number(item.total) || 0;
  }
  return [...map.values()];
}

export function mediaPlannerExtendHref(channel = "TV") {
  const base =
    String(channel).toUpperCase() === "RADIO"
      ? "/products/radio-media"
      : "/products/tv-media";
  return `${base}?extend=1`;
}
