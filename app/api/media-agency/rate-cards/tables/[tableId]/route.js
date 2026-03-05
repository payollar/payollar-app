import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

/**
 * DELETE /api/media-agency/rate-cards/tables/[tableId]
 * Delete a table and all its columns, rows, and cells (cascade)
 */
export async function DELETE(request, { params }) {
  try {
    const { tableId } = await params;
    const user = await checkUser();
    if (!user || user.role !== "MEDIA_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mediaAgency = await db.mediaAgency.findUnique({
      where: { userId: user.id },
    });

    if (!mediaAgency) {
      return NextResponse.json({ error: "Media agency not found" }, { status: 404 });
    }

    const table = await db.smartTable.findFirst({
      where: {
        id: tableId,
        section: {
          rateCard: {
            agencyId: mediaAgency.id,
          },
        },
      },
      include: {
        rows: {
          include: {
            _count: {
              select: { bookingItems: true },
            },
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const hasBookings = table.rows.some((r) => r._count.bookingItems > 0);
    if (hasBookings) {
      return NextResponse.json(
        { error: "Cannot delete table: some rows have bookings" },
        { status: 400 }
      );
    }

    await db.smartTable.delete({
      where: { id: tableId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting table:", error);
    return NextResponse.json(
      { error: "Failed to delete table", details: error.message },
      { status: 500 }
    );
  }
}
