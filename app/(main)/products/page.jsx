import { Suspense } from "react";
import { getActiveMediaListings } from "@/actions/media-agency";
import { ProductsMediaBuying } from "@/components/products/products-media-buying";

export const metadata = {
  title: "Browse media services - Payollar",
  description:
    "Filter TV, radio, and outdoor listings, then book flights into your media cart.",
};

function serializeListing(listing) {
  return {
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
    priceRange: listing.priceRange,
    rateCardId: listing.rateCardId || null,
    rating: listing.rating,
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
  };
}

export default async function ProductsPage() {
  const { success, listings = [] } = await getActiveMediaListings();
  const activeListings =
    success && Array.isArray(listings) ? listings.map(serializeListing) : [];

  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-[#f3f4f6] px-4 py-16 text-center text-sm text-slate-500">
          Loading media services…
        </div>
      }
    >
      <ProductsMediaBuying listings={activeListings} />
    </Suspense>
  );
}
