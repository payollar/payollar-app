import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RateCardDisplay } from "./_components/rate-card-display";

export default async function PublicRateCardPage({ params }) {
  const { rateCardId } = await params;
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
                where: { isVisibleOnFrontend: true },
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

  return <RateCardDisplay rateCard={rateCard} />;
}
