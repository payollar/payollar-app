import { getActiveMediaListings } from "@/actions/media-agency";
import { MediaPageView } from "@/components/media/media-page-view";

export default async function MediaPage() {
  const { success, listings = [] } = await getActiveMediaListings();
  const listingsByType =
    success && Array.isArray(listings)
      ? listings.reduce((acc, listing) => {
          const type = listing.listingType || "OTHER";
          if (!acc[type]) acc[type] = [];
          acc[type].push(listing);
          return acc;
        }, {})
      : {};

  return <MediaPageView listingsByType={listingsByType} />;
}
