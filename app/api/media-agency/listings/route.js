import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkUser } from "@/lib/checkUser";
import {
  agencyAllowsListingType,
  effectiveAgencyMediaType,
  isMediaAgencyAdminEmail,
} from "@/lib/media-agency-type";

export async function GET(request) {
  try {
    const user = await checkUser();
    if (!user || user.role !== "MEDIA_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mediaAgency = await db.mediaAgency.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        agencyName: true,
        email: true,
        primaryMediaType: true,
      },
    });

    if (!mediaAgency) {
      return NextResponse.json({ error: "Media agency not found" }, { status: 404 });
    }

    const isMediaAdmin =
      isMediaAgencyAdminEmail(user.email) ||
      isMediaAgencyAdminEmail(mediaAgency.email);
    const scopedMediaType = effectiveAgencyMediaType({
      email: user.email,
      agencyEmail: mediaAgency.email,
      primaryMediaType: mediaAgency.primaryMediaType,
      isMediaAdmin,
    });

    const listings = await db.mediaListing.findMany({
      where: { agencyId: mediaAgency.id },
      orderBy: [
        { listingType: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
      listings,
      agency: {
        id: mediaAgency.id,
        agencyName: mediaAgency.agencyName,
        email: mediaAgency.email,
        primaryMediaType: mediaAgency.primaryMediaType,
        isMediaAdmin,
        scopedMediaType,
      },
    });
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
    const {
      mediaAgencyId,
      listingType,
      name,
      network,
      location,
      latitude,
      longitude,
      frequency,
      description,
      reach,
      priceRange,
      timeSlots,
      demographics,
      status,
      imageUrl,
    } = body;

    const lat =
      latitude === null || latitude === undefined || latitude === ""
        ? null
        : Number(latitude);
    const lng =
      longitude === null || longitude === undefined || longitude === ""
        ? null
        : Number(longitude);
    const hasCoords =
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180;

    if (!listingType || !name || !location) {
      return NextResponse.json(
        { error: "Media type, name, and location are required" },
        { status: 400 }
      );
    }

    // Resolve agency from body or from the signed-in user
    let mediaAgency = null;
    if (mediaAgencyId) {
      mediaAgency = await db.mediaAgency.findUnique({
        where: { id: mediaAgencyId },
      });
      if (!mediaAgency || mediaAgency.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else {
      mediaAgency = await db.mediaAgency.findUnique({
        where: { userId: session.user.id },
      });
      if (!mediaAgency) {
        return NextResponse.json(
          { error: "Media agency not found" },
          { status: 404 }
        );
      }
    }

    if (
      !agencyAllowsListingType(mediaAgency.primaryMediaType, listingType, {
        email: session.user.email,
        agencyEmail: mediaAgency.email,
      })
    ) {
      return NextResponse.json(
        {
          error: `This agency is set up for ${String(
            mediaAgency.primaryMediaType
          ).replaceAll("_", " ")} only`,
        },
        { status: 400 }
      );
    }

    const listing = await db.mediaListing.create({
      data: {
        agencyId: mediaAgency.id,
        listingType,
        name,
        network,
        location,
        latitude: hasCoords ? lat : null,
        longitude: hasCoords ? lng : null,
        frequency,
        description,
        reach,
        priceRange,
        timeSlots: timeSlots || [],
        demographics: demographics || [],
        imageUrl: imageUrl || null,
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
