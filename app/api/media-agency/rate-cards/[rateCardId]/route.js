import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

/**
 * GET /api/media-agency/rate-cards/[rateCardId]
 * Get a specific rate card with all its data
 */
export async function GET(request, { params }) {
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
      include: {
        sections: {
          include: {
            tables: {
              include: {
                columns: {
                  orderBy: { displayOrder: "asc" },
                },
                rows: {
                  include: {
                    cells: {
                      include: {
                        column: true,
                      },
                    },
                  },
                  orderBy: { sortOrder: "asc" },
                },
              },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!rateCard) {
      return NextResponse.json({ error: "Rate card not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, rateCard });
  } catch (error) {
    console.error("Error fetching rate card:", error);
    return NextResponse.json(
      { error: "Failed to fetch rate card", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/media-agency/rate-cards/[rateCardId]
 * Update a rate card
 */
export async function PATCH(request, { params }) {
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
    const { title, description, isPublished } = body;

    const updatedRateCard = await db.rateCard.update({
      where: { id: rateCardId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    return NextResponse.json({ success: true, rateCard: updatedRateCard });
  } catch (error) {
    console.error("Error updating rate card:", error);
    return NextResponse.json(
      { error: "Failed to update rate card", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/media-agency/rate-cards/[rateCardId]
 * Delete a rate card
 */
export async function DELETE(request, { params }) {
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

    await db.rateCard.delete({
      where: { id: rateCardId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting rate card:", error);
    return NextResponse.json(
      { error: "Failed to delete rate card", details: error.message },
      { status: 500 }
    );
  }
}
