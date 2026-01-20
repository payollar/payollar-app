import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req) {
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
    const { mediaAgencyId, title, content, version } = body;

    if (!mediaAgencyId || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the media agency belongs to the user
    const mediaAgency = await db.mediaAgency.findUnique({
      where: { id: mediaAgencyId },
    });

    if (!mediaAgency || mediaAgency.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Deactivate all existing TCs
    await db.mediaAgencyTC.updateMany({
      where: {
        agencyId: mediaAgencyId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Create new TC
    const termsAndConditions = await db.mediaAgencyTC.create({
      data: {
        agencyId: mediaAgencyId,
        title,
        content,
        version: version || 1,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      termsAndConditions,
    });
  } catch (error) {
    console.error("Error creating terms and conditions:", error);
    return NextResponse.json(
      { error: "Failed to create terms and conditions" },
      { status: 500 }
    );
  }
}
