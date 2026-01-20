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
    const { mediaAgencyId, listingType, name, network, location, frequency, description, reach, priceRange, timeSlots, demographics, status } = body;

    if (!mediaAgencyId || !listingType || !name || !location) {
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

    const listing = await db.mediaListing.create({
      data: {
        agencyId: mediaAgencyId,
        listingType,
        name,
        network,
        location,
        frequency,
        description,
        reach,
        priceRange,
        timeSlots: timeSlots || [],
        demographics: demographics || [],
        status: status || "DRAFT",
      },
    });

    return NextResponse.json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error("Error creating media listing:", error);
    return NextResponse.json(
      { error: "Failed to create media listing" },
      { status: 500 }
    );
  }
}
