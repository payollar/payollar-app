import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";

async function getOwnedListing(listingId, userId) {
  const mediaAgency = await db.mediaAgency.findUnique({
    where: { userId },
  });
  if (!mediaAgency) return { error: "Media agency not found", status: 404 };

  const listing = await db.mediaListing.findFirst({
    where: { id: listingId, agencyId: mediaAgency.id },
  });
  if (!listing) return { error: "Listing not found", status: 404 };

  return { mediaAgency, listing };
}

/**
 * PATCH /api/media-agency/listings/[listingId]
 * Update station listing fields (name, location, reach, demographics, etc.)
 */
export async function PATCH(request, { params }) {
  try {
    const { listingId } = await params;
    const user = await checkUser();
    if (!user || user.role !== "MEDIA_AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const owned = await getOwnedListing(listingId, user.id);
    if (owned.error) {
      return NextResponse.json({ error: owned.error }, { status: owned.status });
    }

    const body = await request.json();
    const {
      name,
      location,
      reach,
      demographics,
      description,
      frequency,
      network,
      imageUrl,
      status,
      listingType,
    } = body;

    if (name !== undefined && !String(name).trim()) {
      return NextResponse.json(
        { error: "Station name is required" },
        { status: 400 }
      );
    }
    if (location !== undefined && !String(location).trim()) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    const listing = await db.mediaListing.update({
      where: { id: listingId },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(location !== undefined && { location: String(location).trim() }),
        ...(reach !== undefined && { reach: reach ? String(reach).trim() : null }),
        ...(description !== undefined && {
          description: description ? String(description).trim() : null,
        }),
        ...(frequency !== undefined && {
          frequency: frequency ? String(frequency).trim() : null,
        }),
        ...(network !== undefined && {
          network: network ? String(network).trim() : null,
        }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(status !== undefined && { status }),
        ...(listingType !== undefined && { listingType }),
        ...(demographics !== undefined &&
          Array.isArray(demographics) && { demographics }),
      },
    });

    // Keep linked rate cards' display location in sync
    if (location !== undefined) {
      await db.rateCard.updateMany({
        where: {
          listingId,
          agencyId: owned.mediaAgency.id,
        },
        data: {
          location: String(location).trim(),
          ...(reach !== undefined
            ? { reach: reach ? String(reach).trim() : null }
            : {}),
          ...(demographics !== undefined && Array.isArray(demographics)
            ? { demographics }
            : {}),
        },
      });
    }

    return NextResponse.json({ success: true, listing });
  } catch (error) {
    console.error("Error updating media listing:", error);
    return NextResponse.json(
      { error: "Failed to update listing", details: error.message },
      { status: 500 }
    );
  }
}
