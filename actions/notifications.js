"use server";

import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";
import { shapeNotification } from "@/lib/notifications";

async function requireUserId() {
  const auth = await getAuthUserId();
  if (!auth?.userId) throw new Error("Unauthorized");
  return auth.userId;
}

export async function getNotifications({ limit = 30 } = {}) {
  const userId = await requireUserId();
  const take = Math.min(Math.max(Number(limit) || 30, 1), 50);

  const [rows, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
    }),
    db.notification.count({
      where: { userId, readAt: null },
    }),
  ]);

  return {
    notifications: rows.map(shapeNotification),
    unreadCount,
  };
}

export async function getUnreadNotificationCount() {
  const userId = await requireUserId();
  const unreadCount = await db.notification.count({
    where: { userId, readAt: null },
  });
  return { unreadCount };
}

export async function markNotificationRead(notificationId) {
  const userId = await requireUserId();
  if (!notificationId) return { success: false };

  await db.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date() },
  });

  return { success: true };
}

export async function markAllNotificationsRead() {
  const userId = await requireUserId();
  await db.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  return { success: true };
}
