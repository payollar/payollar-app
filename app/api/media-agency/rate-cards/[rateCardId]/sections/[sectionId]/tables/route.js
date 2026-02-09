import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

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
    const { title, sortOrder } = body;

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

    return NextResponse.json({ success: true, table }, { status: 201 });
  } catch (error) {
    console.error("Error creating table:", error);
    return NextResponse.json(
      { error: "Failed to create table", details: error.message },
      { status: 500 }
    );
  }
}
