"use server";

import { db } from "@/lib/prisma";
import { mapRateCardToAirtimeSlots } from "@/lib/tv-airtime-slots";

/**
 * Load all smart-table rows for a published TV rate card (including isBookable: false)
 * and map them to scheduler airtime slots.
 */
export async function getRateCardSchedulerSlots(rateCardId, selectedAdFormatId = null) {
  try {
    if (!rateCardId) {
      return { success: false, error: "Missing rate card", slots: [] };
    }

    const rateCard = await db.rateCard.findFirst({
      where: {
        id: rateCardId,
        isPublished: true,
      },
      include: {
        sections: {
          include: {
            tables: {
              include: {
                columns: {
                  orderBy: { displayOrder: "asc" },
                },
                rows: {
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
      return { success: false, error: "Rate card not found", slots: [] };
    }

    const slots = mapRateCardToAirtimeSlots(rateCard, { selectedAdFormatId });
    return { success: true, slots };
  } catch (error) {
    console.error("getRateCardSchedulerSlots:", error);
    return {
      success: false,
      error: error.message || "Failed to load airtime slots",
      slots: [],
    };
  }
}
