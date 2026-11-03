/** Frequency option id → airings-per-day multiplier (hourly uses the slot time range). */

function parseHoursFromRange(range) {
  if (!range || typeof range !== "string") return 1;
  const matches = [...range.matchAll(/(\d{1,2}):(\d{2})\s*(AM|PM)?/gi)];
  if (matches.length < 2) return 1;

  let startMeridiem = matches[0][3]?.toUpperCase() || null;
  let endMeridiem = matches[1][3]?.toUpperCase() || null;
  // "5:00 - 8:00 PM" → treat both as PM
  if (!startMeridiem && endMeridiem) startMeridiem = endMeridiem;
  if (!endMeridiem && startMeridiem) endMeridiem = startMeridiem;

  const toMinutes = (match, meridiem) => {
    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const start = toMinutes(matches[0], startMeridiem);
  const end = toMinutes(matches[1], endMeridiem);
  let hours = (end - start) / 60;
  if (hours <= 0) hours += 24;
  return Math.max(1, Math.round(hours));
}

export function getFrequencyMultiplier(frequencyId, range) {
  switch (frequencyId) {
    case "2x":
      return 2;
    case "3x":
      return 3;
    case "5x":
      return 5;
    case "hourly":
      return parseHoursFromRange(range);
    case "once":
    default:
      return 1;
  }
}

export const FREQUENCY_LABELS = {
  once: "Once daily",
  "2x": "2x daily",
  "3x": "3x daily",
  "5x": "5x daily",
  hourly: "Hourly",
};

/** Compact audience / impression counts for UI (e.g. 250000 → "250k"). */
export function formatCompactCount(n) {
  const value = Number(n);
  if (!Number.isFinite(value) || value <= 0) return null;
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const rounded = millions >= 10 ? Math.round(millions) : Math.round(millions * 10) / 10;
    return `${rounded}M`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    const rounded = thousands >= 100 ? Math.round(thousands) : Math.round(thousands * 10) / 10;
    return `${rounded}k`;
  }
  return Math.round(value).toLocaleString();
}

/**
 * Build priced line items: unitRate × days × frequency per selected slot.
 * Also rolls up est. impressions when the slot has impressionsPerAiring.
 */
export function buildMediaPlannerLineItems({
  slotIds,
  slots,
  spotSec,
  frequencyBySlotId,
  dayCount,
  getSlotRateForSec,
}) {
  const days = Math.max(1, dayCount || 1);
  return (slotIds || [])
    .map((id) => {
      const slot = (slots || []).find((s) => s.id === id);
      if (!slot) return null;
      const unitRate =
        spotSec != null
          ? getSlotRateForSec(slot, spotSec)
          : slot.rateGhs ?? slot.weeklyGhs ?? 0;
      const frequencyId = frequencyBySlotId?.[id] || "once";
      const frequencyMultiplier = getFrequencyMultiplier(frequencyId, slot.range);
      const lineTotal = Math.round(Number(unitRate || 0) * days * frequencyMultiplier);
      const impressionsPerAiring =
        slot.impressionsPerAiring != null && Number(slot.impressionsPerAiring) > 0
          ? Math.round(Number(slot.impressionsPerAiring))
          : null;
      const lineImpressions =
        impressionsPerAiring != null
          ? Math.round(impressionsPerAiring * days * frequencyMultiplier)
          : null;
      return {
        id: slot.id,
        label: slot.label,
        range: slot.range || "",
        unitRate: Number(unitRate || 0),
        frequencyId,
        frequencyLabel: FREQUENCY_LABELS[frequencyId] || frequencyId,
        frequencyMultiplier,
        days,
        lineTotal,
        impressionsPerAiring,
        lineImpressions,
      };
    })
    .filter(Boolean);
}

export function sumMediaPlannerLineItems(lineItems) {
  return (lineItems || []).reduce((sum, item) => sum + (item.lineTotal || 0), 0);
}

export function sumMediaPlannerImpressions(lineItems) {
  return (lineItems || []).reduce((sum, item) => sum + (item.lineImpressions || 0), 0);
}
