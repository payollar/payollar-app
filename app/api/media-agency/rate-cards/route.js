import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

/**
 * GET /api/media-agency/rate-cards
 * Get all rate cards for the authenticated media agency
 */
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

    const rateCards = await db.rateCard.findMany({
      where: { agencyId: mediaAgency.id },
      include: {
        sections: {
          include: {
            tables: {
              include: {
                columns: {
                  orderBy: { displayOrder: "asc" },
                },
                rows: {
                  include: {
                    cells: {
                      include: {
                        column: true,
                      },
                    },
                  },
                  orderBy: { sortOrder: "asc" },
                },
              },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, rateCards });
  } catch (error) {
    console.error("Error fetching rate cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch rate cards", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/media-agency/rate-cards
 * Create a new rate card
 */
export async function POST(request) {
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

    const body = await request.json();
    const { 
      title, 
      description, 
      isPublished = false,
      listingId,
      listingType,
      location,
      imageUrl
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // If listingId is provided, verify it belongs to the agency
    if (listingId) {
      const listing = await db.mediaListing.findFirst({
        where: {
          id: listingId,
          agencyId: mediaAgency.id,
        },
      });
      
      if (!listing) {
        return NextResponse.json({ error: "Media listing not found or doesn't belong to your agency" }, { status: 404 });
      }
      
      // Use listing's type and location if not provided
      const finalListingType = listingType || listing.listingType;
      const finalLocation = location || listing.location;
      const finalImageUrl = imageUrl || listing.imageUrl;
      
      const rateCard = await db.rateCard.create({
        data: {
          agencyId: mediaAgency.id,
          title,
          description,
          isPublished,
          listingId,
          listingType: finalListingType,
          location: finalLocation,
          imageUrl: finalImageUrl,
        },
        include: {
          sections: true,
        },
      });
      
      return NextResponse.json({ success: true, rateCard }, { status: 201 });
    }

    // Create rate card without listing link
    const rateCard = await db.rateCard.create({
      data: {
        agencyId: mediaAgency.id,
        title,
        description,
        isPublished,
        listingType: listingType || null,
        location: location || null,
        imageUrl: imageUrl || null,
      },
      include: {
        sections: true,
      },
    });

    return NextResponse.json({ success: true, rateCard }, { status: 201 });
  } catch (error) {
    console.error("Error creating rate card:", error);
    return NextResponse.json(
      { error: "Failed to create rate card", details: error.message },
      { status: 500 }
    );
  }
}
