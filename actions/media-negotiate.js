"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";
import { NOTIFICATION_TYPES, notifyUser } from "@/lib/notifications";

async function resolveMediaCounterpartUserId(negotiation, perspective) {
  if (perspective === "CLIENT") {
    const agency = await db.mediaAgency.findUnique({
      where: { id: negotiation.agencyId },
      select: { userId: true },
    });
    return agency?.userId || null;
  }
  return negotiation.clientUserId || null;
}

function money(value) {
  return `GH₵ ${Number(value || 0).toLocaleString("en-GH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function shapeMessage(row) {
  return {
    id: row.id,
    negotiationId: row.negotiationId,
    senderRole: row.senderRole,
    senderUserId: row.senderUserId || null,
    type: row.type,
    body: row.body,
    meta: row.meta && typeof row.meta === "object" ? row.meta : null,
    createdAt: row.createdAt.toISOString(),
  };
}

function shapeNegotiation(row) {
  if (!row) return null;
  return {
    id: row.id,
    sourceType: row.sourceType,
    sourceId: row.sourceId,
    agencyId: row.agencyId,
    clientUserId: row.clientUserId || null,
    clientEmail: row.clientEmail,
    clientName: row.clientName || "",
    title: row.title,
    stationName: row.stationName || "",
    packageLabel: row.packageLabel || "",
    listAmount: Number(row.listAmount || 0),
    requestedDiscountPct:
      row.requestedDiscountPct != null ? Number(row.requestedDiscountPct) : null,
    proposedAmount: row.proposedAmount != null ? Number(row.proposedAmount) : null,
    counterAmount: row.counterAmount != null ? Number(row.counterAmount) : null,
    agreedAmount: row.agreedAmount != null ? Number(row.agreedAmount) : null,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    agency: row.agency
      ? {
          id: row.agency.id,
          agencyName: row.agency.agencyName,
          contactName: row.agency.contactName,
        }
      : null,
    messages: Array.isArray(row.messages) ? row.messages.map(shapeMessage) : [],
  };
}

async function requireUser() {
  const auth = await getAuthUserId();
  if (!auth?.userId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, role: true, name: true, email: true },
  });
  if (!user) throw new Error("Unauthorized");
  return user;
}

async function loadBookingContext(sourceType, sourceId) {
  if (sourceType === "MEDIA_BOOKING") {
    const booking = await db.mediaBooking.findUnique({
      where: { id: sourceId },
      include: {
        listing: { select: { id: true, name: true, listingType: true } },
        agency: { select: { id: true, agencyName: true, contactName: true } },
      },
    });
    if (!booking) throw new Error("Booking not found");
    return {
      sourceType: "MEDIA_BOOKING",
      sourceId: booking.id,
      agencyId: booking.agencyId,
      clientEmail: booking.clientEmail,
      clientName: booking.clientName,
      title: booking.listing?.name || booking.packageName || "Media booking",
      stationName: booking.agency?.agencyName || booking.listing?.name || "Station",
      packageLabel: [
        booking.packageName,
        booking.duration,
        booking.slots ? `${booking.slots} spots` : null,
      ]
        .filter(Boolean)
        .join(" · "),
      listAmount: Number(booking.totalAmount || booking.packagePrice || 0),
      bookingStatus: booking.status,
      agency: booking.agency,
    };
  }

  const booking = await db.rateCardBookingItem.findUnique({
    where: { id: sourceId },
    include: {
      rateCard: { select: { id: true, title: true, listingType: true } },
      agency: { select: { id: true, agencyName: true, contactName: true } },
    },
  });
  if (!booking) throw new Error("Booking not found");
  return {
    sourceType: "RATE_CARD_BOOKING",
    sourceId: booking.id,
    agencyId: booking.agencyId,
    clientEmail: booking.clientEmail,
    clientName: booking.clientName,
    title: booking.rateCard?.title || booking.snapshotDescription || "Rate card booking",
    stationName: booking.agency?.agencyName || "Station",
    packageLabel: [
      booking.snapshotDescription,
      booking.quantity ? `${booking.quantity} units` : null,
      booking.mediaCampaignName,
    ]
      .filter(Boolean)
      .join(" · "),
    listAmount: Number(booking.totalAmount || booking.snapshotPrice || 0),
    bookingStatus: booking.status,
    agency: booking.agency,
  };
}

function revalidateNegotiation(id, sourceType, sourceId) {
  revalidatePath("/client/media");
  revalidatePath("/media-agency/requests");
  revalidatePath("/media-agency/negotiations");
  if (id) {
    revalidatePath(`/client/media/negotiate/${id}`);
    revalidatePath(`/media-agency/negotiations/${id}`);
  }
  if (sourceType && sourceId) {
    revalidatePath(`/client/media/negotiate/start/${sourceType}/${sourceId}`);
  }
}

export async function ensureMediaNegotiation(sourceType, sourceId) {
  const user = await requireUser();
  const type =
    sourceType === "RATE_CARD_BOOKING" ? "RATE_CARD_BOOKING" : "MEDIA_BOOKING";
  const ctx = await loadBookingContext(type, sourceId);

  if (user.role === "CLIENT" || user.role === "MEDIA_AGENCY") {
    // ok
  } else {
    throw new Error("Unauthorized");
  }

  if (user.role === "CLIENT") {
    if (
      !user.email ||
      user.email.toLowerCase() !== String(ctx.clientEmail || "").toLowerCase()
    ) {
      throw new Error("Booking not found for your account");
    }
  }

  if (user.role === "MEDIA_AGENCY") {
    const agency = await db.mediaAgency.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!agency || agency.id !== ctx.agencyId) {
      throw new Error("Booking not found for your agency");
    }
  }

  const existing = await db.mediaNegotiation.findUnique({
    where: {
      sourceType_sourceId: { sourceType: type, sourceId },
    },
    include: {
      agency: { select: { id: true, agencyName: true, contactName: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (existing) {
    return { success: true, negotiation: shapeNegotiation(existing), created: false };
  }

  if (!ctx.listAmount || ctx.listAmount <= 0) {
    throw new Error("This booking has no quote amount to negotiate");
  }

  const created = await db.mediaNegotiation.create({
    data: {
      sourceType: type,
      sourceId,
      agencyId: ctx.agencyId,
      clientUserId: user.role === "CLIENT" ? user.id : null,
      clientEmail: ctx.clientEmail,
      clientName: ctx.clientName,
      title: ctx.title,
      stationName: ctx.stationName,
      packageLabel: ctx.packageLabel || null,
      listAmount: ctx.listAmount,
      status: "OPEN",
      messages: {
        create: [
          {
            senderRole: "SYSTEM",
            type: "SYSTEM",
            body: `Quote opened at ${money(ctx.listAmount)}${
              ctx.packageLabel ? ` · ${ctx.packageLabel}` : ""
            }. Request a discount or message the station.`,
          },
        ],
      },
    },
    include: {
      agency: { select: { id: true, agencyName: true, contactName: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  revalidateNegotiation(created.id, type, sourceId);
  return { success: true, negotiation: shapeNegotiation(created), created: true };
}

export async function getMediaNegotiation(id) {
  const user = await requireUser();
  const row = await db.mediaNegotiation.findUnique({
    where: { id },
    include: {
      agency: { select: { id: true, agencyName: true, contactName: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!row) return null;

  if (user.role === "CLIENT") {
    const okEmail =
      user.email &&
      user.email.toLowerCase() === String(row.clientEmail || "").toLowerCase();
    const okUser = row.clientUserId && row.clientUserId === user.id;
    if (!okEmail && !okUser) throw new Error("Unauthorized");
    return { negotiation: shapeNegotiation(row), perspective: "CLIENT" };
  }

  if (user.role === "MEDIA_AGENCY") {
    const agency = await db.mediaAgency.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!agency || agency.id !== row.agencyId) throw new Error("Unauthorized");
    return { negotiation: shapeNegotiation(row), perspective: "AGENCY" };
  }

  throw new Error("Unauthorized");
}

export async function getClientMediaNegotiations() {
  const user = await requireUser();
  if (user.role !== "CLIENT") throw new Error("Only clients can list negotiations");
  if (!user.email) return { negotiations: [] };

  const rows = await db.mediaNegotiation.findMany({
    where: {
      OR: [
        { clientUserId: user.id },
        { clientEmail: { equals: user.email, mode: "insensitive" } },
      ],
    },
    include: {
      agency: { select: { id: true, agencyName: true, contactName: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return { negotiations: rows.map(shapeNegotiation) };
}

export async function getAgencyMediaNegotiations() {
  const user = await requireUser();
  if (user.role !== "MEDIA_AGENCY") throw new Error("Only agencies can list negotiations");
  const agency = await db.mediaAgency.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!agency) return { negotiations: [] };

  const rows = await db.mediaNegotiation.findMany({
    where: { agencyId: agency.id },
    include: {
      agency: { select: { id: true, agencyName: true, contactName: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return { negotiations: rows.map(shapeNegotiation) };
}

export async function sendMediaNegotiationMessage(negotiationId, body) {
  const user = await requireUser();
  const text = String(body || "").trim().slice(0, 2000);
  if (!text) throw new Error("Message is required");

  const data = await getMediaNegotiation(negotiationId);
  if (!data?.negotiation) throw new Error("Negotiation not found");
  if (["ACCEPTED", "REJECTED", "CLOSED"].includes(data.negotiation.status)) {
    throw new Error("This negotiation is closed");
  }

  const role = data.perspective === "AGENCY" ? "AGENCY" : "CLIENT";
  await db.mediaNegotiationMessage.create({
    data: {
      negotiationId,
      senderRole: role,
      senderUserId: user.id,
      type: "TEXT",
      body: text,
    },
  });
  await db.mediaNegotiation.update({
    where: { id: negotiationId },
    data: { updatedAt: new Date() },
  });

  const counterpartId = await resolveMediaCounterpartUserId(
    data.negotiation,
    data.perspective
  );
  await notifyUser({
    userId: counterpartId,
    actorId: user.id,
    type: NOTIFICATION_TYPES.MEDIA_MESSAGE,
    title: "New media negotiation message",
    body: text.slice(0, 140),
    href:
      data.perspective === "CLIENT"
        ? `/media-agency/negotiations/${negotiationId}`
        : `/client/media/negotiate/${negotiationId}`,
    meta: { negotiationId },
  });

  revalidateNegotiation(negotiationId);
  return getMediaNegotiation(negotiationId);
}

export async function requestMediaDiscount(negotiationId, { discountPct, note } = {}) {
  const user = await requireUser();
  if (user.role !== "CLIENT") throw new Error("Only clients can request discounts");

  const pct = Number(discountPct);
  if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) {
    throw new Error("Enter a discount between 1% and 99%");
  }

  const data = await getMediaNegotiation(negotiationId);
  if (!data?.negotiation) throw new Error("Negotiation not found");
  const n = data.negotiation;
  if (["ACCEPTED", "REJECTED", "CLOSED"].includes(n.status)) {
    throw new Error("This negotiation is closed");
  }

  const proposedAmount = Math.round(n.listAmount * (1 - pct / 100) * 100) / 100;
  const noteText = String(note || "").trim().slice(0, 1000);
  const body = noteText
    ? `Requested ${pct}% discount. Proposed total: ${money(proposedAmount)}. ${noteText}`
    : `Requested ${pct}% discount. Proposed total: ${money(proposedAmount)}.`;

  await db.$transaction([
    db.mediaNegotiationMessage.create({
      data: {
        negotiationId,
        senderRole: "CLIENT",
        senderUserId: user.id,
        type: "DISCOUNT_REQUEST",
        body,
        meta: { discountPct: pct, amount: proposedAmount },
      },
    }),
    db.mediaNegotiation.update({
      where: { id: negotiationId },
      data: {
        requestedDiscountPct: pct,
        proposedAmount,
        status: "DISCOUNT_REQUESTED",
      },
    }),
  ]);

  revalidateNegotiation(negotiationId);
  return getMediaNegotiation(negotiationId);
}

export async function counterMediaNegotiation(negotiationId, { amount, note } = {}) {
  const user = await requireUser();
  if (user.role !== "MEDIA_AGENCY") throw new Error("Only stations can counter");

  const counterAmount = Number(amount);
  if (!Number.isFinite(counterAmount) || counterAmount <= 0) {
    throw new Error("Enter a valid counter amount");
  }

  const data = await getMediaNegotiation(negotiationId);
  if (!data?.negotiation) throw new Error("Negotiation not found");
  const n = data.negotiation;
  if (["ACCEPTED", "REJECTED", "CLOSED"].includes(n.status)) {
    throw new Error("This negotiation is closed");
  }
  if (counterAmount > n.listAmount) {
    throw new Error("Counter offer can't exceed the list quote");
  }

  const noteText = String(note || "").trim().slice(0, 1000);
  const body = noteText
    ? `Station counter offer: ${money(counterAmount)}. ${noteText}`
    : `Station counter offer: ${money(counterAmount)}.`;

  await db.$transaction([
    db.mediaNegotiationMessage.create({
      data: {
        negotiationId,
        senderRole: "AGENCY",
        senderUserId: user.id,
        type: "COUNTER_OFFER",
        body,
        meta: { amount: counterAmount },
      },
    }),
    db.mediaNegotiation.update({
      where: { id: negotiationId },
      data: {
        counterAmount,
        status: "COUNTERED",
      },
    }),
  ]);

  revalidateNegotiation(negotiationId);
  return getMediaNegotiation(negotiationId);
}

export async function acceptMediaNegotiation(negotiationId, { amount } = {}) {
  const user = await requireUser();
  const data = await getMediaNegotiation(negotiationId);
  if (!data?.negotiation) throw new Error("Negotiation not found");
  const n = data.negotiation;
  if (["ACCEPTED", "REJECTED", "CLOSED"].includes(n.status)) {
    throw new Error("This negotiation is closed");
  }

  let agreed =
    amount != null
      ? Number(amount)
      : n.counterAmount != null
        ? n.counterAmount
        : n.proposedAmount != null
          ? n.proposedAmount
          : n.listAmount;

  if (!Number.isFinite(agreed) || agreed <= 0) {
    throw new Error("No amount to accept");
  }

  // Client accepting station counter, or agency accepting client proposal
  if (data.perspective === "CLIENT" && n.status !== "COUNTERED" && amount == null) {
    if (n.counterAmount == null) {
      throw new Error("Wait for a station counter, or accept your proposed amount after they respond");
    }
  }

  const role = data.perspective === "AGENCY" ? "AGENCY" : "CLIENT";
  await db.$transaction(async (tx) => {
    await tx.mediaNegotiationMessage.create({
      data: {
        negotiationId,
        senderRole: role,
        senderUserId: user.id,
        type: "ACCEPT",
        body: `Agreed total: ${money(agreed)}`,
        meta: { amount: agreed },
      },
    });
    await tx.mediaNegotiation.update({
      where: { id: negotiationId },
      data: {
        agreedAmount: agreed,
        status: "ACCEPTED",
      },
    });

    // Persist negotiated amount onto the booking when possible
    if (n.sourceType === "MEDIA_BOOKING") {
      await tx.mediaBooking.update({
        where: { id: n.sourceId },
        data: { totalAmount: agreed },
      });
    } else if (n.sourceType === "RATE_CARD_BOOKING") {
      await tx.rateCardBookingItem.update({
        where: { id: n.sourceId },
        data: { totalAmount: agreed },
      });
    }
  });

  const counterpartId = await resolveMediaCounterpartUserId(n, data.perspective);
  await notifyUser({
    userId: counterpartId,
    actorId: user.id,
    type: NOTIFICATION_TYPES.MEDIA_STATUS,
    title: "Media deal accepted",
    body: `Agreed total: ${money(agreed)} for “${n.title || "media booking"}”.`,
    href:
      data.perspective === "CLIENT"
        ? `/media-agency/negotiations/${negotiationId}`
        : `/client/media/negotiate/${negotiationId}`,
    meta: { negotiationId, amount: agreed },
  });

  revalidateNegotiation(negotiationId, n.sourceType, n.sourceId);
  return getMediaNegotiation(negotiationId);
}

/** Station approves a discount % (or the buyer's requested %) and locks agreed amount. */
export async function approveMediaDiscount(negotiationId, { discountPct, note } = {}) {
  const user = await requireUser();
  if (user.role !== "MEDIA_AGENCY") throw new Error("Only stations can approve discounts");

  const data = await getMediaNegotiation(negotiationId);
  if (!data?.negotiation) throw new Error("Negotiation not found");
  const n = data.negotiation;
  if (["ACCEPTED", "REJECTED", "CLOSED"].includes(n.status)) {
    throw new Error("This negotiation is closed");
  }

  const pct =
    discountPct != null && discountPct !== ""
      ? Number(discountPct)
      : n.requestedDiscountPct != null
        ? Number(n.requestedDiscountPct)
        : null;

  if (!Number.isFinite(pct) || pct < 0 || pct >= 100) {
    throw new Error("Enter a valid discount between 0% and 99%");
  }

  const agreed = Math.round(n.listAmount * (1 - pct / 100) * 100) / 100;
  const noteText = String(note || "").trim().slice(0, 1000);
  const body = noteText
    ? `Station approved ${pct}% discount. Agreed total: ${money(agreed)}. ${noteText}`
    : `Station approved ${pct}% discount. Agreed total: ${money(agreed)}.`;

  await db.$transaction(async (tx) => {
    await tx.mediaNegotiationMessage.create({
      data: {
        negotiationId,
        senderRole: "AGENCY",
        senderUserId: user.id,
        type: "ACCEPT",
        body,
        meta: { discountPct: pct, amount: agreed },
      },
    });
    await tx.mediaNegotiation.update({
      where: { id: negotiationId },
      data: {
        requestedDiscountPct: pct,
        proposedAmount: agreed,
        agreedAmount: agreed,
        status: "ACCEPTED",
      },
    });
    if (n.sourceType === "MEDIA_BOOKING") {
      await tx.mediaBooking.update({
        where: { id: n.sourceId },
        data: { totalAmount: agreed },
      });
    } else if (n.sourceType === "RATE_CARD_BOOKING") {
      await tx.rateCardBookingItem.update({
        where: { id: n.sourceId },
        data: { totalAmount: agreed },
      });
    }
  });

  await notifyUser({
    userId: n.clientUserId,
    actorId: user.id,
    type: NOTIFICATION_TYPES.MEDIA_STATUS,
    title: "Media discount approved",
    body: `Station approved ${pct}% off · ${money(agreed)}.`,
    href: `/client/media/negotiate/${negotiationId}`,
    meta: { negotiationId, amount: agreed, discountPct: pct },
  });

  revalidateNegotiation(negotiationId, n.sourceType, n.sourceId);
  return getMediaNegotiation(negotiationId);
}

export async function rejectMediaNegotiation(negotiationId, { note } = {}) {
  const user = await requireUser();
  if (user.role !== "MEDIA_AGENCY") throw new Error("Only stations can decline");

  const data = await getMediaNegotiation(negotiationId);
  if (!data?.negotiation) throw new Error("Negotiation not found");
  if (["ACCEPTED", "REJECTED", "CLOSED"].includes(data.negotiation.status)) {
    throw new Error("This negotiation is closed");
  }

  const noteText = String(note || "").trim().slice(0, 1000);
  const body = noteText
    ? `Station declined the discount request. ${noteText}`
    : "Station declined the discount request. List quote still stands.";

  await db.$transaction([
    db.mediaNegotiationMessage.create({
      data: {
        negotiationId,
        senderRole: "AGENCY",
        senderUserId: user.id,
        type: "REJECT",
        body,
      },
    }),
    db.mediaNegotiation.update({
      where: { id: negotiationId },
      data: { status: "REJECTED" },
    }),
  ]);

  await notifyUser({
    userId: data.negotiation.clientUserId,
    actorId: user.id,
    type: NOTIFICATION_TYPES.MEDIA_STATUS,
    title: "Media negotiation declined",
    body: noteText || "Station declined the request. List quote still stands.",
    href: `/client/media/negotiate/${negotiationId}`,
    meta: { negotiationId },
  });

  revalidateNegotiation(negotiationId);
  return getMediaNegotiation(negotiationId);
}

/**
 * Open a rate negotiation from a media-planner cart flight (before checkout).
 * Creates a PENDING rate-card booking quote the station can discount, then
 * returns the negotiate workspace href.
 */
export async function startPlannerCartNegotiation(cartItem) {
  const user = await requireUser();
  if (user.role !== "CLIENT") {
    throw new Error("Only clients can negotiate media rates");
  }
  if (!cartItem || typeof cartItem !== "object") {
    throw new Error("Cart flight is required");
  }

  const rateCardId = cartItem.rateCardId;
  const cartItemId = String(cartItem.id || "").trim();
  const slotIds = Array.isArray(cartItem.slotIds)
    ? cartItem.slotIds.filter(Boolean)
    : [];
  const listAmount = Math.round(Number(cartItem.total) || 0);

  if (!rateCardId) {
    throw new Error("This flight has no station rate card to negotiate");
  }
  if (slotIds.length === 0) {
    throw new Error("This flight needs at least one airtime slot");
  }
  if (listAmount <= 0) {
    throw new Error("This flight has no quote amount to negotiate");
  }
  if (!cartItem.mediaCampaignName?.trim()) {
    throw new Error("Add a campaign name before negotiating");
  }

  const rateCard = await db.rateCard.findUnique({
    where: { id: rateCardId },
    select: {
      id: true,
      title: true,
      agencyId: true,
      isPublished: true,
      agency: { select: { id: true, agencyName: true, contactName: true } },
    },
  });
  if (!rateCard || !rateCard.isPublished) {
    throw new Error("Station rate card is unavailable");
  }

  let booking = null;
  if (cartItem.rateCardBookingId) {
    booking = await db.rateCardBookingItem.findFirst({
      where: {
        id: cartItem.rateCardBookingId,
        agencyId: rateCard.agencyId,
        clientEmail: { equals: user.email, mode: "insensitive" },
        status: "PENDING",
      },
    });
  }

  if (!booking && cartItemId) {
    const candidates = await db.rateCardBookingItem.findMany({
      where: {
        rateCardId: rateCard.id,
        agencyId: rateCard.agencyId,
        clientEmail: { equals: user.email, mode: "insensitive" },
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    booking =
      candidates.find((row) => {
        try {
          const notes = JSON.parse(row.notes || "{}");
          return notes?.cartItemId === cartItemId;
        } catch {
          return false;
        }
      }) || null;
  }

  if (!booking) {
    const rowId = slotIds[0];
    const row = await db.smartTableRow.findUnique({
      where: { id: rowId },
      include: { cells: { include: { column: true } } },
    });
    if (!row) {
      throw new Error("Airtime slot is no longer available");
    }

    const snapshotData = {};
    row.cells.forEach((cell) => {
      snapshotData[cell.column.name] = cell.value;
    });
    const priceColumn = row.cells.find((cell) =>
      ["CURRENCY", "NUMBER"].includes(cell.column.dataType)
    );
    const descriptionColumn = row.cells.find((cell) =>
      ["TEXT", "NOTES"].includes(cell.column.dataType)
    );
    const slotMeta = Array.isArray(cartItem.slots)
      ? cartItem.slots.find((slot) => slot.id === rowId)
      : null;
    const startDate = cartItem.campaignStart
      ? new Date(cartItem.campaignStart)
      : null;
    const endDate = cartItem.campaignEnd
      ? new Date(cartItem.campaignEnd)
      : startDate;

    const notes = JSON.stringify({
      source: "media_planner_cart_negotiate",
      cartItemId: cartItemId || null,
      channel: cartItem.channel || "TV",
      brandName: cartItem.brandName || null,
      audienceLabels: cartItem.audienceLabels || [],
      adFormatLabel: cartItem.adFormatLabel || null,
      slotIds,
      slots: Array.isArray(cartItem.slots) ? cartItem.slots.slice(0, 40) : [],
      dayCount: cartItem.dayCount || 1,
      estimatedImpressions: cartItem.estimatedImpressions ?? null,
      listTotal: listAmount,
      subtotal: cartItem.subtotal || 0,
      vat: cartItem.vat || 0,
      nhilGetfund: cartItem.nhilGetfund || 0,
    });

    booking = await db.rateCardBookingItem.create({
      data: {
        rowId: row.id,
        rateCardId: rateCard.id,
        agencyId: rateCard.agencyId,
        snapshotData,
        snapshotPrice: priceColumn?.value ? parseFloat(priceColumn.value) : null,
        snapshotUnit: "campaign estimate",
        snapshotDescription:
          slotMeta?.label ||
          descriptionColumn?.value ||
          cartItem.adFormatLabel ||
          "Media planner flight",
        mediaCampaignName: String(cartItem.mediaCampaignName).trim().slice(0, 200),
        clientName:
          cartItem.contact?.name ||
          user.name ||
          user.email?.split("@")[0] ||
          "Client",
        clientEmail: cartItem.contact?.email || user.email,
        clientPhone: cartItem.contact?.phone || null,
        quantity: cartItem.dayCount || 1,
        startDate:
          startDate && !Number.isNaN(startDate.getTime()) ? startDate : null,
        endDate: endDate && !Number.isNaN(endDate.getTime()) ? endDate : null,
        notes,
        totalAmount: listAmount,
        status: "PENDING",
      },
    });
  } else if (Number(booking.totalAmount) !== listAmount) {
    const openDeal = await db.mediaNegotiation.findUnique({
      where: {
        sourceType_sourceId: {
          sourceType: "RATE_CARD_BOOKING",
          sourceId: booking.id,
        },
      },
      select: { id: true, status: true, agreedAmount: true },
    });
    if (!openDeal || !["ACCEPTED", "CLOSED"].includes(openDeal.status)) {
      booking = await db.rateCardBookingItem.update({
        where: { id: booking.id },
        data: { totalAmount: listAmount },
      });
      if (openDeal?.id) {
        await db.mediaNegotiation.update({
          where: { id: openDeal.id },
          data: { listAmount },
        });
      }
    }
  }

  const ensured = await ensureMediaNegotiation("RATE_CARD_BOOKING", booking.id);
  const negotiation = ensured?.negotiation;
  if (!negotiation?.id) {
    throw new Error("Could not open negotiation");
  }

  revalidatePath("/products/media-cart");
  revalidatePath("/client/media");

  return {
    success: true,
    bookingId: booking.id,
    negotiationId: negotiation.id,
    href: `/client/media/negotiate/${negotiation.id}?from=cart&cartItemId=${encodeURIComponent(
      cartItemId || ""
    )}`,
    negotiation,
  };
}
