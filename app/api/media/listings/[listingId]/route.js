import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

/**
 * GET /api/media/listings/[listingId]
 * Public marketplace fetch for an ACTIVE listing (packages included).
 */
export async function GET(_request, { params }) {
  try {
    const { listingId } = await params;
    if (!listingId) {
      return NextResponse.json({ error: "Listing id required" }, { status: 400 });
    }

    const listing = await db.mediaListing.findFirst({
      where: {
        id: listingId,
        status: "ACTIVE",
      },
      include: {
        agency: {
          select: {
            id: true,
            agencyName: true,
            verificationStatus: true,
          },
        },
        packages: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const packages = (listing.packages || []).map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      duration: pkg.duration,
      spots: pkg.spots,
      estimatedViewers: pkg.estimatedViewers,
    }));
    const packagePrices = packages
      .map((pkg) => Number(pkg.price))
      .filter((n) => Number.isFinite(n) && n > 0);
    const packageRange =
      packagePrices.length > 0
        ? `₵${Math.min(...packagePrices).toLocaleString("en-GH", {
            maximumFractionDigits: 0,
          })}+`
        : null;

    return NextResponse.json({
      listing: {
        id: listing.id,
        listingType: listing.listingType,
        name: listing.name,
        network: listing.network,
        location: listing.location,
        frequency: listing.frequency,
        description: listing.description,
        reach: listing.reach,
        demographics: listing.demographics || [],
        imageUrl: listing.imageUrl,
        priceRange:
          (listing.priceRange && String(listing.priceRange).trim()) ||
          packageRange ||
          null,
        rating: listing.rating,
        agency: listing.agency,
        packages,
      },
    });
  } catch (error) {
    console.error("Error fetching public media listing:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch listing" },
      { status: 500 }
    );
  }
}
