function parseNotes(notes) {
  if (!notes) return null;
  if (typeof notes === "object" && !Array.isArray(notes)) return notes;
  if (typeof notes !== "string") return null;
  const trimmed = notes.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function createdBucket(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";
  // Same checkout creates sibling slots within the same second/minute.
  return date.toISOString().slice(0, 16);
}

/**
 * Planner checkout creates one RateCardBookingItem per airtime slot.
 * Group those siblings into a single campaign request/order.
 */
export function groupRateCardRequests(bookings = []) {
  const groups = new Map();

  for (const booking of bookings) {
    const notes = parseNotes(booking.notes);
    const campaignName =
      booking.mediaCampaignName || notes?.brandName || null;
    const key = booking.mediaInvoiceId
      ? `invoice:${booking.mediaInvoiceId}`
      : [
          "loose",
          booking.clientEmail || "",
          booking.rateCardId || "",
          campaignName || "",
          booking.status || "",
          createdBucket(booking.createdAt),
        ].join("|");

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(booking);
  }

  return Array.from(groups.entries()).map(([key, items]) => {
    const sorted = [...items].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    const primary = sorted[0];
    const slotLabels = sorted
      .map(
        (item) =>
          item.snapshotDescription ||
          item.row?.table?.section?.title ||
          null
      )
      .filter(Boolean);
    const uniqueSlots = [...new Set(slotLabels)];
    const totalAmount = sorted.reduce(
      (sum, item) => sum + (Number(item.totalAmount) || 0),
      0
    );
    const notes = parseNotes(primary.notes);
    const campaignName =
      primary.mediaCampaignName ||
      notes?.brandName ||
      primary.rateCard?.title ||
      "Media booking";

    const status =
      sorted.find((item) => item.status === "PENDING")?.status ||
      sorted.find((item) => item.status === "CONFIRMED")?.status ||
      primary.status;

    return {
      key,
      id: primary.id,
      primary,
      items: sorted,
      slotCount: sorted.length,
      slotLabels: uniqueSlots,
      campaignName,
      clientName: primary.clientName,
      clientEmail: primary.clientEmail,
      status,
      totalAmount,
      createdAt: primary.createdAt,
      updatedAt: primary.updatedAt || primary.createdAt,
      mediaInvoiceId: primary.mediaInvoiceId || null,
      mediaInvoice: primary.mediaInvoice || null,
      rateCardTitle: primary.rateCard?.title || null,
      sectionTitle: primary.row?.table?.section?.title || null,
      agency: primary.agency || null,
      rateCard: primary.rateCard || null,
      startDate: sorted.find((item) => item.startDate)?.startDate || null,
      endDate:
        [...sorted].reverse().find((item) => item.endDate)?.endDate || null,
    };
  });
}
