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
    const { mediaAgencyId, title, reportType, startDate, endDate, content } = body;

    if (!mediaAgencyId || !title || !reportType || !startDate || !endDate) {
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

    const report = await db.mediaAgencyReport.create({
      data: {
        agencyId: mediaAgencyId,
        title,
        reportType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        content,
      },
    });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
