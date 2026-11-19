"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";
import { NOTIFICATION_TYPES, notifyUser } from "@/lib/notifications";
import {
  sendNegotiationAcceptedEmail,
  sendNegotiationOpenedEmail,
} from "@/lib/email";

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
      mediaInvoiceId: null,
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
    mediaInvoiceId: booking.mediaInvoiceId || null,
    agency: booking.agency,
  };
}

function revalidateNegotiation(id, sourceType, sourceId) {
  revalidatePath("/client/media");
  revalidatePath("/media-agency/requests");
  revalidatePath("/media-agency/negotiations");
  if (id) {
    revalidatePath(`/client/media/negotiate/${id}`);
    revalidatePath(`/messages/media/${id}`);
    revalidatePath(`/media-agency/negotiations/${id}`);
  }
  if (sourceType && sourceId) {
    revalidatePath(`/client/media/negotiate/start/${sourceType}/${sourceId}`);
  }
  revalidatePath("/messages");
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
    const emailMatches =
      user.email &&
      user.email.toLowerCase() === String(ctx.clientEmail || "").toLowerCase();
    // Fall back: if a negotiation already exists and is tied to this user id
    const existingForUser = !emailMatches
      ? await db.mediaNegotiation.findUnique({
          where: {
            sourceType_sourceId: { sourceType: type, sourceId },
          },
          select: { clientUserId: true },
        })
      : null;
    const userMatches = existingForUser?.clientUserId === user.id;
    if (!emailMatches && !userMatches) {
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

  const lockedStatuses = new Set(["CONFIRMED", "COMPLETED", "CANCELLED"]);
  if (lockedStatuses.has(String(ctx.bookingStatus || "").toUpperCase()) || ctx.mediaInvoiceId) {
    throw new Error("This booking is already confirmed or paid and can no longer be negotiated");
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
      agency: {
        select: {
          id: true,
          agencyName: true,
          contactName: true,
          email: true,
          userId: true,
          user: { select: { email: true, name: true } },
        },
      },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  // Alert the station so they open Payollar and respond.
  if (user.role === "CLIENT") {
    const agencyHref = `/media-agency/negotiations/${created.id}`;
    const clientLabel = ctx.clientName || user.name || "A client";
    const amountLabel = money(ctx.listAmount);
    const dealTitle = ctx.title || "Media booking";
    try {
      if (created.agency?.userId) {
        await notifyUser({
          userId: created.agency.userId,
          actorId: user.id,
          type: NOTIFICATION_TYPES.MEDIA_STATUS,
          title: "New negotiation request",
          body: `${clientLabel} wants to negotiate ${dealTitle} · ${amountLabel}.`,
          href: agencyHref,
          meta: { negotiationId: created.id, sourceType: type, sourceId },
        });
      }
      const agencyEmail =
        created.agency?.user?.email || created.agency?.email || null;
      if (agencyEmail) {
        await sendNegotiationOpenedEmail({
          to: agencyEmail,
          toName:
            created.agency?.user?.name ||
            created.agency?.contactName ||
            created.agency?.agencyName ||
            "Station",
          clientName: clientLabel,
          dealTitle,
          amountLabel,
          packageLabel: ctx.packageLabel || null,
          href: agencyHref,
        });
      }
    } catch (notifyError) {
      console.error("Negotiation opened station notify/email failed:", notifyError);
    }
  }

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

function previewMediaMessage(message) {
  if (!message) return "Media rate negotiation";
  if (message.type === "DISCOUNT_REQUEST") return "Discount request";
  if (message.type === "COUNTER_OFFER") return "Counter offer";
  if (message.type === "ACCEPT") return "Deal accepted";
  if (message.type === "REJECT") return "Deal declined";
  if (message.type === "SYSTEM") {
    const body = String(message.body || "");
    return body.length > 80 ? `${body.slice(0, 77)}…` : body || "Update";
  }
  return String(message.body || "Message");
}

function mediaUnreadForPerspective(status, perspective) {
  if (perspective === "CLIENT" && status === "COUNTERED") return 1;
  if (perspective === "AGENCY" && status === "DISCOUNT_REQUESTED") return 1;
  return 0;
}

/** Inbox rows for Messages — media deals as a thread type. */
export async function listMediaInboxChats() {
  const user = await requireUser();
  let rows = [];
  let perspective = null;

  if (user.role === "CLIENT") {
    if (!user.email) return [];
    perspective = "CLIENT";
    rows = await db.mediaNegotiation.findMany({
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
  } else if (user.role === "MEDIA_AGENCY") {
    perspective = "AGENCY";
    const agency = await db.mediaAgency.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!agency) return [];
    rows = await db.mediaNegotiation.findMany({
      where: { agencyId: agency.id },
      include: {
        agency: { select: { id: true, agencyName: true, contactName: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });
  } else {
    return [];
  }

  return rows.map((row) => {
    const last = Array.isArray(row.messages) ? row.messages[0] : null;
    const stationName = row.agency?.agencyName || row.stationName || "Station";
    const clientLabel = row.clientName || row.clientEmail || "Client";
    const otherName = perspective === "CLIENT" ? stationName : clientLabel;
    const mine =
      last &&
      ((perspective === "CLIENT" && last.senderRole === "CLIENT") ||
        (perspective === "AGENCY" && last.senderRole === "AGENCY"));

    return {
      threadType: "MEDIA",
      negotiationId: row.id,
      appointmentId: null,
      href: `/messages/media/${row.id}`,
      mediaStatus: row.status,
      listAmount: Number(row.listAmount || 0),
      other: {
        id: perspective === "CLIENT" ? row.agencyId : row.clientUserId || row.clientEmail,
        name: otherName,
        specialty: row.packageLabel || row.title || "Media deal",
        imageUrl: "",
      },
      lastMessage: last
        ? {
            body: previewMediaMessage(last),
            kind: last.type || "TEXT",
            createdAt: last.createdAt.toISOString(),
            mine: Boolean(mine),
          }
        : {
            body: "Media rate negotiation",
            kind: "SYSTEM",
            createdAt: row.updatedAt.toISOString(),
            mine: false,
          },
      unread: mediaUnreadForPerspective(row.status, perspective),
      updatedAt: row.updatedAt.toISOString(),
    };
  });
}

/** Actionable media-deal count for the Messages badge. */
export async function getUnreadMediaNegotiationCount() {
  try {
    const chats = await listMediaInboxChats();
    return chats.reduce((sum, chat) => sum + (Number(chat.unread) || 0), 0);
  } catch (error) {
    console.error("getUnreadMediaNegotiationCount failed:", error);
    return 0;
  }
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
        : `/messages/media/${negotiationId}`,
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
  const dealHref =
    data.perspective === "CLIENT"
      ? `/media-agency/negotiations/${negotiationId}`
      : `/messages/media/${negotiationId}`;
  await notifyUser({
    userId: counterpartId,
    actorId: user.id,
    type: NOTIFICATION_TYPES.MEDIA_STATUS,
    title: "Media deal accepted",
    body: `Agreed total: ${money(agreed)} for “${n.title || "media booking"}”.`,
    href: dealHref,
    meta: { negotiationId, amount: agreed },
  });

  if (counterpartId) {
    try {
      const counterpart = await db.user.findUnique({
        where: { id: counterpartId },
        select: { email: true, name: true },
      });
      if (counterpart?.email) {
        await sendNegotiationAcceptedEmail({
          to: counterpart.email,
          toName: counterpart.name || "there",
          counterpartName: user.name || "The other party",
          dealTitle: n.title || "Media booking",
          amountLabel: money(agreed),
          href: dealHref,
        });
      }
    } catch (e) {
      console.error("Negotiation accepted email failed:", e);
    }
  }

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

  const discountHref = `/messages/media/${negotiationId}`;
  await notifyUser({
    userId: n.clientUserId,
    actorId: user.id,
    type: NOTIFICATION_TYPES.MEDIA_STATUS,
    title: "Media discount approved",
    body: `Station approved ${pct}% off · ${money(agreed)}.`,
    href: discountHref,
    meta: { negotiationId, amount: agreed, discountPct: pct },
  });

  if (n.clientUserId) {
    try {
      const clientUser = await db.user.findUnique({
        where: { id: n.clientUserId },
        select: { email: true, name: true },
      });
      if (clientUser?.email) {
        await sendNegotiationAcceptedEmail({
          to: clientUser.email,
          toName: clientUser.name || "there",
          counterpartName: user.name || "Station",
          dealTitle: n.title || "Media booking",
          amountLabel: money(agreed),
          href: discountHref,
        });
      }
    } catch (e) {
      console.error("Negotiation discount email failed:", e);
    }
  }

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
    href: `/messages/media/${negotiationId}`,
    meta: { negotiationId },
  });

  revalidateNegotiation(negotiationId);
  return getMediaNegotiation(negotiationId);
}

function parseBookingNotes(raw) {
  try {
    const parsed = JSON.parse(raw || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function isPlannerCartBookingForItem(row, cartItemId) {
  if (!row || !cartItemId) return false;
  const notes = parseBookingNotes(row.notes);
  if (
    notes?.source === "media_planner_cart_negotiate" &&
    notes?.cartItemId === cartItemId
  ) {
    return true;
  }
  if (notes?.source === "media_planner_cart_campaign_negotiate") {
    const ids = Array.isArray(notes.cartItemIds) ? notes.cartItemIds.map(String) : [];
    return ids.includes(String(cartItemId));
  }
  return false;
}

function isPlannerCartCampaignBooking(row, campaignKey) {
  if (!row || !campaignKey) return false;
  const notes = parseBookingNotes(row.notes);
  return (
    notes?.source === "media_planner_cart_campaign_negotiate" &&
    String(notes.campaignKey || "") === String(campaignKey)
  );
}

function slimPlannerCartItem(cartItem) {
  return {
    id: String(cartItem?.id || "").trim(),
    rateCardId: cartItem?.rateCardId || null,
    rateCardBookingId: cartItem?.rateCardBookingId || null,
    channel: cartItem?.channel || "TV",
    mediaCampaignName: cartItem?.mediaCampaignName || "",
    brandName: cartItem?.brandName || null,
    adFormatLabel: cartItem?.adFormatLabel || null,
    audienceLabels: Array.isArray(cartItem?.audienceLabels)
      ? cartItem.audienceLabels.slice(0, 12)
      : [],
    campaignStart: cartItem?.campaignStart || null,
    campaignEnd: cartItem?.campaignEnd || null,
    dayCount: cartItem?.dayCount || 1,
    slotIds: Array.isArray(cartItem?.slotIds)
      ? cartItem.slotIds.filter(Boolean).slice(0, 40)
      : [],
    slots: Array.isArray(cartItem?.slots)
      ? cartItem.slots.slice(0, 20).map((slot) => ({
          id: slot.id,
          label: slot.label,
          range: slot.range || "",
          frequencyId: slot.frequencyId || null,
          lineTotal: slot.lineTotal ?? null,
        }))
      : [],
    estimatedImpressions: cartItem?.estimatedImpressions ?? null,
    subtotal: cartItem?.subtotal || 0,
    vat: cartItem?.vat || 0,
    nhilGetfund: cartItem?.nhilGetfund || 0,
    total: cartItem?.total,
    contact: {
      name: cartItem?.contact?.name || "",
      email: cartItem?.contact?.email || "",
      phone: cartItem?.contact?.phone || "",
    },
  };
}

/**
 * Open a rate negotiation from a media-planner cart flight (before checkout).
 * Creates a PENDING rate-card booking quote the station can discount, then
 * returns the negotiate workspace href.
 *
 * Ownership always uses the signed-in client's email (not the planner contact
 * form email). A mismatched contact email previously caused a 500 after the
 * booking was created, which showed up as a Server Components error in production.
 */
export async function startPlannerCartNegotiation(cartItem) {
  try {
    const user = await requireUser();
    if (user.role !== "CLIENT") {
      return { success: false, error: "Only clients can negotiate media rates" };
    }
    if (!user.email) {
      return { success: false, error: "Your account needs an email to negotiate" };
    }
    if (!cartItem || typeof cartItem !== "object") {
      return { success: false, error: "Cart flight is required" };
    }

    const rateCardId = cartItem.rateCardId;
    const cartItemId = String(cartItem.id || "").trim();
    const slotIds = Array.isArray(cartItem.slotIds)
      ? cartItem.slotIds.filter(Boolean).slice(0, 40)
      : [];
    const listAmount = Math.round(Number(cartItem.total) || 0);
    const contactName =
      String(cartItem.contact?.name || "").trim() ||
      user.name ||
      user.email.split("@")[0] ||
      "Client";
    const contactPhone = String(cartItem.contact?.phone || "").trim() || null;
    const contactEmail =
      String(cartItem.contact?.email || "").trim() || null;

    if (!rateCardId) {
      return {
        success: false,
        error: "This flight has no station rate card to negotiate",
      };
    }
    if (slotIds.length === 0) {
      return {
        success: false,
        error: "This flight needs at least one airtime slot",
      };
    }
    if (listAmount <= 0) {
      return {
        success: false,
        error: "This flight has no quote amount to negotiate",
      };
    }
    if (!cartItem.mediaCampaignName?.trim()) {
      return { success: false, error: "Add a campaign name before negotiating" };
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
      return { success: false, error: "Station rate card is unavailable" };
    }

    let booking = null;

    // Prefer an existing PENDING quote for this cart flight (even if an older
    // attempt saved the planner contact email instead of the account email).
    if (cartItem.rateCardBookingId) {
      const byId = await db.rateCardBookingItem.findFirst({
        where: {
          id: cartItem.rateCardBookingId,
          agencyId: rateCard.agencyId,
          status: "PENDING",
        },
      });
      if (
        byId &&
        (byId.clientEmail?.toLowerCase() === user.email.toLowerCase() ||
          isPlannerCartBookingForItem(byId, cartItemId))
      ) {
        booking = byId;
      }
    }

    if (!booking && cartItemId) {
      const candidates = await db.rateCardBookingItem.findMany({
        where: {
          rateCardId: rateCard.id,
          agencyId: rateCard.agencyId,
          status: "PENDING",
          OR: [
            { clientEmail: { equals: user.email, mode: "insensitive" } },
            ...(contactEmail
              ? [{ clientEmail: { equals: contactEmail, mode: "insensitive" } }]
              : []),
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      });
      booking =
        candidates.find((row) => isPlannerCartBookingForItem(row, cartItemId)) ||
        null;
    }

    if (booking) {
      const patch = {};
      if (booking.clientEmail?.toLowerCase() !== user.email.toLowerCase()) {
        patch.clientEmail = user.email;
      }
      if (contactName && booking.clientName !== contactName) {
        patch.clientName = contactName;
      }
      if (contactPhone && booking.clientPhone !== contactPhone) {
        patch.clientPhone = contactPhone;
      }
      if (Number(booking.totalAmount) !== listAmount) {
        patch.totalAmount = listAmount;
      }
      if (Object.keys(patch).length > 0) {
        booking = await db.rateCardBookingItem.update({
          where: { id: booking.id },
          data: patch,
        });
      }

      const openDeal = await db.mediaNegotiation.findUnique({
        where: {
          sourceType_sourceId: {
            sourceType: "RATE_CARD_BOOKING",
            sourceId: booking.id,
          },
        },
        select: {
          id: true,
          status: true,
          clientEmail: true,
          clientUserId: true,
          listAmount: true,
        },
      });
      if (openDeal?.id) {
        const dealPatch = {};
        if (openDeal.clientEmail?.toLowerCase() !== user.email.toLowerCase()) {
          dealPatch.clientEmail = user.email;
        }
        if (!openDeal.clientUserId) dealPatch.clientUserId = user.id;
        if (
          !["ACCEPTED", "CLOSED"].includes(openDeal.status) &&
          Number(openDeal.listAmount) !== listAmount
        ) {
          dealPatch.listAmount = listAmount;
        }
        if (Object.keys(dealPatch).length > 0) {
          await db.mediaNegotiation.update({
            where: { id: openDeal.id },
            data: dealPatch,
          });
        }
      }
    } else {
      const rowId = slotIds[0];
      const row = await db.smartTableRow.findUnique({
        where: { id: rowId },
        include: { cells: { include: { column: true } } },
      });
      if (!row) {
        return { success: false, error: "Airtime slot is no longer available" };
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

      const compactSlots = Array.isArray(cartItem.slots)
        ? cartItem.slots.slice(0, 20).map((slot) => ({
            id: slot.id,
            label: slot.label,
            range: slot.range || "",
            frequencyId: slot.frequencyId || null,
            lineTotal: slot.lineTotal ?? null,
          }))
        : [];

      const notes = JSON.stringify({
        source: "media_planner_cart_negotiate",
        cartItemId: cartItemId || null,
        channel: cartItem.channel || "TV",
        brandName: cartItem.brandName || null,
        audienceLabels: Array.isArray(cartItem.audienceLabels)
          ? cartItem.audienceLabels.slice(0, 12)
          : [],
        adFormatLabel: cartItem.adFormatLabel || null,
        plannerContactEmail: contactEmail,
        slotIds,
        slots: compactSlots,
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
          snapshotPrice: priceColumn?.value
            ? parseFloat(priceColumn.value)
            : null,
          snapshotUnit: "campaign estimate",
          snapshotDescription:
            slotMeta?.label ||
            descriptionColumn?.value ||
            cartItem.adFormatLabel ||
            "Media planner flight",
          mediaCampaignName: String(cartItem.mediaCampaignName)
            .trim()
            .slice(0, 200),
          // Always the signed-in account — contact form email is kept in notes.
          clientName: contactName,
          clientEmail: user.email,
          clientPhone: contactPhone,
          quantity: cartItem.dayCount || 1,
          startDate:
            startDate && !Number.isNaN(startDate.getTime()) ? startDate : null,
          endDate: endDate && !Number.isNaN(endDate.getTime()) ? endDate : null,
          notes,
          totalAmount: listAmount,
          status: "PENDING",
        },
      });
    }

    const ensured = await ensureMediaNegotiation("RATE_CARD_BOOKING", booking.id);
    const negotiation = ensured?.negotiation;
    if (!negotiation?.id) {
      return { success: false, error: "Could not open negotiation" };
    }

    revalidatePath("/products/media-cart");
    revalidatePath("/client/media");

    return {
      success: true,
      bookingId: booking.id,
      negotiationId: negotiation.id,
      cartItemIds: cartItemId ? [cartItemId] : [],
      href: `/messages/media/${negotiation.id}?from=cart&cartItemId=${encodeURIComponent(
        cartItemId || ""
      )}`,
    };
  } catch (error) {
    console.error("startPlannerCartNegotiation failed:", error);
    const message = error?.message || "Could not start negotiation";
    if (/unauthorized|sign in/i.test(message)) {
      return { success: false, error: "Unauthorized" };
    }
    return {
      success: false,
      error: "Could not start negotiation. Please try again.",
    };
  }
}

/**
 * Negotiate every selected cart flight under one campaign thread.
 * All flights must share the same published rate card (same station).
 */
export async function startPlannerCartCampaignNegotiation(cartItems = []) {
  try {
    const user = await requireUser();
    if (user.role !== "CLIENT") {
      return { success: false, error: "Only clients can negotiate media rates" };
    }
    if (!user.email) {
      return { success: false, error: "Your account needs an email to negotiate" };
    }

    const items = (Array.isArray(cartItems) ? cartItems : [])
      .map(slimPlannerCartItem)
      .filter((item) => item.id);

    if (items.length === 0) {
      return { success: false, error: "Select at least one flight to negotiate" };
    }
    if (items.length === 1) {
      return startPlannerCartNegotiation(items[0]);
    }

    const rateCardId = items[0].rateCardId;
    if (!rateCardId || items.some((item) => item.rateCardId !== rateCardId)) {
      return {
        success: false,
        error:
          "Select flights from the same station to negotiate them together",
      };
    }

    const campaignName = String(items[0].mediaCampaignName || "").trim();
    if (!campaignName) {
      return { success: false, error: "Add a campaign name before negotiating" };
    }
    if (items.some((item) => String(item.mediaCampaignName || "").trim() !== campaignName)) {
      return {
        success: false,
        error: "Selected flights must belong to the same campaign",
      };
    }

    for (const item of items) {
      if (!item.slotIds.length) {
        return {
          success: false,
          error: `"${item.adFormatLabel || "A flight"}" needs at least one airtime slot`,
        };
      }
      if (Math.round(Number(item.total) || 0) <= 0) {
        return {
          success: false,
          error: `"${item.adFormatLabel || "A flight"}" has no quote amount`,
        };
      }
    }

    const listAmount = items.reduce(
      (sum, item) => sum + Math.round(Number(item.total) || 0),
      0
    );
    const contactName =
      String(items[0].contact?.name || "").trim() ||
      user.name ||
      user.email.split("@")[0] ||
      "Client";
    const contactPhone = String(items[0].contact?.phone || "").trim() || null;
    const contactEmail = String(items[0].contact?.email || "").trim() || null;
    const cartItemIds = items.map((item) => item.id);
    const campaignKey = [
      campaignName.toLowerCase(),
      String(items[0].brandName || "")
        .trim()
        .toLowerCase(),
      String(items[0].channel || "TV").toUpperCase(),
      rateCardId,
    ].join("::");

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
      return { success: false, error: "Station rate card is unavailable" };
    }

    const adTypeLabels = [
      ...new Set(
        items
          .map((item) => String(item.adFormatLabel || "").trim())
          .filter(Boolean)
      ),
    ];
    const packageLabel =
      adTypeLabels.length > 0
        ? `${adTypeLabels.join(" + ")} · ${items.length} flights`
        : `${items.length} flights`;

    let booking = null;
    const candidates = await db.rateCardBookingItem.findMany({
      where: {
        rateCardId: rateCard.id,
        agencyId: rateCard.agencyId,
        status: "PENDING",
        OR: [
          { clientEmail: { equals: user.email, mode: "insensitive" } },
          ...(contactEmail
            ? [{ clientEmail: { equals: contactEmail, mode: "insensitive" } }]
            : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    });
    booking =
      candidates.find((row) => isPlannerCartCampaignBooking(row, campaignKey)) ||
      null;

    const flightNotes = items.map((item) => ({
      cartItemId: item.id,
      adFormatLabel: item.adFormatLabel || null,
      dayCount: item.dayCount || 1,
      total: Math.round(Number(item.total) || 0),
      slotIds: item.slotIds,
      slots: item.slots,
      campaignStart: item.campaignStart || null,
      campaignEnd: item.campaignEnd || null,
    }));

    const notes = JSON.stringify({
      source: "media_planner_cart_campaign_negotiate",
      campaignKey,
      cartItemIds,
      channel: items[0].channel || "TV",
      brandName: items[0].brandName || null,
      audienceLabels: items[0].audienceLabels || [],
      plannerContactEmail: contactEmail,
      flights: flightNotes,
      listTotal: listAmount,
      subtotal: items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0),
      vat: items.reduce((sum, item) => sum + (Number(item.vat) || 0), 0),
      nhilGetfund: items.reduce(
        (sum, item) => sum + (Number(item.nhilGetfund) || 0),
        0
      ),
    });

    const lead = items[0];
    const leadRowId = lead.slotIds[0];
    const row = await db.smartTableRow.findUnique({
      where: { id: leadRowId },
      include: { cells: { include: { column: true } } },
    });
    if (!row) {
      return { success: false, error: "Airtime slot is no longer available" };
    }

    const snapshotData = {};
    row.cells.forEach((cell) => {
      snapshotData[cell.column.name] = cell.value;
    });
    const priceColumn = row.cells.find((cell) =>
      ["CURRENCY", "NUMBER"].includes(cell.column.dataType)
    );
    const startDate = lead.campaignStart ? new Date(lead.campaignStart) : null;
    const endDate = lead.campaignEnd
      ? new Date(lead.campaignEnd)
      : startDate;

    if (booking) {
      booking = await db.rateCardBookingItem.update({
        where: { id: booking.id },
        data: {
          clientEmail: user.email,
          clientName: contactName,
          clientPhone: contactPhone,
          snapshotDescription: packageLabel.slice(0, 200),
          mediaCampaignName: campaignName.slice(0, 200),
          quantity: items.length,
          startDate:
            startDate && !Number.isNaN(startDate.getTime()) ? startDate : null,
          endDate: endDate && !Number.isNaN(endDate.getTime()) ? endDate : null,
          notes,
          totalAmount: listAmount,
        },
      });
    } else {
      booking = await db.rateCardBookingItem.create({
        data: {
          rowId: row.id,
          rateCardId: rateCard.id,
          agencyId: rateCard.agencyId,
          snapshotData,
          snapshotPrice: priceColumn?.value
            ? parseFloat(priceColumn.value)
            : null,
          snapshotUnit: "campaign estimate",
          snapshotDescription: packageLabel.slice(0, 200),
          mediaCampaignName: campaignName.slice(0, 200),
          clientName: contactName,
          clientEmail: user.email,
          clientPhone: contactPhone,
          quantity: items.length,
          startDate:
            startDate && !Number.isNaN(startDate.getTime()) ? startDate : null,
          endDate: endDate && !Number.isNaN(endDate.getTime()) ? endDate : null,
          notes,
          totalAmount: listAmount,
          status: "PENDING",
        },
      });
    }

    const ensured = await ensureMediaNegotiation("RATE_CARD_BOOKING", booking.id);
    const negotiation = ensured?.negotiation;
    if (!negotiation?.id) {
      return { success: false, error: "Could not open negotiation" };
    }

    // Keep list amount / label in sync when reopening
    if (
      Number(negotiation.listAmount) !== listAmount ||
      negotiation.packageLabel !== packageLabel
    ) {
      await db.mediaNegotiation.update({
        where: { id: negotiation.id },
        data: {
          listAmount,
          packageLabel,
          title: campaignName.slice(0, 200),
        },
      });
    }

    if (ensured.created) {
      const flightLines = items
        .map((item) => {
          const label = item.adFormatLabel || "Flight";
          return `${label}: ${money(item.total)}`;
        })
        .join(" · ");
      await db.mediaNegotiationMessage.create({
        data: {
          negotiationId: negotiation.id,
          senderRole: "CLIENT",
          senderUserId: user.id,
          type: "TEXT",
          body: [
            `Campaign negotiation for “${campaignName}”.`,
            `${items.length} ad type${items.length === 1 ? "" : "s"}: ${flightLines}.`,
            `Combined list total: ${money(listAmount)}.`,
            "Can we discuss a package rate across these flights?",
          ].join(" "),
        },
      });
      await db.mediaNegotiation.update({
        where: { id: negotiation.id },
        data: { updatedAt: new Date() },
      });
    }

    revalidatePath("/products/media-cart");
    revalidatePath("/client/media");

    const idsQuery = encodeURIComponent(cartItemIds.join(","));
    return {
      success: true,
      bookingId: booking.id,
      negotiationId: negotiation.id,
      cartItemIds,
      href: `/messages/media/${negotiation.id}?from=cart&cartItemIds=${idsQuery}`,
    };
  } catch (error) {
    console.error("startPlannerCartCampaignNegotiation failed:", error);
    const message = error?.message || "Could not start negotiation";
    if (/unauthorized|sign in/i.test(message)) {
      return { success: false, error: "Unauthorized" };
    }
    return {
      success: false,
      error: "Could not start negotiation. Please try again.",
    };
  }
}

function isDigitalMarketplaceBookingForQuote(row, quoteKey) {
  if (!row || !quoteKey) return false;
  try {
    const notes = row.notes ? JSON.parse(row.notes) : null;
    return (
      notes?.source === "digital_marketplace_quote" &&
      notes?.quoteKey === quoteKey
    );
  } catch {
    return false;
  }
}

function isBillboardMarketplaceBookingForQuote(row, quoteKey) {
  if (!row || !quoteKey) return false;
  try {
    const notes = row.notes ? JSON.parse(row.notes) : null;
    return (
      notes?.source === "billboard_marketplace_quote" &&
      notes?.quoteKey === quoteKey
    );
  } catch {
    return false;
  }
}

/**
 * Open Messages negotiation from Digital marketplace Get Quote.
 * Creates a PENDING media booking against the live listing, then opens
 * /messages/media/{negotiationId} (same inbox flow as media cart).
 */
export async function startDigitalMarketplaceNegotiation(payload = {}) {
  try {
    const user = await requireUser();
    if (user.role !== "CLIENT") {
      return { success: false, error: "Only clients can negotiate media rates" };
    }
    if (!user.email) {
      return { success: false, error: "Your account needs an email to negotiate" };
    }

    const listingId = String(payload.listingId || "").trim();
    const isDemo = Boolean(payload.isDemo);
    if (isDemo || !listingId || listingId.startsWith("demo-")) {
      return {
        success: false,
        demo: true,
        error:
          "Demo publishers use a preview chat. Live listings open negotiation in Messages.",
      };
    }

    const listAmount = Math.round(Number(payload.estimatedTotal) || 0);
    if (listAmount <= 0) {
      return { success: false, error: "This quote has no amount to negotiate" };
    }

    const listing = await db.mediaListing.findFirst({
      where: { id: listingId, status: "ACTIVE" },
      include: {
        agency: { select: { id: true, agencyName: true, contactName: true } },
        packages: { select: { id: true, name: true, price: true } },
      },
    });
    if (!listing?.agencyId) {
      return { success: false, error: "Digital listing is unavailable" };
    }

    const packageId = String(payload.packageId || payload.adTypeId || "").trim();
    const matchedPackage = listing.packages?.find((pkg) => pkg.id === packageId);
    const packageName =
      String(payload.packageName || payload.adTypeLabel || "").trim() ||
      matchedPackage?.name ||
      "Digital package";
    const durationLabel = String(payload.durationLabel || "").trim() || null;
    const weeks = Number(payload.weeks) || null;
    const impressions = Number(payload.impressions) || null;
    const contactName =
      user.name || user.email.split("@")[0] || "Client";

    const quoteKey = [
      listing.id,
      packageId || packageName,
      durationLabel || weeks || "",
      listAmount,
    ].join(":");

    let booking = null;
    const candidates = await db.mediaBooking.findMany({
      where: {
        listingId: listing.id,
        agencyId: listing.agencyId,
        status: "PENDING",
        clientEmail: { equals: user.email, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    booking =
      candidates.find((row) =>
        isDigitalMarketplaceBookingForQuote(row, quoteKey)
      ) || null;

    const notes = JSON.stringify({
      source: "digital_marketplace_quote",
      quoteKey,
      listingId: listing.id,
      packageId: packageId || null,
      packageName,
      durationLabel,
      weeks,
      impressions,
      weeklyRate: Number(payload.weeklyRate) || null,
      listTotal: listAmount,
    });

    if (booking) {
      booking = await db.mediaBooking.update({
        where: { id: booking.id },
        data: {
          clientName: contactName,
          packageName,
          packagePrice: Number(payload.weeklyRate) || matchedPackage?.price || listAmount,
          duration: durationLabel,
          slots: weeks || 1,
          totalAmount: listAmount,
          notes,
        },
      });
    } else {
      booking = await db.mediaBooking.create({
        data: {
          listingId: listing.id,
          agencyId: listing.agencyId,
          clientName: contactName,
          clientEmail: user.email,
          packageName,
          packagePrice:
            Number(payload.weeklyRate) || matchedPackage?.price || listAmount,
          duration: durationLabel,
          slots: weeks || 1,
          totalAmount: listAmount,
          status: "PENDING",
          notes,
        },
      });
    }

    const ensured = await ensureMediaNegotiation("MEDIA_BOOKING", booking.id);
    const negotiation = ensured?.negotiation;
    if (!negotiation?.id) {
      return { success: false, error: "Could not open negotiation" };
    }

    // Seed a client opener so the inbox thread has the quote context
    if (ensured.created) {
      const opener = [
        `Digital quote request for ${listing.name}.`,
        `Package: ${packageName}.`,
        durationLabel ? `Duration: ${durationLabel}.` : null,
        `Estimated total: ${money(listAmount)}.`,
        "Can we discuss rate or flight length?",
      ]
        .filter(Boolean)
        .join(" ");

      await db.mediaNegotiationMessage.create({
        data: {
          negotiationId: negotiation.id,
          senderRole: "CLIENT",
          senderUserId: user.id,
          type: "TEXT",
          body: opener.slice(0, 2000),
        },
      });
      await db.mediaNegotiation.update({
        where: { id: negotiation.id },
        data: { updatedAt: new Date() },
      });
    }

    revalidatePath("/messages");
    revalidatePath("/products");
    revalidatePath("/client/media");

    return {
      success: true,
      bookingId: booking.id,
      negotiationId: negotiation.id,
      href: `/messages/media/${negotiation.id}?from=digital`,
    };
  } catch (error) {
    console.error("startDigitalMarketplaceNegotiation failed:", error);
    const message = error?.message || "Could not start negotiation";
    if (/unauthorized|sign in/i.test(message)) {
      return { success: false, error: "Unauthorized" };
    }
    return {
      success: false,
      error: "Could not start negotiation. Please try again.",
    };
  }
}

/**
 * Open Messages negotiation from Billboard marketplace Negotiate.
 * Live sites → /messages/media/{id}. Demo sites stay on the preview chat.
 */
export async function startBillboardMarketplaceNegotiation(payload = {}) {
  try {
    const user = await requireUser();
    if (user.role !== "CLIENT") {
      return { success: false, error: "Only clients can negotiate media rates" };
    }
    if (!user.email) {
      return { success: false, error: "Your account needs an email to negotiate" };
    }

    const listingId = String(payload.listingId || payload.siteId || "").trim();
    const isDemo = Boolean(payload.isDemo);
    if (
      isDemo ||
      !listingId ||
      listingId.startsWith("bb-") ||
      listingId.startsWith("demo-")
    ) {
      return {
        success: false,
        demo: true,
        error:
          "Demo sites use a preview chat. Live billboards open negotiation in Messages.",
      };
    }

    const listAmount = Math.round(
      Number(payload.total || payload.estimatedTotal) || 0
    );
    if (listAmount <= 0) {
      return { success: false, error: "This booking has no amount to negotiate" };
    }

    const listing = await db.mediaListing.findFirst({
      where: {
        id: listingId,
        status: "ACTIVE",
        listingType: "BILLBOARD",
      },
      include: {
        agency: {
          select: {
            id: true,
            agencyName: true,
            contactName: true,
            customPackageNotes: true,
            customPackageTerms: true,
          },
        },
        packages: { select: { id: true, name: true, price: true } },
      },
    });
    if (!listing?.agencyId) {
      return { success: false, error: "Billboard site is unavailable" };
    }

    const packageId = String(payload.rateId || payload.packageId || "").trim();
    const matchedPackage = listing.packages?.find((pkg) => pkg.id === packageId);
    const packageName =
      String(payload.rateLabel || payload.packageName || "").trim() ||
      matchedPackage?.name ||
      "Billboard package";
    const durationLabel =
      String(payload.rateLabel || payload.durationLabel || "").trim() || null;
    const weeks = Number(payload.weeks) || null;
    const startDate = String(payload.startDate || "").trim() || null;
    const endDate = String(payload.endDate || "").trim() || null;
    const contactName = user.name || user.email.split("@")[0] || "Client";
    const ownerNotes = String(listing.agency?.customPackageNotes || "").trim();
    const ownerTerms = String(listing.agency?.customPackageTerms || "").trim();

    const quoteKey = [
      listing.id,
      packageId || packageName,
      startDate || "",
      endDate || "",
      listAmount,
    ].join(":");

    let booking = null;
    const candidates = await db.mediaBooking.findMany({
      where: {
        listingId: listing.id,
        agencyId: listing.agencyId,
        status: "PENDING",
        clientEmail: { equals: user.email, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    booking =
      candidates.find((row) =>
        isBillboardMarketplaceBookingForQuote(row, quoteKey)
      ) || null;

    const notes = JSON.stringify({
      source: "billboard_marketplace_quote",
      quoteKey,
      listingId: listing.id,
      packageId: packageId || null,
      packageName,
      durationLabel,
      weeks,
      startDate,
      endDate,
      listTotal: listAmount,
      location: listing.location,
      ownerNotes: ownerNotes || null,
      ownerTerms: ownerTerms || null,
    });

    if (booking) {
      booking = await db.mediaBooking.update({
        where: { id: booking.id },
        data: {
          clientName: contactName,
          packageName,
          packagePrice: matchedPackage?.price || listAmount,
          duration: durationLabel,
          slots: weeks || 1,
          totalAmount: listAmount,
          notes,
        },
      });
    } else {
      booking = await db.mediaBooking.create({
        data: {
          listingId: listing.id,
          agencyId: listing.agencyId,
          clientName: contactName,
          clientEmail: user.email,
          packageName,
          packagePrice: matchedPackage?.price || listAmount,
          duration: durationLabel,
          slots: weeks || 1,
          totalAmount: listAmount,
          status: "PENDING",
          notes,
        },
      });
    }

    const ensured = await ensureMediaNegotiation("MEDIA_BOOKING", booking.id);
    const negotiation = ensured?.negotiation;
    if (!negotiation?.id) {
      return { success: false, error: "Could not open negotiation" };
    }

    if (ensured.created) {
      const dateRange =
        startDate && endDate ? `${startDate} – ${endDate}` : null;
      const opener = [
        `Billboard negotiation for ${listing.name}.`,
        listing.location ? `Location: ${listing.location}.` : null,
        `Package: ${packageName}.`,
        dateRange ? `Dates: ${dateRange}.` : null,
        `List total: ${money(listAmount)}.`,
        ownerNotes ? `Owner notes: ${ownerNotes}` : null,
        ownerTerms ? `Terms: ${ownerTerms}` : null,
        "Can we discuss rate or dates for a confirmed booking?",
      ]
        .filter(Boolean)
        .join(" ");

      await db.mediaNegotiationMessage.create({
        data: {
          negotiationId: negotiation.id,
          senderRole: "CLIENT",
          senderUserId: user.id,
          type: "TEXT",
          body: opener.slice(0, 2000),
        },
      });
      await db.mediaNegotiation.update({
        where: { id: negotiation.id },
        data: { updatedAt: new Date() },
      });
    }

    revalidatePath("/messages");
    revalidatePath("/products");
    revalidatePath("/client/media");

    return {
      success: true,
      bookingId: booking.id,
      negotiationId: negotiation.id,
      href: `/messages/media/${negotiation.id}?from=billboard`,
    };
  } catch (error) {
    console.error("startBillboardMarketplaceNegotiation failed:", error);
    const message = error?.message || "Could not start negotiation";
    if (/unauthorized|sign in/i.test(message)) {
      return { success: false, error: "Unauthorized" };
    }
    return {
      success: false,
      error: "Could not start negotiation. Please try again.",
    };
  }
}
