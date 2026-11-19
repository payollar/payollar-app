import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import {
  simplifyTableTimeClassSegments,
  tableHasLegacyTimeClassSeed,
} from "@/lib/rate-card-simplify-segments";

/**
 * POST /api/media-agency/rate-cards/tables/[tableId]/simplify-segments
 * Collapse legacy Premium/M1–M4 seed to a Prime starter.
 */
export async function POST(_request, { params }) {
  try {
    const { tableId } = await params;
    const user = await checkUser();
    if (!user || user.role !== "MEDIA_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mediaAgency = await db.mediaAgency.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!mediaAgency) {
      return NextResponse.json(
        { error: "Media agency not found" },
        { status: 404 }
      );
    }

    const table = await db.smartTable.findFirst({
      where: {
        id: tableId,
        section: { rateCard: { agencyId: mediaAgency.id } },
      },
      include: {
        columns: true,
        rows: { include: { cells: true } },
      },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    if (!tableHasLegacyTimeClassSeed(table)) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: "Table already uses a simple segment list",
      });
    }

    const result = await simplifyTableTimeClassSegments(db, tableId);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to simplify" },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("simplify-segments error:", error);
    return NextResponse.json(
      { error: "Failed to simplify segments", details: error.message },
      { status: 500 }
    );
  }
}
