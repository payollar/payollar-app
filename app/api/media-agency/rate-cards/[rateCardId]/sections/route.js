import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { getSmartRateCardTemplate } from "@/lib/rate-card-templates";

/**
 * POST /api/media-agency/rate-cards/[rateCardId]/sections
 * Create a new section in a rate card
 */
export async function POST(request, { params }) {
  try {
    const { rateCardId } = await params;
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

    const rateCard = await db.rateCard.findFirst({
      where: {
        id: rateCardId,
        agencyId: mediaAgency.id,
      },
    });

    if (!rateCard) {
      return NextResponse.json({ error: "Rate card not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, sortOrder, templateKey } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get max sortOrder if not provided
    let finalSortOrder = sortOrder;
    if (finalSortOrder === undefined) {
      const maxSection = await db.rateCardSection.findFirst({
        where: { rateCardId: rateCardId },
        orderBy: { sortOrder: "desc" },
      });
      finalSortOrder = maxSection ? maxSection.sortOrder + 1 : 0;
    }

    const section = await db.rateCardSection.create({
      data: {
        rateCardId: rateCardId,
        title,
        sortOrder: finalSortOrder,
      },
    });

    // If templateKey is provided, create a table from the template
    if (templateKey) {
      const template = getSmartRateCardTemplate(templateKey);
      if (template) {
        const table = await db.smartTable.create({
          data: {
            sectionId: section.id,
            title: template.defaultTitle || null,
            sortOrder: 0,
          },
        });

        const columnNameToId = new Map();
        for (let i = 0; i < template.columns.length; i++) {
          const col = template.columns[i];
          const createdColumn = await db.smartTableColumn.create({
            data: {
              tableId: table.id,
              name: col.name,
              dataType: col.dataType,
              displayOrder: i,
              isVisibleOnFrontend:
                typeof col.isVisibleOnFrontend === "boolean"
                  ? col.isVisibleOnFrontend
                  : true,
              isRequiredForBooking:
                typeof col.isRequiredForBooking === "boolean"
                  ? col.isRequiredForBooking
                  : false,
              config: col.config || null,
            },
          });
          columnNameToId.set(createdColumn.name, createdColumn.id);
        }

        for (let rowIndex = 0; rowIndex < template.rows.length; rowIndex++) {
          const rowDef = template.rows[rowIndex];
          const createdRow = await db.smartTableRow.create({
            data: {
              tableId: table.id,
              isBookable: true,
              sortOrder: rowIndex,
            },
          });

          const cellsData = template.columns.map((col) => ({
            rowId: createdRow.id,
            columnId: columnNameToId.get(col.name),
            value:
              rowDef && Object.prototype.hasOwnProperty.call(rowDef, col.name)
                ? String(rowDef[col.name] ?? "")
                : "",
          }));

          if (cellsData.length > 0) {
            await db.smartTableCell.createMany({
              data: cellsData,
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, section }, { status: 201 });
  } catch (error) {
    console.error("Error creating section:", error);
    return NextResponse.json(
      { error: "Failed to create section", details: error.message },
      { status: 500 }
    );
  }
}
