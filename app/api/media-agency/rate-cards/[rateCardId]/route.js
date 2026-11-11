import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

/**
 * GET /api/media-agency/rate-cards/[rateCardId]
 * Get a specific rate card with all its data
 */
export async function GET(request, { params }) {
  try {
    const { rateCardId } = await params;
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

    const rateCard = await db.rateCard.findFirst({
      where: {
        id: rateCardId,
        agencyId: mediaAgency.id,
      },
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
    });

    if (!rateCard) {
      return NextResponse.json({ error: "Rate card not found" }, { status: 404 });
    }

    let listing = null;
    if (rateCard.listingId) {
      listing = await db.mediaListing.findFirst({
        where: { id: rateCard.listingId, agencyId: mediaAgency.id },
        select: {
          id: true,
          name: true,
          listingType: true,
          location: true,
          status: true,
          imageUrl: true,
          reach: true,
          frequency: true,
          demographics: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      rateCard: { ...rateCard, listing },
    });
  } catch (error) {
    console.error("Error fetching rate card:", error);
    return NextResponse.json(
      { error: "Failed to fetch rate card", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/media-agency/rate-cards/[rateCardId]
 * Update a rate card
 */
export async function PATCH(request, { params }) {
  try {
    const { rateCardId } = await params;
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

    const rateCard = await db.rateCard.findFirst({
      where: {
        id: rateCardId,
        agencyId: mediaAgency.id,
      },
    });

    if (!rateCard) {
      return NextResponse.json({ error: "Rate card not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      isPublished,
      location,
      reach,
      demographics,
      listingId,
      listingType,
      imageUrl,
    } = body;

    const data = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(isPublished !== undefined && { isPublished }),
      ...(location !== undefined && { location }),
      ...(reach !== undefined && { reach }),
      ...(demographics !== undefined &&
        Array.isArray(demographics) && { demographics }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(listingType !== undefined && { listingType }),
    };

    let listing = null;
    if (listingId !== undefined) {
      if (listingId === null || listingId === "") {
        data.listingId = null;
      } else {
        listing = await db.mediaListing.findFirst({
          where: { id: listingId, agencyId: mediaAgency.id },
          select: {
            id: true,
            name: true,
            listingType: true,
            location: true,
            status: true,
            imageUrl: true,
            reach: true,
            frequency: true,
            demographics: true,
          },
        });
        if (!listing) {
          return NextResponse.json(
            { error: "Media listing not found or doesn't belong to your agency" },
            { status: 404 }
          );
        }
        data.listingId = listing.id;
        data.listingType = listingType || listing.listingType;
        if (location === undefined) data.location = listing.location;
        if (imageUrl === undefined) data.imageUrl = listing.imageUrl;
        if (reach === undefined && listing.reach) data.reach = listing.reach;
      }
    }

    const updatedRateCard = await db.rateCard.update({
      where: { id: rateCardId },
      data,
    });

    // Publishing should surface the station on Browse (ACTIVE listing)
    const nextListingId = updatedRateCard.listingId || rateCard.listingId;
    if (isPublished === true && nextListingId) {
      await db.mediaListing.updateMany({
        where: {
          id: nextListingId,
          agencyId: mediaAgency.id,
          status: { not: "ACTIVE" },
        },
        data: { status: "ACTIVE" },
      });
    }

    if (!listing && updatedRateCard.listingId) {
      listing = await db.mediaListing.findFirst({
        where: { id: updatedRateCard.listingId, agencyId: mediaAgency.id },
        select: {
          id: true,
          name: true,
          listingType: true,
          location: true,
          status: true,
          imageUrl: true,
          reach: true,
          frequency: true,
          demographics: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      rateCard: { ...updatedRateCard, listing },
    });
  } catch (error) {
    console.error("Error updating rate card:", error);
    return NextResponse.json(
      { error: "Failed to update rate card", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/media-agency/rate-cards/[rateCardId]
 * Delete a rate card
 */
export async function DELETE(request, { params }) {
  try {
    const { rateCardId } = await params;
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

    const rateCard = await db.rateCard.findFirst({
      where: {
        id: rateCardId,
        agencyId: mediaAgency.id,
      },
    });

    if (!rateCard) {
      return NextResponse.json({ error: "Rate card not found" }, { status: 404 });
    }

    await db.rateCard.delete({
      where: { id: rateCardId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting rate card:", error);
    return NextResponse.json(
      { error: "Failed to delete rate card", details: error.message },
      { status: 500 }
    );
  }
}
