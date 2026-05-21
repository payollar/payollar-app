"use server";

import { db } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/getAuthUserId";

/**
 * Record a public talent profile view (skips when the creator views their own profile).
 */
export async function recordCreatorProfileView(creatorId) {
  if (!creatorId) return;

  try {
    const auth = await getAuthUserId();
    if (auth?.userId === creatorId) return;

    const creator = await db.user.findFirst({
      where: { id: creatorId, role: "CREATOR" },
      select: { id: true },
    });
    if (!creator) return;

    await db.profileView.create({
      data: { creatorId },
    });
  } catch (error) {
    console.error("Failed to record profile view:", error);
  }
}

/**
 * Aggregate profile view counts for a creator (total + month-over-month).
 */
export async function getCreatorProfileViewStats(creatorId) {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const [total, thisMonth, lastMonthCount] = await Promise.all([
    db.profileView.count({ where: { creatorId } }),
    db.profileView.count({
      where: { creatorId, createdAt: { gte: currentMonth } },
    }),
    db.profileView.count({
      where: {
        creatorId,
        createdAt: { gte: lastMonth, lte: lastMonthEnd },
      },
    }),
  ]);

  const trend =
    lastMonthCount > 0
      ? ((thisMonth - lastMonthCount) / lastMonthCount) * 100
      : thisMonth > 0
        ? 100
        : 0;

  return { total, thisMonth, lastMonth: lastMonthCount, trend };
}
