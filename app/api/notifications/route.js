import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/getAuthUserId";
import { db } from "@/lib/prisma";
import { shapeNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const auth = await getAuthUserId();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const countOnly = searchParams.get("countOnly") === "1";
    const take = Math.min(
      Math.max(Number(searchParams.get("limit")) || 30, 1),
      50
    );

    if (countOnly) {
      const unreadCount = await db.notification.count({
        where: { userId: auth.userId, readAt: null },
      });
      return NextResponse.json({ unreadCount });
    }

    const [rows, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: "desc" },
        take,
      }),
      db.notification.count({
        where: { userId: auth.userId, readAt: null },
      }),
    ]);

    return NextResponse.json({
      notifications: rows.map(shapeNotification),
      unreadCount,
    });
  } catch (error) {
    console.error("GET /api/notifications failed:", error);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}
