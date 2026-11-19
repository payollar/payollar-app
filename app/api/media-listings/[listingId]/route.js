import { NextResponse } from "next/server";
import { getMediaListingById } from "@/actions/media-agency";

/**
 * GET /api/media-listings/[listingId]
 * Public listing detail for marketplace (active listings only).
 */
export async function GET(_request, { params }) {
  try {
    const { listingId } = await params;
    const result = await getMediaListingById(listingId);

    if (!result.success || !result.listing) {
      return NextResponse.json(
        { error: result.error || "Listing not found" },
        { status: 404 }
      );
    }

    const listing = result.listing;
    if (String(listing.status || "").toUpperCase() !== "ACTIVE") {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      listing: {
        id: listing.id,
        listingType: listing.listingType,
        name: listing.name,
        network: listing.network,
        location: listing.location,
        latitude: listing.latitude ?? null,
        longitude: listing.longitude ?? null,
        frequency: listing.frequency,
        description: listing.description,
        reach: listing.reach,
        demographics: listing.demographics || [],
        timeSlots: listing.timeSlots || [],
        imageUrl: listing.imageUrl,
        priceRange: listing.priceRange,
        status: listing.status,
        agency: listing.agency
          ? {
              id: listing.agency.id,
              agencyName: listing.agency.agencyName,
              verificationStatus: listing.agency.verificationStatus,
            }
          : null,
        packages: (listing.packages || []).map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          price: pkg.price,
          duration: pkg.duration,
          spots: pkg.spots,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching public media listing:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}
