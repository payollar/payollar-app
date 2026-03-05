import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RateCardDisplay } from "./_components/rate-card-display";

export default async function PublicRateCardPage({ params, searchParams }) {
  const { rateCardId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const adTypeRaw = resolvedSearchParams?.adType;
  const adTypeFromUrl = typeof adTypeRaw === "string" ? adTypeRaw : Array.isArray(adTypeRaw) ? adTypeRaw[0] : null;

  const rateCard = await db.rateCard.findUnique({
    where: {
      id: rateCardId,
      isPublished: true,
    },
    include: {
      agency: {
        select: {
          id: true,
          agencyName: true,
          logoUrl: true,
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
    },
  });

  if (!rateCard) {
    notFound();
  }

  return <RateCardDisplay rateCard={rateCard} initialAdType={adTypeFromUrl} />;
}
