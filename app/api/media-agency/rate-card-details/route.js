import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(req) {
  try {
    const headersList = await headers();
    const session = await betterAuth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      customPackageNotes,
      customPackageTerms,
      rateCardValidFrom,
      rateCardValidTo,
    } = body;

    const mediaAgency = await db.mediaAgency.findFirst({
      where: { userId: session.user.id },
    });

    if (!mediaAgency) {
      return NextResponse.json(
        { error: "Media agency not found" },
        { status: 404 }
      );
    }

    const updateData = {
      rateCardLastUpdated: new Date(),
    };
    if (customPackageNotes !== undefined) updateData.customPackageNotes = customPackageNotes || null;
    if (customPackageTerms !== undefined) updateData.customPackageTerms = customPackageTerms || null;
    if (rateCardValidFrom !== undefined) updateData.rateCardValidFrom = rateCardValidFrom ? new Date(rateCardValidFrom) : null;
    if (rateCardValidTo !== undefined) updateData.rateCardValidTo = rateCardValidTo ? new Date(rateCardValidTo) : null;

    await db.mediaAgency.update({
      where: { id: mediaAgency.id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating rate card details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update rate card details" },
      { status: 500 }
    );
  }
}
