import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

/**
 * POST /api/media-agency/rate-cards/tables/[tableId]/columns
 * Create a new column in a table
 */
export async function POST(request, { params }) {
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

    // Verify table belongs to agency's rate card
    const table = await db.smartTable.findFirst({
      where: {
        id: tableId,
        section: {
          rateCard: {
            agencyId: mediaAgency.id,
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      dataType,
      displayOrder,
      isVisibleOnFrontend = true,
      isRequiredForBooking = false,
      config,
    } = body;

    if (!name || !dataType) {
      return NextResponse.json(
        { error: "Name and dataType are required" },
        { status: 400 }
      );
    }

    // Get max displayOrder if not provided
    let finalDisplayOrder = displayOrder;
    if (finalDisplayOrder === undefined) {
      const maxColumn = await db.smartTableColumn.findFirst({
        where: { tableId: tableId },
        orderBy: { displayOrder: "desc" },
      });
      finalDisplayOrder = maxColumn ? maxColumn.displayOrder + 1 : 0;
    }

    const column = await db.smartTableColumn.create({
      data: {
        tableId: tableId,
        name,
        dataType,
        displayOrder: finalDisplayOrder,
        isVisibleOnFrontend,
        isRequiredForBooking,
        config: config || null,
      },
    });

    return NextResponse.json({ success: true, column }, { status: 201 });
  } catch (error) {
    console.error("Error creating column:", error);
    return NextResponse.json(
      { error: "Failed to create column", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/media-agency/rate-cards/tables/[tableId]/columns
 * Update multiple columns (for reordering)
 */
export async function PATCH(request, { params }) {
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
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const body = await request.json();
    const { columns } = body; // Array of { id, displayOrder, ...otherFields }

    if (!Array.isArray(columns)) {
      return NextResponse.json({ error: "Columns array is required" }, { status: 400 });
    }

    // Update each column
    const updatedColumns = await Promise.all(
      columns.map((col) =>
        db.smartTableColumn.update({
          where: { id: col.id },
          data: {
            displayOrder: col.displayOrder,
            ...(col.name !== undefined && { name: col.name }),
            ...(col.dataType !== undefined && { dataType: col.dataType }),
            ...(col.isVisibleOnFrontend !== undefined && {
              isVisibleOnFrontend: col.isVisibleOnFrontend,
            }),
            ...(col.isRequiredForBooking !== undefined && {
              isRequiredForBooking: col.isRequiredForBooking,
            }),
            ...(col.config !== undefined && { config: col.config }),
          },
        })
      )
    );

    return NextResponse.json({ success: true, columns: updatedColumns });
  } catch (error) {
    console.error("Error updating columns:", error);
    return NextResponse.json(
      { error: "Failed to update columns", details: error.message },
      { status: 500 }
    );
  }
}
