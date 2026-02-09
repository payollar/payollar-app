import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkUser } from "@/lib/checkUser";

export async function GET(request) {
  try {
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

    const listings = await db.mediaListing.findMany({
      where: { agencyId: mediaAgency.id },
      orderBy: [
        { listingType: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ success: true, listings });
  } catch (error) {
    console.error("Error fetching media listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch media listings", details: error.message },
      { status: 500 }
    );
  }
}

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
        status: status || "ACTIVE",
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
