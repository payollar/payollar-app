import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

/**
 * PATCH /api/media-agency/rate-cards/tables/rows/[rowId]
 * Update a single row
 */
export async function PATCH(request, { params }) {
  try {
    const { rowId } = await params;
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

    // Verify row belongs to agency's rate card
    const row = await db.smartTableRow.findFirst({
      where: {
        id: rowId,
        table: {
          section: {
            rateCard: {
              agencyId: mediaAgency.id,
            },
          },
        },
      },
    });

    if (!row) {
      return NextResponse.json({ error: "Row not found" }, { status: 404 });
    }

    const body = await request.json();
    const { isBookable, sortOrder } = body;

    const updateData = {};
    if (isBookable !== undefined) updateData.isBookable = Boolean(isBookable);
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);

    const updatedRow = await db.smartTableRow.update({
      where: { id: rowId },
      data: updateData,
    });

    return NextResponse.json({ success: true, row: updatedRow });
  } catch (error) {
    console.error("Error updating row:", error);
    return NextResponse.json(
      { error: "Failed to update row", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/media-agency/rate-cards/tables/rows/[rowId]
 * Delete a row (and all its cells)
 */
export async function DELETE(request, { params }) {
  try {
    const { rowId } = await params;
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

    // Verify row belongs to agency's rate card
    const row = await db.smartTableRow.findFirst({
      where: {
        id: rowId,
        table: {
          section: {
            rateCard: {
              agencyId: mediaAgency.id,
            },
          },
        },
      },
    });

    if (!row) {
      return NextResponse.json({ error: "Row not found" }, { status: 404 });
    }

    // Check if row has any bookings (should not delete if it does)
    const bookings = await db.rateCardBookingItem.findMany({
      where: { rowId: rowId },
    });

    if (bookings.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete row with existing bookings", bookingsCount: bookings.length },
        { status: 400 }
      );
    }

    // Delete row (cells will be cascade deleted)
    await db.smartTableRow.delete({
      where: { id: rowId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting row:", error);
    return NextResponse.json(
      { error: "Failed to delete row", details: error.message },
      { status: 500 }
    );
  }
}
