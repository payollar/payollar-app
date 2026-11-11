/**
 * Rebuild a media-planner cart/draft payload from an unpaid RateCardBookingItem
 * so clients can continue editing before payment.
 */

import { upsertMediaPlannerDraft } from "@/lib/media-planner-drafts";

export function rebuildPlannerItemFromBooking(booking) {
  if (!booking) return null;
  const notes =
    booking.notesMeta && typeof booking.notesMeta === "object"
      ? booking.notesMeta
      : (() => {
          try {
            return booking.notes ? JSON.parse(booking.notes) : {};
          } catch {
            return {};
          }
        })();

  const channel = String(
    notes.channel || booking.listing?.listingType || "TV"
  ).toUpperCase();
  const rateCardId = booking.rateCardId || booking.listing?.id || null;
  const slotIds = Array.isArray(notes.slotIds)
    ? notes.slotIds.filter(Boolean)
    : [];

  return {
    id: notes.cartItemId || undefined,
    rateCardId,
    rateCardTitle: booking.listing?.name || null,
    mediaCampaignName:
      booking.mediaCampaignName || booking.packageName || "Untitled campaign",
    brandName: notes.brandName || null,
    channel: channel === "RADIO" ? "RADIO" : "TV",
    adFormatId: notes.adFormatId || null,
    adFormatLabel: notes.adFormatLabel || null,
    audienceLabels: Array.isArray(notes.audienceLabels)
      ? notes.audienceLabels
      : [],
    audienceTypeIds: Array.isArray(notes.audienceTypeIds)
      ? notes.audienceTypeIds
      : [],
    objectiveLabels: Array.isArray(notes.objectiveLabels)
      ? notes.objectiveLabels
      : [],
    objectiveIds: Array.isArray(notes.objectiveIds) ? notes.objectiveIds : [],
    industryLabels: Array.isArray(notes.industryLabels)
      ? notes.industryLabels
      : [],
    industryIds: Array.isArray(notes.industryIds) ? notes.industryIds : [],
    campaignStart: booking.startDate
      ? new Date(booking.startDate).toISOString().slice(0, 10)
      : notes.campaignStart || null,
    campaignEnd: booking.endDate
      ? new Date(booking.endDate).toISOString().slice(0, 10)
      : notes.campaignEnd || null,
    dayCount: notes.dayCount || booking.slots || booking.quantity || 1,
    slotIds,
    slots: Array.isArray(notes.slots) ? notes.slots : [],
    spotLengthsSec: Array.isArray(notes.spotLengthsSec)
      ? notes.spotLengthsSec
      : [],
    slotFrequencies:
      notes.slotFrequencies && typeof notes.slotFrequencies === "object"
        ? notes.slotFrequencies
        : {},
    broadcastFrequencyId: notes.broadcastFrequencyId || notes.frequencyId || null,
    activeBroadcastDays: Array.isArray(notes.activeBroadcastDays)
      ? notes.activeBroadcastDays
      : [],
    estimatedImpressions: notes.estimatedImpressions ?? null,
    subtotal: Number(notes.subtotal) || Number(booking.totalAmount) || 0,
    vat: Number(notes.vat) || 0,
    nhilGetfund: Number(notes.nhilGetfund) || 0,
    total:
      Number(notes.listTotal) ||
      Number(notes.total) ||
      Number(booking.totalAmount) ||
      0,
    contact: {
      name: booking.clientName || "",
      email: booking.clientEmail || "",
      phone: booking.clientPhone || "",
    },
    rateCardBookingId: booking.id,
  };
}

/**
 * Open the unpaid booking in the TV/radio campaign scheduler (not the cart).
 * Cart is for review/checkout after they finish editing.
 */
export function resumeUnpaidMediaBooking(booking) {
  const item = rebuildPlannerItemFromBooking(booking);
  if (!item?.rateCardId) {
    return { success: false, error: "This booking has no station to edit" };
  }

  const hasSlots = (item.slotIds || []).length > 0;
  const draft = upsertMediaPlannerDraft({
    ...item,
    // Stable draft id so re-edit updates the same draft
    id: item.id ? `edit-${item.id}` : item.rateCardBookingId
      ? `edit-booking-${item.rateCardBookingId}`
      : undefined,
    // Land on airtime step when slots exist; otherwise station/format
    currentStep: hasSlots ? 4 : 2,
  });
  const channel = String(item.channel || "TV").toUpperCase();
  const base =
    channel === "RADIO" ? "/products/radio-media" : "/products/tv-media";
  return {
    success: true,
    href: `${base}?draft=${encodeURIComponent(draft.id)}`,
    mode: "scheduler",
    item: draft,
  };
}
