import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getAuthUserId } from "@/lib/getAuthUserId";
import { RateCardDisplay } from "./_components/rate-card-display";

const rateCardInclude = {
  agency: {
    select: {
      id: true,
      agencyName: true,
      logoUrl: true,
      userId: true,
      description: true,
      city: true,
      region: true,
      country: true,
      website: true,
      verificationStatus: true,
    },
  },
  sections: {
    include: {
      tables: {
        include: {
          columns: {
            orderBy: { displayOrder: "asc" },
          },
          rows: {
            where: { isBookable: true },
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
};

export default async function PublicRateCardPage({ params, searchParams }) {
  const { rateCardId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const adTypeRaw = resolvedSearchParams?.adType;
  const adTypeFromUrl =
    typeof adTypeRaw === "string"
      ? adTypeRaw
      : Array.isArray(adTypeRaw)
        ? adTypeRaw[0]
        : null;
  const campaignNameRaw = resolvedSearchParams?.campaignName;
  const campaignNameFromUrl =
    typeof campaignNameRaw === "string"
      ? campaignNameRaw
      : Array.isArray(campaignNameRaw)
        ? campaignNameRaw[0]
        : null;
  const previewRaw = resolvedSearchParams?.preview;
  const wantsPreview =
    previewRaw === "1" ||
    previewRaw === "true" ||
    (Array.isArray(previewRaw) &&
      (previewRaw[0] === "1" || previewRaw[0] === "true"));

  const rateCard = await db.rateCard.findUnique({
    where: { id: rateCardId },
    include: rateCardInclude,
  });

  if (!rateCard) {
    notFound();
  }

  let isOwnerPreview = false;
  if (!rateCard.isPublished) {
    if (!wantsPreview) {
      notFound();
    }
    const auth = await getAuthUserId();
    if (!auth?.userId || rateCard.agency?.userId !== auth.userId) {
      notFound();
    }
    isOwnerPreview = true;
  } else if (wantsPreview) {
    const auth = await getAuthUserId();
    isOwnerPreview = Boolean(
      auth?.userId && rateCard.agency?.userId === auth.userId
    );
  }

  const { userId: _agencyUserId, ...agencyPublic } = rateCard.agency || {};
  const safeRateCard = {
    ...rateCard,
    agency: rateCard.agency ? agencyPublic : null,
  };

  let mediaStations = [];
  if (rateCard.agencyId) {
    const [listings, publishedCards] = await Promise.all([
      db.mediaListing.findMany({
        where: { agencyId: rateCard.agencyId, status: "ACTIVE" },
        orderBy: [{ listingType: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          listingType: true,
          location: true,
          frequency: true,
          reach: true,
          imageUrl: true,
          priceRange: true,
        },
      }),
      db.rateCard.findMany({
        where: {
          agencyId: rateCard.agencyId,
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          listingId: true,
          listingType: true,
        },
        orderBy: { lastUpdated: "desc" },
      }),
    ]);

    const cardByListing = {};
    for (const card of publishedCards) {
      if (card.listingId && !cardByListing[card.listingId]) {
        cardByListing[card.listingId] = card;
      }
    }

    mediaStations = listings.map((listing) => ({
      ...listing,
      rateCard: cardByListing[listing.id] || null,
    }));
  }

  return (
    <RateCardDisplay
      rateCard={safeRateCard}
      mediaStations={mediaStations}
      initialAdType={adTypeFromUrl}
      initialCampaignName={campaignNameFromUrl}
      isDraftPreview={isOwnerPreview && !rateCard.isPublished}
    />
  );
}
