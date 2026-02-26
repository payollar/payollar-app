import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { getSmartRateCardTemplate } from "@/lib/rate-card-templates";

/**
 * POST /api/media-agency/rate-cards/[rateCardId]/sections/[sectionId]/tables
 * Create a new table in a section
 */
export async function POST(request, { params }) {
  try {
    const { sectionId, rateCardId } = await params;
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

    // Verify section belongs to agency's rate card
    const section = await db.rateCardSection.findFirst({
      where: {
        id: sectionId,
        rateCard: {
          id: rateCardId,
          agencyId: mediaAgency.id,
        },
      },
    });

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, sortOrder, templateKey } = body;

    // Get max sortOrder if not provided
    let finalSortOrder = sortOrder;
    if (finalSortOrder === undefined) {
      const maxTable = await db.smartTable.findFirst({
        where: { sectionId: sectionId },
        orderBy: { sortOrder: "desc" },
      });
      finalSortOrder = maxTable ? maxTable.sortOrder + 1 : 0;
    }

    const table = await db.smartTable.create({
      data: {
        sectionId: sectionId,
        title: title || null,
        sortOrder: finalSortOrder,
      },
    });
    
    // If a templateKey is provided, seed the table with predefined columns and rows
    if (templateKey) {
      const template = getSmartRateCardTemplate(templateKey);

      if (template) {
        // Create columns based on template definition
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

        // Create rows and their cells
        for (let rowIndex = 0; rowIndex < template.rows.length; rowIndex++) {
          const rowDef = template.rows[rowIndex];

          const createdRow = await db.smartTableRow.create({
            data: {
              tableId: table.id,
              isBookable: true,
              sortOrder: rowIndex,
            },
          });

          // Create a cell for each column, using rowDef values when provided
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

    return NextResponse.json({ success: true, table }, { status: 201 });
  } catch (error) {
    console.error("Error creating table:", error);
    return NextResponse.json(
      { error: "Failed to create table", details: error.message },
      { status: 500 }
    );
  }
}
