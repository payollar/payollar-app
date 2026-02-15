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
    const { mediaAgencyId, title, reportType, startDate, endDate, content, bookingId, bookingType } = body;

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

    // If bookingId is provided, validate it exists and belongs to the agency
    if (bookingId && bookingType) {
      if (bookingType === "MEDIA") {
        const booking = await db.mediaBooking.findUnique({
          where: { id: bookingId },
        });
        if (!booking || booking.agencyId !== mediaAgencyId) {
          return NextResponse.json(
            { error: "Booking not found or unauthorized" },
            { status: 404 }
          );
        }
      } else if (bookingType === "RATE_CARD") {
        const booking = await db.rateCardBookingItem.findUnique({
          where: { id: bookingId },
        });
        if (!booking || booking.agencyId !== mediaAgencyId) {
          return NextResponse.json(
            { error: "Booking not found or unauthorized" },
            { status: 404 }
          );
        }
      }
    }

    const report = await db.mediaAgencyReport.create({
      data: {
        agencyId: mediaAgencyId,
        bookingId: bookingId || null,
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
