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
    const { 
      mediaAgencyId, 
      campaignRefId, 
      fileUrl, 
      fileName, 
      fileType, 
      fileSize, 
      airDate, 
      airTime, 
      stationName, 
      notes,
      bookingId,
      bookingType 
    } = body;

    if (!mediaAgencyId || !campaignRefId || !fileUrl || !airDate) {
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

    // Create transmission certificate
    const certificate = await db.transmissionCertificate.create({
      data: {
        agencyId: mediaAgencyId,
        bookingId: bookingId || null,
        campaignRefId,
        fileUrl,
        fileName: fileName || "certificate",
        fileType: fileType || "application/pdf",
        fileSize: fileSize || null,
        airDate: new Date(airDate),
        airTime: airTime || null,
        stationName: stationName || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      certificate,
    });
  } catch (error) {
    console.error("Error creating transmission certificate:", error);
    return NextResponse.json(
      { error: "Failed to create transmission certificate" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
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

    const { searchParams } = new URL(req.url);
    const mediaAgencyId = searchParams.get("mediaAgencyId");

    if (!mediaAgencyId) {
      return NextResponse.json(
        { error: "Missing mediaAgencyId" },
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

    // Get transmission certificates
    const certificates = await db.transmissionCertificate.findMany({
      where: { agencyId: mediaAgencyId },
      orderBy: { airDate: "desc" },
    });

    return NextResponse.json({
      success: true,
      certificates,
    });
  } catch (error) {
    console.error("Error fetching transmission certificates:", error);
    return NextResponse.json(
      { error: "Failed to fetch transmission certificates" },
      { status: 500 }
    );
  }
}
