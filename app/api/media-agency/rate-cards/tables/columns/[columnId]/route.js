import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

/**
 * PATCH /api/media-agency/rate-cards/tables/columns/[columnId]
 * Update a single column
 */
export async function PATCH(request, { params }) {
  try {
    const { columnId } = await params;
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

    // Verify column belongs to agency's rate card
    const column = await db.smartTableColumn.findFirst({
      where: {
        id: columnId,
        table: {
          section: {
            rateCard: {
              agencyId: mediaAgency.id,
            },
          },
        },
      },
    });

    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      dataType,
      displayOrder,
      isVisibleOnFrontend,
      isRequiredForBooking,
      config,
    } = body;

    const updateData = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (dataType !== undefined) updateData.dataType = dataType;
    if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder);
    if (isVisibleOnFrontend !== undefined) updateData.isVisibleOnFrontend = Boolean(isVisibleOnFrontend);
    if (isRequiredForBooking !== undefined) updateData.isRequiredForBooking = Boolean(isRequiredForBooking);
    if (config !== undefined) updateData.config = config;

    const updatedColumn = await db.smartTableColumn.update({
      where: { id: columnId },
      data: updateData,
    });

    return NextResponse.json({ success: true, column: updatedColumn });
  } catch (error) {
    console.error("Error updating column:", error);
    return NextResponse.json(
      { error: "Failed to update column", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/media-agency/rate-cards/tables/columns/[columnId]
 * Delete a column (and all its cells)
 */
export async function DELETE(request, { params }) {
  try {
    const { columnId } = await params;
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

    // Verify column belongs to agency's rate card
    const column = await db.smartTableColumn.findFirst({
      where: {
        id: columnId,
        table: {
          section: {
            rateCard: {
              agencyId: mediaAgency.id,
            },
          },
        },
      },
    });

    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    // Delete column (cells will be cascade deleted)
    await db.smartTableColumn.delete({
      where: { id: columnId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting column:", error);
    return NextResponse.json(
      { error: "Failed to delete column", details: error.message },
      { status: 500 }
    );
  }
}
