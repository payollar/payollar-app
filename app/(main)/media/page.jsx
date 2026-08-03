import { getActiveMediaListings } from "@/actions/media-agency";
import { MediaPageView } from "@/components/media/media-page-view";

export default async function MediaPage() {
  const { success, listings = [] } = await getActiveMediaListings();
  const activeListings = success && Array.isArray(listings) ? listings : [];

  const listingsByType = activeListings.reduce((acc, listing) => {
    const type = listing.listingType || "OTHER";
    if (!acc[type]) acc[type] = [];
    acc[type].push(listing);
    return acc;
  }, {});

  const customPackages = activeListings.flatMap((listing) =>
    (listing.packages || []).map((pkg) => ({
      ...pkg,
      listingId: listing.id,
      listingName: listing.name,
      listingType: listing.listingType,
      location: listing.location,
      agencyName: listing.agency?.agencyName || null,
      agencyId: listing.agencyId || listing.agency?.id || null,
    }))
  );

  return (
    <MediaPageView
      listingsByType={listingsByType}
      customPackages={customPackages}
    />
  );
}
