import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

/**
 * GET /api/rate-cards/[rateCardId]
 * Get a published rate card (public endpoint)
 */
export async function GET(request, { params }) {
  try {
    const { rateCardId } = await params;
    const rateCard = await db.rateCard.findUnique({
      where: {
        id: rateCardId,
        isPublished: true,
      },
      include: {
        agency: {
          select: {
            id: true,
            agencyName: true,
            logoUrl: true,
          },
        },
        sections: {
          include: {
            tables: {
              include: {
                columns: {
                  where: { isVisibleOnFrontend: true },
                  orderBy: { displayOrder: "asc" },
                },
                rows: {
                  where: { isBookable: true },
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
