import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

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
    const { title, sortOrder } = body;

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

    return NextResponse.json({ success: true, section }, { status: 201 });
  } catch (error) {
    console.error("Error creating section:", error);
    return NextResponse.json(
      { error: "Failed to create section", details: error.message },
      { status: 500 }
    );
  }
}
