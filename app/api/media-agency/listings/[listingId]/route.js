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
      latitude,
      longitude,
      reach,
      demographics,
      description,
      frequency,
      network,
      imageUrl,
      priceRange,
      timeSlots,
      status,
      listingType,
    } = body;

    const coordsTouched =
      latitude !== undefined || longitude !== undefined;
    let nextLat;
    let nextLng;
    if (coordsTouched) {
      const latRaw = latitude === undefined ? owned.listing.latitude : latitude;
      const lngRaw =
        longitude === undefined ? owned.listing.longitude : longitude;
      const lat =
        latRaw === null || latRaw === "" ? null : Number(latRaw);
      const lng =
        lngRaw === null || lngRaw === "" ? null : Number(lngRaw);
      const hasCoords =
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lng) <= 180;
      nextLat = hasCoords ? lat : null;
      nextLng = hasCoords ? lng : null;
    }

    if (name !== undefined && !String(name).trim()) {
      return NextResponse.json(
        { error: "Listing name is required" },
        { status: 400 }
      );
    }
    if (location !== undefined && !String(location).trim()) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    const effectiveType = String(
      listingType || owned.listing.listingType || ""
    ).toUpperCase();
    if (effectiveType === "BILLBOARD") {
      const finalLat = coordsTouched ? nextLat : owned.listing.latitude;
      const finalLng = coordsTouched ? nextLng : owned.listing.longitude;
      const hasPin =
        Number.isFinite(Number(finalLat)) &&
        Number.isFinite(Number(finalLng)) &&
        finalLat != null &&
        finalLng != null;
      if (!hasPin) {
        return NextResponse.json(
          {
            error:
              "Billboard sites need a map pin so buyers can find the location",
          },
          { status: 400 }
        );
      }
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
        ...(priceRange !== undefined && {
          priceRange: priceRange ? String(priceRange).trim() : null,
        }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(status !== undefined && { status }),
        ...(listingType !== undefined && { listingType }),
        ...(demographics !== undefined &&
          Array.isArray(demographics) && { demographics }),
        ...(timeSlots !== undefined &&
          Array.isArray(timeSlots) && { timeSlots }),
        ...(coordsTouched && {
          latitude: nextLat,
          longitude: nextLng,
        }),
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

/**
 * DELETE /api/media-agency/listings/[listingId]
 * Remove a listing owned by the current media agency.
 */
export async function DELETE(_request, { params }) {
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

    await db.rateCard.updateMany({
      where: {
        listingId,
        agencyId: owned.mediaAgency.id,
      },
      data: { listingId: null },
    });

    await db.mediaListing.delete({
      where: { id: listingId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting media listing:", error);
    return NextResponse.json(
      { error: "Failed to delete listing", details: error.message },
      { status: 500 }
    );
  }
}
