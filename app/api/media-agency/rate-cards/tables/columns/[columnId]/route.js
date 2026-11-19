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
      optionRenames,
    } = body;

    const updateData = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (dataType !== undefined) updateData.dataType = dataType;
    if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder);
    if (isVisibleOnFrontend !== undefined) updateData.isVisibleOnFrontend = Boolean(isVisibleOnFrontend);
    if (isRequiredForBooking !== undefined) updateData.isRequiredForBooking = Boolean(isRequiredForBooking);

    // Merge config so role (time_class / day_band / etc.) is never wiped by options edits
    if (config !== undefined) {
      const prev =
        column.config && typeof column.config === "object" && !Array.isArray(column.config)
          ? column.config
          : {};
      if (config === null) {
        updateData.config = null;
      } else if (typeof config === "object" && !Array.isArray(config)) {
        updateData.config = { ...prev, ...config };
      } else {
        updateData.config = config;
      }
    }

    const renames = Array.isArray(optionRenames)
      ? optionRenames
          .map((r) => ({
            from: String(r?.from ?? "").trim(),
            to: String(r?.to ?? "").trim(),
          }))
          .filter((r) => r.from && r.to && r.from !== r.to)
      : [];

    // Reject colliding renames (two sources → same target, or target already another option)
    if (renames.length > 0) {
      const targets = new Set();
      for (const r of renames) {
        if (targets.has(r.to)) {
          return NextResponse.json(
            { error: `Duplicate rename target "${r.to}"` },
            { status: 400 }
          );
        }
        targets.add(r.to);
      }
    }

    const updatedColumn = await db.$transaction(async (tx) => {
      const col = await tx.smartTableColumn.update({
        where: { id: columnId },
        data: updateData,
      });

      // Cascade dropdown label renames into cell values so public rate card stays in sync
      for (const { from, to } of renames) {
        await tx.smartTableCell.updateMany({
          where: {
            columnId,
            value: from,
          },
          data: { value: to },
        });
      }

      return col;
    });

    return NextResponse.json({
      success: true,
      column: updatedColumn,
      renamed: renames.length,
    });
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
