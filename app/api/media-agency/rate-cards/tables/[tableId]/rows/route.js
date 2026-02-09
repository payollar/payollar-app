import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

/**
 * POST /api/media-agency/rate-cards/tables/[tableId]/rows
 * Create a new row in a table
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
    const { isBookable = true, sortOrder, cells } = body;

    // Get max sortOrder if not provided
    let finalSortOrder = sortOrder;
    if (finalSortOrder === undefined) {
      const maxRow = await db.smartTableRow.findFirst({
        where: { tableId: tableId },
        orderBy: { sortOrder: "desc" },
      });
      finalSortOrder = maxRow ? maxRow.sortOrder + 1 : 0;
    }

    // Create row
    const row = await db.smartTableRow.create({
      data: {
        tableId: tableId,
        isBookable,
        sortOrder: finalSortOrder,
        cells: cells
          ? {
              create: cells.map((cell) => ({
                columnId: cell.columnId,
                value: cell.value || null,
              })),
            }
          : undefined,
      },
      include: {
        cells: {
          include: {
            column: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, row }, { status: 201 });
  } catch (error) {
    console.error("Error creating row:", error);
    return NextResponse.json(
      { error: "Failed to create row", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/media-agency/rate-cards/tables/[tableId]/rows
 * Update multiple rows (for reordering or bulk updates)
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
    const { rows } = body; // Array of { id, sortOrder, isBookable, ... }

    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: "Rows array is required" }, { status: 400 });
    }

    // Update each row
    const updatedRows = await Promise.all(
      rows.map((rowData) =>
        db.smartTableRow.update({
          where: { id: rowData.id },
          data: {
            ...(rowData.sortOrder !== undefined && { sortOrder: rowData.sortOrder }),
            ...(rowData.isBookable !== undefined && { isBookable: rowData.isBookable }),
          },
        })
      )
    );

    return NextResponse.json({ success: true, rows: updatedRows });
  } catch (error) {
    console.error("Error updating rows:", error);
    return NextResponse.json(
      { error: "Failed to update rows", details: error.message },
      { status: 500 }
    );
  }
}
