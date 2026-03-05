import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

async function verifySectionAccess(sectionId, rateCardId, mediaAgencyId) {
  const section = await db.rateCardSection.findFirst({
    where: {
      id: sectionId,
      rateCard: {
        id: rateCardId,
        agencyId: mediaAgencyId,
      },
    },
  });
  return section;
}

/**
 * PATCH /api/media-agency/rate-cards/[rateCardId]/sections/[sectionId]
 * Update section (e.g. title)
 */
export async function PATCH(request, { params }) {
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

    const section = await verifySectionAccess(sectionId, rateCardId, mediaAgency.id);
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title } = body;

    const updated = await db.rateCardSection.update({
      where: { id: sectionId },
      data: { ...(title !== undefined && { title: title || "" }) },
    });

    return NextResponse.json({ success: true, section: updated });
  } catch (error) {
    console.error("Error updating section:", error);
    return NextResponse.json(
      { error: "Failed to update section", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/media-agency/rate-cards/[rateCardId]/sections/[sectionId]
 * Delete a section and all its tables, rows, columns, and cells (cascade)
 */
export async function DELETE(request, { params }) {
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

    const section = await verifySectionAccess(sectionId, rateCardId, mediaAgency.id);

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    await db.rateCardSection.delete({
      where: { id: sectionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json(
      { error: "Failed to delete section", details: error.message },
      { status: 500 }
    );
  }
}
