import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

/**
 * PUT /api/media-agency/rate-cards/tables/rows/[rowId]/cells
 * Update or create cells for a row (upsert)
 */
export async function PUT(request, { params }) {
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
    const { cells } = body; // Array of { columnId, value }

    if (!Array.isArray(cells)) {
      return NextResponse.json({ error: "Cells array is required" }, { status: 400 });
    }

    // Upsert each cell
    const updatedCells = await Promise.all(
      cells.map((cell) =>
        db.smartTableCell.upsert({
          where: {
            rowId_columnId: {
              rowId: rowId,
              columnId: cell.columnId,
            },
          },
          create: {
            rowId: rowId,
            columnId: cell.columnId,
            value: cell.value || null,
          },
          update: {
            value: cell.value || null,
          },
          include: {
            column: true,
          },
        })
      )
    );

    return NextResponse.json({ success: true, cells: updatedCells });
  } catch (error) {
    console.error("Error updating cells:", error);
    return NextResponse.json(
      { error: "Failed to update cells", details: error.message },
      { status: 500 }
    );
  }
}
