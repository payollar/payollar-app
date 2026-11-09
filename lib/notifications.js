import { db } from "@/lib/prisma";

export const NOTIFICATION_TYPES = {
  BOOKING_MESSAGE: "BOOKING_MESSAGE",
  BOOKING_STARTED: "BOOKING_STARTED",
  BOOKING_INVOICE: "BOOKING_INVOICE",
  BOOKING_PAYMENT: "BOOKING_PAYMENT",
  BOOKING_BRIEF: "BOOKING_BRIEF",
  DELIVERY_SUBMITTED: "DELIVERY_SUBMITTED",
  DELIVERY_REVIEWED: "DELIVERY_REVIEWED",
  DELIVERY_TARGETS: "DELIVERY_TARGETS",
  LOGISTICS_KIT: "LOGISTICS_KIT",
  LOGISTICS_DISPATCHED: "LOGISTICS_DISPATCHED",
  LOGISTICS_RECEIVED: "LOGISTICS_RECEIVED",
  LOGISTICS_PROBLEM: "LOGISTICS_PROBLEM",
  LOGISTICS_RETURN: "LOGISTICS_RETURN",
  CAMPAIGN_APPLICATION: "CAMPAIGN_APPLICATION",
  APPLICATION_STATUS: "APPLICATION_STATUS",
  DISPUTE_FILED: "DISPUTE_FILED",
  DISPUTE_UPDATED: "DISPUTE_UPDATED",
  VERIFICATION_STATUS: "VERIFICATION_STATUS",
  PRODUCT_SALE: "PRODUCT_SALE",
  MEDIA_MESSAGE: "MEDIA_MESSAGE",
  MEDIA_STATUS: "MEDIA_STATUS",
};

/**
 * Create an in-app notification. Never throws to callers — event flows stay intact.
 * Pass actorId to avoid notifying the person who triggered the event.
 */
export async function notifyUser({
  userId,
  type,
  title,
  body = null,
  href = null,
  meta = null,
  actorId = null,
}) {
  try {
    if (!userId || !type || !title) return null;
    if (actorId && actorId === userId) return null;
    return await db.notification.create({
      data: {
        userId,
        type: String(type).slice(0, 64),
        title: String(title).trim().slice(0, 160),
        body: body ? String(body).trim().slice(0, 500) : null,
        href: href ? String(href).trim().slice(0, 400) : null,
        meta: meta || undefined,
      },
      select: { id: true },
    });
  } catch (error) {
    console.error("notifyUser failed:", error);
    return null;
  }
}

export async function notifyUsers(userIds, payload) {
  const ids = [...new Set((userIds || []).filter(Boolean))];
  await Promise.all(ids.map((userId) => notifyUser({ ...payload, userId })));
}

export async function notifyAdmins(payload) {
  try {
    const admins = await db.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
      take: 50,
    });
    await notifyUsers(
      admins.map((admin) => admin.id),
      payload
    );
  } catch (error) {
    console.error("notifyAdmins failed:", error);
  }
}

export function disputeHrefForUser(userId, dispute) {
  if (!dispute) return "/client/disputes";
  const isCreatorSide =
    dispute.againstUser?.role === "CREATOR" ||
    dispute.reporter?.role === "CREATOR";
  // Prefer role from included users when available
  const reporterId = dispute.reporterId || dispute.reporter?.id;
  const againstId = dispute.againstUserId || dispute.againstUser?.id;
  const creatorId =
    dispute.reporter?.role === "CREATOR"
      ? reporterId
      : dispute.againstUser?.role === "CREATOR"
        ? againstId
        : null;
  if (creatorId && userId === creatorId) {
    return `/creator/disputes/${dispute.id}`;
  }
  if (isCreatorSide && userId === againstId && dispute.againstUser?.role === "CREATOR") {
    return `/creator/disputes/${dispute.id}`;
  }
  if (userId === againstId || userId === reporterId) {
    // Fall back: if we know creator vs client from role fields
    const me =
      userId === reporterId ? dispute.reporter : dispute.againstUser;
    if (me?.role === "CREATOR") return `/creator/disputes/${dispute.id}`;
    return `/client/disputes/${dispute.id}`;
  }
  return `/client/disputes/${dispute.id}`;
}

export function shapeNotification(row) {
  if (!row) return null;
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body || "",
    href: row.href || null,
    meta: row.meta || null,
    readAt: row.readAt?.toISOString?.() || null,
    createdAt: row.createdAt.toISOString(),
  };
}
